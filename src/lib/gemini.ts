import { GoogleGenAI, createPartFromBase64 } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_NAME = "gemini-3-flash-preview";

export type ToneStyle = 'professional' | 'warm' | 'executive' | 'confident' | 'creative';
export type ResumeTemplate = 'ats' | 'modern' | 'executive' | 'creative';
export type RewriteAction = 'stronger' | 'shorter' | 'more-human' | 'more-formal';
export type DocumentType = 'resume' | 'coverLetter' | 'linkedinBio';

interface PromptOptions {
  targetRole?: string;
  jobDescription?: string;
  tone?: ToneStyle;
  resumeTemplate?: ResumeTemplate;
}

const toneLabels: Record<ToneStyle, string> = {
  professional: 'professional, clear, and recruiter-friendly',
  warm: 'warm, approachable, and human',
  executive: 'executive, concise, and strategic',
  confident: 'confident, energetic, and achievement-led',
  creative: 'creative, polished, and memorable without becoming gimmicky',
};

const templateLabels: Record<ResumeTemplate, string> = {
  ats: 'Classic ATS: simple headings, reverse-chronological sections, keyword-friendly bullets',
  modern: 'Modern Compact: concise summary, skills near the top, tight readable bullets',
  executive: 'Executive Summary: leadership profile, strategic achievements, business impact first',
  creative: 'Creative Narrative: strong positioning statement, human voice, but still ATS-readable',
};

const promptContext = ({ targetRole, jobDescription, tone = 'professional', resumeTemplate = 'ats' }: PromptOptions) => `
TARGET ROLE OR KEYWORDS: ${targetRole || 'Not provided; infer the strongest positioning.'}
JOB DESCRIPTION TO TAILOR AGAINST: ${jobDescription || 'Not provided.'}
TONE: ${toneLabels[tone]}
RESUME TEMPLATE: ${templateLabels[resumeTemplate]}
`;

const jsonContract = `
Return ONLY valid JSON. Escape line breaks as \\n.

The JSON structure:
- transcript: string
- resume: string
- coverLetter: string
- linkedinBio: string
- strengths: string[]
- keywords: string[]
- name: string
- role: string
- extracted: { skills: string[], experience: string[], education: string[], achievements: string[] }
- contactInfo: { email: string, phone: string, location: string }
- resumeScore: { overall: number, clarity: number, atsKeywords: number, impact: number, completeness: number, notes: string[] }
- missingInfoPrompts: string[]
`;

export const VOICECV_PROMPT = (transcription: string, options: PromptOptions = {}) => `
You are an expert career strategist and executive resume writer.
Process the following cleaned transcription from a 60-second candidate voice summary.

${promptContext(options)}
TRANSCRIPTION: "${transcription}"

Your task:
1. Analyze the transcript, target role, job description, selected tone, and selected resume template.
2. Determine the strongest professional title for the candidate.
3. Extract professional details and generate high-impact career assets.
4. Score the resume from 0-100 for clarity, ATS keywords, impact, and completeness.
5. Add 3-5 beginner-friendly missing-info prompts only for details that would materially improve the documents.

Rules:
- Keep everything truthful to the candidate's story.
- If a job description is provided, mirror its relevant keywords naturally.
- Resume must be ATS-friendly markdown with clear sections and achievement-oriented bullets.
- Cover letter must be personalized but company-agnostic unless a company is explicitly present in the job description.
- LinkedIn bio must be first person and 180 words max.
- If a fact is not present, use tasteful placeholders instead of inventing specifics.
${jsonContract}
`;

export const VOICECV_AUDIO_PROMPT = (options: PromptOptions = {}, transcriptHint?: string) => `
You are VoiceCV's transcription and career-document engine.
Listen to the attached candidate audio, cleanly transcribe it, extract career facts, and generate ready-to-use job-search documents.

${promptContext(options)}
${transcriptHint ? `BROWSER LIVE TRANSCRIPT HINT, USE ONLY IF IT MATCHES THE AUDIO: "${transcriptHint}"` : ""}

Rules:
- Keep everything beginner-friendly, practical, and truthful to the candidate's story.
- If a job description is provided, tailor keywords and positioning to it without stuffing.
- Apply the selected tone and resume template.
- Resume must be ATS-friendly markdown with clear sections and achievement-oriented bullets.
- Cover letter must be role-agnostic but personalized, without inventing a company name.
- LinkedIn bio must be first person and 180 words max.
- If a fact is not present, use tasteful placeholders instead of inventing specifics.
- Score the resume and add missing-info prompts.
${jsonContract}
`;

export interface ResumeScore {
  overall: number;
  clarity: number;
  atsKeywords: number;
  impact: number;
  completeness: number;
  notes: string[];
}

