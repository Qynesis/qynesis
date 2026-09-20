"use client";

import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface CinematicPreloaderProps {
  onComplete?: () => void;
  speed?: number;
  strokeWidth?: number;
}

// ─── 42 VECTOR STROKE FRAGMENTS FORMING THE EXACT QYNASIS LOGO ─────────────
// ViewBox: 0 0 960 200 (Center at x=480, y=100)
// Every fragment belongs to a REAL LETTER.
// At (x: 0, y: 0, rotation: 0, scale: 1), they assemble into ONE PERFECT QYNASIS.
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

const FRAGMENTS: FragmentSpec[] = [
  // ── Q (8 fragments: cx = 136, r = 42) ──
  { id: "q-1", letter: "Q", d: "M 136 58 A 42 42 0 0 0 94 100", startX: -850, startY: -450, startRotation: 45, staggerDelay: 0.02 },
  { id: "q-2", letter: "Q", d: "M 94 100 A 42 42 0 0 0 136 142", startX: -920, startY: 280, startRotation: -40, staggerDelay: 0.08 },
  { id: "q-3", letter: "Q", d: "M 136 142 A 42 42 0 0 0 166 129", startX: -780, startY: 650, startRotation: 60, staggerDelay: 0.16 },
  { id: "q-4", letter: "Q", d: "M 166 129 A 42 42 0 0 0 178 100", startX: -680, startY: -580, startRotation: -35, staggerDelay: 0.10 },
  { id: "q-5", letter: "Q", d: "M 178 100 A 42 42 0 0 0 136 58", startX: -980, startY: -120, startRotation: 25, staggerDelay: 0.05 },
  { id: "q-6", letter: "Q", d: "M 128 92 L 148 112", startX: -420, startY: -780, startRotation: -65, staggerDelay: 0.19 },
  { id: "q-7", letter: "Q", d: "M 148 112 L 168 132", startX: -550, startY: 720, startRotation: 55, staggerDelay: 0.13 },
  { id: "q-8", letter: "Q", d: "M 168 132 L 188 152", startX: -820, startY: 820, startRotation: -25, staggerDelay: 0.23 },

  // ── Y (5 fragments: cx = 256, meet at 256,102) ──
  { id: "y-1", letter: "Y", d: "M 221 58 L 238.5 80", startX: -380, startY: -820, startRotation: -45, staggerDelay: 0.04 },
  { id: "y-2", letter: "Y", d: "M 238.5 80 L 256 102", startX: -220, startY: -680, startRotation: 30, staggerDelay: 0.15 },
  { id: "y-3", letter: "Y", d: "M 291 58 L 273.5 80", startX: 280, startY: -780, startRotation: -50, staggerDelay: 0.06 },
  { id: "y-4", letter: "Y", d: "M 273.5 80 L 256 102", startX: 420, startY: -620, startRotation: 35, staggerDelay: 0.17 },
  { id: "y-5", letter: "Y", d: "M 256 102 L 256 142", startX: -180, startY: 820, startRotation: 90, staggerDelay: 0.21 },

  // ── N (6 fragments: cx = 376, left=341, right=411) ──
  { id: "n-1", letter: "N", d: "M 341 58 L 341 100", startX: -320, startY: 780, startRotation: -20, staggerDelay: 0.03 },
  { id: "n-2", letter: "N", d: "M 341 100 L 341 142", startX: 120, startY: 860, startRotation: 40, staggerDelay: 0.16 },
  { id: "n-3", letter: "N", d: "M 341 58 L 376 100", startX: -60, startY: -820, startRotation: -60, staggerDelay: 0.09 },
  { id: "n-4", letter: "N", d: "M 376 100 L 411 142", startX: 360, startY: 720, startRotation: 50, staggerDelay: 0.19 },
  { id: "n-5", letter: "N", d: "M 411 58 L 411 100", startX: 220, startY: -780, startRotation: -30, staggerDelay: 0.05 },
  { id: "n-6", letter: "N", d: "M 411 100 L 411 142", startX: 480, startY: 820, startRotation: 45, staggerDelay: 0.24 },

  // ── A (6 fragments: cx = 480, apex=480,58) ──
  { id: "a-1", letter: "A", d: "M 480 58 L 462.5 100", startX: 0, startY: -860, startRotation: 35, staggerDelay: 0.02 },
  { id: "a-2", letter: "A", d: "M 462.5 100 L 445 142", startX: -460, startY: 760, startRotation: -55, staggerDelay: 0.12 },
  { id: "a-3", letter: "A", d: "M 480 58 L 497.5 100", startX: 360, startY: -820, startRotation: -40, staggerDelay: 0.07 },
  { id: "a-4", letter: "A", d: "M 497.5 100 L 515 142", startX: 560, startY: 860, startRotation: 60, staggerDelay: 0.20 },
  { id: "a-5", letter: "A", d: "M 458 114 L 480 114", startX: -260, startY: 660, startRotation: 90, staggerDelay: 0.11 },
  { id: "a-6", letter: "A", d: "M 480 114 L 502 114", startX: 320, startY: -640, startRotation: -90, staggerDelay: 0.17 },

  // ── S1 (7 fragments: cx = 584) ──
  { id: "s1-1", letter: "S", d: "M 614 74 C 610 65 602 60 594 58", startX: 620, startY: -760, startRotation: -45, staggerDelay: 0.04 },
  { id: "s1-2", letter: "S", d: "M 594 58 C 579 58 564 62 558 72", startX: 820, startY: -620, startRotation: 50, staggerDelay: 0.14 },
  { id: "s1-3", letter: "S", d: "M 558 72 C 554 80 560 88 572 92", startX: 470, startY: -860, startRotation: -30, staggerDelay: 0.08 },
  { id: "s1-4", letter: "S", d: "M 572 92 C 584 96 598 100 606 106", startX: 720, startY: 360, startRotation: 75, staggerDelay: 0.21 },
  { id: "s1-5", letter: "S", d: "M 606 106 C 616 114 614 124 604 132", startX: 660, startY: 760, startRotation: -60, staggerDelay: 0.12 },
  { id: "s1-6", letter: "S", d: "M 604 132 C 596 138 582 138 572 136", startX: 860, startY: 720, startRotation: 40, staggerDelay: 0.18 },
  { id: "s1-7", letter: "S", d: "M 572 136 C 564 134 558 128 554 122", startX: 520, startY: 860, startRotation: -25, staggerDelay: 0.25 },

  // ── I (3 fragments: cx = 688) ──
  { id: "i-1", letter: "I", d: "M 688 58 L 688 142", startX: 410, startY: 870, startRotation: 90, staggerDelay: 0.05 },
  { id: "i-2", letter: "I", d: "M 674 58 L 702 58", startX: 660, startY: -820, startRotation: -45, staggerDelay: 0.14 },
  { id: "i-3", letter: "I", d: "M 674 142 L 702 142", startX: 760, startY: 820, startRotation: 35, staggerDelay: 0.22 },

  // ── S2 (7 fragments: cx = 808) ──
  { id: "s2-1", letter: "S", d: "M 838 74 C 834 65 826 60 818 58", startX: 910, startY: -570, startRotation: -50, staggerDelay: 0.03 },
  { id: "s2-2", letter: "S", d: "M 818 58 C 803 58 788 62 782 72", startX: 1060, startY: -320, startRotation: 40, staggerDelay: 0.13 },
  { id: "s2-3", letter: "S", d: "M 782 72 C 778 80 784 88 796 92", startX: 810, startY: -820, startRotation: -35, staggerDelay: 0.07 },
  { id: "s2-4", letter: "S", d: "M 796 92 C 808 96 822 100 830 106", startX: 1020, startY: 220, startRotation: 65, staggerDelay: 0.20 },
  { id: "s2-5", letter: "S", d: "M 830 106 C 840 114 838 124 828 132", startX: 960, startY: 720, startRotation: -70, staggerDelay: 0.11 },
  { id: "s2-6", letter: "S", d: "M 828 132 C 820 138 806 138 796 136", startX: 1120, startY: 570, startRotation: 45, staggerDelay: 0.17 },
  { id: "s2-7", letter: "S", d: "M 796 136 C 788 134 782 128 778 122", startX: 860, startY: 870, startRotation: -30, staggerDelay: 0.24 },
];

