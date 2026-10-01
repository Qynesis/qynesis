"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FocusInContractText from "@/components/reuseable/FocusInContractText";
// Music line-art wordmark temporarily disabled — keep for later
// import InteractiveMusicLines from "@/components/reuseable/InteractiveMusicLines";
import BrandWordmark3D from "@/components/brand/BrandWordmark3D";
import FooterAtmosphere from "../reuseable/FooterAtmosphere";

export default function PublicFooter() {
  const [isDiscussHovered, setIsDiscussHovered] = useState(false);
  const [isBookHovered, setIsBookHovered] = useState(false);

  return (
    <footer className="relative w-full min-h-screen flex flex-col text-white pt-28 overflow-hidden font-[family-name:var(--font-familjen)] select-none">
      <FooterAtmosphere
        pointerVelocity={{
          x: 0,
          y: 0,
        }}
      />
      {/* Full-screen footer: content at the top, wordmark pinned to the bottom */}
      <div className="w-full flex-1 flex flex-col px-6 md:px-12">
        {/* TOP ROW: BIG HEADLINE & CALLOUT LINKS */}
        <div className="w-full flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8 mb-10 md:mb-16">
          {/* Left: Giant Callout Headline */}
          <div className="md:flex-1 min-w-0">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl -ml-1 font-normal tracking-tight leading-[0.98] text-white">
              Ready to build <br />
              <span className="font-normal text-white">something bold?</span>
            </h2>
          </div>

          {/* Right: Callout Action Links — identical block to Business Enquiry / Social below so edges line up */}
          <div className="w-full md:w-[min(36rem,48%)] md:shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 sm:gap-y-6 items-start md:pt-16">
            <a
              href="#discuss"
              onMouseEnter={() => setIsDiscussHovered(true)}
              onMouseLeave={() => setIsDiscussHovered(false)}
              className="group inline-flex w-max items-center gap-2 whitespace-nowrap border-b border-white/30 pb-1 transition-all duration-300 no-underline text-white text-base sm:text-lg uppercase tracking-widest font-normal"
            >
              <FocusInContractText
                isHovered={isDiscussHovered}
                as="span"
                duration={0.4}
              >
                DISCUSS YOUR PROJECT
              </FocusInContractText>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
            </a>

            <a
              href="#book"
              onMouseEnter={() => setIsBookHovered(true)}
              onMouseLeave={() => setIsBookHovered(false)}
              className="group inline-flex w-max items-center gap-2 whitespace-nowrap border-b border-white/30 pb-1 transition-all duration-300 no-underline text-white text-base sm:text-lg uppercase tracking-widest font-normal"
            >
              <FocusInContractText
                isHovered={isBookHovered}
                as="span"
                duration={0.4}
              >
                BOOK A 30-MINUTE CALL
              </FocusInContractText>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
            </a>
          </div>
        </div>

        {/* MIDDLE ROW: COPYRIGHT & ENQUIRY / SOCIAL */}
        <div className="w-full flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8 mb-10 md:mb-20">
          {/* Left Sub-info */}
          <div className="md:flex-1 min-w-0 space-y-3">
            <p className="text-sm md:text-base uppercase tracking-widest text-neutral-400 font-medium">
              © QYNESIS {new Date().getFullYear()}
            </p>
            <span className="text-sm md:text-base tracking-widest text-neutral-400 font-medium">
              All right reserved
            </span>
          </div>

          {/* Right Sub-info (Business Enquiry & Social) */}
          <div className="w-full md:w-[min(36rem,48%)] md:shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 sm:gap-y-8">
            {/* Business Enquiry */}
            <div className="space-y-3">
              <span className="text-sm md:text-base uppercase tracking-widest text-neutral-400 font-medium block">
                BUSINESS ENQUIRY
              </span>
              <div className="text-base md:text-lg font-normal text-neutral-200 space-y-2">
                <p className="flex items-center">
                  <span className="text-neutral-500 mr-2.5">E.</span>
                  <a
                    href="mailto:hello@qynesis.com"
                    className="hover:underline text-white transition-colors"
                  >
                    sajjadhosenmahim@gmail.com
                  </a>
                </p>
                <p className="flex items-center">
                  <span className="text-neutral-500 mr-2.5">P.</span>
                  <a
                    href="tel:+919824182099"
                    className="hover:underline text-white transition-colors"
                  >
                    +8801857589709
                  </a>
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <span className="text-sm md:text-base uppercase tracking-widest text-neutral-400 font-medium block">
                SOCIAL
              </span>
              <div className="grid grid-cols-1 gap-y-2 gap-x-6 text-base md:text-lg font-normal text-neutral-200">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className=" transition-colors no-underline"
                >
                  Linkedin
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors no-underline"
                >
                  Facebook
                </a>
                {/* <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="transition-colors no-underline">
                  Dribbble
                </a> */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors no-underline"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GIANT INTERACTIVE MUSIC LINE-ART BRAND GRAPHIC — temporarily disabled, keep for later */}
        {/* <div className="w-full">
          <InteractiveMusicLines />
        </div> */}

        {/* BOTTOM GIANT 3D BRAND WORDMARK (same lettering as the intro and navbar logo) */}
        <div className="w-full mt-auto pt-2 md:pt-4 pb-8 md:pb-14 text-white/45">
          <BrandWordmark3D />
          {/* Flat outline alternative: <BrandWordmark variant="outline" /> */}
        </div>
      </div>
    </footer>
  );
}
