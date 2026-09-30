import {
  PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toast } from '../components/Toast';
import { haptics } from '../haptics/engine';
import { configureNotifications, syncReminders } from '../services/notifications';
import { useStore } from '../store';
import { C } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotifications();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
  });
  const hydrated = useStore((s) => s.hydrated);
  const notif = useStore((s) => s.tg.notif);
  const routine = useStore((s) => s.tg.n_routine);
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    haptics.onError(() => router.push('/error'));
    return () => haptics.onError(null);
  }, []);

  useEffect(() => {
    if (hydrated) syncReminders({ notif, n_routine: routine });
  }, [hydrated, notif, routine]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="session" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="complete" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="subscription" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="payment" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="permission" options={{ animation: 'fade' }} />
          <Stack.Screen name="adult" options={{ animation: 'fade', gestureEnabled: false }} />
        </Stack>
        <Toast />
      </View>
    </SafeAreaProvider>
  );
}
