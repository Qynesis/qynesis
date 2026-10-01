"use client";

import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import type Lenis from "lenis";
import {
  CAP_HEIGHT,
  CAP_TOP,
  WORDMARK_LETTERS,
} from "@/components/brand/qynesisWordmark";
import {
  getNavbarLogoLetters,
  holdNavbarLogo,
  releaseNavbarLogo,
} from "@/lib/logoHandoff";

interface CinematicPreloaderProps {
  onComplete?: () => void;
  /** Called as the page is about to show through (e.g. to reset the scroll position) */
  onReveal?: () => void;
  speed?: number;
}

// The wordmark SVG's viewBox, in wordmark units
const VIEW = { x: 95, y: 38, w: 770, h: 124 };

// Where one letter flies to: a uniform scale plus an offset (in wordmark units)
// that lands its cap box exactly on the matching navbar letter
interface LetterFlight {
  s: number;
  x: number;
  y: number;
}

// ─── 36 FILLED VECTOR FRAGMENTS FORMING THE QYNESIS BRAND WORDMARK ─────────
// Letter geometry lives in @/components/brand/qynesisWordmark.
// At (x: 0, y: 0, rotation: 0, scale: 1), they assemble into ONE PERFECT QYNESIS.
// There is NO separate text layer or hidden logo.
interface FragmentSpec {
  id: string;
  letter: string;
  /** Index of the letter in WORDMARK_LETTERS (fragments are grouped per letter) */
  letterIndex: number;
  d: string;
  // Starting scatter offsets (in SVG units relative to its final resting coordinate)
  startX: number;
  startY: number;
  startRotation: number;
  staggerDelay: number;
}

// Deterministic PRNG so scatter positions are stable between renders
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const FRAGMENTS: FragmentSpec[] = (() => {
  const rand = mulberry32(7);
  const between = (min: number, max: number) => min + rand() * (max - min);
  const letterCount: Record<string, number> = {};

  return WORDMARK_LETTERS.flatMap(({ letter, cx, shapes }, letterIndex) => {
    letterCount[letter] = (letterCount[letter] ?? 0) + 1;
    const key = `${letter.toLowerCase()}${letterCount[letter]}`;

    return shapes.map((d, i) => ({
      id: `${key}-${i + 1}`,
      letter,
      letterIndex,
      d,
      startX: Math.round((cx - 480) * 1.4 + between(-320, 320)),
      startY: Math.round((rand() < 0.5 ? -1 : 1) * between(480, 860)),
      startRotation: Math.round(between(-75, 75)),
      staggerDelay: Math.round(between(0.02, 0.25) * 100) / 100,
    }));
  });
})();

