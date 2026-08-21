// src/services/tutorialTargets.ts
//
// Runtime registry of on-screen rectangles for tutorial spotlights.
//
// WHY THIS EXISTS
// The tutorial previously guessed where UI elements were using hardcoded
// coordinates and re-derived layout maths. That breaks constantly: the build menu
// is a wrapped flex grid whose item positions depend on screen width and item
// count, the island grid is centred dynamically and changes shape every game, and
// phone versus tablet dimensions differ wildly.
//
// Instead of predicting positions, components REPORT them after layout using
// measureInWindow(). The tutorial overlay reads whatever was actually measured.
//
// Components register via registerTutorialTarget(); the overlay subscribes via
// useTutorialTargets().

import { useSyncExternalStore } from 'react';

export type TutorialTargetKey =
  | 'island_container'
  | 'building_crops'
  | 'gold_display'
  | 'timer';

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type TargetMap = Partial<Record<TutorialTargetKey, TargetRect>>;

const targets: TargetMap = {};
const listeners = new Set<() => void>();

// useSyncExternalStore requires a stable snapshot reference between changes,
// so we only rebuild the snapshot object when something actually changes.
let snapshot: TargetMap = {};

function notify() {
  snapshot = { ...targets };
  listeners.forEach((l) => l());
}

/** True if two rects are close enough that re-rendering isn't worth it. */
function nearlyEqual(a: TargetRect | undefined, b: TargetRect): boolean {
  if (!a) return false;
  return (
    Math.abs(a.x - b.x) < 1 &&
    Math.abs(a.y - b.y) < 1 &&
    Math.abs(a.width - b.width) < 1 &&
    Math.abs(a.height - b.height) < 1
  );
}

/**
 * Record where an element actually is on screen.
 * Safe to call repeatedly — no-ops when the rect hasn't meaningfully moved.
 */
export function registerTutorialTarget(key: TutorialTargetKey, rect: TargetRect): void {
  // Ignore degenerate measurements (element not laid out yet)
  if (!rect || rect.width <= 0 || rect.height <= 0) return;
  if (nearlyEqual(targets[key], rect)) return;
  targets[key] = rect;
  notify();
}

/** Remove a target — call when the element unmounts (e.g. build menu closes). */
export function clearTutorialTarget(key: TutorialTargetKey): void {
  if (!(key in targets)) return;
  delete targets[key];
  notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): TargetMap {
  return snapshot;
}

/** Subscribe to measured tutorial targets. */
export function useTutorialTargets(): TargetMap {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Helper for components: measure a ref and register the result.
 *
 * measureInWindow gives coordinates relative to the window, which is what the
 * tutorial overlay uses (it is absolutely positioned over the whole screen).
 */
export function measureAndRegister(
  ref: { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null,
  key: TutorialTargetKey
): void {
  if (!ref || typeof ref.measureInWindow !== 'function') return;
  ref.measureInWindow((x, y, width, height) => {
    registerTutorialTarget(key, { x, y, width, height });
  });
}
