"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, X, Sparkles, Hamburger, Menu } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import Logo3DText from "@/components/reuseable/Logo3DText";
import QynesisGlyph from "@/components/brand/QynesisGlyph";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import {
  isNavbarLogoHeld,
  registerNavbarLogo,
  subscribeNavbarLogoHeld,
} from "@/lib/logoHandoff";

export default function PublicNavbar() {
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const collapseRef = useRef<gsap.core.Timeline | null>(null);

  // While the intro holds the logo, its wordmark is flying in to land on ours
  const logoHeld = useSyncExternalStore(
    subscribeNavbarLogoHeld,
    isNavbarLogoHeld,
    () => false,
  );
  const showMark = isScrolled && !logoHeld;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrolling away from the top folds the wordmark into the Q mark: the letters
  // slip back into the Q one by one from the end (S, I, S, E, N, Y), then the
  // flat Q swells into the 3D logo mark. Back at the top it plays in reverse.
  useEffect(() => {
    const letters = Array.from(
      wordmarkRef.current?.querySelectorAll<HTMLElement>("[data-char]") ?? [],
    );
    const mark = markRef.current;
    if (letters.length < 2 || !mark) return;
    const [q, ...rest] = letters;
    const animated = [...letters, mark];
    const reset = () =>
      gsap.set(animated, {
        clearProps: "opacity,transform,transformOrigin,filter",
      });

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.inOut", immediateRender: false },
      // Back at the top: drop the inline styles so the wordmark renders untouched
      onReverseComplete: reset,
    });
    tl.fromTo(
      rest.reverse(),
      { opacity: 1, x: 0, filter: "blur(0px)" },
      { opacity: 0, x: -8, filter: "blur(4px)", duration: 0.42, stagger: 0.08 },
    );
    // The Q grows into the mark while the mark grows out of it, both from the
    // left edge (the mark's ring is ~1.85x the glyph's and sits ~4px further in)
    tl.fromTo(
      q,
      { opacity: 1, x: 0, scale: 1 },
      {
        opacity: 0,
        x: 4,
        scale: 1.85,
        transformOrigin: "0% 50%",
        duration: 0.55,
      },
      0.62,
    );
    tl.fromTo(
      mark,
      { opacity: 0, x: -4, scale: 0.54 },
      { opacity: 1, x: 0, scale: 1, transformOrigin: "0% 50%", duration: 0.55 },
      0.62,
    );
    collapseRef.current = tl;

    return () => {
      tl.kill();
      collapseRef.current = null;
      reset();
    };
  }, []);

  useEffect(() => {
    const tl = collapseRef.current;
    if (!tl) return;
    if (showMark) tl.play();
    else tl.reverse();
  }, [showMark]);

  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    return registerNavbarLogo({
      el,
      // Each letter rolls on a cube; the face turned to the viewer is the one on screen
      letterBoxes: () =>
        Array.from(el.querySelectorAll("[data-front] svg"), (glyph) =>
          glyph.getBoundingClientRect(),
        ),
    });
  }, []);

  return (
    <>
      {/* ALWAYS-ON FIXED MIX-BLEND-DIFFERENCE LOGO (UNIVERSALLY ADAPTS OVER ANY LIGHT/DARK SECTION) */}
      <div
        ref={logoRef}
        className="fixed top-0 left-0 w-auto z-[130] px-6 py-5 md:px-12 md:py-6 pointer-events-none mix-blend-difference"
      >
        <TransitionLink
          href="/"
          aria-label="Qynesis home"
          className="relative flex items-center h-10 group no-underline"
        >
          {/* Full wordmark at the very top; scrolling away folds it into the Q mark
              (the intro always lands on the wordmark). Only the one on show
              takes the pointer. */}
          <span
            ref={wordmarkRef}
            className={`block ${showMark ? "" : "pointer-events-auto"}`}
          >
            <Logo3DText
              text="QYNESIS"
              initialDelay={3000}
              interval={15000}
              // Rolls once the intro's wordmark has landed on it
              paused={logoHeld}
              className="text-xl md:text-2xl text-white select-none"
              renderChar={(_, i) => (
                <span
                  className="flex h-full items-center"
                  style={{ paddingRight: i < 6 ? "0.29em" : 0 }}
                >
                  <QynesisGlyph index={i} />
                </span>
              )}
            />
          </span>

          <span
            ref={markRef}
            className={`absolute left-0 inset-y-0 flex items-center opacity-0 ${showMark ? "pointer-events-auto" : ""}`}
          >
            {/* Sized to its rendered ~40px so Next serves a 48/96px file instead of
                a ~2000px one (decoding that stalled the first scroll) */}
            <Image
              src="/logo-qynesis.png"
              alt="Qynesis"
              width={44}
              height={40}
              loading="eager"
              className="h-9 md:h-10 w-auto select-none"
            />
          </span>
        </TransitionLink>
      </div>

      {/* MAIN TOP NAVBAR - RIGHT CONTROLS
          Difference-blended like the logo, so the white buttons turn dark over
          light sections. The blend sits on the fixed bar itself: on a child it
          would only blend inside the bar's own (transparent) layer. */}
      <nav className="fixed top-0 left-0 right-0 z-[130] w-full bg-transparent border-transparent px-6 py-5 md:px-12 md:py-6 flex items-center justify-end pointer-events-none mix-blend-difference">
        {/* Right Action Controls */}
        <div className="flex items-center gap-3 md:gap-4 relative z-[130] pointer-events-auto">
          {/* Let's Talk CTA */}
          <TransitionLink
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-300 no-underline cursor-pointer ${
              isMenuOpen
                ? "bg-white text-black hover:bg-neutral-200"
                : "border border-white/40 bg-transparent text-white hover:bg-white hover:text-black"
            }`}
          >
            LET'S TALK
          </TransitionLink>

          {/* Menu Trigger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              isMenuOpen
                ? "border border-white bg-white text-black hover:bg-neutral-100 shadow-sm"
                : "border border-white/40 bg-transparent text-white hover:bg-white hover:text-black"
            }`}
          >
            {isMenuOpen ? (
              <>
                MENU <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            ) : (
              <>
                MENU{" "}
                <span className="font-medium">
                  <Menu className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* EXPANDING SIDEBAR OVERLAY AT Z-110 / Z-120 */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[110]"
            />

            {/* Expanding White Sidebar Panel (Circular Radial Reveal from MENU button) */}
            <motion.div
              initial={{
                clipPath: "circle(0% at calc(100% - 70px) 40px)",
              }}
              animate={{
                clipPath: "circle(150% at calc(100% - 70px) 40px)",
              }}
              exit={{
                clipPath: "circle(0% at calc(100% - 70px) 40px)",
              }}
              transition={{
                duration: 0.65,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="fixed top-3 bottom-3 right-3 md:top-4 md:bottom-4 md:right-4 z-[120] w-[calc(100%-1.5rem)] max-w-md bg-white text-black rounded-lg p-8 md:p-12 pt-24 md:pt-28 flex flex-col justify-between shadow-2xl overflow-y-auto font-[family-name:var(--font-familjen)]"
            >
              {/* Drawer Main Navigation Links */}
              <div className="my-auto space-y-6">
                <nav className="group/menu flex flex-col space-y-3 text-4xl md:text-5xl font-medium text-neutral-900">
                  <TransitionLink
                    href="/work"
                    onClick={() => setIsMenuOpen(false)}
                    className="transition-colors duration-300 group-hover/menu:text-neutral-200 hover:!text-neutral-900 no-underline block py-1"
                  >
                    Work
                  </TransitionLink>
                  <TransitionLink
                    href="/services"
                    onClick={() => setIsMenuOpen(false)}
                    className="transition-colors duration-300 group-hover/menu:text-neutral-200 hover:!text-neutral-900 no-underline block py-1"
                  >
                    Services
                  </TransitionLink>
                  <TransitionLink
                    href="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="transition-colors duration-300 group-hover/menu:text-neutral-200 hover:!text-neutral-900  no-underline block py-1"
                  >
                    About
                  </TransitionLink>
                  <TransitionLink
                    href="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="transition-colors duration-300 group-hover/menu:text-neutral-200 hover:!text-neutral-900 no-underline block py-1"
                  >
                    Contact
                  </TransitionLink>
                </nav>
              </div>

              {/* Drawer Footer Information Section */}
              <div className="space-y-6 pt-6 border-t border-neutral-200">
                {/* Business Enquiry */}
                <div className="space-y-1">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 font-bold block">
                    BUSINESS ENQUIRY
                  </span>
                  <div className="font-sans text-sm font-semibold text-neutral-800 space-y-0.5">
                    <p>
                      <span className="text-neutral-400 font-mono mr-2">
                        E.
                      </span>
                      <a
                        href="mailto:hello@qynesis.com"
                        className="hover:underline text-neutral-900"
                      >
                        hello@qynesis.com
                      </a>
                    </p>
                    <p>
                      <span className="text-neutral-400 font-mono mr-2">
                        P.
                      </span>
                      <a
                        href="tel:+919824182099"
                        className="hover:underline text-neutral-900"
                      >
                        +8801857589709
                      </a>
                    </p>
                  </div>
                </div>

                {/* Social Links Grid */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 font-bold block">
                    SOCIAL
                  </span>
                  <div className="grid grid-cols-2 gap-y-1 text-sm font-semibold text-neutral-800">
                    <a
                      href="https://www.linkedin.com/company/qynesis/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-amber-600 transition-colors no-underline"
                    >
                      Linkedin
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61592801964199"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-amber-600 transition-colors no-underline"
                    >
                      Facebook
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-amber-600 transition-colors no-underline"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
