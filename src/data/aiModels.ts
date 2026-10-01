export type AiModality = "Vision" | "Audio" | "Multimodal";

export interface AiCapability {
  id: string;
  /** Capability name shown on the card */
  title: string;
  /** Hugging Face–style task tag */
  task: string;
  modality: AiModality;
  image: string;
}

// Unsplash sources serve CORS headers, which the WebGL helix needs for its textures
const unsplash = (photo: string, width = 1200) =>
  `https://images.unsplash.com/${photo}?w=${width}&auto=format&fit=crop&q=85`;

// Helix cards render at most ~330px wide, so 720px textures are plenty and
// decode/upload ~3x faster than 1200px ones
const HELIX_WIDTH = 720;
// Model cards render at most ~460px wide (3 columns); 800px covers 1.5x screens
const CARD_WIDTH = 800;

/** AI models we have built and integrated into client websites */
export const AI_CAPABILITIES: AiCapability[] = [
  {
    id: "01",
    title: "Image to Text",
    task: "Image-to-Text · OCR",
    modality: "Multimodal",
    image: unsplash("photo-1648279220423-14606cb98f22", CARD_WIDTH),
  },
  {
    id: "02",
    title: "Voice Detection",
    task: "Voice Activity Detection",
    modality: "Audio",
    image: unsplash("photo-1724185773486-0b39642e607e", CARD_WIDTH),
  },
  {
    id: "03",
    title: "AI Camera",
    task: "Real-time Object Detection",
    modality: "Vision",
    image: unsplash("photo-1563920443079-783e5c786b83", CARD_WIDTH),
  },
  {
    id: "04",
    title: "Voice to Text Generation",
    task: "Automatic Speech Recognition",
    modality: "Audio",
    image: unsplash("photo-1589903308904-1010c2294adc", CARD_WIDTH),
  },
  {
    id: "05",
    title: "Image Background Remove",
    task: "Image Segmentation",
    modality: "Vision",
    image: unsplash("photo-1758600587382-2d7da8b9e361", CARD_WIDTH),
  },
  {
    id: "06",
    title: "Image Classification",
    task: "Image Classification",
    modality: "Vision",
    image: unsplash("photo-1606098216818-40939b7c98ad", CARD_WIDTH),
  },
];

/** AI-themed imagery for the 3D helix ribbon */
export const AI_HELIX_IMAGES: string[] = [
  unsplash("photo-1697577418970-95d99b5a55cf", HELIX_WIDTH), // AI chip
  unsplash("photo-1674027444485-cec3da58eef4", HELIX_WIDTH), // neural network sphere
  unsplash("photo-1737644467636-6b0053476bb2", HELIX_WIDTH), // humanoid robot
  unsplash("photo-1734597949889-f8e2ec87c8ea", HELIX_WIDTH), // glowing AI processor
  unsplash("photo-1737505599159-5ffc1dcbc08f", HELIX_WIDTH), // circuit brain
  unsplash("photo-1535378620166-273708d44e4c", HELIX_WIDTH), // white robot
];
