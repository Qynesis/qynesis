"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onAppReady } from "@/lib/appReady";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Mobile browsers resize the viewport while the address bar shows/hides;
    // recalculating every trigger on those resizes causes visible scroll jank.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Lenis smooth scroll. `lerp` damping (Lenis's default mode) blends each new
    // wheel tick into the ongoing motion, so continuous wheeling stays fluid
    // instead of restarting an eased animation on every notch.
    const lenis = new Lenis({
      lerp: 0.1,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      autoResize: true,
    });

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    (window as any).__lenis = lenis;

    const updateFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateFn);
    gsap.ticker.lagSmoothing(0);

    // Once the intro is done (and web fonts have settled the layout), measure
    // every scroll trigger once, so no section works from stale positions.
    let cancelled = false;
    const unsubscribe = onAppReady(() => {
      document.fonts?.ready.then(() => {
        if (cancelled) return;
        lenis.resize();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
      gsap.ticker.remove(updateFn);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
