import { Linking, Platform } from 'react-native';

/**
 * Store billing stand-in. The paywall, receipt and premium unlock are wired
 * to this module, so swapping in StoreKit / Play Billing (e.g. RevenueCat)
 * only touches these functions.
 */
export type Plan = 'yearly' | 'monthly';

export const PLANS: Record<Plan, { name: string; price: string; note: string; badge: string | null; per: string; renewMonths: number }> = {
  yearly: { name: 'Yearly', price: '$39.99', note: '$3.33/mo · billed yearly', badge: 'Save 52%', per: 'year', renewMonths: 12 },
  monthly: { name: 'Monthly', price: '$6.99', note: 'Billed monthly', badge: null, per: 'month', renewMonths: 1 },
};

export async function purchase(_plan: Plan): Promise<{ ok: boolean }> {
  // TODO: replace with the real store purchase flow.
  return { ok: true };
}

export async function restorePurchases(): Promise<{ restored: boolean }> {
  // TODO: query the store for existing entitlements.
  return { restored: false };
}

export function openManageSubscriptions() {
  const url = Platform.OS === 'android'
    ? 'https://play.google.com/store/account/subscriptions'
    : 'https://apps.apple.com/account/subscriptions';
  return Linking.openURL(url).catch(() => {});
}

export const storeName = Platform.OS === 'android' ? 'Google Play' : 'App Store';
