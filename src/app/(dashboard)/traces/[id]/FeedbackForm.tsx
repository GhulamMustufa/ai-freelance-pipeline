'use client';

import { useState } from 'react';
import { logOpportunityFeedback } from '@/app/actions';
import toast from 'react-hot-toast';

export function FeedbackForm({ opportunityId, initialOutcome, initialFeedback }: { 
  opportunityId: string, 
  initialOutcome: any, 
  initialFeedback: any 
}) {
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState({
    applied: initialOutcome?.applied || false,
    interview: initialOutcome?.interview || false,
    contractWon: initialOutcome?.contractWon || false,
    rejected: initialOutcome?.rejected || false
  });
  
  const [feedback, setFeedback] = useState({
    decisionCorrect: initialFeedback?.decisionCorrect || false,
    proposalQuality: initialFeedback?.proposalQuality || 3,
    opportunityValuable: initialFeedback?.opportunityValuable || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (opportunityId === 'demo') {
      setTimeout(() => {
        toast.success('Demo feedback saved! (No database changes made in demo mode)');
        setLoading(false);
      }, 500);
      return;
    }

    try {
      await logOpportunityFeedback(opportunityId, outcome, feedback);
      toast.success('Feedback logged successfully!');
    } catch {
      toast.error('Failed to log feedback');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mt-8">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Outcome & Feedback</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">Actual Outcome</h3>
          <label className="flex items-center space-x-2 mb-2 text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={outcome.applied} onChange={e => setOutcome({...outcome, applied: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
            <span>Applied</span>
          </label>
          <label className="flex items-center space-x-2 mb-2 text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={outcome.interview} onChange={e => setOutcome({...outcome, interview: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
            <span>Interview Received</span>
          </label>
          <label className="flex items-center space-x-2 mb-2 text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={outcome.contractWon} onChange={e => setOutcome({...outcome, contractWon: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
            <span>Contract Won</span>
          </label>
          <label className="flex items-center space-x-2 mb-2 text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={outcome.rejected} onChange={e => setOutcome({...outcome, rejected: e.target.checked})} className="rounded text-danger focus:ring-danger" />
            <span>Rejected</span>
          </label>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">AI Evaluation</h3>
          <label className="flex items-center space-x-2 mb-2 text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={feedback.decisionCorrect} onChange={e => setFeedback({...feedback, decisionCorrect: e.target.checked})} className="rounded text-success focus:ring-success" />
            <span>AI Decision Was Correct</span>
          </label>
          <label className="flex items-center space-x-2 mb-2 text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={feedback.opportunityValuable} onChange={e => setFeedback({...feedback, opportunityValuable: e.target.checked})} className="rounded text-success focus:ring-success" />
            <span>Opportunity Was Valuable</span>
          </label>
          <label className="block mb-2 text-slate-700 dark:text-slate-300">
            <span className="block mb-1 text-sm font-medium">Proposal Quality (1-5)</span>
            <input type="range" min="1" max="5" value={feedback.proposalQuality} onChange={e => setFeedback({...feedback, proposalQuality: parseInt(e.target.value)})} className="w-full accent-blue-600" />
            <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">{feedback.proposalQuality} / 5</div>
          </label>
        </div>
      </div>
      
      <button disabled={loading} type="submit" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 transition shadow-sm">
        {loading ? 'Saving...' : 'Save Feedback'}
      </button>
    </form>
  );
}
