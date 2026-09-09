export default function UnknownSection() {
  const examples = [
    {
      label: 'Client History',
      input: 'Not provided in the job post',
      bad: '"Bad client"',
      good: 'UNKNOWN',
      goodColor: 'text-slate-300',
    },
    {
      label: 'Budget',
      input: 'Field left blank',
      bad: '"Unprofitable project"',
      good: 'UNKNOWN / ESTIMATE',
      goodColor: 'text-sky-400',
    },
    {
      label: 'Location Requirement',
      input: 'Not mentioned',
      bad: '"Remote restrictions likely"',
      good: 'UNKNOWN',
      goodColor: 'text-slate-300',
    },
  ];

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Epistemic Honesty
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Missing information shouldn&apos;t become
            <br />
            <span className="text-amber-400">a fake red flag.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Many AI systems fill information gaps with assumptions.
            OmniBid explicitly preserves uncertainty instead of inventing negative signals.
          </p>
        </div>

        <div className="space-y-4">
          {examples.map((e) => (
            <div key={e.label} className="grid sm:grid-cols-3 gap-4 items-center">
              {/* Input */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">{e.label}</div>
                <div className="text-sm text-slate-400 italic">{e.input}</div>
              </div>

              {/* What a typical tool does */}
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600 mb-1.5">
                  Typical tool assumes:
                </div>
                <div className="text-sm text-rose-400 font-semibold">{e.bad}</div>
              </div>

              {/* What OmniBid does */}
              <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1.5">
                  OmniBid preserves:
                </div>
                <div className={`text-sm font-black font-mono ${e.goodColor}`}>{e.good}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-6 bg-slate-800/30 border border-slate-700/60 rounded-2xl">
          <p className="text-white font-semibold text-lg">
            The system tells you what it <span className="text-emerald-400">knows</span>,
            what it <span className="text-sky-400">estimates</span>, and
            what it <span className="text-slate-400">doesn&apos;t know</span>.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            No invented negatives. No false confidence. Honest analysis only.
          </p>
        </div>
      </div>
    </section>
  );
}
