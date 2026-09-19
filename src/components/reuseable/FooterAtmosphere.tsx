"use client";

import React, { useEffect, useRef } from "react";

interface FooterAtmosphereProps {
  pointerVelocity?: { x: number; y: number };
}

export default function FooterAtmosphere({ pointerVelocity }: FooterAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 1200);
    let height = (canvas.height = canvas.offsetHeight || 240);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 1200;
      height = canvas.height = canvas.offsetHeight || 240;
    };

    window.addEventListener("resize", handleResize);

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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Reaction to pointer velocity
      const pVx = (pointerVelocity?.x || 0) * 0.05;
      const pVy = (pointerVelocity?.y || 0) * 0.05;

      particles.forEach((p) => {
        p.x += p.vx + pVx;
        p.y += p.vy + pVy;

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

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [pointerVelocity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
    />
  );
}
