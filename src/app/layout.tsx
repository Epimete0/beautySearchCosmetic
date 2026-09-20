import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BeautySearch — Catálogo de Productos",
  description: "Escaneo y catalogación ágil de productos cosméticos y de cuidado personal",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${publicSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="bg-[#F1EEF2] text-[#211B26] font-body min-h-screen antialiased flex flex-col md:flex-row">
        <Navigation />
        <main className="flex-1 md:pl-24 lg:pl-48 min-h-screen pb-20 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
