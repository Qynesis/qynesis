"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import { ArrowUpRight } from "lucide-react";
import FocusInContractText from "@/components/reuseable/FocusInContractText";
import curvedRibbonGallery, { CurvedRibbonController } from "@/components/reuseable/curvedRibbonGallery";
import { PROJECTS, ProjectData } from "@/data/projects";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";

export { PROJECTS, type ProjectData, TEAM_MEMBERS, type TeamMember };

const GALLERY_PROJECTS = PROJECTS.slice(0, 3);
const SIX_PROJECTS = PROJECTS.slice(0, 6);

export default function GallerySection() {
  const outerWrapperRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const foregroundTrackRef = useRef<HTMLDivElement>(null);
  const dockContainerRef = useRef<HTMLDivElement>(null);
  const cardTrackRef = useRef<HTMLDivElement>(null);

  // Discover Section Refs
  const editorialTextRef = useRef<HTMLDivElement>(null);
  const designLineRef = useRef<HTMLDivElement>(null);
  const motionLineRef = useRef<HTMLDivElement>(null);
  const helixCanvasRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const gridCardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const gridButtonRef = useRef<HTMLDivElement>(null);
  const helixControllerRef = useRef<CurvedRibbonController | null>(null);

  gridCardRefs.current = [];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Scroll distribution
  const projectsScrollDistance = 2400; // 3 projects in gallery
  const overviewSlideDistance = 1400;  // transition to discover panel
  const helixScrollDistance = 3400;    // 3D spiral ascends from bottom to top
  const gridRevealDistance = 2200;     // 6 projects fly in from every corner

  const totalExtraScroll =
    projectsScrollDistance +
    overviewSlideDistance +
    helixScrollDistance +
    gridRevealDistance;

  const scrollToSlide = useCallback(
    (index: number) => {
      const outer = outerWrapperRef.current;
      if (!outer) return;
      const clamped = Math.max(0, Math.min(GALLERY_PROJECTS.length - 1, index));
      const targetScroll =
        outer.offsetTop + (clamped / (GALLERY_PROJECTS.length - 1)) * projectsScrollDistance;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    },
    [projectsScrollDistance]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    // Initialize WebGL Curved Ribbon Gallery in Discover slide
    if (helixCanvasRef.current) {
      const imageElements: HTMLImageElement[] = SIX_PROJECTS.map((p) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = p.image;
        return img;
      });

      try {
        const controller = curvedRibbonGallery({
          element: helixCanvasRef.current,
          images: {
            elements: imageElements,
            width: 330,
            aspectRatio: 16 / 10,
            borderRadius: 16,
          },
          gap: 32,
          dividers: true,
          perspective: 1250,
          drag: false,
          scroll: false,
          y: 160,
          z: 540,
          backCardVisible: true,
          theme: "dark",
        });

        controller.seek(0);
        helixControllerRef.current = controller;
      } catch (err) {
        console.error("Helix initialization error:", err);
      }
    }

    const ctx = gsap.context(() => {
      const outer = outerWrapperRef.current;
      const sticky = stickyContainerRef.current;
      const foregroundTrack = foregroundTrackRef.current;
      const dock = dockContainerRef.current;
      const cardTrack = cardTrackRef.current;

      if (!outer || !sticky || !foregroundTrack || !dock || !cardTrack) return;

      const computeMaxShift = () => {
        if (!dock || !cardTrack) return 0;
        const cs = window.getComputedStyle(dock);
        const pl = parseFloat(cs.paddingLeft) || 0;
        const pr = parseFloat(cs.paddingRight) || 0;
        return Math.max(0, cardTrack.scrollWidth - (dock.clientWidth - pl - pr));
      };

      const projectsDuration = 6;
      const slideDuration = 3;
      const helixDuration = 8;

      // 6 corners flight direction vectors matching TRIONN
      const flyDirections = [
        { x: -950, y: -620, rotate: -14 }, // Card 0: Top-Left
        { x: 0,    y: -850, rotate: 0 },   // Card 1: Top-Center
        { x: 950,  y: -620, rotate: 14 },  // Card 2: Top-Right
        { x: -950, y: 620,  rotate: 10 },  // Card 3: Bottom-Left
        { x: 0,    y: 850,  rotate: 0 },   // Card 4: Bottom-Center
        { x: 950,  y: 620,  rotate: -10 }, // Card 5: Bottom-Right
      ];

      // Set initial off-screen positions for cards before they fly in
      gridCardRefs.current.forEach((cardEl, idx) => {
        if (!cardEl) return;
        const dir = flyDirections[idx] || flyDirections[0];
        gsap.set(cardEl, {
          x: dir.x,
          y: dir.y,
          rotation: dir.rotate,
          scale: 0.82,
          opacity: 0,
        });
      });

      if (gridButtonRef.current) {
        gsap.set(gridButtonRef.current, { opacity: 0, y: 25, scale: 0.95 });
      }

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

      // PHASE 1: 3 PROJECTS IN GALLERY DOCK
      tl.to(cardTrack, { x: () => -computeMaxShift(), ease: "none", duration: projectsDuration }, 0);
      tl.to(
        { p: 0 },
        {
          p: 1,
          ease: "none",
          duration: projectsDuration,
          onUpdate: function () {
            const progress = this.targets()[0].p;
            const raw = Math.round(progress * (GALLERY_PROJECTS.length - 1));
            const idx = Math.max(0, Math.min(GALLERY_PROJECTS.length - 1, raw));
            if (idx !== activeIndexRef.current) {
              activeIndexRef.current = idx;
              setActiveIndex(idx);
            }
          },
        },
        0
      );

      // PHASE 2: GALLERY -> DISCOVER PANEL HORIZONTAL SLIDE
      tl.to(foregroundTrack, { xPercent: -50, ease: "power2.inOut", duration: slideDuration }, projectsDuration);

      // PARALLAX TEXT TRAVEL IN OPPOSING DIRECTIONS: FULL OUTSIDE VIEWPORT -> FULL OUTSIDE VIEWPORT
      const textTravelStart = projectsDuration;
      const textTravelDuration = slideDuration + helixDuration * 0.85;

      const getDesignOffscreen = () => {
        const width = designLineRef.current?.offsetWidth || window.innerWidth * 0.6;
        return (window.innerWidth + width) / 2 + 100;
      };

      const getMotionOffscreen = () => {
        const width = motionLineRef.current?.offsetWidth || window.innerWidth * 0.6;
        return (window.innerWidth + width) / 2 + 100;
      };

      if (designLineRef.current) {
        tl.fromTo(
          designLineRef.current,
          { x: () => -getDesignOffscreen() },
          {
            x: () => getDesignOffscreen(),
            ease: "none",
            duration: textTravelDuration,
          },
          textTravelStart
        );
      }

      if (motionLineRef.current) {
        tl.fromTo(
          motionLineRef.current,
          { x: () => getMotionOffscreen() },
          {
            x: () => -getMotionOffscreen(),
            ease: "none",
            duration: textTravelDuration,
          },
          textTravelStart
        );
      }

      // PHASE 3: HELIX SPIRAL ASCENDS FROM BOTTOM TO TOP ON SCROLL
      const helixStartTime = projectsDuration + slideDuration * 0.75;
      const helixProgressObj = { p: 0 };

      tl.to(
        helixProgressObj,
        {
          p: 1.0,
          ease: "none",
          duration: helixDuration,
          onUpdate: function () {
            helixControllerRef.current?.seek(helixProgressObj.p);
          },
        },
        helixStartTime
      );

      // PHASE 4: WHEN HELIX IS COMPLETE -> CARDS FLY IN FROM MULTIPLE CORNERS
      const revealStartTime = helixStartTime + helixDuration * 0.85;

      // 1. Helix canvas fades out
      if (helixCanvasRef.current) {
        tl.to(
          helixCanvasRef.current,
          { opacity: 0, scale: 1.06, ease: "power2.inOut", duration: 1.8 },
          revealStartTime
        );
      }

      // 2. "DESIGN IN MOTION" text fades out completely
      if (editorialTextRef.current) {
        tl.to(
          editorialTextRef.current,
          { opacity: 0, scale: 0.94, ease: "power2.in", duration: 1.4 },
          revealStartTime
        );
      }

      // 3. Make grid container active
      if (gridContainerRef.current) {
        tl.set(gridContainerRef.current, { opacity: 1 }, revealStartTime);
      }

      // 4. Staggered flight of cards from every corner
      const cardFlyStagger = 0.55;
      const cardFlyDuration = 2.0;

      gridCardRefs.current.forEach((cardEl, idx) => {
        if (!cardEl) return;
        const dir = flyDirections[idx] || flyDirections[0];
        tl.fromTo(
          cardEl,
          {
            x: dir.x,
            y: dir.y,
            rotation: dir.rotate,
            scale: 0.82,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            ease: "power3.out",
            duration: cardFlyDuration,
          },
          revealStartTime + 0.3 + idx * cardFlyStagger
        );
      });

      // 5. Button emerges under assembled 6 cards
      if (gridButtonRef.current) {
        tl.fromTo(
          gridButtonRef.current,
          { opacity: 0, y: 25, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 1.2 },
          revealStartTime + 0.3 + 6 * cardFlyStagger
        );
      }

      ScrollTrigger.refresh();
    }, outerWrapperRef);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    return () => {
      ctx.revert();
      if (helixControllerRef.current) {
        helixControllerRef.current.destroy();
        helixControllerRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [projectsScrollDistance, overviewSlideDistance, helixScrollDistance, gridRevealDistance]);

  const activeProject = GALLERY_PROJECTS[activeIndex] || GALLERY_PROJECTS[0];

  return (
    <div
      ref={outerWrapperRef}
      data-theme="dark"
      className="relative w-full bg-[#070707]"
      style={{ height: `calc(100vh + ${totalExtraScroll}px)` }}
    >
      <div
        ref={stickyContainerRef}
        data-theme="dark"
        className="sticky top-0 w-full h-screen overflow-hidden bg-[#070707] text-white select-none font-[family-name:var(--font-familjen)]"
      >
        <div
          ref={foregroundTrackRef}
          className="absolute inset-0 z-20 w-[200vw] h-full flex will-change-transform"
        >
          {/* SLIDE 1: GALLERY WITH 3 PROJECTS */}
          <div className="relative w-[100vw] h-full shrink-0 overflow-hidden bg-[#070707] text-white">
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
              {GALLERY_PROJECTS.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-out"
                  style={{ opacity: idx === activeIndex ? 1 : 0, willChange: "opacity" }}
                >
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover select-none transform scale-105 transition-transform duration-1000 ease-out"
                    loading="eager"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-black/20 pointer-events-none" />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </div>

            <div className="absolute top-14 left-8 md:top-18 md:left-10 z-20 pointer-events-none max-w-3xl transition-all duration-500 mix-blend-difference">
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[0.93] mix-blend-difference">
                {activeProject.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white max-w-xl mt-4 font-normal leading-relaxed mix-blend-difference">
                {activeProject.subtitle}
              </p>
            </div>

            {/* DOCK SHOWING 3 PROJECTS */}
            <div
              ref={dockContainerRef}
              className="absolute bottom-6 md:bottom-8 right-6 md:right-16 z-20 overflow-hidden select-none pointer-events-auto w-[calc(100vw-3rem)] md:w-auto pt-3.5 pb-2 px-2 rounded-2xl"
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
                  window.scrollTo({ top: dragStartScrollTopRef.current - deltaX * 4 });
                }
              }}
              onPointerUp={() => { isDraggingRef.current = false; }}
              onPointerCancel={() => { isDraggingRef.current = false; }}
            >
              <div
                ref={cardTrackRef}
                className="flex items-center gap-[10px] md:gap-[14px] w-max will-change-transform py-2"
              >
                {GALLERY_PROJECTS.map((proj, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => { if (hasDraggedRef.current) return; scrollToSlide(idx); }}
                      className={`group relative shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ease-out will-change-transform w-[135px] md:w-[165px] h-[190px] md:h-[215px] ${isActive ? "ring-2 ring-white scale-100 -translate-y-1.5 z-10" : "ring-1 ring-white/20 scale-[0.93] hover:ring-white/40"}`}
                      style={{ backgroundColor: "#121214" }}
                    >
                      <div className="relative w-full h-full overflow-hidden bg-neutral-900 pointer-events-none">
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

          {/* SLIDE 2: DISCOVER WITH 3D HELIX & 6 PROJECTS IN CENTER */}
          <div
            data-theme="dark"
            className="relative w-[100vw] h-full shrink-0 bg-transparent text-white overflow-hidden select-none font-[family-name:var(--font-familjen)]"
          >
            {/* LAYER 1: EDITORIAL TYPOGRAPHY ("DESIGN" / "MOTION") TRAVELING OUTSIDE TO OUTSIDE */}
            <div
              ref={editorialTextRef}
              className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center items-center overflow-hidden will-change-transform select-none"
            >
              <div className="w-full flex flex-col items-center justify-center space-y-2 sm:space-y-4 md:space-y-6">
                {/* Line 1: DESIGN - starts outside left, traverses across, exits outside right */}
                <div
                  ref={designLineRef}
                  className="w-full flex justify-center will-change-transform"
                >
                  <h2 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[14rem] xl:text-[17rem] font-bold tracking-tighter text-white/85 leading-[0.84] uppercase whitespace-nowrap select-none">
                    DESIGN
                  </h2>
                </div>

                {/* Line 2: MOTION - starts outside right, traverses across, exits outside left */}
                <div
                  ref={motionLineRef}
                  className="w-full flex justify-center will-change-transform"
                >
                  <h2 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[14rem] xl:text-[17rem] font-bold tracking-tighter text-white/85 leading-[0.84] uppercase whitespace-nowrap select-none">
                    MOTION
                  </h2>
                </div>
              </div>
            </div>

            {/* LAYER 2: 3D HELIX CURVED RIBBON WEBGL CANVAS CONTAINER */}
            <div
              ref={helixCanvasRef}
              className="absolute inset-0 z-20 w-full h-full pointer-events-none will-change-transform"
            />

            {/* LAYER 3: 6 PROJECTS CENTERED GRID (APPEARS WHEN HELIX CIRCLE IS COMPLETE) */}
            <div
              ref={gridContainerRef}
              className="absolute inset-0 z-30 w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pointer-events-auto opacity-0 will-change-transform"
            >
              <div className="w-full max-w-[1440px] mx-auto flex flex-col items-center">
                {/* 3x2 Grid: Team Members */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full">
                  {TEAM_MEMBERS.map((member, idx) => (
                    <TransitionLink
                      key={member.id}
                      ref={(el) => {
                        if (el) gridCardRefs.current[idx] = el;
                      }}
                      href="/about"
                      className="group relative block w-full aspect-[16/10] rounded-md overflow-hidden shadow-lg bg-neutral-900 transition-shadow duration-500 hover:shadow-2xl hover:-translate-y-1 will-change-transform"
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
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

                {/* UNDERLINED ACTION BUTTON WITH ARROW & HOVER EFFECT */}
                <div ref={gridButtonRef} className="mt-8 md:mt-10 will-change-transform">
                  <TransitionLink
                    href="/about"
                    onMouseEnter={() => setIsBtnHovered(true)}
                    onMouseLeave={() => setIsBtnHovered(false)}
                    className="group inline-flex items-center gap-2 border-b border-white/30 hover:border-white pb-1 transition-all duration-300 no-underline text-white text-sm sm:text-base uppercase tracking-widest font-normal cursor-pointer select-none"
                  >
                    <FocusInContractText isHovered={isBtnHovered} as="span" duration={0.4}>
                      MEET THE ENTIRE TEAM
                    </FocusInContractText>
                    <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-white" />
                  </TransitionLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}