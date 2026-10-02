"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered here too: these sections can mount before the app's scroll provider
gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    title: "Discover",
    text: "Workshops, user research and technical audits, so we solve the right problem before writing a line of code.",
  },
  {
    title: "Design",
    text: "Flows, interfaces and prototypes that make complex products feel simple, tested with real people early.",
  },
  {
    title: "Engineer",
    text: "Websites, apps, platforms and AI models built on clean, scalable code and wired into the tools you already use.",
  },
  {
    title: "Launch & grow",
    text: "We ship, measure and keep improving: performance, search visibility and new features as you scale.",
  },
];

export default function AboutProcess() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>(".process-step");
      // The rail fills as the section scrolls by (across on wide screens, down on
      // narrow ones); each step lights up as the fill reaches it
      const mm = gsap.matchMedia();
      mm.add({ wide: "(min-width: 1024px)", narrow: "(max-width: 1023.98px)" }, (context) => {
        const wide = !!context.conditions?.wide;
        gsap.fromTo(
          ".process-rail-fill",
          wide ? { scaleX: 0, scaleY: 1 } : { scaleX: 1, scaleY: 0 },
          {
            scaleX: 1,
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".process-steps",
              start: "top 75%",
              end: "bottom 55%",
              scrub: true,
              onUpdate: (self) => {
                steps.forEach((step, i) => {
                  step.classList.toggle("is-active", self.progress >= i / steps.length + 0.02);
                });
              },
            },
          },
        );
      });
      gsap.from(steps, {
        y: 60,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".process-steps", start: "top 80%", once: true },
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-theme="dark"
      className="w-full overflow-hidden bg-[#070707] px-6 py-24 text-white md:px-12 md:py-40 font-[family-name:var(--font-familjen)]"
    >
      <div className="mb-16 grid grid-cols-1 gap-6 md:mb-24 lg:grid-cols-12">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 lg:col-span-3 lg:pt-4">How we work</p>
        <h2 className="text-5xl font-normal leading-[1.02] tracking-tight sm:text-6xl lg:col-span-9 lg:text-7xl">
          A clear process, from first call to the product people love.
        </h2>
      </div>

      <div className="process-steps relative">
        {/* Rail: horizontal on wide screens, vertical on narrow ones */}
        <div aria-hidden="true" className="absolute left-[11px] top-0 h-full w-px bg-white/10 lg:left-0 lg:top-[11px] lg:h-px lg:w-full">
          <div className="process-rail-fill h-full w-full origin-top bg-white lg:origin-left" />
        </div>

        <ol className="relative grid grid-cols-1 gap-14 lg:grid-cols-4 lg:gap-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="process-step group relative pl-12 lg:pl-0 lg:pt-14">
              <span className="absolute left-0 top-0 flex size-[23px] items-center justify-center rounded-full border border-white/30 bg-[#070707] transition-colors duration-500 group-[.is-active]:border-white group-[.is-active]:bg-white">
                <span className="size-1.5 rounded-full bg-white/40 transition-colors duration-500 group-[.is-active]:bg-[#070707]" />
              </span>
              <p className="text-sm tabular-nums text-neutral-500">0{i + 1}</p>
              <h3 className="mt-3 text-3xl tracking-tight text-neutral-500 transition-colors duration-500 group-[.is-active]:text-white md:text-4xl">
                {step.title}
              </h3>
              <p className="mt-4 max-w-sm leading-relaxed text-neutral-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
