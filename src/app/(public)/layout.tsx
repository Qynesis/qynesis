import React from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import ContactModalsProvider from "@/components/contact/ContactModals";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContactModalsProvider>
      <div className="relative z-10 flex flex-col min-h-screen overflow-x-clip">
        <PublicNavbar />
        <main className="relative z-10 flex-1 overflow-x-clip">
          {children}
        </main>
        <PublicFooter />
      </div>
    </ContactModalsProvider>
  );
}
