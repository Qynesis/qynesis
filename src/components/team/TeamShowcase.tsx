"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import FocusInContractText from "@/components/reuseable/FocusInContractText";
import { TEAM_MEMBERS } from "@/data/team";

type Lenis = { stop: () => void; start: () => void };
const getLenis = () => (window as unknown as { __lenis?: Lenis }).__lenis;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * All team members: portraits assemble from a central stack into a grid, and
 * clicking one expands it into a fullscreen bio (shared-element style).
 */
export default function TeamShowcase() {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayImgRef = useRef<HTMLImageElement>(null);
  const overlayContentRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  // ── Intro: cards fly out of a stack at the grid centre into their slots ────
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const ctx = gsap.context(() => {
      const gridRect = grid.getBoundingClientRect();
      const cx = gridRect.left + gridRect.width / 2;
      const cy = gridRect.top + Math.min(gridRect.height, window.innerHeight) / 2;

      const cards = cardRefs.current.filter(Boolean) as HTMLButtonElement[];
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        gsap.set(card, {
          x: cx - (r.left + r.width / 2),
          y: cy - (r.top + r.height / 2),
          rotation: (i % 2 ? 1 : -1) * (4 + (i % 3) * 3),
          scale: 0.7,
          opacity: 0,
        });
      });

      gsap
        .timeline({ delay: 0.25 })
        .to(cards, { opacity: 1, duration: 0.35, stagger: 0.05, ease: "power2.out" })
        .to(
          cards,
          { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.1, stagger: 0.07, ease: "expo.out" },
          0.35,
        );
    }, grid);

    return () => ctx.revert();
  }, []);

  // ── Fullscreen bio ─────────────────────────────────────────────────────────
  const openMember = useCallback((index: number) => {
    const card = cardRefs.current[index];
    const overlay = overlayRef.current;
    if (!card || !overlay || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    activeRef.current = index;
    setActiveIndex(index);
    getLenis()?.stop();
    document.body.style.overflow = "hidden";

    const r = card.getBoundingClientRect();
    gsap.set(overlay, {
      display: "block",
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      borderRadius: 12,
    });
    gsap.set(overlayContentRef.current, { opacity: 0, y: 30 });

    gsap
      .timeline({ onComplete: () => void (isAnimatingRef.current = false) })
      .to(overlay, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 0.85,
        ease: "expo.inOut",
      })
      .to(overlayContentRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.25");
  }, []);

  const closeMember = useCallback(() => {
    const index = activeRef.current;
    const overlay = overlayRef.current;
    if (index === null || !overlay || isAnimatingRef.current) return;
    const card = cardRefs.current[index];

    isAnimatingRef.current = true;
    const finish = () => {
      gsap.set(overlay, { display: "none" });
      activeRef.current = null;
      setActiveIndex(null);
      isAnimatingRef.current = false;
      document.body.style.overflow = "";
      getLenis()?.start();
    };

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(overlayContentRef.current, { opacity: 0, y: 20, duration: 0.3, ease: "power2.in" });

    // Shrink back into the card if it is on screen, otherwise just fade out
    const r = card?.getBoundingClientRect();
    if (r && r.bottom > 0 && r.top < window.innerHeight) {
      tl.to(overlay, {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        borderRadius: 12,
        duration: 0.75,
        ease: "expo.inOut",
      });
    } else {
      tl.to(overlay, { opacity: 0, duration: 0.4 }).set(overlay, { opacity: 1 });
    }
  }, []);

  const stepMember = useCallback((delta: number) => {
    const current = activeRef.current;
    if (current === null || isAnimatingRef.current) return;
    const next = (current + delta + TEAM_MEMBERS.length) % TEAM_MEMBERS.length;

    isAnimatingRef.current = true;
    gsap
      .timeline({ onComplete: () => void (isAnimatingRef.current = false) })
      .to([overlayImgRef.current, overlayContentRef.current], {
        opacity: 0,
        x: -40 * delta,
        duration: 0.35,
        ease: "power2.in",
      })
      .add(() => {
        activeRef.current = next;
        setActiveIndex(next);
      })
      .fromTo(
        [overlayImgRef.current, overlayContentRef.current],
        { opacity: 0, x: 40 * delta },
        { opacity: 1, x: 0, duration: 0.55, ease: "power3.out" },
      );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (activeRef.current === null) return;
      if (e.key === "Escape") closeMember();
      if (e.key === "ArrowRight") stepMember(1);
      if (e.key === "ArrowLeft") stepMember(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, [closeMember, stepMember]);

  // Overlay stays mounted (hidden) so its refs exist before the open animation runs
  const active = TEAM_MEMBERS[activeIndex ?? 0];

  return (
    <div className="relative w-full min-h-screen bg-[#EAE9E5] text-[#141414] font-[family-name:var(--font-familjen)] select-none">
      <div className="px-6 md:px-12 pt-32 md:pt-40 pb-24 md:pb-32">
        {/* HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-end mb-14 md:mb-20">
          <h1 className="md:col-span-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[0.95]">
            <FocusInContractText trigger="mount" duration={0.45} staggerDelay={0.03}>
              The people
            </FocusInContractText>
            <br />
            <FocusInContractText trigger="mount" duration={0.45} staggerDelay={0.03}>
              behind Qynesis.
            </FocusInContractText>
          </h1>
          <div className="md:col-span-4 md:text-right">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-2">
              {pad(TEAM_MEMBERS.length)} members
            </span>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed md:ml-auto max-w-sm">
              Designers, engineers and strategists building brands, products and AI systems together.
            </p>
          </div>
        </div>

        {/* GRID */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <button
              key={member.id}
              type="button"
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              onClick={() => openMember(idx)}
              aria-label={`View ${member.name}`}
              className="group relative block w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-900 text-left cursor-pointer shadow-lg will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              style={{ visibility: activeIndex === idx ? "hidden" : "visible" }}
            >
              <img
                src={member.image}
                alt={member.name}
                className="absolute inset-0 w-full h-full object-cover grayscale-[35%] transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                loading={idx < 3 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <span className="absolute top-4 left-5 font-mono text-xs tracking-widest text-white/70">
                {pad(idx + 1)}
              </span>
              <span className="absolute top-4 right-5 font-mono text-[10px] uppercase tracking-widest text-white/0 transition-colors duration-500 group-hover:text-white/80">
                View bio →
              </span>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/70 block">
                  {member.role}
                </span>
                <h3 className="mt-1 text-2xl md:text-3xl font-medium tracking-tight leading-tight">
                  {member.name}
                </h3>
                {member.location && (
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-white/50">
                    {member.location}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FULLSCREEN BIO OVERLAY (expands from the clicked card) */}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${active.name} — ${active.role}`}
        className="fixed z-[140] overflow-hidden bg-[#080808] text-white"
        style={{ display: "none" }}
      >
        <>
            <img
              ref={overlayImgRef}
              src={active.image}
              alt={active.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

            <div ref={overlayContentRef} className="absolute inset-0 flex flex-col justify-between p-6 md:p-12">
              {/* Top bar */}
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs md:text-sm tracking-widest text-white/80">
                  {pad((activeIndex ?? 0) + 1)} / {pad(TEAM_MEMBERS.length)}
                </span>
                <button
                  type="button"
                  onClick={closeMember}
                  aria-label="Close"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/30 backdrop-blur-md text-white transition-colors duration-300 hover:bg-white hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bio */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-8">
                  <span className="font-mono text-xs uppercase tracking-widest text-white/70 block mb-3">
                    {active.role}
                  </span>
                  <h2 className="text-5xl sm:text-6xl md:text-8xl font-normal tracking-tight leading-[0.92]">
                    {active.name}
                  </h2>
                </div>
                <div className="md:col-span-4 flex flex-col gap-4 md:items-end md:text-right">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 block">Discipline</span>
                    <span className="text-lg md:text-xl">{active.discipline}</span>
                  </div>
                  {active.location && (
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 block">Based in</span>
                      <span className="text-lg md:text-xl">{active.location}</span>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => stepMember(-1)}
                      aria-label="Previous member"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-colors duration-300 hover:bg-white hover:text-black cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepMember(1)}
                      aria-label="Next member"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-colors duration-300 hover:bg-white hover:text-black cursor-pointer"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </>
      </div>
    </div>
  );
}
