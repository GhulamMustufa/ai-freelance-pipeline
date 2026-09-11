export default function TrustStrip() {
  const capabilities = [
    { icon: '⚡', label: 'AI opportunity analysis' },
    { icon: '🛡️', label: 'Deterministic dealbreaker detection' },
    { icon: '📎', label: 'Evidence-grounded proposals' },
    { icon: '🔍', label: 'Transparent decision reasoning' },
    { icon: '📊', label: 'Execution telemetry trace' },
  ];

  return (
    <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-500">
              Built for serious freelancers
            </span>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 hidden lg:block" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {capabilities.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>{c.icon}</span>
                <span className="font-medium whitespace-nowrap">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
