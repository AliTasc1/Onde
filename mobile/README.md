# Onde — Haptic Wellness (Expo app)

This is the React Native / Expo implementation of the Claude Design handoff in `../project/Onde Haptic Wellness.dc.html`. It covers all 28 screens and keeps every piece of data on the device.

```bash
npm install
npx expo start          # press i / a, or scan with a dev build
npm run typecheck       # tsc --noEmit
npm run lint            # expo lint
```

Haptics use native modules (`expo-haptics`, the Android vibrator). Expo Go can run the app, but use a development build (`npx expo run:ios|android` or `eas build --profile development`) to feel the real patterns.

## Structure

```
src/app/            expo-router routes (one file per screen)
  (tabs)/           Home · Patterns · Custom · Insights · Profile + custom tab bar
src/components/     ui primitives, Slider, Timeline, Orb/Waves/Logo visuals, TabBar, Toast
src/haptics/        engine.ts (playback) + patterns.ts (session & timeline → steps)
src/store/          zustand store, persisted to AsyncStorage
src/data/           pattern library, segment types, all copy
src/services/       notifications (local reminder), purchases (store stub)
src/lib/            waveform maths, insights, navigation helpers
```

## Screen map

| # | Design frame | Route |
|---|---|---|
| 01 | Splash | `/` |
| 02–05 | Onboarding 1–4 | `/onboarding` |
| 06 | Home | `/(tabs)/home` |
| 07 | Pattern Library | `/(tabs)/library` |
| 08 | Pattern Detail | `/pattern/[id]` |
| 09 / 10 | Active Session / Pause State | `/session` |
| 11 | Session Complete | `/complete` |
| 12 / 14 / 23 | Builder / Saved Patterns / Empty State | `/(tabs)/custom` (Create ↔ Your Patterns) |
| 13 | Pattern Preview | `/preview` |
| 15 | Insights | `/(tabs)/insights` |
| 16 | Profile | `/(tabs)/profile` |
| 17 | Privacy Center | `/privacy` |
| 18 | Settings | `/settings` |
| 19 | Notifications | `/notifications` |
| 20 | Safety | `/safety` |
| 21 | Subscription | `/subscription` |
| 22 | Payment Confirmation | `/payment` |
| 24 | Error State | `/error` (opens when the device rejects haptics) |
| 25 | Permission Screen | `/permission` |
| 26 | Help & Support | `/help` |
| 27 | Delete Account / Delete My Data | `/delete?mode=account\|data` |
| 28 | Terms / Privacy | `/terms?tab=terms\|privacy` |

## Haptics

- **Android** plays the pattern through the system vibrator. React Native's vibrator has no amplitude control, so strength is expressed as duty cycle.
- **iOS** plays each "on" window as a train of Taptic Engine impacts (Soft, Medium or Heavy, depending on level). A custom Core Haptics module would add continuous, amplitude-shaped events. That upgrade stays inside `src/haptics/engine.ts`.
- The intensity limit in Settings caps every session and preview. Stop is always the largest control. Double-tapping anywhere also stops. The "Screen lock behavior" setting decides whether leaving the app stops the session, pauses it, or keeps it running.

## Where the app differs from the prototype

- **Insights and Continue use real data.** Insights is computed from the device's session history instead of sample numbers. The Continue card resumes the last session.
- **Saved patterns start empty.** Saved patterns store the full timeline, so ▶ reopens them in Preview. The free plan keeps 3 saved patterns, as the paywall table says.
- **The paywall shows the real pattern count.** It reads "6 of 8" rather than "8 of 24".
- **The Patterns search button filters the library.** In the prototype it opened Help.
- **No name placeholder.** The design used "Elif". There is no name capture step yet, so the greeting and profile fall back gracefully.

## Not wired yet

- **Store billing.** `src/services/purchases.ts` is a stub. Replace it with StoreKit / Play Billing, for example through RevenueCat.
- **Cloud Sync, light mode, languages and custom quiet hours.** These show a "coming soon" toast.
- **Battery optimization.** The switch is stored but doesn't yet read Low Power Mode.
