import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as NotificationsModule from 'expo-notifications';
import { Platform } from 'react-native';

import type { Toggles } from '../store';

const ROUTINE_ID = 'onde-evening-routine';

/**
 * Expo Go on Android throws as soon as expo-notifications is imported
 * (SDK 53+), so the module is loaded lazily and only where it works.
 */
export const notificationsSupported = Platform.OS !== 'web'
  && !(Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient);

let cached: typeof NotificationsModule | null | undefined;
function load(): typeof NotificationsModule | null {
  if (cached !== undefined) return cached;
  if (!notificationsSupported) return (cached = null);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as typeof NotificationsModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function configureNotifications() {
  load()?.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export type PermissionResult = 'granted' | 'denied' | 'unsupported';

export async function requestNotificationPermission(): Promise<PermissionResult> {
  const N = load();
  if (!N) return 'unsupported';
  try {
    const cur = await N.getPermissionsAsync();
    if (cur.granted) return 'granted';
    const res = await N.requestPermissionsAsync();
    return res.granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/** Keep the local "Evening routine" reminder in step with the user's switches. */
export async function syncReminders(tg: Pick<Toggles, 'notif' | 'n_routine'>) {
  const N = load();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(ROUTINE_ID).catch(() => {});
    if (!tg.notif || !tg.n_routine) return;
    const perm = await N.getPermissionsAsync();
    if (!perm.granted) return;
    await N.scheduleNotificationAsync({
      identifier: ROUTINE_ID,
      content: { title: 'Onde', body: 'Your evening wellness routine is ready.' },
      trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
    });
  } catch {
    // Scheduling is best-effort; the in-app switches remain the source of truth.
  }
}
