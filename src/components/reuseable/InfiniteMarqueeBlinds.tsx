"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import UnderlineTextButton from "@/components/reuseable/UnderlineTextButton";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import { setQStageCovered } from "@/lib/qStageEvents";

// Client stories reel: a story card rides in this far below its row (as a share of
// the viewport height) and rises over the last RISE_SPAN (share of the viewport
// width) of travel before its column is fully on screen — so every card that is
// fully visible, including at the very start and end of the reel, sits level.
const STORY_LIFT = 0.28;
const RISE_SPAN = 0.3;

export interface ProjectSlide {
  id: string;
  badgeIconText: string;
  heroText: string;
  title: string;
  description: string;
  gradientBg: string;
  theme: "light" | "dark";
  quote: string;
  clientName: string;
  role: string;
  stats: string;
}

const SLIDES: ProjectSlide[] = [
  {
    id: "01",
    badgeIconText: "BOOST YOUR WORKFORCE WITH AI DIGITAL WORKERS",
    heroText: "Hi, I'm Alex.",
    title: "MyWorker AI",
    description:
      "AI platform simplifying hiring, management, and workforce scaling.",
    gradientBg:
      "radial-gradient(ellipse at 80% 20%, #4a3b32 0%, #1e1713 50%, #0d0a08 100%)",
    theme: "dark",
    quote:
      "Qynesis completely redefined how our users interact with autonomous AI agents. Retention jumped 84%.",
    clientName: "Alex Rivera",
    role: "VP of Product · MyWorker AI",
    stats: "+84% Retention",
  },
  {
    id: "02",
    badgeIconText: "(Enter the Sound)",
    heroText:
      "An Independent Music ♬ Studio Shaped by Sound ©, Built to Move Culture.",
    title: "Pulse Studio",
    description:
      "A motion-led studio website showcasing artists, projects, and culture.",
    gradientBg:
      "radial-gradient(ellipse at 50% 15%, #b91c1c 0%, #450a0a 45%, #050505 100%)",
    theme: "dark",
    quote:
      "They took our sonic identity and engineered a dark, atmospheric web ecosystem that feels alive.",
    clientName: "Elena Rostova",
    role: "Creative Director · Pulse Studio",
    stats: "Site of the Day · Awwwards",
  },
  {
    id: "03",
    badgeIconText: "10K+ SATISFIED CUSTOMERS",
    heroText: "LIVE LIFE IN LUXURY",
    title: "Loftloom",
    description:
      "Seamless real estate platform for effortless property discovery.",
    gradientBg:
      "radial-gradient(ellipse at 60% 30%, #3f4740 0%, #1c221e 50%, #0a0d0b 100%)",
    theme: "dark",
    quote:
      "The cinematic elegance and precision Qynesis brought to Loftloom set an entirely new benchmark.",
    clientName: "Marcus Vance",
    role: "Managing Director · Loftloom Living",
    stats: "10K+ Verified Clients",
  },
  {
    id: "04",
    badgeIconText: "NEXT-GEN COMPUTATIONAL INTELLIGENCE",
    heroText:
      "Decoding cellular intelligence through generative computational biology.",
    title: "Aether BioTech",
    description:
      "Enterprise scientific discovery engine and spatial research platform.",
    gradientBg:
      "radial-gradient(ellipse at 70% 30%, #1e3a5f 0%, #0d1b2a 50%, #030712 100%)",
    theme: "dark",
    quote:
      "The level of technical rigor and bespoke art direction that Qynesis provides is simply peerless.",
    clientName: "Sophia Lin",
    role: "Head of Design · Aether Systems",
    stats: "3.2x Valuation Growth",
  },
];

