"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, ArrowLeft } from "lucide-react";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";
import FocusInContractText from "@/components/reuseable/FocusInContractText";
import { SERVICES, ServiceItem } from "@/data/services";

function ServiceDetailsButton({ slug }: { slug: string; title: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TransitionLink
      href={`/services/${slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group inline-flex items-center gap-2 transition-all duration-300 no-underline text-white text-base sm:text-lg uppercase tracking-widest font-normal"
    >
      <FocusInContractText isHovered={isHovered} as="span" duration={0.4}>
        VIEW SERVICE DETAILS
      </FocusInContractText>
      <ArrowUpRight className="size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-white" />
    </TransitionLink>
  );
}

export default function ServicesSection() {
  const [expandedId, setExpandedId] = useState<string>("");

  const toggleService = (id: string) => {
    setExpandedId((prev) => (prev === id ? "" : id));
  };

  return (
    <section
      data-theme="dark"
      className="relative w-full bg-transparent text-white pt-20 pb-28 md:pt-28 md:pb-36 px-6 md:px-12 font-[family-name:var(--font-familjen)] select-none"
    >
      <div className="relative z-10 w-full">
        {/* SECTION HEADER: Small section label matching About/Footer */}
        <div className="w-full mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.05] text-white">
            Services
          </h2>
        </div>

        {/* FULL WIDTH ACCORDION LIST */}
        <div className="w-full flex flex-col divide-y divide-white/10 border-y border-white/10">
          {SERVICES.map((service: ServiceItem) => {
            const isExpanded = expandedId === service.id;

            return (
              <div
                key={service.id}
                className={`w-full group relative transition-colors duration-500 overflow-hidden ${isExpanded ? "bg-[#0c0c0c]" : "bg-transparent cursor-pointer"
                  }`}
              >
                {/* ANIMATED HOVER BACKGROUND CURTAIN & GLOW (WHEN COLLAPSED) */}
                {!isExpanded && (
                  <>
                    {/* Animated vertical scale-up background sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.045] via-white/[0.025] to-transparent origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-750 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none" />

                    {/* Animated horizontal light sheen that sweeps across */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent opacity-0 -translate-x-full group-hover:translate-x-full group-hover:opacity-100 transition-all duration-750 ease-out pointer-events-none" />

                    {/* Subtle glowing left accent line on hover */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/80 to-transparent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out pointer-events-none" />
                  </>
                )}
                {/* ACCORDION HEADER ROW */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleService(service.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleService(service.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                  className="w-full !bg-transparent py-8 md:py-10 px-2 sm:px-4 md:px-6 flex items-center justify-between text-left cursor-pointer transition-all duration-300 select-none outline-none"
                >
                  <div className="flex flex-1 min-w-0 items-center gap-4 sm:gap-6 md:gap-8">
                    <span
                      className={`shrink-0 text-xl md:text-2xl transition-all duration-500 ${isExpanded
                        ? "rotate-45 text-white"
                        : "text-neutral-400 group-hover:text-white group-hover:translate-x-1 group-hover:translate-y-1"
                        }`}
                    >
                      <ArrowDownRight className="w-6 h-6 md:w-8 md:h-8" />
                    </span>
                    <span
                      className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-[1.1] md:leading-none transition-all duration-300 ${isExpanded
                        ? "text-white"
                        : "text-neutral-300 group-hover:text-white group-hover:translate-x-2"
                        }`}
                    >
                      {service.title}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-6 md:gap-10 pl-4">
                    <span
                      className={`font-mono text-xs md:text-sm tracking-wider transition-colors duration-300 ${isExpanded ? "text-white" : "text-neutral-400 group-hover:text-white"
                        }`}
                    >
                      {service.indexStr}
                    </span>
                    {/* Decorative ruler hash marks */}
                    <div
                      className={`hidden sm:flex items-center gap-1.5 transition-opacity duration-300 ${isExpanded ? "opacity-40" : "opacity-20 group-hover:opacity-60"
                        }`}
                    >
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-[1px] ${i % 4 === 0 ? "h-4 bg-white" : "h-2 bg-white/60"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ACCORDION EXPANDED CONTENT DRAWER WITH SPRING DAMPED SMOOTHNESS */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`content-${service.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: {
                            type: "spring",
                            stiffness: 90,
                            damping: 18,
                            mass: 0.9,
                          },
                          opacity: {
                            duration: 0.5,
                            ease: "easeInOut",
                          },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: {
                            type: "spring",
                            stiffness: 110,
                            damping: 20,
                            mass: 0.8,
                          },
                          opacity: {
                            duration: 0.3,
                            ease: "easeOut",
                          },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 sm:px-4 md:px-6 pb-12 md:pb-16 pt-6">
                        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                          {/* LEFT COLUMN: TOP-ALIGNED OFFERINGS LIST & VIEW SERVICE DETAILS BUTTON */}
                          <div className="lg:col-span-6 flex flex-col justify-start space-y-10 pt-1">
                            {/* Two-column bullet items */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                              <ul className="space-y-3.5">
                                {service.offeringsCol1.map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-center gap-3 text-neutral-300 text-sm md:text-base font-normal tracking-wide"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full border border-neutral-400 shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                              <ul className="space-y-3.5">
                                {service.offeringsCol2.map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-center gap-3 text-neutral-300 text-sm md:text-base font-normal tracking-wide"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full border border-neutral-400 shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* ACTION BUTTON WITH INTERACTIVE HOVER ANIMATION */}
                            <div className="pt-2 flex items-center gap-3">
                              <ServiceDetailsButton slug={service.slug} title={service.title} />
                            </div>
                          </div>

                          {/* RIGHT COLUMN: CLEAN MEDIA SHOWCASE */}
                          <div className="lg:col-span-6">
                            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl group/media">
                              {service.posterImage ? (
                                <Image
                                  src={service.posterImage}
                                  alt={service.title}
                                  fill
                                  sizes="(max-width: 1024px) 100vw, 50vw"
                                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/media:scale-105"
                                />
                              ) : (
                                <video
                                  src={service.videoSrc}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  preload="metadata"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105"
                                />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/80 pointer-events-none">
                                <span>{service.title}</span>
                                <span className="text-neutral-400">QYNESIS // {service.indexStr}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
