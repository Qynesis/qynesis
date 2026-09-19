"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FocusInContractText from "@/components/reuseable/FocusInContractText";
import InteractiveMusicLines from "@/components/reuseable/InteractiveMusicLines";
import FooterAtmosphere from "../reuseable/FooterAtmosphere";

export default function PublicFooter() {
  const [isDiscussHovered, setIsDiscussHovered] = useState(false);
  const [isBookHovered, setIsBookHovered] = useState(false);

  return (
    <footer className="relative w-full bg-[#070707] text-white pt-20 md:pt-28 overflow-hidden font-[family-name:var(--font-familjen)] select-none border-t border-white/10">
      <FooterAtmosphere
        pointerVelocity={{
          x: 0,
          y: 0,
        }}
      />
      <div className="w-full px-6 md:px-12">
        {/* TOP ROW: BIG HEADLINE & CALLOUT LINKS */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-16">
          {/* Left: Giant Callout Headline */}
          <div className="md:col-span-7">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl -ml-1 font-normal tracking-tight leading-[0.98] text-white">
              Ready to build <br />
              <span className="font-normal text-white">something bold?</span>
            </h2>
          </div>

          {/* Right: Callout Action Links */}
          <div className="md:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 pt-4 md:pt-16 md:justify-end">
            <a
              href="#discuss"
              onMouseEnter={() => setIsDiscussHovered(true)}
              onMouseLeave={() => setIsDiscussHovered(false)}
              className="group inline-flex items-center gap-2 border-b border-white/30 pb-1 transition-all duration-300 no-underline text-white text-lg uppercase tracking-widest font-normal"
            >
              <FocusInContractText isHovered={isDiscussHovered} as="span" duration={0.4}>
                DISCUSS YOUR PROJECT
              </FocusInContractText>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
            </a>

            <a
              href="#book"
              onMouseEnter={() => setIsBookHovered(true)}
              onMouseLeave={() => setIsBookHovered(false)}
              className="group inline-flex items-center gap-2 border-b border-white/30 pb-1 transition-all duration-300 no-underline text-white text-lg uppercase tracking-widest font-normal"
            >
              <FocusInContractText isHovered={isBookHovered} as="span" duration={0.4}>
                BOOK A 30-MINUTE CALL
              </FocusInContractText>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
            </a>
          </div>
        </div>

        {/* MIDDLE ROW: COPYRIGHT & ENQUIRY / SOCIAL */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start mb-16 md:mb-20">
          {/* Left Sub-info */}
          <div className="md:col-span-5 space-y-3">
            <p className="text-sm md:text-base uppercase tracking-widest text-neutral-400 font-medium">
              QYNESIS {new Date().getFullYear()}
            </p>
          </div>

          {/* Right Sub-info (Business Enquiry & Social) */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 md:ml-auto w-full max-w-xl">
            {/* Business Enquiry */}
            <div className="space-y-3">
              <span className="text-sm md:text-base uppercase tracking-widest text-neutral-400 font-medium block">
                BUSINESS ENQUIRY
              </span>
              <div className="text-base md:text-lg font-normal text-neutral-200 space-y-2">
                <p className="flex items-center">
                  <span className="text-neutral-500 mr-2.5">E.</span>
                  <a href="mailto:hello@qynesis.com" className="hover:underline text-white transition-colors">
                    hello@qynesis.com
                  </a>
                </p>
                <p className="flex items-center">
                  <span className="text-neutral-500 mr-2.5">P.</span>
                  <a href="tel:+919824182099" className="hover:underline text-white transition-colors">
                    +91 98241 82099
                  </a>
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <span className="text-sm md:text-base uppercase tracking-widest text-neutral-400 font-medium block">
                SOCIAL
              </span>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-base md:text-lg font-normal text-neutral-200">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className=" transition-colors no-underline">
                  Linkedin
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="transition-colors no-underline">
                  Facebook
                </a>
                <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="transition-colors no-underline">
                  Dribbble
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition-colors no-underline">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GIANT INTERACTIVE MUSIC LINE-ART BRAND GRAPHIC */}
        <div className="w-full">
          <InteractiveMusicLines />
        </div>
      </div>
    </footer>
  );
}
