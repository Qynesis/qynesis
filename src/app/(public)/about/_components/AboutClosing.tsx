"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TEAM_MEMBERS } from "@/data/team";
import CtaLink from "@/components/reuseable/CtaLink";
import { useContactModals } from "@/components/contact/ContactModals";

// Registered here too: these sections can mount before the app's scroll provider
gsap.registerPlugin(ScrollTrigger, useGSAP);

// The members with real portraits lead the teaser
const FEATURED = TEAM_MEMBERS.slice(0, 3);

export default function AboutClosing() {
  const rootRef = useRef<HTMLElement>(null);
  const { openInquiry, openBooking } = useContactModals();

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".team-card").forEach((card, i) => {
        gsap.from(card, {
          y: 90,
          opacity: 0,
          duration: 1.2,
          delay: i * 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: ".team-grid", start: "top 85%", once: true },
        });
        // Each portrait drifts against the scroll for depth
        gsap.fromTo(
          card.querySelector(".team-photo"),
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      gsap.from(".closing-line", {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".closing-title", start: "top 85%", once: true },
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
      {/* ── The people ── */}
      <div className="mb-14 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end">
        <div>
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-500">The people</p>
          <h2 className="max-w-3xl text-4xl font-normal leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            Small team. Senior minds. Big ambitions.
          </h2>
        </div>
        <CtaLink label="Meet the team" href="/team" className="shrink-0 text-sm" />
      </div>

      <div className="team-grid grid grid-cols-1 gap-6 sm:grid-cols-3">
        {FEATURED.map((member) => (
          <figure key={member.id} className="team-card group">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-neutral-900">
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="team-photo scale-[1.14] object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0"
                style={{ objectPosition: member.imagePosition }}
              />
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <span className="text-xl tracking-tight">{member.name}</span>
              <span className="text-right text-xs uppercase tracking-widest text-neutral-500">{member.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* ── Closing call to action ── */}
      <div className="mt-32 border-t border-white/10 pt-20 md:mt-48 md:pt-28">
        <h2 className="closing-title text-[12vw] font-normal leading-[0.92] tracking-[-0.04em] md:text-[8vw] xl:text-[120px]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="closing-line block">Have an idea?</span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="closing-line block text-neutral-500">Let&apos;s build it.</span>
          </span>
        </h2>
        <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:gap-12">
          <CtaLink label="Discuss your project" onClick={() => openInquiry("About page")} className="text-sm md:text-base" />
          <CtaLink label="Book a 30-minute call" onClick={() => openBooking("About page")} className="text-sm md:text-base" />
        </div>
      </div>
    </section>
  );
}
