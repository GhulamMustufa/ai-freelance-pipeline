export default function WhoIsItForSection() {
  const forCards = [
    {
      icon: '🎯',
      title: 'Senior Freelancers',
      description: 'Stop spending valuable engineering time evaluating low-quality jobs. Set your constraints once and let OmniBid filter for you.',
    },
    {
      icon: '⚙️',
      title: 'Technical Specialists',
      description: 'Quickly identify opportunities where your expertise is genuinely relevant — not just keyword-matched.',
    },
    {
      icon: '⚡',
      title: 'High-Volume Freelancers',
      description: 'Process more opportunities in less time without applying blindly. Your time-to-decision drops dramatically.',
    },
    {
      icon: '💼',
      title: 'Independent Consultants',
      description: 'Evaluate commercial viability before committing to a conversation. Protect your consulting time.',
    },
  ];

  const notForItems = [
    'You want a bot that automatically applies to hundreds of jobs',
    'You want AI to blindly exaggerate your experience',
    'You want a generic one-click proposal generator',
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Who it IS for */}
        <div className="mb-20">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Built for freelancers who value their time.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {forCards.map((c) => (
              <div key={c.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm dark:shadow-none">
                <div className="text-2xl">{c.icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{c.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Who it's NOT for */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto shadow-sm dark:shadow-none">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">OmniBid isn&apos;t for everyone.</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            We&apos;d rather be honest than oversell. OmniBid is the wrong tool if:
          </p>
          <div className="space-y-3">
            {notForItems.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-500">
                <span className="text-danger mt-0.5 font-bold shrink-0">✗</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-slate-900 dark:text-white font-semibold">
              OmniBid is for people who want to make{' '}
              <span className="text-success font-bold">better opportunity decisions</span> — not more applications.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
