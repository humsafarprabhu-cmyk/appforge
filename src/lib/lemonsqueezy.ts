// Lemon Squeezy Checkout URLs
// These are overlay checkout links that open directly — no backend needed

export const CHECKOUT_LINKS: Record<string, string> = {
  // These will be populated once products are created in LS dashboard
  maker_monthly: process.env.NEXT_PUBLIC_LS_MAKER_MONTHLY || '',
  maker_yearly: process.env.NEXT_PUBLIC_LS_MAKER_YEARLY || '',
  pro_monthly: process.env.NEXT_PUBLIC_LS_PRO_MONTHLY || '',
  pro_yearly: process.env.NEXT_PUBLIC_LS_PRO_YEARLY || '',
  agency_monthly: process.env.NEXT_PUBLIC_LS_AGENCY_MONTHLY || '',
  agency_yearly: process.env.NEXT_PUBLIC_LS_AGENCY_YEARLY || '',
};

export function getCheckoutUrl(plan: string, billing: 'monthly' | 'yearly', email?: string): string {
  const key = `${plan}_${billing}`;
  const baseUrl = CHECKOUT_LINKS[key];
  
  if (!baseUrl) return '';
  
  // Append email for prefill
  const url = new URL(baseUrl);
  if (email) {
    url.searchParams.set('checkout[email]', email);
  }
  
  return url.toString();
}

export function openCheckout(plan: string, billing: 'monthly' | 'yearly', email?: string) {
  const url = getCheckoutUrl(plan, billing, email);
  if (url) {
    window.open(url, '_blank');
  } else {
    // Fallback: direct to pricing page
    window.location.href = '/pricing';
  }
}
