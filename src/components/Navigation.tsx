'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isAnalyzer = pathname.startsWith('/dashboard/analyzer');
  const isEvals = pathname.startsWith('/dashboard/evals');

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-50 shadow-sm backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-amber-500/30 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md shadow-amber-500/10 group-hover:border-amber-500/60 transition-all">
                <Image
                  src="/favicon.jpg"
                  alt="OmniBid Logo"
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  OmniBid
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Intelligence Engine
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isHome
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>🏠</span>
              <span>Home</span>
            </Link>

            <Link
              href="/dashboard/analyzer"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnalyzer
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 font-medium'
              }`}
            >
              <span className="text-xs">⚡</span>
              <span>Manual Job Analyzer</span>
            </Link>

            <Link
              href="/dashboard/evals"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isEvals
                  ? 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-300 dark:border-slate-700 font-bold shadow-inner'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>🛡️</span>
              <span>AI Benchmarks</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                30 Cases
              </span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">Multi-Agent Router Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
