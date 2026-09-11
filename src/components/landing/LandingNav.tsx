"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function LandingNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";
  const isAnalyzer = pathname.startsWith("/dashboard/analyzer");
  const isEvals = pathname.startsWith("/dashboard/evals");

  const links = [
    { label: "Home", href: "/" },
    { label: "Analyzer", href: "/dashboard/analyzer" },
    { label: "AI Benchmarks", href: "/dashboard/evals" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-lg shadow-slate-200/60 dark:shadow-black/20"
          : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-warning/30 bg-slate-900 flex items-center justify-center shadow-md shadow-warning/10 group-hover:border-warning/60 transition-all duration-200">
              <Image src="/favicon.jpg" alt="OmniBid" width={32} height={32} className="object-cover" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-warning dark:group-hover:text-warning transition-colors duration-200">
              OmniBid
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active =
                (l.href === "/" && isHome) ||
                (l.href === "/dashboard/analyzer" && isAnalyzer) ||
                (l.href === "/dashboard/evals" && isEvals);

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                    active
                      ? "bg-warning text-slate-950 font-bold shadow-md shadow-warning/20"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/analyzer" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-warning hover:bg-warning text-slate-950 font-bold text-sm rounded-lg transition-all duration-150 shadow-md shadow-warning/20">
              Try OmniBid
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <button className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800/60 py-4 space-y-1 bg-white/95 dark:bg-slate-950/98">
            {links.map((l) => {
              const active =
                (l.href === "/" && isHome) ||
                (l.href === "/dashboard/analyzer" && isAnalyzer) ||
                (l.href === "/dashboard/evals" && isEvals);

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? "bg-warning text-slate-950 font-bold"
                      : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="pt-2 px-4">
              <Link href="/dashboard/analyzer" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-warning hover:bg-warning text-slate-950 font-bold text-sm rounded-lg transition-all" onClick={() => setMenuOpen(false)}>
                Try OmniBid →
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
