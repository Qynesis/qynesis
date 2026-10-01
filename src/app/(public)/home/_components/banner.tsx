"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUpRight, Globe, ChevronDown } from "lucide-react";
import FocusInContractText from "@/components/reuseable/FocusInContractText";

const phrases = [
  "mean purpose.",
  "shape digital direction.",
  "scale global impact.",
  "craft brand clarity.",
];

export default function Banner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDiscussHovered, setIsDiscussHovered] = useState(false);
  const [isBookHovered, setIsBookHovered] = useState(false);

  // Auto-pause video when scrolled out of view to free 100% GPU/CPU resources
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Apply safe speed
    try {
      video.playbackRate = 0.65;
    } catch {
      // Ignore
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Rotate headline phrases with character-by-character animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline entrance
      gsap.fromTo(
        heroTextRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen h-[100dvh] min-h-screen flex flex-col justify-between px-6 md:px-12 pt-18 pb-8  text-white overflow-hidden font-[family-name:var(--font-familjen)] select-none"
    >
      {/* CINEMATIC BACKGROUND VIDEO - HARDWARE ACCELERATED & ISOLATED */}
      {/* <div
                className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
                style={{
                    transform: "translate3d(0, 0, 0)",
                    willChange: "transform",
                    contain: "strict",
                }}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    tabIndex={-1}
                    aria-hidden="true"
                    onLoadedMetadata={(e) => {
                        try {
                            e.currentTarget.playbackRate = 0.65;
                        } catch {
                            // Ignore
                        }
                    }}
                    className="w-full h-full object-cover scale-105"
                    style={{
                        transform: "translate3d(0, 0, 0)",
                        backfaceVisibility: "hidden",
                    }}
                >
                    <source
                        src="/Animate_reference_image_environment_1080p_20260921025358.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-[#070707] via-[#070707]/40 to-transparent z-1" />
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#070707] to-transparent z-1" />
            </div> */}

      {/* TOP LEFT HERO HEADLINE */}
      <div className="relative z-10 mt-2 md:mt-4 max-w-4xl">
        <h1
          ref={heroTextRef}
          className="text-4xl mt-24 md:mt-14 sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[0.98] text-white -ml-1"
        >
          <FocusInContractText
            trigger="mount"
            duration={0.45}
            staggerDelay={0.025}
            className="text-white"
          >
            Designed to
          </FocusInContractText>
          <br />
          <FocusInContractText
            key={phraseIndex}
            trigger="mount"
            duration={0.45}
            staggerDelay={0.025}
            className="text-white font-medium"
          >
            {phrases[phraseIndex]}
          </FocusInContractText>
        </h1>

        {/* Action Callouts */}
        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 font-mono text-xs uppercase tracking-widest text-neutral-300">
          <a
            href="#discuss"
            onMouseEnter={() => setIsDiscussHovered(true)}
            onMouseLeave={() => setIsDiscussHovered(false)}
            className="group flex items-center gap-2 border-b border-white/30 pb-1 transition-all duration-300 no-underline text-white text-sm"
          >
            <FocusInContractText
              isHovered={isDiscussHovered}
              as="span"
              duration={0.4}
            >
              DISCUSS YOUR PROJECT
            </FocusInContractText>
            <ArrowUpRight className="size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
          </a>

          <a
            href="#book"
            onMouseEnter={() => setIsBookHovered(true)}
            onMouseLeave={() => setIsBookHovered(false)}
            className="group flex items-center gap-2 border-b border-white/30 pb-1 transition-all duration-300 no-underline text-white text-sm"
          >
            <FocusInContractText
              isHovered={isBookHovered}
              as="span"
              duration={0.4}
            >
              BOOK A 30-MINUTE CALL
            </FocusInContractText>
            <ArrowUpRight className="size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
          </a>
        </div>
      </div>

      {/* Subtle bottom scroll hint */}
      <div className="relative z-10 mb-8 flex items-center justify-between text-neutral-400 font-mono text-xs tracking-wider uppercase">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AVAILABLE FOR SELECT COMMISSIONS
        </span>
        <span className="hidden md:flex items-center gap-1.5 opacity-60">
          SCROLL TO EXPLORE
          <ChevronDown className="size-3.5 animate-bounce" />
        </span>
      </div>
    </div>
  );
}
