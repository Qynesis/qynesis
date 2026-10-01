"use client";

import React, { useEffect, useRef } from "react";

interface FooterAtmosphereProps {
  pointerVelocity?: { x: number; y: number };
}

// The particles drift ~0.3px per frame, so 30fps is visually identical to 60fps
const FRAME_INTERVAL = 1000 / 30;

export default function FooterAtmosphere({ pointerVelocity }: FooterAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Read through a ref so a new object from the parent doesn't restart the loop
  const velocityRef = useRef(pointerVelocity);
  useEffect(() => {
    velocityRef.current = pointerVelocity;
  }, [pointerVelocity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let lastDraw = 0;
    let width = (canvas.width = canvas.offsetWidth || 1200);
    let height = (canvas.height = canvas.offsetHeight || 240);

    const resizeObserver = new ResizeObserver(() => {
      width = canvas.width = canvas.offsetWidth || 1200;
      height = canvas.height = canvas.offsetHeight || 240;
    });
    resizeObserver.observe(canvas);

    // Subtle atmospheric smoke particles
    const numParticles = 24;
    const particles = Array.from({ length: numParticles }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 60 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: 0.03 + Math.random() * 0.05,
    }));

    const draw = (steps: number) => {
      ctx.clearRect(0, 0, width, height);

      // Reaction to pointer velocity
      const pVx = (velocityRef.current?.x || 0) * 0.05;
      const pVy = (velocityRef.current?.y || 0) * 0.05;

      particles.forEach((p) => {
        p.x += (p.vx + pVx) * steps;
        p.y += (p.vy + pVy) * steps;

        // Wrap around bounds
        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        grad.addColorStop(0.5, `rgba(200, 220, 255, ${p.alpha * 0.5})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);
      if (time - lastDraw < FRAME_INTERVAL) return;
      // Advance by the 60fps-equivalent number of steps so drift speed is unchanged
      const steps = lastDraw ? Math.min(4, (time - lastDraw) / (1000 / 60)) : 1;
      lastDraw = time;
      draw(steps);
    };

    // Only animate while the footer is actually on screen
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animId) {
        lastDraw = 0;
        animId = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    });
    visibility.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      visibility.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
    />
  );
}
