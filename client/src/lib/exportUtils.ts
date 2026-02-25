import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';
import { exportProfessionalPPT } from './exportProfessionalPPT';
import { exportProfessionalPDF } from './exportProfessionalPDF';
import { exportProfessionalWord } from './exportProfessionalWord';

interface DonorContent {
  summary?: string;
  impact?: string;
  shortTermResults?: string[];
  longTermResults?: string[];
  budget?: string;
  budgetBreakdown?: { category: string; percentage: number }[];
  totalBudget?: string;
  partnerships?: string;
  partnershipBenefits?: string[];
  timelinePhases?: { phase: string; duration: string; activities: string }[];
  stats?: {
    objectives?: number;
    beneficiaries?: string;
    budget?: string;
    duration?: string;
  };
}

interface IdeaData {
  programDescription?: string;
  generalObjective?: string;
  targetAudience?: string;
  vision?: string;
}

interface OrganizationInfo {
  logo?: string | null;
  name?: string | null;
}

type TemplateId = 'classic' | 'modern' | 'formal' | 'creative';

interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  headerBg: string;
  headerText: string;
}

const templateColors: Record<TemplateId, TemplateColors> = {
  classic: {
    primary: '#1a365d',
    secondary: '#2d4a6f',
    accent: '#d4af37',
    headerBg: '#1a365d',
    headerText: '#ffffff',
  },
  modern: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    headerBg: '#4f46e5',
    headerText: '#ffffff',
  },
  formal: {
    primary: '#064e3b',
    secondary: '#047857',
    accent: '#ca8a04',
    headerBg: '#064e3b',
    headerText: '#ffffff',
  },
  creative: {
    primary: '#db2777',
    secondary: '#f97316',
    accent: '#0ea5e9',
    headerBg: '#db2777',
    headerText: '#ffffff',
  },
};

interface ExportOptions {
  approvedSections: Set<string>;
  marketingContent: DonorContent;
  ideaData: IdeaData;
  organizationInfo?: OrganizationInfo;
  templateId?: TemplateId;
}

// تحويل صورة URL إلى base64
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// تصدير Word احترافي - استخدام التصميم الجديد
export async function exportToWord(options: ExportOptions): Promise<void> {
  // استخدام التصدير الاحترافي الجديد
  return exportProfessionalWord(options);
}

