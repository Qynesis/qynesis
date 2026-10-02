import AboutHero from "./_components/AboutHero";
import AboutStory from "./_components/AboutStory";
import AboutCapabilities from "./_components/AboutCapabilities";
import AboutProcess from "./_components/AboutProcess";
import ValuesSection from "./_components/ValuesSection";
import AboutClosing from "./_components/AboutClosing";

export const metadata = {
  title: "About — Qynesis",
  description:
    "Qynesis is an independent studio of designers, engineers and AI specialists building websites, apps, platforms and custom AI.",
};

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[#070707]">
      <AboutHero />
      <AboutStory />
      <AboutCapabilities />
      <AboutProcess />
      <ValuesSection />
      <AboutClosing />
    </div>
  );
}
