import { jsPDF } from 'jspdf';

// تحميل الخط العربي
const loadArabicFont = async (doc: jsPDF) => {
  // استخدام خط Amiri العربي
  const fontUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/amiri@4.5.9/files/amiri-arabic-400-normal.woff';
  try {
    const response = await fetch(fontUrl);
    const fontData = await response.arrayBuffer();
    const uint8Array = new Uint8Array(fontData);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Font = btoa(binary);
    doc.addFileToVFS('Amiri-Regular.ttf', base64Font);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.setFont('Amiri');
  } catch (error) {
    console.warn('Failed to load Arabic font, using default');
  }
};

// دالة مساعدة لكتابة نص عربي
const writeArabicText = (doc: jsPDF, text: string, x: number, y: number, options?: { align?: 'right' | 'left' | 'center', maxWidth?: number }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const actualX = options?.align === 'right' ? pageWidth - x : x;
  doc.text(text, actualX, y, { align: options?.align || 'right', maxWidth: options?.maxWidth });
};

// دالة مساعدة لرسم خط
const drawLine = (doc: jsPDF, y: number, color: string = '#10b981') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(color);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
};

// تصدير PMDpro إلى PDF
export const exportPMDProToPDF = async (pmdproData: any, ideaTitle: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  await loadArabicFont(doc);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  // العنوان الرئيسي
  doc.setFillColor('#10b981');
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(24);
  writeArabicText(doc, 'منهجية PMDpro', pageWidth - 20, 25, { align: 'right' });
  
  doc.setFontSize(12);
  writeArabicText(doc, ideaTitle, pageWidth - 20, 35, { align: 'right' });
  
  y = 55;
  doc.setTextColor('#1f2937');

  // المراحل
  if (pmdproData.phases) {
    for (const phase of pmdproData.phases) {
      // التحقق من الحاجة لصفحة جديدة
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 20;
      }

      // عنوان المرحلة
      doc.setFillColor('#f0fdf4');
      doc.roundedRect(15, y - 5, pageWidth - 30, 15, 3, 3, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor('#047857');
      writeArabicText(doc, phase.name, pageWidth - 20, y + 5, { align: 'right' });
      y += 20;

      // الوصف
      if (phase.description) {
        doc.setFontSize(11);
        doc.setTextColor('#374151');
        const lines = doc.splitTextToSize(phase.description, pageWidth - 40);
        for (const line of lines) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          writeArabicText(doc, line, pageWidth - 20, y, { align: 'right' });
          y += 6;
        }
        y += 5;
      }

      // الأنشطة
      if (phase.activities && phase.activities.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor('#059669');
        writeArabicText(doc, 'الأنشطة:', pageWidth - 25, y, { align: 'right' });
        y += 8;

        doc.setFontSize(10);
        doc.setTextColor('#4b5563');
        for (const activity of phase.activities) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          writeArabicText(doc, `• ${activity}`, pageWidth - 30, y, { align: 'right' });
          y += 6;
        }
        y += 5;
      }

      // المخرجات
      if (phase.outputs && phase.outputs.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor('#059669');
        writeArabicText(doc, 'المخرجات:', pageWidth - 25, y, { align: 'right' });
        y += 8;

        doc.setFontSize(10);
        doc.setTextColor('#4b5563');
        for (const output of phase.outputs) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
          }
          writeArabicText(doc, `• ${output}`, pageWidth - 30, y, { align: 'right' });
          y += 6;
        }
        y += 5;
      }

      drawLine(doc, y);
      y += 10;
    }
  }

  // التاريخ
  doc.setFontSize(8);
  doc.setTextColor('#9ca3af');
  writeArabicText(doc, `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`, pageWidth - 20, pageHeight - 10, { align: 'right' });

  doc.save(`PMDpro_${ideaTitle.substring(0, 20)}.pdf`);
};

