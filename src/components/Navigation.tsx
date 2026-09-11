'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();

  const navItemClass = (isActive: boolean) => `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
    isActive
      ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
              <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                OmniBid
              </span>
            </Link>

            <nav className="hidden sm:flex items-center space-x-1">
              <Link href="/dashboard/analyzer" className={navItemClass(pathname.startsWith('/dashboard/analyzer'))}>
                Analyzer
              </Link>
              <Link href="/dashboard/evals" className={navItemClass(pathname.startsWith('/dashboard/evals'))}>
                Benchmarks
              </Link>
              <Show when="signed-in">
                <Link href="/dashboard/history" className={navItemClass(pathname.startsWith('/dashboard/history'))}>
                  History
                </Link>
                <Link href="/dashboard/profile" className={navItemClass(pathname.startsWith('/dashboard/profile'))}>
                  Profile
                </Link>
              </Show>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Show when="signed-out">
              <div className="flex items-center gap-2 ml-2">
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
          </div>
        </div>
      </div>
    </header>
  );
}
