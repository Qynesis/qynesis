"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal, flushSync } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "./projects";
import { ProjectCard } from "./ProjectCard";
import { FullscreenProject } from "./FullscreenProject";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 5 columns x 5 tiles (25 tiles total) for the intro assembly
// Center tile (col 3, row 3) is project 0 ("Monolith")
const INTRO_COLUMNS = [
  { className: "intro-c-1", isOdd: true, indices: [1, 2, 3, 4, 5] },
  { className: "intro-c-2", isOdd: false, indices: [6, 7, 1, 2, 3] },
  { className: "intro-c-3", isOdd: true, indices: [4, 5, 0, 7, 1] },
  { className: "intro-c-4", isOdd: false, indices: [2, 3, 4, 5, 6] },
  { className: "intro-c-5", isOdd: true, indices: [7, 1, 2, 3, 4] },
];

export default function ProjectShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introOverlayRef = useRef<HTMLDivElement>(null);

  // Fullscreen elements refs
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const fullscreenImageRef = useRef<HTMLImageElement>(null);
  const fullscreenUiRef = useRef<HTMLDivElement>(null);
  const fsTitleRef = useRef<HTMLDivElement>(null);
  const fsIndexRef = useRef<HTMLDivElement>(null);
  const transitionSlideRef = useRef<HTMLDivElement>(null);
  const transitionSlideImgRef = useRef<HTMLImageElement>(null);
  const transitionSlideTitleRef = useRef<HTMLHeadingElement>(null);
  const transitionSlideSubtitleRef = useRef<HTMLParagraphElement>(null);
  const isSwitchingRef = useRef(false);
  const slideStepRef = useRef(0);

  // Shared-element view transition expander refs
  const expanderRef = useRef<HTMLDivElement>(null);
  const expanderImgRef = useRef<HTMLImageElement>(null);
  const expanderContentRef = useRef<HTMLDivElement>(null);
  const expanderTitleRef = useRef<HTMLHeadingElement>(null);
  const expanderSubtitleRef = useRef<HTMLParagraphElement>(null);

  // Project cards and images element refs
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // State
  const [mounted, setMounted] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [activeProject, setActiveProject] = useState<number>(-1);
  const openedIndexRef = useRef<number>(-1);
  const lockedScrollYRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock window scroll position completely during fullscreen/transitions to eliminate any vertical jump
  useEffect(() => {
    const handleScrollLock = () => {
      if (lockedScrollYRef.current !== null) {
        if (window.scrollY !== lockedScrollYRef.current) {
          window.scrollTo({
            top: lockedScrollYRef.current,
            behavior: "instant" as ScrollBehavior,
          });
        }
      }
    };

    const handleWheelLock = (e: WheelEvent) => {
      if (lockedScrollYRef.current !== null) {
        if (!fullscreenRef.current?.contains(e.target as Node)) {
          e.preventDefault();
        }
      }
    };

    const handleTouchLock = (e: TouchEvent) => {
      if (lockedScrollYRef.current !== null) {
        if (!fullscreenRef.current?.contains(e.target as Node)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("scroll", handleScrollLock, { passive: false });
    window.addEventListener("wheel", handleWheelLock, { passive: false });
    window.addEventListener("touchmove", handleTouchLock, { passive: false });
    return () => {
      window.removeEventListener("scroll", handleScrollLock);
      window.removeEventListener("wheel", handleWheelLock);
      window.removeEventListener("touchmove", handleTouchLock);
    };
  }, []);

  // High-performance animation values in refs
  const currentXRef = useRef(0);
  const targetXRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startTrackXRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const animatingFullscreenRef = useRef(false);
  const activeProjectRef = useRef<number>(-1);
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);

  // Keep activeProjectRef in sync
  useEffect(() => {
    activeProjectRef.current = activeProject;
  }, [activeProject]);

  // --------------------------------------------------------------------------
  // Gallery Geometry: Clean Horizontal Card Row (Matching Screenshot 2)
  // --------------------------------------------------------------------------
  const getGalleryGeom = useCallback((i: number, W: number, H: number) => {
    const cw = Math.min(420, Math.max(280, W * 0.22));
    const ch = Math.min(650, Math.max(430, H * 0.58));
    const gap = Math.max(30, W * 0.035);
    return {
      x: W * 0.08 + i * (cw + gap),
      y: (H - ch) / 2,
      w: cw,
      h: ch,
      cw,
      gap,
    };
  }, []);

  // Compute drag bounds so neither the first nor last card is clipped
  const getBounds = useCallback(
    (W: number, H: number) => {
      const g = getGalleryGeom(projects.length - 1, W, H);
      const totalWidth = g.x + g.w;
      const min = Math.min(0, W - totalWidth - W * 0.08);
      return { min, max: 0 };
    },
    [getGalleryGeom]
  );

  // --------------------------------------------------------------------------
  // Ensure corresponding card is visible and centered in the horizontal gallery
  // --------------------------------------------------------------------------
  const ensureCardInView = useCallback(
    (i: number) => {
      if (typeof window === "undefined" || i < 0 || i >= projects.length) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const g = getGalleryGeom(i, W, H);
      const idealCurrentX = W / 2 - (g.x + g.w / 2);
      const b = getBounds(W, H);
      const clampedX = gsap.utils.clamp(b.min, b.max, idealCurrentX);
      targetXRef.current = clampedX;
      currentXRef.current = clampedX;

      // Update card positions immediately in the DOM
      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const geom = getGalleryGeom(idx, W, H);
        const x = geom.x + clampedX;
        el.style.left = `${x}px`;
        el.style.top = `${geom.y}px`;
        el.style.width = `${geom.w}px`;
        el.style.height = `${geom.h}px`;
      });
    },
    [getBounds, getGalleryGeom]
  );

  // --------------------------------------------------------------------------
  // Fullscreen Shared-Element View Transition Open: Card -> Full Page
  // --------------------------------------------------------------------------
  const openProject = useCallback(
    (index: number) => {
      if (animatingFullscreenRef.current) return;
      const card = cardRefs.current[index];
      const expander = expanderRef.current;
      const expanderImg = expanderImgRef.current;
      const expanderContent = expanderContentRef.current;
      const expanderTitle = expanderTitleRef.current;
      const expanderSubtitle = expanderSubtitleRef.current;
      const fs = fullscreenRef.current;
      const fsImg = fullscreenImageRef.current;
      const fsUi = fullscreenUiRef.current;
      const proj = projects[index];

      if (!card || !expander || !expanderImg || !proj || !fs) return;

      animatingFullscreenRef.current = true;
      openedIndexRef.current = index;
      lockedScrollYRef.current = window.scrollY;
      if (typeof window !== "undefined") {
        (window as any).__lenis?.stop();
      }

      const rect = card.getBoundingClientRect();
      const W = window.innerWidth;
      const H = window.innerHeight;

      // Populate expander content
      expanderImg.src = proj.image;
      expanderImg.alt = proj.title;
      if (expanderTitle) expanderTitle.textContent = proj.title;
      if (expanderSubtitle) expanderSubtitle.textContent = proj.subtitle || "";

      // Position expander EXACTLY over the card rect (zero visual jump)
      gsap.killTweensOf([expander, expanderContent]);
      gsap.set(expander, {
        display: "block",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        borderRadius: "8px",
        opacity: 1,
      });

      // Hide card temporarily so it doesn't double-render
      card.style.opacity = "0";

      // Reset content opacity
      gsap.set(expanderContent, { opacity: 0, y: 55, scale: 0.94 });

      // Create cinematic timeline
      const tl = gsap.timeline({
        onComplete: () => {
          setActiveProject(index);
          if (fsImg) {
            fsImg.src = proj.image;
            fsImg.alt = proj.title;
          }
          gsap.set(fs, {
            display: "block",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            borderRadius: "0px",
          });
          fs.scrollTop = 0;
          fs.style.overflowY = "auto";

          if (fsUi) {
            gsap.set(fsUi, { opacity: 1, y: 0, scale: 1 });
          }

          gsap.set(expander, { display: "none" });
          if (card) card.style.opacity = "1";
          animatingFullscreenRef.current = false;
        },
      });

      // Step 1: Smooth luxury expansion of the card to full page
      tl.to(
        expander,
        {
          left: 0,
          top: 0,
          width: W,
          height: H,
          borderRadius: "0px",
          duration: 0.85,
          ease: "power4.inOut",
        },
        0
      );

      // Step 2: Delayed choreographed reveal of the title and subtitle
      tl.to(
        expanderContent,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: "power3.out",
        },
        0.32
      );
    },
    []
  );

  // --------------------------------------------------------------------------
  // Fullscreen Shared-Element View Transition Close: Full Page -> Card in Row
  // --------------------------------------------------------------------------
  const closeProject = useCallback(() => {
    if (animatingFullscreenRef.current || activeProjectRef.current < 0) return;
    const curIndex = activeProjectRef.current;
    const expander = expanderRef.current;
    const expanderImg = expanderImgRef.current;
    const expanderContent = expanderContentRef.current;
    const expanderTitle = expanderTitleRef.current;
    const expanderSubtitle = expanderSubtitleRef.current;
    const fs = fullscreenRef.current;
    const proj = projects[curIndex];

    if (!expander || !expanderImg || !proj || !fs) return;

    animatingFullscreenRef.current = true;
    fs.scrollTop = 0;
    fs.style.overflowY = "hidden";

    const W = window.innerWidth;
    const H = window.innerHeight;

    // Only adjust gallery track position if the active project was changed inside fullscreen
    // and the target card is currently outside the viewport
    if (curIndex !== openedIndexRef.current) {
      const targetCard = cardRefs.current[curIndex];
      if (targetCard) {
        const r = targetCard.getBoundingClientRect();
        if (r.left < 0 || r.right > W) {
          ensureCardInView(curIndex);
        }
      }
    }

    const card = cardRefs.current[curIndex];
    const targetRect = card
      ? card.getBoundingClientRect()
      : { left: W * 0.2, top: H * 0.2, width: W * 0.6, height: H * 0.6 };

    // Setup expander at full page
    expanderImg.src = proj.image;
    expanderImg.alt = proj.title;
    if (expanderTitle) expanderTitle.textContent = proj.title;
    if (expanderSubtitle) expanderSubtitle.textContent = proj.subtitle || "";

    gsap.killTweensOf([expander, expanderContent]);
    gsap.set(expander, {
      display: "block",
      left: 0,
      top: 0,
      width: W,
      height: H,
      borderRadius: "0px",
      opacity: 1,
    });
    gsap.set(expanderContent, { opacity: 1, y: 0, scale: 1 });

    // Hide real modal
    gsap.set(fs, { display: "none" });
    if (transitionSlideRef.current) {
      gsap.set(transitionSlideRef.current, { display: "none" });
    }
    isSwitchingRef.current = false;

    if (card) {
      card.style.opacity = "0";
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(expander, { display: "none" });
        if (card) {
          card.style.opacity = "1";
        }
        setActiveProject(-1);
        lockedScrollYRef.current = null;
        openedIndexRef.current = -1;
        animatingFullscreenRef.current = false;
        if (typeof window !== "undefined") {
          (window as any).__lenis?.start();
        }
      },
    });

    // Step 1: Rapid elegant fade-out of the title
    tl.to(
      expanderContent,
      {
        opacity: 0,
        y: -30,
        duration: 0.22,
        ease: "power2.in",
      },
      0
    );

    // Step 2: Smooth shrink from full page back into the card in the horizontal row
    tl.to(
      expander,
      {
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: "8px",
        duration: 0.75,
        ease: "power4.inOut",
      },
      0.08
    );
  }, [ensureCardInView]);

  const switchProject = useCallback(
    (nextIndex: number, moveDirection?: "next" | "prev") => {
      if (
        nextIndex === activeProjectRef.current ||
        isSwitchingRef.current ||
        animatingFullscreenRef.current
      ) {
        return;
      }

      const fs = fullscreenRef.current;
      const fsImg = fullscreenImageRef.current;
      const slide = transitionSlideRef.current;
      const slideImg = transitionSlideImgRef.current;
      const slideTitle = transitionSlideTitleRef.current;
      const slideSubtitle = transitionSlideSubtitleRef.current;
      const nextProj = projects[nextIndex];
      if (!fs || !fsImg || !nextProj) return;

      if (!slide || !slideImg) {
        setActiveProject(nextIndex);
        fs.scrollTop = 0;
        fsImg.src = nextProj.image;
        fsImg.alt = nextProj.title;
        return;
      }

      isSwitchingRef.current = true;

      // Cycle directions: "right" -> "bottom" -> "left"
      const cycle = ["right", "bottom", "left"] as const;
      let dir: "right" | "bottom" | "left" | "top";

      if (moveDirection === "prev") {
        slideStepRef.current = (slideStepRef.current - 1 + 3) % 3;
        const cur = cycle[slideStepRef.current];
        const reverseMap = {
          right: "left",
          bottom: "top",
          left: "right",
        } as const;
        dir = reverseMap[cur];
      } else {
        dir = cycle[slideStepRef.current % 3];
        slideStepRef.current++;
      }

      // Populate incoming slide content
      slideImg.src = nextProj.image;
      slideImg.alt = nextProj.title;
      if (slideTitle) slideTitle.textContent = nextProj.title;
      if (slideSubtitle) slideSubtitle.textContent = nextProj.subtitle || "";

      // Calculate start coordinates for incoming project & parallax for old project
      let startX = 0;
      let startY = 0;
      let oldX = 0;
      let oldY = 0;

      if (dir === "right") {
        startX = 100;
        startY = 0;
        oldX = -20;
        oldY = 0;
      } else if (dir === "bottom") {
        startX = 0;
        startY = 100;
        oldX = 0;
        oldY = -20;
      } else if (dir === "left") {
        startX = -100;
        startY = 0;
        oldX = 20;
        oldY = 0;
      } else {
        // "top"
        startX = 0;
        startY = -100;
        oldX = 0;
        oldY = 20;
      }

      gsap.killTweensOf([slide, fs]);

      // Position incoming slide just outside viewport
      gsap.set(slide, {
        display: "block",
        xPercent: startX,
        yPercent: startY,
        boxShadow:
          dir === "right"
            ? "-30px 0 70px rgba(0,0,0,0.85)"
            : dir === "bottom"
            ? "0 -30px 70px rgba(0,0,0,0.85)"
            : dir === "left"
            ? "30px 0 70px rgba(0,0,0,0.85)"
            : "0 30px 70px rgba(0,0,0,0.85)",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          // Seamless swap: modal itself now has the new project at scrollTop = 0
          setActiveProject(nextIndex);
          fs.scrollTop = 0;
          fsImg.src = nextProj.image;
          fsImg.alt = nextProj.title;

          gsap.set(fs, { xPercent: 0, yPercent: 0 });
          gsap.set(slide, { display: "none" });
          isSwitchingRef.current = false;
        },
      });

      // The new project slides into place
      tl.to(
        slide,
        {
          xPercent: 0,
          yPercent: 0,
          duration: 0.68,
          ease: "power3.inOut",
        },
        0
      );

      // The old project shifts with subtle parallax
      tl.to(
        fs,
        {
          xPercent: oldX,
          yPercent: oldY,
          duration: 0.68,
          ease: "power3.inOut",
        },
        0
      );
    },
    [projects]
  );

  const handlePrev = useCallback(() => {
    const nextIdx =
      (activeProjectRef.current - 1 + projects.length) % projects.length;
    switchProject(nextIdx, "prev");
  }, [switchProject, projects.length]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeProjectRef.current + 1) % projects.length;
    switchProject(nextIdx, "next");
  }, [switchProject, projects.length]);

  // --------------------------------------------------------------------------
  // Drag & Pointer System with Inertia
  // --------------------------------------------------------------------------
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, index: number) => {
      if (animatingFullscreenRef.current || activeProjectRef.current >= 0) return;

      draggingRef.current = true;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      lastPointerXRef.current = e.clientX;
      startTrackXRef.current = targetXRef.current;
      lastTimestampRef.current = performance.now();
      velocityRef.current = 0;

      const targetEl = e.currentTarget;
      targetEl.setPointerCapture(e.pointerId);

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!draggingRef.current) return;
        const now = performance.now();
        const dt = Math.max(1, now - lastTimestampRef.current);
        const dx = moveEvent.clientX - lastPointerXRef.current;
        velocityRef.current = (dx / dt) * 16;

        const W = window.innerWidth;
        const H = window.innerHeight;
        const b = getBounds(W, H);

        targetXRef.current = gsap.utils.clamp(
          b.min,
          b.max,
          startTrackXRef.current +
          moveEvent.clientX -
          pointerStartRef.current.x
        );

        lastPointerXRef.current = moveEvent.clientX;
        lastTimestampRef.current = now;
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;

        try {
          targetEl.releasePointerCapture(upEvent.pointerId);
        } catch {
          // Ignore
        }

        targetEl.removeEventListener("pointermove", onPointerMove);
        targetEl.removeEventListener("pointerup", onPointerUp);
        targetEl.removeEventListener("pointercancel", onPointerUp);

        const dist = Math.hypot(
          upEvent.clientX - pointerStartRef.current.x,
          upEvent.clientY - pointerStartRef.current.y
        );

        const W = window.innerWidth;
        const H = window.innerHeight;
        const b = getBounds(W, H);

        targetXRef.current = gsap.utils.clamp(
          b.min,
          b.max,
          targetXRef.current + velocityRef.current * 7
        );

        // Click threshold: < 6px movement treated as click
        if (dist < 6) {
          openProject(index);
        }
      };

      targetEl.addEventListener("pointermove", onPointerMove);
      targetEl.addEventListener("pointerup", onPointerUp);
      targetEl.addEventListener("pointercancel", onPointerUp);
    },
    [getBounds, openProject]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProject(index);
      }
    },
    [openProject]
  );

  // Global keyboard shortcuts (Escape to close, Arrows to navigate)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (activeProjectRef.current < 0) return;
      if (e.key === "Escape") {
        closeProject();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [closeProject, handlePrev, handleNext]);

  // --------------------------------------------------------------------------
  // GSAP 1: 5-Column Grid Assembly Intro → 6x Zoom into Expanded Project View
  // --------------------------------------------------------------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ delay: 0 });

      // Step 1: Columns rise into place (t = 0 -> 3s)
      introTl.to(".intro-col", {
        top: "0",
        duration: 3,
        ease: "power4.inOut",
      });

      // Step 2: Column 1 tiles cascade up (top -> bottom, stagger 0.25), starts at t = 1s ("-=2")
      introTl.to(
        ".intro-c-1 .intro-item",
        {
          top: "0",
          stagger: 0.25,
          duration: 3,
          ease: "power4.inOut",
        },
        "-=2"
      );

      // Step 3: Column 2 tiles cascade down (bottom -> top, stagger -0.25), starts at t = 1s ("-=4")
      introTl.to(
        ".intro-c-2 .intro-item",
        {
          top: "0",
          stagger: -0.25,
          duration: 3,
          ease: "power4.inOut",
        },
        "-=4"
      );

      // Step 4: Column 3 tiles cascade up (stagger 0.25), starts at t = 1s ("-=4")
      introTl.to(
        ".intro-c-3 .intro-item",
        {
          top: "0",
          stagger: 0.25,
          duration: 3,
          ease: "power4.inOut",
        },
        "-=4"
      );

      // Step 5: Column 4 tiles cascade down (stagger -0.25), starts at t = 1s ("-=4")
      introTl.to(
        ".intro-c-4 .intro-item",
        {
          top: "0",
          stagger: -0.25,
          duration: 3,
          ease: "power4.inOut",
        },
        "-=4"
      );

      // Step 6: Column 5 tiles cascade up (stagger 0.25), starts at t = 1s ("-=4")
      introTl.to(
        ".intro-c-5 .intro-item",
        {
          top: "0",
          stagger: 0.25,
          duration: 3,
          ease: "power4.inOut",
        },
        "-=4"
      );

      // Step 7: Whole grid zooms 6x from center, starts at t = 3s ("-=2")
      introTl.to(
        ".intro-grid-container",
        {
          scale: 6,
          duration: 4,
          ease: "power4.inOut",
        },
        "-=2"
      );

      // Directly transition into Expanded Project View (Project 1) at t = 5.5s ("-=1.5")
      introTl.call(
        () => {
          const fs = fullscreenRef.current;
          const fsImg = fullscreenImageRef.current;
          const fsUi = fullscreenUiRef.current;
          if (!fs || !fsImg || !fsUi) return;

          setActiveProject(0);
          openedIndexRef.current = 0;
          lockedScrollYRef.current = window.scrollY;
          if (typeof window !== "undefined") {
            (window as any).__lenis?.stop();
          }

          const W = window.innerWidth;
          const H = window.innerHeight;

          fs.scrollTop = 0;
          gsap.set(fs, {
            display: "block",
            left: 0,
            top: 0,
            width: W,
            height: H,
            opacity: 1,
            overflowY: "auto",
          });

          fsImg.src = projects[0].image;
          fsImg.alt = projects[0].title;

          gsap.fromTo(
            fsUi,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }
          );
        },
        undefined,
        "-=1.5"
      );

      // Step 8: Smooth fade out overlay as the expanded project view takes over
      introTl.to(
        introOverlayRef.current,
        {
          opacity: 0,
          duration: 1.0,
          ease: "power2.inOut",
          onComplete: () => {
            setIntroFinished(true);
            ScrollTrigger.refresh();
          },
        },
        "-=1.2"
      );
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // --------------------------------------------------------------------------
  // GSAP 2: Pinned Horizontal Card View with 3-Scroll Delay -> Unpins to Footer
  // --------------------------------------------------------------------------
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 2800px for card travel + 1200px hold (3 scroll gestures delay) before unpinning to footer
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=4000px",
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (animatingFullscreenRef.current || activeProjectRef.current >= 0) return;
          const p = self.progress; // 0 to 1
          const W = window.innerWidth;
          const H = window.innerHeight;
          const b = getBounds(W, H);

          // 0.0 to 0.70: Horizontal cards travel from Card 1 to Card 8
          // 0.70 to 1.00: Delay of 3 scrolls (holds Card 8 resting before releasing to footer)
          if (p <= 0.70) {
            const cardProgress = p / 0.70;
            targetXRef.current = cardProgress * b.min;
          } else {
            targetXRef.current = b.min;
          }
        },
      });

      scrollTriggerInstanceRef.current = st;
    }, sectionRef);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [getBounds]);

  // --------------------------------------------------------------------------
  // Continuous Render Loop for Horizontal Card Gallery
  // --------------------------------------------------------------------------
  useEffect(() => {
    let rafId: number;

    const render = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;

      // Inertia physics when dragging
      if (!draggingRef.current && Math.abs(velocityRef.current) > 0.02) {
        velocityRef.current *= 0.92;
        const b = getBounds(W, H);
        targetXRef.current = gsap.utils.clamp(
          b.min,
          b.max,
          targetXRef.current + velocityRef.current
        );
      }
      currentXRef.current +=
        (targetXRef.current - currentXRef.current) * 0.09;

      // Position each card directly in the clean horizontal row
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const g = getGalleryGeom(i, W, H);
        const x = g.x + currentXRef.current;
        const y = g.y;
        const w = g.w;
        const h = g.h;

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;

        // Enhanced cinematic counter-parallax on the oversized image
        const img = imageRefs.current[i];
        if (img) {
          const cardCenter = x + w / 2;
          // Normalized relative to half-screen: -1.0 on left edge, 0 at center, +1.0 on right edge
          const norm = (cardCenter - W / 2) / (W / 2);
          const clampedNorm = Math.max(-1.2, Math.min(1.2, norm));
          // Substantial parallax travel (~70px to 100px shift in each direction)
          const maxShift = w * 0.50;
          const imageX = clampedNorm * -maxShift;
          img.style.transform = `translateX(${imageX.toFixed(2)}px) scale(1.50)`;
        }
      });

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [getBounds, getGalleryGeom]);

  return (
    <div ref={rootRef} className="relative w-full overflow-x-clip bg-[#080808]">
      {/* -------------------------------------------------------------------- */}
      {/* Intro Animation Layer: 5-Column Assembly Grid -> 6x Zoom             */}
      {/* -------------------------------------------------------------------- */}
      <style jsx>{`
        .intro-overlay {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 30;
          background: #080808;
          overflow: hidden;
          pointer-events: auto;
        }

        .intro-grid-container {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          gap: 1em;
          transform-origin: center center;
          will-change: transform;
        }

        .intro-col {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1em;
          will-change: top;
        }

        /* Off-screen start positions */
        .intro-c-1,
        .intro-c-3,
        .intro-c-5 {
          top: 100%;
        }

        .intro-c-1 .intro-item,
        .intro-c-3 .intro-item,
        .intro-c-5 .intro-item {
          top: 100%;
        }

        .intro-c-2 .intro-item,
        .intro-c-4 .intro-item {
          top: -100%;
        }

        .intro-item {
          position: relative;
          flex: 1;
          overflow: hidden;
          background: #141414;
          will-change: top;
        }

        .intro-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          max-width: none;
          display: block;
        }
      `}</style>

      {!introFinished && (
        <div ref={introOverlayRef} className="intro-overlay">
          <div className="intro-grid-container">
            {INTRO_COLUMNS.map((col, cIdx) => (
              <div key={cIdx} className={`intro-col ${col.className}`}>
                {col.indices.map((pIdx, iIdx) => (
                  <div key={iIdx} className="intro-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={projects[pIdx].image}
                      alt={projects[pIdx].title}
                      draggable={false}
                      loading={cIdx < 3 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Horizontal Card View Section (Dark #080808 Background)               */}
      {/* -------------------------------------------------------------------- */}
      <section
        ref={sectionRef}
        className="relative w-full h-screen -mt-[76px] md:-mt-[88px] overflow-hidden bg-[#080808] text-white select-none font-[family-name:var(--font-familjen)]"
      >
        {/* Top Editorial Label */}
        <div className="absolute left-6 md:left-12 top-[10%] md:top-[12%] z-10 font-mono text-[11px] uppercase tracking-widest text-neutral-400 pointer-events-none">
          SELECTED WORK &mdash; 2025/2026
        </div>

        {/* Bottom Project Counter */}
        <div className="absolute left-6 md:left-12 bottom-8 z-10 font-mono text-xs uppercase tracking-widest text-neutral-400 pointer-events-none">
          1 &mdash; {projects.length}
        </div>

        {/* Drag / Scroll Hint */}
        <div className="absolute right-6 md:right-12 bottom-8 z-10 font-mono text-[10px] uppercase tracking-widest text-neutral-500 pointer-events-none">
          &larr; DRAG OR SCROLL TO EXPLORE &rarr;
        </div>

        {/* Stage: Holds the Horizontal Card Row (Absolute within pinned section) */}
        <div
          ref={stageRef}
          className="absolute inset-0 overflow-hidden pointer-events-auto"
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              imageRef={(el) => {
                imageRefs.current[index] = el;
              }}
              project={project}
              index={index}
              onPointerDown={handlePointerDown}
              onKeyDown={handleKeyDown}
            />
          ))}
        </div>

        {/* ================================================================= */}
        {/* SHARED-ELEMENT VIEW TRANSITION EXPANDER OVERLAY (PORTALED TO BODY)*/}
        {/* ================================================================= */}
        {mounted &&
          createPortal(
            <div
              ref={expanderRef}
              style={{ display: "none", position: "fixed", zIndex: 50 }}
              className="overflow-hidden bg-[#080808] pointer-events-none select-none will-change-[left,top,width,height,border-radius] border border-white/15"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={expanderImgRef}
                src=""
                alt=""
                className="w-full h-full object-cover block will-change-transform"
              />
              {/* Central Title and Subtitle with Choreographed Delay */}
              <div
                ref={expanderContentRef}
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none opacity-0"
              >
                <h2
                  ref={expanderTitleRef}
                  className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-none font-normal drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
                />
                <p
                  ref={expanderSubtitleRef}
                  className="mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-xl text-center tracking-wide font-light drop-shadow-md"
                />
              </div>
            </div>,
            document.body
          )}

        {/* Fullscreen Expanded Project Viewer Overlay */}
        <FullscreenProject
          ref={fullscreenRef}
          projects={projects}
          activeProject={activeProject}
          imageRef={fullscreenImageRef}
          uiRef={fullscreenUiRef}
          titleRef={fsTitleRef}
          indexRef={fsIndexRef}
          onClose={closeProject}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelectThumb={(index) => {
            const dir = index >= activeProjectRef.current ? "next" : "prev";
            switchProject(index, dir);
          }}
        />

        {/* Directional Project Transition Slide Layer (Right -> Bottom -> Left) */}
        <div
          ref={transitionSlideRef}
          style={{ display: "none" }}
          className="fixed inset-0 z-40 overflow-hidden pointer-events-none select-none will-change-transform font-[family-name:var(--font-familjen)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={transitionSlideImgRef}
            src=""
            alt=""
            className="w-full h-full object-cover block"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <h2
              ref={transitionSlideTitleRef}
              className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-none font-normal drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
            />
            <p
              ref={transitionSlideSubtitleRef}
              className="mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-xl text-center tracking-wide font-light drop-shadow-md"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
