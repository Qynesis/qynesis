"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import { ArrowUpRight, AudioWaveform, Cctv, Eraser, Mic, ScanText, Tags, type LucideIcon } from "lucide-react";
import FocusInContractText from "@/components/reuseable/FocusInContractText";
import curvedRibbonGallery, { CurvedRibbonController } from "@/components/reuseable/curvedRibbonGallery";
import { PROJECTS, ProjectData } from "@/data/projects";
import { TEAM_MEMBERS, TeamMember } from "@/data/team";
import { AI_CAPABILITIES, AI_HELIX_IMAGES } from "@/data/aiModels";
import { afterAppReady } from "@/lib/appReady";

export { PROJECTS, type ProjectData, TEAM_MEMBERS, type TeamMember };

const GALLERY_PROJECTS = PROJECTS.slice(0, 5);

// Icon per AI capability card (same order as AI_CAPABILITIES)
const AI_ICONS: LucideIcon[] = [ScanText, AudioWaveform, Cctv, Mic, Eraser, Tags];

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
  // Latest scroll progress of the helix phase, applied when the helix is created lazily
  const helixProgressRef = useRef(0);

  gridCardRefs.current = [];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isWorkBtnHovered, setIsWorkBtnHovered] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Scroll distribution
  const projectsScrollDistance = 3400; // 5 projects in gallery
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

    // Initialize the WebGL Curved Ribbon Gallery lazily: only once the intro has
    // finished and this section is within ~2 screens, so its shader compile and
    // image uploads never compete with the intro or the sections above.
    const createHelix = () => {
      if (!helixCanvasRef.current || helixControllerRef.current) return;
      const imageElements: HTMLImageElement[] = AI_HELIX_IMAGES.map((src) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.src = src;
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
          // Zoom the helix out on narrower screens so it fits (1:1 from 1300px up)
          fitWidth: 1300,
          minScale: 0.4,
          maxPixelRatio: 1.5,
        });

        controller.seek(helixProgressRef.current);
        helixControllerRef.current = controller;
      } catch (err) {
        console.error("Helix initialization error:", err);
      }
    };

    let cancelHelix: (() => void) | null = null;
    const helixNearObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || cancelHelix) return;
        helixNearObserver.disconnect();
        cancelHelix = afterAppReady(createHelix, { timeout: 400 });
      },
      { rootMargin: "200% 0px 200% 0px" }
    );
    if (outerWrapperRef.current) helixNearObserver.observe(outerWrapperRef.current);

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

      const projectsDuration = 9;
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
            helixProgressRef.current = helixProgressObj.p;
            helixControllerRef.current?.seek(helixProgressObj.p);
          },
        },
        helixStartTime
      );

      // PHASE 4: WHEN HELIX IS COMPLETE -> AI MODEL CARDS FLY IN FROM MULTIPLE CORNERS
      const revealStartTime = helixStartTime + helixDuration * 0.85;

      // 1. Helix canvas fades out
      if (helixCanvasRef.current) {
        tl.to(
          helixCanvasRef.current,
          { opacity: 0, scale: 1.06, ease: "power2.inOut", duration: 1.8 },
          revealStartTime
        );
      }

      // 2. "AI DEVELOPMENT" text fades out completely
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

      // 5. Button emerges under assembled 6 AI model cards
      if (gridButtonRef.current) {
        tl.fromTo(
          gridButtonRef.current,
          { opacity: 0, y: 25, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 1.2 },
          revealStartTime + 0.3 + 6 * cardFlyStagger
        );
      }

    }, outerWrapperRef);

    return () => {
      ctx.revert();
      helixNearObserver.disconnect();
      cancelHelix?.();
      if (helixControllerRef.current) {
        helixControllerRef.current.destroy();
        helixControllerRef.current = null;
      }
    };
  }, [projectsScrollDistance, overviewSlideDistance, helixScrollDistance, gridRevealDistance]);

  const activeProject = GALLERY_PROJECTS[activeIndex] || GALLERY_PROJECTS[0];

  return (
    <div
      ref={outerWrapperRef}
      data-theme="dark"
      className="relative w-full bg-transparent"
      style={{ height: `calc(100vh + ${totalExtraScroll}px)` }}
    >
      <div
        ref={stickyContainerRef}
        data-theme="dark"
        className="sticky top-0 w-full h-screen overflow-hidden bg-transparent text-white select-none font-[family-name:var(--font-familjen)]"
      >
        <div
          ref={foregroundTrackRef}
          className="absolute inset-0 z-20 w-[200vw] h-full flex will-change-transform"
        >
          {/* SLIDE 1: GALLERY WITH 5 PROJECTS */}
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
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-black/20 pointer-events-none" />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            </div>

            {/* No z-index here: a stacking context would isolate the inner blend from the images */}
            <div className="absolute top-28 left-8 md:left-10 lg:top-18 pointer-events-none max-w-3xl transition-all duration-500">
              <div className="mix-blend-difference">
                <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[0.93] mix-blend-difference">
                  {activeProject.title}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white max-w-xl mt-4 font-normal leading-relaxed mix-blend-difference">
                  {activeProject.subtitle}
                </p>
              </div>

              {/* SEE ALL OUR WORK — outside the blend so it reads the same over light and dark shots */}
              <TransitionLink
                href="/work"
                onMouseEnter={() => setIsWorkBtnHovered(true)}
                onMouseLeave={() => setIsWorkBtnHovered(false)}
                className="group relative mt-6 md:mt-8 inline-flex items-center gap-4 overflow-hidden rounded-full border border-white/30 bg-black/35 backdrop-blur-md py-1.5 pl-6 pr-1.5 text-xs sm:text-sm uppercase tracking-widest text-white no-underline pointer-events-auto cursor-pointer select-none shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-[color,border-color,box-shadow] duration-500 hover:border-white hover:text-black hover:shadow-[0_12px_40px_rgba(255,255,255,0.18)]"
              >
                {/* White fill sweeping in from the left */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 origin-left scale-x-0 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-x-100"
                />
                <span className="relative z-10">
                  <FocusInContractText isHovered={isWorkBtnHovered} as="span" duration={0.4}>
                    SEE ALL OUR WORK
                  </FocusInContractText>
                </span>
                {/* Arrow badge: arrow flies out top-right while a new one slides in */}
                <span className="relative z-10 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center overflow-hidden rounded-full bg-white text-black transition-colors duration-500 group-hover:bg-black group-hover:text-white">
                  <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-6 group-hover:-translate-y-6" />
                  <ArrowUpRight className="absolute size-4 -translate-x-6 translate-y-6 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0 group-hover:translate-y-0" />
                </span>
              </TransitionLink>
            </div>

            {/* DOCK SHOWING 5 PROJECTS */}
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

          {/* SLIDE 2: AI SHOWCASE — 3D HELIX, THEN 6 AI MODELS IN CENTER */}
          <div
            data-theme="dark"
            className="relative w-[100vw] h-full shrink-0 bg-transparent text-white overflow-hidden select-none font-[family-name:var(--font-familjen)]"
          >
            {/* LAYER 1: EDITORIAL TYPOGRAPHY ("AI" / "DEVELOPMENT") TRAVELING OUTSIDE TO OUTSIDE */}
            <div
              ref={editorialTextRef}
              className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center items-center overflow-hidden will-change-transform select-none"
            >
              {/* Lines sit apart with a caption between them so the helix rarely covers a whole word */}
              <div className="w-full flex flex-col items-center justify-center gap-16 sm:gap-20 md:gap-28 lg:gap-32">
                {/* Line 1: AI - starts outside left, traverses across, exits outside right */}
                <div
                  ref={designLineRef}
                  className="w-full flex justify-center will-change-transform"
                >
                  <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[9rem] font-medium tracking-tight text-white/90 leading-[0.9] uppercase whitespace-nowrap select-none">
                    AI
                  </h2>
                </div>

                {/* Line 2: DEVELOPMENT - starts outside right, traverses across, exits outside left */}
                <div
                  ref={motionLineRef}
                  className="w-full flex justify-center will-change-transform"
                >
                  <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[9rem] font-medium tracking-tight text-white/90 leading-[0.9] uppercase whitespace-nowrap select-none">
                    DEVELOPMENT
                  </h2>
                </div>
              </div>

              {/* Centre caption between the two lines */}
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max max-w-[80vw] text-center font-mono text-[11px] sm:text-xs uppercase tracking-widest leading-relaxed text-neutral-300">
                Building intelligent products
                <br />
                with custom AI models.
              </p>

              {/* Bottom-left context line */}
              <p className="absolute bottom-8 left-6 md:left-12 max-w-[260px] text-sm md:text-base leading-snug text-neutral-400">
                Vision, audio and language models we design, train and integrate into real websites and apps.
              </p>
            </div>

            {/* LAYER 2: 3D HELIX CURVED RIBBON WEBGL CANVAS CONTAINER */}
            <div
              ref={helixCanvasRef}
              className="absolute inset-0 z-20 w-full h-full pointer-events-none will-change-transform"
            />

            {/* LAYER 3: 6 AI MODELS CENTERED GRID (APPEARS WHEN HELIX CIRCLE IS COMPLETE) */}
            <div
              ref={gridContainerRef}
              className="absolute inset-0 z-30 w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pointer-events-auto opacity-0 will-change-transform"
            >
              <div className="w-full max-w-[1440px] mx-auto flex flex-col items-center">
                {/* 3x2 Grid (2x3 on phones so all six fit one screen): AI models we have built and integrated */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6 w-full">
                  {AI_CAPABILITIES.map((model, idx) => {
                    const Icon = AI_ICONS[idx] ?? Tags;
                    return (
                      <TransitionLink
                        key={model.id}
                        ref={(el) => {
                          if (el) gridCardRefs.current[idx] = el;
                        }}
                        href="/contact"
                        className="group relative block w-full aspect-[4/3] sm:aspect-[16/10] rounded-md overflow-hidden shadow-lg bg-neutral-900 transition-shadow duration-500 hover:shadow-2xl hover:-translate-y-1 will-change-transform"
                      >
                        <img
                          src={model.image}
                          alt={model.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                        {/* Task chip, Hugging Face style */}
                        <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 text-white pointer-events-none">
                          <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                          <span className="font-mono text-[10px] uppercase tracking-wider">{model.modality}</span>
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3.5 sm:left-4 sm:right-4 text-white pointer-events-none">
                          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-white/70 block truncate">
                            {model.task}
                          </span>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <h4 className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-white leading-tight">
                              {model.title}
                            </h4>
                            <span className="font-mono text-[10px] text-white/50 tracking-wider uppercase hidden sm:inline-block">
                              AI · {model.id}
                            </span>
                          </div>
                        </div>
                      </TransitionLink>
                    );
                  })}
                </div>

                {/* UNDERLINED ACTION BUTTON WITH ARROW & HOVER EFFECT */}
                <div ref={gridButtonRef} className="mt-6 sm:mt-8 md:mt-10 will-change-transform">
                  <TransitionLink
                    href="/contact"
                    onMouseEnter={() => setIsBtnHovered(true)}
                    onMouseLeave={() => setIsBtnHovered(false)}
                    className="group inline-flex items-center gap-2 border-b border-white/30 hover:border-white pb-1 transition-all duration-300 no-underline text-white text-sm sm:text-base uppercase tracking-widest font-normal cursor-pointer select-none"
                  >
                    <FocusInContractText isHovered={isBtnHovered} as="span" duration={0.4}>
                      BUILD YOUR AI MODEL WITH US
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