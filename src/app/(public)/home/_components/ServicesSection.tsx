"use client";

import React from "react";

export default function ServicesSection() {
  return (
    <section
      data-theme="light"
      className="sticky top-0 z-10 w-full h-screen bg-[#FFFFFF] text-[#111111] flex flex-col justify-between p-8 md:p-16 select-none font-[family-name:var(--font-familjen)]"
    >
      {/* Center Massive Typography Stack (Exact Trionn Layout) */}
      <div className="my-auto w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center py-6">
        <div className="flex flex-col items-center space-y-1 md:space-y-0 leading-[0.88] tracking-tighter font-normal select-none">
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[6.5rem] uppercase text-[#111] transition-transform duration-300 hover:scale-[1.02] cursor-default">
            A.I.
          </h2>
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[6.5rem] uppercase text-[#111] transition-transform duration-300 hover:scale-[1.02] cursor-default">
            DESIGN
          </h2>
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[6.5rem] uppercase text-[#111] transition-transform duration-300 hover:scale-[1.02] cursor-default">
            DEVELOPMENT
          </h2>
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[6.5rem] uppercase text-[#111] transition-transform duration-300 hover:scale-[1.02] cursor-default">
            BRANDING
          </h2>
        </div>
      </div>
    </section>
  );
}