// تصدير مخطط غانت إلى PDF
export const exportGanttToPDF = async (timelineData: any, ideaTitle: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  await loadArabicFont(doc);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  // العنوان الرئيسي
  doc.setFillColor('#f59e0b');
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(20);
  writeArabicText(doc, 'مخطط غانت - الجدول الزمني', pageWidth - 20, 20, { align: 'right' });
  
  y = 45;
  doc.setTextColor('#1f2937');

  if (timelineData.phases) {
    // رسم الجدول
    const startX = 20;
    const tableWidth = pageWidth - 40;
    const rowHeight = 12;
    const colWidths = [60, 40, 40, tableWidth - 140]; // المرحلة، البداية، النهاية، الأنشطة

    // رأس الجدول
    doc.setFillColor('#fef3c7');
    doc.rect(startX, y, tableWidth, rowHeight, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor('#92400e');
    writeArabicText(doc, 'المرحلة', startX + colWidths[0] - 5, y + 8, { align: 'right' });
    writeArabicText(doc, 'البداية', startX + colWidths[0] + colWidths[1] - 5, y + 8, { align: 'right' });
    writeArabicText(doc, 'النهاية', startX + colWidths[0] + colWidths[1] + colWidths[2] - 5, y + 8, { align: 'right' });
    writeArabicText(doc, 'الأنشطة الرئيسية', startX + tableWidth - 5, y + 8, { align: 'right' });
    
    y += rowHeight;

    // صفوف البيانات
    doc.setTextColor('#374151');
    for (let i = 0; i < timelineData.phases.length; i++) {
      const phase = timelineData.phases[i];
      
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }

      // خلفية الصف
      doc.setFillColor(i % 2 === 0 ? '#ffffff' : '#f9fafb');
      doc.rect(startX, y, tableWidth, rowHeight, 'F');
      
      // حدود الصف
      doc.setDrawColor('#e5e7eb');
      doc.rect(startX, y, tableWidth, rowHeight, 'S');

      doc.setFontSize(9);
      writeArabicText(doc, phase.name || '', startX + colWidths[0] - 5, y + 8, { align: 'right' });
      writeArabicText(doc, phase.startDate || '', startX + colWidths[0] + colWidths[1] - 5, y + 8, { align: 'right' });
      writeArabicText(doc, phase.endDate || '', startX + colWidths[0] + colWidths[1] + colWidths[2] - 5, y + 8, { align: 'right' });
      
      // الأنشطة (مختصرة)
      const activities = phase.activities?.slice(0, 2).join('، ') || '';
      writeArabicText(doc, activities.substring(0, 50) + (activities.length > 50 ? '...' : ''), startX + tableWidth - 5, y + 8, { align: 'right' });
      
      y += rowHeight;
    }
  }

  // التاريخ
  doc.setFontSize(8);
  doc.setTextColor('#9ca3af');
  writeArabicText(doc, `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`, pageWidth - 20, pageHeight - 10, { align: 'right' });

  doc.save(`Gantt_${ideaTitle.substring(0, 20)}.pdf`);
};

// تصدير التفكير التصميمي إلى PDF
export const exportDesignThinkingToPDF = async (designThinkingData: any, ideaTitle: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  await loadArabicFont(doc);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  // العنوان الرئيسي
  doc.setFillColor('#ec4899');
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(24);
  writeArabicText(doc, 'التفكير التصميمي', pageWidth - 20, 25, { align: 'right' });
  
  doc.setFontSize(12);
  writeArabicText(doc, ideaTitle, pageWidth - 20, 35, { align: 'right' });
  
  y = 55;
  doc.setTextColor('#1f2937');

  const stages = [
    { key: 'empathize', title: 'التعاطف', color: '#f472b6', bgColor: '#fdf2f8' },
    { key: 'define', title: 'التعريف', color: '#a855f7', bgColor: '#faf5ff' },
    { key: 'ideate', title: 'التفكير', color: '#3b82f6', bgColor: '#eff6ff' },
    { key: 'prototype', title: 'النموذج الأولي', color: '#22c55e', bgColor: '#f0fdf4' },
    { key: 'test', title: 'الاختبار', color: '#f59e0b', bgColor: '#fffbeb' }
  ];

  for (const stage of stages) {
    const stageData = designThinkingData[stage.key];
    if (!stageData) continue;

    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }

    // عنوان المرحلة
    doc.setFillColor(stage.bgColor);
    doc.roundedRect(15, y - 5, pageWidth - 30, 15, 3, 3, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(stage.color);
    writeArabicText(doc, stage.title, pageWidth - 20, y + 5, { align: 'right' });
    y += 20;

    // المحتوى
    doc.setFontSize(10);
    doc.setTextColor('#374151');

    if (stageData.description) {
      const lines = doc.splitTextToSize(stageData.description, pageWidth - 40);
      for (const line of lines) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        writeArabicText(doc, line, pageWidth - 20, y, { align: 'right' });
        y += 6;
      }
      y += 5;
    }

    if (stageData.activities && stageData.activities.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(stage.color);
      writeArabicText(doc, 'الأنشطة:', pageWidth - 25, y, { align: 'right' });
      y += 7;

      doc.setFontSize(9);
      doc.setTextColor('#4b5563');
      for (const activity of stageData.activities) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        writeArabicText(doc, `• ${activity}`, pageWidth - 30, y, { align: 'right' });
        y += 5;
      }
      y += 5;
    }

    if (stageData.outputs && stageData.outputs.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(stage.color);
      writeArabicText(doc, 'المخرجات:', pageWidth - 25, y, { align: 'right' });
      y += 7;

      doc.setFontSize(9);
      doc.setTextColor('#4b5563');
      for (const output of stageData.outputs) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        writeArabicText(doc, `• ${output}`, pageWidth - 30, y, { align: 'right' });
        y += 5;
      }
      y += 5;
    }

    y += 10;
  }

  // التاريخ
  doc.setFontSize(8);
  doc.setTextColor('#9ca3af');
  writeArabicText(doc, `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`, pageWidth - 20, pageHeight - 10, { align: 'right' });

  doc.save(`DesignThinking_${ideaTitle.substring(0, 20)}.pdf`);
};
