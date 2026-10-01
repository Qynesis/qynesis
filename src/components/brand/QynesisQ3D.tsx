"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { afterAppReady, whenIdle } from "@/lib/appReady";
import { onQStageCovered } from "@/lib/qStageEvents";

interface QynesisQ3DProps {
  /** Web-optimised GLB (meshopt compressed) */
  src?: string;
  /**
   * Material capture of the brand's satin-silver look (physical metal + studio
   * reflections + key/rim lights), baked offline. With a fixed camera this shades
   * the Q identically to the live lighting, without compiling PBR/environment
   * shaders at runtime (which froze the page for ~0.7s on integrated GPUs).
   */
  matcapSrc?: string;
  /** Fraction of the viewport height the Q should occupy */
  heightRatio?: number;
  /** Max left/right turn (radians) when the pointer reaches the screen edge */
  maxYaw?: number;
  /** Opacity once loaded (applied to the canvas container, no extra layer) */
  opacity?: number;
  className?: string;
}

const FOV = 30;
const CAMERA_Z = 10;
// The Q is shown dimmed and soft, so 1x device pixels is visually identical
// to higher ratios at a fraction of the GPU cost
const MAX_PIXEL_RATIO = 1;

/**
 * Brand Q rendered with three.js. Rotates toward the pointer (tracked on window,
 * so it never blocks clicks or the fluid cursor). The model downloads during the
 * intro, is built once the intro has finished, and only renders while on screen
 * and not covered by another panel.
 */
export default function QynesisQ3D({
  src = "/models/qynesis-q.glb",
  matcapSrc = "/models/q-matcap.webp",
  heightRatio = 0.46,
  maxYaw = 0.75,
  opacity = 1,
  className = "",
}: QynesisQ3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let teardown: (() => void) | undefined;

    // Network + off-thread decoding only, so both can overlap the intro
    const modelData = fetch(src).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    });
    modelData.catch(() => {});
    const matcapImage = fetch(matcapSrc)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => createImageBitmap(blob));
    matcapImage.catch(() => {});

    const cancelStart = afterAppReady(() => {
      if (!disposed) teardown = setup(mount);
    });

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
      mountEl.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
      camera.position.set(0, 0, CAMERA_Z);

      // pivot = pointer rotation, floater = idle bob, model is centred inside
      const pivot = new THREE.Group();
      const floater = new THREE.Group();
      pivot.add(floater);
      scene.add(pivot);

      // Baked satin-silver look; the matcap already holds final tone-mapped colours
      const material = new THREE.MeshMatcapMaterial({ side: THREE.DoubleSide });
      material.toneMapped = false;
      let matcapTexture: THREE.Texture | null = null;

      let modelSize = new THREE.Vector3(1, 1, 1);

      // ── Sizing: fit the Q to heightRatio of the viewport, narrower on portrait ──
      // The Q is sized against the *viewport*, so the canvas itself can be just a
      // square around it (far fewer pixels to clear and composite every frame)
      const fit = () => {
        const { clientWidth: w, clientHeight: h } = mountEl;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        const visibleH = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
        const targetHeightPx = Math.min(
          window.innerHeight * heightRatio,
          (window.innerWidth * 0.62 * modelSize.y) / modelSize.x,
        );
        floater.scale.setScalar((targetHeightPx * (visibleH / h)) / modelSize.y);
      };

      // ── Pointer → target rotation (window-level, nothing intercepted) ───────
      const target = { x: 0, y: 0 };
      const onPointerMove = (e: PointerEvent) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        target.y = nx * maxYaw;
        target.x = ny * 0.22;
      };
      const onPointerLeave = () => {
        target.x = 0;
        target.y = 0;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);

      // ── Render loop: only while ready, on screen and not covered ───────────
      let frame = 0;
      let running = false;
      let modelReady = false;
      let onScreen = false;
      let covered = false;
      let elapsed = 0;
      let last = 0;

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        elapsed += dt;
        const ease = reduceMotion ? 0.15 : 0.06;

        pivot.rotation.y += (target.y - pivot.rotation.y) * ease;
        pivot.rotation.x += (target.x - pivot.rotation.x) * ease;

        if (!reduceMotion) {
          floater.position.y = Math.sin(elapsed * 0.8) * 0.06;
          floater.rotation.z = Math.sin(elapsed * 0.45) * 0.025;
        }

        renderer.render(scene, camera);
      };

      const updateLoop = () => {
        const shouldRun = modelReady && onScreen && !covered;
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

      const offCovered = onQStageCovered((isCovered) => {
        covered = isCovered;
        updateLoop();
      });

      const resize = new ResizeObserver(fit);
      resize.observe(mountEl);
      fit();

      // ── Build at idle time so no single task blocks a frame ──────────────────
      const cancelIdle = whenIdle(async () => {
        try {
          const [buffer, bitmap] = await Promise.all([modelData, matcapImage]);
          if (disposed) {
            bitmap.close();
            return;
          }
          matcapTexture = new THREE.Texture(bitmap);
          matcapTexture.colorSpace = THREE.SRGBColorSpace;
          matcapTexture.needsUpdate = true;
          material.matcap = matcapTexture;

          const loader = new GLTFLoader();
          loader.setMeshoptDecoder(MeshoptDecoder);
          const gltf = await loader.parseAsync(buffer, "");
          if (disposed) return;

          const model = gltf.scene;
          model.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const mesh = obj as THREE.Mesh;
              const old = mesh.material as THREE.Material | THREE.Material[];
              (Array.isArray(old) ? old : [old]).forEach((m) => m.dispose());
              mesh.material = material;
            }
          });

          const box = new THREE.Box3().setFromObject(model);
          modelSize = box.getSize(new THREE.Vector3());
          model.position.sub(box.getCenter(new THREE.Vector3()));
          floater.add(model);
          fit();

          // Compile shaders in the background (parallel compile) instead of
          // stalling the first rendered frame
          await renderer.compileAsync(scene, camera);
          if (disposed) return;

          modelReady = true;
          setIsReady(true);
          updateLoop();
        } catch (err) {
          console.error("QynesisQ3D: failed to load model", err);
        }
      });

      return () => {
        cancelIdle();
        running = false;
        cancelAnimationFrame(frame);
        visibility.disconnect();
        resize.disconnect();
        offCovered();
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onPointerLeave);

        floater.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) (obj as THREE.Mesh).geometry.dispose();
        });
        material.dispose();
        matcapTexture?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
  }, [src, matcapSrc, heightRatio, maxYaw]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isReady ? "scale-100" : "scale-[0.92]"
      } ${className}`}
      style={{ opacity: isReady ? opacity : 0 }}
    />
  );
}
