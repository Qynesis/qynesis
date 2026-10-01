"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

interface Logo3DTextProps {
  /** The text string to render (defaults to "QYNESIS") */
  text?: string;
  /** Delay in milliseconds before the very first animation triggers (default: 3500ms) */
  initialDelay?: number;
  /** Interval in milliseconds between subsequent periodic 3D swaps (default: 5000ms) */
  interval?: number;
  /** Holds the periodic swaps (e.g. while the intro is flying its wordmark in) */
  paused?: boolean;
  /** Delay in milliseconds before the first swap once `paused` is released (default: 400ms) */
  resumeDelay?: number;
  /** Additional CSS class names applied to the container */
  className?: string;
  /** Optional custom renderer for each character face (e.g. SVG brand glyphs) */
  renderChar?: (char: string, index: number) => React.ReactNode;
}

export default function Logo3DText({
  text = "QYNESIS",
  initialDelay = 3500,
  interval = 15000,
  paused = false,
  resumeDelay = 400,
  className = "",
  renderChar,
}: Logo3DTextProps) {
  const [rollIndex, setRollIndex] = useState(0);
  const wasPausedRef = useRef(false);

  // Trigger next 3D roll step
  const triggerRoll = useCallback(() => {
    setRollIndex((prev) => prev + 1);
  }, []);

  // Periodic automatic 3D swap after initialDelay (resumeDelay after a pause)
  // and then every interval
  useEffect(() => {
    if (paused) {
      wasPausedRef.current = true;
      return;
    }
    const delay = wasPausedRef.current ? resumeDelay : initialDelay;
    wasPausedRef.current = false;

    let recurring: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => {
      triggerRoll();
      recurring = setInterval(triggerRoll, interval);
    }, delay);

    return () => {
      clearTimeout(timer);
      clearInterval(recurring);
    };
  }, [triggerRoll, initialDelay, interval, paused, resumeDelay]);

  // The cube face currently turned towards the viewer (marked with data-front)
  const frontFace = rollIndex % 4;

  const characters = Array.from(text);

  return (
    <span
      className={`inline-flex items-center cursor-pointer ${className}`}
      onMouseEnter={triggerRoll}
    >
      {characters.map((char, i) => {
        const face = renderChar ? renderChar(char, i) : char;

        return (
          <span
            key={i}
            data-char={i}
            className="inline-block relative overflow-visible"
            style={{
              perspective: "400px",
              perspectiveOrigin: "50% 50%",
              height: "1.25em",
              lineHeight: "1.25em",
            }}
          >
            <motion.span
              className="inline-block relative"
              animate={{ rotateX: rollIndex * 90 }}
              transition={{
                duration: 0.65,
                delay: i * 0.045, // Staggered letter-by-letter swap
                ease: [0.22, 1, 0.36, 1], // Smooth, snappy cubic-bezier
              }}
              style={{
                transformStyle: "preserve-3d",
                display: "inline-block",
                height: "100%",
                width: char === " " ? "0.35em" : "auto",
              }}
            >
              {/* Face 0: Front */}
              <span
                data-front={frontFace === 0 || undefined}
                className="inline-block select-none will-change-transform"
                style={{
                  height: "100%",
                  verticalAlign: "top",
                  transform: "rotateX(0deg) translateZ(0.625em)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {face}
              </span>

              {/* Face 1: Bottom (rolls in on first swap) */}
              <span
                data-front={frontFace === 1 || undefined}
                className="absolute inset-0 inline-block select-none will-change-transform"
                style={{
                  transform: "rotateX(-90deg) translateZ(0.625em)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {face}
              </span>

              {/* Face 2: Back (rolls in on second swap) */}
              <span
                data-front={frontFace === 2 || undefined}
                className="absolute inset-0 inline-block select-none will-change-transform"
                style={{
                  transform: "rotateX(-180deg) translateZ(0.625em)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {face}
              </span>

              {/* Face 3: Top (rolls in on third swap) */}
              <span
                data-front={frontFace === 3 || undefined}
                className="absolute inset-0 inline-block select-none will-change-transform"
                style={{
                  transform: "rotateX(-270deg) translateZ(0.625em)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {face}
              </span>
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
