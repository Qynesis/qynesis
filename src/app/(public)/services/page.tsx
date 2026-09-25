import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/data/services";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";

export default function ServicesPage() {
  return (
    <div className="w-full min-h-screen bg-[#070707] text-white font-[family-name:var(--font-familjen)] pt-28 md:pt-36 pb-24 px-6 md:px-12 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-16 border-b border-white/10">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-3">
            WHAT WE DO
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-light uppercase tracking-tight text-white mb-6">
            SERVICES
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 font-light max-w-2xl leading-relaxed">
            We partner with visionary enterprises to architect forward-thinking digital platforms, brands, and systems built to endure.
          </p>
        </div>

        {/* Services List */}
        <div className="divide-y divide-white/10">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group"
            >
              <div className="lg:col-span-1 font-mono text-sm text-neutral-500">
                {service.indexStr}
              </div>

              <div className="lg:col-span-5">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight mb-4 group-hover:text-neutral-200 transition-colors">
                  {service.title}
                </h2>
                <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed">
                  {service.tagline}
                </p>
              </div>

              <div className="lg:col-span-4 space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 block mb-2">
                  Key Capabilities
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm text-neutral-300">
                  {[...service.offeringsCol1, ...service.offeringsCol2].slice(0, 4).map((offering, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-white/50" />
                      <span>{offering}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 lg:text-right pt-2">
                <TransitionLink
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white border-b border-white/40 pb-1 hover:border-white transition-colors group-hover:translate-x-1 duration-300"
                >
                  <span>Explore</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </TransitionLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
