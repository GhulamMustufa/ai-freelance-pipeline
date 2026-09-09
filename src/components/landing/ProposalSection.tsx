export default function ProposalSection() {
  const claims = [
    {
      text: '"I built a React + TypeScript SaaS platform with AI-powered workflow orchestration..."',
      evidence: 'EV-003',
      evidenceLabel: 'React SaaS Platform',
      status: 'VERIFIED',
    },
    {
      text: '"I implemented multi-agent AI pipelines and real-time streaming integrations..."',
      evidence: 'EV-007',
      evidenceLabel: 'AI Integration System',
      status: 'VERIFIED',
    },
  ];

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              When the opportunity is worth pursuing,
              build the proposal from{' '}
              <span className="text-amber-400">proof.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed">
              OmniBid retrieves relevant verified portfolio evidence before drafting your proposal.
              Every claim in the proposal is traced back to a real project you can point to.
            </p>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>No invented clients or imaginary projects</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Every experience claim linked to portfolio evidence</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <span>Designed to detect unsupported claims before you send</span>
              </div>
            </div>
            <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
              <p className="text-xs text-slate-500">
                OmniBid is designed to detect unsupported claims before you send —
                not to guarantee zero errors, but to catch them before they cost you the job.
              </p>
            </div>
          </div>

          {/* Proposal mockup */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grounded Proposal</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                ✓ Anti-Hallucination Pass
              </span>
            </div>
            <div className="p-5 space-y-5 font-mono text-xs">
              {claims.map((c, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-slate-300 leading-relaxed">{c.text}</p>
                  <div className="flex items-center gap-2 pl-3 border-l border-amber-500/30">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-black">{c.evidence}</span>
                    <span className="text-slate-500 text-[10px]">{c.evidenceLabel}</span>
                    <span className="ml-auto text-emerald-400 text-[10px] font-bold">✓ {c.status}</span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Claim Verification Pass</span>
                  <span className="text-emerald-400 font-bold">2/2 claims verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
