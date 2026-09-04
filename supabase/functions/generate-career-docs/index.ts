import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { GoogleGenAI, createPartFromBase64 } from "@google/genai";
import type { Context } from "hono";

const app = new Hono();

interface GenerateInput {
  transcription: string;
  targetRole?: string;
  jobDescription?: string;
  tone?: "professional" | "warm" | "executive" | "confident" | "creative";
  resumeTemplate?: "ats" | "modern" | "executive" | "creative";
}

// GET: Health check
app.get("/", (c) => c.json({ status: "ok", message: "VoiceCV API is running" }));

// POST: Generate career documents from transcription
app.post("/generate", async (c: Context) => {
  try {
    const body = await c.req.json<GenerateInput>();
    const { transcription, targetRole, jobDescription, tone, resumeTemplate } = body;

    if (!transcription?.trim()) {
      return c.json({ error: "Transcription is required" }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "Server Gemini API key is missing" }, 500);
    }

    const ai = new GoogleGenAI({ apiKey });
    const MODEL_NAME = "gemini-3-flash-preview";

    // Tone labels
    const toneLabels: Record<string, string> = {
      professional: "professional, clear, and recruiter-friendly",
      warm: "warm, approachable, and human",
      executive: "executive, concise, and strategic",
      confident: "confident, energetic, and achievement-led",
      creative: "creative, polished, and memorable without becoming gimmicky",
    };

    // Template labels
    const templateLabels: Record<string, string> = {
      ats: "Classic ATS: simple headings, reverse-chronological sections, keyword-friendly bullets",
      modern: "Modern Compact: concise summary, skills near the top, tight readable bullets",
      executive: "Executive Summary: leadership profile, strategic achievements, business impact first",
      creative: "Creative Narrative: strong positioning statement, human voice, but still ATS-readable",
    };

    const promptContext = `
TARGET ROLE OR KEYWORDS: ${targetRole || "Not provided; infer the strongest positioning."}
JOB DESCRIPTION TO TAILOR AGAINST: ${jobDescription || "Not provided."}
TONE: ${toneLabels[tone] || toneLabels.professional}
RESUME TEMPLATE: ${templateLabels[resumeTemplate] || templateLabels.ats}
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

    const voiccvPrompt = `
You are an expert career strategist and executive resume writer.
Process the following cleaned transcription from a 60-second candidate voice summary.

${promptContext}

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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: voiccvPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      return c.json({ error: "AI returned no response" }, 500);
    }

    // Parse the JSON response
    const parsed = JSON.parse(response.text);

    return c.json({
      success: true,
      data: {
        transcript: (parsed as any).transcript || "",
        resume: (parsed as any).resume || "",
        coverLetter: (parsed as any).coverLetter || "",
        linkedinBio: (parsed as any).linkedinBio || "",
        strengths: (parsed as any).strengths || [],
        keywords: (parsed as any).keywords || [],
        name: (parsed as any).name || "Candidate",
        role: (parsed as any).role || "Professional Candidate",
        resumeScore: (parsed as any).resumeScore || {
          overall: 72, clarity: 72, atsKeywords: 70, impact: 68, completeness: 66, notes: []
        },
        missingInfoPrompts: (parsed as any).missingInfoPrompts || [],
      },
    });

  } catch (error: any) {
    console.error("Gemini generation error:", error);
    return c.json({
      error: error instanceof Error ? error.message : "Internal server error",
    }, 500);
  }
});

// POST: Refine a specific document
app.post("/refine", async (c: Context) => {
  try {
    const body = await c.req.body.json();
    const { documentType, content, action, tone }: { documentType: string; content: string; action: string; tone?: string } = body;

    if (!content?.trim()) {
      return c.json({ error: "Content is required" }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "Server Gemini API key is missing" }, 500);
    }

    const ai = new GoogleGenAI({ apiKey });

    const actionInstructions: Record<string, string> = {
      stronger: "Make the content more achievement-led, concrete, and persuasive. Add stronger verbs and clearer impact while staying truthful.",
      shorter: "Shorten the content while preserving the most important facts and keywords.",
      "more-human": "Make the content sound more natural, warm, and human without becoming casual.",
      "more-formal": "Make the content more formal, polished, and executive-ready.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
You are improving one VoiceCV document.

Document type: ${documentType}
Action: ${actionInstructions[action as keyof typeof actionInstructions] || actionInstructions.stronger}

Current content:
${content}

Return ONLY the revised markdown content. Do not wrap it in JSON or code fences.
`,
    });

    return c.json({
      success: true,
      revisedContent: response.text || content,
    });

  } catch (error: any) {
    return c.json({ error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});

serve(app);