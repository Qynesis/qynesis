"use client";

import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface CinematicPreloaderProps {
  onComplete?: () => void;
  speed?: number;
}

// ─── QYNASIS exact SVG path data ──────────────────────────────────────────────
// Viewbox: 0 0 680 160.
// Generously kerned, perfectly proportioned geometric architectural letterforms.
// Letters: Q (25-130), Y (145-210), N (235-305), A (330-400), S1 (425-490), I (515-548), S2 (575-640)
const LETTER_DEFINITIONS = [
  // Q
  {
    letter: "Q",
    onset: 0,
    paths: [
      // Oval
      "M 75 22 C 46 22 26 47 26 80 C 26 113 46 138 75 138 C 104 138 124 113 124 80 C 124 47 104 22 75 22 Z",
      // Tail
      "M 95 104 L 130 144",
    ],
  },
  // Y
  {
    letter: "Y",
    onset: 0.08,
    paths: [
      // Left branch
      "M 145 22 L 178 78",
      // Right branch
      "M 210 22 L 178 78",
      // Stem
      "M 178 78 L 178 138",
    ],
  },
  // N
  {
    letter: "N",
    onset: 0.04,
    paths: [
      // Left vertical
      "M 235 22 L 235 138",
      // Diagonal
      "M 235 22 L 305 138",
      // Right vertical
      "M 305 22 L 305 138",
    ],
  },
  // A
  {
    letter: "A",
    onset: 0.08,
    paths: [
      // Left leg
      "M 335 138 L 368 22",
      // Right leg
      "M 368 22 L 400 138",
      // Crossbar
      "M 348 94 L 388 94",
    ],
  },
  // S1
  {
    letter: "S",
    onset: 0.06,
    paths: [
      "M 488 42 C 484 26 470 20 458 20 C 440 20 430 30 430 46 C 430 70 490 66 490 94 C 490 114 474 140 456 140 C 438 140 428 126 426 108",
    ],
  },
  // I
  {
    letter: "I",
    onset: 0.12,
    paths: [
      // Vertical stem
      "M 532 22 L 532 138",
      // Top serif
      "M 518 22 L 546 22",
      // Bottom serif
      "M 518 138 L 546 138",
    ],
  },
  // S2
  {
    letter: "S",
    onset: 0.14,
    paths: [
      "M 638 42 C 634 26 620 20 608 20 C 590 20 580 30 580 46 C 580 70 640 66 640 94 C 640 114 624 140 606 140 C 588 140 578 126 576 108",
    ],
  },
];

// Flat array of all letter paths
const ALL_PATHS = LETTER_DEFINITIONS.flatMap((def) =>
  def.paths.map((d) => ({ letter: def.letter, onset: def.onset, d }))
);

// ─── 44 fragments originating from all 4 viewport edges ───────────────────────
type FragmentDef = {
  id: number;
  startXRatio: number;
  startYRatio: number;
  targetPathIndex: number;
  cpXRatio: number;
  cpYRatio: number;
  strokeWidth: number;
  initialOpacity: number;
  stagger: number;
};

