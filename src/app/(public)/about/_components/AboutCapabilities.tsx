"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/data/services";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";

// Registered here too: these sections can mount before the app's scroll provider
gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function AboutCapabilities() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".cap-heading > *", {
        yPercent: 100,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".cap-heading", start: "top 85%", once: true },
      });
      gsap.utils.toArray<HTMLElement>(".cap-row").forEach((row) => {
        gsap.from(row, {
          y: 48,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 92%", once: true },
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      data-theme="light"
      className="w-full bg-[#EAE9E5] px-6 py-24 text-[#111111] md:px-12 md:py-36 font-[family-name:var(--font-familjen)]"
    >
      <div className="cap-heading mb-14 flex flex-col justify-between gap-6 overflow-hidden md:mb-20 md:flex-row md:items-end">
        <h2 className="text-6xl font-normal tracking-tight sm:text-7xl lg:text-8xl">What we do</h2>
        <p className="max-w-md text-base leading-relaxed text-neutral-600 md:text-lg">
          Seven disciplines, one team. Strategy, design and engineering stay in the same room, from the first
          sketch to the thousandth user.
        </p>
      </div>

      <div className="border-t border-black/15">
        {SERVICES.map((service) => (
          <TransitionLink
            key={service.id}
            href={`/services/${service.slug}`}
            className="cap-row group relative block overflow-hidden border-b border-black/15 no-underline text-inherit"
          >
            {/* Dark fill that rises on hover */}
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom scale-y-0 bg-[#0b0b0b] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100"
            />
            <span className="relative grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-7 transition-[color,padding] duration-500 group-hover:text-white md:grid-cols-[5rem_1.1fr_1.4fr_auto] md:gap-8 md:py-9 md:group-hover:px-6">
              <span className="text-sm tabular-nums text-neutral-500 transition-colors duration-500 group-hover:text-neutral-400">
                {service.indexStr}
              </span>
              <span className="text-2xl tracking-tight sm:text-3xl md:text-4xl">{service.title}</span>
              <span className="hidden text-base leading-relaxed text-neutral-600 transition-colors duration-500 group-hover:text-neutral-300 md:block">
                {service.tagline}
              </span>
              <span className="flex size-11 items-center justify-center rounded-full border border-black/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-white group-hover:bg-white group-hover:text-black">
                <ArrowUpRight className="size-5" />
              </span>
            </span>
          </TransitionLink>
        ))}
      </div>
    </section>
  );
}
