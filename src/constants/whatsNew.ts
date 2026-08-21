// src/constants/whatsNew.ts
//
// Release notes shown to players in the What's New panel.
//
// IMPORTANT: `id` is NOT the app version.
//
// OTA updates (eas update) keep app.json's version at 1.0.0 because runtimeVersion
// uses the `appVersion` policy — only a new binary changes it. So keying release
// notes off the app version would mean they never appear for OTA releases, which
// is most of them. Instead every release gets its own id here, bumped by hand.
//
// Convention: newest entry FIRST. Players who skip several updates see every entry
// they haven't seen yet, so no release goes unannounced.
//
// Keep entries short — this is read on a phone in landscape, where vertical space
// is tight. Three to five bullets is the sweet spot. Write for players, not for
// developers: "storms are less punishing" rather than "capped stormMaxBuildings".
//
// No emojis (house rule — emojis only in the title menu bar and ScoreDisplay).

export interface ReleaseNote {
  /** Unique, monotonically increasing. Bump for every shipped release. */
  id: string;
  /** Shown as a subheading. */
  date: string;
  /** Optional one-line framing for the release. */
  headline?: string;
  /** What changed, in player-facing language. */
  items: string[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    id: '2026.08.19.2',
    date: 'August 2026',
    headline: 'Balance and polish',
    items: [
      'New animated title screen.',
      'Fishing boats now cost 15 gold, PT boats 25 — build your fleet sooner.',
      'Tropical storms can no longer flatten your whole island. Hurricanes still can.',
      'You can change your display name in Settings.',
      'Tutorial highlights now land on the right buttons.',
    ],
  },
  {
    id: '2026.08.19',
    date: 'August 2026',
    headline: 'Earlier build',
    items: [
      'Superseded by the entry above.',
    ],
  },
];

/** The id of the newest release. Used to decide whether anything is unseen. */
export const LATEST_RELEASE_ID = RELEASE_NOTES[0]?.id ?? '';
