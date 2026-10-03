"use client";

import React, { useState } from "react";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import { ArrowUpRight } from "lucide-react";
import ScrollTextReveal from "@/components/reuseable/ScrollTextReveal";
import FocusInContractText from "@/components/reuseable/FocusInContractText";

export default function AboutSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative w-full bg-transparent text-white px-6 py-20 md:px-12 md:py-32 overflow-hidden font-[family-name:var(--font-familjen)] select-none">
      {/* MASTER 12-COLUMN ABOUT GRID */}
      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Left Column Label (Col 1-2) */}
        <div className="md:col-span-2">
          <span className="text-xl sm:text-5xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-[1.05] text-white">
            ABOUT
          </span>
        </div>

        {/* Right Column Statement Paragraph with GSAP Scroll Reveal (Col 3-12) */}
        <div className="md:col-span-10">
          <ScrollTextReveal
            as="h2"
            mode="scrub"
            start="top 85%"
            end="bottom 40%"
            dimOpacity={0.18}
            className="text-3xl mt-0 md:mt-12 sm:text-4xl md:text-5xl lg:text-7xl text-start font-normal tracking-tight leading-[1.12] text-white"
          >
            Qynesis is an independent digital studio crafting meaningful brand
            experiences through strategy, design, and technology.
          </ScrollTextReveal>
        </div>

        {/* BOTTOM SUB-SECTION DIVIDER & CALLOUTS (Col 3-12) */}
        <div className="md:col-span-10 md:col-start-3 border-t border-white/10 pt-12 mt-8 md:mt-16">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-8 md:gap-12 items-start">
            {/* Left Tagline Callout (Col 3-7, Aligned with Qynesis statement left edge) */}
            <div className="md:col-span-5 space-y-2">
              <span className="text-base uppercase tracking-wide text-white block max-w-sm leading-relaxed font-medium">
                WE DESIGN FOR LONGEVITY. CLARITY FIRST, CRAFT ALWAYS, BUILT TO
                SCALE.
              </span>
            </div>

            {/* Right Mission Callout & Action Link (Col 8-12, Aligned to far right end) */}
            <div className="md:col-span-5 flex flex-col items-start space-y-6 max-w-lg md:ml-auto">
              <p className="text-xl md:text-2xl text-neutral-200 leading-relaxed font-normal">
                Our mission is to make technology feel human by designing
                digital products that are intuitive, purposeful, and meaningful
                to people.
              </p>

              {/* More About Us CTA Button */}
              <div>
                <TransitionLink
                  href="/about"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group inline-flex items-center gap-2 border-b border-white/30 pb-1 transition-all duration-300 no-underline text-white text-xs uppercase tracking-widest"
                >
                  <FocusInContractText
                    isHovered={isHovered}
                    as="span"
                    duration={0.4}
                  >
                    MORE ABOUT US
                  </FocusInContractText>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
                </TransitionLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
