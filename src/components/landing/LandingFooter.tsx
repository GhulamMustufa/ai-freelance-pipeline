import Link from 'next/link';
import Image from 'next/image';

export default function LandingFooter() {
  return (
    <footer className="bg-slate-900/60 border-t border-slate-800/80 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-amber-500/30 bg-slate-800">
                <Image src="/favicon.jpg" alt="OmniBid" width={28} height={28} className="object-cover" />
              </div>
              <span className="font-bold text-white">OmniBid</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI Opportunity Decision Intelligence for Freelancers.
              <br />
              Know which jobs deserve your attention.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Product</div>
            <div className="space-y-2">
              {[
                { label: 'Analyzer', href: '/dashboard/analyzer' },
                { label: 'AI Benchmarks', href: '/dashboard/evals' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Why OmniBid', href: '#why-omnibid' },
              ].map((l) => (
                <div key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                    {l.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Info links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">Info</div>
            <div className="space-y-2">
              {[
                { label: 'FAQ', href: '#faq' },
                { label: 'GitHub Repository', href: 'https://github.com/GhulamMustufa/ai-freelance-pipeline' },
              ].map((l) => (
                <div key={l.label}>
                  <a href={l.href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors" target={l.href.startsWith('http') ? '_blank' : undefined} rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                    {l.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} OmniBid. Built for freelancers who value their time.
          </p>
          <Link
            href="/dashboard/analyzer"
            className="text-xs px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-lg font-semibold transition-colors"
          >
            Try the Analyzer →
          </Link>
        </div>
      </div>
    </footer>
  );
}
