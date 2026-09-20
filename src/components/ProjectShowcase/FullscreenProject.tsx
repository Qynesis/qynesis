"use client";

import React, { forwardRef, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Project } from "./types";
import { ArrowLeft, ArrowRight, ArrowDown, X } from "lucide-react";

interface FullscreenProjectProps {
  projects: Project[];
  activeProject: number;
  imageRef: React.RefObject<HTMLImageElement | null>;
  uiRef: React.RefObject<HTMLDivElement | null>;
  titleRef: React.RefObject<HTMLDivElement | null>;
  indexRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectThumb: (index: number) => void;
}

interface EdgeCardProps {
  side: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

function EdgeCard({ side, children, className = "" }: EdgeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"below" | "visible" | "above">("below");

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const scrollContainer = el.closest("[data-lenis-prevent]") as HTMLElement | null;

    const checkPosition = () => {
      const rect = el.getBoundingClientRect();
      const H = typeof window !== "undefined" ? window.innerHeight : 800;

      // Only disappear when the card has actually scrolled off the top of the screen
      if (rect.bottom < 40) {
        setState("above");
      } else if (rect.top > H - 20) {
        setState("below");
      } else {
        setState("visible");
      }
    };

    checkPosition();

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkPosition, { passive: true });
    }
    window.addEventListener("scroll", checkPosition, { passive: true });
    window.addEventListener("resize", checkPosition, { passive: true });

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkPosition);
      }
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, []);

  const isVisible = state === "visible";
  const isAbove = state === "above";

  return (
    <div
      ref={cardRef}
      style={{
        transform: isVisible
          ? "translate3d(0, 0, 0)"
          : isAbove
            ? "translate3d(0, -90px, 0) scale(0.95)"
            : side === "left"
              ? "translate3d(-140px, 40px, 0)"
              : "translate3d(140px, 40px, 0)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transition:
          "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out",
      }}
      className={`rounded-2xl border border-white/20 bg-black/20 backdrop-blur-md p-7 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.85)] text-white hover:border-white/45 transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export const FullscreenProject = forwardRef<HTMLDivElement, FullscreenProjectProps>(
  (
    {
      projects,
      activeProject,
      imageRef,
      uiRef,
      titleRef,
      indexRef,
      onClose,
      onPrev,
      onNext,
      onSelectThumb,
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const [titleFade, setTitleFade] = useState(0);
    const current = activeProject >= 0 ? projects[activeProject] : null;

    useEffect(() => {
      setMounted(true);
    }, []);
    const nextIdx =
      activeProject >= 0 ? (activeProject + 1) % projects.length : 0;
    const nextProject = projects[nextIdx];

    const bottomCountRef = useRef(0);
    const bottomTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastBottomGestureTimeRef = useRef(0);
    const transitioningRef = useRef(false);

    // Reset scroll and states when active project changes
    useEffect(() => {
      const el =
        typeof ref === "function"
          ? null
          : (ref as React.RefObject<HTMLDivElement | null>)?.current;
      if (el) {
        el.scrollTop = 0;
      }
      setTitleFade(0);
      bottomCountRef.current = 0;
      transitioningRef.current = false;
    }, [activeProject, ref]);

    // Smooth scroll handler to adjust center title opacity as cards rise past it
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const top = e.currentTarget.scrollTop;
      const H = typeof window !== "undefined" ? window.innerHeight : 800;
      const progress = Math.min(1, Math.max(0, top / (H * 0.7)));
      setTitleFade(progress);
    }, []);

    // Kinetic Smooth Wheel Scroll Engine + 2-Scroll Next Page Detection
    useEffect(() => {
      if (activeProject < 0) return;

      const el =
        typeof ref === "function"
          ? null
          : (ref as React.RefObject<HTMLDivElement | null>)?.current;
      if (!el) return;

      let targetScroll = el.scrollTop;
      let currentScroll = el.scrollTop;
      let animating = false;
      let rafId: number;

      const smoothScrollLoop = () => {
        currentScroll += (targetScroll - currentScroll) * 0.14;
        el.scrollTop = currentScroll;

        if (Math.abs(targetScroll - currentScroll) > 0.5) {
          rafId = requestAnimationFrame(smoothScrollLoop);
        } else {
          el.scrollTop = targetScroll;
          currentScroll = targetScroll;
          animating = false;
        }
      };

      const triggerAdvance = () => {
        if (transitioningRef.current) return;
        transitioningRef.current = true;
        bottomCountRef.current = 0;
        if (bottomTimerRef.current) clearTimeout(bottomTimerRef.current);

        onNext();

        setTimeout(() => {
          transitioningRef.current = false;
        }, 900);
      };

      const registerBottomScroll = () => {
        if (transitioningRef.current) return;
        const now = performance.now();
        // Require at least 280ms between distinct gestures so momentum doesn't fire both
        if (now - lastBottomGestureTimeRef.current < 280) return;
        lastBottomGestureTimeRef.current = now;

        bottomCountRef.current += 1;
        const count = bottomCountRef.current;

        if (bottomTimerRef.current) clearTimeout(bottomTimerRef.current);
        bottomTimerRef.current = setTimeout(() => {
          bottomCountRef.current = 0;
        }, 2500);

        // After two scrolls on bottom, advance to next project!
        if (count >= 2) {
          triggerAdvance();
        }
      };

      const resetBottomScroll = () => {
        if (bottomCountRef.current > 0) {
          bottomCountRef.current = 0;
          if (bottomTimerRef.current) clearTimeout(bottomTimerRef.current);
        }
      };

      const onWheel = (e: WheelEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (transitioningRef.current) return;

        const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
        const isAtBottom =
          targetScroll >= maxScroll - 30 || el.scrollTop >= maxScroll - 45;

        // When the full scroll is complete and user scrolls DOWN at the bottom
        if (isAtBottom && e.deltaY > 10) {
          registerBottomScroll();
          return;
        }

        // If scrolling up, reset bottom scroll counter
        if (e.deltaY < -8) {
          resetBottomScroll();
        }

        targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY * 1.15));

        if (!animating) {
          animating = true;
          rafId = requestAnimationFrame(smoothScrollLoop);
        }
      };

      let touchStartY = 0;
      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };

      const onTouchEnd = (e: TouchEvent) => {
        if (transitioningRef.current) return;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY; // positive = swipe up = scroll down
        const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
        const isAtBottom = el.scrollTop >= maxScroll - 50;

        if (isAtBottom && deltaY > 35) {
          registerBottomScroll();
        } else if (deltaY < -20) {
          resetBottomScroll();
        }
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (transitioningRef.current) return;
        if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
          const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
          const isAtBottom = el.scrollTop >= maxScroll - 50;
          if (isAtBottom) {
            registerBottomScroll();
          }
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
          resetBottomScroll();
        }
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("keydown", onKeyDown);

      return () => {
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("keydown", onKeyDown);
        cancelAnimationFrame(rafId);
      };
    }, [ref, activeProject, onNext]);

    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={current ? current.title : "Project Details"}
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        data-lenis-prevent-touch="true"
        onScroll={handleScroll}
        style={{ display: "none" }}
        className="fixed z-40 inset-0 overflow-y-auto overflow-x-hidden bg-[#080808] will-change-[left,top,width,height] text-white font-[family-name:var(--font-familjen)] selection:bg-white selection:text-black pointer-events-auto select-none"
      >
        {/* Hidden ref anchor so indexRef remains attached if referenced */}
        <div ref={indexRef} className="hidden" aria-hidden="true" />

        {/* ================================================================= */}
        {/* PINNED BACKGROUND IMAGE (STAYS LOCKED AS CARDS FLOAT OVER IT)     */}
        {/* ================================================================= */}
        <div className="sticky top-0 left-0 w-full h-screen pointer-events-none -mb-[100vh] z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={current ? current.image : ""}
            alt={current ? current.title : ""}
            className="w-full h-full object-cover block will-change-[object-position,opacity,transform] pointer-events-none select-none"
          />
          {/* Atmospheric gradient overlay for deep glass contrast */}
          {/* <div className="absolute inset-0 bg-black/45 backdrop-brightness-75 pointer-events-none" /> */}
        </div>

        {/* ================================================================= */}
        {/* PINNED CENTER TITLE (OPEN CENTER FOR MONOLITH / FORM / ETC.)      */}
        {/* ================================================================= */}
        <div
          className="sticky top-0 left-0 w-full h-screen pointer-events-none -mb-[100vh] z-10 flex flex-col items-center justify-center text-center px-6 transition-all duration-300"
          style={{
            opacity: 1 - titleFade * 0.55,
            transform: `scale(${1 - titleFade * 0.06}) translateY(${-titleFade * 25}px)`,
          }}
        >
          <div
            ref={uiRef}
            className="flex flex-col items-center justify-center opacity-0 pointer-events-none"
          >
            <div
              ref={titleRef}
              className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-none font-normal drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
            >
              {current?.title}
            </div>

            {current?.subtitle && (
              <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-xl text-center tracking-wide font-light drop-shadow-md">
                {current.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* FLOATING CONTROLS (PORTALED TO BODY: 100% IMMUNE TO SCROLLING)    */}
        {/* ================================================================= */}
        {mounted &&
          activeProject >= 0 &&
          createPortal(
            <div className="fixed inset-0 pointer-events-none z-[58]">
              {/* Close Control (Positioned safely below the fixed navbar) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close fullscreen project"
                className="fixed right-6 top-6 md:right-12 md:top-24 w-11 h-11 rounded-full border border-white/20 bg-black/70 backdrop-blur-md text-white flex items-center justify-center text-lg cursor-pointer pointer-events-auto transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 active:scale-95 shadow-2xl"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>

              {/* Previous Control */}
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous project"
                className="fixed left-4 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 bg-black/70 backdrop-blur-md text-white flex items-center justify-center text-base cursor-pointer pointer-events-auto transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 active:scale-95 shadow-2xl"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Next Control */}
              <button
                type="button"
                onClick={onNext}
                aria-label="Next project"
                className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/20 bg-black/70 backdrop-blur-md text-white flex items-center justify-center text-base cursor-pointer pointer-events-auto transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 active:scale-95 shadow-2xl"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>,
            document.body
          )}

        {/* ================================================================= */}
        {/* WIDE-SPLIT EDGE CARDS: PUSHED TO LEFT AND RIGHT EDGES (OPEN CENTER)*/}
        <div className="relative z-20 w-full pointer-events-auto">
          {/* Initial full-screen view: full project shows cleanly with zero cards visible initially */}
          <div className="h-screen w-full flex flex-col justify-end items-center pb-10 pointer-events-none">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-white/50 uppercase animate-bounce">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {current && (
            <div className="w-full px-6 md:px-20 lg:px-24 xl:px-28 pb-[100vh] pointer-events-auto">
              {/* Split container pushing cards to the screen edges with clearance from control buttons */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-0">
                {/* --------------------------------------------------------- */}
                {/* LEFT EDGE COLUMN: CLEAR OF LEFT ARROW BUTTON             */}
                {/* --------------------------------------------------------- */}
                <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[450px] flex flex-col gap-16 md:gap-28 md:pt-36">
                  {/* Left Card 1: Vision & Concept */}
                  <EdgeCard side="left">
                    <div className="space-y-4">
                      <blockquote className="text-xl sm:text-2xl font-light leading-relaxed tracking-tight text-white border-l-2 border-white/30 pl-4">
                        &ldquo;{current.overview}&rdquo;
                      </blockquote>
                      <p className="text-sm text-white leading-relaxed pt-1">
                        An architectural exploration in scale, light transmission, and monolithic presence, dissolving structural boundaries into interactive digital space.
                      </p>
                    </div>
                  </EdgeCard>

                  {/* Left Card 2: The Architectural Challenge */}
                  <EdgeCard side="left">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-normal tracking-tight text-white">
                        Pushing Volumetric Limits
                      </h3>
                      <p className="text-white text-sm md:text-base leading-relaxed">
                        {current.challenge ||
                          "Translating physical inertia and monumental presence into real-time interactive paradigms without performance degradation."}
                      </p>

                      {current.services && current.services.length > 0 && (
                        <div className="pt-4 border-t border-white/10 space-y-3">
                          <div className="text-[11px] font-mono uppercase tracking-widest text-white">
                            Disciplines & Capabilities
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {current.services.map((srv) => (
                              <span
                                key={srv}
                                className="px-3.5 py-1.5 rounded-full border border-white/15 bg-white/10 text-xs font-mono uppercase tracking-wider text-neutral-200"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </EdgeCard>
                </div>

                {/* --------------------------------------------------------- */}
                {/* RIGHT EDGE COLUMN: CLEAR OF RIGHT ARROW BUTTON            */}
                {/* --------------------------------------------------------- */}
                <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[450px] flex flex-col gap-16 md:gap-28 md:ml-auto">
                  {/* Right Card 1: Specifications & Metadata (Enters First) */}
                  <EdgeCard side="right">
                    <div className="space-y-6">
                      {/* Specs Grid */}
                      <div className="grid grid-cols-2 gap-5 border-b border-white/10 pb-6">
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono uppercase tracking-widest text-white">
                            Client
                          </div>
                          <div className="text-sm md:text-base font-medium text-neutral-200">
                            {current.client || "Self-Initiated"}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[11px] font-mono uppercase tracking-widest text-white">
                            Timeline
                          </div>
                          <div className="text-sm md:text-base font-medium text-white">
                            {current.year || "2025"}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[11px] font-mono uppercase tracking-widest text-white">
                            Category
                          </div>
                          <div className="text-sm md:text-base font-medium text-white">
                            {current.category || "Spatial Architecture"}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[11px] font-mono uppercase tracking-widest text-white">
                            Role
                          </div>
                          <div className="text-sm md:text-base font-medium text-white">
                            {current.role || "Lead Technologist"}
                          </div>
                        </div>
                      </div>

                      {/* Impact Metrics */}
                      {current.metrics && current.metrics.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {current.metrics.map((m) => (
                            <div
                              key={m.label}
                              className="p-3.5 rounded-lg bg-black/10 border border-white/10 text-center space-y-1"
                            >
                              <div className="text-lg md:text-xl font-mono font-medium text-white">
                                {m.value}
                              </div>
                              <div className="text-[12px] font-mono uppercase tracking-wider text-white">
                                {m.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </EdgeCard>

                  {/* Right Card 2: The Engineered Solution */}
                  <EdgeCard side="right">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-normal tracking-tight text-white">
                        Precision & Execution
                      </h3>
                      <p className="text-white text-sm md:text-base leading-relaxed">
                        {current.solution ||
                          "Architected a custom WebGL pipeline with adaptive LOD streaming, ensuring fluid rendering performance without fidelity loss."}
                      </p>
                      <div className="pt-2 text-xs font-mono text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        GPU accelerated · Non-blocking runtime buffers
                      </div>
                    </div>
                  </EdgeCard>

                  {/* Right Card 3: Next Project & Back to Showcase CTA */}
                  <EdgeCard side="right">
                    <div className="space-y-5">
                      <div className="text-xs font-mono uppercase tracking-widest text-white">
                        Explore Further
                      </div>

                      {nextProject && (
                        <div
                          onClick={() => onSelectThumb(nextIdx)}
                          className="flex items-center gap-4 p-4 rounded-xl border border-white/15 bg-black/50 hover:bg-white/10 hover:border-white/40 transition-all duration-300 cursor-pointer group"
                        >
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={nextProject.image}
                              alt={nextProject.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                              <span>Next Project</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div className="text-base font-medium text-white truncate">
                              {nextProject.title}
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 rounded-full border border-white/20 bg-white/10 text-xs font-mono uppercase tracking-widest text-neutral-300 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer text-center"
                      >
                        ← Back to Showcase Gallery
                      </button>
                    </div>
                  </EdgeCard>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

FullscreenProject.displayName = "FullscreenProject";
