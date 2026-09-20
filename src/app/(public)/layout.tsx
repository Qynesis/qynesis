import React from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransitionProvider>
      <div className="flex flex-col min-h-screen overflow-x-clip">
        <PublicNavbar />
        <main className="flex-1 overflow-x-clip">
          {children}
        </main>
        <PublicFooter />
      </div>
    </PageTransitionProvider>
  );
}