export default function InfiniteMarqueeBlinds() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const marqueeTrackReverseRef = useRef<HTMLDivElement>(null);
  const blindsContainerRef = useRef<HTMLDivElement>(null);
  const overlayWrapperRef = useRef<HTMLDivElement>(null);
  const slatRefs = useRef<HTMLDivElement[]>([]);
  const storiesTrackRef = useRef<HTMLDivElement>(null);
  const storyColumnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storyCardRefs = useRef<(HTMLElement | null)[]>([]);

  slatRefs.current = [];

  const addToSlatRefs = (el: HTMLDivElement | null) => {
    if (el && !slatRefs.current.includes(el)) {
      slatRefs.current.push(el);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Dual Infinite Horizontal Marquee Loops
      const marqueeLoops: gsap.core.Tween[] = [];
      if (marqueeTrackRef.current) {
        marqueeLoops.push(
          gsap.to(marqueeTrackRef.current, {
            xPercent: -50,
            repeat: -1,
            duration: 105, // 3 phrase copies per half -> same px/s as 4 copies over 140s
            ease: "none",
            force3D: true,
            paused: true, // resumed by the visibility trigger below
          }),
        );
      }

      if (marqueeTrackReverseRef.current) {
        gsap.set(marqueeTrackReverseRef.current, {
          xPercent: -50,
          force3D: true,
        });
        marqueeLoops.push(
          gsap.to(marqueeTrackReverseRef.current, {
            xPercent: 0,
            repeat: -1,
            duration: 45,
            ease: "none",
            force3D: true,
            paused: true, // resumed by the visibility trigger below
          }),
        );
      }

      // Only run the marquee loops while the section is on screen
      if (containerRef.current && marqueeLoops.length) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) =>
            marqueeLoops.forEach((loop) =>
              self.isActive ? loop.resume() : loop.pause(),
            ),
        });
      }

      // 2. Master scroll timeline (the stage is CSS-sticky for the whole wrapper):
      // - Phase A: Blinds close bottom-to-top wiping into the light section.
      // - Phase B: The client stories panel rises into place.
      // - Phase C: The stories reel slides sideways; each story card rides in
      //   lower from the right and rises into line as it reaches the middle.
      if (!containerRef.current || slatRefs.current.length === 0) return;

      const track = storiesTrackRef.current;
      const columns = storyColumnRefs.current.filter(Boolean) as HTMLDivElement[];
      const cards = storyCardRefs.current.filter(Boolean) as HTMLElement[];

      // Column positions are cached (and re-measured on refresh) so the per-frame
      // rise only does arithmetic — no layout reads while scrolling
      const setCardY = cards.map((card) => gsap.quickSetter(card, "y", "px"));
      let columnBoxes: { left: number; width: number }[] = [];
      const measureColumns = () => {
        columnBoxes = columns.map((column) => ({ left: column.offsetLeft, width: column.offsetWidth }));
      };
      const updateRise = () => {
        if (!track) return;
        const x = Number(gsap.getProperty(track, "x")) || 0;
        const vw = window.innerWidth;
        const lift = window.innerHeight * STORY_LIFT;
        columnBoxes.forEach(({ left, width }, i) => {
          // 0 once the column is fully on screen (its left edge at or before vw - width)
          const restLeft = vw - width;
          const t = gsap.utils.clamp(0, 1, (left + x - restLeft) / (RISE_SPAN * vw));
          setCardY[i]?.(lift * t * t); // eases out as the card settles into line
        });
      };

      // Once every blind has closed, the opaque panel fully covers the sticky 3D Q
      // behind this section, so the Q can pause rendering until it is uncovered.
      const COVERED_AT = 1.35;
      let qCovered = false;
      const masterTl = gsap.timeline({
        onUpdate: () => {
          const covered = masterTl.time() >= COVERED_AT;
          if (covered !== qCovered) {
            qCovered = covered;
            setQStageCovered(covered);
          }
          updateRise();
        },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom", // wrapper is 480vh: 380vh of scroll while the stage is sticky
          scrub: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measureColumns();
            updateRise();
          },
        },
      });

      // Step 1: Blinds close (duration: 1.0)
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
        0,
      );

      // Step 2: Overlay emerges smoothly (starts at 0.70)
      if (overlayWrapperRef.current) {
        masterTl.fromTo(
          overlayWrapperRef.current,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0.7,
        );
      }

      // Step 3: The reel slides left until the last story reaches the right edge
      if (track) {
        masterTl.to(
          track,
          {
            x: () => -Math.max(0, track.scrollWidth - window.innerWidth),
            duration: 2.7,
            ease: "none",
          },
          1.6,
        );
      }

      measureColumns();
      updateRise();
    }, containerRef);

    return () => {
      ctx.revert();
      setQStageCovered(false);
    };
  }, []);

  const marqueeText = "IMPACT + INSPIRE + INNOVATE + ";
  // 3 copies per half keeps each half wider than any screen (no seam) while
  // keeping the painted layer small; the loop duration scales to match speed
  const repeatedText = Array(3).fill(marqueeText).join("");

  const placeholderLogos = [
    {
      name: "NEXUS",
      svg: (
        <svg
          viewBox="0 0 130 36"
          fill="currentColor"
          className="h-7 sm:h-8 md:h-9 w-auto"
        >
          <path
            d="M12 4L4 18L12 32H20L12 18L20 4H12ZM22 4L14 18L22 32H30L38 18L30 4H22Z"
            fill="currentColor"
            opacity="0.95"
          />
          <text
            x="44"
            y="24"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="3"
          >
            NEXUS
          </text>
        </svg>
      ),
    },
    {
      name: "VERTEX",
      svg: (
        <svg
          viewBox="0 0 140 36"
          fill="currentColor"
          className="h-7 sm:h-8 md:h-9 w-auto"
        >
          <polygon
            points="18,5 31,31 5,31"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <polygon points="18,14 26,30 10,30" fill="currentColor" />
          <text
            x="42"
            y="24"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="4"
          >
            VERTEX
          </text>
        </svg>
      ),
    },
    {
      name: "SYNAPSE",
      svg: (
        <svg
          viewBox="0 0 160 36"
          fill="currentColor"
          className="h-7 sm:h-8 md:h-9 w-auto"
        >
          <circle
            cx="18"
            cy="18"
            r="12"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="18" cy="18" r="5" fill="currentColor" />
          <line
            x1="18"
            y1="2"
            x2="18"
            y2="9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="18"
            y1="27"
            x2="18"
            y2="34"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="2"
            y1="18"
            x2="9"
            y2="18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="27"
            y1="18"
            x2="34"
            y2="18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text
            x="42"
            y="24"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="3.5"
          >
            SYNAPSE
          </text>
        </svg>
      ),
    },
    {
      name: "AETHER",
      svg: (
        <svg
          viewBox="0 0 150 36"
          fill="currentColor"
          className="h-7 sm:h-8 md:h-9 w-auto"
        >
          <rect
            x="6"
            y="6"
            width="24"
            height="24"
            rx="4"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            transform="rotate(45 18 18)"
          />
          <circle cx="18" cy="18" r="4" fill="currentColor" />
          <text
            x="42"
            y="24"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="4"
          >
            AETHER
          </text>
        </svg>
      ),
    },
    {
      name: "STRATA",
      svg: (
        <svg
          viewBox="0 0 145 36"
          fill="currentColor"
          className="h-7 sm:h-8 md:h-9 w-auto"
        >
          <line
            x1="6"
            y1="10"
            x2="30"
            y2="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="18"
            x2="34"
            y2="18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="6"
            y1="26"
            x2="26"
            y2="26"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text
            x="44"
            y="24"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="4"
          >
            STRATA
          </text>
        </svg>
      ),
    },
    {
      name: "KINETIC",
      svg: (
        <svg
          viewBox="0 0 155 36"
          fill="currentColor"
          className="h-7 sm:h-8 md:h-9 w-auto"
        >
          <path
            d="M7 6L20 18L7 30M16 6L29 18L16 30"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <text
            x="42"
            y="24"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="18"
            fontWeight="700"
            letterSpacing="3.5"
          >
            KINETIC
          </text>
        </svg>
      ),
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      // 100vh of stage + 380vh of scroll for the blinds / testimonial cards timeline
      style={{ height: "480vh" }}
    >
      {/* CSS sticky stage (instead of a GSAP pin) so the hand-off to the next
          section is done by the browser and can't lag behind the scroll */}
      <div className="sticky top-0 w-full h-screen text-white overflow-hidden font-[family-name:var(--font-familjen)] select-none">
        {/* ----------------- SECTION 1: DUAL MARQUEE BACKGROUND ----------------- */}
        <div className="relative z-10 w-full h-full flex flex-col justify-center gap-6 md:gap-14 overflow-hidden">
          {/* Background Corner Slogan */}
          <div className="absolute top-8 left-6 md:left-12 z-10 mt-15">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block max-w-[180px] leading-relaxed">
              COMPANIES
              <br />
              WE've WORKED WITH
            </span>
          </div>

          {/* Row 1: Primary Slogan Marquee (Scrolls Left) */}
          <div className="w-full overflow-hidden flex items-center">
            <div
              ref={marqueeTrackRef}
              className="flex whitespace-nowrap will-change-transform py-4"
            >
              <span className="text-4xl md:text-[6.5rem] font-normal tracking-tighter uppercase leading-none text-white px-4">
                {repeatedText}
              </span>
              <span className="text-4xl md:text-[6.5rem] font-normal tracking-tighter uppercase leading-none text-white px-4">
                {repeatedText}
              </span>
            </div>
          </div>

          {/* Row 2: Reverse Logos Marquee (Scrolls Right) */}
          <div className="w-full overflow-hidden flex items-center py-4">
            <div
              ref={marqueeTrackReverseRef}
              className="flex whitespace-nowrap will-change-transform items-center"
            >
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

        {/* ----------------- SECTION 2: VENETIAN BLINDS WIPING SLATS ----------------- */}
        <div
          ref={blindsContainerRef}
          className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between h-[calc(100%+4px)]"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              ref={addToSlatRefs}
              data-theme="light"
              className="w-full h-[20.5%] bg-[#EAE9E5] origin-bottom scale-y-0 will-change-transform"
            />
          ))}
        </div>

        {/* ----------------- SECTION 3: CLIENT STORIES — HORIZONTAL SCROLL REEL ----------------- */}
        <div
          ref={overlayWrapperRef}
          data-theme="light"
          className="absolute inset-0 z-30 w-full h-full bg-[#EAE9E5] text-[#141414] pointer-events-auto overflow-hidden will-change-transform"
        >
          <div ref={storiesTrackRef} className="flex h-full w-max will-change-transform">
            {/* Intro column */}
            <div className="relative h-full w-[88vw] md:w-[50vw] shrink-0 flex [align-items:safe_center] justify-center px-6 md:px-[4vw] pt-24 pb-8">
              <div>
                <h2 className="text-[2.6rem] sm:text-6xl md:text-[5.4vw] font-normal tracking-tight text-[#141414] leading-[0.92] mb-8 lg:mb-12">
                  Client Stories <br />
                  <span className="text-[#141414]">&amp; explorations</span>
                </h2>

                <UnderlineTextButton
                  text="A Few Words From Clients"
                  href="#testimonials"
                  className="border-black text-[#141414] hover:border-neutral-500"
                />
              </div>
            </div>

            {/* One column per client story, separated by hairlines */}
            {SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                ref={(el) => {
                  storyColumnRefs.current[idx] = el;
                }}
                className="relative h-full w-[88vw] md:w-[50vw] shrink-0 border-l border-black/10 flex [align-items:safe_center] justify-center px-5 sm:px-8 md:px-[4vw] pt-24 pb-8"
              >
                <article
                  ref={(el) => {
                    storyCardRefs.current[idx] = el;
                  }}
                  className="@container w-full max-w-[min(100%,calc((100vh-380px)*1.6))] will-change-transform"
                >
                  {/* Story artwork (16:10) */}
                  <div
                    style={{ background: slide.gradientBg }}
                    className="relative w-full aspect-[16/10] rounded-lg md:rounded-xl overflow-hidden p-[6cqw] flex flex-col justify-between text-white shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

                    <div className="relative z-10 max-w-[320px]">
                      <div className="w-6 h-6 mb-3 opacity-90 text-white">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="12" cy="6" r="3" />
                          <circle cx="18" cy="12" r="3" />
                        </svg>
                      </div>
                      <span className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-white/90 leading-tight block">
                        {slide.badgeIconText}
                      </span>
                    </div>

                    {/* Sized from the card's own width (cqw) so it always fits the artwork */}
                    <h3 className="relative z-10 text-[7.2cqw] @sm:text-[8cqw] font-normal tracking-tight text-white leading-[1.05]">
                      {slide.heroText}
                    </h3>
                  </div>

                  {/* Story meta: project, client quote, attribution, link */}
                  <div className="mt-5 md:mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="max-w-md">
                      <h4 className="text-2xl md:text-3xl font-normal tracking-tight text-[#141414] leading-tight">
                        {slide.title}
                      </h4>
                      <p className="mt-2 text-sm md:text-base text-neutral-600 leading-snug line-clamp-3">
                        &ldquo;{slide.quote}&rdquo;
                      </p>
                      <span className="mt-2 block font-mono text-[10px] md:text-[11px] uppercase tracking-wider text-neutral-500">
                        {slide.clientName} · {slide.role}
                      </span>
                    </div>

                    <UnderlineTextButton
                      as={TransitionLink}
                      text="Explore Project"
                      href="/work"
                      className="shrink-0 self-start sm:self-auto border-black text-[#141414] hover:border-neutral-500"
                    />
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
