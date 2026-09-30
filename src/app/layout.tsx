import type { Metadata } from "next";
import { Familjen_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import ThemeProvider from "@/components/ThemeProvider";
import SmoothScrollProvider from "@/components/common/SmoothScrollProvider";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";
import { Toaster } from "sonner";

import SplashCursor from "@/components/reuseable/SplashCursor";

const familjenGrotesk = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qynesis - Designed to mean purpose.",
  description: "Websites, AI products, brands, and systems built for clarity, scale and impact.",
  icons: {
    icon: "/basekitfavicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${familjenGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-white font-[family-name:var(--font-familjen)] transition-colors duration-200">
        <PageTransitionProvider>
          <StoreProvider>
            <ThemeProvider>
              <SmoothScrollProvider>
                {children}
              </SmoothScrollProvider>
              <SplashCursor
                onlyDarkBackground={true}
                RAINBOW_MODE={false}
                COLOR="#707070"
                DENSITY_DISSIPATION={2.5}
                VELOCITY_DISSIPATION={1.8}
                PRESSURE={0.15}
                CURL={3.5}
                SPLAT_RADIUS={0.18}
                SPLAT_FORCE={4500}
              />
              <Toaster position="top-right" richColors />
            </ThemeProvider>
          </StoreProvider>
        </PageTransitionProvider>
      </body>
    </html>
  );
}

