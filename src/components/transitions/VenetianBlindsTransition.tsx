"use client";

import React, { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface VenetianBlindsTransitionProps {
  /** The base section (background) visible initially */
  children?: ReactNode;
  /** The section that emerges from the bottom as the blinds close */
  overlay?: ReactNode;
  /** Number of blinds slats (defaults to 5) */
  slatCount?: number;
  /** Background color of the slats (defaults to #EAE9E5) */
  slatColor?: string;
  /** Stagger direction: "end" (bottom-to-top) or "start" (top-to-bottom) */
  staggerFrom?: "end" | "start" | "center" | "edges";
  /** How long the scroll pin lasts (defaults to "+=160%") */
  scrubDistance?: string;
  /** Optional container class name */
  className?: string;
  /** Delay within timeline when overlay starts rising (0 to 1, default 0.70) */
  overlayDelay?: number;
  /** Optional custom animation hook receiving the master timeline and context */
  onBuildTimeline?: (tl: gsap.core.Timeline, ctx: gsap.Context) => void;
}

export default function VenetianBlindsTransition({
  children,
  overlay,
  slatCount = 5,
  slatColor = "#EAE9E5",
  staggerFrom = "end",
  scrubDistance = "+=160%",
  className = "",
  overlayDelay = 0.7,
  onBuildTimeline,
}: VenetianBlindsTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blindsContainerRef = useRef<HTMLDivElement>(null);
  const overlayWrapperRef = useRef<HTMLDivElement>(null);
  const slatRefs = useRef<HTMLDivElement[]>([]);
  const onBuildTimelineRef = useRef(onBuildTimeline);

  // Keep latest callback ref without causing effect re-triggers
  useEffect(() => {
    onBuildTimelineRef.current = onBuildTimeline;
  });

  slatRefs.current = [];

  const addToSlatRefs = (el: HTMLDivElement | null) => {
    if (el && !slatRefs.current.includes(el)) {
      slatRefs.current.push(el);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    let masterTl: gsap.core.Timeline | null = null;

    const ctx = gsap.context(() => {
      if (!containerRef.current || slatRefs.current.length === 0) return;

      masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: scrubDistance,
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });

      // Step 1: Blinds close (scale from 0 to 1.05 for overlap prevention)
      masterTl.to(
        slatRefs.current,
        {
          scaleY: 1.05,
          stagger: {
            each: 0.08,
            from: staggerFrom,
          },
          duration: 1.0,
          ease: "power2.inOut",
        },
        0
      );

      // Step 2: Overlay emergence
      if (overlayWrapperRef.current) {
        masterTl.fromTo(
          overlayWrapperRef.current,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          overlayDelay
        );
      }
    }, containerRef);

    // Call onBuildTimeline in a microtask / next frame once child refs (overlay) are mounted
    const rafId = requestAnimationFrame(() => {
      if (masterTl && onBuildTimelineRef.current) {
        try {
          ctx.add(() => {
            if (masterTl && onBuildTimelineRef.current) {
              onBuildTimelineRef.current(masterTl, ctx);
            }
          });
        } catch (e) {
          console.error("Error in onBuildTimeline:", e);
        }
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [scrubDistance, staggerFrom, overlayDelay]);

  const slatHeightPercent = (100 / slatCount) + 0.5;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-screen overflow-hidden select-none ${className}`}
    >
      {/* BACKGROUND CONTENT LAYER */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* VENETIAN BLINDS CURTAIN WIPING SLATS */}
      <div
        ref={blindsContainerRef}
        className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between h-[calc(100%+4px)]"
        aria-hidden="true"
      >
        {Array.from({ length: slatCount }).map((_, index) => (
          <div
            key={index}
            ref={addToSlatRefs}
            style={{
              height: `${slatHeightPercent}%`,
              backgroundColor: slatColor,
            }}
            data-theme="light"
            className="w-full origin-bottom scale-y-0 will-change-transform"
          />
        ))}
      </div>

      {/* OVERLAY SECTION (EMERGES WHEN BLINDS WIPE) */}
      {overlay && (
        <div
          ref={overlayWrapperRef}
          data-theme="light"
          className="absolute inset-0 z-30 w-full h-full flex flex-col justify-center pointer-events-auto [perspective:1400px] [transform-style:preserve-3d]"
        >
          {overlay}
        </div>
      )}
    </div>
  );
}
