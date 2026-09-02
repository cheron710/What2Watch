import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

/* Editorial display serif — used only for large titles. Upright, never italic. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: "normal",
  display: "swap",
});

/* Grotesque — everything else: UI, body, labels. */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "What2Watch — Cinematic Discovery",
  description: "An intelligent, cinematic way to find your next film.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F0E7" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0B08" },
  ],
};

/* Runs before first paint to prevent a theme flash. */
const themeInit = `(function(){try{var t=localStorage.getItem('w2w-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${geist.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col overflow-x-hidden antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <LayoutWrapper header={<Header />} footer={<Footer />}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
