import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://github.com/GhulamMustufa/ai-freelance-pipeline";

export const metadata: Metadata = {
  title: {
    default: "OmniBid — AI Freelance Job Analyzer & Opportunity Intelligence",
    template: "%s | OmniBid",
  },
  description:
    "Analyze freelance opportunities with AI. OmniBid evaluates fit, job quality, client signals, economics, risks and unknowns — then tells you APPLY, MAYBE, or SKIP before helping you build a grounded proposal.",
  keywords: [
    "AI freelance job analyzer",
    "freelance opportunity analysis",
    "Upwork job analyzer",
    "freelance job scoring",
    "AI freelance assistant",
    "freelance proposal generator",
    "AI opportunity intelligence",
    "freelance job evaluation",
    "OmniBid",
    "freelance decision engine",
  ],
  authors: [{ name: "Ghulam Mustufa", url: BASE_URL }],
  creator: "Ghulam Mustufa",
  publisher: "Ghulam Mustufa",
  category: "Technology",
  applicationName: "OmniBid",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "OmniBid",
    title: "OmniBid — Know which freelance jobs are worth your time",
    description:
      "Analyze freelance opportunities with AI. OmniBid evaluates fit, job quality, client signals, economics, risks and unknowns — then tells you APPLY, MAYBE, or SKIP.",
    images: [
      {
        url: "/logo.png",
        width: 1280,
        height: 853,
        alt: "OmniBid — AI Freelance Opportunity Intelligence",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OmniBid — Know which freelance jobs are worth your time",
    description:
      "Analyze freelance opportunities with AI. APPLY, MAYBE, or SKIP — with transparent reasoning, evidence-grounded proposals, and deterministic protection.",
    images: ["/logo.png"],
    creator: "@GhulamMustufa",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OmniBid",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI Opportunity Decision Intelligence Engine for freelancers. Analyzes job quality, technical fit, client signals, and economics to deliver APPLY / MAYBE / SKIP decisions with grounded proposals.",
  author: {
    "@type": "Person",
    name: "Ghulam Mustufa",
    url: BASE_URL,
  },
  programmingLanguage: ["TypeScript", "Next.js"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
