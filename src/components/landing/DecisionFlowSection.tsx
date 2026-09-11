export default function DecisionFlowSection() {
  const traditionalSteps = [
    { label: 'See a job' },
    { label: 'Generate proposal' },
    { label: 'Apply' },
    { label: 'Hope for the best' },
  ];

  const omnibidSteps = [
    { label: 'Paste the job' },
    { label: 'Understand the scope' },
    { label: 'Check your fit' },
    { label: 'Assess economics' },
    { label: 'Flag risks & unknowns' },
    { label: 'DECIDE: APPLY / MAYBE / SKIP', highlight: true },
    { label: 'Proposal only when justified', sub: true },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            OmniBid doesn&apos;t start by writing your proposal.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xl font-medium">
            It starts by asking whether you should apply.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Traditional */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 opacity-90 dark:opacity-70 shadow-sm dark:shadow-none">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
              Traditional AI Proposal Tool
            </div>
            <div className="space-y-2">
              {traditionalSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-500 font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 py-2.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40 text-sm text-slate-600 dark:text-slate-400">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-rose-500/8 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium">
              ⚠ No understanding. No filtering. Proposals for every job — good or bad.
            </div>
          </div>

          {/* OmniBid */}
          <div className="bg-white dark:bg-slate-900 border border-amber-500/20 rounded-2xl p-6 shadow-xl shadow-amber-500/5">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-500/80 mb-6">
              OmniBid
            </div>
            <div className="space-y-2">
              {omnibidSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  {!s.sub && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      s.highlight
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-200 dark:bg-slate-800 border border-amber-500/30 text-amber-600 dark:text-amber-500'
                    }`}>
                      {i + 1}
                    </div>
                  )}
                  {s.sub && <div className="w-5 shrink-0" />}
                  <div className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium ${
                    s.highlight
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : s.sub
                      ? 'bg-slate-100 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700/60 text-slate-500 dark:text-slate-500 text-xs italic'
                      : 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium">
              ✓ Decision-first. Every proposal is justified by a prior analysis.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
