export default function FourPillarsSection() {
  const pillars = [
    {
      number: '01',
      title: 'Job Intelligence',
      description: 'Understands what the job actually requires — not just what it says.',
      points: [
        'Actual scope vs. stated scope',
        'Hidden or implied requirements',
        'Technical complexity and ambiguity',
        'Project maturity and deliverables',
      ],
    },
    {
      number: '02',
      title: 'Freelancer Fit',
      description: 'Compares the job against your specific profile, not a generic checklist.',
      points: [
        'Your skills vs. job requirements',
        'Primary and secondary skill matches',
        'Excluded technologies (hard stop)',
        'Portfolio relevance check',
      ],
    },
    {
      number: '03',
      title: 'Client Intelligence',
      description: 'Analyzes available client signals. Never penalizes for missing data.',
      points: [
        'Spending history and hire rate',
        'Feedback score and reputation',
        'Scam pattern detection',
        'If unavailable: marked UNKNOWN',
      ],
      hasUnknown: true,
    },
    {
      number: '04',
      title: 'Economics',
      description: 'Evaluates the financial viability of the opportunity transparently.',
      points: [
        'Budget vs. expected effort',
        'Effective hourly rate estimate',
        'Opportunity cost assessment',
        'Status: OBSERVED / ESTIMATED / UNKNOWN',
      ],
      hasStatus: true,
    },
  ];

  return (
    <section className="py-24 bg-slate-950" id="intelligence">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            A proposal generator sees a job.{' '}
            <br className="hidden sm:block" />
            <span className="text-amber-400">OmniBid evaluates the opportunity.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Four independent analysis dimensions. Each one verifiable. Each one explained.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.number}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-700 group-hover:text-amber-500/50 transition-colors font-mono">
                  {p.number}
                </span>
                {p.hasUnknown && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                    UNKNOWN SAFE
                  </span>
                )}
                {p.hasStatus && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                    OBSERVED/EST.
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.description}</p>
              </div>
              <ul className="space-y-2">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-amber-500/70 mt-0.5 shrink-0">›</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
