// ─── SCROLL GESTURE GUARDS ─────────────────────────────────────────────────
// Lets a section take wheel / touch gestures over from the smooth scroller
// while it needs them (e.g. paging through featured projects one gesture at a
// time). A guard returns true when it has handled the gesture; the smooth
// scroller then ignores that event.

export interface ScrollGesture {
  deltaX: number;
  deltaY: number;
  event: WheelEvent | TouchEvent;
}

type Guard = (gesture: ScrollGesture) => boolean;

const guards = new Set<Guard>();

/** Registers a guard. Returns an unregister. */
export function addScrollGuard(guard: Guard): () => void {
  guards.add(guard);
  return () => {
    guards.delete(guard);
  };
}

/** For the smooth scroller: whether a guard has taken this gesture. */
export function isGestureGuarded(gesture: ScrollGesture): boolean {
  for (const guard of guards) {
    if (guard(gesture)) return true;
  }
  return false;
}
