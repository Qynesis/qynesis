"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, X, Sparkles, Hamburger, Menu } from "lucide-react";
import Logo3DText from "@/components/reuseable/Logo3DText";

export default function PublicNavbar() {
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* ALWAYS-ON FIXED MIX-BLEND-DIFFERENCE LOGO (UNIVERSALLY ADAPTS OVER ANY LIGHT/DARK SECTION) */}
      <div className="fixed top-0 left-0 w-auto z-[60] px-6 py-5 md:px-12 md:py-6 pointer-events-auto mix-blend-difference">
        <Link href="/" className="flex items-center gap-2 group no-underline">
          <Logo3DText
            text="QYNESIS"
            initialDelay={3000}
            interval={15000}
            className="text-xl md:text-2xl font-normal tracking-wider uppercase font-mono text-white select-none"
          />
        </Link>
      </div>

      {/* MAIN TOP NAVBAR - RIGHT CONTROLS */}
      <nav
        className="sticky top-0 z-50 w-full bg-transparent border-transparent px-6 py-5 md:px-12 md:py-6 flex items-center justify-end"
      >
        {/* Right Action Controls */}
        <div className="flex items-center gap-3 md:gap-4 relative z-50">
          {/* Let's Talk CTA */}
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-300 no-underline cursor-pointer ${isMenuOpen
              ? "bg-black text-white hover:bg-neutral-800"
              : "bg-white text-black hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-400/25"
              }`}
          >
            LET'S TALK
          </Link>

          {/* Menu Trigger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${isMenuOpen
              ? "border border-black bg-white text-black hover:bg-neutral-100 shadow-sm"
              : "border border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 hover:border-white/40"
              }`}
          >
            {isMenuOpen ? (
              <>
                MENU <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            ) : (
              <>
                MENU <span className="font-medium"><Menu className="w-3.5 h-3.5 stroke-[2.5]" /></span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* EXPANDING SIDEBAR OVERLAY AT Z-40 */}
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
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30"
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
              className="fixed top-3 bottom-3 right-3 md:top-4 md:bottom-4 md:right-4 z-40 w-[calc(100%-1.5rem)] max-w-md bg-white text-black rounded-lg p-8 md:p-12 pt-24 md:pt-28 flex flex-col justify-between shadow-2xl overflow-y-auto font-[family-name:var(--font-familjen)]"
            >
              {/* Drawer Main Navigation Links */}
              <div className="my-auto space-y-6">
                <nav className="group/menu flex flex-col space-y-3 text-4xl md:text-5xl font-medium text-neutral-900">
                  <Link
                    href="/work"
                    onClick={() => setIsMenuOpen(false)}
                    className="transition-colors duration-300 group-hover/menu:text-neutral-200 hover:!text-neutral-900 no-underline block py-1"
                  >
                    Work
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setIsMenuOpen(false)}
                    className="transition-colors duration-300 group-hover/menu:text-neutral-200 hover:!text-neutral-900 no-underline block py-1"
                  >
                    Services
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="transition-colors duration-300 group-hover/menu:text-neutral-200 hover:!text-neutral-900  no-underline block py-1"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="transition-colors duration-300 group-hover/menu:text-neutral-200 hover:!text-neutral-900 no-underline block py-1"
                  >
                    Contact
                  </Link>
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
                      <span className="text-neutral-400 font-mono mr-2">E.</span>
                      <a href="mailto:hello@qynesis.com" className="hover:underline text-neutral-900">
                        hello@qynesis.com
                      </a>
                    </p>
                    <p>
                      <span className="text-neutral-400 font-mono mr-2">P.</span>
                      <a href="tel:+919824182099" className="hover:underline text-neutral-900">
                        +91 98241 82099
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
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition-colors no-underline">
                      Linkedin
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition-colors no-underline">
                      Facebook
                    </a>
                    <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition-colors no-underline">
                      Dribbble
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition-colors no-underline">
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

