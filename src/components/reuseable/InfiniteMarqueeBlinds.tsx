"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function InfiniteMarqueeBlinds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const blindsContainerRef = useRef<HTMLDivElement>(null);
  const slatRefs = useRef<HTMLDivElement[]>([]);

  slatRefs.current = [];

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !slatRefs.current.includes(el)) {
      slatRefs.current.push(el);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Infinite Horizontal Marquee Loop Animation
      if (marqueeTrackRef.current) {
        gsap.to(marqueeTrackRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: 220,
          ease: "none",
        });
      }

      // 2. Venetian Blinds Curtain Scroll Transition
      if (containerRef.current && slatRefs.current.length > 0) {
        gsap.to(slatRefs.current, {
          scaleY: 1.05,
          stagger: {
            each: 0.1,
            from: "end",
          },
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const marqueeText = "IMPACT + INSPIRE + INNOVATE + ";
  const repeatedText = Array(4).fill(marqueeText).join("");

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#080808] text-white overflow-hidden font-[family-name:var(--font-familjen)] select-none"
    >
      {/* BACKGROUND CORNER DETAILS */}
      <div className="absolute top-8 left-6 md:left-12 z-10 mt-15">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block max-w-[180px] leading-relaxed">
          FOCUSED VISION.
          <br />
          MEASURED EXECUTION.
        </span>
      </div>

      {/* MAIN INFINITE MARQUEE TEXT TRACK */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center overflow-hidden">
        <div className="w-full overflow-hidden flex items-center">
          <div
            ref={marqueeTrackRef}
            className="flex whitespace-nowrap will-change-transform py-4"
          >
            <span className="text-6xl sm:text-8xl md:text-[9.5rem] lg:text-[12rem] font-medium tracking-tighter uppercase leading-none text-white px-4">
              {repeatedText}
            </span>
            <span className="text-6xl sm:text-8xl md:text-[9.5rem] lg:text-[12rem] font-medium tracking-tighter uppercase leading-none text-white px-4">
              {repeatedText}
            </span>
          </div>
        </div>
      </div>

      {/* VENETIAN BLINDS CURTAIN WIPING SLATS (TRANSITION TO LIGHT THEME) */}
      <div
        ref={blindsContainerRef}
        className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between h-[calc(100%+4px)]"
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            ref={addToRefs}
            data-theme="light"
            className="w-full h-[20.5%] bg-[#EAE9E5] origin-bottom scale-y-0 will-change-transform"
          />
        ))}
      </div>
    </div>
  );
}
