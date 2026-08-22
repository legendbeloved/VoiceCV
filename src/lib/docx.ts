import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  LevelSuffix,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import type { CareerAssets } from './gemini';
import type { IRunOptions } from 'docx';

type DocumentKind = 'resume' | 'coverLetter' | 'linkedinBio' | 'interviewPrep';

const ACCENT = '7C3AED';
const ACCENT_LIGHT = 'A78BFA';
const BODY = '1E1E30';
const MUTED = '64748B';
const SOFT_BG = 'F5F2FF';
const BORDER = 'E2E8F0';
const BULLET_REFERENCE = 'voicecv-bullets';

const docTitles: Record<DocumentKind, string> = {
  resume: 'Resume',
  coverLetter: 'Cover Letter',
  linkedinBio: 'LinkedIn Bio',
  interviewPrep: 'Interview Prep',
};

function safeName(name: string): string {
  return name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^[-*]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .trim();
}

function isPlaceholderValue(value?: string): boolean {
  const lower = (value || '').toLowerCase().trim();
  return (
    !lower ||
    lower === 'email@example.com' ||
    lower.includes('not provided') ||
    lower.includes('not specified') ||
    lower === 'n/a'
  );
}

function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3) return false;
  if (trimmed.startsWith('#')) return true;
  const alpha = trimmed.replace(/[^a-zA-Z]/g, '');
  return alpha.length >= 3 && alpha === alpha.toUpperCase();
}

function cleanHeader(line: string): string {
  return stripMarkdown(line).replace(/:$/, '');
}

function isBullet(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed);
}

function cleanBullet(line: string): string {
  return line.trim().replace(/^[*\-]\s*/, '').replace(/^\d+\.\s*/, '');
}

function textRun(text: string, options: Partial<IRunOptions> = {}): TextRun {
  return new TextRun({
    text,
    font: 'Aptos',
    size: 21,
    color: BODY,
    ...options,
  });
}

function parseInlineMarkdown(line: string, base: Partial<IRunOptions> = {}): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      runs.push(textRun(line.slice(lastIndex, match.index), base));
    }

    if (match[1]) {
      runs.push(textRun(match[2], { ...base, bold: true }));
    } else if (match[3]) {
      runs.push(textRun(match[4], { ...base, italics: true }));
    } else if (match[5]) {
      runs.push(textRun(match[6], {
        ...base,
        font: 'Aptos Mono',
        size: 19,
        color: MUTED,
        shading: { fill: 'F1F5F9' },
      }));
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    runs.push(textRun(line.slice(lastIndex), base));
  }

  return runs.length ? runs : [textRun(line, base)];
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 90 },
    border: {
      bottom: {
        color: ACCENT_LIGHT,
        space: 4,
        style: BorderStyle.SINGLE,
        size: 4,
      },
    },
    children: [
      textRun(text.toUpperCase(), {
        bold: true,
        color: ACCENT,
        size: 22,
        allCaps: true,
      }),
    ],
  });
}

function bodyParagraph(line: string): Paragraph {
  return new Paragraph({
    spacing: { after: 90, line: 300 },
    children: parseInlineMarkdown(line),
  });
}

function bulletParagraph(line: string): Paragraph {
  return new Paragraph({
    numbering: { reference: BULLET_REFERENCE, level: 0 },
    spacing: { after: 70, line: 285 },
    indent: { left: convertInchesToTwip(0.32), hanging: convertInchesToTwip(0.18) },
    children: parseInlineMarkdown(cleanBullet(line)),
  });
}

function contactParagraph(assets?: CareerAssets): Paragraph | null {
  const info = assets?.contactInfo;
  if (!info) return null;

  const parts = [info.email, info.phone, info.location].filter((part) => !isPlaceholderValue(part));
  if (!parts.length) return null;

  return new Paragraph({
    spacing: { after: 120 },
    children: [textRun(parts.join(' | '), { color: MUTED, size: 19 })],
  });
}

function skillsBand(assets?: CareerAssets): Paragraph | null {
  const skills = assets?.extracted?.skills?.length ? assets.extracted.skills : assets?.keywords || [];
  if (!skills.length) return null;

  return new Paragraph({
    spacing: { before: 80, after: 180 },
    shading: { fill: SOFT_BG },
    border: {
      top: { color: BORDER, style: BorderStyle.SINGLE, size: 2 },
      bottom: { color: BORDER, style: BorderStyle.SINGLE, size: 2 },
      left: { color: SOFT_BG, style: BorderStyle.SINGLE, size: 8 },
    },
    children: [
      textRun('KEY SKILLS  ', { bold: true, color: ACCENT, size: 17 }),
      textRun(skills.slice(0, 14).join(' | '), { size: 18 }),
    ],
  });
}

