import React from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex flex-col min-h-screen overflow-x-clip">
      <PublicNavbar />
      <main className="relative z-10 flex-1 overflow-x-clip">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
