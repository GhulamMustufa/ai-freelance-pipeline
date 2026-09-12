'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItemClass = (isActive: boolean) => `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
    isActive
      ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
  }`;

  const mobileNavItemClass = (isActive: boolean) => `block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
  }`;

  return (
    <header className="bg-white/90 dark:bg-slate-950/90 border-b border-slate-100 dark:border-slate-800/60 sticky top-0 z-50 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-7 h-7 rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors">
                <Image
                  src="/favicon.jpg"
                  alt="OmniBid Logo"
                  width={28}
                  height={28}
                  className="object-cover"
                />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-warning transition-colors">
                OmniBid
              </span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-1">
              <Link href="/analyzer" className={navItemClass(pathname.startsWith('/analyzer'))}>
                Analyzer
              </Link>
              <Link href="/evals" className={navItemClass(pathname.startsWith('/evals'))}>
                Benchmarks
              </Link>
              <Show when="signed-in">
                <Link href="/history" className={navItemClass(pathname.startsWith('/history'))}>
                  History
                </Link>
                <Link href="/profile" className={navItemClass(pathname.startsWith('/profile'))}>
                  Profile
                </Link>
              </Show>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <SignInButton mode="modal">
                  <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium px-2 py-1.5 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-medium px-3 py-1.5 rounded-md transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
            
            <Show when="signed-in">
              <div className="ml-2">
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-7 h-7 rounded border border-slate-200 dark:border-slate-700 shadow-sm"
                    }
                  }}
                />
              </div>
            </Show>

            <div className="pl-3 border-l border-slate-200 dark:border-slate-800 flex items-center">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="sm:hidden p-1.5 ml-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="sm:hidden py-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
            <Link href="/analyzer" onClick={() => setMenuOpen(false)} className={mobileNavItemClass(pathname.startsWith('/analyzer'))}>
              Analyzer
            </Link>
            <Link href="/evals" onClick={() => setMenuOpen(false)} className={mobileNavItemClass(pathname.startsWith('/evals'))}>
              Benchmarks
            </Link>
            <Show when="signed-in">
              <Link href="/history" onClick={() => setMenuOpen(false)} className={mobileNavItemClass(pathname.startsWith('/history'))}>
                History
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className={mobileNavItemClass(pathname.startsWith('/profile'))}>
                Profile
              </Link>
            </Show>
            <Show when="signed-out">
              <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 px-2">
                <SignInButton mode="modal">
                  <button onClick={() => setMenuOpen(false)} className="w-full text-center text-sm font-medium px-4 py-2.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button onClick={() => setMenuOpen(false)} className="w-full text-center text-sm font-medium px-4 py-2.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        )}
      </div>
    </header>
  );
}
