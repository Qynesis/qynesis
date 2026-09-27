"use client";

import React, { useState } from "react";
import { ArrowDown } from "lucide-react";

const FAQS = [
  { question: "What kind of work do you take on?", answer: "We take on a variety of projects..." },
  { question: "Who do you usually work with?", answer: "We work with startups and enterprises..." },
  { question: "How do projects typically begin?", answer: "It starts with a conversation..." },
  { question: "Do you partner with agencies long-term?", answer: "Yes, we do." },
  { question: "Can we sign an NDA before starting?", answer: "Absolutely." },
  { question: "How are projects priced and paid for?", answer: "We typically use fixed pricing..." },
  { question: "Are you currently taking on new work?", answer: "Yes, our books are open." },
];

export default function QuestionsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#EBEBEB] text-[#111111] py-24 md:py-32 px-6 md:px-12 font-[family-name:var(--font-familjen)] selection:bg-amber-400 selection:text-black">
      {/* Force transparent background on buttons just in case global CSS is interfering */}
      <style dangerouslySetInnerHTML={{__html: `
        .faq-override button, .faq-override div {
          background-color: transparent !important;
        }
      `}} />

      <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="text-6xl md:text-7xl lg:text-[90px] font-normal tracking-tight leading-none mb-4">
            Questions
          </h2>
          <p className="text-sm md:text-base text-neutral-500 font-medium leading-snug max-w-xs">
            Common things people<br />ask before we begin.
          </p>
        </div>

        {/* Right Column: Accordion */}
        <div className="lg:col-span-7 flex flex-col faq-override">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className="w-full border-b border-[#d1d1d1] group"
              >
                <button 
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between py-5 md:py-6 text-left outline-none"
                >
                  <span className="text-[19px] md:text-[22px] font-normal tracking-[-0.02em] text-[#222] group-hover:text-black transition-colors">
                    {faq.question}
                  </span>
                  <span 
                    className={`text-[12px] text-neutral-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ↓
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-base text-neutral-500 leading-relaxed max-w-2xl pr-8">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
