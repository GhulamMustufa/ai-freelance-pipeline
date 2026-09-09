'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface Preset {
  label: string;
  badge: string;
  badgeColor: string;
  data: {
    title: string;
    description: string;
    budget?: number;
    hourlyMin?: number;
    hourlyMax?: number;
    client?: {
      location?: string;
      totalSpend?: number;
      feedbackScore?: number;
      hires?: number;
    };
  };
}

const PRESETS: Preset[] = [
  {
    label: 'AI & Next.js Systems Engineer',
    badge: 'High Fit (APPLY)',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    data: {
      title: 'Full-Stack AI Engineer — Next.js, Multi-Agent Systems & DeepSeek',
      description: `We are looking for a Senior AI & Full-Stack Engineer to architect an autonomous agent workflow. 
Requirements:
- Strong hands-on experience with Next.js App Router, TypeScript, and modern UI.
- Direct experience integrating LLM APIs (OpenAI, DeepSeek) and multi-agent routing.
- Knowledge of RAG pipelines, vector search, and anti-hallucination verification loops.
- Clean code architecture, database persistence (Prisma / SQL), and background worker orchestration.

Please provide examples of production AI systems or pipelines you have built.`,
      budget: 4500,
      hourlyMin: 60,
      hourlyMax: 85,
      client: {
        location: 'United States',
        totalSpend: 62000,
        feedbackScore: 4.95,
        hires: 24
      }
    }
  },
  {
    label: 'React Webhook Integration (JD Only)',
    badge: 'Marginal (MAYBE)',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    data: {
      title: '',
      description: `Need a frontend developer to connect our webhook endpoints to a responsive React dashboard. 
The backend is already running on Node.js. Your job is to format tables, handle optimistic updates, and display real-time status notifications.
Budget is fixed at $800. Timeline is approximately 2 weeks.`,
      budget: 800,
      hourlyMin: undefined,
      hourlyMax: undefined,
      client: undefined // Demonstrates RAW JD with NO client data
    }
  },
  {
    label: 'Excluded Tech: WordPress Task ($30)',
    badge: 'Dealbreaker (SKIP)',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    data: {
      title: 'Need complete WordPress custom plugin in 24 hours cheap',
      description: `Need an expert in PHP and WordPress to build a custom membership plugin with payment gateway. Total budget is $30. Must be finished by tomorrow morning. Do not bid higher or you will be reported.`,
      budget: 30,
      hourlyMin: undefined,
      hourlyMax: undefined,
      client: undefined
    }
  }
];

