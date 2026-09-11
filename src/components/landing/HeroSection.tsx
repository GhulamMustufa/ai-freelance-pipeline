import Link from 'next/link';

function ProductMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow behind card */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-br from-amber-500/40 via-emerald-500/20 to-slate-900 rounded-3xl" />

      {/* Main analysis card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 text-xs font-mono">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/60 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Opportunity Analysis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Title + Decision */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white leading-tight">Senior React / AI Engineer</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Full-Stack · Multi-Agent · Next.js</div>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-sm rounded-lg shadow-lg shadow-emerald-500/30 tracking-wide">
                APPLY
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">91% confidence</div>
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-2.5">
            {[
              { label: 'Technical Fit', value: 94, color: 'bg-emerald-500' },
              { label: 'Job Quality', value: 88, color: 'bg-amber-500' },
              { label: 'Economics', value: 82, color: 'bg-sky-500' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400 text-[10px]">{s.label}</span>
                  <span className="text-white text-[10px] font-bold">{s.value}/100</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color} motion-safe:animate-[scoreIn_1s_ease-out_forwards]`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-400 text-[10px]">Client</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">UNKNOWN</span>
            </div>
          </div>

          {/* Evidence bullets */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            {[
              { type: 'pos', text: 'Strong React + TypeScript match' },
              { type: 'pos', text: 'AI integration experience verified' },
              { type: 'pos', text: 'Budget appears viable ($4,500)' },
              { type: 'unk', text: 'Client history unavailable — preserved as UNKNOWN' },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px]">
                <span className={b.type === 'pos' ? 'text-emerald-400 mt-0.5' : 'text-slate-500 mt-0.5'}>
                  {b.type === 'pos' ? '✓' : 'ℹ'}
                </span>
                <span className={b.type === 'pos' ? 'text-slate-200' : 'text-slate-500'}>{b.text}</span>
              </div>
            ))}
          </div>

          {/* Evidence citations */}
          <div className="border-t border-slate-800 pt-3 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Portfolio Evidence</div>
            {[
              { id: 'EV-003', label: 'React SaaS Platform — Verified' },
              { id: 'EV-007', label: 'AI Integration System — Verified' },
            ].map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">{e.id}</span>
                <span className="text-[10px] text-slate-400">{e.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-1">
            <div className="w-full text-center py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] font-semibold text-amber-400 cursor-pointer transition-colors">
              View Grounded Proposal →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-amber-500/12 via-transparent to-transparent rounded-full blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(15,23,42,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.18) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/8 text-amber-400 text-xs font-semibold tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
              </span>
              AI Opportunity Decision Intelligence
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight">
              Stop applying to freelance jobs that{' '}
              <span className="text-amber-400">aren&apos;t worth</span>{' '}
              your time.
            </h1>

            {/* Sub */}
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              OmniBid analyzes a freelance job against your skills, economics, client signals, and job quality —
              then tells you whether to{' '}
              <span className="text-emerald-400 font-semibold">APPLY</span>,{' '}
              <span className="text-amber-400 font-semibold">MAYBE</span>, or{' '}
              <span className="text-rose-400 font-semibold">SKIP</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/dashboard/analyzer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-400/35 hover:-translate-y-px"
              >
                Analyze a Job Free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-base rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800/40"
              >
                See How It Works
              </a>
            </div>

            {/* Friction reducer */}
            <p className="text-sm text-slate-500">
              No marketplace integration required. Paste a job and get an analysis.
            </p>
          </div>

          {/* Right: Product mockup */}
          <div className="lg:pl-4">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
