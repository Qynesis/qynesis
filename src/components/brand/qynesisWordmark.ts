// ─── QYNESIS BRAND WORDMARK GEOMETRY ───────────────────────────────────────
// Shared by the cinematic preloader and the navbar logo.
// Coordinate space centred on x=480, cap height y=58 → 142 (H = 84).
// Mirrors the brand wordmark: monoline weight, square-cut ends,
// rounded-box Q with a diagonal tail, triple-bar E (≡), squared S.

export const CAP_TOP = 58;
export const CAP_HEIGHT = 84;

// ─── Geometry helpers ──────────────────────────────────────────────────────
export const SW = 12; // wordmark stroke weight
const r2 = (v: number) => Math.round(v * 100) / 100;

const rect = (x: number, y: number, w: number, h: number) =>
  `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;

const poly = (...pts: [number, number][]) =>
  `M ${pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(" L ")} Z`;

// Quarter ring centred on (cx, cy) with outer radius r, sweeping 90° clockwise from a0°
const corner = (cx: number, cy: number, r: number, a0: number) => {
  const ri = r - SW;
  const pt = (rad: number, deg: number) => {
    const t = (deg * Math.PI) / 180;
    return `${r2(cx + rad * Math.cos(t))} ${r2(cy + rad * Math.sin(t))}`;
  };
  return `M ${pt(r, a0)} A ${r} ${r} 0 0 1 ${pt(r, a0 + 90)} L ${pt(ri, a0 + 90)} A ${ri} ${ri} 0 0 0 ${pt(ri, a0)} Z`;
};

// Squared S starting at x0 (86 wide, corner radius 20)
const sShapes = (x0: number): string[] => [
  rect(x0 + 20, 58, 66, SW), // top bar
  corner(x0 + 20, 78, 20, 180) + rect(x0, 78, SW, 8) + corner(x0 + 20, 86, 20, 90), // upper-left curve
  rect(x0 + 20, 94, 46, SW), // middle bar
  corner(x0 + 66, 114, 20, 270) + rect(x0 + 74, 114, SW, 8) + corner(x0 + 66, 122, 20, 0), // lower-right curve
  rect(x0, 130, 66, SW), // bottom bar
];

const Y_SLOPE = 50 / 42;

export interface WordmarkLetter {
  letter: string;
  /** Horizontal centre (used to scatter preloader fragments outward) */
  cx: number;
  /** Glyph advance box on the x-axis (Q's tail overhangs x1 slightly) */
  x0: number;
  x1: number;
  shapes: string[];
}

export const WORDMARK_LETTERS: WordmarkLetter[] = [
  {
    // Q: x 115–211, rounded box (r = 30) with diagonal tail breaking the bottom-right
    letter: "Q",
    cx: 163,
    x0: 115,
    x1: 211,
    shapes: [
      corner(145, 88, 30, 180),
      rect(145, 58, 36, SW),
      corner(181, 88, 30, 270),
      rect(199, 88, SW, 26),
      rect(115, 88, SW, 24),
      corner(145, 112, 30, 90),
      poly([145, 130], [176, 130], [188, 142], [145, 142]),
      poly([150, 104], [167, 104], [215, 152], [198, 152]),
    ],
  },
  {
    // Y: x 245–329, arms meet on x = 287
    letter: "Y",
    cx: 287,
    x0: 245,
    x1: 329,
    shapes: [
      poly([245, 58], [261, 58], [287, 58 + 26 * Y_SLOPE], [287, 108]),
      poly([329, 58], [313, 58], [287, 58 + 26 * Y_SLOPE], [287, 108]),
      rect(281, 89, SW, 27),
      rect(281, 116, SW, 26),
    ],
  },
  {
    // N: x 363–447
    letter: "N",
    cx: 405,
    x0: 363,
    x1: 447,
    shapes: [
      rect(363, 58, SW, 42),
      rect(363, 100, SW, 42),
      poly([363, 58], [379, 58], [413, 100], [397, 100]),
      poly([397, 100], [413, 100], [447, 142], [431, 142]),
      rect(435, 58, SW, 42),
      rect(435, 100, SW, 42),
    ],
  },
  {
    // E: x 481–559, three stacked bars (≡)
    letter: "E",
    cx: 520,
    x0: 481,
    x1: 559,
    shapes: [
      rect(481, 58, 39, SW),
      rect(520, 58, 39, SW),
      rect(481, 94, 39, SW),
      rect(520, 94, 39, SW),
      rect(481, 130, 39, SW),
      rect(520, 130, 39, SW),
    ],
  },
  { letter: "S", cx: 636, x0: 593, x1: 679, shapes: sShapes(593) },
  {
    letter: "I",
    cx: 719,
    x0: 713,
    x1: 725,
    shapes: [rect(713, 58, SW, 42), rect(713, 100, SW, 42)],
  },
  { letter: "S", cx: 802, x0: 759, x1: 845, shapes: sShapes(759) },
];
