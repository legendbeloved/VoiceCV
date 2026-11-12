import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Linkedin, ArrowRight, CheckCircle2, AlertCircle, Loader2, Briefcase, GraduationCap, Award, Info, Clipboard, ClipboardCheck, X, Edit2, Save, Eye, EyeOff } from 'lucide-react';
import { useVoiceCVStore } from '../store/useVoiceCVStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { parseLinkedInProfile, processVoiceToDocuments, LinkedInProfile, CareerAssets } from '../lib/gemini';
import { useNavigate } from 'react-router-dom';

// @ts-ignore - mammoth has no types
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    textParts.push(pageText);
  }
  
  return textParts.join('\n\n');
}

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export default function ImportPage({ onToast }: { onToast: (msg: string, v: 'success' | 'error' | 'info') => void }) {
  const { setAssets, setJobRole, setTranscript, pushVersion } = useVoiceCVStore();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [importMode, setImportMode] = useState<'linkedin' | 'resume'>('linkedin');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<LinkedInProfile | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showParsingPreview, setShowParsingPreview] = useState(false);
  const [editableProfile, setEditableProfile] = useState<LinkedInProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      try {
        onToast('Reading PDF file...', 'info');
        const text = await extractTextFromPDF(file);
        if (text.trim().length > 50) {
          setInputText(text);
          setImportMode('resume');
          onToast(`PDF "${file.name}" loaded. Click Parse to extract profile data.`, 'success');
        } else {
          onToast('Could not extract enough text from PDF. Please open the PDF, select all text, copy and paste it manually.', 'error');
          setPasteMode(true);
        }
      } catch {
        onToast('Failed to read PDF. Please open it, select all text, copy and paste manually.', 'error');
        setPasteMode(true);
      }
      return;
    }

    if (extension === 'docx' || extension === 'doc') {
      try {
        onToast('Reading Word document...', 'info');
        const text = await extractTextFromDocx(file);
        if (text.trim().length > 50) {
          setInputText(text);
          setImportMode('resume');
          onToast(`Word document "${file.name}" loaded. Click Parse to extract profile data.`, 'success');
        } else {
          onToast('Could not extract enough text from Word document. Please copy and paste the content manually.', 'error');
          setPasteMode(true);
        }
      } catch {
        onToast('Failed to read Word document. Please copy and paste the content manually.', 'error');
        setPasteMode(true);
      }
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
  }, [onToast]);

  const handleParse = async () => {
    if (!inputText.trim()) {
      onToast('Please paste your LinkedIn profile or resume text.', 'error');
      return;
    }
    setLoading(true);
    try {
      const profile = await parseLinkedInProfile(inputText);
      setParsedProfile(profile);
      setEditableProfile(profile);
      setShowParsingPreview(true);
      onToast('Profile parsed successfully. Review and edit if needed.', 'success');
    } catch (error) {
      const msg = error instanceof Error && error.message.includes('API key')
        ? 'VoiceCV AI configuration is missing. Add GEMINI_API_KEY to your .env.local file and restart the dev server.'
        : 'Failed to parse profile. Please try again.';
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = (field: keyof LinkedInProfile, value: any) => {
    if (!editableProfile) return;
    setEditableProfile({ ...editableProfile, [field]: value });
  };

  const handleSaveEdits = () => {
    if (editableProfile) {
      setParsedProfile(editableProfile);
      setShowParsingPreview(false);
      onToast('Profile updated successfully.', 'success');
    }
  };

  const handleCancelEdits = () => {
    setEditableProfile(parsedProfile);
    setShowParsingPreview(false);
  };

  const handleImportToStore = async () => {
    if (!parsedProfile) return;
    // Use editable profile if it exists and is different from parsed
    const profileToUse = editableProfile && JSON.stringify(editableProfile) !== JSON.stringify(parsedProfile) ? editableProfile : parsedProfile;

    const experienceText = profileToUse.experience
      .map((e) => `${e.title} at ${e.company} (${e.duration}): ${e.description}`)
      .join('\n');

    const educationText = profileToUse.education
      .map((e) => `${e.degree} in ${e.field} from ${e.school} (${e.year})`)
      .join('\n');

    const fullTranscript = [
      `Name: ${profileToUse.name}`,
      `Headline: ${profileToUse.headline}`,
      `\nSummary:\n${profileToUse.summary}`,
      `\nExperience:\n${experienceText}`,
      `\nEducation:\n${educationText}`,
      `\nSkills: ${profileToUse.skills.join(', ')}`,
    ].join('\n');

    const assets: CareerAssets = {
      transcript: fullTranscript,
      resume: '',
      coverLetter: '',
      linkedinBio: profileToUse.summary,
      strengths: profileToUse.skills.slice(0, 5),
      keywords: profileToUse.skills,
      resumeScore: { overall: 70, clarity: 70, atsKeywords: 65, impact: 68, completeness: 72, notes: [] },
      missingInfoPrompts: ['Add quantified achievements to each role.', 'Include specific project outcomes.'],
      name: profileToUse.name,
      role: profileToUse.headline || 'Professional',
      extracted: {
        skills: profileToUse.skills,
        experience: profileToUse.experience.map((e) => `${e.title} at ${e.company}`),
        education: profileToUse.education.map((e) => `${e.degree} from ${e.school}`),
        achievements: profileToUse.experience.flatMap((e) => e.description ? [e.description] : []),
      },
      contactInfo: { email: '', phone: '', location: '' },
    };

    setTranscript(fullTranscript);
    setJobRole(profileToUse.headline || 'Professional');
    setCreating(true);
    try {
      const documents = await processVoiceToDocuments({
        transcriptHint: fullTranscript,
        targetRole: profileToUse.headline || 'Professional',
      });
      setAssets(documents);
      pushVersion('Imported profile');
      onToast('Documents created from the imported profile.', 'success');
      navigate('/results');
    } catch (error) {
      setAssets(assets);
      onToast(error instanceof Error ? error.message : 'The profile was saved, but the documents were not written.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      try {
        onToast('Reading PDF file...', 'info');
        const text = await extractTextFromPDF(file);
        if (text.trim().length > 50) {
          setInputText(text);
          setImportMode('resume');
          onToast(`PDF "${file.name}" loaded. Click Parse to extract profile data.`, 'success');
        } else {
          onToast('Could not extract enough text from PDF. Please open the PDF, select all text, copy and paste it manually.', 'error');
          setPasteMode(true);
        }
      } catch {
        onToast('Failed to read PDF. Please open it, select all text, copy and paste manually.', 'error');
        setPasteMode(true);
      }
      return;
    }

    if (extension === 'docx' || extension === 'doc') {
      try {
        onToast('Reading Word document...', 'info');
        const text = await extractTextFromDocx(file);
        if (text.trim().length > 50) {
          setInputText(text);
          setImportMode('resume');
          onToast(`Word document "${file.name}" loaded. Click Parse to extract profile data.`, 'success');
        } else {
          onToast('Could not extract enough text from Word document. Please copy and paste the content manually.', 'error');
          setPasteMode(true);
        }
      } catch {
        onToast('Failed to read Word document. Please copy and paste the content manually.', 'error');
        setPasteMode(true);
      }
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
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-[var(--surface)] p-8 sm:p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-soft)] scale-105' : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]'}`}
                  >
                    <Upload size={40} className={`mb-4 ${isDragging ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                    <p className="text-sm font-bold text-[var(--text)]">Click to upload or drag & drop PDF, Word, or text file</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Supports .pdf, .docx, .doc, .txt, .csv</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv" onChange={handleFileUpload} className="hidden" />
                  
                  {uploadedFileName && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent)]/20">
                      <Info size={16} className="text-[var(--accent)]" />
                      <p className="text-xs text-[var(--accent)]">Loaded: {uploadedFileName}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-[var(--border)]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">or paste manually</span>
                    <div className="h-px flex-1 bg-[var(--border)]" />
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowParsingPreview(!showParsingPreview)}
                      leftIcon={showParsingPreview ? <EyeOff size={16} /> : <Edit2 size={16} />}
                    >
                      {showParsingPreview ? 'View' : 'Edit'}
                    </Button>
                    <CheckCircle2 size={20} className="text-green-400" />
                  </div>
                </div>
                
                {showParsingPreview && editableProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Name</label>
                      <input
                        type="text"
                        value={editableProfile.name}
                        onChange={(e) => handleEditProfile('name', e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Headline</label>
                      <input
                        type="text"
                        value={editableProfile.headline}
                        onChange={(e) => handleEditProfile('headline', e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Summary</label>
                      <textarea
                        value={editableProfile.summary}
                        onChange={(e) => handleEditProfile('summary', e.target.value)}
                        className="mt-1 min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] resize-y"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdits} size="sm" leftIcon={<Save size={16} />}>Save Changes</Button>
                      <Button variant="ghost" onClick={handleCancelEdits} size="sm" leftIcon={<X size={16} />}>Cancel</Button>
                    </div>
                  </div>
                ) : (
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
                )}
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

              <Button onClick={() => void handleImportToStore()} loading={creating} className="w-full" size="lg" leftIcon={<CheckCircle2 size={18} />}>
                Create documents from this profile
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
