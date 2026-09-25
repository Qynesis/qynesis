"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function InfiniteMarqueeBlinds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const blindsContainerRef = useRef<HTMLDivElement>(null);
  const keyFactsWrapperRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
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

      // 2. Master Venetian Blinds + KeyFacts Transition Timeline
      if (containerRef.current && slatRefs.current.length > 0) {
        const masterTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: true,
            anticipatePin: 1,
          },
        });

        // Step 1: Blinds close from bottom to top (duration: 1.0)
        masterTl.to(
          slatRefs.current,
          {
            scaleY: 1.05,
            stagger: {
              each: 0.08,
              from: "end",
            },
            duration: 1.0,
            ease: "power2.inOut",
          },
          0
        );

        // Step 2: DELAYED next section entry (starts at 0.70 of the timeline, once blinds are well up)
        // NO opacity transitions — elements remain 100% solid opacity!
        if (keyFactsWrapperRef.current) {
          masterTl.fromTo(
            keyFactsWrapperRef.current,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            0.7
          );
        }

        // Step 3: 3D Z-axis emergence (cards start at y: 0 and rise up from deep in the Z-axis)
        if (card1Ref.current) {
          masterTl.fromTo(
            card1Ref.current,
            {
              y: 0,
              z: -350,
              rotateX: 40,
              rotateY: 28,
              skewY: -16,
              transformOrigin: "center bottom",
            },
            {
              y: 0,
              z: 0,
              rotateX: 0,
              rotateY: 0,
              skewY: 0,
              duration: 0.85,
              ease: "power2.out",
            },
            0.74
          );
        }

        if (card2Ref.current) {
          masterTl.fromTo(
            card2Ref.current,
            {
              y: 0,
              z: -420,
              rotateX: 48,
              skewY: -6,
              scale: 0.82,
              transformOrigin: "center bottom",
            },
            {
              y: 0,
              z: 0,
              rotateX: 0,
              skewY: 0,
              scale: 1,
              duration: 0.85,
              ease: "power2.out",
            },
            0.78
          );
        }

        if (card3Ref.current) {
          masterTl.fromTo(
            card3Ref.current,
            {
              y: 0,
              z: -350,
              rotateX: 42,
              rotateY: -30,
              skewY: 18,
              transformOrigin: "center bottom",
            },
            {
              y: 0,
              z: 0,
              rotateX: 0,
              rotateY: 0,
              skewY: 0,
              duration: 0.85,
              ease: "power2.out",
            },
            0.82
          );
        }
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

      {/* KEY FACTS SECTION OVERLAY (EMERGES SMOOTHLY AT 50% OF BLINDS TRANSITION) */}
      <div
        ref={keyFactsWrapperRef}
        data-theme="light"
        className="absolute inset-0 z-30 w-full h-full flex flex-col justify-center px-6 md:px-12 pointer-events-auto [perspective:1400px] [transform-style:preserve-3d]"
      >
        <div className="relative z-10 max-w-7xl mx-auto w-full [transform-style:preserve-3d]">
          {/* SECTION HEADER */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-none text-[#111] mb-3">
              Team of Visionaries
            </h2>
            <p className="text-base sm:text-xl text-neutral-600 font-normal">
              Different skills. One standard.
            </p>
          </div>

          {/* 3-CARD KEY FACTS GRID WITH 3D PERSPECTIVE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch [perspective:1400px] [transform-style:preserve-3d]">
            {/* CARD 1: FEATURED & AWARDS (FULL BACKGROUND IMAGE) */}
            <div
              ref={card1Ref}
              className="rounded-2xl p-6 md:p-8 text-white flex flex-col justify-between min-h-[380px] md:min-h-[460px] relative overflow-hidden group border border-white/10 shadow-xl will-change-transform"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/key_facts_awards_lion.jpg"
                  alt="Featured & Awards Lion Trophy"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />
              </div>

              <span className="relative z-10 font-mono text-xs uppercase tracking-widest text-neutral-200 font-medium block drop-shadow-md">
                FEATURED & AWARDS
              </span>

              <div className="relative z-10 flex items-end justify-between pt-4 border-t border-white/20">
                <div className="space-y-1 max-w-[200px]">
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal drop-shadow-md">
                    Featured on top design platforms worldwide.
                  </p>
                </div>
                <span className="text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-lg">
                  50+
                </span>
              </div>
            </div>

            {/* CARD 2: PROJECTS COMPLETED */}
            <div
              ref={card2Ref}
              className="bg-[#DFDED9] rounded-2xl p-6 md:p-8 text-[#111] flex flex-col justify-between items-center text-center min-h-[380px] md:min-h-[460px] relative overflow-hidden group border border-black/5 shadow-xl will-change-transform"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-600 font-medium block w-full text-center">
                PROJECTS COMPLETED
              </span>

              <div className="my-auto py-4">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500 mx-auto">
                  <span className="text-3xl md:text-5xl font-medium tracking-tight text-[#111]">
                    1.5K+
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-black/10 w-full">
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal max-w-xs mx-auto">
                  90% of our clients seek our services for a second project.
                </p>
              </div>
            </div>

            {/* CARD 3: OUR TEAM MEMBERS */}
            <div
              ref={card3Ref}
              className="bg-[#24262B] rounded-2xl p-6 md:p-8 text-white flex flex-col justify-between min-h-[380px] md:min-h-[460px] relative overflow-hidden group border border-white/5 shadow-xl will-change-transform"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-medium block">
                OUR TEAM MEMBERS
              </span>

              <div className="my-4 relative w-full h-44 md:h-52 rounded-xl overflow-hidden">
                <Image
                  src="/images/key_facts_team_lion.jpg"
                  alt="Our Team Members Lion Mask Portrait"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-white/10">
                <div className="space-y-1 max-w-[200px]">
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                    Different skills. One standard.
                  </p>
                </div>
                <span className="text-4xl md:text-5xl font-medium tracking-tight text-white">
                  20+
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
