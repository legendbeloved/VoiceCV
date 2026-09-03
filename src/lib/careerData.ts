import type { CareerAssets, ResumeTemplate, ToneStyle } from './gemini';
import { supabase } from './supabase';

export async function ensureUserProfile(userId: string, displayName?: string) {
  if (!supabase) return;
  await supabase.from('user_profiles').upsert({ user_id: userId, display_name: displayName || null }, { onConflict: 'user_id' });
}

export async function saveCareerProfile(input: { userId: string; name: string; role: string; tone: ToneStyle; resumeTemplate: ResumeTemplate; assets: CareerAssets | null }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('career_profiles').insert({
    user_id: input.userId, name: input.name, role: input.role, tone: input.tone, resume_template: input.resumeTemplate, assets: input.assets,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function loadCareerProfiles() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('career_profiles').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateCareerProfile(id: string, updates: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('career_profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteCareerProfile(id: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('career_profiles').delete().eq('id', id);
  if (error) throw error;
}

export async function saveThemePreference(userId: string, theme: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('user_profiles').update({ preferred_theme: theme, updated_at: new Date().toISOString() }).eq('user_id', userId);
  if (error) throw error;
}

export async function saveGeneratedCareerSession(input: {
  userId: string; name: string; role: string; tone: ToneStyle; resumeTemplate: ResumeTemplate;
  jobDescription: string; transcript: string; visualTheme: string; assets: CareerAssets;
}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: profile, error: profileError } = await supabase.from('career_profiles').insert({
    user_id: input.userId, name: input.name, role: input.role, tone: input.tone,
    resume_template: input.resumeTemplate, job_description: input.jobDescription, transcript: input.transcript,
    visual_theme: input.visualTheme, assets: input.assets,
  }).select().single();
  if (profileError) throw profileError;
  const documents = [
    ['resume', 'Resume', input.assets.resume],
    ['cover_letter', 'Cover Letter', input.assets.coverLetter],
    ['linkedin_bio', 'LinkedIn Bio', input.assets.linkedinBio],
    ['interview_prep', 'Interview Prep', input.assets.interviewPrep],
  ].filter(([, , content]) => Boolean(content)).map(([document_type, title, content]) => ({
    user_id: input.userId, career_profile_id: profile.id, document_type, title: `${input.name} — ${title}`, content,
  }));
  if (documents.length) {
    const { error } = await supabase.from('career_documents').insert(documents);
    if (error) throw error;
  }
  return profile;
}
