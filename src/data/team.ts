import arafatPhoto from "@/assets/team-members/arafat-2.jpg";
import armanPhoto from "@/assets/team-members/arman.jpeg";
import sazzadPhoto from "@/assets/team-members/sazzad.png";
import zayedPhoto from "@/assets/team-members/zayed.png"
import naimPhoto from "@/assets/team-members/MdKaziNaim.png"

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  discipline: string;
  image: string;
  /** CSS object-position that keeps the face in frame when the photo is cropped */
  imagePosition?: string;
  location?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "01",
    name: "Arafat Hossain",
    role: "Founder & Creative Director",
    discipline: "Art Direction & Brand Architecture",
    image: arafatPhoto.src,
    imagePosition: "50% 8%",
    location: "Chattogram, Bangladesh",
  },
  {
    id: "02",
    name: "Arman Hasan",
    role: "Head of Creative Engineering",
    discipline: "WebGL & Interactive Systems",
    image: armanPhoto.src,
    imagePosition: "50% 5%",
    location: "Dhaka, Bangladesh",
  },
  {
    id: "03",
    name: "Sazzad Hosen",
    role: "Principal 3D & Motion Artist",
    discipline: "Cinematics & Spatial Design",
    image: sazzadPhoto.src,
    imagePosition: "50% 45%",
    location: "Chattogram, Bangladesh",
  },
  {
    id: "04",
    name: "Zayed Iqbal",
    role: "Lead Creative Technologist",
    discipline: "Generative AI & Shader Dev",
    image: zayedPhoto.src,
    imagePosition: "50% 30%",
    location: "Dhaka, Bangladesh",
  },
  {
    id: "05",
    name: "Kazi Naim",
    role: "Design Systems & Product Lead",
    discipline: "Design Systems & UX Architecture",
    image: naimPhoto.src,
    imagePosition: "50% 8%",
    location: "Dhaka, Bangladesh",
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
