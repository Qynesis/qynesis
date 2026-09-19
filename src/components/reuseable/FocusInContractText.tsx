"use client";

import React, { ElementType, ReactNode, useEffect, useState } from "react";

export interface FocusInContractTextProps {
  /** Text string or React nodes */
  children?: ReactNode;
  text?: string;
  /** HTML element tag to render as (e.g. "span", "h1", "h2", "p", "div") */
  as?: ElementType;
  /** Trigger mode:
   * - "hover": triggers character-by-character animation on hover (default)
   * - "mount": triggers animation once when component mounts
   * - "both": triggers on mount AND re-triggers on hover
   */
  trigger?: "hover" | "mount" | "both";
  /** Controlled hover state from parent button/container */
  isHovered?: boolean;
  /** Animation duration per character in seconds (default: 0.45s) */
  duration?: number;
  /** Stagger delay between characters in seconds (default: 0.02s) */
  staggerDelay?: number;
  /** Custom CSS classes */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export default function FocusInContractText({
  children,
  text,
  as: Component = "span",
  trigger = "hover",
  isHovered,
  duration = 0.45,
  staggerDelay = 0.02,
  className = "",
  style,
}: FocusInContractTextProps) {
  const content = text || (typeof children === "string" ? children : null);
  const [animKey, setAnimKey] = useState(trigger === "mount" || trigger === "both" ? 1 : 0);

  // Trigger animation when controlled isHovered prop becomes true
  useEffect(() => {
    if (isHovered) {
      setAnimKey((prev) => (prev === 0 ? 1 : prev + 1));
    }
  }, [isHovered]);

  const handleMouseEnter = () => {
    if (trigger === "hover" || trigger === "both") {
      setAnimKey((prev) => (prev === 0 ? 1 : prev + 1));
    }
  };

  // Character-by-character focus-in contraction without layout width expansion
  if (content) {
    const chars = content.split("");

    const inlineKeyframeStyles = `
      @keyframes animista-focus-in-char-${animKey} {
        0% {
          -webkit-filter: blur(8px);
          filter: blur(8px);
          opacity: 0;
          transform: scale(1.35);
        }
        100% {
          -webkit-filter: blur(0px);
          filter: blur(0px);
          opacity: 1;
          transform: scale(1);
        }
      }
    `;

    return (
      <>
        {animKey > 0 && <style>{inlineKeyframeStyles}</style>}
        <Component
          className={`inline-flex items-center cursor-pointer ${className}`}
          style={style}
          onMouseEnter={handleMouseEnter}
        >
          {chars.map((char, index) => (
            <span
              key={`${animKey}-${index}`}
              className="inline-block whitespace-pre text-inherit"
              style={
                animKey > 0
                  ? {
                      animationName: `animista-focus-in-char-${animKey}`,
                      animationDuration: `${duration}s`,
                      animationDelay: `${index * staggerDelay}s`,
                      animationTimingFunction:
                        "cubic-bezier(0.250, 0.460, 0.450, 0.940)",
                      animationFillMode: "both",
                    }
                  : undefined
              }
            >
              {char}
            </span>
          ))}
        </Component>
      </>
    );
  }

  // Fallback for non-string children
  return (
    <Component
      className={`inline-block cursor-pointer ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Component>
  );
}