// تصدير Word القديم (للمرجعية)
export async function exportToWordLegacy(options: ExportOptions): Promise<void> {
  const { approvedSections, marketingContent, ideaData, organizationInfo, templateId = 'classic' } = options;
  const programName = ideaData.programDescription?.slice(0, 60) || 'البرنامج';
  const orgName = organizationInfo?.name || '';
  const colors = templateColors[templateId];
  const primaryColor = colors.primary.replace('#', '');
  const accentColor = colors.accent.replace('#', '');

  const children: any[] = [];

  // إضافة اسم المؤسسة إذا وجد
  if (orgName) {
    children.push(
      new Paragraph({
        text: orgName,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: orgName,
            bold: true,
            size: 32,
            color: primaryColor,
          }),
        ],
      })
    );
  }

  // العنوان الرئيسي
  children.push(
    new Paragraph({
      text: programName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  children.push(
    new Paragraph({
      text: 'مقترح تمويل للجهات المانحة والداعمة',
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: 'مقترح تمويل للجهات المانحة والداعمة',
          color: accentColor,
          size: 28,
        }),
      ],
    })
  );

  // ملخص البرنامج
  if (approvedSections.has('summary')) {
    children.push(
      new Paragraph({
        text: 'ملخص البرنامج التنفيذي',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: 'ملخص البرنامج التنفيذي',
            bold: true,
            color: '1e7e34',
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        text: marketingContent.summary || ideaData.programDescription || '',
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );

    if (ideaData.generalObjective) {
      children.push(
        new Paragraph({
          text: 'الهدف العام:',
          spacing: { before: 200 },
          children: [
            new TextRun({ text: 'الهدف العام: ', bold: true }),
            new TextRun({ text: ideaData.generalObjective }),
          ],
        })
      );
    }

    if (ideaData.targetAudience) {
      children.push(
        new Paragraph({
          text: 'الفئة المستهدفة:',
          spacing: { before: 100 },
          children: [
            new TextRun({ text: 'الفئة المستهدفة: ', bold: true }),
            new TextRun({ text: ideaData.targetAudience }),
          ],
        })
      );
    }
  }

  // الأثر المتوقع
  if (approvedSections.has('impact')) {
    children.push(
      new Paragraph({
        text: 'الأثر المتوقع والنتائج',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: 'الأثر المتوقع والنتائج',
            bold: true,
            color: '2563eb',
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        text: marketingContent.impact || '',
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );

    if (marketingContent.shortTermResults?.length) {
      children.push(
        new Paragraph({
          text: 'النتائج قصيرة المدى:',
          spacing: { before: 200 },
          children: [
            new TextRun({ text: 'النتائج قصيرة المدى:', bold: true }),
          ],
        })
      );
      marketingContent.shortTermResults.forEach((result) => {
        children.push(
          new Paragraph({
            text: `• ${result}`,
            spacing: { before: 50 },
            indent: { left: 400 },
          })
        );
      });
    }

    if (marketingContent.longTermResults?.length) {
      children.push(
        new Paragraph({
          text: 'النتائج طويلة المدى:',
          spacing: { before: 200 },
          children: [
            new TextRun({ text: 'النتائج طويلة المدى:', bold: true }),
          ],
        })
      );
      marketingContent.longTermResults.forEach((result) => {
        children.push(
          new Paragraph({
            text: `• ${result}`,
            spacing: { before: 50 },
            indent: { left: 400 },
          })
        );
      });
    }
  }

  // الميزانية
  if (approvedSections.has('budget')) {
    children.push(
      new Paragraph({
        text: 'الميزانية والتمويل المطلوب',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: 'الميزانية والتمويل المطلوب',
            bold: true,
            color: 'd97706',
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        text: marketingContent.budget || '',
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );

    if (marketingContent.budgetBreakdown?.length) {
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'البند', alignment: AlignmentType.CENTER })],
              shading: { fill: 'f59e0b', type: ShadingType.CLEAR },
            }),
            new TableCell({
              children: [new Paragraph({ text: 'النسبة', alignment: AlignmentType.CENTER })],
              shading: { fill: 'f59e0b', type: ShadingType.CLEAR },
            }),
          ],
        }),
        ...marketingContent.budgetBreakdown.map(
          (item) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: item.category })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: `${item.percentage}%`, alignment: AlignmentType.CENTER })],
                }),
              ],
            })
        ),
      ];

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }

    if (marketingContent.totalBudget) {
      children.push(
        new Paragraph({
          text: `إجمالي التمويل المطلوب: ${marketingContent.totalBudget} ريال`,
          spacing: { before: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `إجمالي التمويل المطلوب: ${marketingContent.totalBudget} ريال`,
              bold: true,
              size: 28,
              color: '16a34a',
            }),
          ],
        })
      );
    }
  }

  // الشراكات
  if (approvedSections.has('partnerships')) {
    children.push(
      new Paragraph({
        text: 'فرص الشراكة والتعاون',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: 'فرص الشراكة والتعاون',
            bold: true,
            color: '9333ea',
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        text: marketingContent.partnerships || '',
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );

    if (marketingContent.partnershipBenefits?.length) {
      children.push(
        new Paragraph({
          text: 'مزايا الشراكة:',
          spacing: { before: 200 },
          children: [
            new TextRun({ text: 'مزايا الشراكة:', bold: true }),
          ],
        })
      );
      marketingContent.partnershipBenefits.forEach((benefit) => {
        children.push(
          new Paragraph({
            text: `✓ ${benefit}`,
            spacing: { before: 50 },
            indent: { left: 400 },
          })
        );
      });
    }
  }

  // الجدول الزمني
  if (approvedSections.has('timeline') && marketingContent.timelinePhases?.length) {
    children.push(
      new Paragraph({
        text: 'الجدول الزمني للتنفيذ',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: 'الجدول الزمني للتنفيذ',
            bold: true,
            color: '4f46e5',
          }),
        ],
      })
    );

    marketingContent.timelinePhases.forEach((phase, idx) => {
      children.push(
        new Paragraph({
          text: `${idx + 1}. ${phase.phase} (${phase.duration})`,
          spacing: { before: 150 },
          children: [
            new TextRun({ text: `${idx + 1}. ${phase.phase}`, bold: true }),
            new TextRun({ text: ` (${phase.duration})`, italics: true }),
          ],
        })
      );
      children.push(
        new Paragraph({
          text: phase.activities,
          spacing: { before: 50 },
          indent: { left: 400 },
        })
      );
    });
  }

  // معلومات التواصل
  if (approvedSections.has('contact')) {
    children.push(
      new Paragraph({
        text: 'معلومات التواصل',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: 'معلومات التواصل',
            bold: true,
            color: '0d9488',
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        text: 'نرحب بتواصلكم للاستفسار أو المشاركة في دعم هذا البرنامج',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${programName.slice(0, 30)}_donor_proposal.docx`);
}

// تصدير PDF احترافي - استخدام التصميم الجديد
export async function exportToPDF(options: ExportOptions): Promise<void> {
  // استخدام التصدير الاحترافي الجديد
  return exportProfessionalPDF(options);
}

// تصدير PDF القديم (للمرجعية)
export async function exportToPDFLegacy(options: ExportOptions): Promise<void> {
  const { approvedSections, marketingContent, ideaData, organizationInfo, templateId = 'classic' } = options;
  const programName = ideaData.programDescription?.slice(0, 60) || 'البرنامج';
  const orgName = organizationInfo?.name || '';
  const logoUrl = organizationInfo?.logo;
  const colors = templateColors[templateId];
  
  // تحويل الألوان من hex إلى RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };
  
  const primaryRgb = hexToRgb(colors.primary);
  const accentRgb = hexToRgb(colors.accent);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // إعداد الخط - استخدام Helvetica مع دعم Unicode
  pdf.setFont('helvetica');
  // ملاحظة: jsPDF لا يدعم العربية بشكل كامل، لذلك سنستخدم الإنجليزية للعناوين والعربية للمحتوى
  
  let yPos = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // إضافة الشعار إذا وجد
  if (logoUrl) {
    try {
      const logoBase64 = await urlToBase64(logoUrl);
      if (logoBase64) {
        const logoSize = 25;
        pdf.addImage(logoBase64, 'PNG', (pageWidth - logoSize) / 2, yPos, logoSize, logoSize);
        yPos += logoSize + 10;
      }
    } catch (e) {
      console.warn('Failed to add logo to PDF:', e);
    }
  }

  // إضافة اسم المؤسسة إذا وجد
  if (orgName) {
    pdf.setFontSize(18);
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.text(orgName, pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;
  }

  // العنوان
  pdf.setFontSize(24);
  pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  const title = programName;
  pdf.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  pdf.setFontSize(14);
  pdf.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
  pdf.text('Donor Funding Proposal | \u0645\u0642\u062a\u0631\u062d \u062a\u0645\u0648\u064a\u0644', pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // خط فاصل
  pdf.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  const addSection = (title: string, content: string, color: number[]) => {
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(16);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(title, pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;

    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);
    const lines = pdf.splitTextToSize(content, contentWidth);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(line, pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;
    });
    yPos += 10;
  };

  if (approvedSections.has('summary')) {
    addSection('Executive Summary | \u0645\u0644\u062e\u0635 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c', marketingContent.summary || '', [primaryRgb.r, primaryRgb.g, primaryRgb.b]);
  }

  if (approvedSections.has('impact')) {
    addSection('Expected Impact | \u0627\u0644\u0623\u062b\u0631 \u0627\u0644\u0645\u062a\u0648\u0642\u0639', marketingContent.impact || '', [primaryRgb.r, primaryRgb.g, primaryRgb.b]);
  }

  if (approvedSections.has('budget')) {
    addSection('Budget & Funding | \u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629', marketingContent.budget || '', [accentRgb.r, accentRgb.g, accentRgb.b]);
    if (marketingContent.totalBudget) {
      pdf.setFontSize(14);
      pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      pdf.text(`Total Required | \u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u062a\u0645\u0648\u064a\u0644: ${marketingContent.totalBudget} SAR`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
    }
  }

  if (approvedSections.has('partnerships')) {
    addSection('Partnership Opportunities | \u0641\u0631\u0635 \u0627\u0644\u0634\u0631\u0627\u0643\u0629', marketingContent.partnerships || '', [primaryRgb.r, primaryRgb.g, primaryRgb.b]);
  }

  pdf.save(`${programName.slice(0, 30)}_donor_proposal.pdf`);
}

// تصدير PowerPoint احترافي - استخدام التصميم الجديد
export async function exportToPPT(options: ExportOptions): Promise<void> {
  // استخدام التصدير الاحترافي الجديد
  return exportProfessionalPPT(options);
}

// تصدير PowerPoint القديم (للمرجعية)
export async function exportToPPTLegacy(options: ExportOptions): Promise<void> {
  const { approvedSections, marketingContent, ideaData, organizationInfo, templateId = 'classic' } = options;
  const programName = ideaData.programDescription?.slice(0, 60) || 'البرنامج';
  const orgName = organizationInfo?.name || '';
  const logoUrl = organizationInfo?.logo;
  const colors = templateColors[templateId];

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = programName;
  pptx.author = orgName || 'Nonprofit Ideas Generator';
  pptx.company = orgName;

  // الشريحة الأولى - العنوان
  const slide1 = pptx.addSlide();
  
  // خلفية بناءً على القالب
  const bgColor = colors.primary.replace('#', '');
  const accentColor = colors.accent.replace('#', '');
  
  slide1.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: '100%',
    fill: { type: 'solid', color: bgColor },
  });
  
  // زخارف بناءً على القالب
  if (templateId === 'creative') {
    slide1.addShape('ellipse', {
      x: 8,
      y: 0.5,
      w: 2,
      h: 2,
      fill: { type: 'solid', color: 'FFFFFF', alpha: 10 },
    });
    slide1.addShape('ellipse', {
      x: 0.5,
      y: 4,
      w: 3,
      h: 3,
      fill: { type: 'solid', color: 'FFFFFF', alpha: 5 },
    });
  } else if (templateId === 'formal') {
    slide1.addShape('rect', {
      x: 0,
      y: 5,
      w: '100%',
      h: 0.15,
      fill: { type: 'solid', color: accentColor },
    });
  } else if (templateId === 'classic') {
    slide1.addShape('rect', {
      x: 1,
      y: 2.5,
      w: 8,
      h: 0.02,
      fill: { type: 'solid', color: accentColor, alpha: 30 },
    });
  }

  // إضافة الشعار إذا وجد
  let titleY = 2;
  if (logoUrl) {
    try {
      const logoBase64 = await urlToBase64(logoUrl);
      if (logoBase64) {
        slide1.addImage({
          data: logoBase64,
          x: 4.5,
          y: 0.5,
          w: 1.2,
          h: 1.2,
        });
        titleY = 2.2;
      }
    } catch (e) {
      console.warn('Failed to add logo to PPT:', e);
    }
  }

  // إضافة اسم المؤسسة إذا وجد
  if (orgName) {
    slide1.addText(orgName, {
      x: 0.5,
      y: 1.7,
      w: '90%',
      h: 0.5,
      fontSize: 18,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
    });
    titleY = 2.3;
  }

  slide1.addText(programName, {
    x: 0.5,
    y: titleY,
    w: '90%',
    h: 1.5,
    fontSize: 36,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    rtlMode: true,
    lang: 'ar-SA',
  });
  slide1.addText('مقترح تمويل للجهات المانحة والداعمة', {
    x: 0.5,
    y: titleY + 1.5,
    w: '90%',
    h: 0.8,
    fontSize: 20,
    color: 'FFFFFF',
    align: 'center',
    rtlMode: true,
    lang: 'ar-SA',
  });

  // شريحة الملخص
  if (approvedSections.has('summary')) {
    const slide2 = pptx.addSlide();
    slide2.addText('ملخص البرنامج التنفيذي', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      fontSize: 28,
      color: '1e7e34',
      bold: true,
      rtlMode: true,
      lang: 'ar-SA',
    });
    slide2.addShape('rect', {
      x: 0.5,
      y: 0.9,
      w: 2,
      h: 0.05,
      fill: { type: 'solid', color: '1e7e34' },
    });
    slide2.addText(marketingContent.summary || '', {
      x: 0.5,
      y: 1.2,
      w: '90%',
      h: 4,
      fontSize: 14,
      color: '333333',
      valign: 'top',
      rtlMode: true,
      lang: 'ar-SA',
    });
  }

  // شريحة الأثر
  if (approvedSections.has('impact')) {
    const slide3 = pptx.addSlide();
    slide3.addText('الأثر المتوقع والنتائج', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      fontSize: 28,
      color: '2563eb',
      bold: true,
      rtlMode: true,
      lang: 'ar-SA',
    });
    slide3.addShape('rect', {
      x: 0.5,
      y: 0.9,
      w: 2,
      h: 0.05,
      fill: { type: 'solid', color: '2563eb' },
    });
    
    let impactText = marketingContent.impact || '';
    if (marketingContent.shortTermResults?.length) {
      impactText += '\n\nالنتائج قصيرة المدى:\n' + marketingContent.shortTermResults.map(r => `• ${r}`).join('\n');
    }
    
    slide3.addText(impactText, {
      x: 0.5,
      y: 1.2,
      w: '90%',
      h: 4,
      fontSize: 12,
      color: '333333',
      valign: 'top',
      rtlMode: true,
      lang: 'ar-SA',
    });
  }

  // شريحة الميزانية
  if (approvedSections.has('budget')) {
    const slide4 = pptx.addSlide();
    slide4.addText('الميزانية والتمويل المطلوب', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      fontSize: 28,
      color: 'd97706',
      bold: true,
      rtlMode: true,
      lang: 'ar-SA',
    });
    slide4.addShape('rect', {
      x: 0.5,
      y: 0.9,
      w: 2,
      h: 0.05,
      fill: { type: 'solid', color: 'd97706' },
    });

    if (marketingContent.budgetBreakdown?.length) {
      const chartData = marketingContent.budgetBreakdown.map(item => ({
        name: item.category,
        labels: [item.category],
        values: [item.percentage],
      }));

      slide4.addChart('pie', chartData, {
        x: 0.5,
        y: 1.5,
        w: 4,
        h: 3,
        showPercent: true,
        showLegend: true,
        legendPos: 'r',
      });
    }

    if (marketingContent.totalBudget) {
      slide4.addText(`إجمالي التمويل المطلوب: ${marketingContent.totalBudget} ريال`, {
        x: 5,
        y: 3,
        w: 4,
        fontSize: 20,
        color: '16a34a',
        bold: true,
        rtlMode: true,
        lang: 'ar-SA',
      });
    }
  }

  // شريحة الشراكات
  if (approvedSections.has('partnerships')) {
    const slide5 = pptx.addSlide();
    slide5.addText('فرص الشراكة والتعاون', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      fontSize: 28,
      color: '9333ea',
      bold: true,
      rtlMode: true,
      lang: 'ar-SA',
    });
    slide5.addShape('rect', {
      x: 0.5,
      y: 0.9,
      w: 2,
      h: 0.05,
      fill: { type: 'solid', color: '9333ea' },
    });

    let partnerText = marketingContent.partnerships || '';
    if (marketingContent.partnershipBenefits?.length) {
      partnerText += '\n\nمزايا الشراكة:\n' + marketingContent.partnershipBenefits.map(b => `✓ ${b}`).join('\n');
    }

    slide5.addText(partnerText, {
      x: 0.5,
      y: 1.2,
      w: '90%',
      h: 4,
      fontSize: 12,
      color: '333333',
      valign: 'top',
      rtlMode: true,
      lang: 'ar-SA',
    });
  }

  // شريحة الجدول الزمني
  if (approvedSections.has('timeline') && marketingContent.timelinePhases?.length) {
    const slide6 = pptx.addSlide();
    slide6.addText('الجدول الزمني للتنفيذ', {
      x: 0.5,
      y: 0.3,
      w: '90%',
      fontSize: 28,
      color: '4f46e5',
      bold: true,
      rtlMode: true,
      lang: 'ar-SA',
    });
    slide6.addShape('rect', {
      x: 0.5,
      y: 0.9,
      w: 2,
      h: 0.05,
      fill: { type: 'solid', color: '4f46e5' },
    });

    const tableData: any[][] = [
      [{ text: 'المرحلة', options: { bold: true, fill: '4f46e5', color: 'FFFFFF' } },
       { text: 'المدة', options: { bold: true, fill: '4f46e5', color: 'FFFFFF' } },
       { text: 'الأنشطة', options: { bold: true, fill: '4f46e5', color: 'FFFFFF' } }],
    ];

    marketingContent.timelinePhases.forEach(phase => {
      tableData.push([phase.phase, phase.duration, phase.activities]);
    });

    slide6.addTable(tableData, {
      x: 0.5,
      y: 1.2,
      w: 9,
      colW: [3, 1.5, 4.5],
      fontSize: 11,
      border: { pt: 0.5, color: 'CCCCCC' },
    });
  }

  // شريحة التواصل
  if (approvedSections.has('contact')) {
    const slideContact = pptx.addSlide();
    slideContact.addShape('rect', {
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
      fill: { type: 'solid', color: '0d9488' },
    });
    slideContact.addText('شكراً لاهتمامكم', {
      x: 0.5,
      y: 2,
      w: '90%',
      fontSize: 36,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
      rtlMode: true,
      lang: 'ar-SA',
    });
    slideContact.addText('نرحب بتواصلكم للاستفسار أو المشاركة في دعم هذا البرنامج', {
      x: 0.5,
      y: 3,
      w: '90%',
      fontSize: 18,
      color: 'FFFFFF',
      align: 'center',
      rtlMode: true,
      lang: 'ar-SA',
    });
  }

  await pptx.writeFile({ fileName: `${programName.slice(0, 30)}_donor_proposal.pptx` });
}
