'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Save, Loader2, CheckCircle2, UserCircle } from 'lucide-react';

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    headline: '',
    bio: '',
    experienceYears: '5',
    targetHourlyRate: '',
    minProjectBudget: '',
    primarySkills: '',
    excludedTechnologies: '',
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setFormData({
          id: data.profile.id || '',
          name: data.profile.name || '',
          headline: data.profile.headline || '',
          bio: data.profile.bio || '',
          experienceYears: data.profile.experienceYears?.toString() || '5',
          targetHourlyRate: data.profile.targetHourlyRate?.toString() || '',
          minProjectBudget: data.profile.minProjectBudget?.toString() || '',
          primarySkills: data.profile.primarySkills?.join(', ') || '',
          excludedTechnologies: data.profile.excludedTechnologies?.join(', ') || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    
    try {
      const payload = {
        ...formData,
        primarySkills: formData.primarySkills.split(',').map(s => s.trim()).filter(Boolean),
        excludedTechnologies: formData.excludedTechnologies.split(',').map(s => s.trim()).filter(Boolean),
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

  if (!isLoaded || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
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
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-amber-500" />
            My Profile
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Define your skills, economics, and constraints. OmniBid uses this exact profile as the ground-truth when evaluating freelance jobs for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PERSONAL INFO */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional Headline</label>
                <input 
                  type="text" name="headline" value={formData.headline} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  placeholder="e.g. Senior Full-Stack Engineer"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</label>
                <textarea 
                  name="bio" value={formData.bio} onChange={handleChange} rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all resize-none"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Hourly Rate ($)</label>
                <input 
                  type="number" name="targetHourlyRate" value={formData.targetHourlyRate} onChange={handleChange} min="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  placeholder="e.g. 85"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Minimum Project Budget ($)</label>
                <input 
                  type="number" name="minProjectBudget" value={formData.minProjectBudget} onChange={handleChange} min="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                  placeholder="e.g. 1000"
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              OmniBid uses these numbers to evaluate if a job is economically viable. If a job's budget is strictly below your minimum floor, it will trigger a deterministic SKIP.
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
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/50 outline-none transition-all resize-none"
                  placeholder="e.g. PHP, WordPress, Magento, Web3..."
                />
                <p className="text-xs text-slate-500">If OmniBid detects these in a job posting, it will automatically flag the job as a SKIP.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
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
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Profile
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
