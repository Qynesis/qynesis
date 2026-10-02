"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";

// Registered here too: these sections can mount before the app's scroll provider
gsap.registerPlugin(ScrollTrigger, useGSAP);

const LINES = ["We engineer", "software & AI", "that lasts."];
const BADGE_TEXT = "SOFTWARE · AI · DESIGN · STRATEGY · ";

export default function AboutHero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".about-hero-line", { yPercent: 115, rotate: 3, duration: 1.4, stagger: 0.12 }, 0.15)
        .from(".about-hero-fade", { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.6)
        .from(".about-hero-badge", { scale: 0.6, opacity: 0, rotate: -90, duration: 1.4 }, 0.5);
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-theme="dark"
      className="relative flex min-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#070707] px-6 pb-10 pt-32 text-white md:px-12 md:pt-40 font-[family-name:var(--font-familjen)]"
    >
      {/* Soft light pool and a fine grid, for depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[20%] top-[-10%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_65%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:96px_96px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="relative">
        <p className="about-hero-fade mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-neutral-400 md:mb-10">
          <span className="h-px w-10 bg-neutral-500" />
          About Qynesis
        </p>
        <h1 className="text-[13vw] font-normal leading-[0.92] tracking-[-0.04em] sm:text-[11vw] lg:text-[9.5vw] xl:text-[150px]">
          {LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <span className={`about-hero-line block origin-bottom-left ${i === 2 ? "text-neutral-500" : ""}`}>{line}</span>
            </span>
          ))}
        </h1>
      </div>

      <div className="relative mt-16 flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
        <p className="about-hero-fade max-w-xl text-lg leading-relaxed text-neutral-300 md:text-xl">
          Qynesis is an independent studio of designers, engineers and AI specialists. We plan, design, build and
          scale digital products, from websites and apps to custom AI woven into the tools people use every day.
        </p>

        {/* Rotating badge with a scroll cue */}
        <div className="about-hero-badge relative size-32 shrink-0 md:size-40">
          <svg viewBox="0 0 200 200" className="size-full animate-[spin_22s_linear_infinite]" aria-hidden="true">
            <defs>
              <path id="about-badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text className="fill-white text-[14px] uppercase">
              {/* Stretched to wrap the circle exactly once (circumference ≈ 490) */}
              <textPath href="#about-badge-circle" textLength="486" lengthAdjust="spacing">
                {BADGE_TEXT}
              </textPath>
            </text>
          </svg>
          <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full border border-white/25 md:size-14">
            <ArrowDown className="size-5 animate-bounce" />
          </span>
        </div>
      </div>
    </section>
  );
}
