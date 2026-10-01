import React from "react";
import QynesisQ3D from "@/components/brand/QynesisQ3D";

/**
 * Pins the 3D brand Q to the centre of the viewport behind its children.
 * The layer is non-interactive, so every hover effect (incl. the fluid cursor)
 * keeps working; the Q follows the pointer via window-level tracking.
 */
export default function QStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 z-0 h-screen -mb-[100vh] w-full overflow-hidden select-none"
      >
        {/* Crosshair hairlines */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/[0.035] to-transparent" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          {/* Soft halo */}
          <div
            className="absolute w-[82vmin] h-[82vmin] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 38%, transparent 66%)",
            }}
          />

          {/* Inner fine ring */}
          <div className="absolute w-[60vmin] h-[60vmin] rounded-full border border-white/[0.045]" />

          {/* Outer dotted orbit with cardinal ticks, slowly turning */}
          <svg
            viewBox="0 0 100 100"
            className="absolute w-[76vmin] h-[76vmin] motion-safe:animate-[spin_120s_linear_infinite]"
            fill="none"
          >
            <circle cx="50" cy="50" r="49" stroke="rgba(255,255,255,0.09)" strokeWidth="0.18" strokeDasharray="0.2 1.4" strokeLinecap="round" />
            {[0, 90, 180, 270].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="0.4"
                x2="50"
                y2="2.6"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.22"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
            <circle cx="50" cy="1" r="0.55" fill="rgba(255,255,255,0.3)" transform="rotate(38 50 50)" />
          </svg>

          {/* Light pool beneath the mark (soft gradient only; a CSS blur filter here
              cost GPU time on every frame) */}
          <div
            className="absolute w-[40vmin] h-[7vmin] translate-y-[27vmin] rounded-[50%]"
            style={{
              background:
                "radial-gradient(ellipse closest-side, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 55%, transparent 100%)",
            }}
          />
        </div>

        {/* Kept dim so the headline copy above it stays readable. The canvas is a
            centred square just big enough for the Q (the Q is sized from the viewport) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <QynesisQ3D opacity={0.3} className="relative w-[min(92vmin,100vw)] aspect-square" />
        </div>
      </div>

      {children}
    </div>
  );
}
