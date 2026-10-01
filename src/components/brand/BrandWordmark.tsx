import React, { useId } from "react";
import { WORDMARK_LETTERS } from "./qynesisWordmark";

// Tight bounds of the full wordmark: Q left edge → last S right edge,
// cap top → bottom of the Q tail
const VIEW_BOX = "115 58 730 94";
const BOUNDS = { x: 115, y: 58, w: 730, h: 94 };
// Room around the bounds for an outline drawn just outside the letters
const PAD = 16;

const PIECES = WORDMARK_LETTERS.flatMap(({ shapes }, li) =>
  shapes.map((d, si) => ({ key: `${li}-${si}`, d })),
);

interface BrandWordmarkProps {
  className?: string;
  title?: string;
  /** "solid" fills the letters; "outline" draws only their outer edge, hollow inside */
  variant?: "solid" | "outline";
  /** Outline thickness in screen pixels (outline variant) */
  outlineWidth?: number;
}

/** QYNESIS brand wordmark, coloured with currentColor and scaled to its width. */
export default function BrandWordmark({
  className = "",
  title = "Qynesis",
  variant = "solid",
  outlineWidth = 1.5,
}: BrandWordmarkProps) {
  const maskId = useId();

  if (variant === "outline") {
    const area = {
      x: BOUNDS.x - PAD,
      y: BOUNDS.y - PAD,
      width: BOUNDS.w + 2 * PAD,
      height: BOUNDS.h + 2 * PAD,
    };

    return (
      <svg
        viewBox={VIEW_BOX}
        className={`block w-full h-auto overflow-visible ${className}`}
        role="img"
        aria-label={title}
      >
        <defs>
          {/* The letters are built from touching pieces, so stroking them would
              draw seams through the letters. Instead the outline is every piece
              grown outwards (white), minus the letters themselves (black), grown
              by a hairline so the seams between touching pieces vanish. Both
              strokes are in screen pixels, at any size. */}
          <mask id={maskId} maskUnits="userSpaceOnUse" {...area}>
            {PIECES.map(({ key, d }) => (
              <path
                key={`grow-${key}`}
                d={d}
                fill="white"
                stroke="white"
                strokeWidth={2 * outlineWidth + 1}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {PIECES.map(({ key, d }) => (
              <path
                key={`cut-${key}`}
                d={d}
                fill="black"
                stroke="black"
                strokeWidth={1}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </mask>
        </defs>
        <rect {...area} fill="currentColor" mask={`url(#${maskId})`} />
      </svg>
    );
  }

  return (
    <svg
      viewBox={VIEW_BOX}
      className={`block w-full h-auto ${className}`}
      fill="currentColor"
      role="img"
      aria-label={title}
    >
      {PIECES.map(({ key, d }) => (
        // Hairline stroke hides anti-aliasing seams between touching pieces
        <path key={key} d={d} stroke="currentColor" strokeWidth={1} strokeLinejoin="round" />
      ))}
    </svg>
  );
}
