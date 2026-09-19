import React from "react";
import Banner from "./_components/banner";
import AboutSection from "./_components/about";
import InfiniteMarqueeBlinds from "@/components/reuseable/InfiniteMarqueeBlinds";
import KeyFactsSection from "./_components/KeyFactsSection";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#080808] text-white">
      <Banner />
      <AboutSection />
      <InfiniteMarqueeBlinds />
      <KeyFactsSection />
    </div>
  );
}
