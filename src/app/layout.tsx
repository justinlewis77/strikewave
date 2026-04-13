import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { InstallBanner } from "@/components/InstallBanner";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "StrikeWave — Seasonal Bass Engine",
  description: "AI-powered largemouth bass lure recommendations based on real-time conditions",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StrikeWave",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff0080",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-sans antialiased" style={{ background: "#0B0F1A" }}>
        <ServiceWorkerRegistrar />
        <NavBar />
        <main className="pt-16 min-h-dvh">{children}</main>
        <InstallBanner />
      </body>
    </html>
  );
}
