/**
 * مولد المحتوى التسويقي الذكي للجهات المانحة
 * يعتمد على بيانات الفكرة المتوفرة لتوليد محتوى تسويقي احترافي ومقنع
 * بدون الحاجة لاستدعاء API الذكاء الاصطناعي
 */

interface IdeaData {
  id?: number;
  programDescription?: string | null;
  vision?: string | null;
  generalObjective?: string | null;
  detailedObjectives?: string | null;
  targetAudience?: string | null;
  targetCount?: string | null;
  duration?: string | null;
  features?: string | null;
  expectedResults?: string | null;
  risks?: string | null;
  selectedName?: string | null;
  proposedNames?: string | string[] | null;
}

interface MarketingContent {
  summary: string;
  impact: string;
  shortTermResults: string[];
  longTermResults: string[];
  budget: string;
  budgetBreakdown: { category: string; percentage: number }[];
  totalBudget: string;
  partnerships: string;
  partnershipBenefits: string[];
  timelinePhases: { phase: string; duration: string; activities: string }[];
  stats: {
    objectives: number;
    beneficiaries: string;
    budget: string;
    duration: string;
  };
  uniqueSellingPoints: string[];
  socialImpact: string;
  sustainability: string;
  callToAction: string;
}

// قوالب النصوص التسويقية المقنعة
const marketingTemplates = {
  summaryIntros: [
    "يسعدنا أن نقدم لكم مبادرة فريدة من نوعها تهدف إلى",
    "نضع بين أيديكم برنامجاً مبتكراً يسعى لتحقيق",
    "في إطار سعينا لخدمة المجتمع، نقدم لكم مشروعاً رائداً يركز على",
    "انطلاقاً من إيماننا بأهمية التنمية المستدامة، نطرح برنامجاً متكاملاً يستهدف",
  ],
  impactPhrases: [
    "سيحدث هذا البرنامج تغييراً جذرياً في",
    "من المتوقع أن يساهم البرنامج في تحسين",
    "سيترك البرنامج أثراً إيجابياً ملموساً على",
    "يهدف البرنامج لإحداث نقلة نوعية في",
  ],
  partnershipBenefits: [
    "الظهور كشريك استراتيجي في مبادرة تنموية رائدة",
    "تعزيز المسؤولية الاجتماعية للمؤسسة",
    "الوصول لشريحة واسعة من المستفيدين والمجتمع",
    "المساهمة في تحقيق أهداف التنمية المستدامة",
    "الحصول على تقارير دورية شفافة عن الأثر والإنجازات",
    "فرصة للمشاركة في فعاليات وأنشطة البرنامج",
    "الاعتراف والتقدير في جميع المواد الإعلامية",
    "بناء علاقات مع قادة المجتمع والمؤثرين",
  ],
  sustainabilityPhrases: [
    "تم تصميم البرنامج ليكون مستداماً من خلال",
    "نضمن استمرارية الأثر عبر",
    "يتضمن البرنامج آليات للاستدامة تشمل",
  ],
  callToActions: [
    "ندعوكم للمشاركة في هذه الرحلة التنموية المميزة",
    "كونوا شركاء في صناعة التغيير الإيجابي",
    "انضموا إلينا لنحقق معاً أثراً يدوم",
    "ساهموا في بناء مستقبل أفضل لمجتمعنا",
  ],
};

// استخراج الأهداف من النص
function extractObjectives(text: string): string[] {
  if (!text) return [];
  
  // محاولة استخراج الأهداف المرقمة
  const numberedPattern = /\d+[\.:\-\)]\s*([^\n\d]+)/g;
  const matches: string[] = [];
  let match;
  while ((match = numberedPattern.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  
  if (matches.length > 0) {
    return matches.filter(o => o.length > 10);
  }
  
  // محاولة استخراج من النقاط
  const bulletPattern = /[•\-\*]\s*([^\n•\-\*]+)/g;
  const bulletMatches: string[] = [];
  while ((match = bulletPattern.exec(text)) !== null) {
    bulletMatches.push(match[1].trim());
  }
  
  if (bulletMatches.length > 0) {
    return bulletMatches.filter(o => o.length > 10);
  }
  
  // تقسيم على الفواصل أو النقاط
  return text.split(/[،,\.]/g)
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.length < 200);
}

