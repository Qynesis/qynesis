"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES } from "@/data/services";
import { AI_CAPABILITIES } from "@/data/aiModels";

// Registered here too: these sections can mount before the app's scroll provider
gsap.registerPlugin(ScrollTrigger, useGSAP);

const MANIFESTO =
  "Qynesis started with a simple belief: technology should feel effortless for the people who use it. Today we turn ambitious ideas into websites, apps, platforms and intelligent tools, built carefully, shipped confidently and designed to grow with the businesses behind them.";

// Facts from the site itself, so they stay true as it changes
const STATS = [
  { value: SERVICES.length, label: "Core services under one roof" },
  { value: AI_CAPABILITIES.length, label: "AI capabilities we build and integrate" },
  { value: 1, label: "Business day to reply to every inquiry" },
  { value: 30, label: "Minute discovery call, free of charge" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function AboutStory() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Words light up as the manifesto scrolls through the screen
      gsap.fromTo(
        ".story-word",
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: { trigger: ".story-text", start: "top 78%", end: "bottom 45%", scrub: true },
        },
      );

      // Stats count up when they arrive
      gsap.utils.toArray<HTMLElement>(".story-stat").forEach((stat) => {
        const number = stat.querySelector<HTMLElement>(".story-stat-number");
        const target = Number(stat.dataset.value || 0);
        const counter = { n: 0 };
        gsap.from(stat, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: stat, start: "top 88%", once: true },
        });
        gsap.to(counter, {
          n: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: stat, start: "top 88%", once: true },
          onUpdate: () => {
            if (number) number.textContent = pad(Math.round(counter.n));
          },
        });
        stat.querySelectorAll(".story-stat-line").forEach((line) =>
          gsap.from(line, {
            scaleX: 0,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: stat, start: "top 88%", once: true },
          }),
        );
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-theme="dark"
      className="w-full bg-[#070707] px-6 py-24 text-white md:px-12 md:py-40 font-[family-name:var(--font-familjen)]"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 lg:col-span-3 lg:pt-4">Our story</p>
        <p className="story-text text-3xl leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:col-span-9 lg:text-6xl">
          {MANIFESTO.split(" ").map((word, i) => (
            <span key={i} className="story-word">
              {word}{" "}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-12 sm:grid-cols-2 md:mt-40 lg:grid-cols-4 lg:gap-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="story-stat" data-value={stat.value}>
            <span className="story-stat-line block h-px w-full origin-left bg-white/20" />
            <p className="story-stat-number mt-6 text-7xl font-normal tracking-tight tabular-nums md:text-8xl">
              {pad(stat.value)}
            </p>
            <p className="mt-3 max-w-[16rem] text-sm uppercase tracking-widest text-neutral-400 leading-relaxed">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
