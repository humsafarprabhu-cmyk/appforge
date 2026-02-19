/**
 * Checkout utility — dual payment gateway
 * India → Razorpay (INR)
 * International → Lemon Squeezy (USD)
 */

import { PLANS, type PlanConfig } from '@/config/plans';
import type { Plan } from '@/types/app';

// Detect if user is in India (by timezone, language, or explicit setting)
export function isIndianUser(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz?.startsWith('Asia/Kolkata') || tz?.startsWith('Asia/Calcutta')) return true;
  
  // Check language
  const lang = navigator.language || '';
  if (lang.startsWith('hi') || lang.startsWith('bn') || lang.startsWith('ta') || lang.startsWith('te')) return true;
  
  // Check localStorage override
  if (localStorage.getItem('appforge_currency') === 'INR') return true;
  if (localStorage.getItem('appforge_currency') === 'USD') return false;
  
  return false;
}

export function getCurrency(): 'INR' | 'USD' {
  return isIndianUser() ? 'INR' : 'USD';
}

export function formatPrice(plan: PlanConfig, yearly: boolean = false): string {
  const isIndia = isIndianUser();
  if (isIndia) {
    const price = yearly ? plan.priceYearlyINR : plan.priceINR;
    return price === 0 ? 'Free' : `₹${price}`;
  }
  const price = yearly ? plan.priceYearly : plan.price;
  return price === 0 ? 'Free' : `$${price}`;
}

export function getCheckoutUrl(planId: Plan, yearly: boolean = false): string | null {
  const plan = PLANS[planId];
  if (!plan || plan.price === 0) return null;
  
  if (isIndianUser()) {
    // Razorpay — will be subscription links
    // TODO: Replace with actual Razorpay subscription link IDs
    return plan.razorpayPlanId 
      ? `https://rzp.io/i/${plan.razorpayPlanId}` 
      : null;
  }
  
  // Lemon Squeezy
  return plan.lemonSqueezyCheckoutUrl || null;
}

// Razorpay inline checkout (for SPA flow)
export async function initiateRazorpayCheckout(options: {
  planId: Plan;
  yearly: boolean;
  userEmail: string;
  userName: string;
  userId: string;
  onSuccess: (paymentId: string, subscriptionId: string) => void;
  onCancel: () => void;
}): Promise<void> {
  const plan = PLANS[options.planId];
  if (!plan) throw new Error('Invalid plan');
  
  const amount = options.yearly ? plan.priceYearlyINR * 12 : plan.priceINR;
  
  // Load Razorpay script if not loaded
  if (!(window as any).Razorpay) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.head.appendChild(script);
    });
  }

  const rzp = new (window as any).Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    amount: amount * 100, // Razorpay uses paise
    currency: 'INR',
    name: 'AppForge',
    description: `${plan.name} Plan — ${options.yearly ? 'Yearly' : 'Monthly'}`,
    image: '/icon-512.png',
    prefill: {
      name: options.userName,
      email: options.userEmail,
    },
    notes: {
      plan_id: options.planId,
      user_id: options.userId,
      billing: options.yearly ? 'yearly' : 'monthly',
    },
    theme: {
      color: '#6366f1',
    },
    handler: (response: any) => {
      options.onSuccess(response.razorpay_payment_id, response.razorpay_subscription_id || '');
    },
    modal: {
      ondismiss: options.onCancel,
    },
  });
  
  rzp.open();
}

// Lemon Squeezy overlay checkout
export function initiateLemonSqueezyCheckout(options: {
  planId: Plan;
  yearly: boolean;
  userEmail: string;
}): void {
  const plan = PLANS[options.planId];
  if (!plan?.lemonSqueezyCheckoutUrl) {
    // Fallback: open pricing page
    window.open('/pricing', '_blank');
    return;
  }
  
  // Append email for prefill
  const url = new URL(plan.lemonSqueezyCheckoutUrl);
  url.searchParams.set('checkout[email]', options.userEmail);
  
  // Use Lemon Squeezy overlay if available
  if ((window as any).createLemonSqueezy) {
    (window as any).LemonSqueezy.Url.Open(url.toString());
  } else {
    window.open(url.toString(), '_blank');
  }
}
