"use client";

import React, { forwardRef } from "react";
import Image from "next/image";
import { Project } from "./types";

interface ProjectCardProps {
  project: Project;
  index: number;
  imageRef: (el: HTMLImageElement | null) => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, index: number) => void;
}

export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ project, index, imageRef, onPointerDown, onKeyDown }, ref) => {
    return (
      <div
        ref={ref}
        data-index={index}
        role="button"
        tabIndex={0}
        aria-label={`View project ${project.title}`}
        onPointerDown={(e) => onPointerDown(e, index)}
        onKeyDown={(e) => onKeyDown(e, index)}
        className="absolute overflow-hidden bg-neutral-900 border border-white/10 hover:border-white/25 transition-colors cursor-grab active:cursor-grabbing will-change-[left,top,width,height,transform,opacity] select-none touch-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
        style={{
          // Initial styles; positioned and sized dynamically via GSAP/physics
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        }}
      >
        {/* Project Number Label */}
        <span className="absolute z-10 left-3 top-2.5 text-white text-[11px] font-mono tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] pointer-events-none select-none">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Oversized Internal Image for Counter-Parallax */}
        <div className="relative w-full h-full overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={project.image}
            alt={project.title}
            draggable={false}
            className="w-full h-full max-w-none object-cover pointer-events-none select-none will-change-transform scale-[1.50]"
            loading={index < 4 ? "eager" : "lazy"}
          />
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";
