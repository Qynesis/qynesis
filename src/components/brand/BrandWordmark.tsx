import React from "react";
import { WORDMARK_LETTERS } from "./qynesisWordmark";

// Tight bounds of the full wordmark: Q left edge → last S right edge,
// cap top → bottom of the Q tail
const VIEW_BOX = "115 58 730 94";

interface BrandWordmarkProps {
  className?: string;
  title?: string;
}

/** Solid QYNESIS brand wordmark, coloured with currentColor and scaled to its width. */
export default function BrandWordmark({ className = "", title = "Qynesis" }: BrandWordmarkProps) {
  return (
    <svg
      viewBox={VIEW_BOX}
      className={`block w-full h-auto ${className}`}
      fill="currentColor"
      role="img"
      aria-label={title}
    >
      {WORDMARK_LETTERS.flatMap(({ shapes }, li) =>
        shapes.map((d, si) => (
          // Hairline stroke hides anti-aliasing seams between touching pieces
          <path key={`${li}-${si}`} d={d} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
        ))
      )}
    </svg>
  );
}
