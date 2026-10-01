// ─── APP READY SIGNAL ──────────────────────────────────────────────────────
// Fired once the intro preloader has finished (or immediately when there is
// none). Heavy work — WebGL scenes, fluid simulation, large texture uploads —
// waits for it so the intro animation has the main thread and GPU to itself.

type Listener = () => void;

let ready = false;
const listeners = new Set<Listener>();

export const isAppReady = () => ready;

export function markAppReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
}

/** Runs `listener` once the app is ready (immediately if it already is). Returns an unsubscribe. */
export function onAppReady(listener: Listener): () => void {
  if (ready) {
    listener();
    return () => {};
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Runs `task` when the browser is idle (falls back to a timeout), so a burst of
 * setup work doesn't land in the middle of an animation frame. Returns a cancel.
 */
export function whenIdle(task: () => void, timeout = 600): () => void {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(task, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(task, 50);
  return () => clearTimeout(id);
}

/** onAppReady + whenIdle, with optional extra delay; returns a single cancel. */
export function afterAppReady(task: () => void, { delay = 0, timeout = 600 } = {}): () => void {
  let cancelIdle: (() => void) | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const unsubscribe = onAppReady(() => {
    timer = setTimeout(() => {
      cancelIdle = whenIdle(task, timeout);
    }, delay);
  });
  return () => {
    unsubscribe();
    if (timer) clearTimeout(timer);
    cancelIdle?.();
  };
}
