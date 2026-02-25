import pptxgen from 'pptxgenjs';

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

// ألوان القوالب المحسنة
const templateThemes: Record<TemplateId, {
  primary: string;
  secondary: string;
  accent: string;
  light: string;
  dark: string;
  gradient1: string;
  gradient2: string;
}> = {
  classic: {
    primary: '1a365d',
    secondary: '2d4a6f',
    accent: 'd4af37',
    light: 'f7fafc',
    dark: '1a202c',
    gradient1: '1a365d',
    gradient2: '2d4a6f',
  },
  modern: {
    primary: '7c3aed',
    secondary: '8b5cf6',
    accent: 'f59e0b',
    light: 'faf5ff',
    dark: '1f2937',
    gradient1: '7c3aed',
    gradient2: 'a855f7',
  },
  formal: {
    primary: '064e3b',
    secondary: '047857',
    accent: 'ca8a04',
    light: 'f0fdf4',
    dark: '1f2937',
    gradient1: '064e3b',
    gradient2: '059669',
  },
  creative: {
    primary: 'db2777',
    secondary: 'ec4899',
    accent: '0ea5e9',
    light: 'fdf2f8',
    dark: '1f2937',
    gradient1: 'db2777',
    gradient2: 'f472b6',
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

// إضافة موجة منحنية في أسفل الشريحة
function addWaveBottom(slide: any, color: string, y: number = 4.5, height: number = 1.2) {
  // موجة منحنية باستخدام مستطيل مع زوايا
  slide.addShape('rect', {
    x: 0,
    y: y,
    w: '100%',
    h: height,
    fill: { type: 'solid', color: color },
  });
  
  // إضافة شكل منحني فوق المستطيل
  slide.addShape('ellipse', {
    x: -1,
    y: y - 0.3,
    w: 12,
    h: 0.8,
    fill: { type: 'solid', color: color },
  });
}

// إضافة موجة منحنية في أعلى الشريحة
function addWaveTop(slide: any, color: string, height: number = 1.5) {
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: height,
    fill: { type: 'solid', color: color },
  });
  
  slide.addShape('ellipse', {
    x: -1,
    y: height - 0.4,
    w: 12,
    h: 0.8,
    fill: { type: 'solid', color: color },
  });
}

// إضافة عناصر زخرفية
function addDecorativeElements(slide: any, theme: typeof templateThemes.classic, templateId: TemplateId) {
  if (templateId === 'creative') {
    // دوائر زخرفية
    slide.addShape('ellipse', {
      x: 8.5,
      y: 0.3,
      w: 1.5,
      h: 1.5,
      fill: { type: 'solid', color: theme.accent, alpha: 15 },
    });
    slide.addShape('ellipse', {
      x: 0.3,
      y: 4,
      w: 1,
      h: 1,
      fill: { type: 'solid', color: theme.primary, alpha: 10 },
    });
  } else if (templateId === 'modern') {
    // خطوط مائلة
    slide.addShape('rect', {
      x: 9,
      y: 0,
      w: 0.05,
      h: 1.5,
      fill: { type: 'solid', color: theme.accent, alpha: 30 },
      rotate: 45,
    });
  } else if (templateId === 'formal') {
    // خط ذهبي
    slide.addShape('rect', {
      x: 0,
      y: 5.2,
      w: '100%',
      h: 0.08,
      fill: { type: 'solid', color: theme.accent },
    });
  }
}

// إضافة بطاقة محتوى
function addContentCard(slide: any, options: {
  x: number;
  y: number;
  w: number;
  h: number;
  bgColor: string;
  borderColor?: string;
  alpha?: number;
}) {
  const { x, y, w, h, bgColor, borderColor, alpha = 100 } = options;
  
  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { type: 'solid', color: bgColor, alpha },
    line: borderColor ? { color: borderColor, pt: 1 } : undefined,
    rectRadius: 0.15,
  });
}

