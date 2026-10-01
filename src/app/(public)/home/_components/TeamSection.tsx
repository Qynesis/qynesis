"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import FocusInContractText from "@/components/reuseable/FocusInContractText";
import { TEAM_MEMBERS } from "@/data/team";

// Same corner flights as the AI model cards, mirrored (each card enters from the
// opposite corner) and played in reverse order (last card lands first).
const AI_FLY_DIRECTIONS = [
  { x: -950, y: -620, rotate: -14 },
  { x: 0, y: -850, rotate: 0 },
  { x: 950, y: -620, rotate: 14 },
  { x: -950, y: 620, rotate: 10 },
  { x: 0, y: 850, rotate: 0 },
  { x: 950, y: 620, rotate: -10 },
];
const TEAM_FLY_DIRECTIONS = AI_FLY_DIRECTIONS.map(({ x, y, rotate }) => ({
  x: -x,
  y: -y,
  rotate: -rotate,
}));

const HOME_TEAM = TEAM_MEMBERS.slice(0, 6);

// Cards render at most ~460px wide; an 800px variant decodes and uploads to the
// GPU ~2x faster than the full-size photo used by the /team page
const cardImage = (src: string) => src.replace(/([?&])w=\d+/, "$1w=800");
const SLAT_COUNT = 5;

// Scroll distribution (px)
const CARDS_SCROLL = 2200;
const HOLD_SCROLL = 500;
const BLINDS_SCROLL = 1300;

export default function TeamSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const slatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const outer = outerRef.current;
      if (!outer) return;

      const cards = cardRefs.current;
      const slats = slatRefs.current.filter(Boolean) as HTMLDivElement[];

      cards.forEach((card, idx) => {
        if (!card) return;
        const dir = TEAM_FLY_DIRECTIONS[idx] || TEAM_FLY_DIRECTIONS[0];
        gsap.set(card, { x: dir.x, y: dir.y, rotation: dir.rotate, scale: 0.82, opacity: 0 });
      });
      if (buttonRef.current) gsap.set(buttonRef.current, { opacity: 0, y: 25, scale: 0.95 });
      gsap.set(slats, { scaleY: 0 });

      const total = CARDS_SCROLL + HOLD_SCROLL + BLINDS_SCROLL;
      const cardsEnd = CARDS_SCROLL / total;
      const blindsStart = (CARDS_SCROLL + HOLD_SCROLL) / total;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: outer,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.0,
          invalidateOnRefresh: true,
        },
      });

      // Timeline is normalised to 1 so phase lengths follow the scroll distribution
      const cardFlyDuration = cardsEnd * 0.42;
      const cardStagger = (cardsEnd - cardFlyDuration) * 0.16;

      // PHASE 1: CARDS FLY IN FROM MIRRORED CORNERS, LAST CARD FIRST
      cards.forEach((card, idx) => {
        if (!card) return;
        const dir = TEAM_FLY_DIRECTIONS[idx] || TEAM_FLY_DIRECTIONS[0];
        const order = cards.length - 1 - idx;
        tl.fromTo(
          card,
          { x: dir.x, y: dir.y, rotation: dir.rotate, scale: 0.82, opacity: 0 },
          { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, ease: "power3.out", duration: cardFlyDuration },
          order * cardStagger,
        );
      });

      // Button emerges once the six cards have landed
      if (buttonRef.current) {
        tl.fromTo(
          buttonRef.current,
          { opacity: 0, y: 25, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: cardsEnd * 0.2 },
          cardsEnd * 0.8,
        );
      }

      // PHASE 2: DARK BLINDS CLOSE TOP-DOWN INTO THE FOOTER
      // (reverse of the light blinds that open the testimonials section)
      tl.to(
        slats,
        {
          scaleY: 1.05,
          ease: "power2.inOut",
          duration: (1 - blindsStart) * 0.75,
          stagger: { each: (1 - blindsStart) * 0.06, from: "start" },
        },
        blindsStart,
      );
    }, outerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={outerRef}
      data-theme="light"
      className="relative w-full"
      style={{ height: `calc(100vh + ${CARDS_SCROLL + HOLD_SCROLL + BLINDS_SCROLL}px)` }}
    >
      <div
        data-theme="light"
        className="sticky top-0 w-full h-screen overflow-hidden bg-[#EAE9E5] text-[#141414] select-none font-[family-name:var(--font-familjen)]"
      >
        <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 md:px-12 py-20 md:py-24">
          {/* HEADER */}
          <div className="w-full flex items-end justify-between gap-6 mb-6 md:mb-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[0.95] text-[#141414]">
              Team Members
            </h2>
            <span className="hidden md:block font-mono text-xs uppercase tracking-widest text-neutral-500 max-w-[260px] text-right leading-relaxed">
              The people designing, engineering and shipping every Qynesis build.
            </span>
          </div>

          {/* 3x2 GRID OF MEMBERS (sized so two rows + header + button fit one screen:
              two rows of 32:23 cards are ~0.48x the grid width tall) */}
          <div className="w-full mx-auto max-w-[min(1440px,calc((100vh-300px)*2.09))]">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6 w-full">
              {HOME_TEAM.map((member, idx) => (
                <TransitionLink
                  key={member.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  href="/team"
                  className="group relative block w-full aspect-[32/23] rounded-md overflow-hidden shadow-lg bg-neutral-900 transition-shadow duration-500 hover:shadow-2xl will-change-transform"
                >
                  <img
                    src={cardImage(member.image)}
                    alt={member.name}
                    style={{ objectPosition: member.imagePosition }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute bottom-3.5 left-4 right-4 text-white pointer-events-none">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/70 block">
                      {member.role}
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <h4 className="text-base sm:text-lg font-medium tracking-tight text-white leading-tight">
                        {member.name}
                      </h4>
                      {member.location && (
                        <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase hidden sm:inline-block">
                          {member.location}
                        </span>
                      )}
                    </div>
                  </div>
                </TransitionLink>
              ))}
            </div>
          </div>

          {/* ALL TEAM MEMBERS BUTTON */}
          <div ref={buttonRef} className="mt-8 md:mt-10 flex justify-center will-change-transform">
            <TransitionLink
              href="/team"
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              className="group inline-flex items-center gap-2 border-b border-black/30 hover:border-black pb-1 transition-all duration-300 no-underline text-[#141414] text-sm sm:text-base uppercase tracking-widest font-normal cursor-pointer select-none"
            >
              <FocusInContractText isHovered={isBtnHovered} as="span" duration={0.4}>
                ALL TEAM MEMBERS
              </FocusInContractText>
              <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </TransitionLink>
          </div>
        </div>

        {/* DARK BLINDS (top-down) HANDING OVER TO THE FOOTER */}
        <div
          className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between h-[calc(100%+4px)]"
          aria-hidden="true"
        >
          {Array.from({ length: SLAT_COUNT }).map((_, index) => (
            <div
              key={index}
              ref={(el) => {
                slatRefs.current[index] = el;
              }}
              data-theme="dark"
              className="w-full h-[20.5%] bg-[#080808] origin-top scale-y-0 will-change-transform"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
