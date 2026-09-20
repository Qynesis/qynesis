"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SvgMorphTransitionProps {
  phase: "idle" | "covering" | "covered" | "revealing";
  onCovered?: () => void;
  onRevealed?: () => void;
  targetHref?: string | null;
}

export default function SvgMorphTransition({
  phase,
  onCovered,
  onRevealed,
  targetHref,
}: SvgMorphTransitionProps) {
  if (phase === "idle") return null;

  // Format label from targetHref (e.g. "/work" -> "WORK", "/" -> "HOME")
  const cleanPath = targetHref ? targetHref.split("?")[0].replace(/^\//, "") : "";
  const pageLabel = cleanPath
    ? cleanPath.split("/").pop()?.replace(/-/g, " ").toUpperCase()
    : "HOME";

  const isEntering = phase === "covering" || phase === "covered";

  // Curve paths for seamless organic liquid morphing
  const enterPathVariants = {
    initial: {
      d: "M 0 100 L 0 100 Q 50 100 100 100 L 100 100 Z",
    },
    covering: {
      d: [
        "M 0 100 L 0 100 Q 50 100 100 100 L 100 100 Z",
        "M 0 100 L 0 0 Q 50 -28 100 0 L 100 100 Z",
        "M 0 100 L 0 0 Q 50 0 100 0 L 100 100 Z",
      ],
      transition: {
        duration: 0.65,
        times: [0, 0.6, 1],
        ease: [0.76, 0, 0.24, 1] as any,
      },
    },
  };

  const exitPathVariants = {
    covered: {
      d: "M 0 0 L 0 100 Q 50 100 100 100 L 100 0 Z",
    },
    revealing: {
      d: [
        "M 0 0 L 0 100 Q 50 100 100 100 L 100 0 Z",
        "M 0 0 L 0 0 Q 50 -28 100 0 L 100 0 Z",
        "M 0 0 L 0 0 Q 50 0 100 0 L 100 0 Z",
      ],
      transition: {
        duration: 0.65,
        times: [0, 0.6, 1],
        ease: [0.76, 0, 0.24, 1] as any,
      },
    },
  };

  return (
    <div
      className={`fixed inset-0 z-[100] select-none flex items-center justify-center overflow-hidden ${
        phase === "revealing" ? "pointer-events-none" : "pointer-events-auto"
      }`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {isEntering ? (
          <motion.path
            fill="#090909"
            variants={enterPathVariants}
            initial="initial"
            animate="covering"
            onAnimationComplete={() => {
              if (onCovered) onCovered();
            }}
          />
        ) : (
          <motion.path
            fill="#090909"
            variants={exitPathVariants}
            initial="covered"
            animate="revealing"
            onAnimationComplete={() => {
              if (onRevealed) onRevealed();
            }}
          />
        )}
      </svg>

      {/* Center Label & Brand Wordmark during Transition */}
      <AnimatePresence>
        {(phase === "covering" || phase === "covered") && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative z-10 flex flex-col items-center justify-center text-center font-[family-name:var(--font-familjen)] pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-amber-400/90">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>NAVIGATING</span>
            </div>
            <div className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white uppercase">
              {pageLabel}
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
