"use client";

import React, { ElementType, ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollTextRevealProps {
  /** Text string or children to render */
  children?: ReactNode;
  text?: string;
  /** HTML element tag to render as (default: "p") */
  as?: ElementType;
  /** Animation mode: "scrub" (scroll position scrubs word opacity) or "trigger" (stagger fade-in on enter) */
  mode?: "scrub" | "trigger";
  /** ScrollTrigger start position (default: "top 85%") */
  start?: string;
  /** ScrollTrigger end position (default: "bottom 50%") */
  end?: string;
  /** Initial opacity for unrevealed words (default: 0.18) */
  dimOpacity?: number;
  /** Custom CSS classes */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export default function ScrollTextReveal({
  children,
  text,
  as: Component = "p",
  mode = "scrub",
  start = "top 85%",
  end = "bottom 50%",
  dimOpacity = 0.18,
  className = "",
  style,
}: ScrollTextRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const content = text || (typeof children === "string" ? children : null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    const ctx = gsap.context(() => {
      const words = containerRef.current?.querySelectorAll(".scroll-reveal-word");
      if (!words || words.length === 0) return;

      if (mode === "scrub") {
        gsap.fromTo(
          words,
          { opacity: dimOpacity },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: start,
              end: end,
              scrub: 0.5,
            },
          }
        );
      } else {
        gsap.fromTo(
          words,
          { opacity: dimOpacity, y: 10 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: start,
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [content, mode, start, end, dimOpacity]);

  if (!content) {
    return (
      <Component ref={containerRef} className={className} style={style}>
        {children}
      </Component>
    );
  }

  const words = content.split(" ");

  return (
    <Component
      ref={containerRef}
      className={`inline-block ${className}`}
      style={style}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="scroll-reveal-word inline-block mr-[0.28em] whitespace-pre transition-colors"
          style={{ opacity: dimOpacity }}
        >
          {word}
        </span>
      ))}
    </Component>
  );
}
