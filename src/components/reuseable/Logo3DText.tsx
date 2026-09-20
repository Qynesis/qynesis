"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Logo3DTextProps {
  /** The text string to render (defaults to "QYNESIS") */
  text?: string;
  /** Delay in milliseconds before the very first animation triggers (default: 3500ms) */
  initialDelay?: number;
  /** Interval in milliseconds between subsequent periodic 3D swaps (default: 5000ms) */
  interval?: number;
  /** Additional CSS class names applied to the container */
  className?: string;
}

export default function Logo3DText({
  text = "QYNESIS",
  initialDelay = 3500,
  interval = 15000,
  className = "",
}: Logo3DTextProps) {
  const [rollIndex, setRollIndex] = useState(0);

  // Trigger next 3D roll step
  const triggerRoll = useCallback(() => {
    setRollIndex((prev) => prev + 1);
  }, []);

  // Periodic automatic 3D swap after initialDelay and then every interval
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerRoll();

      const recurring = setInterval(() => {
        triggerRoll();
      }, interval);

      return () => clearInterval(recurring);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [triggerRoll, initialDelay, interval]);

  const characters = Array.from(text);

  return (
    <span
      className={`inline-flex items-center cursor-pointer ${className}`}
      onMouseEnter={triggerRoll}
    >
      {characters.map((char, i) => (
        <span
          key={i}
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
              className="inline-block select-none will-change-transform"
              style={{
                transform: "rotateX(0deg) translateZ(0.625em)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {char}
            </span>

            {/* Face 1: Bottom (rolls in on first swap) */}
            <span
              className="absolute inset-0 inline-block select-none will-change-transform"
              style={{
                transform: "rotateX(-90deg) translateZ(0.625em)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {char}
            </span>

            {/* Face 2: Back (rolls in on second swap) */}
            <span
              className="absolute inset-0 inline-block select-none will-change-transform"
              style={{
                transform: "rotateX(-180deg) translateZ(0.625em)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {char}
            </span>

            {/* Face 3: Top (rolls in on third swap) */}
            <span
              className="absolute inset-0 inline-block select-none will-change-transform"
              style={{
                transform: "rotateX(-270deg) translateZ(0.625em)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {char}
            </span>
          </motion.span>
        </span>
      ))}
    </span>
  );
}
