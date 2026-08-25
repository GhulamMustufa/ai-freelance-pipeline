'use client';
import { useState, useTransition, useEffect } from 'react';
import { updateClientStatus, updateProposalDraft } from '@/app/actions';

export default function Dashboard({ initialJobs }: { initialJobs: any[] }) {
  const [filterType, setFilterType] = useState<'ALL' | 'GOLDEN' | 'SUBMITTED'>('ALL');
  
  const filteredJobs = initialJobs.filter((j) => {
    if (filterType === 'GOLDEN') return j.isGolden;
    if (filterType === 'SUBMITTED') return j.proposalDraft?.status === 'submitted';
    return true;
  });

  const [selectedJobId, setSelectedJobId] = useState<string | null>(filteredJobs[0]?.id || null);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftContent, setDraftContent] = useState('');

  const selectedJob = initialJobs.find((j) => j.id === selectedJobId);

  // Sync draft content when job changes
  useEffect(() => {
    setDraftContent(selectedJob?.proposalDraft?.content || '');
  }, [selectedJobId, selectedJob?.proposalDraft?.content]);

  const handleUpdateClient = (clientId: string, status: 'NEUTRAL' | 'FAVORITE' | 'BLACKLISTED', notes: string) => {
    startTransition(() => {
      updateClientStatus(clientId, status, notes);
    });
  };

  const handleRegenerate = async () => {
    if (!selectedJob) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          title: selectedJob.title,
          description: selectedJob.description,
          clientStatus: selectedJob.client?.status || 'NEUTRAL'
        })
      });
      const data = await res.json();
      if (data.proposal) {
        setDraftContent(data.proposal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!selectedJob) return;
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(draftContent);
    } catch (e) {
      console.error("Failed to copy to clipboard", e);
    }

    // Save to DB as submitted
    startTransition(() => {
      updateProposalDraft(selectedJob.id, draftContent, 'submitted');
    });

    // Open Upwork
    // Extract the raw numeric ID from the ~01 ID. Actually, upwork job URLs use the ~01 format!
    // Example: https://www.upwork.com/jobs/~01xyz
    window.open(`https://www.upwork.com/jobs/${selectedJob.id}/apply`, '_blank');
  };

  console.log("Dashboard received jobs:", initialJobs.map(j => ({ id: j.id, title: j.title, spend: j.clientTotalSpend })));

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    setIsMobileDetailsOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-300">
      
      {/* 1. Job List Sidebar */}
      <div 
        className={`flex-col border-r border-slate-800 bg-slate-950 overflow-y-auto transition-all w-full lg:w-1/3 lg:flex ${isMobileDetailsOpen ? 'hidden' : 'flex'}`}
      >
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-10 shadow-sm flex flex-col gap-4">
          
          {/* Telemetry Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Command Center
            </h1>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700">
                {initialJobs.length} Tracked
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20">
                {initialJobs.filter(j => j.proposalDraft?.status === 'submitted').length} Sent
              </span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setFilterType('ALL')}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${filterType === 'ALL' ? 'bg-slate-800 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
              All Jobs
            </button>
            <button 
              onClick={() => setFilterType('GOLDEN')}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all flex items-center justify-center ${filterType === 'GOLDEN' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path></svg>
              Golden
            </button>
            <button 
              onClick={() => setFilterType('SUBMITTED')}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${filterType === 'SUBMITTED' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
              Submitted
            </button>
          </div>
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            {filterType === 'ALL' ? 'No jobs found. Start the sync engine.' : `No ${filterType.toLowerCase()} jobs found.`}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto pb-6 custom-scrollbar">
          {filteredJobs.map((job) => (
            <div 
              key={job.id} 
              onClick={() => handleSelectJob(job.id)}
              className={`p-5 border-b border-slate-800/50 cursor-pointer transition-all duration-200 
                ${selectedJobId === job.id ? 'bg-slate-900 border-l-2 border-l-blue-500' : 'hover:bg-slate-900/50 border-l-2 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm 
                    ${job.isGolden ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {job.isGolden ? 'Golden' : 'Standard'}
                  </span>
                  {job.proposalDraft?.status === 'submitted' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center">
                      <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      Submitted
                    </span>
                  )}
                </div>
                <span suppressHydrationWarning className="text-xs text-slate-500 font-mono">
                  {new Date(job.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="font-medium text-slate-200 text-sm leading-snug line-clamp-2 mb-2">
                {job.title}
              </h3>
              <p className="text-xs text-emerald-400 font-semibold tracking-wide">
                {job.budget ? `$${job.budget}` : (job.hourlyMin ? `$${job.hourlyMin} - $${job.hourlyMax}/hr` : 'Budget TBD')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2 & 3. Details and Drafter Container (Hidden on mobile if not active) */}
      <div 
        className={`flex-col lg:flex-row flex-1 bg-slate-950 w-full lg:flex ${isMobileDetailsOpen ? 'flex' : 'hidden'}`}
      >
        {/* Mobile Back Button */}
        <div className="lg:hidden p-4 border-b border-slate-800 bg-slate-900 flex items-center shadow-sm">
          <button 
            onClick={() => setIsMobileDetailsOpen(false)}
            className="text-sm font-medium text-slate-400 hover:text-white flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Radar
          </button>
        </div>

        {/* Middle: Job Details */}
        <div className="w-full lg:w-1/2 border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          {selectedJob ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-start justify-between mb-4 gap-4">
                <h2 className="text-xl lg:text-2xl font-semibold text-slate-100 leading-tight">
                  {selectedJob.title}
                </h2>
                <a href={`https://www.upwork.com/jobs/${selectedJob.id}`} target="_blank" rel="noopener noreferrer" className="mt-1 flex-shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-md border border-slate-700 transition-colors flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  View on Upwork
                </a>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md text-sm font-medium">
                  {selectedJob.budget ? `$${selectedJob.budget} Fixed` : (selectedJob.hourlyMin ? `$${selectedJob.hourlyMin} - $${selectedJob.hourlyMax}/hr` : 'Hourly')}
                </span>
                {selectedJob.score !== null && selectedJob.score !== undefined ? (
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                    Score: {selectedJob.score}/100
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Pending Analysis
                  </span>
                )}
              </div>
              
              <div className="mb-8">
                {selectedJob.reason && (
                  <div className="mb-6 bg-slate-800/40 border border-slate-700/60 rounded-lg p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      AI Evaluation
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {selectedJob.reason}
                    </p>
                  </div>
                )}
                
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">Description</h3>
                <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-light">
                  {selectedJob.description}
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.split(',').filter(Boolean).map((skill: string) => (
                    <span key={skill} className="bg-slate-800/50 text-slate-300 border border-slate-700/50 text-xs px-2.5 py-1.5 rounded shadow-sm">
                      {skill.trim()}
                    </span>
                  ))}
                  {(!selectedJob.skills || selectedJob.skills.trim() === '') && (
                    <span className="text-sm text-slate-500 italic">No specific skills listed.</span>
                  )}
                </div>
              </div>

              {(selectedJob.jobInvitesSent !== null || selectedJob.jobInterviewing !== null || selectedJob.jobAvgBid !== null || selectedJob.jobConnectsCost !== null) && (
                <div className="mt-8 mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">Activity & Competition</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedJob.jobInvitesSent !== null && (
                      <div className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 flex items-center">
                        <span className="text-slate-500 mr-2">Invites Sent:</span> 
                        <span className="font-semibold text-slate-200">{selectedJob.jobInvitesSent}</span>
                      </div>
                    )}
                    {selectedJob.jobInterviewing !== null && (
                      <div className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 flex items-center">
                        <span className="text-slate-500 mr-2">Interviewing:</span> 
                        <span className="font-semibold text-slate-200">{selectedJob.jobInterviewing}</span>
                      </div>
                    )}
                    {selectedJob.jobAvgBid !== null && (
                      <div className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 flex items-center">
                        <span className="text-slate-500 mr-2">Avg Bid:</span> 
                        <span className="font-semibold text-blue-400">${selectedJob.jobAvgBid.toFixed(2)}/hr</span>
                      </div>
                    )}
                    {selectedJob.jobConnectsCost !== null && (
                      <div className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-300 flex items-center">
                        <span className="text-slate-500 mr-2">Connects:</span> 
                        <span className="font-semibold text-purple-400">{selectedJob.jobConnectsCost}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedJob.clientHistory || (selectedJob.clientTotalSpend !== null && selectedJob.clientTotalSpend !== undefined)) && (
                <div className="mt-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">Client Profile</h3>
                  <div className="bg-slate-950/50 rounded-lg p-4 flex flex-col gap-4 border border-slate-800/60">
                    
                    {/* Client Intelligence Controls */}
                    {selectedJob.client && (
                      <div className="flex flex-col gap-3 bg-slate-900/50 p-3 rounded-md border border-slate-700/50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-slate-300">Client Intelligence</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleUpdateClient(selectedJob.client.id, 'FAVORITE', selectedJob.client.notes || '')}
                              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${selectedJob.client.status === 'FAVORITE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                            >
                              ⭐️ Favorite
                            </button>
                            <button 
                              onClick={() => handleUpdateClient(selectedJob.client.id, 'NEUTRAL', selectedJob.client.notes || '')}
                              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${selectedJob.client.status === 'NEUTRAL' ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                            >
                              Neutral
                            </button>
                            <button 
                              onClick={() => handleUpdateClient(selectedJob.client.id, 'BLACKLISTED', selectedJob.client.notes || '')}
                              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${selectedJob.client.status === 'BLACKLISTED' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                            >
                              🚫 Blacklist
                            </button>
                          </div>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Private notes about this client..."
                          defaultValue={selectedJob.client.notes || ''}
                          onBlur={(e) => handleUpdateClient(selectedJob.client.id, selectedJob.client.status, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 items-center">
                    {selectedJob.clientHistory && (() => {
                      try {
                        const client = JSON.parse(selectedJob.clientHistory);
                        return (
                          <>
                            {client.country && (
                              <div className="flex items-center text-sm text-slate-300">
                                <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {client.country}
                              </div>
                            )}
                            {client.rating !== undefined && (
                              <div className="flex items-center text-sm text-slate-300">
                                <svg className="w-4 h-4 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                {client.rating.toFixed(1)} / 5.0
                              </div>
                            )}
                            {client.total_hires !== undefined && (
                              <div className="flex items-center text-sm text-slate-300">
                                <svg className="w-4 h-4 mr-1.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                {client.total_hires} hires
                              </div>
                            )}
                            {client.verification_status && (
                              <div className={`text-xs px-2 py-1 rounded-md font-medium ${client.verification_status === 'VERIFIED' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                                {client.verification_status === 'VERIFIED' ? 'Payment Verified' : 'Payment Unverified'}
                              </div>
                            )}
                          </>
                        );
                      } catch (e) {
                        return null;
                      }
                    })()}
                    
                    {selectedJob.clientLocation && (
                      <div className="flex items-center text-sm text-slate-300 w-full mb-1">
                        <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {selectedJob.clientLocation}
                      </div>
                    )}
                    
                    {selectedJob.clientFeedbackScore !== null && selectedJob.clientFeedbackScore !== undefined && (
                      <div className="flex items-center text-sm text-slate-300">
                        <svg className="w-4 h-4 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        {selectedJob.clientFeedbackScore.toFixed(1)} / 5.0 ({selectedJob.clientFeedbackCount} reviews)
                      </div>
                    )}
                    
                    {selectedJob.clientTotalContracts !== null && selectedJob.clientTotalContracts !== undefined && (
                      <div className="flex items-center text-sm text-slate-300">
                        <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        {selectedJob.clientTotalContracts} contracts ({selectedJob.clientActiveContracts} active)
                      </div>
                    )}

                    {/* Deep Client Metrics (if available) */}
                    {selectedJob.clientTotalSpend !== null && selectedJob.clientTotalSpend !== undefined && (
                      <div className="flex items-center text-sm text-slate-200 font-semibold bg-emerald-500/10 px-2 py-1 rounded">
                        <svg className="w-4 h-4 mr-1.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Spend: ${selectedJob.clientTotalSpend.toLocaleString()}
                      </div>
                    )}
                    
                    {selectedJob.clientAvgHourlyRate !== null && selectedJob.clientAvgHourlyRate !== undefined && (
                      <div className="flex items-center text-sm text-slate-200 font-semibold bg-purple-500/10 px-2 py-1 rounded">
                        <svg className="w-4 h-4 mr-1.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Avg Pay: ${selectedJob.clientAvgHourlyRate.toFixed(2)}/hr
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <svg className="w-12 h-12 mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <p>Select an opportunity to view details</p>
            </div>
          )}
        </div>

        {/* Right: Proposal Drafter */}
        <div className="w-full lg:w-1/2 bg-slate-900 border-l border-slate-800 overflow-y-auto p-6 lg:p-8 flex flex-col shadow-xl custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              AI Proposal Draft
            </h2>
          </div>

          {selectedJob?.proposalDraft ? (
            <div className="flex-1 flex flex-col h-full min-h-[400px] relative">
              {isGenerating && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-blue-500/30">
                  <svg className="w-10 h-10 text-blue-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-blue-400 font-medium animate-pulse">Generating full proposal...</p>
                </div>
              )}
              <textarea 
                className="flex-1 w-full p-5 bg-slate-950 border border-slate-800 rounded-xl shadow-inner text-sm text-slate-300 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none leading-relaxed custom-scrollbar transition-all"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
              />
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white transition-all shadow-sm flex items-center justify-center disabled:opacity-50">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Generate Full Proposal
                </button>
                <button 
                  onClick={handleSubmitProposal}
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 border border-blue-500 flex items-center justify-center disabled:opacity-50">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {selectedJob.proposalDraft.status === 'submitted' ? 'Submitted!' : 'Submit & Copy'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/50 p-8 border border-slate-800/50 rounded-xl flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              {selectedJob?.isGolden ? (
                <>
                  <svg className="w-10 h-10 text-amber-500/70 animate-spin-slow mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-slate-400 text-sm font-medium">Generating golden draft...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <h3 className="text-slate-300 font-medium mb-1">Draft Locked</h3>
                  <p className="text-slate-500 text-xs max-w-[200px] leading-relaxed">
                    This job did not meet the 'Golden' criteria. Draft generation was skipped.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Scrollbar Styles for the app */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #475569;
        }
      `}} />
    </div>
  );
}
