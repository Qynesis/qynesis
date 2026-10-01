"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PageTransitionContext,
  TransitionVariant,
} from "./PageTransitionContext";
import SvgMorphTransition from "./SvgMorphTransition";
import CinematicPreloader from "./CinematicPreloader";
import { markAppReady } from "@/lib/appReady";

// The navbar logo rolls its letters ~0.4s after the intro lands, for ~0.9s
const INTRO_LANDING_SETTLE_MS = 1400;

interface PageTransitionProviderProps {
  children: React.ReactNode;
  defaultVariant?: TransitionVariant;
  enableInitialPreloader?: boolean;
}

export default function PageTransitionProvider({
  children,
  defaultVariant = "svg-curve",
  enableInitialPreloader = true,
}: PageTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<"idle" | "covering" | "covered" | "revealing">("idle");
  const [targetHref, setTargetHref] = useState<string | null>(null);
  const [variant, setVariant] = useState<TransitionVariant>(defaultVariant);
  const [showPreloader, setShowPreloader] = useState(enableInitialPreloader);
  const [forcePreloader, setForcePreloader] = useState(false);
  const pendingHrefRef = useRef<string | null>(null);

  const isTransitioning = phase !== "idle" || showPreloader;

  // Without an intro, heavy effects may start straight away
  useEffect(() => {
    if (!enableInitialPreloader) markAppReady();
  }, [enableInitialPreloader]);

  // Reset scroll to top cleanly
  const resetScroll = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    if (typeof window !== "undefined" && (window as any).__lenis) {
      try {
        (window as any).__lenis.scrollTo(0, { immediate: true });
      } catch (err) {
        // lenis scroll fallback
      }
    }
  }, []);

  const navigateWithTransition = useCallback(
    (href: string, transitionVariant?: TransitionVariant) => {
      // Don't navigate if already navigating to the same target or on same page
      if (isTransitioning || href === pathname) return;

      const chosenVariant = transitionVariant || defaultVariant;
      setVariant(chosenVariant);
      setTargetHref(href);
      pendingHrefRef.current = href;

      if (chosenVariant === "cinematic-preloader") {
        setForcePreloader(true);
        setShowPreloader(true);
      } else {
        setPhase("covering");
      }
    },
    [isTransitioning, pathname, defaultVariant]
  );

  const playPreloader = useCallback(() => {
    setForcePreloader(true);
    setShowPreloader(true);
  }, []);

  // Step 2: Once the covering morph animation finishes
  const handleCovered = useCallback(() => {
    setPhase("covered");

    // Scroll to top immediately while fully covered
    resetScroll();

    if (pendingHrefRef.current) {
      const destination = pendingHrefRef.current;
      router.push(destination);

      // Brief delay to allow Next.js App Router DOM swap under the cover
      setTimeout(() => {
        resetScroll();
        setPhase("revealing");
      }, 300);
    } else {
      setPhase("revealing");
    }
  }, [router, resetScroll]);

  // Step 3: Once the reveal morph animation finishes
  const handleRevealed = useCallback(() => {
    setPhase("idle");
    setTargetHref(null);
    pendingHrefRef.current = null;
    resetScroll();
  }, [resetScroll]);

  // Handle preloader complete
  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
    setForcePreloader(false);
    // Intro is done: let deferred WebGL / heavy effects initialise once the
    // landed navbar logo has finished its letter roll, since their one-off setup
    // (WebGL contexts, shader compiles) blocks the main thread for a moment
    setTimeout(markAppReady, INTRO_LANDING_SETTLE_MS);

    if (pendingHrefRef.current) {
      const destination = pendingHrefRef.current;
      router.push(destination);
      pendingHrefRef.current = null;
      setTargetHref(null);
    }
    resetScroll();
  }, [router, resetScroll]);

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        variant,
        navigateWithTransition,
        playPreloader,
        phase,
        setPhase,
        targetHref,
      }}
    >
      {children}

      {/* CINEMATIC PRELOADER ANIMATION (8-STAGE SVG & PARTICLES) */}
      {showPreloader && (
        <CinematicPreloader
          onComplete={handlePreloaderComplete}
          // Page shows through as the wordmark flies into the navbar: start it at the top
          onReveal={resetScroll}
        />
      )}

      {/* REUSABLE SVG MORPH TRANSITION OVERLAY */}
      {(variant === "svg-curve" || variant === "section-morph") && (
        <SvgMorphTransition
          phase={phase}
          targetHref={targetHref}
          onCovered={handleCovered}
          onRevealed={handleRevealed}
        />
      )}
    </PageTransitionContext.Provider>
  );
}
