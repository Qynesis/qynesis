import { Project } from "./types";

export const projects: Project[] = [
  {
    id: 1,
    title: "Nexura Cloud Platform",
    subtitle: "Next-Gen Cloud Infrastructure Management & Observability Dashboard",
    category: "Web App & SaaS",
    client: "Nexura Systems",
    year: "2026",
    role: "Lead Cloud Architect & Creative Technologist",
    overview:
      "A unified cloud observability and infrastructure platform, translating multi-region Kubernetes telemetry into high-density real-time interactive diagrams.",
    challenge:
      "Rendering streaming real-time metrics across 10,000+ distributed microservices without CPU or DOM bloat.",
    solution:
      "Built a bespoke WebGL node graph renderer with adaptive LOD clustering and hardware-accelerated time-series buffers.",
    services: [
      "Cloud Systems",
      "Interactive 3D",
      "Design System",
      "Observability UX",
    ],
    metrics: [
      { label: "Node Capacity", value: "10,000+" },
      { label: "Telemetry Latency", value: "<15ms" },
      { label: "Uptime SLA", value: "99.99%" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1695634281254-e94a29d234c0?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1695634281421-7a51001273ef?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1695634281254-e94a29d234c0?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: 0.03,
      y: 0.08,
      width: 0.22,
      height: 0.3,
    },
    depth: 0.65,
    horizontalFactor: 24,
  },
  {
    id: 2,
    title: "Aethel Design System",
    subtitle: "Modular Enterprise UI Framework & Component Architecture for FinTech",
    category: "Design System",
    client: "Aethel FinTech",
    year: "2025",
    role: "Head of Design Systems & Engineering",
    overview:
      "A comprehensive, high-security design architecture engineered for enterprise banking, institutional trading desks, and asset management platforms.",
    challenge:
      "Ensuring WCAG AAA accessibility, sub-millisecond keyboard interaction, and strict compliance across 40+ corporate applications.",
    solution:
      "Engineered headless tokenized design tokens, deterministic state machines, and zero-dependency micro-components.",
    services: [
      "Design Architecture",
      "Enterprise UI",
      "Design Tokens",
      "Accessibility",
    ],
    metrics: [
      { label: "Adopted Apps", value: "40+" },
      { label: "Component Count", value: "120+" },
      { label: "Bundle Size", value: "<18kb" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1695634281421-7a51001273ef?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1697292859724-0d2501966448?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1695634281421-7a51001273ef?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: 0.34,
      y: -0.04,
      width: 0.18,
      height: 0.36,
    },
    depth: 1.1,
    horizontalFactor: -32,
  },
  {
    id: 3,
    title: "Vanguard Brand Portal",
    subtitle: "Immersive Multi-Platform Digital Identity & Interactive Agency Showcase",
    category: "Creative Engineering",
    client: "Vanguard Creative",
    year: "2026",
    role: "Creative Director & Frontend Architect",
    overview:
      "An avant-garde digital brand portal blending editorial fashion typography, fluid physics-based transitions, and spatial audio feedback.",
    challenge:
      "Executing cinematic 3D model streaming alongside fluid touch physics across mobile and high-end desktop displays.",
    solution:
      "Implemented progressive WebP mesh compression, spring-physics layout orchestration, and non-blocking RAF loops.",
    services: [
      "Creative Engineering",
      "Brand Identity",
      "Interactive 3D",
      "Motion Design",
    ],
    metrics: [
      { label: "Frame Rate", value: "60 FPS" },
      { label: "Global Awards", value: "3x FWA" },
      { label: "Avg Session", value: "4.8m" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1697292859724-0d2501966448?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1697292859784-c319e612ea15?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1697292859724-0d2501966448?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: 0.7,
      y: 0.1,
      width: 0.27,
      height: 0.25,
    },
    depth: 0.8,
    horizontalFactor: 18,
  },
  {
    id: 4,
    title: "Solstice Studio Archive",
    subtitle: "Editorial E-Commerce Experience with Spatial Micro-Interactions",
    category: "E-Commerce",
    client: "Solstice Studio Paris",
    year: "2026",
    role: "Principal Experience Designer",
    overview:
      "An elevated luxury fashion archive and digital boutique combining brutalist editorial layout with tactile fluid shopping interactions.",
    challenge:
      "Maintaining uncompromising aesthetic minimalism while driving high-conversion, instantaneous checkout and bag workflows.",
    solution:
      "Designed optimistic mini-cart transitions, instant predictive pre-fetching, and bespoke typeface pairings.",
    services: [
      "Luxury E-Commerce",
      "Art Direction",
      "Micro-Interactions",
      "Mobile UX",
    ],
    metrics: [
      { label: "Conversion Lift", value: "+34%" },
      { label: "Page Speed", value: "99/100" },
      { label: "Catalog Items", value: "4,000+" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1697292859784-c319e612ea15?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1516131206008-dd041a9764fd?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1697292859784-c319e612ea15?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: 0.15,
      y: 0.48,
      width: 0.2,
      height: 0.28,
    },
    depth: 1.15,
    horizontalFactor: -18,
  },
  {
    id: 5,
    title: "Kinetic Matrix Labs",
    subtitle: "High-Performance WebGL Data Visualization & Real-Time Analytics",
    category: "Interactive 3D",
    client: "Matrix Quantum Labs",
    year: "2025",
    role: "Lead Graphics Engineer",
    overview:
      "A spatial analytics platform visualizing quantum particle behavior and multi-dimensional matrices in real time.",
    challenge:
      "Simulating 500,000 continuous mathematical particles without thermal throttling on portable client devices.",
    solution:
      "Leveraged WebGPU compute shaders and GPGPU instancing to execute all calculations directly on the GPU.",
    services: [
      "WebGL / WebGPU",
      "Compute Shaders",
      "Data Visualization",
      "Physics Engines",
    ],
    metrics: [
      { label: "Particles", value: "500,000" },
      { label: "Shader Latency", value: "16.6ms" },
      { label: "Shader Pass", value: "Compute" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1516131206008-dd041a9764fd?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1714578187196-6925387b9f38?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1516131206008-dd041a9764fd?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: 0.48,
      y: 0.37,
      width: 0.23,
      height: 0.34,
    },
    depth: 0.72,
    horizontalFactor: 35,
  },
  {
    id: 6,
    title: "Vertex Global Advisory",
    subtitle: "Enterprise Brand Architecture & Interactive Corporate Portal",
    category: "Brand Platform",
    client: "Vertex Advisory Zurich",
    year: "2026",
    role: "Brand Architect & Web Lead",
    overview:
      "Global advisory portal establishing an authoritative digital presence across international wealth management and corporate strategy.",
    challenge:
      "Unifying multi-lingual corporate reports, confidential research portals, and interactive economic indices.",
    solution:
      "Architected a localized edge-computed CMS with dynamic typography and encrypted client document hubs.",
    services: [
      "Brand Platform",
      "Information Architecture",
      "Edge Infrastructure",
      "Corporate UI",
    ],
    metrics: [
      { label: "Global Offices", value: "18 Hubs" },
      { label: "AUM Monitored", value: "$4.2B" },
      { label: "Languages", value: "6 Locales" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1714578187196-6925387b9f38?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1688733720228-4f7a18681c4f?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1714578187196-6925387b9f38?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: -0.04,
      y: 0.78,
      width: 0.24,
      height: 0.28,
    },
    depth: 0.94,
    horizontalFactor: 26,
  },
  {
    id: 7,
    title: "Luminary Creative Hub",
    subtitle: "Next-Generation Media Publishing & Dynamic Content Ecosystem",
    category: "Digital Experience",
    client: "Luminary Media Group",
    year: "2025",
    role: "Creative Technologist & UI Director",
    overview:
      "A fluid digital magazine platform blending long-form editorial journalism with interactive data visualisations and ambient soundscapes.",
    challenge:
      "Preserving editorial magazine layout integrity across variable viewport aspect ratios and responsive devices.",
    solution:
      "Developed an adaptive grid matrix that reflows typography and photography organically with zero cumulative layout shift.",
    services: [
      "Editorial Design",
      "Publishing Architecture",
      "Audio Atmosphere",
      "Responsive Grid",
    ],
    metrics: [
      { label: "Monthly Readers", value: "850k+" },
      { label: "CLS Score", value: "0.00" },
      { label: "Read Depth", value: "+42%" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1688733720228-4f7a18681c4f?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1688733720228-4f7a18681c4f?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: 0.33,
      y: 0.76,
      width: 0.18,
      height: 0.31,
    },
    depth: 1.18,
    horizontalFactor: -25,
  },
  {
    id: 8,
    title: "Serenade Living Space",
    subtitle: "High-End Architectural Portfolio & Interactive Virtual Showcase",
    category: "Haute Interior",
    client: "Serenade Studio Milan",
    year: "2026",
    role: "Spatial Designer & Experience Architect",
    overview:
      "An intimate spatial showcase celebrating bespoke residential architecture, tactile material palettes, and artisanal furnishings.",
    challenge:
      "Faithfully capturing physical natural lighting and textured materiality within a responsive browser window.",
    solution:
      "Used high-dynamic-range image mapping with real-time photographic tone mapping and smooth cursor parallax.",
    services: [
      "Interior Architecture",
      "Photographic Curation",
      "Material Systems",
      "Spatial UI",
    ],
    metrics: [
      { label: "Featured Spaces", value: "14 Projects" },
      { label: "Inquiry Rate", value: "+28%" },
      { label: "Design Honor", value: "Milan Triennale" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1644792863360-40fa85ea52e7?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: 0.72,
      y: 0.7,
      width: 0.22,
      height: 0.33,
    },
    depth: 0.83,
    horizontalFactor: 30,
  },
  {
    id: 9,
    title: "Obsidian Sound Foundry",
    subtitle: "Spatial Audio Synthesis Interface & Dark Aesthetic E-Store",
    category: "Interactive Audio",
    client: "Obsidian Audio Works",
    year: "2026",
    role: "Lead Audio Technologist & Art Director",
    overview:
      "A monolithic sound instrument showcase and digital store featuring real-time Web Audio synthesizer controls and dark brutalist aesthetics.",
    challenge:
      "Synthesizing spatial audio and harmonic frequency sweeps directly in client browsers with zero audio clipping or latency.",
    solution:
      "Engineered a custom AudioWorklet DSP pipeline running in a dedicated worker thread with synchronized visual oscilloscopes.",
    services: [
      "Web Audio DSP",
      "Oscilloscope Visuals",
      "AudioWorklet",
      "Dark UI Architecture",
    ],
    metrics: [
      { label: "Sample Rate", value: "96 kHz" },
      { label: "DSP Latency", value: "<5ms" },
      { label: "Sound Presets", value: "128" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1644792863360-40fa85ea52e7?w=1920&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1695634281254-e94a29d234c0?w=1920&auto=format&fit=crop&q=85",
    ],
    image:
      "https://images.unsplash.com/photo-1644792863360-40fa85ea52e7?w=1920&auto=format&fit=crop&q=85",
    mosaic: {
      x: 0.52,
      y: 0.82,
      width: 0.21,
      height: 0.3,
    },
    depth: 0.9,
    horizontalFactor: 22,
  },
];
