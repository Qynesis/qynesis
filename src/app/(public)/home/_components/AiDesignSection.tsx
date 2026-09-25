"use client";

import React, { useRef } from "react";
import MouseImageTrail from "@/components/reuseable/MouseImageTrail";
import { PROJECTS } from "@/data/projects";

const TRAIL_IMAGES = PROJECTS.map((p) => p.image);

export default function AiDesignSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      data-theme="light"
      className="relative w-full min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col justify-center items-center p-8 md:p-16 select-none font-[family-name:var(--font-familjen)] overflow-hidden"
    >
      {/* Interactive Mouse Image Trail behind text */}
      <MouseImageTrail
        images={TRAIL_IMAGES}
        containerRef={containerRef}
        distanceThreshold={65}
        maxImages={6}
        imageWidth={190}
        imageHeight={250}
      />

      {/* Clean text positioned in front with mix-blend-difference */}
      <div className="relative pointer-events-none z-20 w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center py-12 mix-blend-difference">
        <div className="flex flex-col items-center space-y-1 md:space-y-0 leading-[0.88] tracking-tighter font-normal select-none">
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[7rem] uppercase text-white leading-[0.88]">
            A.I.
          </h2>
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[7rem] uppercase text-white leading-[0.88]">
            DESIGN
          </h2>
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[7rem] uppercase text-white leading-[0.88]">
            DEVELOPMENT
          </h2>
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[7rem] uppercase text-white leading-[0.88]">
            BRANDING
          </h2>
        </div>
      </div>
    </section>
  );
}

