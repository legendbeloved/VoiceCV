import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Linkedin, ArrowRight, CheckCircle2, AlertCircle, Loader2, Briefcase, GraduationCap, Award, Info } from 'lucide-react';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { parseLinkedInProfile, LinkedInProfile, CareerAssets } from '../lib/gemini';

export default function ImportPage({ onToast }: { onToast: (msg: string, v: 'success' | 'error' | 'info') => void }) {
  const { setAssets, setJobRole, setTranscript } = useVoiceCVStore();
  const [importMode, setImportMode] = useState<'linkedin' | 'resume'>('linkedin');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<LinkedInProfile | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = async () => {
    if (!inputText.trim()) {
      onToast('Please paste your LinkedIn profile or resume text.', 'error');
      return;
    }
    setLoading(true);
    try {
      const profile = await parseLinkedInProfile(inputText);
      setParsedProfile(profile);
      onToast('Profile parsed successfully.', 'success');
    } catch (error) {
      const msg = error instanceof Error && error.message.includes('API key')
        ? 'Gemini API key is missing. Please check your .env file contains GEMINI_API_KEY.'
        : 'Failed to parse profile. Please try again.';
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImportToStore = () => {
    if (!parsedProfile) return;

    const experienceText = parsedProfile.experience
      .map((e) => `${e.title} at ${e.company} (${e.duration}): ${e.description}`)
      .join('\n');

    const educationText = parsedProfile.education
      .map((e) => `${e.degree} in ${e.field} from ${e.school} (${e.year})`)
      .join('\n');

    const fullTranscript = [
      `Name: ${parsedProfile.name}`,
      `Headline: ${parsedProfile.headline}`,
      `\nSummary:\n${parsedProfile.summary}`,
      `\nExperience:\n${experienceText}`,
      `\nEducation:\n${educationText}`,
      `\nSkills: ${parsedProfile.skills.join(', ')}`,
    ].join('\n');

    const assets: CareerAssets = {
      transcript: fullTranscript,
      resume: '',
      coverLetter: '',
      linkedinBio: parsedProfile.summary,
      strengths: parsedProfile.skills.slice(0, 5),
      keywords: parsedProfile.skills,
      resumeScore: { overall: 70, clarity: 70, atsKeywords: 65, impact: 68, completeness: 72, notes: [] },
      missingInfoPrompts: ['Add quantified achievements to each role.', 'Include specific project outcomes.'],
      name: parsedProfile.name,
      role: parsedProfile.headline || 'Professional',
      extracted: {
        skills: parsedProfile.skills,
        experience: parsedProfile.experience.map((e) => `${e.title} at ${e.company}`),
        education: parsedProfile.education.map((e) => `${e.degree} from ${e.school}`),
        achievements: parsedProfile.experience.flatMap((e) => e.description ? [e.description] : []),
      },
      contactInfo: { email: '', phone: '', location: '' },
    };

    setAssets(assets);
    setJobRole(parsedProfile.headline || 'Professional');
    setTranscript(fullTranscript);
    onToast('Profile imported to VoiceCV. Go to Record to generate full documents.', 'success');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      onToast('PDF files: Please open the PDF, select all text (Ctrl+A), copy (Ctrl+C), and paste it into the text area below.', 'info');
      setImportMode('resume');
      return;
    }

    if (extension === 'docx' || extension === 'doc') {
      onToast('Word files: Please open the document, select all text (Ctrl+A), copy (Ctrl+C), and paste it into the text area below.', 'info');
      setImportMode('resume');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      setImportMode('resume');
      onToast(`File "${file.name}" loaded successfully. Click Parse to extract profile data.`, 'success');
    };
    reader.onerror = () => {
      onToast(`Failed to read file "${file.name}". Please try copying the text manually.`, 'error');
    };
    reader.readAsText(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[var(--accent)]">Import Profile</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-display font-extrabold text-[var(--text)]">Import from LinkedIn or Resume</h1>
        <p className="mt-4 text-[var(--muted)] max-w-2xl">Bootstrap your VoiceCV by importing your existing LinkedIn profile, resume text, or uploading a PDF/Word document.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <Card variant="solid" padding="lg" className="space-y-5">
            <div className="flex gap-3">
              {[
                { id: 'linkedin' as const, label: 'LinkedIn Profile', icon: Linkedin },
                { id: 'resume' as const, label: 'Resume Text / File', icon: FileText },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setImportMode(mode.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-4 font-display font-bold transition-all ${importMode === mode.id ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]' : 'border-[var(--border)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)]'}`}
                >
                  <mode.icon size={18} />
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {importMode === 'linkedin' ? (
                <div>
                  <label className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Paste your LinkedIn profile text</label>
                  <p className="mt-1 ml-2 text-xs text-[var(--muted)]">Go to your LinkedIn profile, click "More" and select "Save to PDF", then copy the text, or simply copy-paste your profile page content.</p>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your LinkedIn profile text here..."
                    className="mt-3 min-h-64 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10 text-center cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all"
                  >
                    <Upload size={40} className="mb-4 text-[var(--muted)]" />
                    <p className="text-sm font-bold text-[var(--text)]">Click to upload a text file (.txt)</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">For PDF/Word: Open the file, select all text, copy and paste below</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
                  
                  {uploadedFileName && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/20">
                      <Info size={16} className="text-[var(--accent)]" />
                      <p className="text-xs text-[var(--accent)]">Loaded: {uploadedFileName}</p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">How to import PDF/Word resumes:</p>
                    <ol className="text-xs text-[var(--muted)] space-y-1 list-decimal list-inside">
                      <li>Open your resume PDF or Word document</li>
                      <li>Select all text (Ctrl+A / Cmd+A)</li>
                      <li>Copy it (Ctrl+C / Cmd+C)</li>
                      <li>Paste it in the text area below (Ctrl+V / Cmd+V)</li>
                    </ol>
                  </div>

                  <div>
                    <label className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Paste resume text here</label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      className="mt-3 min-h-48 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--text)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleParse} loading={loading} disabled={!inputText.trim()} className="w-full" size="lg" rightIcon={<ArrowRight size={20} />}>
              Parse Profile with AI
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          {parsedProfile ? (
            <>
              <Card variant="solid" padding="lg" className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-[var(--text)]">Parsed Profile</h2>
                  <CheckCircle2 size={20} className="text-green-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Name</p>
                    <p className="text-lg font-bold text-[var(--text)]">{parsedProfile.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Headline</p>
                    <p className="text-sm text-[var(--text)]">{parsedProfile.headline}</p>
                  </div>
                </div>
              </Card>

              {parsedProfile.experience.length > 0 && (
                <Card variant="solid" padding="lg" className="space-y-4">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text)]">
                    <Briefcase size={18} className="text-[var(--accent)]" /> Experience
                  </h2>
                  <div className="space-y-3">
                    {parsedProfile.experience.map((exp, i) => (
                      <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <p className="font-bold text-[var(--text)]">{exp.title}</p>
                        <p className="text-sm text-[var(--accent)]">{exp.company}</p>
                        <p className="text-xs text-[var(--muted)]">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {parsedProfile.education.length > 0 && (
                <Card variant="solid" padding="lg" className="space-y-4">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text)]">
                    <GraduationCap size={18} className="text-[var(--accent)]" /> Education
                  </h2>
                  <div className="space-y-3">
                    {parsedProfile.education.map((edu, i) => (
                      <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <p className="font-bold text-[var(--text)]">{edu.degree} in {edu.field}</p>
                        <p className="text-sm text-[var(--accent)]">{edu.school}</p>
                        <p className="text-xs text-[var(--muted)]">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {parsedProfile.skills.length > 0 && (
                <Card variant="solid" padding="lg" className="space-y-4">
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text)]">
                    <Award size={18} className="text-[var(--accent)]" /> Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {parsedProfile.skills.map((skill) => (
                      <Badge key={skill} className="border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">{skill}</Badge>
                    ))}
                  </div>
                </Card>
              )}

              <Button onClick={handleImportToStore} className="w-full" size="lg" leftIcon={<CheckCircle2 size={18} />}>
                Import to VoiceCV & Generate Documents
              </Button>
            </>
          ) : (
            <Card variant="solid" padding="lg" className="text-center py-20">
              <Linkedin size={48} className="mx-auto mb-4 text-[var(--muted)] opacity-40" />
              <p className="text-[var(--muted)]">Paste your LinkedIn profile or resume and click parse to see the extracted data.</p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