// استخراج الأرقام من النص
function extractNumber(text: string): number {
  if (!text) return 0;
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// تقدير الميزانية بناءً على المدة والعدد المستهدف
function estimateBudget(duration: string, targetCount: string): number {
  const months = extractNumber(duration) || 12;
  const count = extractNumber(targetCount) || 100;
  
  // تقدير تقريبي: 500 ريال لكل مستفيد + 5000 ريال شهرياً للتشغيل
  const perBeneficiary = 500;
  const monthlyOperations = 5000;
  
  return (count * perBeneficiary) + (months * monthlyOperations);
}

// توليد المحتوى التسويقي
export function generateMarketingContent(ideaData: IdeaData): MarketingContent {
  const programName = ideaData.selectedName || ideaData.programDescription?.slice(0, 50) || "البرنامج";
  const targetCount = ideaData.targetCount || "100";
  const duration = ideaData.duration || "12 شهر";
  const estimatedBudget = estimateBudget(duration, targetCount);
  
  // استخراج الأهداف
  const objectives = extractObjectives(ideaData.detailedObjectives || ideaData.generalObjective || "");
  const objectivesCount = Math.max(objectives.length, 3);
  
  // استخراج النتائج المتوقعة
  const expectedResultsList = extractObjectives(ideaData.expectedResults || "");
  
  // استخراج المميزات
  const featuresList = extractObjectives(ideaData.features || "");
  
  // توليد الملخص التنفيذي
  const summaryIntro = marketingTemplates.summaryIntros[Math.floor(Math.random() * marketingTemplates.summaryIntros.length)];
  const summary = `${summaryIntro} ${ideaData.programDescription || "تحقيق التنمية المستدامة"}.

${ideaData.vision ? `رؤيتنا: ${ideaData.vision}` : ""}

يستهدف البرنامج ${ideaData.targetAudience || "شريحة واسعة من المجتمع"} بعدد يصل إلى ${targetCount} مستفيد خلال فترة ${duration}.

${ideaData.generalObjective ? `الهدف العام: ${ideaData.generalObjective}` : ""}

يتميز البرنامج بمنهجية علمية مدروسة وفريق عمل متخصص، مما يضمن تحقيق الأهداف المرجوة بكفاءة عالية وأثر مستدام.`;

  // توليد قسم الأثر
  const impactPhrase = marketingTemplates.impactPhrases[Math.floor(Math.random() * marketingTemplates.impactPhrases.length)];
  const impact = `${impactPhrase} حياة ${ideaData.targetAudience || "المستفيدين"}.

${ideaData.expectedResults || "سيحقق البرنامج نتائج ملموسة تشمل تحسين جودة الحياة وتعزيز القدرات وبناء المهارات اللازمة للنجاح."}

نؤمن بأن الاستثمار في هذا البرنامج سيحقق عائداً اجتماعياً مضاعفاً، حيث سينعكس الأثر الإيجابي على المستفيدين وأسرهم ومجتمعاتهم.`;

  // توليد النتائج قصيرة المدى
  const shortTermResults = expectedResultsList.length > 0 
    ? expectedResultsList.slice(0, 4)
    : [
        "تحسين الوعي والمعرفة لدى المستفيدين",
        "بناء القدرات والمهارات الأساسية",
        "إشراك المجتمع وتعزيز المشاركة الفاعلة",
        "تحقيق نتائج أولية قابلة للقياس",
      ];

  // توليد النتائج طويلة المدى
  const longTermResults = [
    "استدامة الأثر وتعميمه على نطاق أوسع",
    "التوسع والانتشار في مناطق جديدة",
    "إحداث تغيير مجتمعي إيجابي ودائم",
    "بناء نموذج قابل للتكرار والتطوير",
  ];

  // توليد قسم الميزانية
  const budget = `تم إعداد ميزانية البرنامج بعناية لضمان تحقيق أقصى أثر بأعلى كفاءة ممكنة. نلتزم بالشفافية الكاملة في استخدام الموارد وتقديم تقارير مالية دورية لجميع الشركاء والداعمين.

يشمل التمويل المطلوب جميع التكاليف التشغيلية والإدارية والبرامجية، مع تخصيص نسبة للطوارئ والتطوير المستمر.`;

  // توزيع الميزانية
  const budgetBreakdown = [
    { category: "الموارد البشرية والكوادر", percentage: 40 },
    { category: "التشغيل والأنشطة", percentage: 30 },
    { category: "المواد والمستلزمات", percentage: 15 },
    { category: "الإدارة والمتابعة", percentage: 15 },
  ];

  // توليد قسم الشراكات
  const partnerships = `نؤمن بأن الشراكة الفاعلة هي أساس نجاح أي مبادرة تنموية. نسعى لبناء علاقات استراتيجية مع الجهات المانحة والداعمة تقوم على الشفافية والمصداقية والالتزام بتحقيق الأهداف المشتركة.

نقدم لشركائنا فرصة حقيقية للمساهمة في صناعة التغيير الإيجابي، مع ضمان الاعتراف والتقدير لدورهم الريادي في دعم المبادرات التنموية.`;

  // مزايا الشراكة
  const partnershipBenefits = marketingTemplates.partnershipBenefits.slice(0, 6);

  // مراحل التنفيذ
  const durationMonths = extractNumber(duration) || 12;
  const timelinePhases = [
    {
      phase: "مرحلة التأسيس والإعداد",
      duration: `${Math.ceil(durationMonths * 0.15)} شهر`,
      activities: "التخطيط التفصيلي، بناء الفريق، إعداد المواد، التنسيق مع الشركاء",
    },
    {
      phase: "مرحلة التنفيذ الأولى",
      duration: `${Math.ceil(durationMonths * 0.35)} شهر`,
      activities: "إطلاق الأنشطة الرئيسية، استقطاب المستفيدين، بدء البرامج التدريبية",
    },
    {
      phase: "مرحلة التنفيذ الثانية",
      duration: `${Math.ceil(durationMonths * 0.35)} شهر`,
      activities: "توسيع نطاق الخدمات، تكثيف الأنشطة، المتابعة والتقييم المرحلي",
    },
    {
      phase: "مرحلة الإغلاق والتقييم",
      duration: `${Math.ceil(durationMonths * 0.15)} شهر`,
      activities: "التقييم النهائي، توثيق الدروس المستفادة، إعداد التقارير الختامية",
    },
  ];

  // الإحصائيات
  const stats = {
    objectives: objectivesCount,
    beneficiaries: targetCount,
    budget: estimatedBudget.toLocaleString('ar-SA'),
    duration: duration,
  };

  // نقاط البيع الفريدة
  const uniqueSellingPoints = featuresList.length > 0 
    ? featuresList.slice(0, 5)
    : [
        "منهجية علمية مدروسة ومجربة",
        "فريق عمل متخصص وذو خبرة",
        "شراكات استراتيجية مع جهات رائدة",
        "نظام متابعة وتقييم متطور",
        "التزام بالشفافية والمساءلة",
      ];

  // الأثر الاجتماعي
  const socialImpact = `يسعى البرنامج لتحقيق أثر اجتماعي شامل يتجاوز المستفيدين المباشرين ليشمل أسرهم ومجتمعاتهم. نؤمن بأن كل استثمار في هذا البرنامج سيحقق مضاعفات إيجابية تمتد لأجيال قادمة.

من خلال التركيز على ${ideaData.targetAudience || "الفئات المستهدفة"}، نسعى لبناء قدرات مستدامة تمكّن المستفيدين من تحقيق إمكاناتهم الكاملة والمساهمة الفاعلة في تنمية مجتمعاتهم.`;

  // الاستدامة
  const sustainabilityPhrase = marketingTemplates.sustainabilityPhrases[Math.floor(Math.random() * marketingTemplates.sustainabilityPhrases.length)];
  const sustainability = `${sustainabilityPhrase} بناء قدرات محلية، نقل المعرفة، وإنشاء آليات للمتابعة والدعم المستمر.

نعمل على ضمان استمرارية الأثر من خلال:
• تدريب كوادر محلية قادرة على استمرار العمل
• بناء شراكات مجتمعية داعمة
• توثيق أفضل الممارسات والدروس المستفادة
• إنشاء نظام للمتابعة والتقييم طويل المدى`;

  // الدعوة للعمل
  const callToAction = marketingTemplates.callToActions[Math.floor(Math.random() * marketingTemplates.callToActions.length)];

  return {
    summary,
    impact,
    shortTermResults,
    longTermResults,
    budget,
    budgetBreakdown,
    totalBudget: estimatedBudget.toLocaleString('ar-SA'),
    partnerships,
    partnershipBenefits,
    timelinePhases,
    stats,
    uniqueSellingPoints,
    socialImpact,
    sustainability,
    callToAction,
  };
}

export type { IdeaData, MarketingContent };
