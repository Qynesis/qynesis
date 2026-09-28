"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  { question: "What kind of work do you take on?", answer: "We take on a variety of projects spanning digital product design, web applications, brand identities, and high-performance frontend engineering." },
  { question: "Who do you usually work with?", answer: "We partner with ambitious startups, venture-backed founders, and visionary enterprises looking to build memorable digital products." },
  { question: "How do projects typically begin?", answer: "It starts with an exploratory conversation to understand your vision, scope, and technical requirements before framing a concrete sprint roadmap." },
  { question: "Do you partner with agencies long-term?", answer: "Yes, we often embed as a specialized creative engineering arm for top-tier design studios and digital agencies worldwide." },
  { question: "Can we sign an NDA before starting?", answer: "Absolutely. Confidentiality is standard practice for us, and we are happy to review and execute mutual NDAs before deep discovery." },
  { question: "How are projects priced and paid for?", answer: "We work on sprint-based fixed pricing or dedicated monthly retainers, providing complete scope clarity with zero unexpected surprises." },
  { question: "Are you currently taking on new work?", answer: "Yes, our schedule is currently open for select partnerships and strategic Q3/Q4 builds." },
];

interface FaqItemProps {
  faq: { question: string; answer: string };
  index: number;
  isOpen: boolean;
  isLast: boolean;
  onToggle: () => void;
}

function FaqRow({ faq, index, isOpen, isLast, onToggle }: FaqItemProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: rowRef });

  // Accordion Expand / Collapse GSAP Animation
  useGSAP(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        contentRef.current,
        { height: 0, opacity: 0, y: -6 },
        {
          height: "auto",
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
          overwrite: "auto",
        }
      );
      gsap.to(iconRef.current, {
        color: "#171717",
        scale: 1.1,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        y: -4,
        duration: 0.35,
        ease: "power3.inOut",
        overwrite: "auto",
      });
      gsap.to(iconRef.current, {
        color: "#737373",
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [isOpen]);

  // Pointer interactions
  const handlePointerEnter = contextSafe(() => {
    gsap.to(textRef.current, {
      color: "#171717",
      duration: 0.2,
      ease: "power2.out",
    });

    if (!isOpen) {
      gsap.to(iconRef.current, {
        scale: 1.15,
        color: "#171717",
        duration: 0.2,
        ease: "power2.out",
      });
    }
  });

  const handlePointerLeave = contextSafe(() => {
    if (!rowRef.current || !textRef.current || !iconRef.current) return;

    gsap.to(textRef.current, {
      color: isOpen ? "#171717" : "#262626",
      duration: 0.25,
      ease: "power2.out",
    });

    gsap.to(iconRef.current, {
      scale: isOpen ? 1.1 : 1,
      color: isOpen ? "#171717" : "#737373",
      duration: 0.25,
      ease: "power2.out",
    });
  });

  // Touch / Tap bounce
  const handlePointerDown = contextSafe(() => {
    gsap.to(rowRef.current, {
      scale: 0.994,
      duration: 0.12,
      ease: "power2.out",
    });
  });

  const handlePointerUp = contextSafe(() => {
    gsap.to(rowRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "back.out(2)",
    });
  });

  return (
    <div
      ref={rowRef}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full select-none cursor-pointer touch-manipulation px-6 md:px-8 transition-colors hover:bg-neutral-50/70 ${
        !isLast ? "border-b border-neutral-200/80" : ""
      }`}
    >
      <div className="w-full flex items-center justify-between py-5 md:py-6 text-left outline-none group pointer-events-none">
        <span
          ref={textRef}
          className="text-lg md:text-xl font-normal tracking-tight text-neutral-800 pr-6 will-change-transform inline-block transition-colors"
        >
          {faq.question}
        </span>

        <div
          ref={iconRef}
          className="text-neutral-500 shrink-0 will-change-transform pointer-events-none flex items-center justify-center select-none"
        >
          {isOpen ? (
            <Minus className="w-5 h-5 stroke-[1.75]" />
          ) : (
            <Plus className="w-5 h-5 stroke-[1.75]" />
          )}
        </div>
      </div>

      {/* Accordion body animated strictly via GSAP */}
      <div
        ref={contentRef}
        style={{ height: 0, opacity: 0 }}
        className="overflow-hidden will-change-[height,opacity]"
      >
        <p className="text-base text-neutral-500 leading-relaxed max-w-2xl pr-8 pb-7 font-normal">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export default function QuestionsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full bg-[#EBEBEB] text-[#111111] py-24 px-6 md:px-12 font-[family-name:var(--font-familjen)] selection:bg-amber-400 selection:text-black">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-none mb-4">
            Questions
          </h2>
          <p className="text-base md:text-lg text-neutral-500 font-medium leading-snug max-w-xl">
            Common things people ask before we begin.
          </p>
        </div>

        {/* Right Column: Full-width White FAQ Card with Padding */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-200/80 overflow-hidden py-2">
          {FAQS.map((faq, idx) => (
            <FaqRow
              key={idx}
              faq={faq}
              index={idx}
              isOpen={openIndex === idx}
              isLast={idx === FAQS.length - 1}
              onToggle={() => toggleAccordion(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
