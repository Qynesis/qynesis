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
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDiscussHovered, setIsDiscussHovered] = useState(false);
    const [isBookHovered, setIsBookHovered] = useState(false);

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
                { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between px-6 md:px-12 bg-[#070707] text-white overflow-hidden font-[family-name:var(--font-familjen)] select-none"
        >
            {/* TOP LEFT HERO HEADLINE */}
            <div className="relative z-10 mt-18 max-w-4xl">
                <h1
                    ref={heroTextRef}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[0.98] text-white -ml-1"
                >
                    <FocusInContractText trigger="mount" duration={0.45} staggerDelay={0.025} className="text-white">
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
                        <FocusInContractText isHovered={isDiscussHovered} as="span" duration={0.4}>
                            DISCUSS YOUR PROJECT
                        </FocusInContractText>
                        <ArrowUpRight className="size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
                    </a>

                    <a
                        href="#book"
                        onMouseEnter={() => setIsBookHovered(true)}
                        onMouseLeave={() => setIsBookHovered(false)}
                        className="group flex items-center gap-2 border-b border-white/30 pb-1 transition-all duration-300 no-underline text-white text-sSm"
                    >
                        <FocusInContractText isHovered={isBookHovered} as="span" duration={0.4}>
                            BOOK A 30-MINUTE CALL
                        </FocusInContractText>
                        <ArrowUpRight className="size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
                    </a>
                </div>
            </div>
        </div>
    );
}
