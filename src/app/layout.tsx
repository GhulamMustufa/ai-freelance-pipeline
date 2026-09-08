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
  // ── Core ──────────────────────────────────────────────────────────────────
  title: {
    default: "OmniBid Intelligence Engine",
    template: "%s | OmniBid Intelligence Engine",
  },
  description:
    "An autonomous, multi-agent AI pipeline that discovers freelance opportunities, evaluates technical fit, generates evidence-grounded proposals, and learns from real-world outcomes. Built with Next.js, DeepSeek, OpenAI, Prisma, and MCP.",
  keywords: [
    "AI freelance pipeline",
    "multi-agent AI system",
    "autonomous proposal generation",
    "RAG retrieval augmented generation",
    "LLM pipeline",
    "OpenAI GPT-4o",
    "DeepSeek",
    "Next.js AI",
    "Upwork automation",
    "AI model routing",
    "freelance intelligence",
    "agentic workflow",
    "OmniBid",
    "AI portfolio project",
    "TypeScript AI",
  ],
  authors: [{ name: "Ghulam Mustufa", url: BASE_URL }],
  creator: "Ghulam Mustufa",
  publisher: "Ghulam Mustufa",
  category: "Technology",
  applicationName: "OmniBid Intelligence Engine",

  // ── Robots & Indexing ─────────────────────────────────────────────────────
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

  // ── Icons & Manifest ──────────────────────────────────────────────────────
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },

  // ── Open Graph (LinkedIn, Facebook, Slack previews) ───────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "OmniBid Intelligence Engine",
    title: "OmniBid Intelligence Engine — Autonomous AI Freelance Pipeline",
    description:
      "Multi-agent AI system with model routing, RAG evidence grounding, evaluation framework, and real-time observability. Evaluates freelance opportunities and generates proposals autonomously.",
    images: [
      {
        url: "/logo.png",
        width: 1280,
        height: 853,
        alt: "OmniBid Intelligence Engine Logo",
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "OmniBid Intelligence Engine — Autonomous AI Freelance Pipeline",
    description:
      "Multi-agent AI system with model routing, RAG grounding, and real-time observability. Evaluates and proposes on freelance jobs autonomously.",
    images: ["/logo.png"],
    creator: "@GhulamMustufa",
  },
};

// JSON-LD Structured Data — makes Google show rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OmniBid Intelligence Engine",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "An autonomous multi-agent AI pipeline that discovers, evaluates, and proposes on freelance opportunities using LLM orchestration, RAG, and dynamic model routing.",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to Google Fonts for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
