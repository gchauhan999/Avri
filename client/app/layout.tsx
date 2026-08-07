import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/layout/Preloader";
import ScrollToTop from "@/components/layout/ScrollToTop";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MotionProvider from "@/components/ui/MotionProvider";
import { company } from "@/lib/site";
import { baseKeywords, organizationJsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Driven by NEXT_PUBLIC_SITE_URL.
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.name} — ${company.tagline}`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
  keywords: baseKeywords,
  applicationName: company.name,
  authors: [{ name: company.legalName }],
  creator: company.legalName,
  publisher: company.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: company.name,
    url: company.siteUrl,
    title: `${company.name} — ${company.tagline}`,
    description: company.description,
    images: [{ url: "/assets/logo.png", width: 1600, height: 800 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.name} — ${company.tagline}`,
    description: company.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#1E7F3F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-ink-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        <MotionProvider>
        <Preloader />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <Navbar />

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer />

        <ScrollToTop />
        <WhatsAppButton />
        </MotionProvider>
      </body>
    </html>
  );
}
