export default function TrustStrip() {
  const capabilities = [
    { icon: '⚡', label: 'AI opportunity analysis' },
    { icon: '🛡️', label: 'Deterministic dealbreaker detection' },
    { icon: '📎', label: 'Evidence-grounded proposals' },
    { icon: '🔍', label: 'Transparent decision reasoning' },
    { icon: '📊', label: 'Execution telemetry trace' },
  ];

  return (
    <section className="border-y border-slate-200 dark:border-slate-800/80 bg-slate-200/60 dark:bg-slate-900/30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-500 shrink-0">
            Built for serious freelancers
          </span>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 hidden sm:block" />
          {capabilities.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>{c.icon}</span>
              <span className="font-medium">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
