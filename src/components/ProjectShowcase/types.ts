export type Project = {
  id: number;
  title: string;
  subtitle?: string;
  category?: string;
  client?: string;
  year?: string;
  role?: string;
  overview?: string;
  challenge?: string;
  solution?: string;
  services?: string[];
  metrics?: { label: string; value: string }[];
  gallery?: string[];
  image: string;
  mosaic: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  depth: number;
  horizontalFactor: number;
};

export type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};
