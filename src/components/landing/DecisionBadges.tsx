export default function DecisionBadges() {
  const decisions = [
    {
      label: 'APPLY',
      color: 'emerald',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500 text-slate-950',
      text: 'text-emerald-300',
      description:
        'Strong opportunity. Your skills, economics, and project quality justify spending time on it. The evidence supports moving forward.',
      signals: ['High technical fit', 'Viable budget', 'Clear scope'],
    },
    {
      label: 'MAYBE',
      color: 'amber',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500 text-slate-950',
      text: 'text-amber-300',
      description:
        'Potentially worthwhile, but important information is missing or uncertain. Consider whether clarification is worth your time before committing.',
      signals: ['Partial fit', 'Unknown client', 'Ambiguous scope'],
    },
    {
      label: 'SKIP',
      color: 'rose',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      badge: 'bg-rose-500 text-white',
      text: 'text-rose-300',
      description:
        'The opportunity violates important constraints, has serious risks, or isn\'t worth your expected return. Protect your time.',
      signals: ['Excluded technology', 'Budget too low', 'Scam signals detected'],
    },
  ];

  return (
    <section className="py-24 bg-slate-100 dark:bg-slate-900" id="decisions">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Three decisions. One clear answer.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            OmniBid doesn&apos;t give you a list of factors to weigh yourself.
            It gives you a decision — and shows you exactly why.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {decisions.map((d) => (
            <div
              key={d.label}
              className={`${d.bg} border ${d.border} rounded-2xl p-6 space-y-4 hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className={`inline-block px-4 py-1.5 rounded-lg font-black text-lg tracking-wide ${d.badge} shadow-lg`}>
                {d.label}
              </div>
              <p className={`text-sm leading-relaxed ${d.text}`}>{d.description}</p>
              <div className="pt-2 space-y-1.5">
                {d.signals.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-slate-500 dark:bg-slate-600" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-slate-600 dark:text-slate-400 text-sm">
          OmniBid doesn&apos;t just tell you what to do.{' '}
          <span className="text-slate-900 dark:text-white font-semibold">It shows you why.</span>
        </p>
      </div>
    </section>
  );
}