export default function ManualJobAnalyzer() {
  // Input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [hourlyMin, setHourlyMin] = useState<string>('');
  const [hourlyMax, setHourlyMax] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clientLocation, setClientLocation] = useState('');
  const [clientSpend, setClientSpend] = useState('');
  const [clientRating, setClientRating] = useState('');

  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSkills, setProfileSkills] = useState('');
  const [profilePrimarySkills, setProfilePrimarySkills] = useState('');
  const [profileExcluded, setProfileExcluded] = useState('');
  const [profileTargetRate, setProfileTargetRate] = useState('75');
  const [profileMinBudget, setProfileMinBudget] = useState('1000');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileAvailability, setProfileAvailability] = useState('FULL_TIME');

  // Loading & Execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'decision' | 'proposal' | 'trace'>('decision');

  // Fetch active default profile and check for benchmark inspection on mount
  useEffect(() => {
    fetchProfile();

    try {
      const stored = sessionStorage.getItem('omnibid_inspect_job');
      if (stored) {
        const job = JSON.parse(stored);
        setTitle(job.title || '');
        setDescription(job.description || '');
        setBudget(job.budget ? String(job.budget) : '');
        setHourlyMin(job.hourlyMin ? String(job.hourlyMin) : '');
        setHourlyMax(job.hourlyMax ? String(job.hourlyMax) : '');
        if (job.client) {
          setShowAdvanced(true);
          setClientLocation(job.client.location || '');
          setClientSpend(job.client.totalSpend ? String(job.client.totalSpend) : '');
          setClientRating(job.client.feedbackScore ? String(job.client.feedbackScore) : '');
        }
        sessionStorage.removeItem('omnibid_inspect_job');
        // Automatically execute live triage to show all details immediately
        setTimeout(() => {
          executeTriage(job);
        }, 150);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setProfileSkills(data.profile.skills.join(', '));
        setProfilePrimarySkills((data.profile.primarySkills || []).join(', '));
        setProfileExcluded(data.profile.excludedTechnologies.join(', '));
        setProfileTargetRate(String(data.profile.targetHourlyRate || 75));
        setProfileMinBudget(String(data.profile.minProjectBudget || 1000));
        setProfileLocation(data.profile.location || '');
        setProfileAvailability(data.profile.availability || 'FULL_TIME');
      }
    } catch (e) {
      console.warn('Could not load profile:', e);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile?.id || 'default-profile',
          name: profile?.name || 'Senior Full-Stack AI Engineer',
          headline: profile?.headline || 'Senior Full-Stack & AI Systems Engineer',
          bio: profile?.bio || '',
          experienceYears: profile?.experienceYears || 8,
          skills: profileSkills.split(',').map(s => s.trim()).filter(Boolean),
          primarySkills: profilePrimarySkills.split(',').map(s => s.trim()).filter(Boolean),
          preferredTechnologies: profileSkills.split(',').map(s => s.trim()).slice(0, 5),
          excludedTechnologies: profileExcluded.split(',').map(s => s.trim()).filter(Boolean),
          targetHourlyRate: Number(profileTargetRate) || 75,
          minProjectBudget: Number(profileMinBudget) || 1000,
          location: profileLocation || 'Remote / US Timezones',
          availability: profileAvailability || 'FULL_TIME',
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowProfileModal(false);
        fetchProfile();
      }
    } catch (e) {
      alert('Failed to update profile');
    }
  };

  const loadPreset = (preset: Preset) => {
    setTitle(preset.data.title);
    setDescription(preset.data.description);
    setBudget(preset.data.budget ? String(preset.data.budget) : '');
    setHourlyMin(preset.data.hourlyMin ? String(preset.data.hourlyMin) : '');
    setHourlyMax(preset.data.hourlyMax ? String(preset.data.hourlyMax) : '');
    
    if (preset.data.client) {
      setClientLocation(preset.data.client.location || '');
      setClientSpend(preset.data.client.totalSpend ? String(preset.data.client.totalSpend) : '');
      setClientRating(preset.data.client.feedbackScore ? String(preset.data.client.feedbackScore) : '');
    } else {
      setClientLocation('');
      setClientSpend('');
      setClientRating('');
    }
    setResult(null);
    setError(null);
  };

  const executeTriage = async (customPayload?: any) => {
    const targetDesc = customPayload?.description ?? description;
    if (!targetDesc || !targetDesc.trim()) {
      setError('Please paste a job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const payload = {
        title: (customPayload?.title ?? title)?.trim() || undefined,
        description: targetDesc.trim(),
        platform: 'MANUAL',
        budget: customPayload?.budget !== undefined ? (customPayload.budget ? parseFloat(customPayload.budget) : undefined) : (budget ? parseFloat(budget) : undefined),
        hourlyMin: customPayload?.hourlyMin !== undefined ? (customPayload.hourlyMin ? parseFloat(customPayload.hourlyMin) : undefined) : (hourlyMin ? parseFloat(hourlyMin) : undefined),
        hourlyMax: customPayload?.hourlyMax !== undefined ? (customPayload.hourlyMax ? parseFloat(customPayload.hourlyMax) : undefined) : (hourlyMax ? parseFloat(hourlyMax) : undefined),
        client: customPayload?.client ?? ((clientLocation || clientSpend || clientRating) ? {
          location: clientLocation || undefined,
          totalSpend: clientSpend ? parseFloat(clientSpend) : undefined,
          feedbackScore: clientRating ? parseFloat(clientRating) : undefined,
        } : undefined),
        profile: profile ? {
          ...profile,
          skills: profileSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
          excludedTechnologies: profileExcluded.split(',').map((s: string) => s.trim()).filter(Boolean),
          targetHourlyRate: Number(profileTargetRate) || 75,
          minProjectBudget: Number(profileMinBudget) || 1000,
        } : undefined,
      };

      const res = await fetch('/api/opportunities/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Pipeline execution failed');
      }

      setResult(data);
      setActiveTab('decision');
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    executeTriage();
  };

  const copyProposalToClipboard = () => {
    if (result?.proposal?.content) {
      navigator.clipboard.writeText(result.proposal.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const recommendation = result?.recommendation;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Active Profile Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Zero-Friction Decision Engine
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Zero integrations required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Opportunity Intelligence Workspace
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Paste any job description to determine whether it is worth your time, understand why, and generate an evidence-grounded proposal.
            </p>
          </div>

          {/* Active Profile Pill / Customizer */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
                👤
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    {profile?.name || 'Loading Profile...'}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded">
                    v{profile?.version || 1}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target: <span className="text-amber-600 dark:text-amber-400 font-medium">${profileTargetRate}/hr</span> • Min: <span className="text-emerald-600 dark:text-emerald-400 font-medium">${profileMinBudget}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="ml-2 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-all"
              >
                ⚙️ Edit
              </button>
            </div>
          </div>
        </div>

        {/* Profile Settings Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 dark:bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>⚙️</span> Customize Freelancer Profile
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Currently active: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">Profile v{profile?.version || 1}</span> (Saving bumps version and creates new snapshot)
                  </p>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Core Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={profileSkills}
                    onChange={e => setProfileSkills(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-xs"
                    placeholder="Next.js, TypeScript, Node.js, OpenAI, PostgreSQL"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Primary / Top Strengths (Verified Claims Ceiling)
                  </label>
                  <input
                    type="text"
                    value={profilePrimarySkills}
                    onChange={e => setProfilePrimarySkills(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-xs"
                    placeholder="Next.js App Router, TypeScript, Multi-Agent Architecture, RAG"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                    Excluded Technologies (Immediate SKIP Dealbreakers)
                  </label>
                  <input
                    type="text"
                    value={profileExcluded}
                    onChange={e => setProfileExcluded(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-rose-300 dark:border-rose-500/30 rounded-lg px-3 py-2 text-rose-700 dark:text-rose-200 focus:outline-none focus:border-rose-500 text-xs"
                    placeholder="PHP, WordPress, Ruby, Web3, Smart Contracts"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Any job requiring these technologies triggers an immediate deterministic auto-SKIP before LLM inference.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Target Hourly Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      value={profileTargetRate}
                      onChange={e => setProfileTargetRate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Minimum Fixed Budget ($)
                    </label>
                    <input
                      type="number"
                      value={profileMinBudget}
                      onChange={e => setProfileMinBudget(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Location / Timezone
                    </label>
                    <input
                      type="text"
                      value={profileLocation}
                      onChange={e => setProfileLocation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-xs"
                      placeholder="Remote / US Timezones"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Availability
                    </label>
                    <select
                      value={profileAvailability}
                      onChange={e => setProfileAvailability(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-xs"
                    >
                      <option value="FULL_TIME">Full-time (30-40 hrs/wk)</option>
                      <option value="PART_TIME">Part-time (10-20 hrs/wk)</option>
                      <option value="PROJECT">Project-based</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Save Profile (Bump to v{(profile?.version || 1) + 1})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demo Presets Row */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>⚡ Test with 1-Click Golden Presets:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(p)}
                className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all group flex flex-col justify-between shadow-sm dark:shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {p.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {p.data.description.substring(0, 100)}...
                  </p>
                </div>
                <span className="text-[11px] text-amber-600 dark:text-amber-500/80 font-medium mt-2 flex items-center gap-1">
                  Load into analyzer →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Input Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Paste Job Description</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Accepts raw text or URL</span>
            </h2>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Job Description (Required)
                </label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Paste the full job posting text here. You can include budget, requirements, or client text directly..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              {/* Optional Quick Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Next.js Developer"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Stated Fixed Budget ($)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. 3500"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Collapsible Advanced Info (Client / Hourly) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-medium transition-colors"
                >
                  <span>{showAdvanced ? '▾ Hide' : '▸ Add'} Optional Client / Hourly Info</span>
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Hourly Min ($/hr)</label>
                        <input
                          type="number"
                          value={hourlyMin}
                          onChange={e => setHourlyMin(e.target.value)}
                          placeholder="45"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Hourly Max ($/hr)</label>
                        <input
                          type="number"
                          value={hourlyMax}
                          onChange={e => setHourlyMax(e.target.value)}
                          placeholder="80"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Client Location</label>
                        <input
                          type="text"
                          value={clientLocation}
                          onChange={e => setClientLocation(e.target.value)}
                          placeholder="USA"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Client Spend ($)</label>
                        <input
                          type="number"
                          value={clientSpend}
                          onChange={e => setClientSpend(e.target.value)}
                          placeholder="25000"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Rating (1-5)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={clientRating}
                          onChange={e => setClientRating(e.target.value)}
                          placeholder="4.9"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Synthesizing Multi-Agent Intelligence...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Triage Opportunity (Instant AI Decision)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Triage Decision & Proposal Engine (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Empty State when no analysis has run */}
            {!result && !isAnalyzing && (
              <div className="bg-white/60 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm dark:shadow-none">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold shadow-inner">
                  ⚡
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Ready to Triage
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Paste any job description on the left or select a golden preset above. OmniBid will synthesize technical fit, client risk, economics, and generate a grounded proposal.
                  </p>
                </div>
              </div>
            )}

            {/* Loading Skeleton */}
            {isAnalyzing && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 animate-pulse shadow-sm dark:shadow-none">
                <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4"></div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
                <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            )}

            {/* Complete Result View */}
            {result && !isAnalyzing && (
              <div className="space-y-6">

                {/* Tabs: Decision | Grounded Proposal | Agent Trace */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <button
                    onClick={() => setActiveTab('decision')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'decision'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    🎯 1. Decision & Scorecard
                  </button>

                  {result.proposal && (
                    <button
                      onClick={() => setActiveTab('proposal')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeTab === 'proposal'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>📝 2. Grounded Proposal</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Verified
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('trace')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'trace'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    🔍 3. Agent Execution Trace
                  </button>
                </div>

                {/* TAB 1: DECISION & SCORECARD */}
                {activeTab === 'decision' && (
                  <div className="space-y-6">
                    {/* Hero Decision Banner */}
                    <div className={`p-6 rounded-2xl border shadow-xl ${
                      recommendation === 'APPLY'
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300'
                        : recommendation === 'MAYBE'
                        ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 dark:border-amber-500/40 text-amber-900 dark:text-amber-300'
                        : 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30 dark:border-rose-500/40 text-rose-900 dark:text-rose-300'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl sm:text-3xl font-black px-4 py-1.5 rounded-xl border ${
                            recommendation === 'APPLY'
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                              : recommendation === 'MAYBE'
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                              : 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/20'
                          }`}>
                            {recommendation}
                          </span>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              Recommendation Confidence
                            </div>
                            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                              {Math.round((result.confidence || 0.9) * 100)}% Confidence
                            </div>
                          </div>
                        </div>

                        {recommendation === 'APPLY' && result.proposal && (
                          <button
                            onClick={() => setActiveTab('proposal')}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                          >
                            View Verified Proposal →
                          </button>
                        )}
                      </div>

                      <p className="mt-4 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed border-t border-slate-200 dark:border-slate-800/60 pt-3">
                        {result.summary || result.reason}
                      </p>
                    </div>

                    {/* 4-Pillar Scorecard Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Technical Fit */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1 shadow-sm">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Technical Fit</div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                          {result.scores?.technicalFit ?? 0}
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal"> / 100</span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {result.scores?.technicalFit > 75 ? 'Strong Match' : (result.scores?.technicalFit > 40 ? 'Moderate' : 'Disjoint')}
                        </div>
                      </div>

                      {/* Economic Quality */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1 shadow-sm">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Economics</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {result.economics?.status === 'OBSERVED' ? 'OBSERVED' : (result.economics?.status || 'ESTIMATED')}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                          {result.economics?.effectiveHourlyRate ? `~$${result.economics.effectiveHourlyRate}/hr` : 'Scope estimate'}
                        </div>
                      </div>

                      {/* Client Risk */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1 shadow-sm">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Client Risk</div>
                        <div className={`text-xl font-black ${
                          result.scores?.clientRisk === 'UNKNOWN' ? 'text-slate-500 dark:text-slate-400' :
                          result.scores?.clientRisk === 'HIGH' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {result.scores?.clientRisk || 'UNKNOWN'}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {result.scores?.clientRisk === 'UNKNOWN' ? 'No history provided' : 'Verified score'}
                        </div>
                      </div>

                      {/* Scope Clarity */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1 shadow-sm">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Scope Clarity</div>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                          {result.scores?.scopeClarity || 'MEDIUM'}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          Deliverable definition
                        </div>
                      </div>
                    </div>

                    {/* 3 Detail Cards: Why / Unknowns / Risks */}
                    <div className="space-y-4">
                      {/* WHY Drivers */}
                      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <span>✓</span> Why This Recommendation:
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                          {(result.positiveEvidence?.length > 0 ? result.positiveEvidence : result.reasons || [result.reason]).map((r: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* UNKNOWNS Card */}
                      {result.unknowns && result.unknowns.length > 0 && (
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <span>ℹ️</span> Unknown Variables (Preserved Without Penalties):
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                            {result.unknowns.map((u: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-slate-400 dark:text-slate-500 font-bold">•</span>
                                <span>{u}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* RISKS Card */}
                      {result.risks && result.risks.length > 0 && (
                        <div className="bg-white dark:bg-slate-900/90 border border-rose-300 dark:border-rose-500/20 rounded-xl p-5 space-y-2 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <span>⚠️</span> Project Risks & Watchouts:
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                            {result.risks.map((risk: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: GROUNDED PROPOSAL */}
                {activeTab === 'proposal' && result.proposal && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                            ✓ Anti-Hallucination Verified
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Strictly grounded in your portfolio</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          Tailored Bidding Proposal
                        </h3>
                      </div>

                      <button
                        onClick={copyProposalToClipboard}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        {copied ? '✓ Copied to Clipboard!' : '📋 Copy Proposal Text'}
                      </button>
                    </div>

                    {/* Proposal Body */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                      {result.proposal.content}
                    </div>

                    {/* Evidence Citations */}
                    {result.proposal.evidenceUsed && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Portfolio Evidence Cited in this Draft:
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {result.proposal.evidenceUsed}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: AGENT EXECUTION TRACE */}
                {activeTab === 'trace' && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Multi-Agent Telemetry Audit
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Inspect reasoning latency, model routing, and token metrics for each pipeline step.
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/traces/${result.opportunityId}`}
                        className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                      >
                        View Full Trace Page →
                      </Link>
                    </div>

                    {/* Telemetry runs */}
                    <div className="space-y-3">
                      {result.opportunity?.agentRuns?.map((agent: any) => (
                        <div key={agent.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{agent.agentName}</span>
                            <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">({agent.model})</span>
                          </div>
                          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {agent.durationMs && <span>⏱️ {agent.durationMs}ms</span>}
                            {agent.promptTokens && <span>🔤 {agent.promptTokens + (agent.completionTokens || 0)} tokens</span>}
                            <span className="text-emerald-600 dark:text-emerald-400">✓ OK</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
