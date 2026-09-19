"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function KeyFactsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Precise TRIONN 3D card perspective emergence
      if (card1Ref.current) {
        gsap.fromTo(
          card1Ref.current,
          {
            y: 160,
            rotateX: 36,
            rotateY: 16,
            skewY: -6,
            opacity: 0.35,
            transformOrigin: "center bottom",
          },
          {
            y: 0,
            rotateX: 0,
            rotateY: 0,
            skewY: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              end: "top 30%",
              scrub: 1,
            },
          }
        );
      }

      // Card 2: tilted backward from center
      if (card2Ref.current) {
        gsap.fromTo(
          card2Ref.current,
          {
            y: 190,
            rotateX: 42,
            opacity: 0.3,
            scale: 0.9,
            transformOrigin: "center bottom",
          },
          {
            y: 0,
            rotateX: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 88%",
              end: "top 28%",
              scrub: 1,
            },
          }
        );
      }

      // Card 3: lying back into 3D space and angled inward
      if (card3Ref.current) {
        gsap.fromTo(
          card3Ref.current,
          {
            y: 170,
            rotateX: 46,
            rotateY: -22,
            skewY: 10,
            opacity: 0.35,
            transformOrigin: "center bottom",
          },
          {
            y: 0,
            rotateX: 0,
            rotateY: 0,
            skewY: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              end: "top 30%",
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-theme="light"
      style={{ perspective: "1200px" }}
      className="relative w-full bg-[#EAE9E5] text-[#111] pt-20 pb-24 md:pt-28 md:pb-36 px-6 md:px-12 font-[family-name:var(--font-familjen)] select-none overflow-hidden -mt-1"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* SECTION HEADER */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-none text-[#111] mb-4">
            Key facts
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-normal">
            A snapshot of our experience and impact.
          </p>
        </div>

        {/* 3-CARD KEY FACTS GRID WITH 3D PERSPECTIVE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch [perspective:1200px]">
          {/* CARD 1: FEATURED & AWARDS (FULL BACKGROUND IMAGE) */}
          <div
            ref={card1Ref}
            className="rounded-2xl p-6 md:p-8 text-white flex flex-col justify-between min-h-[500px] relative overflow-hidden group border border-white/10 shadow-xl will-change-transform"
          >
            {/* Full Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/key_facts_awards_lion.jpg"
                alt="Featured & Awards Lion Trophy"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
              />
              {/* Subtle gradient vignette for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />
            </div>

            {/* Top Label */}
            <span className="relative z-10 font-mono text-xs uppercase tracking-widest text-neutral-200 font-medium block drop-shadow-md">
              FEATURED & AWARDS
            </span>

            {/* Bottom Content */}
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
            className="bg-[#DFDED9] rounded-2xl p-6 md:p-8 text-[#111] flex flex-col justify-between items-center text-center min-h-[500px] relative overflow-hidden group border border-black/5 shadow-xl will-change-transform"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-600 font-medium block w-full text-center">
              PROJECTS COMPLETED
            </span>

            <div className="my-auto py-6">
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500 mx-auto">
                <span className="text-4xl md:text-5xl font-medium tracking-tight text-[#111]">
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
            className="bg-[#24262B] rounded-2xl p-6 md:p-8 text-white flex flex-col justify-between min-h-[500px] relative overflow-hidden group border border-white/5 shadow-xl will-change-transform"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-medium block">
              OUR TEAM MEMBERS
            </span>

            <div className="my-6 relative w-full h-56 rounded-xl overflow-hidden">
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

        {/* BOTTOM BUSINESS PARTNERS LABEL */}
        <div className="mt-20 md:mt-28 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-medium block">
            OUR BUSINESS PARTNERS
          </span>
        </div>
      </div>
    </section>
  );
}