const FRAGMENT_DEFS: FragmentDef[] = [
  // ── Top edge (y < 0) ──
  { id: 0,  startXRatio: 0.06, startYRatio: -0.12, targetPathIndex: 0,  cpXRatio: 0.14, cpYRatio: 0.22, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.00 },
  { id: 1,  startXRatio: 0.16, startYRatio: -0.08, targetPathIndex: 1,  cpXRatio: 0.22, cpYRatio: 0.18, strokeWidth: 1.4, initialOpacity: 0.85, stagger: 0.03 },
  { id: 2,  startXRatio: 0.28, startYRatio: -0.15, targetPathIndex: 2,  cpXRatio: 0.28, cpYRatio: 0.26, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.06 },
  { id: 3,  startXRatio: 0.42, startYRatio: -0.10, targetPathIndex: 4,  cpXRatio: 0.38, cpYRatio: 0.20, strokeWidth: 1.3, initialOpacity: 0.80, stagger: 0.02 },
  { id: 4,  startXRatio: 0.54, startYRatio: -0.18, targetPathIndex: 6,  cpXRatio: 0.48, cpYRatio: 0.28, strokeWidth: 1.0, initialOpacity: 0.65, stagger: 0.07 },
  { id: 5,  startXRatio: 0.68, startYRatio: -0.14, targetPathIndex: 8,  cpXRatio: 0.62, cpYRatio: 0.18, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.04 },
  { id: 6,  startXRatio: 0.82, startYRatio: -0.08, targetPathIndex: 11, cpXRatio: 0.76, cpYRatio: 0.22, strokeWidth: 1.4, initialOpacity: 0.85, stagger: 0.08 },
  { id: 7,  startXRatio: 0.94, startYRatio: -0.16, targetPathIndex: 15, cpXRatio: 0.88, cpYRatio: 0.25, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.05 },
  { id: 8,  startXRatio: 0.34, startYRatio: -0.22, targetPathIndex: 5,  cpXRatio: 0.32, cpYRatio: 0.15, strokeWidth: 1.3, initialOpacity: 0.80, stagger: 0.09 },
  { id: 9,  startXRatio: 0.62, startYRatio: -0.20, targetPathIndex: 10, cpXRatio: 0.56, cpYRatio: 0.24, strokeWidth: 1.0, initialOpacity: 0.70, stagger: 0.01 },
  { id: 10, startXRatio: 0.76, startYRatio: -0.12, targetPathIndex: 12, cpXRatio: 0.70, cpYRatio: 0.16, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.10 },

  // ── Bottom edge (y > 1) ──
  { id: 11, startXRatio: 0.08, startYRatio: 1.12,  targetPathIndex: 0,  cpXRatio: 0.16, cpYRatio: 0.78, strokeWidth: 1.3, initialOpacity: 0.80, stagger: 0.02 },
  { id: 12, startXRatio: 0.22, startYRatio: 1.16,  targetPathIndex: 1,  cpXRatio: 0.25, cpYRatio: 0.74, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.05 },
  { id: 13, startXRatio: 0.36, startYRatio: 1.10,  targetPathIndex: 3,  cpXRatio: 0.34, cpYRatio: 0.82, strokeWidth: 1.4, initialOpacity: 0.85, stagger: 0.01 },
  { id: 14, startXRatio: 0.48, startYRatio: 1.20,  targetPathIndex: 5,  cpXRatio: 0.44, cpYRatio: 0.72, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.07 },
  { id: 15, startXRatio: 0.64, startYRatio: 1.14,  targetPathIndex: 7,  cpXRatio: 0.58, cpYRatio: 0.80, strokeWidth: 1.0, initialOpacity: 0.65, stagger: 0.04 },
  { id: 16, startXRatio: 0.78, startYRatio: 1.18,  targetPathIndex: 9,  cpXRatio: 0.72, cpYRatio: 0.75, strokeWidth: 1.3, initialOpacity: 0.80, stagger: 0.08 },
  { id: 17, startXRatio: 0.90, startYRatio: 1.12,  targetPathIndex: 14, cpXRatio: 0.84, cpYRatio: 0.84, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.03 },
  { id: 18, startXRatio: 0.30, startYRatio: 1.22,  targetPathIndex: 2,  cpXRatio: 0.28, cpYRatio: 0.70, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.09 },
  { id: 19, startXRatio: 0.58, startYRatio: 1.24,  targetPathIndex: 8,  cpXRatio: 0.52, cpYRatio: 0.76, strokeWidth: 1.4, initialOpacity: 0.85, stagger: 0.06 },
  { id: 20, startXRatio: 0.72, startYRatio: 1.15,  targetPathIndex: 13, cpXRatio: 0.66, cpYRatio: 0.78, strokeWidth: 1.0, initialOpacity: 0.70, stagger: 0.00 },
  { id: 21, startXRatio: 0.84, startYRatio: 1.25,  targetPathIndex: 15, cpXRatio: 0.80, cpYRatio: 0.72, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.11 },

  // ── Left edge (x < 0) ──
  { id: 22, startXRatio: -0.12, startYRatio: 0.18, targetPathIndex: 0,  cpXRatio: 0.18, cpYRatio: 0.30, strokeWidth: 1.3, initialOpacity: 0.80, stagger: 0.03 },
  { id: 23, startXRatio: -0.16, startYRatio: 0.35, targetPathIndex: 1,  cpXRatio: 0.15, cpYRatio: 0.42, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.06 },
  { id: 24, startXRatio: -0.10, startYRatio: 0.52, targetPathIndex: 2,  cpXRatio: 0.20, cpYRatio: 0.50, strokeWidth: 1.4, initialOpacity: 0.85, stagger: 0.01 },
  { id: 25, startXRatio: -0.18, startYRatio: 0.68, targetPathIndex: 4,  cpXRatio: 0.14, cpYRatio: 0.60, strokeWidth: 1.0, initialOpacity: 0.65, stagger: 0.07 },
  { id: 26, startXRatio: -0.14, startYRatio: 0.84, targetPathIndex: 5,  cpXRatio: 0.16, cpYRatio: 0.72, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.04 },
  { id: 27, startXRatio: -0.22, startYRatio: 0.28, targetPathIndex: 3,  cpXRatio: 0.12, cpYRatio: 0.36, strokeWidth: 1.3, initialOpacity: 0.80, stagger: 0.08 },
  { id: 28, startXRatio: -0.20, startYRatio: 0.60, targetPathIndex: 6,  cpXRatio: 0.10, cpYRatio: 0.58, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.02 },
  { id: 29, startXRatio: -0.25, startYRatio: 0.44, targetPathIndex: 7,  cpXRatio: 0.08, cpYRatio: 0.46, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.10 },
  { id: 30, startXRatio: -0.15, startYRatio: 0.76, targetPathIndex: 8,  cpXRatio: 0.18, cpYRatio: 0.68, strokeWidth: 1.0, initialOpacity: 0.65, stagger: 0.05 },
  { id: 31, startXRatio: -0.08, startYRatio: 0.22, targetPathIndex: 9,  cpXRatio: 0.22, cpYRatio: 0.32, strokeWidth: 1.4, initialOpacity: 0.85, stagger: 0.00 },
  { id: 32, startXRatio: -0.28, startYRatio: 0.88, targetPathIndex: 10, cpXRatio: 0.06, cpYRatio: 0.80, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.09 },

  // ── Right edge (x > 1) ──
  { id: 33, startXRatio: 1.12,  startYRatio: 0.16, targetPathIndex: 15, cpXRatio: 0.86, cpYRatio: 0.28, strokeWidth: 1.3, initialOpacity: 0.80, stagger: 0.02 },
  { id: 34, startXRatio: 1.16,  startYRatio: 0.32, targetPathIndex: 14, cpXRatio: 0.84, cpYRatio: 0.38, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.05 },
  { id: 35, startXRatio: 1.10,  startYRatio: 0.50, targetPathIndex: 13, cpXRatio: 0.82, cpYRatio: 0.52, strokeWidth: 1.4, initialOpacity: 0.85, stagger: 0.01 },
  { id: 36, startXRatio: 1.18,  startYRatio: 0.66, targetPathIndex: 12, cpXRatio: 0.85, cpYRatio: 0.62, strokeWidth: 1.0, initialOpacity: 0.65, stagger: 0.07 },
  { id: 37, startXRatio: 1.14,  startYRatio: 0.82, targetPathIndex: 11, cpXRatio: 0.80, cpYRatio: 0.74, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.04 },
  { id: 38, startXRatio: 1.22,  startYRatio: 0.24, targetPathIndex: 10, cpXRatio: 0.88, cpYRatio: 0.32, strokeWidth: 1.3, initialOpacity: 0.80, stagger: 0.08 },
  { id: 39, startXRatio: 1.20,  startYRatio: 0.58, targetPathIndex: 9,  cpXRatio: 0.90, cpYRatio: 0.56, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.03 },
  { id: 40, startXRatio: 1.25,  startYRatio: 0.40, targetPathIndex: 7,  cpXRatio: 0.92, cpYRatio: 0.44, strokeWidth: 1.2, initialOpacity: 0.75, stagger: 0.09 },
  { id: 41, startXRatio: 1.15,  startYRatio: 0.74, targetPathIndex: 6,  cpXRatio: 0.82, cpYRatio: 0.68, strokeWidth: 1.0, initialOpacity: 0.65, stagger: 0.06 },
  { id: 42, startXRatio: 1.08,  startYRatio: 0.20, targetPathIndex: 4,  cpXRatio: 0.78, cpYRatio: 0.26, strokeWidth: 1.4, initialOpacity: 0.85, stagger: 0.00 },
  { id: 43, startXRatio: 1.28,  startYRatio: 0.86, targetPathIndex: 2,  cpXRatio: 0.94, cpYRatio: 0.80, strokeWidth: 1.1, initialOpacity: 0.70, stagger: 0.10 },
];

