"use client";

import React from "react";
import CtaLink from "@/components/reuseable/CtaLink";
import ProjectInquiryForm from "@/components/contact/ProjectInquiryForm";
import { useContactModals } from "@/components/contact/ContactModals";

export default function ContactFormSection() {
  const { openBooking } = useContactModals();

  return (
    <section className="w-full bg-[#070707] text-white pt-24 md:pt-32 pb-24 px-6 md:px-12 font-[family-name:var(--font-familjen)] selection:bg-amber-400 selection:text-black min-h-screen flex flex-col items-center">
      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-16 md:mb-8">
        <span className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-neutral-400 font-semibold block mb-5 leading-relaxed">
          A SHORT CONVERSATION IS OFTEN
          <br />
          THE BEST PLACE TO BEGIN.
        </span>
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-normal tracking-[-0.035em] mb-6 leading-[1.05]">
          Let&apos;s work together
        </h1>
        <p className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-xl mx-auto">
          We&apos;d love to hear about your project.
          <br />
          We usually reply within one business day.
        </p>
      </div>

      {/* Form: emails every field to the studio inbox */}
      <div className="w-full max-w-4xl mx-auto">
        <ProjectInquiryForm source="Contact page" />

        {/* Divider OR */}
        <div className="relative my-20 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1a1d24]"></div>
          </div>
          <div className="relative bg-[#070707] px-6 text-neutral-500 text-xs font-mono uppercase tracking-widest">
            OR
          </div>
        </div>

        {/* Book a 30-minute call: opens the booking calendar */}
        <div className="flex flex-col items-center gap-6">
          <CtaLink
            label="Book a 30-minute call"
            onClick={() => openBooking("Contact page")}
            className="text-xs md:text-sm"
            arrowClassName="size-4 md:size-5"
          />

          <div className="text-neutral-400 text-sm md:text-[15px] flex items-center justify-center">
            <span>Prefer email?</span>
            <a
              href="mailto:hello@qynesis.com"
              className="text-white hover:text-neutral-300 ml-1.5 transition-colors font-medium"
            >
              hello@qynesis.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
