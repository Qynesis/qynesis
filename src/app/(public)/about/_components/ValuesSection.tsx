"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const VALUES = [
  {
    title: "Driven by excellence",
    description: "Our work is shaped by high standards, continuous learning, and deep respect for craft, pushing every project beyond the expected."
  },
  {
    title: "Honesty and authenticity",
    description: "In an industry full of noise and inflated promises, we focus on clarity, transparency, and results we're proud to stand behind."
  },
  {
    title: "Designs that last",
    description: "We design systems, products, and brands built to endure, balancing creativity, technology, and purpose for long-term impact."
  },
  {
    title: "Purposeful decisions",
    description: "We're an independent studio of design and coding experts, prioritizing quality and emotional value, even above profit when it matters."
  },
  {
    title: "Creativity with impact",
    description: "We don't chase trends. We shape ideas that add real value. For us, creativity matters only when it serves purpose and endures over time."
  },
  {
    title: "Experience and attitude",
    description: "Our experience comes from years of exploration, learning, and solving complex challenges, evolving with every project we take on."
  }
];

export default function ValuesSection() {
  const containerRef = useRef<HTMLElement>(null);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);

  const rightColumnRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cards = gsap.utils.toArray('.value-card') as HTMLElement[];
    if (!cards.length || !cardsWrapperRef.current || !rightColumnRef.current) return;

    const numCards = cards.length;

    // Calculate cumulative heights to handle cards with varying text lengths
    let totalHeight = 0;
    const cardTops: number[] = [];

    cards.forEach((card) => {
      cardTops.push(totalHeight);
      totalHeight += card.offsetHeight;
    });

    // Set the overall wrapper height so it reserves space for all cards
    gsap.set(cardsWrapperRef.current, { height: totalHeight, perspective: 1500 });
    
    // Set the right column height to allow for scrolling while sticky
    // totalHeight (for the cards) + totalHeight * 1.5 (for the scroll animation duration) + 96 (for bottom gap pb-24)
    gsap.set(rightColumnRef.current, { height: totalHeight * 2.5 + 96 });

    // Position each card directly below the previous one
    cards.forEach((card, i) => {
      gsap.set(card, {
        position: "absolute",
        top: cardTops[i],
        left: 0,
        width: "100%",
        transformOrigin: "top center",
        rotationX: i === 0 ? 0 : -90,
        opacity: i === 0 ? 1 : 0, 
        zIndex: numCards - i, 
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: rightColumnRef.current,
        start: "top top+=96", // Triggers when the top of the right column hits 6rem (top-24)
        end: () => `+=${totalHeight * 1.5}`, // The exact scroll distance to animate the cards
        scrub: true,
      }
    });

    // Animate each subsequent card to swing down (unfold) from the top
    for (let i = 1; i < numCards; i++) {
      tl.to(cards[i], {
        rotationX: 0,
        opacity: 1,
        ease: "none",
        duration: 1, 
      });
    }

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="w-full bg-[#EBEBEB] text-[#111111] font-[family-name:var(--font-familjen)] selection:bg-amber-400 selection:text-black">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start px-6 md:px-12 pt-24 pb-24">
        
        {/* Left Column: Title & Text */}
        {/* This stays sticky perfectly at top-24 without GSAP interference */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24 h-fit">
          <div>
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-normal tracking-tight">
              Our values
            </h2>
          </div>
          
          <div className="mt-4 max-w-xl">
            <p className="text-base uppercase tracking-widest text-neutral-500 font-semibold leading-relaxed">
              We're proud to be one of India's most creative and recognized web design studios, driven by purpose, aesthetics, and bold ideas.
            </p>
          </div>
        </div>

        {/* Right Column: Values List */}
        <div ref={rightColumnRef} className="lg:col-span-7 flex flex-col relative w-full">
          {/* Cards Stack Wrapper - natively sticky inside the right column */}
          <div ref={cardsWrapperRef} className="sticky top-24 w-full" style={{ transformStyle: "preserve-3d" }}>
            {VALUES.map((val, idx) => (
              <div
                key={idx}
                className="value-card w-full bg-white border-b border-neutral-100 last:border-none backface-hidden"
              >
                <div className="p-8 md:p-12 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                  <div className="sm:col-span-5">
                    <h3 className="text-2xl md:text-3xl font-normal tracking-tight text-[#111111]">
                      {val.title}
                    </h3>
                  </div>
                  <div className="sm:col-span-7">
                    <p className="text-base md:text-lg text-neutral-500 font-medium leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
