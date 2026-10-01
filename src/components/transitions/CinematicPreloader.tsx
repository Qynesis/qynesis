"use client";

import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { WORDMARK_LETTERS } from "@/components/brand/qynesisWordmark";

interface CinematicPreloaderProps {
  onComplete?: () => void;
  speed?: number;
}

// ─── 36 FILLED VECTOR FRAGMENTS FORMING THE QYNESIS BRAND WORDMARK ─────────
// Letter geometry lives in @/components/brand/qynesisWordmark.
// At (x: 0, y: 0, rotation: 0, scale: 1), they assemble into ONE PERFECT QYNESIS.
// There is NO separate text layer or hidden logo.
interface FragmentSpec {
  id: string;
  letter: string;
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

  return WORDMARK_LETTERS.flatMap(({ letter, cx, shapes }) => {
    letterCount[letter] = (letterCount[letter] ?? 0) + 1;
    const key = `${letter.toLowerCase()}${letterCount[letter]}`;

    return shapes.map((d, i) => ({
      id: `${key}-${i + 1}`,
      letter,
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
  speed = 1,
}: CinematicPreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const logoGroupRef = useRef<SVGGElement>(null);
  const fragmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const centerLineRef = useRef<HTMLDivElement>(null);
  const sweepRectRef = useRef<SVGRectElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const handleSkip = useCallback(() => {
    if (!tlRef.current) {
      if (onComplete) onComplete();
      return;
    }
    try {
      tlRef.current.seek("compress");
    } catch {
      if (onComplete) onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

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
      // 2.20 – 2.80s: ABSOLUTE STILLNESS. The assembled SVG itself remains.
      // 2.80 – 3.10s: Light sweep across assembled SVG
      // 3.10 – 3.35s: Logo compresses vertically into line
      // 3.35 – 3.55s: Horizontal line expands
      // 3.55 – 3.80s: Top & bottom curtains split open revealing homepage
      const T_BLACK = 0;
      const T_ENTER = 0.3 * dur;
      const T_STILLNESS = 2.2 * dur;
      const T_SWEEP = 2.75 * dur;
      const T_COMPRESS = 3.1 * dur;
      const T_EXPAND = 3.35 * dur;
      const T_SPLIT = 3.55 * dur;

      tl.addLabel("black", T_BLACK);
      tl.addLabel("enter", T_ENTER);
      tl.addLabel("stillness", T_STILLNESS);
      tl.addLabel("sweep", T_SWEEP);
      tl.addLabel("compress", T_COMPRESS);
      tl.addLabel("expand", T_EXPAND);
      tl.addLabel("split", T_SPLIT);

      // Initial curtain states
      if (topCurtainRef.current)
        gsap.set(topCurtainRef.current, { yPercent: 0 });
      if (bottomCurtainRef.current)
        gsap.set(bottomCurtainRef.current, { yPercent: 0 });
      if (centerLineRef.current)
        gsap.set(centerLineRef.current, { scaleX: 0, opacity: 0 });
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

      // ── 3.10s – 3.35s: VERTICAL LOGO COMPRESSION INTO HORIZONTAL LINE ───────
      if (logoGroupRef.current) {
        tl.to(
          logoGroupRef.current,
          {
            scaleY: 0.02,
            duration: 0.22 * dur,
            ease: "power4.inOut",
            transformOrigin: "50% 50%",
          },
          T_COMPRESS,
        );
        tl.to(
          logoGroupRef.current,
          {
            opacity: 0,
            duration: 0.08 * dur,
            ease: "power2.in",
          },
          T_COMPRESS + 0.16 * dur,
        );
      }

      // Center bright flare line flares open
      if (centerLineRef.current) {
        tl.fromTo(
          centerLineRef.current,
          { scaleX: 0.15, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.22 * dur,
            ease: "expo.inOut",
          },
          T_EXPAND - 0.04 * dur,
        );
      }

      // ── 3.55s – 3.80s: TOP & BOTTOM CURTAIN SPLIT REVEAL ───────────────────
      // Top curtain moves UP, bottom curtain moves DOWN, revealing the homepage
      if (topCurtainRef.current) {
        tl.to(
          topCurtainRef.current,
          {
            yPercent: -100,
            duration: 0.28 * dur,
            ease: "power3.inOut",
          },
          T_SPLIT,
        );
      }
      if (bottomCurtainRef.current) {
        tl.to(
          bottomCurtainRef.current,
          {
            yPercent: 100,
            duration: 0.28 * dur,
            ease: "power3.inOut",
          },
          T_SPLIT,
        );
      }

      // Center line fades as curtains part
      if (centerLineRef.current) {
        tl.to(
          centerLineRef.current,
          {
            opacity: 0,
            duration: 0.14 * dur,
            ease: "power2.out",
          },
          T_SPLIT + 0.04 * dur,
        );
      }
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
    };
  }, [handleSkip, onComplete, speed]);

  return (
    <div
      ref={containerRef}
      onClick={handleSkip}
      className="fixed inset-0 overflow-hidden cursor-pointer select-none"
      style={{ zIndex: 999999 }}
      title="Click or press ESC to skip"
    >
      {/* ── TOP BLACK CURTAIN (splits upward on exit) ── */}
      <div
        ref={topCurtainRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#050505] pointer-events-none will-change-transform"
        style={{ zIndex: 10 }}
      />

      {/* ── BOTTOM BLACK CURTAIN (splits downward on exit) ── */}
      <div
        ref={bottomCurtainRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#050505] pointer-events-none will-change-transform"
        style={{ zIndex: 10 }}
      />

      {/* ── STAGE: THE EXACT VECTOR SVG WORDMARK ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 md:px-8"
        style={{ zIndex: 20 }}
      >
        <svg
          ref={svgRef}
          viewBox="95 38 770 124"
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
            Formed ENTIRELY by the filled vector fragments.
            When x=0, y=0, rotation=0, these paths assemble into the complete logo.
            NO HTML text. NO separate font layer.
          */}
          <g id="qynesis-logo" ref={logoGroupRef}>
            {FRAGMENTS.map((frag, idx) => (
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

        {/* ── Center horizontal compression & flare line ── */}
        <div
          ref={centerLineRef}
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white pointer-events-none"
          style={{
            boxShadow:
              "0 0 20px 4px rgba(255,255,255,0.85), 0 0 6px 1px rgba(255,255,255,1)",
            transform: "scaleX(0)",
            transformOrigin: "50% 50%",
            zIndex: 30,
          }}
        />
      </div>

      {/* ── Minimal Technical Skip Hint ── */}
      <div
        className="absolute bottom-6 right-8 pointer-events-none"
        style={{ zIndex: 40 }}
      >
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
      <div
        className="absolute bottom-6 left-8 hidden sm:block pointer-events-none"
        style={{ zIndex: 40 }}
      >
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
  );
}
