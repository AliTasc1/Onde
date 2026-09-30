import { router, type Href } from 'expo-router';

export type TabName = 'home' | 'library' | 'custom' | 'insights' | 'profile';

/** Jump to a tab and clear anything stacked above the tab bar. */
export function goTab(tab: TabName) {
  if (router.canDismiss()) router.dismissAll();
  router.navigate(`/(tabs)/${tab}` as Href);
}

export function goBack() {
  if (router.canGoBack()) router.back();
  else goTab('home');
}

export const go = (href: string) => router.push(href as Href);
