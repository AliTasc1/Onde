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

- **Constant Vibe** (and the builder's *Constant* segment) plays one unbroken vibration. Other patterns pulse: rhythm sets the pulse rate, and intensity sets how much of each pulse is on (intensity 10 is almost continuous).
- **Android** runs the system vibrator at full motor strength. React Native can't control amplitude, so lower levels shorten each pulse slightly; unbroken steps stay unbroken.
- **iOS** uses the system vibration (the incoming-call buzz), re-fired every ~380 ms, for strong steps. This is the strongest vibration reachable from Expo Go. Gentle steps use Taptic impacts. True amplitude control would need a Core Haptics / VibrationEffect native module and a development build; that work stays inside `src/haptics/engine.ts`.
- The intensity limit in Settings caps every session and preview. Stop is always the largest control. Double-tapping anywhere also stops. The "Screen lock behavior" setting decides whether leaving the app stops the session, pauses it, or keeps it running.

## Voice companion (18+)

The voice is an optional whispered voice that plays alongside a session. It is off by default. The 18+ screen (`/adult`) opens once, after onboarding or on the next launch for existing users. The voice only turns on if the user confirms they are an adult; declining leaves it off. After confirming, users can switch it in Settings and on the session screen.

- **Lines:** `voice/lines.tr.json` holds long, whispered lines in five stages that follow the session as a story: open → warm → build → peak → close. The voice starts as soon as a session starts and leaves only a short breath between lines; the "How often" setting (Relaxed / Normal / Continuous) sets that gap. Intensity 7+ pulls the build and peak stages forward. A line doesn't repeat until every line in its stage has played.
- **Generating the audio.** Clips are generated once with ElevenLabs and bundled with the app. They are never generated live.
  1. Create `mobile/.env.local` (it is git-ignored):
     ```
     ELEVENLABS_API_KEY=your-key
     ELEVENLABS_VOICE_ID=voice-id-from-the-library
     ELEVENLABS_MODEL=eleven_multilingual_v2   # or eleven_v3 (adds a [whispers] tag)
     ```
  2. Run `npm run voice`. Existing files are skipped; add `--force` to regenerate everything, `--only tr_flow_01` to regenerate one line, or `--lang xx` for another language.
  3. Commit `assets/voice/` together with `src/data/voiceManifest.ts`. The script writes the manifest, which bundles the clips into the app.
- **Audio setup:** playback uses `expo-audio`. It ducks other audio and keeps playing in silent mode. The config plugin is set up so the app never requests microphone access.

## Background sounds (18+)

The background sounds sit under the voice, behind the same 18+ confirmation. Users switch them on under Settings → Voice companion → Background sounds, which is off by default.

- **Bed:** `assets/ambience/bed/` holds looping tracks. One is picked per session; its speed follows rhythm (0.86×–1.4×) and its loudness follows intensity.
- **Accents:** `assets/ambience/accents/` holds short one-shots (breaths, sighs…). They play every few seconds, more often as intensity rises and the session nears its peak.
- **Adding sounds:** drop `.mp3`, `.m4a`, `.aac` or `.wav` files into those folders, then run `npm run ambience` to rebuild `src/data/ambienceManifest.ts`.
- **Generating sounds (optional):** `npm run sfx` creates the prompts in `ambience/prompts.json` with ElevenLabs Sound Effects. The API key needs the Sound Effects permission.

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
