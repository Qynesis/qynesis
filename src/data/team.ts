import arafatPhoto from "@/assets/team-members/arafat-2.jpg";
import armanPhoto from "@/assets/team-members/arman.jpeg";
import sazzadPhoto from "@/assets/team-members/sazzad.png";
import zayedPhoto from "@/assets/team-members/zayed.png"
import naimPhoto from "@/assets/team-members/MdKaziNaim.png"
import irfanPhoto from "@/assets/team-members/Irfan.png"

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
    role: "Business Analyst",
    discipline: "Art Direction & Brand Architecture",
    image: arafatPhoto.src,
    imagePosition: "50% 8%",
    location: "Chattogram, Bangladesh",
  },
  {
    id: "02",
    name: "Arman Hasan",
    role: "Software Engineer",
    discipline: "WebGL & Interactive Systems",
    image: armanPhoto.src,
    imagePosition: "50% 5%",
    location: "Chattogram, Bangladesh",
  },
  {
    id: "03",
    name: "Irfan Kabir",
    role: "Software Engineer",
    discipline: "Cinematics & Spatial Design",
    image: irfanPhoto.src,
    imagePosition: "50% 10%",
    location: "Hong Kong",
  },
  {
    id: "04",
    name: "Zayed Iqbal",
    role: "Backend Lead Engineer",
    discipline: "Generative AI & Shader Dev",
    image: zayedPhoto.src,
    imagePosition: "50% 30%",
    location: "Dhaka, Bangladesh",
  },
  {
    id: "05",
    name: "Kazi Naim",
    role: "Frontend Engineer",
    discipline: "Design Systems & UX Architecture",
    image: naimPhoto.src,
    imagePosition: "50% 8%",
    location: "Dhaka, Bangladesh",
  },
  {
    id: "06",
    name: "Sazzad Mahim",
    role: "Software Engineer",
    discipline: "Content Strategy & Identity",
    image: sazzadPhoto.src,
    location: "Chattogram, Bangladesh",
  },
];
