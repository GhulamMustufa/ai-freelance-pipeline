import Link from 'next/link';

export default function FinalCTASection() {
  return (
    <section className="py-28 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-amber-500/12 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Your next freelance job is already waiting.
          <br />
          <span className="text-amber-400">The question is whether it&apos;s worth your time.</span>
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Paste the opportunity. Let OmniBid analyze it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/analyzer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg rounded-xl transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-400/35 hover:-translate-y-0.5"
          >
            Analyze a Job Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <p className="text-slate-600 text-sm">
          No marketplace integration required. Paste a job and get an analysis.
        </p>

        {/* Capability reminders */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4">
          {[
            'APPLY / MAYBE / SKIP decisions',
            'Evidence-grounded proposals',
            'Deterministic scam protection',
            'UNKNOWN ≠ bad signal',
          ].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-600">
              <span className="text-amber-500/60">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
