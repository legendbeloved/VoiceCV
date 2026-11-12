import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

export type ResumeThemeId = 'voyager' | 'minimalist' | 'neon' | 'executive';

const palettes: Record<ResumeThemeId, { accent: [number, number, number]; body: [number, number, number]; paper: [number, number, number]; hex: string }> = {
  voyager: { accent: [30, 79, 199], body: [23, 32, 51], paper: [244, 247, 255], hex: '1E4FC7' },
  minimalist: { accent: [17, 17, 17], body: [17, 17, 17], paper: [255, 255, 255], hex: '111111' },
  neon: { accent: [94, 234, 212], body: [215, 255, 248], paper: [7, 16, 24], hex: '5EEAD4' },
  executive: { accent: [154, 52, 18], body: [30, 41, 59], paper: [251, 247, 240], hex: '9A3412' },
};

function themeId(): ResumeThemeId {
  const stored = window.localStorage.getItem('voicecv-resume-theme');
  if (stored === 'minimalist' || stored === 'neon' || stored === 'executive' || stored === 'voyager') return stored;
  return 'voyager';
}

function safeName(name: string) {
  return name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'Resume';
}

export function downloadThemedResumePdf(resume: string, candidateName: string, role: string, layout: 'one' | 'two') {
  const palette = palettes[themeId()];
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const fontSize = layout === 'one' ? 9 : 11;
  const lineHeight = layout === 'one' ? 4.4 : 5.4;
  let y = 22;

  const paintPage = () => {
    doc.setFillColor(...palette.paper);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };
  paintPage();
  doc.setFont('times', 'bold');
  doc.setFontSize(layout === 'one' ? 16 : 20);
  doc.setTextColor(...palette.accent);
  doc.text(candidateName, margin, y);
  y += 7;
  doc.setFont('times', 'italic');
  doc.setFontSize(fontSize);
  doc.text(role, margin, y);
  y += 8;

  const maxPages = layout === 'one' ? 1 : 2;
  const lines = doc.splitTextToSize(resume.replace(/\*\*/g, ''), pageWidth - margin * 2) as string[];
  doc.setFont('times', 'normal');
  doc.setTextColor(...palette.body);
  for (const line of lines) {
    if (y > pageHeight - 16) {
      if (doc.getNumberOfPages() >= maxPages) break;
      doc.addPage();
      paintPage();
      y = 18;
      doc.setFont('times', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(...palette.body);
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }
  doc.save(`${safeName(candidateName)}-${layout === 'one' ? 'One-Page' : 'Two-Page'}-Resume.pdf`);
}

export async function downloadThemedResumeDocx(resume: string, candidateName: string, role: string) {
  const palette = palettes[themeId()];
  const paragraphs = [
    new Paragraph({ children: [new TextRun({ text: candidateName, bold: true, size: 36, color: palette.hex, font: 'Georgia' })] }),
    new Paragraph({ children: [new TextRun({ text: role, italics: true, size: 22, color: palette.hex, font: 'Georgia' })] }),
    new Paragraph({ text: '' }),
    ...resume.split('\n').map((line) => new Paragraph({
      children: [new TextRun({ text: line.replace(/\*\*/g, '').replace(/^#+\s*/, ''), size: 21, font: 'Georgia' })],
    })),
  ];
  const document = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(document);
  saveAs(blob, `${safeName(candidateName)}-Themed-Resume.docx`);
}
