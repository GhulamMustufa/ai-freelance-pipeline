'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Save, Loader2, CheckCircle2, UserCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function ProfileClient({ initialProfile, isFallback }: { initialProfile: any, isFallback?: boolean }) {
  const { isLoaded, isSignedIn } = useUser();
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    id: initialProfile?.id || '',
    name: initialProfile?.name || '',
    headline: initialProfile?.headline || '',
    bio: initialProfile?.bio || '',
    experienceYears: initialProfile?.experienceYears?.toString() || '5',
    targetHourlyRate: initialProfile?.targetHourlyRate?.toString() || '',
    minProjectBudget: initialProfile?.minProjectBudget?.toString() || '',
    primarySkills: initialProfile?.primarySkills || '',
    excludedTechnologies: initialProfile?.excludedTechnologies || '',
  });



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    
    try {
      const payload = {
        ...formData,
        primarySkills: formData.primarySkills.split(',').map((s: string) => s.trim()).filter(Boolean),
        excludedTechnologies: formData.excludedTechnologies.split(',').map((s: string) => s.trim()).filter(Boolean),
        experienceYears: parseInt(formData.experienceYears, 10),
        targetHourlyRate: formData.targetHourlyRate ? parseFloat(formData.targetHourlyRate) : null,
        minProjectBudget: formData.minProjectBudget ? parseFloat(formData.minProjectBudget) : null,
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Profile saved successfully!');
        if (data.profile?.id && !formData.id) {
          setFormData(prev => ({ ...prev, id: data.profile.id }));
        }
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-warning" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-slate-600 dark:text-slate-400">Please sign in to manage your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navigation />
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-warning" />
            My Profile
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Define your skills, economics, and constraints. OmniBid uses this exact profile as the ground-truth when evaluating freelance jobs for you.
          </p>
        </div>

        {isFallback && (
          <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-4 rounded-xl flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold text-sm">You are currently using the default fallback profile.</h3>
              <p className="text-xs mt-1 opacity-90">
                The fields below are pre-filled with demo data. OmniBid is currently using these assumptions to evaluate jobs. Please update the fields with your actual skills and click <b>Save Profile</b> to get personalized AI evaluations.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PERSONAL INFO */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning/50 outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional Headline</label>
                <input 
                  type="text" name="headline" value={formData.headline} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning/50 outline-none transition-all"
                  placeholder="e.g. Senior Full-Stack Engineer"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</label>
                <textarea 
                  name="bio" value={formData.bio} onChange={handleChange} rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning/50 outline-none transition-all resize-none"
                  placeholder="A short overview of your background and goals..."
                />
              </div>
            </div>
          </div>

          {/* ECONOMICS & EXPERIENCE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Economics & Experience</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Years of Experience</label>
                <input 
                  type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} min="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Hourly Rate ($)</label>
                <input 
                  type="number" name="targetHourlyRate" value={formData.targetHourlyRate} onChange={handleChange} min="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning/50 outline-none transition-all"
                  placeholder="e.g. 85"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Minimum Project Budget ($)</label>
                <input 
                  type="number" name="minProjectBudget" value={formData.minProjectBudget} onChange={handleChange} min="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-warning/50 outline-none transition-all"
                  placeholder="e.g. 1000"
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              OmniBid uses these numbers to evaluate if a job is economically viable. If a job&apos;s budget is strictly below your minimum floor, it will trigger a deterministic SKIP.
            </p>
          </div>

          {/* SKILLS & CONSTRAINTS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Skills & Constraints</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  Primary Skills
                  <span className="text-xs font-normal text-slate-500">Comma-separated</span>
                </label>
                <textarea 
                  name="primarySkills" value={formData.primarySkills} onChange={handleChange} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-success/30 bg-emerald-50/50 dark:bg-success/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-success/50 outline-none transition-all resize-none"
                  placeholder="e.g. React, Next.js, TypeScript, PostgreSQL, AI Integration..."
                />
                <p className="text-xs text-slate-500">The core technologies you are an expert in.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  Excluded Technologies & Dealbreakers
                  <span className="text-xs font-normal text-slate-500">Comma-separated</span>
                </label>
                <textarea 
                  name="excludedTechnologies" value={formData.excludedTechnologies} onChange={handleChange} rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-danger/30 bg-rose-50/50 dark:bg-danger/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-danger/50 outline-none transition-all resize-none"
                  placeholder="e.g. PHP, WordPress, Magento, Web3..."
                />
                <p className="text-xs text-slate-500">If OmniBid detects these in a job posting, it will automatically flag the job as a SKIP.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-success font-medium flex items-center gap-2">
              {successMessage && (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {successMessage}
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-warning hover:bg-warning text-slate-950 font-bold shadow-lg shadow-warning/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Profile
            </button>
          </div>
        </form>

      </div>
    </div>
    </div>
  );
}
