import React from "react";
import Banner from "./home/_components/banner";
import AboutSection from "./home/_components/about";
import InfiniteMarqueeBlinds from "@/components/reuseable/InfiniteMarqueeBlinds";
import GallerySection from "./home/_components/GallerySection";
import ServicesSection from "./home/_components/ServicesSection";
// Temporarily hidden — keep for later
// import AiDesignSection from "./home/_components/AiDesignSection";
import QStage from "./home/_components/QStage";
import TeamSection from "./home/_components/TeamSection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-transparent text-white">
      {/* 3D brand Q stays centred behind the opening sections */}
      <QStage>
        <Banner />
        <AboutSection />
        <ServicesSection />
        <InfiniteMarqueeBlinds />
      </QStage>
      <GallerySection />
      <TeamSection />
      {/* Temporarily hidden — keep for later */}
      {/* <AiDesignSection /> */}
    </div>
  );
}

