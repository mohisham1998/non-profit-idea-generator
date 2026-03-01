interface IdeaData {
  id: number;
  programDescription: string;
  targetAudience?: string | null;
  targetCount?: string | null;
  duration?: string | null;
  vision?: string | null;
  generalObjective?: string | null;
  detailedObjectives?: string | null;
  idea: string;
  objective: string;
  justifications: string;
  features: string;
  strengths: string;
  outputs: string;
  expectedResults: string;
  risks?: string | null;
  createdAt: Date;
}

export const generateIdeaPDF = async (idea: IdeaData): Promise<void> => {
  // استخدام print-js أو طريقة الطباعة المباشرة
  const dateStr = new Date(idea.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>فكرة برنامج - ${idea.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Tajawal', 'Arial', sans-serif;
      direction: rtl;
      text-align: right;
      background: white;
      color: #1f2937;
      line-height: 1.8;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    
    .header {
      background: linear-gradient(135deg, #107c5f 0%, #0d6b52 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 25px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .meta-info {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 25px;
    }
    
    .meta-info .date {
      color: #6b7280;
      font-size: 13px;
      margin-bottom: 10px;
    }
    
    .meta-info .description-label {
      color: #107c5f;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .meta-info .description {
      color: #374151;
      font-size: 15px;
    }
    
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-header {
      padding: 12px 18px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 12px;
    }
    
    .section-content {
      padding: 15px 18px;
      background: #fafafa;
      border-radius: 8px;
      border-right: 4px solid;
      font-size: 14px;
      color: #374151;
    }
    
    .vision .section-header { background: #06b6d4; }
    .vision .section-content { border-color: #06b6d4; }
    
    .general-objective .section-header { background: #f43f5e; }
    .general-objective .section-content { border-color: #f43f5e; }
    
    .detailed-objectives .section-header { background: var(--primary, #0891b2); }
    .detailed-objectives .section-content { border-color: var(--primary, #0891b2); }
    
    .idea .section-header { background: #f59e0b; }
    .idea .section-content { border-color: #f59e0b; }
    
    .objective .section-header { background: #3b82f6; }
    .objective .section-content { border-color: #3b82f6; }
    
    .justifications .section-header { background: #8b5cf6; }
    .justifications .section-content { border-color: #8b5cf6; }
    
    .features .section-header { background: #eab308; }
    .features .section-content { border-color: #eab308; }
    
    .strengths .section-header { background: #22c55e; }
    .strengths .section-content { border-color: #22c55e; }
    
    .outputs .section-header { background: #6366f1; }
    .outputs .section-content { border-color: #6366f1; }
    
    .expected-results .section-header { background: #14b8a6; }
    .expected-results .section-content { border-color: #14b8a6; }
    
    .risks .section-header { background: #ef4444; }
    .risks .section-content { border-color: #ef4444; }
    
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #107c5f;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      .header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>مُولّد أفكار البرامج والمبادرات</h1>
      <p>للمنظمات غير الربحية</p>
    </div>
    
    <div class="meta-info">
      <div class="date">تاريخ الإنشاء: ${dateStr}</div>
      <div class="description-label">وصف البرنامج أو المبادرة:</div>
      <div class="description">${idea.programDescription}</div>
    </div>
    
    ${idea.vision ? `
    <div class="section vision">
      <div class="section-header">الرؤية</div>
      <div class="section-content">${idea.vision}</div>
    </div>
    ` : ''}
    
    ${idea.generalObjective ? `
    <div class="section general-objective">
      <div class="section-header">الهدف العام</div>
      <div class="section-content">${idea.generalObjective}</div>
    </div>
    ` : ''}
    
    ${idea.detailedObjectives ? `
    <div class="section detailed-objectives">
      <div class="section-header">الأهداف التفصيلية</div>
      <div class="section-content">${idea.detailedObjectives}</div>
    </div>
    ` : ''}
    
    <div class="section idea">
      <div class="section-header">الفكرة</div>
      <div class="section-content">${idea.idea}</div>
    </div>
    
    <div class="section objective">
      <div class="section-header">الهدف</div>
      <div class="section-content">${idea.objective}</div>
    </div>
    
    <div class="section justifications">
      <div class="section-header">مبررات البرنامج</div>
      <div class="section-content">${idea.justifications}</div>
    </div>
    
    <div class="section features">
      <div class="section-header">المميزات</div>
      <div class="section-content">${idea.features}</div>
    </div>
    
    <div class="section strengths">
      <div class="section-header">نقاط القوة</div>
      <div class="section-content">${idea.strengths}</div>
    </div>
    
    <div class="section outputs">
      <div class="section-header">المخرجات</div>
      <div class="section-content">${idea.outputs}</div>
    </div>
    
    <div class="section expected-results">
      <div class="section-header">النتائج المتوقعة</div>
      <div class="section-content">${idea.expectedResults}</div>
    </div>
    
    ${idea.risks ? `
    <div class="section risks">
      <div class="section-header">المخاطر</div>
      <div class="section-content">${idea.risks}</div>
    </div>
    ` : ''}
    
    <div class="footer">
      تم إنشاء هذا المستند بواسطة مُولّد أفكار البرامج والمبادرات
    </div>
  </div>
  
  <script>
    // طباعة تلقائية عند فتح الصفحة
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;

  // فتح نافذة جديدة وطباعتها كـ PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    throw new Error('لم يتم فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
  }
};

export default generateIdeaPDF;
