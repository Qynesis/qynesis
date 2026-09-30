export interface TeamMember {
  id: string;
  name: string;
  role: string;
  discipline: string;
  image: string;
  location?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "01",
    name: "Elena Rostova",
    role: "Founder & Creative Director",
    discipline: "Art Direction & Brand Architecture",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=85",
    location: "Stockholm / Berlin",
  },
  {
    id: "02",
    name: "Marcus Vance",
    role: "Head of Creative Engineering",
    discipline: "WebGL & Interactive Systems",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=85",
    location: "London / NYC",
  },
  {
    id: "03",
    name: "Sophia Lindqvist",
    role: "Principal 3D & Motion Artist",
    discipline: "Cinematics & Spatial Design",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=85",
    location: "Copenhagen",
  },
  {
    id: "04",
    name: "Kaito Tanaka",
    role: "Lead Creative Technologist",
    discipline: "Generative AI & Shader Dev",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=85",
    location: "Tokyo",
  },
  {
    id: "05",
    name: "Zoe Chen",
    role: "Design Systems & Product Lead",
    discipline: "Design Systems & UX Architecture",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=85",
    location: "San Francisco",
  },
  {
    id: "06",
    name: "Liam O'Connor",
    role: "Strategy & Brand Narrative Lead",
    discipline: "Content Strategy & Identity",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&auto=format&fit=crop&q=85",
    location: "Amsterdam",
  },
];