export default function CinematicPreloader({
  onComplete,
  onReveal,
  speed = 1,
}: CinematicPreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const hintsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const logoGroupRef = useRef<SVGGElement>(null);
  const letterRefs = useRef<(SVGGElement | null)[]>([]);
  const fragmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const sweepRectRef = useRef<SVGRectElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const handleSkip = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) {
      if (onComplete) onComplete();
      return;
    }
    // Jump to the exit flight; once it has begun, let it finish
    if (tl.time() < (tl.labels.fly ?? 0)) tl.seek("fly");
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Nothing scrolls under the intro, and the navbar logo stays hidden until
    // the intro's wordmark lands on it
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    lenis?.stop();
    holdNavbarLogo();

    // If a frame arrives late (page still booting), stretch the timeline instead
    // of jumping ahead, so the intro never visibly skips. Restored for Lenis after.
    gsap.ticker.lagSmoothing(60, 33);

    const ctx = gsap.context(() => {
      const dur = 1 / speed;

      // ── BUILD MASTER GSAP TIMELINE ──────────────────────────────────────────
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          document.body.style.overflow = "";
          gsap.ticker.lagSmoothing(0);
          lenis?.start();
          if (onComplete) onComplete();
        },
      });
      tlRef.current = tl;

      // Milestone labels:
      // 0.00 – 0.30s: Pure black, center empty
      // 0.30 – 0.70s: Real fragments enter from edges
      // 0.70 – 1.40s: Fragments travel toward center
      // 1.40 – 1.90s: Fragments begin connecting (partial letters visible)
      // 1.90 – 2.20s: Fragments smoothly snap into final SVG coordinates
      // 2.20 – 2.75s: ABSOLUTE STILLNESS. The assembled SVG itself remains.
      // 2.75 – 3.10s: Light sweep across assembled SVG
      // 3.10 – 4.35s: Wordmark shrinks and glides diagonally into the navbar
      //               logo while the black backdrop fades, revealing the page
      // 4.35s:        It lands exactly on the navbar wordmark and becomes it
      const T_BLACK = 0;
      const T_ENTER = 0.3 * dur;
      const T_STILLNESS = 2.2 * dur;
      const T_SWEEP = 2.75 * dur;
      const T_FLY = 3.1 * dur;
      const FLY_DURATION = 1.25 * dur;
      const T_LAND = T_FLY + FLY_DURATION;

      tl.addLabel("black", T_BLACK);
      tl.addLabel("enter", T_ENTER);
      tl.addLabel("stillness", T_STILLNESS);
      tl.addLabel("sweep", T_SWEEP);
      tl.addLabel("fly", T_FLY);
      tl.addLabel("land", T_LAND);

      if (sweepRectRef.current)
        gsap.set(sweepRectRef.current, { opacity: 0, x: -150 });

      // ── ANIMATE EACH REAL FRAGMENT FROM SCATTERED POSITION TO SVG REST (0,0) ──
      FRAGMENTS.forEach((frag, idx) => {
        const el = fragmentRefs.current[idx];
        if (!el) return;

        // Transform origin at the fragment's own geometric center for natural tumbling
        gsap.set(el, { transformOrigin: "50% 50%" });

        const startTime = T_ENTER + frag.staggerDelay * dur;
        const assembleDuration = (1.8 - frag.staggerDelay * 0.5) * dur;

        // 1. Fade in from black as it enters the viewport
        tl.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: 0.35 * dur, ease: "power2.out" },
          startTime,
        );

        // 2. Physical flight: from scattered (startX, startY, startRotation) back to (0, 0, 0)
        // Because GSAP animates to (0,0), it lands on its EXACT SVG coordinate!
        tl.fromTo(
          el,
          {
            x: frag.startX,
            y: frag.startY,
            rotation: frag.startRotation,
            scale: 0.92,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: assembleDuration,
            ease: "expo.out",
          },
          startTime,
        );
      });

      // ── 2.20s – 2.75s: ABSOLUTE STILLNESS ──────────────────────────────────
      // The assembled SVG itself remains visible. ZERO text elements.

      // ── 2.75s – 3.05s: SUBTLE LIGHT SWEEP ACROSS THE ASSEMBLED SVG ─────────
      if (sweepRectRef.current) {
        tl.to(
          sweepRectRef.current,
          { opacity: 0.85, duration: 0.06 * dur },
          T_SWEEP,
        );
        tl.fromTo(
          sweepRectRef.current,
          { x: 30 },
          { x: 880, duration: 0.34 * dur, ease: "power2.inOut" },
          T_SWEEP,
        );
        tl.to(
          sweepRectRef.current,
          { opacity: 0, duration: 0.08 * dur },
          T_SWEEP + 0.28 * dur,
        );
      }

      // ── 3.10s – 4.35s: THE WORDMARK FLIES INTO THE NAVBAR LOGO ─────────────
      // Every letter is mapped onto its navbar counterpart (measured as the
      // flight starts), so the letters travel as one and land pixel-exact.
      let flights: LetterFlight[] | null = null;

      const measureFlights = (): LetterFlight[] | null => {
        const svg = svgRef.current;
        const boxes = getNavbarLogoLetters();
        if (!svg || !boxes || boxes.length !== WORDMARK_LETTERS.length) return null;
        if (boxes.some((box) => !box.height)) return null;
        const view = svg.getBoundingClientRect();
        const k = view.width / VIEW.w; // screen px per wordmark unit
        if (!k) return null;
        return WORDMARK_LETTERS.map(({ x0 }, i) => {
          const box = boxes[i];
          const s = box.height / k / CAP_HEIGHT;
          return {
            s,
            x: (box.left - view.left) / k + VIEW.x - s * x0,
            y: (box.top - view.top) / k + VIEW.y - s * CAP_TOP,
          };
        });
      };

      const renderFlight = (p: number) => {
        if (flights) {
          flights.forEach(({ s, x, y }, i) => {
            const scale = 1 + (s - 1) * p;
            letterRefs.current[i]?.setAttribute(
              "transform",
              `matrix(${scale} 0 0 ${scale} ${x * p} ${y * p})`,
            );
          });
        } else if (logoGroupRef.current) {
          // No navbar logo to land on (e.g. the 404 page): ease back and fade out in place
          const scale = 1 - 0.12 * p;
          logoGroupRef.current.setAttribute(
            "transform",
            `matrix(${scale} 0 0 ${scale} ${480 * (1 - scale)} ${100 * (1 - scale)})`,
          );
          logoGroupRef.current.style.opacity = String(1 - p);
        }
      };

      const flight = { p: 0 };
      tl.to(
        flight,
        {
          p: 1,
          duration: FLY_DURATION,
          ease: "power3.inOut",
          onStart: () => {
            // The page is about to show through
            if (onReveal) onReveal();
            flights = measureFlights();
          },
          onUpdate: () => renderFlight(flight.p),
        },
        T_FLY,
      );

      // The skip hint and footnote step aside as the flight begins
      if (hintsRef.current) {
        tl.to(
          hintsRef.current,
          { opacity: 0, duration: 0.3 * dur, ease: "power2.out" },
          T_FLY,
        );
      }

      // The black backdrop fades away beneath the flight, revealing the page.
      // It starts once the wordmark is mostly past the hero headline (so the
      // two don't tangle) and is fully gone before the landing, so the logo's
      // colours match the navbar's at the swap.
      if (backdropRef.current) {
        tl.to(
          backdropRef.current,
          { opacity: 0, duration: 0.75 * dur, ease: "sine.inOut" },
          T_FLY + 0.45 * dur,
        );
      }

      // ── 4.35s: LANDING — on this exact frame the navbar wordmark takes over ──
      tl.call(
        () => {
          if (stageRef.current) stageRef.current.style.visibility = "hidden";
          releaseNavbarLogo();
        },
        undefined,
        T_LAND,
      );
    }, containerRef);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      ctx.revert();
      gsap.ticker.lagSmoothing(0);
      document.body.style.overflow = "";
      lenis?.start();
      releaseNavbarLogo();
    };
  }, [handleSkip, onComplete, onReveal, speed]);

  return (
    <>
      <div
        ref={containerRef}
        onClick={handleSkip}
        className="fixed inset-0 overflow-hidden cursor-pointer select-none"
        style={{ zIndex: 999999 }}
        title="Click or press ESC to skip"
      >
        {/* ── BLACK BACKDROP (fades away to reveal the page on exit) ── */}
        <div
          ref={backdropRef}
          className="absolute inset-0 bg-[#050505] pointer-events-none will-change-[opacity]"
          style={{ zIndex: 10 }}
        />

        <div
          ref={hintsRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 40 }}
        >
          {/* ── Minimal Technical Skip Hint ── */}
          <div className="absolute bottom-6 right-8">
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.22)",
                textTransform: "uppercase",
              }}
            >
              [ ESC SKIP ]
            </span>
          </div>

          {/* ── Minimal Brand Footnote ── */}
          <div className="absolute bottom-6 left-8 hidden sm:block">
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.15)",
                textTransform: "uppercase",
              }}
            >
              QYNESIS
            </span>
          </div>
        </div>
      </div>

      {/* ── STAGE: THE EXACT VECTOR SVG WORDMARK ──
          Its own top-level layer, difference-blended like the navbar logo, so on
          its way into the navbar it reads against any page and lands in the
          navbar logo's exact colours. */}
      <div
        ref={stageRef}
        className="fixed inset-0 flex items-center justify-center pointer-events-none px-4 md:px-8 mix-blend-difference"
        style={{ zIndex: 1000000 }}
      >
        <svg
          ref={svgRef}
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
          className="w-[88vw] max-w-[1200px] h-auto overflow-visible select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Subtle light sweep gradient */}
            <linearGradient
              id="qynesis-sweep"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/*
            THE QYNESIS LOGO:
            Formed ENTIRELY by the filled vector fragments, grouped per letter so
            each letter can fly onto its navbar counterpart.
            When x=0, y=0, rotation=0, these paths assemble into the complete logo.
            NO HTML text. NO separate font layer.
          */}
          <g id="qynesis-logo" ref={logoGroupRef}>
            {WORDMARK_LETTERS.map((_, letterIndex) => (
              <g
                key={letterIndex}
                ref={(el) => {
                  letterRefs.current[letterIndex] = el;
                }}
              >
                {FRAGMENTS.map(
                  (frag, idx) =>
                    frag.letterIndex === letterIndex && (
                      <path
                        key={frag.id}
                        id={frag.id}
                        ref={(el) => {
                          fragmentRefs.current[idx] = el;
                        }}
                        d={frag.d}
                        fill="#FFFFFF"
                        // Hairline stroke hides anti-aliasing seams between touching pieces
                        stroke="#FFFFFF"
                        strokeWidth={1}
                        strokeLinejoin="round"
                        // Hidden in the server HTML so the assembled logo never flashes
                        // before the scatter animation takes over
                        style={{ opacity: 0 }}
                      />
                    ),
                )}
              </g>
            ))}

            {/* Light sweep rectangle traversing typography */}
            <rect
              ref={sweepRectRef}
              x="50"
              y="38"
              width="90"
              height="124"
              fill="url(#qynesis-sweep)"
              opacity="0"
              style={{ mixBlendMode: "screen", pointerEvents: "none" }}
            />
          </g>
        </svg>
      </div>
    </>
  );
}
