export default function ComparisonTable() {
  const rows = [
    { feature: 'Primary function', typical: 'Writes proposals', omnibid: 'Decides whether to apply' },
    { feature: 'Optimization target', typical: 'Wording quality', omnibid: 'Opportunity selection quality' },
    { feature: 'Missing information', typical: 'Filled with assumptions', omnibid: 'Preserved as UNKNOWN' },
    { feature: 'Decision logic', typical: 'LLM decides everything', omnibid: 'Deterministic gates + AI reasoning' },
    { feature: 'Portfolio usage', typical: 'Generic experience claims', omnibid: 'Verified portfolio evidence' },
    { feature: 'Reasoning transparency', typical: 'Black-box output', omnibid: 'Transparent analysis + trace' },
    { feature: 'Approach', typical: 'Proposal-first', omnibid: 'Decision-first' },
    { feature: 'Scam protection', typical: 'None', omnibid: 'Deterministic scam detection' },
  ];

  return (
    <section className="py-24 bg-slate-950" id="why-omnibid">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Not another AI proposal writer.
          </h2>
          <p className="text-slate-400 text-lg">
            A fundamentally different approach to freelance opportunity management.
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="text-left px-5 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider w-1/3">Dimension</th>
                <th className="text-left px-5 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wider w-1/3">Typical AI Tool</th>
                <th className="text-left px-5 py-4 text-amber-500 font-semibold text-xs uppercase tracking-wider w-1/3">OmniBid</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.feature} className={`border-b border-slate-800/60 ${i % 2 === 0 ? 'bg-slate-900/20' : 'bg-slate-900/40'} hover:bg-slate-900/60 transition-colors`}>
                  <td className="px-5 py-3.5 text-slate-400 font-medium">{r.feature}</td>
                  <td className="px-5 py-3.5 text-slate-500">{r.typical}</td>
                  <td className="px-5 py-3.5 text-emerald-400 font-semibold">{r.omnibid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {rows.map((r) => (
            <div key={r.feature} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{r.feature}</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-600 mb-1">Typical Tool</div>
                  <div className="text-slate-500">{r.typical}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-600 mb-1">OmniBid</div>
                  <div className="text-emerald-400 font-semibold">{r.omnibid}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
