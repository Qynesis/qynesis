"use client";

import React, { createContext, useContext } from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";

export type TransitionVariant =
  | "svg-curve"
  | "section-morph"
  | "curtain"
  | "fade"
  | "cinematic-preloader";

interface PageTransitionContextType {
  isTransitioning: boolean;
  variant: TransitionVariant;
  navigateWithTransition: (href: string, variant?: TransitionVariant) => void;
  playPreloader: () => void;
  phase: "idle" | "covering" | "covered" | "revealing";
  setPhase: (phase: "idle" | "covering" | "covered" | "revealing") => void;
  targetHref: string | null;
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null);

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error("usePageTransition must be used within a PageTransitionProvider");
  }
  return ctx;
}

export interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    Omit<LinkProps, "href"> {
  href: string;
  variant?: TransitionVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const TransitionLink = React.forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink(
    { href, variant, children, className = "", onClick, ...rest },
    ref
  ) {
    const { navigateWithTransition, isTransitioning } = usePageTransition();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) onClick(e);

      // If default was prevented or special key clicked (Cmd/Ctrl click), allow browser behavior
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // Ignore hash jumps or same page
      if (href.startsWith("#") || href === pathname) {
        return;
      }

      // Only intercept internal links
      if (
        !href.startsWith("http://") &&
        !href.startsWith("https://") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:")
      ) {
        e.preventDefault();
        if (!isTransitioning) {
          navigateWithTransition(href, variant);
        }
      }
    };

    return (
      <Link ref={ref} href={href} onClick={handleClick} className={className} {...rest}>
        {children}
      </Link>
    );
  }
);

export { PageTransitionContext };
