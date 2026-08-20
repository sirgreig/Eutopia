// src/services/nameFilter.ts
//
// Display-name validation for Eutopia.
//
// Players type a name that another human sees during multiplayer, which makes it
// user-generated content. Apple's Guideline 1.2 expects some filtering on UGC, and
// this also keeps children's games free of obvious abuse. This is deliberately a
// modest filter, not a comprehensive one — the goal is to block the obvious and
// keep the game rated 4+, not to win an arms race with determined bad actors.
//
// Design notes:
//  - Substring matching would reject innocent names ("Scunthorpe", "Assassin",
//    "Cocktail"), so matching is done on normalised WORD boundaries instead.
//  - Leetspeak substitution is normalised (4→a, 3→e, 1→i, 0→o, $→s, etc.) so
//    "sh1t" is caught alongside "shit".
//  - Repeated characters are collapsed ("shiiiit" → "shit").
//  - The list stays terse. Longer lists mean more false positives, and every false
//    positive is a player who can't pick their own name.

/** Blocked terms, matched as whole words after normalisation. */
const BLOCKED_WORDS: readonly string[] = [
  // Profanity
  'fuck', 'fucker', 'fucking', 'shit', 'shite', 'cunt', 'bitch', 'bastard',
  'wanker', 'bollocks', 'twat', 'prick', 'arsehole', 'asshole', 'dickhead',
  // Sexual
  'penis', 'vagina', 'dick', 'cock', 'pussy', 'boobs', 'tits', 'porn', 'sex',
  'rape', 'rapist', 'horny', 'slut', 'whore',
  // Slurs and hate
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded', 'tranny', 'kike',
  'spic', 'chink', 'wetback', 'nazi', 'hitler', 'heil',
  // Violence / self-harm
  'kys', 'suicide', 'killyourself',
];

/**
 * Impersonation guard — names that suggest the player is staff or the system.
 * Matched as whole words.
 */
const RESERVED_WORDS: readonly string[] = [
  'admin', 'administrator', 'moderator', 'mod', 'system', 'server',
  'tartanstudios', 'eutopia', 'official', 'support', 'staff',
];

/** Normalise leetspeak and decorative characters to plain lowercase letters. */
function normalise(input: string): string {
  const substitutions: Record<string, string> = {
    '4': 'a', '@': 'a', '8': 'b', '3': 'e', '6': 'g', '1': 'i', '!': 'i',
    '|': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't', '2': 'z',
  };

  let out = input.toLowerCase();
  out = out.replace(/[4@8361!|05$7+2]/g, (c) => substitutions[c] ?? c);
  // Strip anything that isn't a letter, replacing with a space so word
  // boundaries survive ("f.u.c.k" → "f u c k" rather than "fuck").
  out = out.replace(/[^a-z]+/g, ' ');
  // Collapse runs of the same letter: "shiiiit" → "shit"
  out = out.replace(/(.)\1{2,}/g, '$1');
  return out.trim();
}

/**
 * Also check the name with all separators removed, so "f u c k" and "f-u-c-k"
 * are caught. Done separately from the word-boundary check to avoid the
 * Scunthorpe problem on ordinary names.
 */
function collapsed(input: string): string {
  return normalise(input).replace(/\s+/g, '');
}

export type NameValidationResult =
  | { ok: true; name: string }
  | { ok: false; reason: string };

/**
 * Validate a player-chosen display name.
 * Returns the trimmed name on success, or a message suitable for showing the player.
 */
export function validateDisplayName(raw: string): NameValidationResult {
  const trimmed = raw.trim().replace(/\s+/g, ' ');

  if (trimmed.length < 2) {
    return { ok: false, reason: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 16) {
    return { ok: false, reason: 'Name must be 16 characters or fewer.' };
  }
  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return { ok: false, reason: 'Name must contain at least one letter or number.' };
  }

  const words = normalise(trimmed).split(' ').filter(Boolean);
  const squashed = collapsed(trimmed);

  for (const bad of BLOCKED_WORDS) {
    if (words.includes(bad) || squashed === bad) {
      return { ok: false, reason: 'Please choose a different name.' };
    }
  }

  for (const reserved of RESERVED_WORDS) {
    if (words.includes(reserved) || squashed === reserved) {
      return { ok: false, reason: 'That name is reserved. Please choose another.' };
    }
  }

  return { ok: true, name: trimmed };
}

/** Convenience boolean for callers that don't need the reason. */
export function isDisplayNameAllowed(raw: string): boolean {
  return validateDisplayName(raw).ok;
}
