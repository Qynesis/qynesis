"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ServicesSection from "./ServicesSection";

const projectSlides = [
  {
    id: "01",
    tag: "BRAND IDENTITY & SYSTEM",
    title: "Project Alpha",
    subtitle: "Digital Transformation & Experience Strategy",
    bg: "bg-[#0a0a0a]",
    textColor: "text-white",
    borderColor: "border-white/10",
  },
  {
    id: "02",
    tag: "FINTECH & PLATFORM",
    title: "Project Beta",
    subtitle: "High-Performance Institutional Trading",
    bg: "bg-[#0a0a0a]",
    textColor: "text-white",
    borderColor: "border-white/10",
  },
  {
    id: "03",
    tag: "AI & COMPUTATIONAL",
    title: "Project Gamma",
    subtitle: "Autonomous Creative & Design Engineering",
    bg: "bg-[#0a0a0a]",
    textColor: "text-white",
    borderColor: "border-white/10",
  },
  {
    id: "04",
    tag: "ECOMMERCE & LUXURY",
    title: "Project Delta",
    subtitle: "Global Direct-to-Consumer Brand Store",
    bg: "bg-[#0a0a0a]",
    textColor: "text-white",
    borderColor: "border-white/10",
  },
];

export default function ProjectsHorizontalSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const projectsOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent execution during Next.js Server-Side Rendering (SSR)
    if (typeof window === "undefined") return;

    // Register GSAP's ScrollTrigger plugin for scroll-based timeline binding
    gsap.registerPlugin(ScrollTrigger);

    // gsap.context scopes all selectors and animations, allowing clean disposal on unmount
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      const track = trackRef.current;
      const overlay = projectsOverlayRef.current;

      // Guard check: Exit early if DOM refs are not yet mounted
      if (!container || !track || !overlay) return;

      // Query all project slide panels into a typed array (4 projects + 1 overview panel = 5 total)
      const slides = gsap.utils.toArray<HTMLElement>(".project-slide");
      const totalPanels = slides.length;

      // Independent Scroll Distance Calibration:
      // Projects 1-4 + Overview get 2.2x viewport width each for relaxed, luxurious horizontal scrolling.
      // The final curtain reveal of Services takes strictly 450px (~4 to 5 scroll clicks), then unpins immediately!
      const projectSlideMultiplier = 2.2;
      const projectsScrollDistance = window.innerWidth * (totalPanels - 1) * projectSlideMultiplier;
      const servicesRevealDistance = 450; // Exactly 4-5 scrolls to unveil Services and release
      const totalScrollPixels = projectsScrollDistance + servicesRevealDistance;

      // Calculate exact timeline ratios so physical scroll distance matches animation 1:1
      const projectsDuration = 10;
      const servicesDuration = (servicesRevealDistance / projectsScrollDistance) * projectsDuration;
      const totalDuration = projectsDuration + servicesDuration;

      // Master ScrollTrigger Timeline:
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${totalScrollPixels}`,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ----------------------------------------------------------------------------------
      // STEP 1: Initial Stationary Pause / Hold Buffer
      // ----------------------------------------------------------------------------------
      tl.to({}, { duration: 0.2 });

      // ----------------------------------------------------------------------------------
      // STEP 2: Pure GPU Hardware-Accelerated Track Translation
      // ----------------------------------------------------------------------------------
      // Phase 2a: Smoothly slide through all 4 projects onto Overview (lasts the entire projects scroll)
      tl.to(track, {
        xPercent: -100 * (totalPanels - 1),
        ease: "none",
        duration: projectsDuration,
        force3D: true,
      });

      // Phase 2b: Move the overview panel off to reveal Services (takes strictly 4-5 scrolls, then unpins!)
      tl.to(track, {
        xPercent: -100 * totalPanels,
        ease: "none",
        duration: servicesDuration,
        force3D: true,
      });

      // ----------------------------------------------------------------------------------
      // STEP 3: Dynamic Entrance & Parallax Animations for Each Slide
      // ----------------------------------------------------------------------------------
      // Loops through each project slide to animate its media canvas, title, and subtitle
      // as they glide into view from the right, preventing elements from feeling rigid or static.
      slides.forEach((slide, i) => {
        const title = slide.querySelector(".project-title");
        const subtitle = slide.querySelector(".project-subtitle");
        const media = slide.querySelector(".project-media");

        if (title && media) {
          // Skip slide 0 (already in view on load) and slide 5 (overview slide has its own styling)
          if (i > 0 && i < totalPanels - 1) {
            // Calculates when slide i reaches the right edge of viewport, accounting for initial pause
            const entryStart = 0.2 + Math.max(0, i - 0.9) * 2;

            // Media Canvas Parallax: Enters slightly scaled down (0.88), shifted down (+30px),
            // then expands to 1.0 scale and rises to y: 0 at full opacity as it reaches center screen.
            tl.fromTo(
              media,
              { scale: 0.88, y: 30, opacity: 0.6 },
              { scale: 1, y: 0, opacity: 1, ease: "power1.out", duration: 1.4 },
              entryStart
            );

            // Title Parallax: Slides in from the right (+50px) with smooth deceleration
            tl.fromTo(
              title,
              { x: 50, opacity: 0.4 },
              { x: 0, opacity: 1, ease: "power1.out", duration: 1.1 },
              entryStart + 0.15                       // Staggered 0.15s after media
            );

            // Subtitle Parallax: Follows the title with subtle horizontal glide (+30px)
            if (subtitle) {
              tl.fromTo(
                subtitle,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, ease: "power1.out", duration: 1.1 },
                entryStart + 0.25                     // Staggered 0.25s after media
              );
            }
          }
        }
      });

      // Recalculate ScrollTrigger metrics after all tweens have been attached
      ScrollTrigger.refresh();
    }, containerRef);

    // Cleanup function: Reverts and kills all animations and ScrollTriggers on component unmount
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden font-[family-name:var(--font-familjen)] select-none bg-[#0a0a0a]"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. UNDERLYING STICKY SERVICES SECTION (DEDICATED COMPONENT)   */}
      {/* ------------------------------------------------------------- */}
      <ServicesSection />

      {/* ------------------------------------------------------------- */}
      {/* 2. FOREGROUND PROJECTS OVERLAY (SLIDES OFF TO THE LEFT)       */}
      {/* ------------------------------------------------------------- */}
      <div
        ref={projectsOverlayRef}
        className="absolute inset-0 z-20 w-full h-full overflow-hidden pointer-events-auto"
      >
        {/* 5-Slide Horizontal Track (4 Projects + 1 Discover Transition Slide) */}
        <div
          ref={trackRef}
          className="relative flex h-full w-[500vw] bg-[#0a0a0a] will-change-transform"
        >
          {/* Slides 1-4: The Project Showcase Cards */}
          {projectSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`project-slide w-[100vw] shrink-0 h-full flex flex-col justify-between p-8 md:p-16 relative ${slide.bg} will-change-transform text-white`}
            >
              <div className="my-auto w-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center py-10">
                <h3 className="project-title text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal tracking-tight leading-none mb-6 will-change-transform">
                  {slide.title}
                </h3>
                <p className="project-subtitle text-lg sm:text-xl md:text-2xl text-neutral-400 max-w-2xl font-normal will-change-transform">
                  {slide.subtitle}
                </p>

                <div className="project-media mt-10 w-full max-w-3xl h-64 sm:h-80 md:h-96 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center relative overflow-hidden group will-change-transform">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                    [ PROJECT {slide.id} MEDIA CANVAS ]
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                  SCROLL TO EXPLORE
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                  0{idx + 1}
                </span>
              </div>
            </div>
          ))}

          {/* Slide 5: The "Discover Our Complete Collection" Transition Panel (Matches Reference) */}
          <div
            className="project-slide w-[100vw] shrink-0 h-full flex flex-col justify-between p-8 md:p-16 relative bg-[#EAE9E5] text-[#111111] will-change-transform"
            data-theme="light"
          >
            <div className="flex items-center justify-between pt-12 md:pt-10">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                OVERVIEW
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-600 border border-black/10 px-3 py-1 rounded-full">
                ARCHIVE
              </span>
            </div>

            <div className="my-auto w-full max-w-3xl mx-auto flex flex-col justify-center items-center text-center py-10">
              <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.12] text-[#111] mb-8">
                Discover our complete collection of digital experiences, brands, and platforms.
              </h3>
              <a
                href="/services"
                className="font-mono text-xs uppercase tracking-widest text-neutral-900 border-b border-black/40 pb-1 hover:border-black transition-colors no-underline inline-flex items-center gap-2 group"
              >
                VIEW ALL PROJECTS
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
            </div>

            <div className="flex items-center justify-between border-t border-black/10 pt-4">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                KEEP SCROLLING FOR SERVICES
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-600">
                &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
