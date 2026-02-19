import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature') || '';
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

    if (webhookSecret && !verifySignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventName = event.meta?.event_name;
    const customData = event.meta?.custom_data || {};
    const userId = customData.user_id;

    // Map LS variant to plan
    const variantName = event.data?.attributes?.variant_name || '';
    const planMap: Record<string, string> = {
      'Maker': 'maker',
      'Pro': 'pro',
      'Agency': 'agency',
    };
    const planId = planMap[variantName] || customData.plan_id;

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed': {
        const status = event.data?.attributes?.status;
        if (userId && planId && status === 'active') {
          await supabase
            .from('profiles')
            .update({
              plan: planId,
              plan_updated_at: new Date().toISOString(),
              ls_customer_id: event.data?.attributes?.customer_id?.toString() || null,
              ls_subscription_id: event.data?.id?.toString() || null,
            })
            .eq('id', userId);

          console.log(`[LS] ✅ User ${userId} upgraded to ${planId}`);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        if (userId) {
          await supabase
            .from('profiles')
            .update({ plan: 'free', plan_updated_at: new Date().toISOString() })
            .eq('id', userId);

          console.log(`[LS] ⚠️ User ${userId} downgraded to free`);
        }
        break;
      }

      case 'subscription_payment_success': {
        console.log(`[LS] 💰 Payment received for user ${userId}`);
        break;
      }

      case 'subscription_payment_failed': {
        console.log(`[LS] ❌ Payment failed for user ${userId}`);
        break;
      }

      default:
        console.log(`[LS] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[LS Webhook Error]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