export interface CareerAssets {
  transcript: string;
  resume: string;
  coverLetter: string;
  linkedinBio: string;
  interviewPrep?: string;
  strengths: string[];
  keywords: string[];
  resumeScore: ResumeScore;
  missingInfoPrompts: string[];
  name: string;
  role: string;
  extracted: {
    skills: string[];
    experience: string[];
    education: string[];
    achievements: string[];
  };
  contactInfo: {
    email: string;
    phone: string;
    location: string;
  };
}

interface ProcessVoiceInput {
  audioBlob?: Blob | null;
  transcriptHint?: string;
  targetRole?: string;
  jobDescription?: string;
  tone?: ToneStyle;
  resumeTemplate?: ResumeTemplate;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read audio data.'));
        return;
      }
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read audio data.'));
    reader.readAsDataURL(blob);
  });
}

function normalizeAssets(parsed: Partial<CareerAssets>, transcriptFallback = ''): CareerAssets {
  const score: Partial<ResumeScore> = parsed.resumeScore || {};

  return {
    transcript: parsed.transcript || transcriptFallback,
    resume: parsed.resume || '',
    coverLetter: parsed.coverLetter || '',
    linkedinBio: parsed.linkedinBio || '',
    interviewPrep: parsed.interviewPrep,
    strengths: parsed.strengths || [],
    keywords: parsed.keywords || [],
    resumeScore: {
      overall: clampScore(score.overall, 72),
      clarity: clampScore(score.clarity, 72),
      atsKeywords: clampScore(score.atsKeywords, 70),
      impact: clampScore(score.impact, 68),
      completeness: clampScore(score.completeness, 66),
      notes: score.notes || [],
    },
    missingInfoPrompts: parsed.missingInfoPrompts || [],
    name: parsed.name || 'Candidate',
    role: parsed.role || 'Professional Candidate',
    extracted: {
      skills: parsed.extracted?.skills || [],
      experience: parsed.extracted?.experience || [],
      education: parsed.extracted?.education || [],
      achievements: parsed.extracted?.achievements || [],
    },
    contactInfo: {
      email: parsed.contactInfo?.email || 'email@example.com',
      phone: parsed.contactInfo?.phone || 'Phone not provided',
      location: parsed.contactInfo?.location || 'Location not provided',
    },
  };
}

function clampScore(value: unknown, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function parseJsonResponse(text: string): Partial<CareerAssets> {
  const stripped = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new SyntaxError('Gemini did not return JSON.');
    return JSON.parse(jsonMatch[0]);
  }
}

export async function processVoiceToDocuments(input: ProcessVoiceInput | string, targetRole?: string): Promise<CareerAssets> {
  if (!ai) {
    throw new Error("Gemini API key not found");
  }

  const normalizedInput: ProcessVoiceInput = typeof input === 'string'
    ? { transcriptHint: input, targetRole }
    : input;

  const transcriptHint = normalizedInput.transcriptHint?.trim() || '';
  const promptOptions: PromptOptions = {
    targetRole: normalizedInput.targetRole,
    jobDescription: normalizedInput.jobDescription,
    tone: normalizedInput.tone,
    resumeTemplate: normalizedInput.resumeTemplate,
  };
  
  try {
    const contents = normalizedInput.audioBlob
      ? [
          { text: VOICECV_AUDIO_PROMPT(promptOptions, transcriptHint) },
          createPartFromBase64(
            await blobToBase64(normalizedInput.audioBlob),
            normalizedInput.audioBlob.type || 'audio/webm',
          ),
        ]
      : VOICECV_PROMPT(transcriptHint, promptOptions);

    const response = await ai.models.generateContent({ 
      model: MODEL_NAME,
      contents,
      config: {
        responseMimeType: "application/json",
      }
    });

    return normalizeAssets(parseJsonResponse(response.text || ''), transcriptHint);
  } catch (error) {
    console.error('Gemini processing failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export async function refineCareerDocument({
  documentType,
  content,
  action,
  assets,
  tone = 'professional',
}: {
  documentType: DocumentType;
  content: string;
  action: RewriteAction;
  assets: CareerAssets;
  tone?: ToneStyle;
}): Promise<string> {
  if (!ai) {
    throw new Error("Gemini API key not found");
  }

  const actionInstructions: Record<RewriteAction, string> = {
    stronger: 'Make the content more achievement-led, concrete, and persuasive. Add stronger verbs and clearer impact while staying truthful.',
    shorter: 'Shorten the content while preserving the most important facts and keywords.',
    'more-human': 'Make the content sound more natural, warm, and human without becoming casual.',
    'more-formal': 'Make the content more formal, polished, and executive-ready.',
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `
You are improving one VoiceCV document.

Document type: ${documentType}
Candidate name: ${assets.name}
Role: ${assets.role}
Tone target: ${toneLabels[tone]}
Action: ${actionInstructions[action]}

Current content:
${content}

Return ONLY the revised markdown content. Do not wrap it in JSON or code fences.
`,
  });

  return (response.text || content).trim();
}

