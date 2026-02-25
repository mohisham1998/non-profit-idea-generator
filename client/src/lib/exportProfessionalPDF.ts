import jsPDF from 'jspdf';

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
  idea?: string;
  justifications?: string;
  features?: string;
  strengths?: string;
  outputs?: string;
  results?: string;
  targetCount?: number;
  duration?: string;
  detailedObjectives?: string[];
  proposedNames?: string[];
}

interface OrganizationInfo {
  logo?: string | null;
  name?: string | null;
}

type TemplateId = 'classic' | 'modern' | 'formal' | 'creative';

// ألوان القوالب
const templateThemes: Record<TemplateId, {
  primary: { r: number; g: number; b: number };
  secondary: { r: number; g: number; b: number };
  accent: { r: number; g: number; b: number };
  light: { r: number; g: number; b: number };
  dark: { r: number; g: number; b: number };
}> = {
  classic: {
    primary: { r: 26, g: 54, b: 93 },
    secondary: { r: 45, g: 74, b: 111 },
    accent: { r: 212, g: 175, b: 55 },
    light: { r: 247, g: 250, b: 252 },
    dark: { r: 26, g: 32, b: 44 },
  },
  modern: {
    primary: { r: 124, g: 58, b: 237 },
    secondary: { r: 139, g: 92, b: 246 },
    accent: { r: 245, g: 158, b: 11 },
    light: { r: 250, g: 245, b: 255 },
    dark: { r: 31, g: 41, b: 55 },
  },
  formal: {
    primary: { r: 6, g: 78, b: 59 },
    secondary: { r: 4, g: 120, b: 87 },
    accent: { r: 202, g: 138, b: 4 },
    light: { r: 240, g: 253, b: 244 },
    dark: { r: 31, g: 41, b: 55 },
  },
  creative: {
    primary: { r: 219, g: 39, b: 119 },
    secondary: { r: 236, g: 72, b: 153 },
    accent: { r: 14, g: 165, b: 233 },
    light: { r: 253, g: 242, b: 248 },
    dark: { r: 31, g: 41, b: 55 },
  },
};

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

interface ExportOptions {
  approvedSections: Set<string>;
  marketingContent: DonorContent;
  ideaData: IdeaData;
  organizationInfo?: OrganizationInfo;
  templateId?: TemplateId;
}

