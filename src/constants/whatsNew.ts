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
// WHEN TO ADD AN ENTRY
// Only when a change alters what a PLAYER experiences: new mechanics, balance they
// will feel, UI they interact with, or bugs they would have noticed.
//
// Do NOT add entries for invisible work — SDK migrations, ad integration repairs,
// refactors, build config. The test is simple: would someone who only plays the game
// notice or care? A changelog padded with plumbing teaches players to dismiss the
// panel unread, which costs you the one channel you have for announcing real changes.
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
    id: '2026.09.03.2',
    date: 'September 2026',
    headline: 'Enhanced Mode is here',
    items: [
      'Enhanced Mode now works. Six new buildings, each with a real effect.',
      'Apartment houses three times as many people as a house, at the cost of welfare.',
      'Dock pays nearby fishing boats half as much again. Lighthouse shelters boats from storms.',
      'Granary banks surplus food for a bad round; Marketplace sells what it cannot store.',
      'New: fog of war hides your opponent\'s island. PT boats scout it between rounds, and a Watchtower uncovers a patch permanently.',
    ],
  },
  {
    id: '2026.09.03',
    date: 'September 2026',
    headline: 'Sabotage, summaries and smarter storms',
    items: [
      'Build menu tiles now show what each building actually does before you spend the gold.',
      'New: a How to Play summary on the title screen, so you can see what the game is about before starting.',
      'New: send rebels to your opponent for 30 gold, once per round. The AI can do it to you too.',
      'A summary now appears at the end of each round showing exactly where your gold came from.',
      'Build boats by tapping open water — you can now add to your fleet even with a fully built island.',
      'PT boats no longer win every fight. There is a real chance the pirates come out on top, so escorting your fleet is a gamble.',
      'Forts are far more useful: buildings around them take half damage, and boats sheltering nearby are completely safe from weather and pirates.',
      'Storms are less frequent, and no two hurricanes do the same amount of damage.',
      'Pirates no longer get stuck against the shoreline where you cannot reach them.',
      'Fixed being unable to build after your selected boat was sunk.',
      'Boats and pirate ships now go down with a proper sinking animation.',
    ],
  },
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
];

/** The id of the newest release. Used to decide whether anything is unseen. */
export const LATEST_RELEASE_ID = RELEASE_NOTES[0]?.id ?? '';