export interface ATSAnalysis {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestedRewrites: Array<{ bullet: string; suggestion: string }>;
  overallNotes: string[];
}

export async function analyzeATSMatch(resume: string, jobDescription: string): Promise<ATSAnalysis> {
  if (!ai) throw new Error("Gemini API key not found");

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are an ATS (Applicant Tracking System) expert. Analyze the resume against the job description and return a JSON analysis.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON with this structure:
{
  "matchScore": number (0-100),
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestedRewrites": [{ "bullet": "original text", "suggestion": "improved version with keyword" }],
  "overallNotes": ["note1", "note2"]
}`,
    config: { responseMimeType: "application/json" },
  });

  const parsed = parseJsonResponse(response.text || '{}') as any;
  return {
    matchScore: clampScore(parsed.matchScore, 50),
    matchedKeywords: parsed.matchedKeywords || [],
    missingKeywords: parsed.missingKeywords || [],
    suggestedRewrites: parsed.suggestedRewrites || [],
    overallNotes: parsed.overallNotes || [],
  };
}

export async function personalizeCoverLetter({
  resume,
  jobDescription,
  companyName,
  tone = 'professional',
}: {
  resume: string;
  jobDescription: string;
  companyName?: string;
  tone?: ToneStyle;
}): Promise<string> {
  if (!ai) throw new Error("Gemini API key not found");

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are an expert cover letter writer. Write a personalized cover letter based on the resume and job description.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

${companyName ? `COMPANY: ${companyName}` : ''}

TONE: ${toneLabels[tone]}

Rules:
- Research the company context from the job description
- Mention specific details about the company's mission, products, or culture
- Tailor each paragraph to the specific role requirements
- Include a compelling opening and strong closing
- Keep it under 400 words
- Return ONLY the cover letter text in markdown format`,
  });

  return (response.text || '').trim();
}

export interface LinkedInProfile {
  name: string;
  headline: string;
  summary: string;
  experience: Array<{ title: string; company: string; duration: string; description: string }>;
  education: Array<{ school: string; degree: string; field: string; year: string }>;
  skills: string[];
}

export async function parseLinkedInProfile(profileText: string): Promise<LinkedInProfile> {
  if (!ai) throw new Error("Gemini API key not found");

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are a career data parser. Extract structured information from this LinkedIn profile text or resume.

INPUT:
${profileText}

Return ONLY valid JSON with this structure:
{
  "name": "Full Name",
  "headline": "Professional Headline",
  "summary": "Professional summary",
  "experience": [{ "title": "Job Title", "company": "Company Name", "duration": "Duration", "description": "Key achievements" }],
  "education": [{ "school": "School Name", "degree": "Degree", "field": "Field of Study", "year": "Graduation Year" }],
  "skills": ["Skill 1", "Skill 2"]
}`,
    config: { responseMimeType: "application/json" },
  });

  const parsed = parseJsonResponse(response.text || '{}') as any;
  return {
    name: parsed.name || 'Candidate',
    headline: parsed.headline || '',
    summary: parsed.summary || '',
    experience: parsed.experience || [],
    education: parsed.education || [],
    skills: parsed.skills || [],
  };
}

export interface CareerPathSuggestion {
  currentRole: string;
  suggestedRoles: Array<{
    title: string;
    matchScore: number;
    skillsRequired: string[];
    skillsGap: string[];
    recommendedCourses: Array<{ name: string; provider: string; url?: string }>;
    timeline: string;
  }>;
  overallAdvice: string;
}

export async function suggestCareerPath(assets: CareerAssets): Promise<CareerPathSuggestion> {
  if (!ai) throw new Error("Gemini API key not found");

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are a career strategist. Based on the candidate's profile, suggest career progression paths.

CANDIDATE PROFILE:
Name: ${assets.name}
Current Role: ${assets.role}
Skills: ${assets.extracted.skills.join(', ')}
Experience: ${assets.extracted.experience.join('; ')}
Education: ${assets.extracted.education.join('; ')}
Strengths: ${assets.strengths.join(', ')}

Return ONLY valid JSON with this structure:
{
  "currentRole": "${assets.role}",
  "suggestedRoles": [{
    "title": "Suggested Role Title",
    "matchScore": number (0-100),
    "skillsRequired": ["skill1", "skill2"],
    "skillsGap": ["gap1", "gap2"],
    "recommendedCourses": [{ "name": "Course Name", "provider": "Platform", "url": "optional url" }],
    "timeline": "6-12 months"
  }],
  "overallAdvice": "Strategic career advice for this candidate"
}`,
    config: { responseMimeType: "application/json" },
  });

  const parsed = parseJsonResponse(response.text || '{}') as any;
  return {
    currentRole: parsed.currentRole || assets.role,
    suggestedRoles: parsed.suggestedRoles || [],
    overallAdvice: parsed.overallAdvice || '',
  };
}
