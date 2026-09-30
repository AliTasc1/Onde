import type { IconName } from '../components/Icon';

export const ONBOARDING: [string, string][] = [
  ['Your Personal Haptic Wellness', 'Create personalized vibration experiences designed around your preferences.'],
  ['Find Your Rhythm', 'Explore different vibration patterns, rhythms and intensities.'],
  ['Make It Yours', 'Fine-tune intensity, rhythm and duration to create your own experience.'],
  ['Your Privacy Comes First', 'Your preferences stay private and under your control.'],
];

/** Home mood cards: label, subtitle, icon, pattern id, corner glow colour. */
export const MOODS: [string, string, IconName, string, string][] = [
  ['Relax', 'Soft Wave · 5 min', 'waves', 'soft', 'rgba(139,92,246,.45)'],
  ['Unwind', 'Slow Flow · 15 min', 'leaf', 'slow', 'rgba(236,72,153,.3)'],
  ['Focus', 'Balanced Pulse · 5 min', 'target', 'balanced', 'rgba(110,120,250,.38)'],
  ['Calm', 'Calm Pulse · 3 min', 'breath', 'calm', 'rgba(196,181,253,.3)'],
  ['Sleep', 'Night Wave · 10 min', 'moon', 'night', 'rgba(91,47,201,.55)'],
];

export const DURATIONS = [1, 3, 5, 10, 15];

export const FEELINGS = ['Calmer', 'About the same', 'Not for me'];

export const PRIVACY_FACTS: [IconName, string, string][] = [
  ['device', 'Stored on your device', 'Patterns, sessions and settings stay on this phone by default.'],
  ['shield', 'Never sold or shared', 'We don’t sell your data or use it for advertising.'],
  ['cloud', 'Sync is optional', 'Cloud Sync stays off unless you turn it on. Synced data is encrypted.'],
];

export const NOTIF_PREVIEWS: [string, string][] = [
  ['now', 'Take a few minutes for yourself.'],
  ['9:00 PM', 'Your evening wellness routine is ready.'],
  ['Yesterday', 'Time to unwind.'],
];

export const SAFETY: [IconName, string][] = [
  ['hand', 'Use responsibly.'],
  ['pauseC', 'Stop if you experience discomfort.'],
  ['clock', 'Take breaks between sessions.'],
  ['thermo', 'Your device may warm slightly during extended use.'],
  ['car', 'Never use while driving or operating machinery.'],
];

export const ERROR_STEPS = ['Open Settings → Sounds & Haptics', 'Turn on System Haptics', 'Turn off Low Power Mode'];

export const PERMISSION_POINTS = ['Evening routine reminders', 'Only what you choose — never marketing', 'Change anytime in Settings'];

export const FAQS: [string, string][] = [
  ['How do I stop a session?', 'Tap Stop at the bottom of the screen, or double-tap anywhere during a session. Locking your phone stops it too.'],
  ['Why can’t I feel the vibration?', 'Check that System Haptics are on and Low Power Mode is off. Some devices have limited vibration motors.'],
  ['Can I use Onde without an account?', 'Yes. Everything works offline and stays on your device.'],
  ['How do I cancel my subscription?', 'Open Profile → Subscription → Manage Subscription. This opens your store account settings.'],
  ['Where is my data stored?', 'On your device. Cloud Sync is optional and encrypted.'],
];

export const LEGAL: Record<'terms' | 'privacy', [string, string][]> = {
  terms: [
    ['Using Onde', 'Onde is a personal relaxation app for adults 18+. By using it you agree to these terms and to use the app responsibly.'],
    ['Your account', 'You can use Onde without an account. If you create one, keep your sign-in details private. You can delete your account at any time from Profile.'],
    ['Subscriptions', 'Premium renews automatically until cancelled. Manage or cancel any time in your App Store or Google Play settings, at least 24 hours before renewal.'],
    ['Not medical advice', 'Onde does not diagnose, treat or prevent any condition. Stop using it if you feel any discomfort.'],
  ],
  privacy: [
    ['What we collect', 'By default, nothing leaves your phone. Patterns, sessions and settings are stored locally.'],
    ['Optional data', 'If you turn on Analytics, we receive anonymous usage events. If you turn on Cloud Sync, your data is encrypted in transit and at rest.'],
    ['What we never do', 'We don’t sell your data, show ads, or share it with third parties for marketing.'],
    ['Your rights', 'Export or delete your data at any time from the Privacy Center.'],
  ],
};

export const LEGAL_UPDATED = 'Last updated September 1, 2026';

export const SUPPORT_EMAIL = 'support@onde.app';
