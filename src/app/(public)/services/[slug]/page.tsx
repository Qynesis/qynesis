import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES } from "@/data/services";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { TransitionLink } from "@/components/transitions/PageTransitionContext";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const service = SERVICES.find((s) => s.slug === resolvedParams.slug);

  if (!service) {
    notFound();
  }

  const allOfferings = [...service.offeringsCol1, ...service.offeringsCol2];

  return (
    <div className="w-full min-h-screen bg-[#070707] text-white font-[family-name:var(--font-familjen)] pt-28 md:pt-36 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <div className="mb-10">
          <TransitionLink
            href="/services"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>All Services</span>
          </TransitionLink>
        </div>

        {/* Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-12 border-b border-white/10">
          <div className="lg:col-span-8">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block mb-3">
              SERVICE {service.indexStr}
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white capitalize leading-tight">
              {service.title}
            </h1>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed">
              {service.tagline}
            </p>
          </div>
        </div>

        {/* Media Presentation */}
        <div className="my-12 md:my-16 w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] relative aspect-[16/9] shadow-2xl">
          {service.posterImage ? (
            <Image
              src={service.posterImage}
              alt={service.title}
              fill
              priority
              sizes="100vw"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={service.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/80 pointer-events-none">
            <span>Showcase // {service.indexStr}</span>
            <span>QYNESIS ARCHITECTURE</span>
          </div>
        </div>

        {/* Details & Core Offerings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
              OVERVIEW
            </span>
            <p className="text-lg sm:text-xl text-neutral-200 leading-relaxed font-light">
              {service.description}
            </p>
            <div className="pt-6">
              <TransitionLink
                href="/contact"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-white text-black font-medium text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors group"
              >
                <span>Initiate Project</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </TransitionLink>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
              CAPABILITIES & METHODOLOGY
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allOfferings.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70 mt-2 shrink-0" />
                  <span className="text-sm text-neutral-300 font-light leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
