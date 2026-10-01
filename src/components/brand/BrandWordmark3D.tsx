"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { afterAppReady } from "@/lib/appReady";
import { WORDMARK_LETTERS } from "./qynesisWordmark";
import BrandWordmark from "./BrandWordmark";

interface BrandWordmark3DProps {
  /** The hero Q's baked satin-silver matcap, so both read as the same material */
  matcapSrc?: string;
  className?: string;
}

// Bounds of the flat wordmark (its viewBox), in wordmark units
const BOUNDS = { x: 115, y: 58, w: 730, h: 94 };
// Extrusion depth in wordmark units (the letter strokes are 12 wide)
const DEPTH = 20;
// Resting pose: the top leans towards the viewer, so the letters' top faces show
const TILT = 0.3;
// A long, narrow lens: enough perspective for depth, little distortion at the ends
const FOV = 14;
// Share of the wordmark's box the letters span at rest. The rest is room for the
// lean, so the nearer end never runs off the screen with the pointer at an edge.
const SPAN = 0.92;
// Large, hard-edged letters: worth real device pixels (capped for 3x phones)
const MAX_PIXEL_RATIO = 2;

/**
 * The QYNESIS brand wordmark as solid extruded 3D letters, shaded like the hero's
 * 3D Q and leaning gently towards the pointer. Built at idle time after the
 * intro, rendered only while on screen. Until it is ready (or without WebGL) the
 * outline wordmark stands in.
 */
export default function BrandWordmark3D({
  matcapSrc = "/models/q-matcap.webp",
  className = "",
}: BrandWordmark3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let teardown: (() => void) | undefined;

    // Well after the intro and the hero's own WebGL setup, at idle time
    const cancelStart = afterAppReady(
      () => {
        if (disposed) return;
        try {
          teardown = setup(mount);
        } catch (err) {
          console.error("BrandWordmark3D: WebGL unavailable", err);
        }
      },
      { delay: 3000, timeout: 2000 },
    );

    return () => {
      disposed = true;
      cancelStart();
      teardown?.();
    };

    function setup(mountEl: HTMLDivElement): () => void {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ── Renderer / scene / camera ───────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      mountEl.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 10000);
      const pivot = new THREE.Group();
      scene.add(pivot);

      // ── The letters: every brand piece extruded into a solid ─────────────────
      // Touching pieces share coplanar faces with identical matcap shading, so
      // they read as one solid letter without merging the outlines first.
      const markup = `<svg xmlns="http://www.w3.org/2000/svg">${WORDMARK_LETTERS.flatMap(
        ({ shapes }) => shapes,
      )
        .map((d) => `<path d="${d}"/>`)
        .join("")}</svg>`;
      const shapes = new SVGLoader()
        .parse(markup)
        .paths.flatMap((path) => SVGLoader.createShapes(path));
      const geometry = new THREE.ExtrudeGeometry(shapes, {
        depth: DEPTH,
        bevelEnabled: false,
        curveSegments: 16,
      });
      // Centre on the flat wordmark's bounds, front faces on z = 0, depth going
      // away from the viewer, so at rest the faces sit where the flat letters did
      geometry.translate(-(BOUNDS.x + BOUNDS.w / 2), -(BOUNDS.y + BOUNDS.h / 2), -DEPTH);

      // Baked satin-silver look; the matcap already holds final tone-mapped colours
      // (tinted a touch darker than the hero Q, to sit back in the footer)
      const material = new THREE.MeshMatcapMaterial({ color: 0xc4c4c4 });
      material.toneMapped = false;
      let matcapTexture: THREE.Texture | null = null;

      const mesh = new THREE.Mesh(geometry, material);
      // SVG's y axis points down (three.js mirrors the winding for flipped objects)
      mesh.scale.y = -1;
      pivot.add(mesh);
      pivot.rotation.x = TILT;

      // ── Sizing: the letters span the wordmark's box, as the flat ones did ────
      // The canvas overhangs that box, giving the depth and the lean room to show
      const fit = () => {
        const { clientWidth: w, clientHeight: h } = mountEl;
        const boxWidth = mountEl.parentElement?.clientWidth || w;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const halfWidth = (BOUNDS.w / 2) * (w / boxWidth) / SPAN;
        const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
        camera.position.set(0, 0, halfWidth / (tanHalfFov * camera.aspect));
        camera.updateProjectionMatrix();
        render();
      };

      // ── Pointer → target lean (window-level, nothing intercepted) ───────────
      const target = { x: 0, y: 0 };
      const onPointerMove = (e: PointerEvent) => {
        target.y = ((e.clientX / window.innerWidth) * 2 - 1) * 0.08;
        target.x = ((e.clientY / window.innerHeight) * 2 - 1) * 0.07;
      };
      const onPointerLeave = () => {
        target.x = 0;
        target.y = 0;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);

      // ── Render loop: only once built and while on screen ────────────────────
      let ready = false;
      let onScreen = false;
      let running = false;
      let frame = 0;
      let last = 0;
      let elapsed = 0;

      const render = () => {
        if (ready) renderer.render(scene, camera);
      };

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        elapsed += dt;
        const ease = reduceMotion ? 0.15 : 0.05;
        // A slow idle sway keeps the depth readable even without a pointer
        const sway = reduceMotion ? 0 : Math.sin(elapsed * 0.4) * 0.02;

        pivot.rotation.y += (target.y + sway - pivot.rotation.y) * ease;
        pivot.rotation.x += (TILT + target.x - pivot.rotation.x) * ease;
        render();
      };

      const updateLoop = () => {
        const shouldRun = ready && onScreen;
        if (shouldRun && !running) {
          running = true;
          last = 0;
          frame = requestAnimationFrame(tick);
        } else if (!shouldRun && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      };

      const visibility = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        updateLoop();
      });
      visibility.observe(mountEl);

      const resize = new ResizeObserver(fit);
      resize.observe(mountEl);
      fit();

      // Matcap decoded off the main thread, shaders compiled in the background
      (async () => {
        try {
          const res = await fetch(matcapSrc);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const bitmap = await createImageBitmap(await res.blob());
          if (disposed) {
            bitmap.close();
            return;
          }
          matcapTexture = new THREE.Texture(bitmap);
          matcapTexture.colorSpace = THREE.SRGBColorSpace;
          matcapTexture.needsUpdate = true;
          material.matcap = matcapTexture;

          await renderer.compileAsync(scene, camera);
          if (disposed) return;
          ready = true;
          render();
          setIsReady(true);
          updateLoop();
        } catch (err) {
          console.error("BrandWordmark3D: failed to build", err);
        }
      })();

      return () => {
        running = false;
        cancelAnimationFrame(frame);
        visibility.disconnect();
        resize.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);
        geometry.dispose();
        material.dispose();
        matcapTexture?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
  }, [matcapSrc]);

  return (
    // Same box as the flat wordmark, so the footer layout doesn't change
    <div className={`relative w-full aspect-730/94 ${className}`}>
      {/* Flat outline stand-in until the 3D letters are ready (same span as them) */}
      <div
        aria-hidden={isReady}
        className={`absolute inset-y-0 inset-x-[4%] flex items-center transition-opacity duration-700 ${
          isReady ? "opacity-0" : "opacity-100"
        }`}
      >
        <BrandWordmark variant="outline" />
      </div>
      <div
        ref={mountRef}
        aria-hidden="true"
        className={`absolute inset-x-[-4%] inset-y-[-45%] pointer-events-none transition-opacity duration-700 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
