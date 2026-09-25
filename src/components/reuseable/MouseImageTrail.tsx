"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface MouseImageTrailProps {
  images: string[];
  containerRef?: React.RefObject<HTMLElement | null>;
  distanceThreshold?: number;
  maxImages?: number;
  imageWidth?: number;
  imageHeight?: number;
}

interface ActiveTrailItem {
  element: HTMLDivElement;
  id: number;
}

export default function MouseImageTrail({
  images,
  containerRef,
  distanceThreshold = 65,
  maxImages = 6,
  imageWidth = 190,
  imageHeight = 250,
}: MouseImageTrailProps) {
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const imageIndexRef = useRef(0);
  const lastPosRef = useRef({ x: -9999, y: -9999 });
  const poolRef = useRef<HTMLDivElement[]>([]);
  const poolCursorRef = useRef(0);
  const activeItemsRef = useRef<ActiveTrailItem[]>([]);
  const zCounterRef = useRef(1);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const decayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const trailContainer = trailContainerRef.current;
    if (!trailContainer) return;

    trailContainer.innerHTML = "";
    poolRef.current = [];
    activeItemsRef.current = [];

    // Create pool of elements
    for (let i = 0; i < maxImages * 2; i++) {
      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.left = "0";
      wrapper.style.top = "0";
      wrapper.style.width = `${imageWidth}px`;
      wrapper.style.height = `${imageHeight}px`;
      wrapper.style.pointerEvents = "none";
      wrapper.style.opacity = "0";
      wrapper.style.transform = "translate3d(-9999px, -9999px, 0)";
      wrapper.style.borderRadius = "14px";
      wrapper.style.overflow = "hidden";
      wrapper.style.boxShadow = "0 20px 45px -12px rgba(0,0,0,0.25)";

      const img = document.createElement("img");
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.display = "block";
      img.style.userSelect = "none";
      img.draggable = false;

      wrapper.appendChild(img);
      trailContainer.appendChild(wrapper);
      poolRef.current.push(wrapper);
    }

    const targetElement = containerRef?.current || trailContainer;

    // Smoothly fade out oldest tail item when mouse stops moving
    const runDecay = () => {
      if (decayTimerRef.current) clearInterval(decayTimerRef.current);

      decayTimerRef.current = setInterval(() => {
        if (activeItemsRef.current.length === 0) {
          if (decayTimerRef.current) clearInterval(decayTimerRef.current);
          return;
        }

        const oldest = activeItemsRef.current.pop();
        if (oldest) {
          gsap.to(oldest.element, {
            opacity: 0,
            scale: 0.9,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      }, 150);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = targetElement.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) {
        return;
      }

      // Reset decay timers while active
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (decayTimerRef.current) clearInterval(decayTimerRef.current);
      idleTimerRef.current = setTimeout(runDecay, 300);

      const dx = relX - lastPosRef.current.x;
      const dy = relY - lastPosRef.current.y;
      const distance = Math.hypot(dx, dy);

      if (distance < distanceThreshold) {
        return;
      }

      lastPosRef.current = { x: relX, y: relY };

      // Get next pooled DOM node
      const item = poolRef.current[poolCursorRef.current];
      poolCursorRef.current = (poolCursorRef.current + 1) % poolRef.current.length;

      // Assign image source
      const imgSrc = images[imageIndexRef.current % images.length];
      imageIndexRef.current += 1;
      const img = item.querySelector("img");
      if (img && img.src !== imgSrc) {
        img.src = imgSrc;
      }

      const randomRotation = (Math.random() - 0.5) * 14;
      const posX = relX - imageWidth / 2;
      const posY = relY - imageHeight / 2;

      zCounterRef.current = (zCounterRef.current % 50) + 1;
      const currentZ = zCounterRef.current;

      gsap.killTweensOf(item);

      // Add to head of active items list
      activeItemsRef.current.unshift({ element: item, id: imageIndexRef.current });

      // Smoothly retire items that exceed maxImages
      while (activeItemsRef.current.length > maxImages) {
        const excess = activeItemsRef.current.pop();
        if (excess) {
          gsap.to(excess.element, {
            opacity: 0,
            scale: 0.85,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      }

      // Position node at mouse coordinates - starts tiny at cursor
      gsap.set(item, {
        x: posX,
        y: posY,
        rotation: randomRotation,
        scale: 0.25,
        opacity: 0,
        zIndex: currentZ,
      });

      // Smooth buttery pop-in to scale: 0.35 directly under the pointer
      gsap.to(item, {
        scale: 0.35,
        opacity: 1,
        duration: 0.28,
        ease: "power2.out",
      });

      // Update older trail items so they expand dramatically backwards along the path (0.35 -> 1.25)
      const total = activeItemsRef.current.length;
      activeItemsRef.current.forEach((activeItem, idx) => {
        if (idx === 0) return; // Newly spawned item is animating at 0.35

        const progress = total > 1 ? idx / (total - 1) : 0;
        // Dramatic taper: from 0.35 near pointer up to 1.25 at the furthest tail
        const targetScale = 0.25 + progress * (1.25 - 0.35);

        gsap.to(activeItem.element, {
          scale: targetScale,
          duration: 0.45,
          ease: "power2.out",
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (decayTimerRef.current) clearInterval(decayTimerRef.current);
    };
  }, [images, containerRef, distanceThreshold, maxImages, imageWidth, imageHeight]);

  return (
    <div
      ref={trailContainerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
      aria-hidden="true"
    />
  );
}
