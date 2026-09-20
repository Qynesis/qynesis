"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PageTransitionContext,
  TransitionVariant,
} from "./PageTransitionContext";
import SvgMorphTransition from "./SvgMorphTransition";

interface PageTransitionProviderProps {
  children: React.ReactNode;
  defaultVariant?: TransitionVariant;
}

export default function PageTransitionProvider({
  children,
  defaultVariant = "svg-curve",
}: PageTransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<"idle" | "covering" | "covered" | "revealing">("idle");
  const [targetHref, setTargetHref] = useState<string | null>(null);
  const [variant, setVariant] = useState<TransitionVariant>(defaultVariant);
  const pendingHrefRef = useRef<string | null>(null);

  const isTransitioning = phase !== "idle";

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

      if (transitionVariant) {
        setVariant(transitionVariant);
      } else {
        setVariant(defaultVariant);
      }

      setTargetHref(href);
      pendingHrefRef.current = href;
      setPhase("covering");
    },
    [isTransitioning, pathname, defaultVariant]
  );

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

  return (
    <PageTransitionContext.Provider
      value={{
        isTransitioning,
        variant,
        navigateWithTransition,
        phase,
        setPhase,
        targetHref,
      }}
    >
      {children}

      {/* REUSABLE TRANSITION OVERLAYS */}
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