export async function exportProfessionalPPT(options: ExportOptions): Promise<void> {
  const { approvedSections, marketingContent, ideaData, organizationInfo, templateId = 'modern' } = options;
  const programName = ideaData.programDescription?.slice(0, 60) || 'البرنامج';
  const orgName = organizationInfo?.name || '';
  const logoUrl = organizationInfo?.logo;
  const theme = templateThemes[templateId];

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = programName;
  pptx.author = orgName || 'Nonprofit Ideas Generator';
  pptx.company = orgName;

  // ========== الشريحة 1: الغلاف ==========
  const slideCover = pptx.addSlide();
  
  // خلفية بيضاء
  slideCover.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { type: 'solid', color: 'FFFFFF' },
  });
  
  // منطقة الصورة (نصف الشريحة الأيسر)
  slideCover.addShape('rect', {
    x: 0, y: 0, w: '55%', h: '70%',
    fill: { type: 'solid', color: theme.light },
  });
  
  // دائرة بيضاء للشعار
  slideCover.addShape('ellipse', {
    x: 6.5, y: -0.5, w: 4, h: 4,
    fill: { type: 'solid', color: 'FFFFFF' },
  });
  
  // موجة ملونة في الأسفل
  addWaveBottom(slideCover, theme.primary, 4.2, 1.3);
  
  // موجة ثانية أغمق
  slideCover.addShape('rect', {
    x: 0, y: 4.8, w: '100%', h: 0.75,
    fill: { type: 'solid', color: theme.secondary },
  });
  
  // إضافة الشعار
  if (logoUrl) {
    try {
      const logoBase64 = await urlToBase64(logoUrl);
      if (logoBase64) {
        slideCover.addImage({
          data: logoBase64,
          x: 7.5, y: 0.3, w: 1.5, h: 1.5,
        });
      }
    } catch (e) {
      console.warn('Failed to add logo:', e);
    }
  }
  
  // اسم المؤسسة
  if (orgName) {
    slideCover.addText(orgName, {
      x: 5.5, y: 2, w: 4, h: 0.5,
      fontSize: 14, color: theme.dark,
      align: 'center', rtlMode: true, lang: 'ar-SA',
    });
  }
  
  // كلمة "مبادرة" أو "برنامج"
  slideCover.addText('مبادرة', {
    x: 5, y: 4.3, w: 4.5, h: 0.6,
    fontSize: 24, color: 'FFFFFF',
    align: 'right', rtlMode: true, lang: 'ar-SA',
  });
  
  // اسم البرنامج
  slideCover.addText(programName, {
    x: 0.5, y: 4.9, w: 9, h: 0.7,
    fontSize: 32, color: 'FFFFFF', bold: true,
    align: 'right', rtlMode: true, lang: 'ar-SA',
  });
  
  // السنة
  const currentYear = new Date().getFullYear();
  slideCover.addText(currentYear.toString(), {
    x: 0.5, y: 4.5, w: 1.5, h: 0.5,
    fontSize: 20, color: 'FFFFFF',
    align: 'left',
  });

  // ========== الشريحة 2: البسملة ==========
  const slideBismillah = pptx.addSlide();
  
  slideBismillah.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { type: 'solid', color: 'FFFFFF' },
  });
  
  // موجة ملونة في الأسفل
  addWaveBottom(slideBismillah, theme.primary, 4.5, 1);
  
  // البسملة
  slideBismillah.addText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', {
    x: 0.5, y: 2, w: '90%', h: 1.5,
    fontSize: 36, color: theme.primary,
    align: 'center', rtlMode: true, lang: 'ar-SA',
    fontFace: 'Traditional Arabic',
  });

  // ========== الشريحة 3: التمهيد ==========
  if (approvedSections.has('summary')) {
    const slideIntro = pptx.addSlide();
    
    // خلفية مع موجة علوية
    addWaveTop(slideIntro, theme.primary, 1.2);
    
    // عنوان التمهيد
    slideIntro.addText('تمهيد', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 32, color: 'FFFFFF', bold: true,
      align: 'right', rtlMode: true, lang: 'ar-SA',
    });
    
    // خط تحت العنوان
    slideIntro.addShape('rect', {
      x: 7, y: 1, w: 2.5, h: 0.05,
      fill: { type: 'solid', color: 'FFFFFF' },
    });
    
    // بطاقة المحتوى
    addContentCard(slideIntro, {
      x: 0.5, y: 1.5, w: 9, h: 3.5,
      bgColor: theme.dark, alpha: 85,
    });
    
    // نص التمهيد
    slideIntro.addText(marketingContent.summary || ideaData.programDescription || '', {
      x: 0.7, y: 1.7, w: 8.6, h: 3.2,
      fontSize: 14, color: 'FFFFFF',
      align: 'right', valign: 'top',
      rtlMode: true, lang: 'ar-SA',
    });
    
    addDecorativeElements(slideIntro, theme, templateId);
  }

  // ========== الشريحة 4: فكرة المبادرة ==========
  const slideIdea = pptx.addSlide();
  
  // خلفية بيضاء
  slideIdea.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { type: 'solid', color: 'FFFFFF' },
  });
  
  // شريط ملون على اليمين
  slideIdea.addShape('rect', {
    x: 8.5, y: 0, w: 1.5, h: '100%',
    fill: { type: 'solid', color: theme.primary },
  });
  
  // عنوان فكرة المبادرة
  slideIdea.addText('فكرة\nالمبادرة', {
    x: 8.6, y: 1.5, w: 1.3, h: 2,
    fontSize: 28, color: 'FFFFFF', bold: true,
    align: 'center', valign: 'middle',
    rtlMode: true, lang: 'ar-SA',
  });
  
  // أيقونة الهدف
  slideIdea.addShape('ellipse', {
    x: 8.75, y: 3.8, w: 1, h: 1,
    fill: { type: 'solid', color: 'FFFFFF', alpha: 20 },
  });
  
  // نص الفكرة
  const ideaText = ideaData.idea || marketingContent.summary || '';
  slideIdea.addText(ideaText, {
    x: 0.5, y: 0.5, w: 7.5, h: 4.5,
    fontSize: 16, color: theme.dark,
    align: 'right', valign: 'top',
    rtlMode: true, lang: 'ar-SA',
  });
  
  // موجة ملونة في الأسفل
  addWaveBottom(slideIdea, theme.primary, 5, 0.55);

  // ========== الشريحة 5: الرؤية ==========
  if (ideaData.vision) {
    const slideVision = pptx.addSlide();
    
    // خلفية فاتحة
    slideVision.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { type: 'solid', color: theme.light },
    });
    
    // موجة ملونة في الأسفل
    addWaveBottom(slideVision, theme.primary, 3.5, 2);
    
    // أيقونة الرؤية (مصباح/ماسة)
    slideVision.addShape('ellipse', {
      x: 4.2, y: 0.3, w: 1.5, h: 1.5,
      fill: { type: 'solid', color: theme.primary, alpha: 20 },
    });
    
    // عنوان الرؤية
    slideVision.addText('الرؤية', {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 36, color: theme.primary, bold: true,
      align: 'center', rtlMode: true, lang: 'ar-SA',
    });
    
    // نص الرؤية
    slideVision.addText(ideaData.vision, {
      x: 1, y: 1.8, w: 8, h: 1.5,
      fontSize: 20, color: theme.dark,
      align: 'center', valign: 'middle',
      rtlMode: true, lang: 'ar-SA',
    });
    
    // عناصر زخرفية
    slideVision.addShape('ellipse', {
      x: 0.3, y: 4, w: 0.8, h: 0.8,
      fill: { type: 'solid', color: 'FFFFFF', alpha: 30 },
    });
  }

  // ========== الشريحة 6: الهدف العام ==========
  if (ideaData.generalObjective) {
    const slideGoal = pptx.addSlide();
    
    // خلفية بيضاء
    slideGoal.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { type: 'solid', color: 'FFFFFF' },
    });
    
    // موجة ملونة في الأعلى
    addWaveTop(slideGoal, theme.primary, 0.8);
    
    // موجة ثانية
    slideGoal.addShape('ellipse', {
      x: -2, y: 0.5, w: 14, h: 1,
      fill: { type: 'solid', color: theme.secondary },
    });
    
    // أيقونة الهدف
    slideGoal.addShape('ellipse', {
      x: 4.2, y: 1.3, w: 1.5, h: 1.5,
      fill: { type: 'solid', color: theme.primary, alpha: 15 },
    });
    
    // عنوان الهدف العام
    slideGoal.addText('الهدف العام\nمن المبادرة', {
      x: 0.5, y: 2.5, w: 9, h: 1.2,
      fontSize: 32, color: theme.primary, bold: true,
      align: 'center', rtlMode: true, lang: 'ar-SA',
    });
    
    // بطاقة الهدف
    addContentCard(slideGoal, {
      x: 1.5, y: 3.8, w: 7, h: 1.3,
      bgColor: theme.light,
      borderColor: theme.primary,
    });
    
    slideGoal.addText(ideaData.generalObjective, {
      x: 1.7, y: 4, w: 6.6, h: 1,
      fontSize: 16, color: theme.dark,
      align: 'center', valign: 'middle',
      rtlMode: true, lang: 'ar-SA',
    });
  }

  // ========== الشريحة 7: الأهداف التفصيلية ==========
  if (ideaData.detailedObjectives?.length) {
    const slideObjectives = pptx.addSlide();
    
    // خلفية ملونة
    slideObjectives.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { type: 'solid', color: theme.primary },
    });
    
    // موجة بيضاء في الأعلى
    slideObjectives.addShape('ellipse', {
      x: -2, y: -0.5, w: 14, h: 1.5,
      fill: { type: 'solid', color: 'FFFFFF' },
    });
    
    // عنوان
    slideObjectives.addText('الأهداف التفصيلية', {
      x: 0.5, y: 0.3, w: 9, h: 0.8,
      fontSize: 28, color: theme.primary, bold: true,
      align: 'right', rtlMode: true, lang: 'ar-SA',
    });
    
    // أيقونة الهدف
    slideObjectives.addShape('ellipse', {
      x: 8.5, y: 0.2, w: 1, h: 1,
      fill: { type: 'solid', color: theme.primary },
    });
    
    // قائمة الأهداف
    const objectivesText = ideaData.detailedObjectives.map((obj, i) => `● ${obj}`).join('\n');
    slideObjectives.addText(objectivesText, {
      x: 0.5, y: 1.3, w: 9, h: 4,
      fontSize: 14, color: 'FFFFFF',
      align: 'right', valign: 'top',
      rtlMode: true, lang: 'ar-SA',
      bullet: false,
    });
  }

  // ========== الشريحة 8: النطاقات ==========
  const slideScopes = pptx.addSlide();
  
  // خلفية ملونة
  slideScopes.addShape('rect', {
    x: 0, y: 0, w: '100%', h: '100%',
    fill: { type: 'solid', color: theme.primary },
  });
  
  // عنوان النطاقات
  slideScopes.addText('النطاقات', {
    x: 0.5, y: 0.2, w: 9, h: 0.7,
    fontSize: 32, color: 'FFFFFF', bold: true,
    align: 'right', rtlMode: true, lang: 'ar-SA',
  });
  
  // بطاقات النطاقات
  const scopes = [
    { title: 'النطاق الزماني', value: ideaData.duration || marketingContent.stats?.duration || '6 أشهر', icon: '📅' },
    { title: 'النطاق المكاني', value: 'المملكة العربية السعودية', icon: '📍' },
    { title: 'الفئات المستهدفة', value: ideaData.targetAudience || '', icon: '👥' },
    { title: 'العدد المستهدف', value: ideaData.targetCount?.toString() || marketingContent.stats?.beneficiaries || '', icon: '🎯' },
  ];
  
  const cardWidth = 4;
  const cardHeight = 2;
  const startX = 0.8;
  const startY = 1.2;
  
  scopes.forEach((scope, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = startX + col * (cardWidth + 0.4);
    const y = startY + row * (cardHeight + 0.3);
    
    // بطاقة بيضاء
    addContentCard(slideScopes, {
      x, y, w: cardWidth, h: cardHeight,
      bgColor: 'FFFFFF',
    });
    
    // دائرة الأيقونة
    slideScopes.addShape('ellipse', {
      x: x + cardWidth / 2 - 0.4, y: y - 0.3, w: 0.8, h: 0.8,
      fill: { type: 'solid', color: theme.primary },
    });
    
    // العنوان
    slideScopes.addText(scope.title, {
      x: x + 0.1, y: y + 0.6, w: cardWidth - 0.2, h: 0.5,
      fontSize: 14, color: theme.primary, bold: true,
      align: 'center', rtlMode: true, lang: 'ar-SA',
    });
    
    // القيمة
    slideScopes.addText(scope.value, {
      x: x + 0.1, y: y + 1.2, w: cardWidth - 0.2, h: 0.6,
      fontSize: 12, color: theme.dark,
      align: 'center', rtlMode: true, lang: 'ar-SA',
    });
  });

  // ========== الشريحة 9: الأثر المتوقع ==========
  if (approvedSections.has('impact')) {
    const slideImpact = pptx.addSlide();
    
    // خلفية بيضاء
    slideImpact.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { type: 'solid', color: 'FFFFFF' },
    });
    
    // موجة ملونة في الأعلى
    addWaveTop(slideImpact, theme.primary, 1);
    
    // عنوان
    slideImpact.addText('الأثر المتوقع والنتائج', {
      x: 0.5, y: 0.2, w: 9, h: 0.7,
      fontSize: 28, color: 'FFFFFF', bold: true,
      align: 'right', rtlMode: true, lang: 'ar-SA',
    });
    
    // المحتوى
    let impactContent = marketingContent.impact || '';
    
    if (marketingContent.shortTermResults?.length) {
      impactContent += '\n\nالنتائج قصيرة المدى:\n' + marketingContent.shortTermResults.map(r => `• ${r}`).join('\n');
    }
    
    if (marketingContent.longTermResults?.length) {
      impactContent += '\n\nالنتائج طويلة المدى:\n' + marketingContent.longTermResults.map(r => `• ${r}`).join('\n');
    }
    
    slideImpact.addText(impactContent, {
      x: 0.5, y: 1.3, w: 9, h: 4,
      fontSize: 12, color: theme.dark,
      align: 'right', valign: 'top',
      rtlMode: true, lang: 'ar-SA',
    });
  }

  // ========== الشريحة 10: الميزانية ==========
  if (approvedSections.has('budget')) {
    const slideBudget = pptx.addSlide();
    
    // خلفية
    slideBudget.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { type: 'solid', color: theme.light },
    });
    
    // موجة ملونة في الأسفل
    addWaveBottom(slideBudget, theme.primary, 4.5, 1);
    
    // عنوان
    slideBudget.addText('الميزانية والتمويل المطلوب', {
      x: 0.5, y: 0.3, w: 9, h: 0.7,
      fontSize: 28, color: theme.primary, bold: true,
      align: 'right', rtlMode: true, lang: 'ar-SA',
    });
    
    // خط تحت العنوان
    slideBudget.addShape('rect', {
      x: 5, y: 0.95, w: 4.5, h: 0.05,
      fill: { type: 'solid', color: theme.accent },
    });
    
    // رسم بياني للميزانية
    if (marketingContent.budgetBreakdown?.length) {
      const chartData = marketingContent.budgetBreakdown.map(item => ({
        name: item.category,
        labels: [item.category],
        values: [item.percentage],
      }));

      slideBudget.addChart('pie', chartData, {
        x: 0.5, y: 1.2, w: 4, h: 3,
        showPercent: true,
        showLegend: true,
        legendPos: 'b',
      });
    }
    
    // إجمالي الميزانية
    if (marketingContent.totalBudget) {
      addContentCard(slideBudget, {
        x: 5, y: 2, w: 4.5, h: 1.5,
        bgColor: theme.primary,
      });
      
      slideBudget.addText('إجمالي التمويل المطلوب', {
        x: 5.2, y: 2.2, w: 4.1, h: 0.5,
        fontSize: 14, color: 'FFFFFF',
        align: 'center', rtlMode: true, lang: 'ar-SA',
      });
      
      slideBudget.addText(`${marketingContent.totalBudget} ريال`, {
        x: 5.2, y: 2.7, w: 4.1, h: 0.6,
        fontSize: 24, color: theme.accent, bold: true,
        align: 'center', rtlMode: true, lang: 'ar-SA',
      });
    }
  }

  // ========== الشريحة 11: الشراكات ==========
  if (approvedSections.has('partnerships')) {
    const slidePartners = pptx.addSlide();
    
    // خلفية بيضاء
    slidePartners.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { type: 'solid', color: 'FFFFFF' },
    });
    
    // موجة ملونة في الأعلى
    addWaveTop(slidePartners, theme.primary, 1);
    
    // عنوان
    slidePartners.addText('فرص الشراكة والتعاون', {
      x: 0.5, y: 0.2, w: 9, h: 0.7,
      fontSize: 28, color: 'FFFFFF', bold: true,
      align: 'right', rtlMode: true, lang: 'ar-SA',
    });
    
    // المحتوى
    let partnerContent = marketingContent.partnerships || '';
    
    if (marketingContent.partnershipBenefits?.length) {
      partnerContent += '\n\nمزايا الشراكة:\n' + marketingContent.partnershipBenefits.map(b => `✓ ${b}`).join('\n');
    }
    
    slidePartners.addText(partnerContent, {
      x: 0.5, y: 1.3, w: 9, h: 4,
      fontSize: 12, color: theme.dark,
      align: 'right', valign: 'top',
      rtlMode: true, lang: 'ar-SA',
    });
  }

  // ========== الشريحة 12: الجدول الزمني ==========
  if (approvedSections.has('timeline') && marketingContent.timelinePhases?.length) {
    const slideTimeline = pptx.addSlide();
    
    // خلفية
    slideTimeline.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { type: 'solid', color: theme.light },
    });
    
    // عنوان
    slideTimeline.addText('الجدول الزمني للتنفيذ', {
      x: 0.5, y: 0.3, w: 9, h: 0.7,
      fontSize: 28, color: theme.primary, bold: true,
      align: 'right', rtlMode: true, lang: 'ar-SA',
    });
    
    // جدول المراحل
    const tableData: any[][] = [
      [
        { text: 'المرحلة', options: { bold: true, fill: theme.primary, color: 'FFFFFF' } },
        { text: 'المدة', options: { bold: true, fill: theme.primary, color: 'FFFFFF' } },
        { text: 'الأنشطة', options: { bold: true, fill: theme.primary, color: 'FFFFFF' } },
      ],
    ];

    marketingContent.timelinePhases.forEach((phase, i) => {
      tableData.push([
        { text: phase.phase, options: { fill: i % 2 === 0 ? 'FFFFFF' : theme.light } },
        { text: phase.duration, options: { fill: i % 2 === 0 ? 'FFFFFF' : theme.light } },
        { text: phase.activities, options: { fill: i % 2 === 0 ? 'FFFFFF' : theme.light } },
      ]);
    });

    slideTimeline.addTable(tableData, {
      x: 0.5, y: 1.2, w: 9,
      colW: [2.5, 1.5, 5],
      fontSize: 11,
      border: { pt: 0.5, color: theme.primary },
      align: 'right',
    });
  }

  // ========== الشريحة 13: التواصل ==========
  if (approvedSections.has('contact')) {
    const slideContact = pptx.addSlide();
    
    // خلفية ملونة
    slideContact.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { type: 'solid', color: theme.primary },
    });
    
    // موجة بيضاء في الأعلى
    slideContact.addShape('ellipse', {
      x: -2, y: -0.5, w: 14, h: 1.5,
      fill: { type: 'solid', color: 'FFFFFF' },
    });
    
    // عنوان الشكر
    slideContact.addText('شكراً لاهتمامكم', {
      x: 0.5, y: 1.5, w: 9, h: 1,
      fontSize: 40, color: 'FFFFFF', bold: true,
      align: 'center', rtlMode: true, lang: 'ar-SA',
    });
    
    // رسالة التواصل
    slideContact.addText('نرحب بتواصلكم للاستفسار أو المشاركة في دعم هذا البرنامج', {
      x: 0.5, y: 2.8, w: 9, h: 0.8,
      fontSize: 18, color: 'FFFFFF',
      align: 'center', rtlMode: true, lang: 'ar-SA',
    });
    
    // اسم المؤسسة
    if (orgName) {
      slideContact.addText(orgName, {
        x: 0.5, y: 4, w: 9, h: 0.6,
        fontSize: 20, color: theme.accent, bold: true,
        align: 'center', rtlMode: true, lang: 'ar-SA',
      });
    }
    
    // عناصر زخرفية
    slideContact.addShape('ellipse', {
      x: 0.5, y: 4.5, w: 0.5, h: 0.5,
      fill: { type: 'solid', color: 'FFFFFF', alpha: 20 },
    });
    slideContact.addShape('ellipse', {
      x: 9, y: 4.5, w: 0.5, h: 0.5,
      fill: { type: 'solid', color: 'FFFFFF', alpha: 20 },
    });
  }

  // حفظ الملف
  await pptx.writeFile({ fileName: `${programName.slice(0, 30)}_donor_proposal.pptx` });
}
