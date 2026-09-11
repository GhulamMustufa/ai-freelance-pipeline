import Link from 'next/link';

export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Paste',
      description: 'Paste any freelance job posting — title, description, budget, and any client details you have.',
      detail: 'No marketplace connection needed. Works with any platform.',
    },
    {
      number: '02',
      title: 'Analyze',
      description: 'OmniBid runs four parallel analyses: job quality, your technical fit, client signals, and economics.',
      detail: 'Multi-agent pipeline with deterministic constraint checking.',
    },
    {
      number: '03',
      title: 'Decide',
      description: 'Get a clear APPLY, MAYBE, or SKIP decision — with reasons, risks, unknowns, and a score breakdown.',
      detail: 'Every dimension explained. No black box.',
    },
    {
      number: '04',
      title: 'Bid with Confidence',
      description: 'If the opportunity is worthwhile, generate a proposal grounded in verified portfolio evidence.',
      detail: 'Claims traced to real projects. Anti-hallucination checked.',
    },
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950" id="how-it-works">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            From job post to decision in minutes.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            A four-step process that turns a raw freelance opportunity into a clear, evidence-backed recommendation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.number} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-700 to-transparent z-0 -translate-y-0.5" />
              )}

              <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-warning/30 rounded-2xl p-5 h-full space-y-3 transition-all duration-200 hover:shadow-lg hover:shadow-warning/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-center text-warning font-black text-sm font-mono">
                    {s.number}
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.description}</p>
                <p className="text-xs text-slate-600 border-t border-slate-800/80 pt-3">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/dashboard/analyzer"
            className="inline-flex items-center gap-2 px-7 py-4 bg-warning hover:bg-warning text-slate-950 font-bold text-base rounded-xl transition-all shadow-lg shadow-warning/25 hover:shadow-warning/35 hover:-translate-y-px"
          >
            Try Your First Analysis
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="text-slate-500 dark:text-slate-600 text-sm mt-3">No marketplace integration required.</p>
        </div>
      </div>
    </section>
  );
}
