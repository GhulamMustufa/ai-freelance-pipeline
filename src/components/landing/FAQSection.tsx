"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Do I need to connect Upwork or any marketplace?",
    a: "No. You paste the job text directly into OmniBid. There's no marketplace integration required. It works with opportunities from any platform — Upwork, Toptal, LinkedIn, direct inbound — or even jobs you find yourself.",
  },
  {
    q: "What if client information isn't available?",
    a: "OmniBid marks it as UNKNOWN rather than treating it as a negative signal. Missing information is preserved explicitly — not filled with assumptions. You'll see exactly what the system knows vs. what it doesn't.",
  },
  {
    q: "Does OmniBid write the proposal?",
    a: "Yes — but only when the opportunity is worth pursuing. When analysis recommends APPLY or MAYBE, OmniBid generates a proposal grounded in relevant verified portfolio evidence, with each claim traced back to a real project.",
  },
  {
    q: "Can OmniBid invent my experience?",
    a: "The evidence-grounding and claim-verification pipeline is specifically designed to prevent unsupported portfolio claims. Claims in your proposal are traced to real evidence items from your knowledge base before the draft is returned.",
  },
  {
    q: "Does it automatically apply for me?",
    a: "No. OmniBid focuses on helping you make the right decision before you apply. The proposal is a draft for you to review and send — you stay in full control of what goes out.",
  },
  {
    q: "Who is OmniBid built for?",
    a: "Experienced freelancers and independent professionals who receive many opportunities, work with competitive marketplaces, and want to spend less time evaluating bad opportunities — and more time winning the right ones.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-slate-100 dark:bg-slate-900" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Questions?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Honest answers to common questions.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-white dark:bg-slate-950 border rounded-xl overflow-hidden transition-all duration-200 ${
                open === i ? "border-amber-500/30" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className={`font-semibold text-sm leading-relaxed ${open === i ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"} transition-colors`}>
                  {faq.q}
                </span>
                <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-all ${
                  open === i
                    ? "border-amber-500/60 text-amber-400 bg-amber-500/10 rotate-45"
                    : "border-slate-300 dark:border-slate-700 text-slate-500"
                }`}>
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
