export default function ProblemSection() {
  const steps = [
    { time: '10 min', action: 'Reading the job description' },
    { time: '10 min', action: 'Researching the client' },
    { time: '15 min', action: 'Estimating scope and effort' },
    { time: '20 min', action: 'Writing a proposal from scratch' },
    { time: '+', action: 'Following up with no reply' },
  ];

  return (
    <section className="py-24 bg-slate-950" id="problem">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            The problem isn&apos;t finding freelance jobs.
            <br />
            <span className="text-amber-400">It&apos;s knowing which ones deserve your time.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Every time you evaluate an opportunity manually, you're making a costly bet with your most limited resource.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Cost breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              Per opportunity, you spend:
            </div>
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-14 text-right text-sm font-black shrink-0 ${
                  s.time === '+' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {s.time}
                </div>
                <div className="h-px flex-1 bg-slate-800" />
                <div className="text-sm text-slate-300 flex-1">{s.action}</div>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-sm text-slate-400">× dozens of opportunities per week</span>
              <span className="text-rose-400 font-black text-sm">= hours lost</span>
            </div>
          </div>

          {/* Impact statement */}
          <div className="space-y-6">
            <blockquote className="text-xl sm:text-2xl font-bold text-white leading-tight">
              &ldquo;A bad opportunity doesn&apos;t just waste a proposal.
              It consumes the time you could have spent{' '}
              <span className="text-amber-400">winning a better one.</span>&rdquo;
            </blockquote>

            <p className="text-slate-400 leading-relaxed">
              The freelancers who consistently win the best work aren&apos;t the fastest writers.
              They&apos;re the best selectors. They know which jobs to pursue — and which to ignore.
            </p>

            <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <p className="text-amber-300 text-sm font-semibold">
                OmniBid optimizes your most scarce resource — not your proposals, but your <span className="text-white">attention</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