export async function exportProfessionalPDF(options: ExportOptions): Promise<void> {
  const { approvedSections, marketingContent, ideaData, organizationInfo, templateId = 'modern' } = options;
  const programName = ideaData.programDescription?.slice(0, 60) || 'البرنامج';
  const orgName = organizationInfo?.name || '';
  const logoUrl = organizationInfo?.logo;
  const theme = templateThemes[templateId];

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let currentPage = 1;

  // ========== دوال مساعدة ==========
  
  // رسم موجة منحنية
  const drawWave = (y: number, color: { r: number; g: number; b: number }, height: number = 30) => {
    pdf.setFillColor(color.r, color.g, color.b);
    
    // رسم مستطيل أساسي
    pdf.rect(0, y, pageWidth, height, 'F');
    
    // رسم منحنى في الأعلى
    pdf.ellipse(pageWidth / 2, y, pageWidth * 0.6, 8, 'F');
  };

  // رسم موجة علوية
  const drawTopWave = (height: number = 35) => {
    pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.rect(0, 0, pageWidth, height, 'F');
    
    // منحنى في الأسفل
    pdf.ellipse(pageWidth / 2, height, pageWidth * 0.6, 10, 'F');
  };

  // رسم بطاقة محتوى
  const drawCard = (x: number, y: number, w: number, h: number, color: { r: number; g: number; b: number }, alpha: number = 1) => {
    pdf.setFillColor(color.r, color.g, color.b);
    pdf.roundedRect(x, y, w, h, 3, 3, 'F');
  };

  // إضافة نص عربي مع محاذاة لليمين
  const addArabicText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, color: { r: number; g: number; b: number } = theme.dark) => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color.r, color.g, color.b);
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    lines.forEach((line: string) => {
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentPage++;
        currentY = 30;
      }
      pdf.text(line, x + maxWidth, currentY, { align: 'right' });
      currentY += fontSize * 0.5;
    });
    
    return currentY;
  };

  // إضافة عنوان قسم
  const addSectionTitle = (title: string, y: number, color: { r: number; g: number; b: number } = theme.primary) => {
    pdf.setFontSize(18);
    pdf.setTextColor(color.r, color.g, color.b);
    pdf.text(title, pageWidth - margin, y, { align: 'right' });
    
    // خط تحت العنوان
    pdf.setDrawColor(theme.accent.r, theme.accent.g, theme.accent.b);
    pdf.setLineWidth(1);
    pdf.line(pageWidth - margin - 50, y + 3, pageWidth - margin, y + 3);
    
    return y + 12;
  };

  // ========== صفحة الغلاف ==========
  
  // خلفية بيضاء
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // منطقة علوية ملونة
  pdf.setFillColor(theme.light.r, theme.light.g, theme.light.b);
  pdf.rect(0, 0, pageWidth * 0.6, pageHeight * 0.5, 'F');
  
  // دائرة للشعار
  pdf.setFillColor(255, 255, 255);
  pdf.ellipse(pageWidth * 0.75, pageHeight * 0.15, 25, 25, 'F');
  
  // موجة ملونة في الأسفل
  drawWave(pageHeight * 0.7, theme.primary, 50);
  
  // موجة ثانية أغمق
  pdf.setFillColor(theme.secondary.r, theme.secondary.g, theme.secondary.b);
  pdf.rect(0, pageHeight * 0.85, pageWidth, 50, 'F');
  
  // إضافة الشعار
  if (logoUrl) {
    try {
      const logoBase64 = await urlToBase64(logoUrl);
      if (logoBase64) {
        pdf.addImage(logoBase64, 'PNG', pageWidth * 0.65, pageHeight * 0.08, 30, 30);
      }
    } catch (e) {
      console.warn('Failed to add logo:', e);
    }
  }
  
  // اسم المؤسسة
  if (orgName) {
    pdf.setFontSize(14);
    pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
    pdf.text(orgName, pageWidth * 0.75, pageHeight * 0.3, { align: 'center' });
  }
  
  // كلمة "مبادرة"
  pdf.setFontSize(20);
  pdf.setTextColor(255, 255, 255);
  pdf.text('مبادرة', pageWidth - margin, pageHeight * 0.72, { align: 'right' });
  
  // اسم البرنامج
  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  const programLines = pdf.splitTextToSize(programName, contentWidth);
  let titleY = pageHeight * 0.78;
  programLines.forEach((line: string) => {
    pdf.text(line, pageWidth - margin, titleY, { align: 'right' });
    titleY += 12;
  });
  
  // السنة
  const currentYear = new Date().getFullYear();
  pdf.setFontSize(16);
  pdf.text(currentYear.toString(), margin + 10, pageHeight * 0.73);

  // ========== صفحة البسملة ==========
  pdf.addPage();
  currentPage++;
  
  // خلفية بيضاء
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // موجة ملونة في الأسفل
  drawWave(pageHeight * 0.75, theme.primary, 80);
  
  // البسملة
  pdf.setFontSize(32);
  pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
  pdf.text('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', pageWidth / 2, pageHeight * 0.4, { align: 'center' });

  // ========== صفحة التمهيد ==========
  if (approvedSections.has('summary')) {
    pdf.addPage();
    currentPage++;
    
    // موجة علوية
    drawTopWave(40);
    
    // عنوان التمهيد
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.text('تمهيد', pageWidth - margin, 25, { align: 'right' });
    
    // خط تحت العنوان
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(1);
    pdf.line(pageWidth - margin - 30, 30, pageWidth - margin, 30);
    
    // بطاقة المحتوى
    drawCard(margin, 55, contentWidth, 100, { r: 40, g: 40, b: 50 });
    
    // نص التمهيد
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    const summaryText = marketingContent.summary || ideaData.programDescription || '';
    const summaryLines = pdf.splitTextToSize(summaryText, contentWidth - 10);
    let summaryY = 65;
    summaryLines.slice(0, 15).forEach((line: string) => {
      pdf.text(line, pageWidth - margin - 5, summaryY, { align: 'right' });
      summaryY += 6;
    });
  }

  // ========== صفحة فكرة المبادرة ==========
  pdf.addPage();
  currentPage++;
  
  // خلفية بيضاء
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // شريط ملون على اليمين
  pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
  pdf.rect(pageWidth - 30, 0, 30, pageHeight, 'F');
  
  // عنوان فكرة المبادرة
  pdf.setFontSize(20);
  pdf.setTextColor(255, 255, 255);
  pdf.text('فكرة', pageWidth - 15, 50, { align: 'center' });
  pdf.text('المبادرة', pageWidth - 15, 65, { align: 'center' });
  
  // نص الفكرة
  const ideaText = ideaData.idea || marketingContent.summary || '';
  let ideaY = addArabicText(ideaText, margin, 40, contentWidth - 40, 14);
  
  // موجة ملونة في الأسفل
  drawWave(pageHeight - 20, theme.primary, 20);

  // ========== صفحة الرؤية ==========
  if (ideaData.vision) {
    pdf.addPage();
    currentPage++;
    
    // خلفية فاتحة
    pdf.setFillColor(theme.light.r, theme.light.g, theme.light.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // موجة ملونة في الأسفل
    drawWave(pageHeight * 0.6, theme.primary, 120);
    
    // دائرة زخرفية
    pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
    // @ts-ignore
    pdf.setGState(new (pdf as any).GState({ opacity: 0.2 }));
    pdf.ellipse(pageWidth / 2, 40, 20, 20, 'F');
    // @ts-ignore
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
    
    // عنوان الرؤية
    pdf.setFontSize(28);
    pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.text('الرؤية', pageWidth / 2, 50, { align: 'center' });
    
    // نص الرؤية
    pdf.setFontSize(18);
    pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
    const visionLines = pdf.splitTextToSize(ideaData.vision, contentWidth - 20);
    let visionY = 80;
    visionLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, visionY, { align: 'center' });
      visionY += 10;
    });
  }

  // ========== صفحة الهدف العام ==========
  if (ideaData.generalObjective) {
    pdf.addPage();
    currentPage++;
    
    // خلفية بيضاء
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // موجة علوية
    drawTopWave(25);
    
    // موجة ثانية
    pdf.setFillColor(theme.secondary.r, theme.secondary.g, theme.secondary.b);
    pdf.ellipse(pageWidth / 2, 35, pageWidth * 0.7, 15, 'F');
    
    // دائرة زخرفية
    pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
    // @ts-ignore
    pdf.setGState(new (pdf as any).GState({ opacity: 0.15 }));
    pdf.ellipse(pageWidth / 2, 60, 20, 20, 'F');
    // @ts-ignore
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
    
    // عنوان
    pdf.setFontSize(24);
    pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.text('الهدف العام من المبادرة', pageWidth / 2, 90, { align: 'center' });
    
    // بطاقة الهدف
    drawCard(margin + 20, 110, contentWidth - 40, 40, theme.light);
    pdf.setDrawColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin + 20, 110, contentWidth - 40, 40, 3, 3, 'S');
    
    // نص الهدف
    pdf.setFontSize(14);
    pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
    const goalLines = pdf.splitTextToSize(ideaData.generalObjective, contentWidth - 50);
    let goalY = 125;
    goalLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, goalY, { align: 'center' });
      goalY += 8;
    });
  }

  // ========== صفحة الأهداف التفصيلية ==========
  if (ideaData.detailedObjectives?.length) {
    pdf.addPage();
    currentPage++;
    
    // خلفية ملونة
    pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // موجة بيضاء في الأعلى
    pdf.setFillColor(255, 255, 255);
    pdf.ellipse(pageWidth / 2, 0, pageWidth * 0.7, 20, 'F');
    
    // عنوان
    pdf.setFontSize(22);
    pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.text('الأهداف التفصيلية', pageWidth - margin, 15, { align: 'right' });
    
    // دائرة زخرفية
    pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.ellipse(pageWidth - margin - 5, 10, 8, 8, 'F');
    
    // قائمة الأهداف
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    let objY = 40;
    ideaData.detailedObjectives.forEach((obj, i) => {
      const objText = `● ${obj}`;
      const objLines = pdf.splitTextToSize(objText, contentWidth - 10);
      objLines.forEach((line: string) => {
        pdf.text(line, pageWidth - margin, objY, { align: 'right' });
        objY += 7;
      });
      objY += 3;
    });
  }

  // ========== صفحة النطاقات ==========
  pdf.addPage();
  currentPage++;
  
  // خلفية ملونة
  pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // عنوان
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text('النطاقات', pageWidth - margin, 25, { align: 'right' });
  
  // بطاقات النطاقات
  const scopes = [
    { title: 'النطاق الزماني', value: ideaData.duration || marketingContent.stats?.duration || '6 أشهر' },
    { title: 'النطاق المكاني', value: 'المملكة العربية السعودية' },
    { title: 'الفئات المستهدفة', value: ideaData.targetAudience || '' },
    { title: 'العدد المستهدف', value: ideaData.targetCount?.toString() || marketingContent.stats?.beneficiaries || '' },
  ];
  
  const cardW = (contentWidth - 10) / 2;
  const cardH = 50;
  
  scopes.forEach((scope, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (cardW + 10);
    const y = 45 + row * (cardH + 10);
    
    // بطاقة بيضاء
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
    
    // دائرة الأيقونة
    pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.ellipse(x + cardW / 2, y - 5, 8, 8, 'F');
    
    // العنوان
    pdf.setFontSize(12);
    pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.text(scope.title, x + cardW / 2, y + 18, { align: 'center' });
    
    // القيمة
    pdf.setFontSize(10);
    pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
    const valueLines = pdf.splitTextToSize(scope.value, cardW - 10);
    let valueY = y + 30;
    valueLines.slice(0, 2).forEach((line: string) => {
      pdf.text(line, x + cardW / 2, valueY, { align: 'center' });
      valueY += 6;
    });
  });

  // ========== صفحة الأثر المتوقع ==========
  if (approvedSections.has('impact')) {
    pdf.addPage();
    currentPage++;
    
    // خلفية بيضاء
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // موجة علوية
    drawTopWave(30);
    
    // عنوان
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text('الأثر المتوقع والنتائج', pageWidth - margin, 20, { align: 'right' });
    
    // المحتوى
    let impactY = 50;
    
    if (marketingContent.impact) {
      impactY = addArabicText(marketingContent.impact, margin, impactY, contentWidth, 12);
      impactY += 10;
    }
    
    if (marketingContent.shortTermResults?.length) {
      pdf.setFontSize(14);
      pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
      pdf.text('النتائج قصيرة المدى:', pageWidth - margin, impactY, { align: 'right' });
      impactY += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
      marketingContent.shortTermResults.forEach(result => {
        const resultText = `• ${result}`;
        impactY = addArabicText(resultText, margin, impactY, contentWidth - 10, 11);
      });
      impactY += 8;
    }
    
    if (marketingContent.longTermResults?.length) {
      pdf.setFontSize(14);
      pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
      pdf.text('النتائج طويلة المدى:', pageWidth - margin, impactY, { align: 'right' });
      impactY += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
      marketingContent.longTermResults.forEach(result => {
        const resultText = `• ${result}`;
        impactY = addArabicText(resultText, margin, impactY, contentWidth - 10, 11);
      });
    }
  }

  // ========== صفحة الميزانية ==========
  if (approvedSections.has('budget')) {
    pdf.addPage();
    currentPage++;
    
    // خلفية فاتحة
    pdf.setFillColor(theme.light.r, theme.light.g, theme.light.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // موجة ملونة في الأسفل
    drawWave(pageHeight * 0.75, theme.primary, 80);
    
    // عنوان
    pdf.setFontSize(22);
    pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.text('الميزانية والتمويل المطلوب', pageWidth - margin, 25, { align: 'right' });
    
    // خط تحت العنوان
    pdf.setDrawColor(theme.accent.r, theme.accent.g, theme.accent.b);
    pdf.setLineWidth(1);
    pdf.line(pageWidth - margin - 80, 30, pageWidth - margin, 30);
    
    // جدول الميزانية
    if (marketingContent.budgetBreakdown?.length) {
      let tableY = 45;
      const colWidths = [contentWidth * 0.6, contentWidth * 0.4];
      
      // رأس الجدول
      pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
      pdf.rect(margin, tableY, contentWidth, 10, 'F');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.text('البند', pageWidth - margin - 10, tableY + 7, { align: 'right' });
      pdf.text('النسبة', margin + colWidths[1] / 2, tableY + 7, { align: 'center' });
      tableY += 10;
      
      // صفوف الجدول
      marketingContent.budgetBreakdown.forEach((item, i) => {
        const bgColor = i % 2 === 0 ? { r: 255, g: 255, b: 255 } : theme.light;
        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
        pdf.rect(margin, tableY, contentWidth, 8, 'F');
        
        pdf.setFontSize(10);
        pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
        pdf.text(item.category, pageWidth - margin - 10, tableY + 5.5, { align: 'right' });
        pdf.text(`${item.percentage}%`, margin + colWidths[1] / 2, tableY + 5.5, { align: 'center' });
        tableY += 8;
      });
      
      // حدود الجدول
      pdf.setDrawColor(theme.primary.r, theme.primary.g, theme.primary.b);
      pdf.setLineWidth(0.3);
      pdf.rect(margin, 45, contentWidth, tableY - 45, 'S');
    }
    
    // إجمالي الميزانية
    if (marketingContent.totalBudget) {
      drawCard(margin + 30, 150, contentWidth - 60, 30, theme.primary);
      
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text('إجمالي التمويل المطلوب', pageWidth / 2, 162, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(theme.accent.r, theme.accent.g, theme.accent.b);
      pdf.text(`${marketingContent.totalBudget} ريال`, pageWidth / 2, 175, { align: 'center' });
    }
  }

  // ========== صفحة الشراكات ==========
  if (approvedSections.has('partnerships')) {
    pdf.addPage();
    currentPage++;
    
    // خلفية بيضاء
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // موجة علوية
    drawTopWave(30);
    
    // عنوان
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text('فرص الشراكة والتعاون', pageWidth - margin, 20, { align: 'right' });
    
    // المحتوى
    let partnerY = 50;
    
    if (marketingContent.partnerships) {
      partnerY = addArabicText(marketingContent.partnerships, margin, partnerY, contentWidth, 12);
      partnerY += 10;
    }
    
    if (marketingContent.partnershipBenefits?.length) {
      pdf.setFontSize(14);
      pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
      pdf.text('مزايا الشراكة:', pageWidth - margin, partnerY, { align: 'right' });
      partnerY += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
      marketingContent.partnershipBenefits.forEach(benefit => {
        const benefitText = `✓ ${benefit}`;
        partnerY = addArabicText(benefitText, margin, partnerY, contentWidth - 10, 11);
      });
    }
  }

  // ========== صفحة الجدول الزمني ==========
  if (approvedSections.has('timeline') && marketingContent.timelinePhases?.length) {
    pdf.addPage();
    currentPage++;
    
    // خلفية فاتحة
    pdf.setFillColor(theme.light.r, theme.light.g, theme.light.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // عنوان
    pdf.setFontSize(22);
    pdf.setTextColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.text('الجدول الزمني للتنفيذ', pageWidth - margin, 25, { align: 'right' });
    
    // جدول المراحل
    let tableY = 40;
    const colWidths = [contentWidth * 0.25, contentWidth * 0.15, contentWidth * 0.6];
    
    // رأس الجدول
    pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.rect(margin, tableY, contentWidth, 10, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text('المرحلة', pageWidth - margin - 5, tableY + 7, { align: 'right' });
    pdf.text('المدة', pageWidth - margin - colWidths[0] - 5, tableY + 7, { align: 'right' });
    pdf.text('الأنشطة', margin + colWidths[2] / 2, tableY + 7, { align: 'center' });
    tableY += 10;
    
    // صفوف الجدول
    marketingContent.timelinePhases.forEach((phase, i) => {
      const bgColor = i % 2 === 0 ? { r: 255, g: 255, b: 255 } : theme.light;
      const rowHeight = Math.max(12, Math.ceil(phase.activities.length / 40) * 6 + 6);
      
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
      pdf.rect(margin, tableY, contentWidth, rowHeight, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(theme.dark.r, theme.dark.g, theme.dark.b);
      pdf.text(phase.phase, pageWidth - margin - 5, tableY + 6, { align: 'right' });
      pdf.text(phase.duration, pageWidth - margin - colWidths[0] - 5, tableY + 6, { align: 'right' });
      
      const activityLines = pdf.splitTextToSize(phase.activities, colWidths[2] - 10);
      let actY = tableY + 6;
      activityLines.slice(0, 3).forEach((line: string) => {
        pdf.text(line, margin + colWidths[2] - 5, actY, { align: 'right' });
        actY += 5;
      });
      
      tableY += rowHeight;
    });
    
    // حدود الجدول
    pdf.setDrawColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, 40, contentWidth, tableY - 40, 'S');
  }

  // ========== صفحة التواصل ==========
  if (approvedSections.has('contact')) {
    pdf.addPage();
    currentPage++;
    
    // خلفية ملونة
    pdf.setFillColor(theme.primary.r, theme.primary.g, theme.primary.b);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // موجة بيضاء في الأعلى
    pdf.setFillColor(255, 255, 255);
    pdf.ellipse(pageWidth / 2, 0, pageWidth * 0.7, 20, 'F');
    
    // عنوان الشكر
    pdf.setFontSize(32);
    pdf.setTextColor(255, 255, 255);
    pdf.text('شكراً لاهتمامكم', pageWidth / 2, pageHeight * 0.35, { align: 'center' });
    
    // رسالة التواصل
    pdf.setFontSize(14);
    pdf.text('نرحب بتواصلكم للاستفسار أو المشاركة في دعم هذا البرنامج', pageWidth / 2, pageHeight * 0.45, { align: 'center' });
    
    // اسم المؤسسة
    if (orgName) {
      pdf.setFontSize(18);
      pdf.setTextColor(theme.accent.r, theme.accent.g, theme.accent.b);
      pdf.text(orgName, pageWidth / 2, pageHeight * 0.55, { align: 'center' });
    }
    
    // عناصر زخرفية
    pdf.setFillColor(255, 255, 255);
    // @ts-ignore
    pdf.setGState(new (pdf as any).GState({ opacity: 0.2 }));
    pdf.ellipse(margin + 10, pageHeight * 0.7, 8, 8, 'F');
    pdf.ellipse(pageWidth - margin - 10, pageHeight * 0.7, 8, 8, 'F');
    // @ts-ignore
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));
  }

  // حفظ الملف
  pdf.save(`${programName.slice(0, 30)}_donor_proposal.pdf`);
}
