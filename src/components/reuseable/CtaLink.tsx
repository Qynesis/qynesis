"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import { cn } from "@/lib/utils";

const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

/**
 * Letters that roll up one after another on hover of the nearest `group`, while
 * a fresh copy rolls in from below. Screen readers get the plain label.
 */
export function RollingText({ text, stagger = 16 }: { text: string; stagger?: number }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="sr-only">{text}</span>
      {Array.from(text).map((char, i) => {
        const glyph = char === " " ? " " : char;
        return (
          <span
            key={i}
            aria-hidden="true"
            className={`relative inline-block transition-transform duration-500 ${EASE} group-hover:-translate-y-full group-focus-visible:-translate-y-full`}
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            <span className="block">{glyph}</span>
            <span className="absolute left-0 top-full block">{glyph}</span>
          </span>
        );
      })}
    </span>
  );
}

/** An arrow that flies out to the top-right while a new one slides in from the bottom-left */
export function SwapArrow({ className = "size-4" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex shrink-0 overflow-hidden ${className}`}>
      <ArrowUpRight
        className={`size-full transition-transform duration-500 ${EASE} group-hover:translate-x-full group-hover:-translate-y-full group-focus-visible:translate-x-full group-focus-visible:-translate-y-full`}
      />
      <ArrowUpRight
        className={`absolute inset-0 size-full -translate-x-full translate-y-full transition-transform delay-75 duration-500 ${EASE} group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0`}
      />
    </span>
  );
}

interface CtaLinkProps {
  label: string;
  /** Opens something in place (a modal) */
  onClick?: () => void;
  /** Navigates (with the page transition) */
  href?: string;
  /** Typography / sizing */
  className?: string;
  /** Arrow size */
  arrowClassName?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

/**
 * Underlined uppercase call to action. On hover the letters roll up one by one,
 * a white underline sweeps through from the left, and the arrow swaps.
 */
export default function CtaLink({
  label,
  onClick,
  href,
  className = "",
  arrowClassName = "size-4",
  type = "button",
  disabled,
}: CtaLinkProps) {
  const classes = cn(
    "group relative inline-flex w-max items-center gap-2 pb-1.5 uppercase tracking-widest text-white no-underline bg-transparent cursor-pointer outline-none disabled:cursor-wait disabled:opacity-60",
    className,
  );
  const inner = (
    <>
      <RollingText text={label} />
      <SwapArrow className={arrowClassName} />
      {/* Resting underline, and a white one that sweeps in from the left and out to the right */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-white transition-transform duration-500 ${EASE} group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100`}
      />
    </>
  );

  if (href) {
    return (
      <TransitionLink href={href} className={classes}>
        {inner}
      </TransitionLink>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {inner}
    </button>
  );
}
