"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface DualInfiniteMarqueeProps {
  className?: string;
  sloganText?: string;
  sloganDuration?: number;
  logosDuration?: number;
}

export default function DualInfiniteMarquee({
  className = "",
  sloganText = "IMPACT + INSPIRE + INNOVATE + ",
  sloganDuration = 140,
  logosDuration = 45,
}: DualInfiniteMarqueeProps) {
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const marqueeTrackReverseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Top slogan marquee: scrolls left
    const ctx = gsap.context(() => {
      if (marqueeTrackRef.current) {
        gsap.to(marqueeTrackRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: sloganDuration,
          ease: "none",
        });
      }

      // Reverse logos marquee: scrolls right smoothly
      if (marqueeTrackReverseRef.current) {
        gsap.set(marqueeTrackReverseRef.current, { xPercent: -50, force3D: true });
        gsap.to(marqueeTrackReverseRef.current, {
          xPercent: 0,
          repeat: -1,
          duration: logosDuration,
          ease: "none",
          force3D: true,
        });
      }
    });

    return () => ctx.revert();
  }, [sloganDuration, logosDuration]);

  const repeatedText = Array(4).fill(sloganText).join("");

  const placeholderLogos = [
    {
      name: "NEXUS",
      svg: (
        <svg viewBox="0 0 130 36" fill="currentColor" className="h-7 sm:h-8 md:h-9 w-auto">
          <path d="M12 4L4 18L12 32H20L12 18L20 4H12ZM22 4L14 18L22 32H30L38 18L30 4H22Z" fill="currentColor" opacity="0.95"/>
          <text x="44" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="3">NEXUS</text>
        </svg>
      ),
    },
    {
      name: "VERTEX",
      svg: (
        <svg viewBox="0 0 140 36" fill="currentColor" className="h-7 sm:h-8 md:h-9 w-auto">
          <polygon points="18,5 31,31 5,31" stroke="currentColor" strokeWidth="3" fill="none" />
          <polygon points="18,14 26,30 10,30" fill="currentColor" />
          <text x="42" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="4">VERTEX</text>
        </svg>
      ),
    },
    {
      name: "SYNAPSE",
      svg: (
        <svg viewBox="0 0 160 36" fill="currentColor" className="h-7 sm:h-8 md:h-9 w-auto">
          <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="3" fill="none" />
          <circle cx="18" cy="18" r="5" fill="currentColor" />
          <line x1="18" y1="2" x2="18" y2="9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="27" x2="18" y2="34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="2" y1="18" x2="9" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="27" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <text x="42" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="3.5">SYNAPSE</text>
        </svg>
      ),
    },
    {
      name: "AETHER",
      svg: (
        <svg viewBox="0 0 150 36" fill="currentColor" className="h-7 sm:h-8 md:h-9 w-auto">
          <rect x="6" y="6" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="3" fill="none" transform="rotate(45 18 18)" />
          <circle cx="18" cy="18" r="4" fill="currentColor" />
          <text x="42" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="4">AETHER</text>
        </svg>
      ),
    },
    {
      name: "STRATA",
      svg: (
        <svg viewBox="0 0 145 36" fill="currentColor" className="h-7 sm:h-8 md:h-9 w-auto">
          <line x1="6" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="10" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="6" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <text x="44" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="4">STRATA</text>
        </svg>
      ),
    },
    {
      name: "KINETIC",
      svg: (
        <svg viewBox="0 0 155 36" fill="currentColor" className="h-7 sm:h-8 md:h-9 w-auto">
          <path d="M7 6L20 18L7 30M16 6L29 18L16 30" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <text x="42" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="3.5">KINETIC</text>
        </svg>
      ),
    },
    {
      name: "PULSE",
      svg: (
        <svg viewBox="0 0 140 36" fill="currentColor" className="h-7 sm:h-8 md:h-9 w-auto">
          <polyline points="5,19 12,19 16,9 22,29 27,15 31,19 36,19" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="44" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="4">PULSE</text>
        </svg>
      ),
    },
    {
      name: "HYPERION",
      svg: (
        <svg viewBox="0 0 170 36" fill="currentColor" className="h-7 sm:h-8 md:h-9 w-auto">
          <circle cx="18" cy="18" r="13" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <ellipse cx="18" cy="18" rx="14" ry="5" stroke="currentColor" strokeWidth="2" fill="none" transform="rotate(-30 18 18)" />
          <circle cx="18" cy="18" r="4" fill="currentColor" />
          <text x="42" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="700" letterSpacing="3.5">HYPERION</text>
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-center gap-6 md:gap-14 overflow-hidden bg-[#080808] text-white font-[family-name:var(--font-familjen)] ${className}`}
    >
      {/* BACKGROUND CORNER DETAILS */}
      <div className="absolute top-8 left-6 md:left-12 z-10 mt-15">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block max-w-[180px] leading-relaxed">
          FOCUSED VISION.
          <br />
          MEASURED EXECUTION.
        </span>
      </div>

      {/* ROW 1: PRIMARY SLOGAN MARQUEE (SCROLLS LEFT) */}
      <div className="w-full overflow-hidden flex items-center">
        <div
          ref={marqueeTrackRef}
          className="flex whitespace-nowrap will-change-transform py-4"
        >
          <span className="text-6xl sm:text-8xl md:text-[9.5rem] font-normal tracking-tighter uppercase leading-none text-white px-4">
            {repeatedText}
          </span>
          <span className="text-6xl sm:text-8xl md:text-[9.5rem] font-normal tracking-tighter uppercase leading-none text-white px-4">
            {repeatedText}
          </span>
        </div>
      </div>

      {/* ROW 2: OPPOSITE DIRECTION COMPANY LOGOS MARQUEE (SCROLLS RIGHT) */}
      <div className="w-full overflow-hidden flex items-center py-4">
        <div
          ref={marqueeTrackReverseRef}
          className="flex whitespace-nowrap will-change-transform items-center"
        >
          {/* Repeating set 1 */}
          <div className="flex items-center gap-12 md:gap-20 px-6 shrink-0">
            {placeholderLogos.map((brand, i) => (
              <div
                key={`brand-1-${i}`}
                className="flex items-center text-neutral-400 hover:text-white transition-colors duration-200 opacity-70 hover:opacity-100 cursor-pointer"
              >
                {brand.svg}
              </div>
            ))}
          </div>

          {/* Repeating set 2 (for seamless infinite loop) */}
          <div className="flex items-center gap-12 md:gap-20 px-6 shrink-0">
            {placeholderLogos.map((brand, i) => (
              <div
                key={`brand-2-${i}`}
                className="flex items-center text-neutral-400 hover:text-white transition-colors duration-200 opacity-70 hover:opacity-100 cursor-pointer"
              >
                {brand.svg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
