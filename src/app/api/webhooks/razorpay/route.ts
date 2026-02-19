import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify signature
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    switch (eventType) {
      case 'payment.captured':
      case 'subscription.activated': {
        const payment = event.payload?.payment?.entity || event.payload?.subscription?.entity;
        const notes = payment?.notes || {};
        const userId = notes.user_id;
        const planId = notes.plan_id;

        if (userId && planId) {
          await supabase
            .from('profiles')
            .update({ 
              plan: planId,
              plan_updated_at: new Date().toISOString(),
              razorpay_customer_id: payment.customer_id || null,
              razorpay_subscription_id: payment.id || null,
            })
            .eq('id', userId);

          console.log(`[Razorpay] ✅ User ${userId} upgraded to ${planId}`);
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.completed': {
        const subscription = event.payload?.subscription?.entity;
        const notes = subscription?.notes || {};
        const userId = notes.user_id;

        if (userId) {
          await supabase
            .from('profiles')
            .update({ plan: 'free', plan_updated_at: new Date().toISOString() })
            .eq('id', userId);

          console.log(`[Razorpay] ⚠️ User ${userId} downgraded to free`);
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload?.payment?.entity;
        console.log(`[Razorpay] ❌ Payment failed: ${payment?.id}`);
        break;
      }

      default:
        console.log(`[Razorpay] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[Razorpay Webhook Error]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
