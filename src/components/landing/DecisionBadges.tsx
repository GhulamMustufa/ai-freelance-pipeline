export default function DecisionBadges() {
  const decisions = [
    {
      label: 'APPLY',
      bg: 'bg-success/10',
      border: 'border-success/20 hover:border-success/30',
      badge: 'bg-success text-white dark:text-slate-900 shadow-success/20',
      text: 'text-slate-700 dark:text-slate-200',
      signalsText: 'text-slate-600 dark:text-slate-400',
      bullet: 'bg-success',
      description:
        'Strong opportunity. Your skills, economics, and project quality justify spending time on it. The evidence supports moving forward.',
      signals: ['High technical fit', 'Viable budget', 'Clear scope'],
    },
    {
      label: 'MAYBE',
      bg: 'bg-warning/10',
      border: 'border-warning/20 hover:border-warning/30',
      badge: 'bg-warning text-slate-900 shadow-warning/20',
      text: 'text-slate-700 dark:text-slate-200',
      signalsText: 'text-slate-600 dark:text-slate-400',
      bullet: 'bg-warning',
      description:
        'Potentially worthwhile, but important information is missing or uncertain. Consider whether clarification is worth your time before committing.',
      signals: ['Partial fit', 'Unknown client', 'Ambiguous scope'],
    },
    {
      label: 'SKIP',
      bg: 'bg-danger/10',
      border: 'border-danger/20 hover:border-danger/30',
      badge: 'bg-danger text-white dark:text-slate-900 shadow-danger/20',
      text: 'text-slate-700 dark:text-slate-200',
      signalsText: 'text-slate-600 dark:text-slate-400',
      bullet: 'bg-danger',
      description:
        'The opportunity violates important constraints, has serious risks, or isn\'t worth your expected return. Protect your time.',
      signals: ['Excluded technology', 'Budget too low', 'Scam signals detected'],
    },
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950" id="decisions">
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
              className={`${d.bg} border ${d.border} rounded-2xl p-6 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm`}
            >
              <div className={`inline-block px-4 py-1.5 rounded-lg font-black text-lg tracking-wide ${d.badge} shadow-md`}>
                {d.label}
              </div>
              <p className={`text-sm leading-relaxed font-medium ${d.text}`}>{d.description}</p>
              <div className="pt-2 space-y-2">
                {d.signals.map((s) => (
                  <div key={s} className={`flex items-center gap-2.5 text-xs font-medium ${d.signalsText}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${d.bullet} shadow-sm`} />
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
