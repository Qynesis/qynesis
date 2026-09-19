"use client";

import React, { useEffect, useRef } from "react";

export interface PointerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isHovered: boolean;
}

interface ElasticSvgPathProps {
  yPos: number;
  pathIndex: number;
  pointerRef: React.RefObject<PointerState | null>;
  onPluck?: (index: number, xPos: number) => void;
  strokeColor?: string;
  strokeWidth?: number;
}

interface PhysicsPoint {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

export default function ElasticSvgPath({
  yPos,
  pathIndex,
  pointerRef,
  onPluck,
  strokeColor = "rgba(255, 255, 255, 0.45)",
  strokeWidth = 1.2,
}: ElasticSvgPathProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const highlightRef = useRef<SVGPathElement | null>(null);
  const pointsRef = useRef<PhysicsPoint[]>([]);
  const lastPluckTimeRef = useRef<number>(0);
  const lastColIndexRef = useRef<number | null>(null);
  const isCrossedRef = useRef<boolean>(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 24 sample points across 1200px width for high local precision
    const NUM_POINTS = 24;
    const points: PhysicsPoint[] = [];
    for (let i = 0; i <= NUM_POINTS; i++) {
      const px = (i / NUM_POINTS) * 1200;
      points.push({
        x: px,
        y: yPos,
        ox: px,
        oy: yPos,
        vx: 0,
        vy: 0,
      });
    }
    pointsRef.current = points;

    if (prefersReducedMotion) {
      if (pathRef.current) {
        pathRef.current.setAttribute("d", `M 0 ${yPos} L 1200 ${yPos}`);
      }
      return;
    }

    let animId: number;

    // Controlled, restrained physical parameters
    const tension = 0.09; // Tight spring tension for fast return
    const damping = 0.74; // High damping for 1-2 oscillations max (settles ~300ms)
    const interactionRadius = 35; // 35px strict localized radius
    const maxImpulse = 4.5; // 3-5px max displacement

    const updatePhysics = () => {
      const ptr = pointerRef.current;
      const pts = pointsRef.current;
      let isMoving = false;
      let localActiveX = 0;

      // Localized Pointer Interaction (ONLY if cursor is within 12px vertical distance of THIS line)
      if (ptr && ptr.isHovered) {
        const ptrY = ptr.y;
        const distY = Math.abs(ptrY - yPos);

        if (distY < 18) {
          const ptrX = ptr.x;
          localActiveX = ptrX;
          let isInsideNode = false;

          for (let i = 1; i < pts.length - 1; i++) {
            const pt = pts[i];
            const dx = ptrX - pt.ox;
            const dist = Math.sqrt(dx * dx + distY * distY);

            if (dist < interactionRadius) {
              isInsideNode = true;
              // Rapid quadratic falloff: (1 - d/r)^2
              let influence = 1 - dist / interactionRadius;
              influence = influence * influence;

              const dir = ptr.vy >= 0 ? 1 : -1;
              const impulse = dir * maxImpulse * influence;

              // Apply localized displacement impulse
              pt.vy += impulse * 0.4;
            }
          }

          // Trigger guitar pluck sound EXACTLY ONCE per hover interaction
          if (isInsideNode) {
            if (!isCrossedRef.current) {
              isCrossedRef.current = true;
              onPluck?.(pathIndex, ptrX);
            }
          } else {
            isCrossedRef.current = false;
          }
        } else {
          isCrossedRef.current = false;
        }
      } else {
        isCrossedRef.current = false;
      }

      // Physics Integration & Quick Rest Settling
      for (let i = 1; i < pts.length - 1; i++) {
        const pt = pts[i];

        // Hooke's Law Spring Force
        const fy = (pt.oy - pt.y) * tension;
        pt.vy += fy;
        pt.vy *= damping;
        pt.y += pt.vy;

        // Snap to exactly static rest position when threshold reached
        if (Math.abs(pt.y - pt.oy) < 0.04 && Math.abs(pt.vy) < 0.04) {
          pt.y = pt.oy;
          pt.vy = 0;
        } else {
          isMoving = true;
        }
      }

      // Construct SVG Bezier Path for base line (spans 0..1200)
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const mx = (p0.x + p1.x) / 2;
        const my = (p0.y + p1.y) / 2;
        d += ` Q ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      const last = pts[pts.length - 1];
      d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

      if (pathRef.current) {
        pathRef.current.setAttribute("d", d);
        pathRef.current.setAttribute("stroke", strokeColor);
      }

      // Render LOCALIZED stroke highlight segment ONLY under cursor X region
      if (highlightRef.current) {
        if (isMoving && localActiveX > 0) {
          const hStartX = Math.max(0, localActiveX - 45);
          const hEndX = Math.min(1200, localActiveX + 45);

          // Find start/end point indices inside localized range
          let hD = "";
          let started = false;
          for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            if (p1.x >= hStartX && p0.x <= hEndX) {
              const mx = (p0.x + p1.x) / 2;
              const my = (p0.y + p1.y) / 2;
              if (!started) {
                hD += `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)}`;
                started = true;
              }
              hD += ` Q ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
            }
          }
          highlightRef.current.setAttribute("d", hD || "M 0 0");
          highlightRef.current.setAttribute("stroke", "rgba(255, 255, 255, 0.95)");
          highlightRef.current.setAttribute("stroke-width", "1.6");
        } else {
          highlightRef.current.setAttribute("d", "M 0 0");
        }
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [yPos, pathIndex, pointerRef, onPluck, strokeColor, strokeWidth]);

  return (
    <g>
      {/* Base resting stroke across full line */}
      <path
        ref={pathRef}
        d={`M 0 ${yPos} L 1200 ${yPos}`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Localized active highlight stroke ONLY under cursor region */}
      <path
        ref={highlightRef}
        d="M 0 0"
        stroke="rgba(255, 255, 255, 0.95)"
        strokeWidth={1.6}
        fill="none"
      />
    </g>
  );
}