export default function CinematicPreloader({ onComplete, speed = 1 }: CinematicPreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fragmentRefs = useRef<(SVGLineElement | null)[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const sweepRef = useRef<HTMLDivElement>(null);
  const wipeLineRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const handleSkip = useCallback(() => {
    if (!tlRef.current) {
      if (onComplete) onComplete();
      return;
    }
    // Jump straight to the exit wipe sequence
    try {
      tlRef.current.seek("exit");
    } catch (e) {
      if (onComplete) onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Use gsap.context so React 18/19 StrictMode double-mounting doesn't break or kill the animation!
    const ctx = gsap.context(() => {
      const svg = svgRef.current;
      if (!svg) return;

      const VW = window.innerWidth || 1200;
      const VH = window.innerHeight || 800;

      // Ensure robust dimensions for SVG mapping
      const svgRect = svg.getBoundingClientRect();
      const svgWidth = svgRect.width > 0 ? svgRect.width : Math.min(VW * 0.45, 680);
      const svgHeight = svgRect.height > 0 ? svgRect.height : svgWidth * (160 / 680);
      const svgLeft = svgRect.left > 0 ? svgRect.left : (VW - svgWidth) / 2;
      const svgTop = svgRect.top > 0 ? svgRect.top : (VH - svgHeight) / 2;

      const scaleX = svgWidth / 680;
      const scaleY = svgHeight / 160;

      // ── 1. Measure and initialize all letter SVG paths ──
      const paths = pathRefs.current;
      const pathMidpoints: { x: number; y: number }[] = [];

      paths.forEach((el) => {
        if (!el) {
          pathMidpoints.push({ x: VW / 2, y: VH / 2 });
          return;
        }
        const len = el.getTotalLength() || 120;
        const pt = el.getPointAtLength(len * 0.5);

        // Convert path coordinate inside SVG to screen coordinates
        const screenX = svgLeft + pt.x * scaleX;
        const screenY = svgTop + pt.y * scaleY;
        pathMidpoints.push({ x: screenX, y: screenY });

        // Set initial state: strokeDashoffset hides the path, opacity 0
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${len}`;
        el.style.opacity = "0";
        el.style.stroke = "#EDEDED";
        el.style.strokeWidth = "1.8";
      });

      // ── 2. Initialize fragment lines in screen space ──
      const fragmentEls = fragmentRefs.current;
      const fragData: {
        startX: number;
        startY: number;
        cpX: number;
        cpY: number;
        destX: number;
        destY: number;
        fragLen: number;
      }[] = [];

      fragmentEls.forEach((el, i) => {
        if (!el || !FRAGMENT_DEFS[i]) return;
        const def = FRAGMENT_DEFS[i];

        const startX = def.startXRatio * VW;
        const startY = def.startYRatio * VH;
        const cpX = def.cpXRatio * VW;
        const cpY = def.cpYRatio * VH;

        const targetIdx = def.targetPathIndex % pathMidpoints.length;
        const targetPt = pathMidpoints[targetIdx] || { x: VW / 2, y: VH / 2 };
        const destX = targetPt.x;
        const destY = targetPt.y;

        const fragLen = 14 + Math.random() * 22;
        const angle = Math.atan2(destY - startY, destX - startX);

        // Position line at off-screen start
        el.setAttribute("x1", startX.toFixed(1));
        el.setAttribute("y1", startY.toFixed(1));
        el.setAttribute("x2", (startX + Math.cos(angle) * fragLen).toFixed(1));
        el.setAttribute("y2", (startY + Math.sin(angle) * fragLen).toFixed(1));
        el.style.opacity = "0";
        el.style.stroke = "#EDEDED";
        el.style.strokeWidth = String(def.strokeWidth);

        fragData[i] = { startX, startY, cpX, cpY, destX, destY, fragLen };
      });

      // ── 3. Build GSAP Master Timeline ──
      const dur = 1 / speed;
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          if (onComplete) onComplete();
        },
      });
      tlRef.current = tl;

      // Define clear chronological milestone labels
      const T_START = 0;
      const T_ENTER = 0.15 * dur;
      const T_CONSTRUCT = 0.9 * dur;
      const T_CLEAN = 1.9 * dur;
      const T_SHINE = 2.3 * dur;
      const T_HOLD = 2.7 * dur;
      const T_EXIT = 3.05 * dur;

      tl.addLabel("start", T_START);
      tl.addLabel("enter", T_ENTER);
      tl.addLabel("construct", T_CONSTRUCT);
      tl.addLabel("clean", T_CLEAN);
      tl.addLabel("shine", T_SHINE);
      tl.addLabel("hold", T_HOLD);
      tl.addLabel("exit", T_EXIT);

      // ── Phase 1 & 2: Fragments fly in from screen edges and converge ──
      fragmentEls.forEach((el, i) => {
        if (!el || !fragData[i]) return;
        const def = FRAGMENT_DEFS[i];
        const d = fragData[i];

        const enterTime = T_ENTER + def.stagger * dur;
        const travelDur = (0.75 + Math.random() * 0.2) * dur;

        // Fade fragment in as it enters viewport
        tl.to(el, { opacity: def.initialOpacity, duration: 0.15 * dur, ease: "power1.out" }, enterTime);

        // Travel along quadratic curve to letter stroke midpoint
        const progressObj = { p: 0 };
        tl.to(
          progressObj,
          {
            p: 1,
            duration: travelDur,
            ease: "power2.inOut",
            onUpdate: () => {
              const p = progressObj.p;
              const ix = (1 - p) * (1 - p) * d.startX + 2 * (1 - p) * p * d.cpX + p * p * d.destX;
              const iy = (1 - p) * (1 - p) * d.startY + 2 * (1 - p) * p * d.cpY + p * p * d.destY;
              const curAngle = Math.atan2(d.destY - iy, d.destX - ix);
              const curLen = d.fragLen * (1 - p * 0.55);

              el.setAttribute("x1", ix.toFixed(1));
              el.setAttribute("y1", iy.toFixed(1));
              el.setAttribute("x2", (ix + Math.cos(curAngle) * curLen).toFixed(1));
              el.setAttribute("y2", (iy + Math.sin(curAngle) * curLen).toFixed(1));
            },
          },
          enterTime + 0.02
        );

        // Fade fragment out as letter strokes solidify
        tl.to(el, { opacity: 0, duration: 0.3 * dur, ease: "power2.in" }, T_CONSTRUCT + def.stagger * dur + 0.1);
      });

      // ── Phase 3: Letter strokes draw themselves in via strokeDashoffset ──
      paths.forEach((el, i) => {
        if (!el) return;
        const info = ALL_PATHS[i];
        const onset = info.onset * dur;
        const drawDur = (0.55 + Math.random() * 0.15) * dur;
        const startTime = T_CONSTRUCT + onset;

        // Reveal stroke
        tl.to(el, { opacity: 1, duration: 0.12 * dur }, startTime);

        // Animate strokeDashoffset to 0
        tl.to(
          el,
          {
            strokeDashoffset: 0,
            duration: drawDur,
            ease: "power3.inOut",
          },
          startTime
        );
      });

      // ── Phase 4: Clean & sharpen strokes ──
      paths.forEach((el) => {
        if (!el) return;
        tl.to(
          el,
          {
            stroke: "#FFFFFF",
            strokeWidth: 1.8,
            duration: 0.3 * dur,
            ease: "power2.inOut",
          },
          T_CLEAN
        );
      });

      // ── Phase 5: Light sweep across wordmark ──
      if (sweepRef.current) {
        tl.fromTo(
          sweepRef.current,
          { x: "-110%", opacity: 0.9 },
          { x: "210%", opacity: 0.9, duration: 0.5 * dur, ease: "power2.inOut" },
          T_SHINE
        );
      }

      // ── Phase 6 & 7: Vertical compression, wipe line, reveal ──
      if (svgRef.current) {
        tl.to(
          svgRef.current,
          {
            scaleY: 0.02,
            duration: 0.28 * dur,
            ease: "power4.inOut",
            transformOrigin: "50% 50%",
          },
          T_EXIT
        );
        tl.to(
          svgRef.current,
          {
            opacity: 0,
            duration: 0.1 * dur,
            ease: "power2.in",
          },
          T_EXIT + 0.2 * dur
        );
      }

      // Horizontal wipe line flares open and expands
      if (wipeLineRef.current) {
        tl.fromTo(
          wipeLineRef.current,
          { scaleX: 0, opacity: 1 },
          { scaleX: 1, opacity: 1, duration: 0.25 * dur, ease: "expo.inOut" },
          T_EXIT + 0.12 * dur
        );
      }

      // Container fades out to reveal home page
      if (containerRef.current) {
        tl.to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.22 * dur,
            ease: "power2.inOut",
          },
          T_EXIT + 0.38 * dur
        );
      }
    }, containerRef);

    // Keyboard shortcut (Escape or Space to skip)
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
      className="fixed inset-0 flex items-center justify-center overflow-hidden cursor-pointer"
      style={{ zIndex: 999999, background: "#050505" }}
      title="Click or press ESC to skip"
    >
      {/* ── Screen-space overlay SVG for edge fragment lines ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        {FRAGMENT_DEFS.map((def) => (
          <line
            key={def.id}
            ref={(el) => {
              fragmentRefs.current[def.id] = el;
            }}
            x1="0"
            y1="0"
            x2="0"
            y2="0"
            stroke="#EDEDED"
            strokeWidth={def.strokeWidth}
            strokeLinecap="round"
            opacity="0"
          />
        ))}
      </svg>

      {/* ── Wordmark SVG: Exactly ONE QYNASIS instance ── */}
      <svg
        ref={svgRef}
        viewBox="0 0 680 160"
        className="pointer-events-none select-none"
        style={{
          width: "clamp(300px, 46vw, 680px)",
          height: "auto",
          overflow: "visible",
          position: "relative",
          zIndex: 2,
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {ALL_PATHS.map((item, idx) => (
          <path
            key={idx}
            ref={(el) => {
              pathRefs.current[idx] = el;
            }}
            d={item.d}
            stroke="#EDEDED"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0"
          />
        ))}
      </svg>

      {/* ── High-speed light sweep gradient ── */}
      <div
        ref={sweepRef}
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.06) 65%, transparent 100%)",
          transform: "translateX(-110%)",
          zIndex: 3,
          mixBlendMode: "screen",
        }}
      />

      {/* ── Horizontal wipe line flare ── */}
      <div
        ref={wipeLineRef}
        className="absolute pointer-events-none"
        style={{
          top: "50%",
          left: 0,
          width: "100%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, #ffffff, transparent)",
          boxShadow: "0 0 24px 6px rgba(255,255,255,0.6)",
          transform: "scaleX(0)",
          transformOrigin: "50% 50%",
          marginTop: "-1px",
          zIndex: 4,
        }}
      />

      {/* Minimal technical hint */}
      <div className="absolute bottom-6 right-8 pointer-events-none" style={{ zIndex: 5 }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "10px",
            letterSpacing: "0.25em",
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
          }}
        >
          [ ESC SKIP ]
        </span>
      </div>

      {/* Technical brand watermark */}
      <div className="absolute bottom-6 left-8 hidden sm:block pointer-events-none" style={{ zIndex: 5 }}>
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