function parseStructuredContent(content: string, options: { skipFirstLine?: boolean } = {}): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = content.split('\n');

  lines.forEach((rawLine, index) => {
    if (options.skipFirstLine && index === 0) return;

    const trimmed = rawLine.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 90 } }));
      return;
    }

    if (isSectionHeader(trimmed)) {
      paragraphs.push(sectionHeading(cleanHeader(trimmed)));
      return;
    }

    if (isBullet(trimmed)) {
      paragraphs.push(bulletParagraph(trimmed));
      return;
    }

    paragraphs.push(bodyParagraph(trimmed));
  });

  return paragraphs;
}

function buildOpening(kind: DocumentKind, content: string, candidateName: string, assets?: CareerAssets): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      spacing: { after: 60 },
      children: [
        textRun(candidateName, {
          bold: true,
          size: kind === 'resume' ? 38 : 30,
          color: BODY,
        }),
      ],
    }),
  ];

  if (kind === 'resume' && assets?.role) {
    paragraphs.push(new Paragraph({
      spacing: { after: 90 },
      children: [textRun(assets.role, { color: ACCENT, size: 23 })],
    }));
  }

  const contact = contactParagraph(assets);
  if (contact) paragraphs.push(contact);

  if (kind !== 'resume') {
    paragraphs.unshift(new Paragraph({
      spacing: { after: 120 },
      border: {
        bottom: { color: ACCENT_LIGHT, style: BorderStyle.SINGLE, size: 6, space: 6 },
      },
      children: [textRun(docTitles[kind], { bold: true, color: ACCENT, size: 34 })],
    }));
  }

  if (kind === 'resume') {
    const skills = skillsBand(assets);
    if (skills) paragraphs.push(skills);
  }

  if (kind === 'coverLetter') {
    const firstLine = content.split('\n')[0]?.trim() || '';
    if (/^(dear|to|hello)\b/i.test(firstLine)) {
      paragraphs.push(bodyParagraph(firstLine));
    } else {
      paragraphs.push(bodyParagraph('Dear Hiring Manager,'));
    }
  }

  if (kind === 'linkedinBio') {
    paragraphs.push(new Paragraph({
      spacing: { before: 40, after: 120 },
      children: [textRun('Copy-ready LinkedIn About section.', { italics: true, color: MUTED, size: 18 })],
    }));
  }

  return paragraphs;
}

function footerParagraph(candidateName: string, kind: DocumentKind, content?: string): Paragraph {
  const details = kind === 'linkedinBio'
    ? ` | ${stripMarkdown(content || '').length.toLocaleString()} characters`
    : '';

  return new Paragraph({
    spacing: { before: 220 },
    alignment: AlignmentType.RIGHT,
    border: {
      top: { color: BORDER, style: BorderStyle.SINGLE, size: 2, space: 8 },
    },
    children: [textRun(`Generated by VoiceCV for ${candidateName}${details}`, { color: MUTED, size: 16 })],
  });
}

export async function generateCareerDocx(
  kind: DocumentKind,
  content: string,
  candidateName: string,
  assets?: CareerAssets,
): Promise<void> {
  const skipFirstLine = kind === 'coverLetter' && /^(dear|to|hello)\b/i.test(content.split('\n')[0]?.trim() || '');
  const children = [
    ...buildOpening(kind, content, candidateName, assets),
    ...parseStructuredContent(content, { skipFirstLine }),
    footerParagraph(candidateName, kind, content),
  ];

  const doc = new Document({
    title: `${candidateName} - ${docTitles[kind]}`,
    subject: `VoiceCV ${docTitles[kind]}`,
    creator: 'VoiceCV',
    keywords: `VoiceCV, ${docTitles[kind]}, career, resume`,
    styles: {
      default: {
        document: {
          run: { font: 'Aptos', size: 21, color: BODY },
          paragraph: { spacing: { line: 300, after: 80 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: BULLET_REFERENCE,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '\u2022',
              suffix: LevelSuffix.TAB,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.32), hanging: convertInchesToTwip(0.18) },
                },
                run: { color: ACCENT, size: 20 },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.65),
              right: convertInchesToTwip(0.7),
              bottom: convertInchesToTwip(0.65),
              left: convertInchesToTwip(0.7),
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${safeName(candidateName)}-${docTitles[kind].replace(/\s+/g, '')}.docx`);
}
