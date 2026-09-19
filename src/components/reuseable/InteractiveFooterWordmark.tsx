"use client";

import React, { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import ElasticSvgPath, { PointerState } from "./ElasticSvgPath";
import FooterAtmosphere from "./FooterAtmosphere";

// Real acoustic guitar string frequencies (Hz) - E A D G B E tuning
const ACOUSTIC_GUITAR_SCALE = [
  82.41, // E2 (Low E string)
  110.00, // A2 (A string)
  146.83, // D3 (D string)
  196.00, // G3 (G string)
  246.94, // B3 (B string)
  329.63, // E4 (High E string)
  392.00, // G4
  440.00, // A4
  493.88, // B4
  587.33, // D5
  659.25, // E5
];

const NUM_LINES = 12;

interface InteractiveFooterWordmarkProps {
  text?: string;
}

export default function InteractiveFooterWordmark({
  text = "QYNESIS",
}: InteractiveFooterWordmarkProps) {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Pointer state stored in ref for 60fps zero-react-render physics loop
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    isHovered: false,
  });

  const lastMousePos = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = Math.min(
      1200,
      Math.max(0, ((e.clientX - rect.left) / rect.width) * 1200)
    );
    const currentY = Math.min(
      240,
      Math.max(0, ((e.clientY - rect.top) / rect.height) * 240)
    );
    const now = performance.now();

    // Ensure AudioContext is unlocked/resumed via direct user gesture
    if (!isMuted) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
      } catch {
        // Fallback
      }
    }

    let vx = 0;
    let vy = 0;

    if (lastMousePos.current) {
      const dt = Math.max(1, now - lastMousePos.current.time);
      vx = (currentX - lastMousePos.current.x) / dt;
      vy = (currentY - lastMousePos.current.y) / dt;
    }

    lastMousePos.current = { x: currentX, y: currentY, time: now };

    pointerRef.current = {
      x: currentX,
      y: currentY,
      vx,
      vy,
      isHovered: true,
    };
  };

  const handleMouseLeave = () => {
    pointerRef.current.isHovered = false;
    lastMousePos.current = null;
  };

  // Realistic Acoustic Guitar Pluck Synthesizer
  const handlePluck = (lineIndex: number, xPos: number) => {
    if (isMuted) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Map X position across the 7 letter columns (Q, Y, N, E, S, I, S)
      const colIndex = Math.min(6, Math.max(0, Math.floor((xPos / 1200) * 7)));
      const freq =
        ACOUSTIC_GUITAR_SCALE[colIndex % ACOUSTIC_GUITAR_SCALE.length];

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);

      // 1. Pick Attack Impact Noise Burst (Plectrum Strike)
      const bufferSize = Math.floor(ctx.sampleRate * 0.005);
      if (bufferSize > 0) {
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(3200, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.005);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noiseNode.start(now);
      }

      // 2. String Vibrational Harmonics (Fundamental + 2nd + 3rd Harmonics)
      const osc1 = ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(freq, now);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, now);

      const osc3 = ctx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(freq * 3, now);

      // Dynamic Lowpass Filter (Pluck brightness decay)
      const stringFilter = ctx.createBiquadFilter();
      stringFilter.type = "lowpass";
      stringFilter.frequency.setValueAtTime(2800, now);
      stringFilter.frequency.exponentialRampToValueAtTime(400, now + 0.3);

      // Acoustic Body Wood Chamber Resonance Filter
      const bodyFilter = ctx.createBiquadFilter();
      bodyFilter.type = "peaking";
      bodyFilter.frequency.setValueAtTime(240, now);
      bodyFilter.Q.setValueAtTime(2.2, now);
      bodyFilter.gain.setValueAtTime(3.5, now);

      // String Envelope (Fast 4ms attack, natural acoustic ring decay over 1.0s)
      const stringGain = ctx.createGain();
      const stringVol = 0.22;
      stringGain.gain.setValueAtTime(0.001, now);
      stringGain.gain.linearRampToValueAtTime(stringVol, now + 0.004);
      stringGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

      osc1.connect(stringFilter);
      osc2.connect(stringFilter);
      osc3.connect(stringFilter);
      stringFilter.connect(bodyFilter);
      bodyFilter.connect(stringGain);
      stringGain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + 1.0);
      osc2.stop(now + 1.0);
      osc3.stop(now + 1.0);
    } catch {
      // AudioContext fallback
    }
  };

  const lineYPositions = Array.from({ length: NUM_LINES }).map((_, i) => {
    return (i + 0.5) * (240 / NUM_LINES);
  });

  return (
    <div className="relative w-full space-y-2">
      {/* Interactive Line-Art Typography Container */}
      <div className="relative w-full overflow-hidden select-none py-4 cursor-pointer group">
        {/* Atmospheric Ambient Smoke Layer */}
        <div className="relative w-full flex items-center justify-center">
          <svg
            viewBox="0 0 1200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleMouseMove}
          >
            {/* Hit-test overlay to capture 100% of pointer events across the entire SVG canvas */}
            <rect
              x="0"
              y="0"
              width="1200"
              height="240"
              fill="transparent"
              pointerEvents="all"
            />

            <defs>
              {/* Text Mask creating the QYNESIS wireframe letterforms */}
              <mask id="qynesis-wordmark-mask" maskUnits="userSpaceOnUse">
                <rect x="0" y="0" width="1200" height="240" fill="black" />
                <text
                  x="50%"
                  y="53%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="300"
                  fontWeight="900"
                  letterSpacing="0.0em"
                  lengthAdjust="spacing"
                  style={{
                    fontFamily: "var(--font-familjen), sans-serif",
                  }}
                >
                  {text}
                </text>
              </mask>
            </defs>

            {/* Masked Physical Elastic String Paths */}
            <g mask="url(#qynesis-wordmark-mask)">
              {lineYPositions.map((y, i) => (
                <ElasticSvgPath
                  key={`elastic-string-${i}`}
                  yPos={y}
                  pathIndex={i}
                  pointerRef={pointerRef}
                  onPluck={handlePluck}
                  strokeColor="rgba(255, 255, 255, 0.38)"
                  strokeWidth={1.2}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
