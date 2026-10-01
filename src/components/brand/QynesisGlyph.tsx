import React from "react";
import { CAP_HEIGHT, CAP_TOP, WORDMARK_LETTERS } from "./qynesisWordmark";

interface QynesisGlyphProps {
  /** Index of the letter within "QYNESIS" (0–6) */
  index: number;
  /** Rendered cap height, relative to the surrounding font size */
  capHeight?: string;
  className?: string;
}

/** A single brand-wordmark letter as inline SVG, coloured with currentColor. */
export default function QynesisGlyph({
  index,
  capHeight = "0.72em",
  className = "",
}: QynesisGlyphProps) {
  const glyph = WORDMARK_LETTERS[index];
  if (!glyph) return null;

  const width = glyph.x1 - glyph.x0;

  return (
    <svg
      viewBox={`${glyph.x0} ${CAP_TOP} ${width} ${CAP_HEIGHT}`}
      className={`block overflow-visible ${className}`}
      style={{
        height: capHeight,
        width: `calc(${capHeight} * ${width / CAP_HEIGHT})`,
      }}
      fill="currentColor"
      aria-hidden="true"
    >
      {glyph.shapes.map((d, i) => (
        // Hairline stroke hides anti-aliasing seams between touching pieces
        <path key={i} d={d} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
      ))}
    </svg>
  );
}
