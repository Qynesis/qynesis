import React from "react";
import Banner from "./home/_components/banner";
import AboutSection from "./home/_components/about";
import InfiniteMarqueeBlinds from "@/components/reuseable/InfiniteMarqueeBlinds";
import GallerySection from "./home/_components/GallerySection";
import ServicesSection from "./home/_components/ServicesSection";
import AiDesignSection from "./home/_components/AiDesignSection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-transparent text-white">
      <Banner />
      <AboutSection />
      <InfiniteMarqueeBlinds />
      <GallerySection />
      <ServicesSection />
      <AiDesignSection />
    </div>
  );
}

