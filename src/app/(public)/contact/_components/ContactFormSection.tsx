"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FocusInContractText from "@/components/reuseable/FocusInContractText";

export default function ContactFormSection() {
  const [service, setService] = useState("");
  const [budget, setBudget] = useState("");
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isBookHovered, setIsBookHovered] = useState(false);

  const servicesList = [
    "Brand & Identity",
    "UI/UX Design",
    "Web Development",
    "Mobile Apps",
    "3D & Motion",
    "Consulting"
  ];

  const budgetList = [
    "Under $5k",
    "$5k - $10k",
    "$10k - $25k",
    "$25k - $50k",
    "$50k+"
  ];

  return (
    <section className="w-full bg-[#070707] text-white pt-24 md:pt-32 pb-24 px-6 md:px-12 font-[family-name:var(--font-familjen)] selection:bg-amber-400 selection:text-black min-h-screen flex flex-col items-center">
      
      {/* 
        Ultra-high specificity overrides:
        Ensures input fields, textareas, and popovers are 100% transparent.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        html body .contact-override form input,
        html body .contact-override form input:not([type="checkbox"]):not([type="radio"]),
        html body .contact-override form textarea,
        html body .contact-override form select,
        html body .contact-override .popover-trigger,
        html body .contact-override input,
        html body .contact-override textarea {
          background-color: transparent !important; 
          background: transparent !important;
          border: 1px solid #22262e !important;
          color: #ffffff !important;
          border-radius: 6px !important;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        html body .contact-override form input:focus,
        html body .contact-override form textarea:focus,
        html body .contact-override .popover-trigger:focus {
          border-color: #404654 !important;
          background-color: rgba(255, 255, 255, 0.03) !important;
          background: rgba(255, 255, 255, 0.03) !important;
          outline: none !important;
        }
        html body .contact-override form input::placeholder,
        html body .contact-override form textarea::placeholder {
          color: #636b78 !important;
          font-weight: 400 !important;
        }
        .contact-popover {
          width: var(--anchor-width) !important;
          max-width: var(--anchor-width) !important;
          background-color: rgba(7, 7, 7, 0.85) !important;
          background: rgba(7, 7, 7, 0.85) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid #22262e !important;
          border-radius: 6px !important;
          padding: 4px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6) !important;
        }
        .contact-popover button {
          background-color: transparent !important;
          background: transparent !important;
          color: #d1d5db !important;
          width: 100% !important;
          text-align: left !important;
          border: none !important;
          border-radius: 4px !important;
          padding: 10px 16px !important;
          font-size: 14px !important;
          transition: background-color 0.15s ease, color 0.15s ease !important;
          cursor: pointer !important;
        }
        .contact-popover button:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          color: #ffffff !important;
        }
      `}} />

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
        <span className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-neutral-400 font-semibold block mb-8 leading-relaxed">
          A SHORT CONVERSATION IS OFTEN<br/>THE BEST PLACE TO BEGIN.
        </span>
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-normal tracking-[-0.035em] mb-6 leading-[1.05]">
          Let's work together
        </h1>
        <p className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-xl mx-auto">
          We'd love to hear about your project.<br/>
          We usually reply within one business day.
        </p>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-4xl mx-auto contact-override">
        <form onSubmit={(e) => e.preventDefault()} className="contact-form grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Full Name */}
          <div className="md:col-span-1">
            <input 
              type="text" 
              placeholder="Full Name" 
              style={{ backgroundColor: "transparent" }}
              className="w-full h-12 px-5 focus:outline-none text-sm md:text-[15px] bg-transparent"
            />
          </div>
          
          {/* Email address */}
          <div className="md:col-span-1">
            <input 
              type="email" 
              placeholder="Email address" 
              style={{ backgroundColor: "transparent" }}
              className="w-full h-12 px-5 focus:outline-none text-sm md:text-[15px] bg-transparent"
            />
          </div>

          {/* Company / Website name */}
          <div className="md:col-span-1">
            <input 
              type="text" 
              placeholder="Company / Website name" 
              style={{ backgroundColor: "transparent" }}
              className="w-full h-12 px-5 focus:outline-none text-sm md:text-[15px] bg-transparent"
            />
          </div>

          {/* Select a service */}
          <div className="md:col-span-1 relative">
            <Popover>
              <PopoverTrigger
                type="button"
                style={{ backgroundColor: "transparent" }}
                className="popover-trigger w-full h-12 px-5 flex items-center justify-between text-sm md:text-[15px] font-normal text-left cursor-pointer bg-transparent"
              >
                <span className={service ? "text-white" : "text-[#636b78]"}>
                  {service || "Select a service"}
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </PopoverTrigger>
              <PopoverContent 
                align="start"
                sideOffset={4}
                className="contact-popover w-[var(--anchor-width)] !bg-[#070707]/85 backdrop-blur-xl border border-[#22262e] rounded-md p-1 shadow-2xl z-50"
              >
                <div className="flex flex-col py-1">
                  {servicesList.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setService(item)}
                      style={{ backgroundColor: "transparent" }}
                      className="w-full px-4 py-2.5 text-sm text-left text-neutral-300 hover:text-white rounded transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Share a little about your goals... */}
          <div className="md:col-span-2">
            <textarea 
              placeholder="Share a little about your goals, timeline, and requirements..." 
              rows={4}
              style={{ backgroundColor: "transparent" }}
              className="w-full p-5 focus:outline-none text-sm md:text-[15px] resize-none bg-transparent"
            />
          </div>

          {/* Select your estimated budget */}
          <div className="md:col-span-1 relative">
            <Popover>
              <PopoverTrigger
                type="button"
                style={{ backgroundColor: "transparent" }}
                className="popover-trigger w-full h-12 px-5 flex items-center justify-between text-sm md:text-[15px] font-normal text-left cursor-pointer bg-transparent"
              >
                <span className={budget ? "text-white" : "text-[#636b78]"}>
                  {budget || "Select your estimated budget"}
                </span>
                <ArrowDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </PopoverTrigger>
              <PopoverContent 
                align="start"
                sideOffset={4}
                className="contact-popover w-[var(--anchor-width)] !bg-[#070707]/85 backdrop-blur-xl border border-[#22262e] rounded-md p-1 shadow-2xl z-50"
              >
                <div className="flex flex-col py-1">
                  {budgetList.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setBudget(item)}
                      style={{ backgroundColor: "transparent" }}
                      className="w-full px-4 py-2.5 text-sm text-left text-neutral-300 hover:text-white rounded transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* SEND INQUIRY: Reusable button matching design system */}
          <div className="md:col-span-1 flex items-center md:items-end justify-end pb-2">
            <button 
              type="submit"
              onMouseEnter={() => setIsSendHovered(true)}
              onMouseLeave={() => setIsSendHovered(false)}
              style={{ backgroundColor: "transparent" }}
              className="group inline-flex items-center justify-between w-full max-w-[260px] border-b border-white/60 hover:border-white pb-2.5 transition-all duration-300 text-white font-mono text-sm uppercase tracking-widest cursor-pointer bg-transparent"
            >
              <FocusInContractText isHovered={isSendHovered} as="span" duration={0.4}>
                SEND INQUIRY
              </FocusInContractText>
              <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white shrink-0" />
            </button>
          </div>

        </form>

        {/* Divider OR */}
        <div className="relative my-20 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1a1d24]"></div>
          </div>
          <div className="relative bg-[#070707] px-6 text-neutral-500 text-xs font-mono uppercase tracking-widest">
            OR
          </div>
        </div>

        {/* Book a 30-minute call: Reusable callout matching banner & footer */}
        <div className="flex flex-col items-center gap-6">
          <a
            href="#book"
            onMouseEnter={() => setIsBookHovered(true)}
            onMouseLeave={() => setIsBookHovered(false)}
            style={{ backgroundColor: "transparent" }}
            className="group inline-flex items-center gap-2 border-b border-white/40 hover:border-white pb-1.5 transition-all duration-300 no-underline text-white font-mono text-xs md:text-sm uppercase tracking-widest cursor-pointer bg-transparent"
          >
            <FocusInContractText isHovered={isBookHovered} as="span" duration={0.4}>
              BOOK A 30-MINUTE CALL
            </FocusInContractText>
            <ArrowUpRight className="size-4 md:size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white shrink-0" />
          </a>
          
          <div className="text-neutral-400 text-sm md:text-[15px] flex items-center justify-center">
            <span>Prefer email?</span>
            <a 
              href="mailto:hello@trionn.com" 
              className="text-white hover:text-neutral-300 ml-1.5 transition-colors font-medium"
            >
              hello@trionn.com
            </a>
          </div>
        </div>

      </div>

    </section>
  );
}

