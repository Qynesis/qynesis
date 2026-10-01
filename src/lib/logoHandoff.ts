// ─── INTRO → NAVBAR LOGO HANDOFF ───────────────────────────────────────────
// The intro preloader ends by flying its wordmark into the navbar logo. While
// the intro plays, the navbar keeps its own wordmark hidden and tells the intro
// where each letter sits; the intro lands its letters exactly on them and hands
// the logo back on the frame it lands, so the swap is invisible.

interface NavbarLogo {
  /** The element hidden while the intro holds the logo */
  el: HTMLElement;
  /** Screen boxes of the visible wordmark letters (their cap-height boxes), left to right */
  letterBoxes: () => DOMRect[];
}

let logo: NavbarLogo | null = null;
let held = false;
const listeners = new Set<() => void>();

const apply = () => {
  if (logo) logo.el.style.opacity = held ? "0" : "";
};

const setHeld = (next: boolean) => {
  if (held === next) return;
  held = next;
  apply();
  listeners.forEach((listener) => listener());
};

/** Navbar: registers its wordmark. Returns an unregister. */
export function registerNavbarLogo(entry: NavbarLogo): () => void {
  logo = entry;
  apply();
  return () => {
    if (logo === entry) logo = null;
  };
}

/** Intro: hides the navbar logo until the intro's wordmark lands on it. */
export const holdNavbarLogo = () => setHeld(true);

/** Intro: shows the navbar logo again, on the frame the wordmark lands. */
export const releaseNavbarLogo = () => setHeld(false);

/** Intro: where the navbar wordmark's letters sit on screen (null without a navbar logo). */
export const getNavbarLogoLetters = () => logo?.letterBoxes() ?? null;

/** Whether the intro currently holds the navbar logo (for useSyncExternalStore). */
export const isNavbarLogoHeld = () => held;

export function subscribeNavbarLogoHeld(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
