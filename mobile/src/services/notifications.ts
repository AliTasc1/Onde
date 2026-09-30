import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Toggles } from '../store';

const ROUTINE_ID = 'onde-evening-routine';

export function configureNotifications() {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const res = await Notifications.requestPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

/** Keep the local "Evening routine" reminder in step with the user's switches. */
export async function syncReminders(tg: Pick<Toggles, 'notif' | 'n_routine'>) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(ROUTINE_ID).catch(() => {});
    if (!tg.notif || !tg.n_routine) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    await Notifications.scheduleNotificationAsync({
      identifier: ROUTINE_ID,
      content: { title: 'Onde', body: 'Your evening wellness routine is ready.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
    });
  } catch {
    // Scheduling is best-effort; the in-app switches remain the source of truth.
  }
}
