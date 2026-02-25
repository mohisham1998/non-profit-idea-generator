import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  ShadingType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  ImageRun,
  TableOfContents,
  StyleLevel,
  convertInchesToTwip,
  PageNumber,
  NumberFormat
} from 'docx';
import { saveAs } from 'file-saver';

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
  primary: string;
  secondary: string;
  accent: string;
  light: string;
  dark: string;
}> = {
  classic: {
    primary: '1a365d',
    secondary: '2d4a6f',
    accent: 'd4af37',
    light: 'f7fafc',
    dark: '1a202c',
  },
  modern: {
    primary: '7c3aed',
    secondary: '8b5cf6',
    accent: 'f59e0b',
    light: 'faf5ff',
    dark: '1f2937',
  },
  formal: {
    primary: '064e3b',
    secondary: '047857',
    accent: 'ca8a04',
    light: 'f0fdf4',
    dark: '1f2937',
  },
  creative: {
    primary: 'db2777',
    secondary: 'ec4899',
    accent: '0ea5e9',
    light: 'fdf2f8',
    dark: '1f2937',
  },
};

// تحويل صورة URL إلى base64
async function urlToBase64(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
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

export async function exportProfessionalWord(options: ExportOptions): Promise<void> {
  const { approvedSections, marketingContent, ideaData, organizationInfo, templateId = 'modern' } = options;
  const programName = ideaData.programDescription?.slice(0, 60) || 'البرنامج';
  const orgName = organizationInfo?.name || '';
  const logoUrl = organizationInfo?.logo;
  const theme = templateThemes[templateId];
  const currentYear = new Date().getFullYear();

  const children: any[] = [];

  // ========== صفحة الغلاف ==========
  
  // مسافة علوية
  children.push(
    new Paragraph({
      spacing: { before: 2000 },
      children: [],
    })
  );

  // اسم المؤسسة
  if (orgName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: orgName,
            bold: true,
            size: 36,
            color: theme.primary,
          }),
        ],
      })
    );
  }

  // خط فاصل زخرفي
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      border: {
        bottom: {
          color: theme.accent,
          size: 20,
          style: BorderStyle.SINGLE,
        },
      },
      children: [],
    })
  );

  // كلمة "مبادرة"
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
      children: [
        new TextRun({
          text: 'مبادرة',
          size: 32,
          color: theme.secondary,
        }),
      ],
    })
  );

  // اسم البرنامج
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: programName,
          bold: true,
          size: 56,
          color: theme.primary,
        }),
      ],
    })
  );

  // العنوان الفرعي
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 800 },
      children: [
        new TextRun({
          text: 'مقترح تمويل للجهات المانحة والداعمة',
          size: 28,
          color: theme.accent,
          italics: true,
        }),
      ],
    })
  );

  // السنة
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1500 },
      children: [
        new TextRun({
          text: currentYear.toString(),
          size: 36,
          color: theme.secondary,
          bold: true,
        }),
      ],
    })
  );

  // فاصل صفحة
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ========== صفحة البسملة ==========
  children.push(
    new Paragraph({
      spacing: { before: 4000 },
      children: [],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          size: 48,
          color: theme.primary,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ========== فهرس المحتويات ==========
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: 'فهرس المحتويات',
          bold: true,
          size: 36,
          color: theme.primary,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: {
        bottom: {
          color: theme.accent,
          size: 10,
          style: BorderStyle.SINGLE,
        },
      },
      children: [],
    })
  );

  // قائمة المحتويات يدوية
  const tocItems = [
    { title: 'التمهيد', show: approvedSections.has('summary') },
    { title: 'فكرة المبادرة', show: true },
    { title: 'الرؤية', show: !!ideaData.vision },
    { title: 'الهدف العام', show: !!ideaData.generalObjective },
    { title: 'الأهداف التفصيلية', show: !!ideaData.detailedObjectives?.length },
    { title: 'النطاقات', show: true },
    { title: 'الأثر المتوقع والنتائج', show: approvedSections.has('impact') },
    { title: 'الميزانية والتمويل', show: approvedSections.has('budget') },
    { title: 'فرص الشراكة', show: approvedSections.has('partnerships') },
    { title: 'الجدول الزمني', show: approvedSections.has('timeline') },
    { title: 'التواصل', show: approvedSections.has('contact') },
  ];

  tocItems.filter(item => item.show).forEach((item, index) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 100, after: 100 },
        indent: { right: 400 },
        children: [
          new TextRun({
            text: `${index + 1}. ${item.title}`,
            size: 24,
            color: theme.dark,
          }),
        ],
      })
    );
  });

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ========== دوال مساعدة ==========
  
  // إضافة عنوان قسم
  const addSectionTitle = (title: string, color: string = theme.primary) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 600, after: 200 },
        border: {
          bottom: {
            color: theme.accent,
            size: 15,
            style: BorderStyle.SINGLE,
          },
        },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 36,
            color: color,
          }),
        ],
      })
    );
  };

  // إضافة فقرة نص
  const addParagraph = (text: string, options?: { bold?: boolean; color?: string; size?: number; indent?: boolean }) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 100, after: 200 },
        indent: options?.indent ? { right: 400 } : undefined,
        children: [
          new TextRun({
            text: text,
            bold: options?.bold,
            size: options?.size || 24,
            color: options?.color || theme.dark,
          }),
        ],
      })
    );
  };

  // إضافة قائمة نقطية
  const addBulletList = (items: string[], bulletChar: string = '●') => {
    items.forEach(item => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 50, after: 100 },
          indent: { right: 600 },
          children: [
            new TextRun({
              text: `${bulletChar} ${item}`,
              size: 22,
              color: theme.dark,
            }),
          ],
        })
      );
    });
  };

  // ========== التمهيد ==========
  if (approvedSections.has('summary')) {
    addSectionTitle('التمهيد');
    
    const summaryText = marketingContent.summary || ideaData.programDescription || '';
    addParagraph(summaryText);
    
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ========== فكرة المبادرة ==========
  addSectionTitle('فكرة المبادرة');
  
  const ideaText = ideaData.idea || marketingContent.summary || '';
  addParagraph(ideaText);

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ========== الرؤية ==========
  if (ideaData.vision) {
    addSectionTitle('الرؤية');
    
    // بطاقة الرؤية
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: theme.light, type: ShadingType.CLEAR },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 10, color: theme.primary },
                  bottom: { style: BorderStyle.SINGLE, size: 10, color: theme.primary },
                  left: { style: BorderStyle.SINGLE, size: 10, color: theme.primary },
                  right: { style: BorderStyle.SINGLE, size: 10, color: theme.primary },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 300, after: 300 },
                    children: [
                      new TextRun({
                        text: ideaData.vision,
                        size: 28,
                        color: theme.primary,
                        italics: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ========== الهدف العام ==========
  if (ideaData.generalObjective) {
    addSectionTitle('الهدف العام من المبادرة');
    
    // بطاقة الهدف
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: theme.primary, type: ShadingType.CLEAR },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 300, after: 300 },
                    children: [
                      new TextRun({
                        text: ideaData.generalObjective,
                        size: 26,
                        color: 'FFFFFF',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ========== الأهداف التفصيلية ==========
  if (ideaData.detailedObjectives?.length) {
    addSectionTitle('الأهداف التفصيلية');
    
    ideaData.detailedObjectives.forEach((obj, i) => {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 8, type: WidthType.PERCENTAGE },
                  shading: { fill: theme.primary, type: ShadingType.CLEAR },
                  verticalAlign: 'center',
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: (i + 1).toString(),
                          size: 24,
                          color: 'FFFFFF',
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 92, type: WidthType.PERCENTAGE },
                  shading: { fill: theme.light, type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 100, after: 100 },
                      indent: { right: 200 },
                      children: [
                        new TextRun({
                          text: obj,
                          size: 22,
                          color: theme.dark,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
      
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [],
        })
      );
    });

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ========== النطاقات ==========
  addSectionTitle('النطاقات');
  
  const scopes = [
    { title: 'النطاق الزماني', value: ideaData.duration || marketingContent.stats?.duration || '6 أشهر', icon: '📅' },
    { title: 'النطاق المكاني', value: 'المملكة العربية السعودية', icon: '📍' },
    { title: 'الفئات المستهدفة', value: ideaData.targetAudience || '', icon: '👥' },
    { title: 'العدد المستهدف', value: ideaData.targetCount?.toString() || marketingContent.stats?.beneficiaries || '', icon: '🎯' },
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: scopes.map(scope => 
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              shading: { fill: theme.primary, type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 5, color: 'FFFFFF' },
                bottom: { style: BorderStyle.SINGLE, size: 5, color: 'FFFFFF' },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 150, after: 150 },
                  children: [
                    new TextRun({
                      text: scope.title,
                      size: 22,
                      color: 'FFFFFF',
                      bold: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              shading: { fill: theme.light, type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 5, color: theme.primary },
                bottom: { style: BorderStyle.SINGLE, size: 5, color: theme.primary },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 150, after: 150 },
                  indent: { right: 200 },
                  children: [
                    new TextRun({
                      text: scope.value,
                      size: 22,
                      color: theme.dark,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      ),
    })
  );

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ========== الأثر المتوقع ==========
  if (approvedSections.has('impact')) {
    addSectionTitle('الأثر المتوقع والنتائج');
    
    if (marketingContent.impact) {
      addParagraph(marketingContent.impact);
    }
    
    if (marketingContent.shortTermResults?.length) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: 'النتائج قصيرة المدى:',
              bold: true,
              size: 26,
              color: theme.secondary,
            }),
          ],
        })
      );
      addBulletList(marketingContent.shortTermResults);
    }
    
    if (marketingContent.longTermResults?.length) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: 'النتائج طويلة المدى:',
              bold: true,
              size: 26,
              color: theme.secondary,
            }),
          ],
        })
      );
      addBulletList(marketingContent.longTermResults);
    }

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ========== الميزانية ==========
  if (approvedSections.has('budget')) {
    addSectionTitle('الميزانية والتمويل المطلوب');
    
    if (marketingContent.budget) {
      addParagraph(marketingContent.budget);
    }
    
    if (marketingContent.budgetBreakdown?.length) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // رأس الجدول
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  shading: { fill: theme.primary, type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: 'البند',
                          size: 24,
                          color: 'FFFFFF',
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: theme.primary, type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: 'النسبة',
                          size: 24,
                          color: 'FFFFFF',
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            // صفوف البيانات
            ...marketingContent.budgetBreakdown.map((item, i) =>
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: i % 2 === 0 ? 'FFFFFF' : theme.light, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 80, after: 80 },
                        indent: { right: 200 },
                        children: [
                          new TextRun({
                            text: item.category,
                            size: 22,
                            color: theme.dark,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: i % 2 === 0 ? 'FFFFFF' : theme.light, type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 80, after: 80 },
                        children: [
                          new TextRun({
                            text: `${item.percentage}%`,
                            size: 22,
                            color: theme.dark,
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              })
            ),
          ],
        })
      );
    }
    
    if (marketingContent.totalBudget) {
      children.push(
        new Paragraph({
          spacing: { before: 400 },
          children: [],
        })
      );
      
      children.push(
        new Table({
          width: { size: 60, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: theme.accent, type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200, after: 200 },
                      children: [
                        new TextRun({
                          text: `إجمالي التمويل المطلوب: ${marketingContent.totalBudget} ريال`,
                          size: 28,
                          color: theme.dark,
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ========== الشراكات ==========
  if (approvedSections.has('partnerships')) {
    addSectionTitle('فرص الشراكة والتعاون');
    
    if (marketingContent.partnerships) {
      addParagraph(marketingContent.partnerships);
    }
    
    if (marketingContent.partnershipBenefits?.length) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: 'مزايا الشراكة:',
              bold: true,
              size: 26,
              color: theme.secondary,
            }),
          ],
        })
      );
      addBulletList(marketingContent.partnershipBenefits, '✓');
    }

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ========== الجدول الزمني ==========
  if (approvedSections.has('timeline') && marketingContent.timelinePhases?.length) {
    addSectionTitle('الجدول الزمني للتنفيذ');
    
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // رأس الجدول
          new TableRow({
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { fill: theme.primary, type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 100 },
                    children: [
                      new TextRun({
                        text: 'المرحلة',
                        size: 22,
                        color: 'FFFFFF',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                shading: { fill: theme.primary, type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 100 },
                    children: [
                      new TextRun({
                        text: 'المدة',
                        size: 22,
                        color: 'FFFFFF',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                shading: { fill: theme.primary, type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 100 },
                    children: [
                      new TextRun({
                        text: 'الأنشطة',
                        size: 22,
                        color: 'FFFFFF',
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          // صفوف البيانات
          ...marketingContent.timelinePhases.map((phase, i) =>
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: i % 2 === 0 ? 'FFFFFF' : theme.light, type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 80, after: 80 },
                      children: [
                        new TextRun({
                          text: phase.phase,
                          size: 20,
                          color: theme.dark,
                          bold: true,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  shading: { fill: i % 2 === 0 ? 'FFFFFF' : theme.light, type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 80, after: 80 },
                      children: [
                        new TextRun({
                          text: phase.duration,
                          size: 20,
                          color: theme.dark,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  shading: { fill: i % 2 === 0 ? 'FFFFFF' : theme.light, type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 80, after: 80 },
                      indent: { right: 100 },
                      children: [
                        new TextRun({
                          text: phase.activities,
                          size: 18,
                          color: theme.dark,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          ),
        ],
      })
    );

    children.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // ========== صفحة التواصل ==========
  if (approvedSections.has('contact')) {
    children.push(
      new Paragraph({
        spacing: { before: 3000 },
        children: [],
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: 'شكراً لاهتمامكم',
            bold: true,
            size: 56,
            color: theme.primary,
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        border: {
          bottom: {
            color: theme.accent,
            size: 20,
            style: BorderStyle.SINGLE,
          },
        },
        children: [],
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
        children: [
          new TextRun({
            text: 'نرحب بتواصلكم للاستفسار أو المشاركة في دعم هذا البرنامج',
            size: 28,
            color: theme.secondary,
          }),
        ],
      })
    );

    if (orgName) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          children: [
            new TextRun({
              text: orgName,
              bold: true,
              size: 36,
              color: theme.accent,
            }),
          ],
        })
      );
    }
  }

  // إنشاء المستند
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.8),
            right: convertInchesToTwip(0.8),
            bottom: convertInchesToTwip(0.8),
            left: convertInchesToTwip(0.8),
          },
        },
      },
      children: children,
    }],
  });

  // حفظ الملف
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${programName.slice(0, 30)}_donor_proposal.docx`);
}
