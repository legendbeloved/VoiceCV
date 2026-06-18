import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export async function generateResumeDOCX(resumeText: string, candidateName: string): Promise<void> {
  const lines = resumeText.split('\n');
  const children = lines.map(line => {
    const trimmed = line.trim();
    const isHeader = (trimmed === trimmed.toUpperCase() && trimmed.length > 3) || trimmed.startsWith('#');
    const cleanLine = trimmed.replace(/^#+\s*/, '');

    if (isHeader) {
      return new Paragraph({
        text: cleanLine,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 }
      });
    }
    
    return new Paragraph({
      children: [new TextRun(trimmed)],
      spacing: { after: 120 }
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: candidateName,
          heading: HeadingLevel.TITLE,
        }),
        ...children
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${candidateName.replace(/\s+/g, '_')}_Resume.docx`);
}

export function generateResumePDF(resumeText: string, candidateName: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = margin;

  // Header: Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(26, 26, 46);
  doc.text(candidateName, margin, cursorY);
  cursorY += 8;

  // Horizontal Rule
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 10;

  // Split content by sections (Assuming headers are roughly like "EXPERIENCE", "SKILLS", "EDUCATION")
  // For a robust implementation, we split by lines and look for all-caps or markdown headers
  const lines = resumeText.split('\n');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      cursorY += 2;
      return;
    }

    // Check if it's a header (all caps or starting with ##)
    const isHeader = trimmed === trimmed.toUpperCase() && trimmed.length > 3 || trimmed.startsWith('#');
    const cleanLine = trimmed.replace(/^#+\s*/, '');

    if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(124, 58, 237);
      
      if (cursorY + 10 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        cursorY = margin;
      }
      
      cursorY += 5;
      doc.text(cleanLine, margin, cursorY);
      cursorY += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
    } else {
      const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-');
      let textToPrint = cleanLine;
      let xPos = margin;

      if (isBullet) {
        textToPrint = '- ' + trimmed.substring(1).trim();
        xPos = margin + 5;
      }

      const splitText = doc.splitTextToSize(textToPrint, isBullet ? contentWidth - 5 : contentWidth);
      
      splitText.forEach((t: string) => {
        if (cursorY + 5 > doc.internal.pageSize.getHeight() - margin) {
          addFooter(doc);
          doc.addPage();
          cursorY = margin;
        }
        doc.text(t, xPos, cursorY);
        cursorY += 5;
      });
    }
  });

  addFooter(doc);
  doc.save(`${candidateName.replace(/\s+/g, '_')}_Resume.pdf`);
}

export function generateCoverLetterPDF(coverLetterText: string, candidateName: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = margin;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(candidateName, margin, cursorY);
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(date, pageWidth - margin - doc.getTextWidth(date), cursorY);
  
  cursorY += 20;
  
  // Content
  const splitText = doc.splitTextToSize(coverLetterText, contentWidth);
  doc.text(splitText, margin, cursorY);

  addFooter(doc);
  doc.save(`${candidateName.replace(/\s+/g, '_')}_CoverLetter.pdf`);
}

export function generateLinkedInBioPDF(bioText: string, candidateName: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LinkedIn About Section', margin, cursorY);
  cursorY += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`For ${candidateName}`, margin, cursorY);
  cursorY += 15;

  doc.setTextColor(40, 40, 40);
  const splitText = doc.splitTextToSize(bioText, contentWidth);
  doc.text(splitText, margin, cursorY);
  
  cursorY += (splitText.length * 5) + 10;
  doc.setFontSize(8);
  doc.text(`Character count: ${bioText.length}`, margin, cursorY);

  addFooter(doc);
  doc.save(`${candidateName.replace(/\s+/g, '_')}_LinkedInBio.pdf`);
}

export function generateInterviewPrepPDF(prepText: string, candidateName: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(124, 58, 237);
  doc.text('Interview Preparation Guide', margin, cursorY);
  cursorY += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Strategic guide for ${candidateName}`, margin, cursorY);
  cursorY += 15;

  doc.setTextColor(40, 40, 40);
  const splitText = doc.splitTextToSize(prepText, contentWidth);
  
  splitText.forEach((line: string) => {
    if (cursorY + 5 > doc.internal.pageSize.getHeight() - margin) {
      addFooter(doc);
      doc.addPage();
      cursorY = margin;
    }
    doc.text(line, margin, cursorY);
    cursorY += 5;
  });

  addFooter(doc);
  doc.save(`${candidateName.replace(/\s+/g, '_')}_Interview_Prep.pdf`);
}

export function downloadAsText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const footerText = 'Generated by VoiceCV - voicecv.app';
    const x = doc.internal.pageSize.getWidth() / 2 - doc.getTextWidth(footerText) / 2;
    doc.text(footerText, x, doc.internal.pageSize.getHeight() - 10);
  }
}
