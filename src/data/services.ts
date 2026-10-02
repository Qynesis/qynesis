export interface ServiceItem {
  id: string;
  indexStr: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  offeringsCol1: string[];
  offeringsCol2: string[];
  videoSrc: string;
  posterImage?: string;
}

export const SERVICES: ServiceItem[] = [

{
  id: "software-development",
  indexStr: "01",
  title: "Software Development",
  slug: "software-development",
  tagline:
    "Engineering high-performance software, scalable digital products, and intelligent platforms built for growth.",
  description:
    "We design and engineer bespoke software solutions that combine thoughtful architecture, intuitive experiences, and reliable performance—from custom business platforms and SaaS products to complex web applications and scalable digital systems.",
  offeringsCol1: [
    "Custom Software Development",
    "Web Application Development",
    "SaaS Product Development",
  ],
  offeringsCol2: [
    "Enterprise Software Solutions",
    "API & Backend Development",
    "Software Modernization",
  ],
  videoSrc:
    "/Animate_reference_image_environment_1080p_20260921025358.mp4",
  posterImage:
    "https://images.unsplash.com/photo-1695634281254-e94a29d234c0?w=1200&auto=format&fit=crop&q=85",
},
  {
    id: "ai-development-integration",
    indexStr: "02",
    // Non-breaking space keeps "& Integration" together when the title wraps
    title: "AI Development &\u00A0Integration",
    slug: "ai-development-integration",
    tagline: "Custom AI models designed, trained and woven directly into your websites and products.",
    description:
      "From vision and audio models to language-powered features, we build AI that solves real product problems and integrate it seamlessly into your web and mobile experiences.",
    offeringsCol1: [
      "Image-to-Text & OCR Models",
      "Voice Detection & Speech-to-Text",
      "AI Camera & Object Detection",
    ],
    offeringsCol2: [
      "Background Removal & Segmentation",
      "Image Classification Pipelines",
      "AI API & Product Integration",
    ],
    videoSrc: "/Animate_reference_image_environment_1080p_20260921025358.mp4",
    posterImage: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=1200&auto=format&fit=crop&q=85",
  },
{
  id: "embedded-solutions",
  indexStr: "03",
  title: "Embedded Solutions",
  slug: "embedded-solutions",
  tagline:
    "Engineering intelligent embedded systems, connected devices, and reliable hardware-software solutions built for the real world.",
  description:
    "We design and develop embedded solutions that bridge hardware and software—from device firmware and IoT systems to connected products and real-time applications, engineered for reliability, efficiency, and seamless integration.",
  offeringsCol1: [
    "Embedded Software Development",
    "Firmware Development",
    "IoT & Connected Devices",
  ],
  offeringsCol2: [
    "Hardware-Software Integration",
    "Real-Time Embedded Systems",
    "Device & Sensor Integration",
  ],
  videoSrc:
    "/Animate_reference_image_environment_1080p_20260921025358.mp4",
  posterImage:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=85",
},

  {
    id: "branding-design",
    indexStr: "04",
    title: "Branding & Design",
    slug: "branding-and-design",
    tagline: "Sculpting iconic visual identities, design systems, and unforgettable spatial narratives.",
    description:
      "From typography and generative design systems to complete brand architecture, we craft holistic visual identities that establish authority and resonate across every touchpoint.",
    offeringsCol1: [
      "Brand Identity & Positioning",
      "Design Systems & Guidelines",
      "Custom Typography & Logomarks",
    ],
    offeringsCol2: [
      "Motion Design & Art Direction",
      "3D & Spatial Asset Creation",
      "Digital Product UI/UX",
    ],
    videoSrc: "/Animate_reference_image_environment_1080p_20260921025358.mp4",
    posterImage: "https://images.unsplash.com/photo-1695634281421-7a51001273ef?w=1200&auto=format&fit=crop&q=85",
  },
  {
    id: "crm-system",
    indexStr: "05",
    title: "CRM System",
    slug: "crm-system",
    tagline: "Custom workflow automation, client portals, and bespoke operational platforms.",
    description:
      "Eliminate bottlenecks with tailor-made CRM and enterprise platforms designed around your exact workflows, client lifecycles, and analytical decision pipelines.",
    offeringsCol1: [
      "Custom CRM Architecture",
      "Automated Sales & Lead Pipelines",
      "Client Portals & Dashboards",
    ],
    offeringsCol2: [
      "API Integrations & Webhooks",
      "Analytics & Reporting Engines",
      "Enterprise Data Migration",
    ],
    videoSrc: "/Animate_reference_image_environment_1080p_20260921025358.mp4",
    posterImage: "https://images.unsplash.com/photo-1697292859724-0d2501966448?w=1200&auto=format&fit=crop&q=85",
  },
  {
    id: "e-commerce",
    indexStr: "06",
    title: "E-Commerce",
    slug: "e-commerce",
    tagline: "Immersive commerce platforms engineered for emotional resonance and frictionless conversion.",
    description:
      "Blending editorial elegance with battle-tested payment infrastructure and lightning-quick performance to drive unprecedented customer retention and revenue growth.",
    offeringsCol1: [
      "Headless Shopify & Commerce",
      "Custom Checkout Experiences",
      "Subscription & Membership Systems",
    ],
    offeringsCol2: [
      "Interactive 3D Product Viewers",
      "Global Multi-Currency Setups",
      "ERP & Inventory Integrations",
    ],
    videoSrc: "/Animate_reference_image_environment_1080p_20260921025358.mp4",
    posterImage: "https://images.unsplash.com/photo-1697292859784-c319e612ea15?w=1200&auto=format&fit=crop&q=85",
  },
  {
    id: "app-development",
    indexStr: "07",
    title: "App Development",
    slug: "app-development",
    tagline: "Engineering native and cross-platform mobile ecosystems with seamless fluid performance.",
    description:
      "We engineer native iOS, Android, and cross-platform mobile applications defined by tactile responsiveness, offline-first reliability, and seamless cloud synchronization.",
    offeringsCol1: [
      "iOS & Android Native Apps",
      "React Native & Flutter",
      "Mobile UI/UX Architecture",
    ],
    offeringsCol2: [
      "Real-Time Sync & Offline Engines",
      "App Store Optimization (ASO)",
      "Hardware & Sensor Integration",
    ],
    videoSrc: "/Animate_reference_image_environment_1080p_20260921025358.mp4",
    posterImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop&q=85",
  },
  {
    id: "seo-digital-marketing",
    indexStr: "08",
    title: "SEO & Digital Marketing",
    slug: "seo-digital-marketing",
    tagline: "Data-driven search dominance, algorithmic visibility, and high-velocity growth channels.",
    description:
      "We execute programmatic SEO, technical crawl optimization, and multi-channel performance marketing designed to capture market intent and scale qualified inbound revenue.",
    offeringsCol1: [
      "Technical SEO & Core Web Vitals",
      "Programmatic SEO Architecture",
      "Search Intent & Keyword Strategy",
    ],
    offeringsCol2: [
      "Conversion Rate Optimization (CRO)",
      "Performance & Paid Acquisition",
      "Analytics & Attribution Modeling",
    ],
    videoSrc: "/Animate_reference_image_environment_1080p_20260921025358.mp4",
    posterImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=85",
  },
];
