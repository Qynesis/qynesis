export interface TestimonialData {
  id: string;
  clientName: string;
  role: string;
  company: string;
  avatar: string;
  projectTitle: string;
  projectCategory: string;
  tagline: string;
  quote: string;
  stats?: string;
  image: string;
  href?: string;
  theme: "dark" | "light";
}

export const TESTIMONIALS: TestimonialData[] = [
  {
    id: "01",
    clientName: "Alex Rivera",
    role: "VP of Product",
    company: "MyWorker AI",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    projectTitle: "MyWorker AI",
    projectCategory: "AI Digital Workforce Platform",
    tagline: "Hi, I'm Alex. Boost your workforce with AI digital workers.",
    quote:
      "Qynesis completely redefined how our users interact with autonomous AI agents. The spatial interface and frictionless workflow increased enterprise customer retention by 84%.",
    stats: "+84% Enterprise Retention",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&auto=format&fit=crop&q=85",
    theme: "light",
  },
  {
    id: "02",
    clientName: "Elena Rostova",
    role: "Co-Founder & Creative Director",
    company: "Pulse Studio",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    projectTitle: "Pulse Studio",
    projectCategory: "Independent Audio & Motion Studio",
    tagline: "An Independent Music Studio Shaped by Sound, Built to Move Culture.",
    quote:
      "Working with Qynesis was electric. They took our sonic identity and engineered a dark, atmospheric web ecosystem that feels alive on every single scroll and beat.",
    stats: "Site of the Day · Awwwards",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=85",
    theme: "dark",
  },
  {
    id: "03",
    clientName: "Marcus Vance",
    role: "Managing Director",
    company: "Loftloom Living",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    projectTitle: "Loftloom",
    projectCategory: "Ultra-Luxury Architectural Discovery",
    tagline: "LIVE LIFE IN LUXURY · Seamless real estate platform for effortless discovery.",
    quote:
      "The cinematic elegance and precision Qynesis brought to Loftloom set an entirely new benchmark for luxury real estate platforms. Our high-net-worth inquiries skyrocketed.",
    stats: "10K+ Verified Clients",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85",
    theme: "light",
  },
  {
    id: "04",
    clientName: "Sophia Lin",
    role: "Head of Design",
    company: "Aether Systems",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
    projectTitle: "Aether BioTech",
    projectCategory: "Next-Gen Computational Medicine",
    tagline: "Decoding cellular intelligence through generative computational biology.",
    quote:
      "The level of technical rigor and bespoke art direction that Qynesis provides is peerless. They translated complex molecular computation into an experience that feels pure magic.",
    stats: "3.2x Seed-to-Series A Valuation",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1600&auto=format&fit=crop&q=85",
    theme: "dark",
  },
];
