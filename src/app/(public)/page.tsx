import React from "react";
import Banner from "./home/_components/banner";
import AboutSection from "./home/_components/about";
import InfiniteMarqueeBlinds from "@/components/reuseable/InfiniteMarqueeBlinds";
import GallerySection from "./home/_components/GallerySection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#080808] text-white">
      <Banner />
      <AboutSection />
      <InfiniteMarqueeBlinds />
      <GallerySection />
    </div>
  );
}
