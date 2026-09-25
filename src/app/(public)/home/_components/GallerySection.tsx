"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import MouseImageTrail from "@/components/reuseable/MouseImageTrail";

import { PROJECTS, ProjectData } from "@/data/projects";
export { PROJECTS, type ProjectData };

export default function GallerySection() {
  const outerWrapperRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const foregroundTrackRef = useRef<HTMLDivElement>(null);
  const dockContainerRef = useRef<HTMLDivElement>(null);
  const cardTrackRef = useRef<HTMLDivElement>(null);

  // Overview statement line refs for alternating left/right entrance animation
  const overviewLine1Ref = useRef<HTMLSpanElement>(null);
  const overviewLine2Ref = useRef<HTMLSpanElement>(null);
  const overviewLine3Ref = useRef<HTMLSpanElement>(null);
  const overviewLine4Ref = useRef<HTMLSpanElement>(null);
  const overviewCtaRef = useRef<HTMLAnchorElement>(null);

  // A.I. Design typography line refs for scroll entrance animation
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const aiLine1Ref = useRef<HTMLHeadingElement>(null);
  const aiLine2Ref = useRef<HTMLHeadingElement>(null);
  const aiLine3Ref = useRef<HTMLHeadingElement>(null);
  const aiLine4Ref = useRef<HTMLHeadingElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // Drag interaction values stored in refs
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Distance constants for the master pinned scroll sequence (in pixels)
  // ~900px per project transition gives the requested ~3 scroll buffer per project
  const projectsScrollDistance = 7200; // 8 project transitions * 900px = 7200px (~3 scrolls per project)
  const overviewSlideDistance = 1600;  // Slide gallery right-to-left onto overview
  const overviewHoldDistance = 2400;   // 6 scrolls delay (4 scrolls animated text entrance + 2 scrolls resting hold)
  const aiSlideDistance = 1600;        // Slide overview right-to-left to unveil A.I. DESIGN section
  const aiHoldDistance = 1800;         // Hold A.I. DESIGN section before unsticking to Services from bottom
  const totalExtraScroll = projectsScrollDistance + overviewSlideDistance + overviewHoldDistance + aiSlideDistance + aiHoldDistance;

  // Smooth scroll to target slide index
  const scrollToSlide = useCallback((index: number) => {
    const outer = outerWrapperRef.current;
    if (!outer) return;
    const clamped = Math.max(0, Math.min(PROJECTS.length - 1, index));
    const targetScroll = outer.offsetTop + (clamped / (PROJECTS.length - 1)) * projectsScrollDistance;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, [projectsScrollDistance]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const outer = outerWrapperRef.current;
      const sticky = stickyContainerRef.current;
      const foregroundTrack = foregroundTrackRef.current;
      const dock = dockContainerRef.current;
      const cardTrack = cardTrackRef.current;

      if (!outer || !sticky || !foregroundTrack || !dock || !cardTrack) return;

      // Calculate maximum scroll distance for bottom preview cards with exact padding accounting
      const computeMaxShift = () => {
        if (!dock || !cardTrack) return 0;
        const computedStyle = window.getComputedStyle(dock);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        const innerContentWidth = dock.clientWidth - paddingLeft - paddingRight;
        return Math.max(0, cardTrack.scrollWidth - innerContentWidth);
      };

      const projectsDuration = 10;
      const overviewSlideDuration = (overviewSlideDistance / projectsScrollDistance) * projectsDuration;
      const overviewHoldDuration = (overviewHoldDistance / projectsScrollDistance) * projectsDuration;

      // Master scroll timeline scrubbed across the outer wrapper's physical scroll length
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "gallery-sticky-timeline",
          trigger: outer,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.0,
          invalidateOnRefresh: true,
        },
      });

      // -------------------------------------------------------------
      // PHASE 1: PROJECTS SHOWCASE (0 to projectsDuration)
      // -------------------------------------------------------------
      // 1a. Bottom cards shift smoothly from 0 to -computeMaxShift()
      tl.to(
        cardTrack,
        {
          x: () => -computeMaxShift(),
          ease: "none",
          duration: projectsDuration,
        },
        0
      );

      // 1b. Active project index updates smoothly across the 9 projects
      tl.to(
        { p: 0 },
        {
          p: 1,
          ease: "none",
          duration: projectsDuration,
          onUpdate: function () {
            const progress = this.targets()[0].p;
            const raw = Math.round(progress * (PROJECTS.length - 1));
            const idx = Math.max(0, Math.min(PROJECTS.length - 1, raw));
            if (idx !== activeIndexRef.current) {
              activeIndexRef.current = idx;
              setActiveIndex(idx);
            }
          },
        },
        0
      );

      // -------------------------------------------------------------
      // PHASE 2: SLIDE GALLERY RIGHT-TO-LEFT ONTO OVERVIEW PANEL
      // -------------------------------------------------------------
      tl.to(
        foregroundTrack,
        {
          xPercent: -33.3333,
          ease: "power1.inOut",
          duration: overviewSlideDuration,
        },
        projectsDuration
      );

      // -------------------------------------------------------------
      // PHASE 2b: OVERVIEW 6-SCROLL HOLD DELAY & 4-SCROLL TEXT ENTRANCE
      // Starts when the horizontal project panel is 50% across the viewport
      // -------------------------------------------------------------
      const overviewStartTime = projectsDuration + overviewSlideDuration;
      const overviewEntranceStartTime = projectsDuration + overviewSlideDuration * 0.5;
      const entranceDuration = (4 / 6) * overviewHoldDuration;
      const lineDuration = entranceDuration * 0.5;

      const line1 = overviewLine1Ref.current;
      const line2 = overviewLine2Ref.current;
      const line3 = overviewLine3Ref.current;
      const line4 = overviewLine4Ref.current;
      const cta = overviewCtaRef.current;

      if (line1 && line2 && line3 && line4 && cta) {
        // Line 1: Enters from left with extended travel and 3D skew
        tl.fromTo(
          line1,
          { x: -450, skewX: -18, rotateY: 16, opacity: 0, transformOrigin: "left center" },
          { x: 0, skewX: 0, rotateY: 0, opacity: 1, ease: "power2.out", duration: lineDuration },
          overviewEntranceStartTime
        );

        // Line 2: Enters from right with extended travel and 3D skew
        tl.fromTo(
          line2,
          { x: 450, skewX: 18, rotateY: -16, opacity: 0, transformOrigin: "right center" },
          { x: 0, skewX: 0, rotateY: 0, opacity: 1, ease: "power2.out", duration: lineDuration },
          overviewEntranceStartTime + entranceDuration * 0.15
        );

        // Line 3: Enters from left with extended travel and 3D skew
        tl.fromTo(
          line3,
          { x: -450, skewX: -18, rotateY: 16, opacity: 0, transformOrigin: "left center" },
          { x: 0, skewX: 0, rotateY: 0, opacity: 1, ease: "power2.out", duration: lineDuration },
          overviewEntranceStartTime + entranceDuration * 0.30
        );

        // Line 4: Enters from right with extended travel and 3D skew
        tl.fromTo(
          line4,
          { x: 450, skewX: 18, rotateY: -16, opacity: 0, transformOrigin: "right center" },
          { x: 0, skewX: 0, rotateY: 0, opacity: 1, ease: "power2.out", duration: lineDuration },
          overviewEntranceStartTime + entranceDuration * 0.45
        );

        // CTA button: Soft fade and rise from below
        tl.fromTo(
          cta,
          { y: 45, opacity: 0, scale: 0.94 },
          { y: 0, opacity: 1, scale: 1, ease: "power2.out", duration: lineDuration * 0.75 },
          overviewEntranceStartTime + entranceDuration * 0.58
        );
      }

      // Holds Overview in place across the full 6-scroll duration (4 scrolls entrance + 2 scrolls resting hold)
      tl.to(
        {},
        {
          duration: overviewHoldDuration,
        },
        overviewStartTime
      );

      // -------------------------------------------------------------
      // PHASE 3: SLIDE OVERVIEW TO THE LEFT TO REVEAL A.I. DESIGN PANEL
      // -------------------------------------------------------------
      const aiStartTime = overviewStartTime + overviewHoldDuration;
      const aiSlideDuration = (aiSlideDistance / projectsScrollDistance) * projectsDuration;
      const aiHoldDuration = (aiHoldDistance / projectsScrollDistance) * projectsDuration;
      const aiEntranceStartTime = aiStartTime + aiSlideDuration * 0.5;

      tl.to(
        foregroundTrack,
        {
          xPercent: -66.6666,
          ease: "power1.inOut",
          duration: aiSlideDuration,
        },
        aiStartTime
      );

      // A.I. Design typography lines entrance animation (starts when slide crosses 50%)
      const a1 = aiLine1Ref.current;
      const a2 = aiLine2Ref.current;
      const a3 = aiLine3Ref.current;
      const a4 = aiLine4Ref.current;
      const aiLines = [a1, a2, a3, a4].filter(Boolean);

      if (aiLines.length > 0) {
        const aiAnimDuration = aiSlideDuration * 0.6;
        aiLines.forEach((line, idx) => {
          const isOdd = idx % 2 !== 0;
          tl.fromTo(
            line,
            {
              y: 80,
              x: isOdd ? 45 : -45,
              opacity: 0,
              scale: 0.92,
              skewX: isOdd ? 7 : -7,
            },
            {
              y: 0,
              x: 0,
              opacity: 1,
              scale: 1,
              skewX: 0,
              ease: "power2.out",
              duration: aiAnimDuration,
            },
            aiEntranceStartTime + idx * (aiAnimDuration * 0.22)
          );
        });
      }

      // -------------------------------------------------------------
      // PHASE 4: HOLD A.I. DESIGN PANEL BEFORE NATURAL BOTTOM SCROLL TO SERVICES
      // -------------------------------------------------------------
      tl.to(
        {},
        {
          duration: aiHoldDuration,
        },
        aiStartTime + aiSlideDuration
      );

      ScrollTrigger.refresh();
    }, outerWrapperRef);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
    };
  }, [projectsScrollDistance, overviewSlideDistance, overviewHoldDistance, aiSlideDistance, aiHoldDistance]);

  const activeProject = PROJECTS[activeIndex];

  return (
    /* 
     * Outer Physical Flow Wrapper:
     * Has physical scroll height (100vh + totalExtraScroll) so that the Footer
     * is guaranteed to be pushed down and NEVER overlap during gallery scroll.
     */
    <div
      ref={outerWrapperRef}
      className="relative w-full bg-[#070707]"
      style={{ height: `calc(100vh + ${totalExtraScroll}px)` }}
    >
      {/* 
       * Sticky Viewport Container:
       * Sticks naturally to top: 0 for the entire duration of the outer wrapper scroll.
       */}
      <div
        ref={stickyContainerRef}
        className="sticky top-0 w-full h-screen overflow-hidden bg-[#070707] text-white select-none font-[family-name:var(--font-familjen)]"
      >
        {/* ------------------------------------------------------------- */}
        {/* FOREGROUND SLIDING TRACK (300vw: Gallery + Overview + A.I.)   */}
        {/* ------------------------------------------------------------- */}
        <div
          ref={foregroundTrackRef}
          className="absolute inset-0 z-20 w-[300vw] h-full flex will-change-transform"
        >
          {/* ============================================================= */}
          {/* PANEL 1 (100vw): THE GALLERY SHOWCASE                         */}
          {/* ============================================================= */}
          <div className="relative w-[100vw] h-full shrink-0 overflow-hidden bg-[#070707] text-white">
            {/* Fullscreen Background Images (Cross-fades on activeIndex) */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
              {PROJECTS.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-out"
                  style={{
                    opacity: idx === activeIndex ? 1 : 0,
                    willChange: "opacity",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover select-none transform scale-105 transition-transform duration-1000 ease-out"
                    loading="eager"
                  />
                </div>
              ))}

              {/* Subtle Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-black/5 to-black/5 pointer-events-none" />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </div>

            {/* Top-Left Editorial Project Title & Subtitle */}
            <div className="absolute top-14 left-8 md:top-18 md:left-10 z-20 pointer-events-none max-w-3xl transition-all duration-500 mix-blend-difference">
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[0.93] mix-blend-difference">
                {activeProject.title}
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-white max-w-xl mt-4 font-normal leading-relaxed mix-blend-difference">
                {activeProject.subtitle}
              </p>
            </div>

            {/* Bottom-Right Dock of Preview Cards (5 visible cards, clamped) */}
            <div
              ref={dockContainerRef}
              className="absolute bottom-6 md:bottom-5 right-6 md:right-16 z-20 overflow-hidden select-none pointer-events-auto w-[calc(100vw-3rem)] md:w-[889px] pt-3.5 pb-2 px-2 rounded-2xl"
              onPointerDown={(e) => {
                isDraggingRef.current = true;
                hasDraggedRef.current = false;
                dragStartXRef.current = e.clientX;
                dragStartScrollTopRef.current = window.scrollY;
              }}
              onPointerMove={(e) => {
                if (!isDraggingRef.current) return;
                const deltaX = e.clientX - dragStartXRef.current;
                if (Math.abs(deltaX) > 6) {
                  hasDraggedRef.current = true;
                  const scrollRatio = 5;
                  window.scrollTo({
                    top: dragStartScrollTopRef.current - deltaX * scrollRatio,
                  });
                }
              }}
              onPointerUp={() => {
                isDraggingRef.current = false;
              }}
              onPointerCancel={() => {
                isDraggingRef.current = false;
              }}
            >
              {/* The Horizontal Sliding Track */}
              <div
                ref={cardTrackRef}
                className="flex items-center gap-[10px] md:gap-[12px] w-max will-change-transform py-2"
              >
                {PROJECTS.map((proj, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        if (hasDraggedRef.current) return;
                        scrollToSlide(idx);
                      }}
                      className={`group relative shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ease-out will-change-transform w-[135px] md:w-[165px] h-[190px] md:h-[215px] ${isActive
                        ? "ring-2 ring-white scale-100 -translate-y-1.5 z-10"
                        : "ring-1 ring-white/20 scale-[0.93] hover:ring-white/40"
                        }`}
                      style={{
                        backgroundColor: "#121214",
                      }}
                    >
                      {/* Card Thumbnail Image */}
                      <div className="relative w-full h-full overflow-hidden bg-neutral-900 pointer-events-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proj.image}
                          alt={proj.title}
                          draggable={false}
                          className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* PANEL 2 (100vw): THE OVERVIEW / DISCOVER PANEL                 */}
          {/* ============================================================= */}
          <div className="relative w-[100vw] h-full shrink-0 flex flex-col justify-between p-8 md:p-16 bg-[#FAFAFA] text-[#111] overflow-hidden">

            {/* Center Statement with 4 Animated Lines in 3D perspective */}
            <div className="my-auto w-full mx-auto flex flex-col justify-center items-center text-center py-10 overflow-visible [perspective:1200px]">
              <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold uppercase tracking-tight leading-[1.15] text-[#111] mb-10 flex flex-col items-center [transform-style:preserve-3d] overflow-visible">
                <span ref={overviewLine1Ref} className="block whitespace-nowrap will-change-transform">
                  Discover our complete
                </span>
                <span ref={overviewLine2Ref} className="block whitespace-nowrap will-change-transform">
                  collection of digital
                </span>
                <span ref={overviewLine3Ref} className="block whitespace-nowrap will-change-transform">
                  experiences, brands, and
                </span>
                <span ref={overviewLine4Ref} className="block whitespace-nowrap will-change-transform">
                  platforms.
                </span>
              </h3>
              <TransitionLink
                ref={overviewCtaRef}
                href="/work"
                className="font-mono text-xs uppercase tracking-widest text-neutral-900 border-b border-black/40 pb-1 hover:border-black transition-colors no-underline inline-flex items-center gap-2 group will-change-transform"
              >
                VIEW ALL PROJECTS
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </TransitionLink>
            </div>
          </div>

          {/* ============================================================= */}
          {/* PANEL 3 (100vw): THE A.I. DESIGN DEVELOPMENT BRANDING PANEL     */}
          {/* ============================================================= */}
          <div
            ref={aiPanelRef}
            className="relative w-[100vw] h-full shrink-0 flex flex-col justify-center items-center p-8 md:p-16 bg-[#FFFFFF] text-[#111] overflow-hidden"
          >
            {/* Interactive Mouse Image Trail behind text */}
            <MouseImageTrail
              images={PROJECTS.map((p) => p.image)}
              containerRef={aiPanelRef}
              distanceThreshold={65}
              maxImages={6}
              imageWidth={190}
              imageHeight={250}
            />

            <div className="relative z-20 w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center py-10 pointer-events-none">
              <div className="flex flex-col items-center space-y-1 md:space-y-0 leading-[0.88] tracking-tighter font-normal select-none">
                <h2
                  ref={aiLine1Ref}
                  className="text-6xl sm:text-8xl md:text-9xl lg:text-[7rem] uppercase text-[#111111] transition-transform duration-300 hover:scale-[1.02] cursor-default will-change-transform"
                >
                  A.I.
                </h2>
                <h2
                  ref={aiLine2Ref}
                  className="text-6xl sm:text-8xl md:text-9xl lg:text-[7rem] uppercase text-[#111111] transition-transform duration-300 hover:scale-[1.02] cursor-default will-change-transform"
                >
                  DESIGN
                </h2>
                <h2
                  ref={aiLine3Ref}
                  className="text-6xl sm:text-8xl md:text-9xl lg:text-[7rem] uppercase text-[#111111] transition-transform duration-300 hover:scale-[1.02] cursor-default will-change-transform"
                >
                  DEVELOPMENT
                </h2>
                <h2
                  ref={aiLine4Ref}
                  className="text-6xl sm:text-8xl md:text-9xl lg:text-[7rem] uppercase text-[#111111] transition-transform duration-300 hover:scale-[1.02] cursor-default will-change-transform"
                >
                  BRANDING
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
