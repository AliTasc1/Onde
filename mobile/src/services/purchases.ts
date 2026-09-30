import { Linking, Platform } from 'react-native';

/**
 * Store billing stand-in. The paywall, receipt and premium unlock are wired
 * to this module, so swapping in StoreKit / Play Billing (e.g. RevenueCat)
 * only touches these functions.
 */
export type Plan = 'yearly' | 'monthly';

/** Prices come from the store; plan names and notes are in src/i18n (`subscription.plans`). */
export const PLANS: Record<Plan, { price: string; renewMonths: number }> = {
  yearly: { price: '$39.99', renewMonths: 12 },
  monthly: { price: '$6.99', renewMonths: 1 },
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