export default function CinematicPreloader({
  onComplete,
  speed = 1,
  strokeWidth = 15,
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

    const ctx = gsap.context(() => {
      const dur = 1 / speed;

      // ── BUILD MASTER GSAP TIMELINE ──────────────────────────────────────────
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          document.body.style.overflow = "";
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
      const T_ENTER = 0.30 * dur;
      const T_STILLNESS = 2.20 * dur;
      const T_SWEEP = 2.75 * dur;
      const T_COMPRESS = 3.10 * dur;
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
      if (topCurtainRef.current) gsap.set(topCurtainRef.current, { yPercent: 0 });
      if (bottomCurtainRef.current) gsap.set(bottomCurtainRef.current, { yPercent: 0 });
      if (centerLineRef.current) gsap.set(centerLineRef.current, { scaleX: 0, opacity: 0 });
      if (sweepRectRef.current) gsap.set(sweepRectRef.current, { opacity: 0, x: -150 });

      // ── ANIMATE EACH REAL FRAGMENT FROM SCATTERED POSITION TO SVG REST (0,0) ──
      FRAGMENTS.forEach((frag, idx) => {
        const el = fragmentRefs.current[idx];
        if (!el) return;

        // Transform origin at the fragment's own geometric center for natural tumbling
        gsap.set(el, { transformOrigin: "50% 50%" });

        const startTime = T_ENTER + frag.staggerDelay * dur;
        const assembleDuration = (1.80 - frag.staggerDelay * 0.5) * dur;

        // 1. Fade in from black as it enters the viewport
        tl.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: 0.35 * dur, ease: "power2.out" },
          startTime
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
          startTime
        );
      });

      // ── 2.20s – 2.75s: ABSOLUTE STILLNESS ──────────────────────────────────
      // The assembled SVG itself remains visible. ZERO text elements.

      // ── 2.75s – 3.05s: SUBTLE LIGHT SWEEP ACROSS THE ASSEMBLED SVG ─────────
      if (sweepRectRef.current) {
        tl.to(sweepRectRef.current, { opacity: 0.85, duration: 0.06 * dur }, T_SWEEP);
        tl.fromTo(
          sweepRectRef.current,
          { x: 30 },
          { x: 880, duration: 0.34 * dur, ease: "power2.inOut" },
          T_SWEEP
        );
        tl.to(sweepRectRef.current, { opacity: 0, duration: 0.08 * dur }, T_SWEEP + 0.28 * dur);
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
          T_COMPRESS
        );
        tl.to(
          logoGroupRef.current,
          {
            opacity: 0,
            duration: 0.08 * dur,
            ease: "power2.in",
          },
          T_COMPRESS + 0.16 * dur
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
          T_EXPAND - 0.04 * dur
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
          T_SPLIT
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
          T_SPLIT
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
          T_SPLIT + 0.04 * dur
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
          viewBox="80 48 780 110"
          className="w-[94vw] max-w-[1360px] h-auto overflow-visible select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Subtle light sweep gradient */}
            <linearGradient id="qynasis-sweep" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 
            THE QYNASIS LOGO:
            Formed ENTIRELY by the 42 vector stroke fragments.
            When x=0, y=0, rotation=0, these paths assemble into the complete logo.
            NO HTML text. NO separate font layer.
          */}
          <g id="qynasis-logo" ref={logoGroupRef}>
            {FRAGMENTS.map((frag, idx) => (
              <path
                key={frag.id}
                id={frag.id}
                ref={(el) => {
                  fragmentRefs.current[idx] = el;
                }}
                d={frag.d}
                stroke="#FFFFFF"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {/* Light sweep rectangle traversing typography */}
            <rect
              ref={sweepRectRef}
              x="50"
              y="48"
              width="90"
              height="110"
              fill="url(#qynasis-sweep)"
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
            boxShadow: "0 0 20px 4px rgba(255,255,255,0.85), 0 0 6px 1px rgba(255,255,255,1)",
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
          QYNASIS
        </span>
      </div>
    </div>
  );
}
