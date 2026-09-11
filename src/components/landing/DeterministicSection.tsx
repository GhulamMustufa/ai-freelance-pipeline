export default function DeterministicSection() {
  const hardRules = [
    {
      trigger: 'Excluded technology detected',
      example: 'PHP/WordPress — excluded from your profile',
      outcome: 'SKIP',
      type: 'deterministic',
    },
    {
      trigger: 'Obvious scam pattern',
      example: '"$30 budget. Finish by tomorrow. No bids higher."',
      outcome: 'SKIP',
      type: 'deterministic',
    },
    {
      trigger: 'Budget below your minimum',
      example: 'Project budget < your configured floor',
      outcome: 'SKIP',
      type: 'deterministic',
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Deterministic Protection
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              AI reasoning where it helps.{' '}
              <span className="text-amber-400">Hard rules where certainty matters.</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              OmniBid doesn&apos;t ask an LLM to decide everything. Some decisions
              don&apos;t need AI — they need an unbreakable rule.
            </p>
            <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl space-y-1">
              <p className="text-amber-300 text-sm font-semibold">
                LLMs reason about ambiguous opportunities.
              </p>
              <p className="text-amber-400/70 text-sm">
                Deterministic gates enforce your explicit constraints.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {hardRules.map((r) => (
              <div key={r.trigger} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 group hover:border-rose-500/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{r.trigger}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-500 font-mono">{r.example}</div>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-500/20">
                      → {r.outcome}
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-slate-600" />
                  Deterministic — no LLM call required
                </div>
              </div>
            ))}

            <div className="bg-white dark:bg-slate-900 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">All other opportunities</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Pass through full multi-agent AI analysis → APPLY / MAYBE / SKIP</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
