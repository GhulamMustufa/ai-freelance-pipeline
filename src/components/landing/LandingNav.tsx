"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Intelligence", href: "#intelligence" },
    { label: "Why OmniBid", href: "#why-omnibid" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30 bg-slate-900 flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:border-amber-400/60 transition-all duration-200">
              <Image src="/favicon.jpg" alt="OmniBid" width={32} height={32} className="object-cover" />
            </div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors duration-200">
              OmniBid
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="px-3.5 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-md hover:bg-slate-800/60 transition-all duration-150">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/analyzer" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-all duration-150 shadow-md shadow-amber-500/20">
              Try OmniBid
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <button className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800/60 py-4 space-y-1 bg-slate-950/98">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors">{l.label}</a>
            ))}
            <div className="pt-2 px-4">
              <Link href="/dashboard/analyzer" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-all" onClick={() => setMenuOpen(false)}>
                Try OmniBid →
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
