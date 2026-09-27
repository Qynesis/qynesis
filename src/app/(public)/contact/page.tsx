import ContactFormSection from "./_components/ContactFormSection";
import QuestionsSection from "./_components/QuestionsSection";

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen bg-[#070707] flex flex-col">
      <ContactFormSection />
      <QuestionsSection />
    </div>
  );
}
