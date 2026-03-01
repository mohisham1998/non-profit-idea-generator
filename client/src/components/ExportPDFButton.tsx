import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import jsPDF from "jspdf";
import "jspdf-rtl-support";

interface ExportPDFButtonProps {
  ideaId: number;
  ideaData?: any;
  kpisData?: any;
  logFrameData?: any;
  timelineData?: any;
  pmdproData?: any;
  designThinkingData?: any;
  evaluationData?: any;
}

export function ExportPDFButton({
  ideaId,
  ideaData,
  kpisData,
  logFrameData,
  timelineData,
  pmdproData,
  designThinkingData,
  evaluationData,
}: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // إعداد الخط العربي
      doc.setFont("Amiri", "normal");
      doc.setR2L(true);

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // دالة لإضافة صفحة جديدة عند الحاجة
      const checkPageBreak = (requiredHeight: number = 30) => {
        if (yPos + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // دالة لإضافة عنوان قسم
      const addSectionTitle = (title: string, color: [number, number, number] = [34, 139, 34]) => {
        checkPageBreak(20);
        doc.setFontSize(16);
        doc.setTextColor(...color);
        doc.text(title, pageWidth - margin, yPos, { align: "right" });
        yPos += 8;
        // خط تحت العنوان
        doc.setDrawColor(...color);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
      };

      // دالة لإضافة عنوان فرعي
      const addSubTitle = (title: string) => {
        checkPageBreak(15);
        doc.setFontSize(13);
        doc.setTextColor(60, 60, 60);
        doc.text(title, pageWidth - margin, yPos, { align: "right" });
        yPos += 7;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
      };

      // دالة لإضافة نص
      const addText = (text: string, indent: number = 0) => {
        if (!text) return;
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        lines.forEach((line: string) => {
          checkPageBreak(7);
          doc.text(line, pageWidth - margin - indent, yPos, { align: "right" });
          yPos += 6;
        });
        yPos += 2;
      };

      // دالة لإضافة قائمة
      const addList = (items: string[], bullet: string = "•") => {
        if (!items || !Array.isArray(items)) return;
        items.forEach((item) => {
          checkPageBreak(7);
          const text = `${bullet} ${item}`;
          const lines = doc.splitTextToSize(text, contentWidth - 10);
          lines.forEach((line: string, idx: number) => {
            doc.text(line, pageWidth - margin - (idx > 0 ? 5 : 0), yPos, { align: "right" });
            yPos += 6;
          });
        });
        yPos += 2;
      };

      // ==================== صفحة الغلاف ====================
      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, pageWidth, 60, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text("تقرير البرنامج الشامل", pageWidth / 2, 35, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      yPos = 80;
      
      if (ideaData?.programDescription) {
        doc.setFontSize(18);
        const titleLines = doc.splitTextToSize(ideaData.programDescription, contentWidth);
        titleLines.forEach((line: string) => {
          doc.text(line, pageWidth / 2, yPos, { align: "center" });
          yPos += 10;
        });
      }
      
      yPos += 20;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}`, pageWidth / 2, yPos, { align: "center" });
      
      // ==================== جدول المحتويات ====================
      doc.addPage();
      yPos = margin;
      addSectionTitle("جدول المحتويات", [0, 100, 0]);
      
      const tocItems = [
        { title: "1. معلومات البرنامج الأساسية", page: 3 },
        { title: "2. الرؤية والأهداف", page: 3 },
        { title: "3. المبررات والمميزات", page: 4 },
        { title: "4. المخرجات والنتائج", page: 4 },
      ];
      
      if (kpisData) tocItems.push({ title: "5. مؤشرات الأداء (KPIs)", page: 5 });
      if (logFrameData) tocItems.push({ title: "6. الإطار المنطقي", page: 6 });
      if (timelineData) tocItems.push({ title: "7. الجدول الزمني", page: 7 });
      if (pmdproData) tocItems.push({ title: "8. منهجية PMDPro", page: 8 });
      if (designThinkingData) tocItems.push({ title: "9. التفكير التصميمي", page: 9 });
      if (evaluationData) tocItems.push({ title: "10. التقييم", page: 10 });
      
      tocItems.forEach((item) => {
        doc.text(item.title, pageWidth - margin, yPos, { align: "right" });
        yPos += 8;
      });

      // ==================== 1. معلومات البرنامج الأساسية ====================
      doc.addPage();
      yPos = margin;
      addSectionTitle("1. معلومات البرنامج الأساسية", [34, 139, 34]);
      
      if (ideaData) {
        addSubTitle("وصف البرنامج");
        addText(ideaData.programDescription);
        
        if (ideaData.targetAudience) {
          addSubTitle("الفئة المستهدفة");
          addText(ideaData.targetAudience);
        }
        
        if (ideaData.targetCount) {
          addSubTitle("العدد المستهدف");
          addText(ideaData.targetCount);
        }
        
        if (ideaData.duration) {
          addSubTitle("المدة الزمنية");
          addText(ideaData.duration);
        }
      }

      // ==================== 2. الرؤية والأهداف ====================
      addSectionTitle("2. الرؤية والأهداف", [0, 128, 128]);
      
      if (ideaData?.vision) {
        addSubTitle("الرؤية");
        addText(ideaData.vision);
      }
      
      if (ideaData?.generalObjective) {
        addSubTitle("الهدف العام");
        addText(ideaData.generalObjective);
      }
      
      if (ideaData?.detailedObjectives) {
        addSubTitle("الأهداف التفصيلية");
        try {
          const objectives = typeof ideaData.detailedObjectives === 'string' 
            ? JSON.parse(ideaData.detailedObjectives) 
            : ideaData.detailedObjectives;
          if (Array.isArray(objectives)) {
            addList(objectives);
          }
        } catch {
          addText(ideaData.detailedObjectives);
        }
      }
      
      if (ideaData?.idea) {
        addSubTitle("الفكرة");
        addText(ideaData.idea);
      }
      
      if (ideaData?.objective) {
        addSubTitle("الهدف");
        addText(ideaData.objective);
      }

      // ==================== 3. المبررات والمميزات ====================
      checkPageBreak(40);
      addSectionTitle("3. المبررات والمميزات", [139, 69, 19]);
      
      if (ideaData?.justifications) {
        addSubTitle("مبررات البرنامج");
        addText(ideaData.justifications);
      }
      
      if (ideaData?.features) {
        addSubTitle("المميزات");
        addText(ideaData.features);
      }
      
      if (ideaData?.strengths) {
        addSubTitle("نقاط القوة");
        addText(ideaData.strengths);
      }

      // ==================== 4. المخرجات والنتائج ====================
      checkPageBreak(40);
      addSectionTitle("4. المخرجات والنتائج", [128, 0, 128]);
      
      if (ideaData?.outputs) {
        addSubTitle("المخرجات");
        addText(ideaData.outputs);
      }
      
      if (ideaData?.expectedResults) {
        addSubTitle("النتائج المتوقعة");
        addText(ideaData.expectedResults);
      }
      
      if (ideaData?.risks) {
        addSubTitle("المخاطر");
        addText(ideaData.risks);
      }

      // ==================== 5. مؤشرات الأداء (KPIs) ====================
      if (kpisData?.kpis && Array.isArray(kpisData.kpis)) {
        doc.addPage();
        yPos = margin;
        addSectionTitle("5. مؤشرات الأداء (KPIs)", [0, 100, 200]);
        
        kpisData.kpis.forEach((kpi: any, index: number) => {
          checkPageBreak(35);
          addSubTitle(`${index + 1}. ${kpi.name}`);
          if (kpi.description) addText(`الوصف: ${kpi.description}`, 5);
          if (kpi.type) addText(`النوع: ${kpi.type}`, 5);
          if (kpi.category) addText(`الفئة: ${kpi.category}`, 5);
          if (kpi.target) addText(`المستهدف: ${kpi.target}`, 5);
          if (kpi.measurementMethod) addText(`طريقة القياس: ${kpi.measurementMethod}`, 5);
          if (kpi.frequency) addText(`دورية القياس: ${kpi.frequency}`, 5);
          yPos += 5;
        });
      }

      // ==================== 6. الإطار المنطقي ====================
      if (logFrameData) {
        doc.addPage();
        yPos = margin;
        addSectionTitle("6. الإطار المنطقي", [139, 0, 0]);
        
        if (logFrameData.goal) {
          addSubTitle("الهدف العام");
          addText(logFrameData.goal.narrative);
          if (logFrameData.goal.indicators?.length) {
            addText("المؤشرات:", 5);
            addList(logFrameData.goal.indicators);
          }
        }
        
        if (logFrameData.purpose) {
          addSubTitle("الغرض");
          addText(logFrameData.purpose.narrative);
        }
        
        if (logFrameData.outputs?.length) {
          addSubTitle("المخرجات");
          logFrameData.outputs.forEach((output: any, idx: number) => {
            addText(`${idx + 1}. ${output.narrative}`, 5);
          });
        }
        
        if (logFrameData.activities?.length) {
          addSubTitle("الأنشطة");
          logFrameData.activities.forEach((activity: any, idx: number) => {
            addText(`${idx + 1}. ${activity.narrative}`, 5);
            if (activity.responsible) addText(`المسؤول: ${activity.responsible}`, 10);
            if (activity.timeframe) addText(`الإطار الزمني: ${activity.timeframe}`, 10);
          });
        }
      }

      // ==================== 7. الجدول الزمني ====================
      if (timelineData?.phases?.length) {
        doc.addPage();
        yPos = margin;
        addSectionTitle("7. الجدول الزمني", [255, 140, 0]);
        
        timelineData.phases.forEach((phase: any, index: number) => {
          checkPageBreak(40);
          addSubTitle(`المرحلة ${index + 1}: ${phase.name}`);
          if (phase.duration) addText(`المدة: ${phase.duration}`, 5);
          if (phase.startWeek && phase.endWeek) {
            addText(`من الأسبوع ${phase.startWeek} إلى ${phase.endWeek}`, 5);
          }
          
          if (phase.activities?.length) {
            addText("الأنشطة:", 5);
            phase.activities.forEach((activity: any) => {
              addText(`• ${activity.name}`, 10);
              if (activity.responsible) addText(`المسؤول: ${activity.responsible}`, 15);
            });
          }
          yPos += 5;
        });
        
        if (timelineData.milestones?.length) {
          addSubTitle("المعالم الرئيسية");
          timelineData.milestones.forEach((milestone: any) => {
            addText(`• ${milestone.name} (الأسبوع ${milestone.week})`, 5);
          });
        }
      }

      // ==================== 8. منهجية PMDPro ====================
      if (pmdproData) {
        doc.addPage();
        yPos = margin;
        addSectionTitle("8. منهجية PMDPro", [75, 0, 130]);
        
        if (pmdproData.projectSummary) {
          addSubTitle("ملخص المشروع");
          if (typeof pmdproData.projectSummary === 'object') {
            if (pmdproData.projectSummary.title) addText(`العنوان: ${pmdproData.projectSummary.title}`, 5);
            if (pmdproData.projectSummary.goal) addText(`الهدف: ${pmdproData.projectSummary.goal}`, 5);
            if (pmdproData.projectSummary.duration) addText(`المدة: ${pmdproData.projectSummary.duration}`, 5);
            if (pmdproData.projectSummary.beneficiaries) addText(`المستفيدون: ${pmdproData.projectSummary.beneficiaries}`, 5);
            if (pmdproData.projectSummary.budget) addText(`الميزانية: ${pmdproData.projectSummary.budget}`, 5);
          } else {
            addText(pmdproData.projectSummary);
          }
        }
        
        if (pmdproData.phases?.length) {
          addSubTitle("مراحل المشروع");
          pmdproData.phases.forEach((phase: any, idx: number) => {
            checkPageBreak(25);
            addText(`${idx + 1}. ${phase.name}`, 5);
            if (phase.description) addText(phase.description, 10);
            if (phase.duration) addText(`المدة: ${phase.duration}`, 10);
          });
        }
        
        if (pmdproData.stakeholders?.length) {
          addSubTitle("أصحاب المصلحة");
          pmdproData.stakeholders.forEach((stakeholder: any) => {
            addText(`• ${stakeholder.name} - ${stakeholder.role || ''}`, 5);
          });
        }
        
        if (pmdproData.risks?.length) {
          addSubTitle("المخاطر");
          pmdproData.risks.forEach((risk: any) => {
            addText(`• ${risk.risk}`, 5);
            if (risk.mitigation) addText(`التخفيف: ${risk.mitigation}`, 10);
          });
        }
      }

      // ==================== 9. التفكير التصميمي ====================
      if (designThinkingData) {
        doc.addPage();
        yPos = margin;
        addSectionTitle("9. التفكير التصميمي", [219, 112, 147]);
        
        // مرحلة التعاطف
        if (designThinkingData.phase1_empathize) {
          addSubTitle("المرحلة 1: التعاطف");
          const empathy = designThinkingData.phase1_empathize;
          if (empathy.description) addText(empathy.description);
          
          if (empathy.empathyMap) {
            addText("خريطة التعاطف:", 5);
            if (empathy.empathyMap.says?.length) {
              addText("يقولون:", 10);
              addList(empathy.empathyMap.says);
            }
            if (empathy.empathyMap.thinks?.length) {
              addText("يفكرون:", 10);
              addList(empathy.empathyMap.thinks);
            }
            if (empathy.empathyMap.does?.length) {
              addText("يفعلون:", 10);
              addList(empathy.empathyMap.does);
            }
            if (empathy.empathyMap.feels?.length) {
              addText("يشعرون:", 10);
              addList(empathy.empathyMap.feels);
            }
          }
        }
        
        // مرحلة التحديد
        if (designThinkingData.phase2_define) {
          checkPageBreak(30);
          addSubTitle("المرحلة 2: التحديد");
          const define = designThinkingData.phase2_define;
          if (define.problemStatement) addText(`بيان المشكلة: ${define.problemStatement}`);
          if (define.howMightWe?.length) {
            addText("أسئلة كيف يمكننا:", 5);
            addList(define.howMightWe);
          }
        }
        
        // مرحلة التفكير
        if (designThinkingData.phase3_ideate) {
          checkPageBreak(30);
          addSubTitle("المرحلة 3: التفكير");
          const ideate = designThinkingData.phase3_ideate;
          if (ideate.selectedIdea) addText(`الفكرة المختارة: ${ideate.selectedIdea}`);
          if (ideate.ideas?.length) {
            addText("الأفكار المولدة:", 5);
            ideate.ideas.forEach((idea: any) => {
              addText(`• ${idea.idea}`, 10);
            });
          }
        }
        
        // مرحلة النموذج الأولي
        if (designThinkingData.phase4_prototype) {
          checkPageBreak(30);
          addSubTitle("المرحلة 4: النموذج الأولي");
          const proto = designThinkingData.phase4_prototype;
          if (proto.prototypeType) addText(`نوع النموذج: ${proto.prototypeType}`);
          if (proto.budget) addText(`الميزانية: ${proto.budget}`);
        }
        
        // مرحلة الاختبار
        if (designThinkingData.phase5_test) {
          checkPageBreak(30);
          addSubTitle("المرحلة 5: الاختبار");
          const test = designThinkingData.phase5_test;
          if (test.testPlan) {
            addText(`الهدف: ${test.testPlan.objective || ''}`);
            addText(`المشاركون: ${test.testPlan.participants || ''}`);
            addText(`المدة: ${test.testPlan.duration || ''}`);
          }
        }
      }

      // ==================== 10. التقييم ====================
      if (evaluationData) {
        doc.addPage();
        yPos = margin;
        addSectionTitle("10. التقييم", [0, 128, 0]);
        
        if (evaluationData.overallScore) {
          addSubTitle(`الدرجة الإجمالية: ${evaluationData.overallScore}/100`);
        }
        
        if (evaluationData.criteria?.length) {
          addSubTitle("معايير التقييم");
          evaluationData.criteria.forEach((criterion: any) => {
            addText(`• ${criterion.name}: ${criterion.score}/100`, 5);
            if (criterion.feedback) addText(criterion.feedback, 10);
          });
        }
        
        if (evaluationData.strengths?.length) {
          addSubTitle("نقاط القوة");
          addList(evaluationData.strengths);
        }
        
        if (evaluationData.improvements?.length) {
          addSubTitle("مجالات التحسين");
          addList(evaluationData.improvements);
        }
        
        if (evaluationData.summary) {
          addSubTitle("الملخص");
          addText(evaluationData.summary);
        }
      }

      // ==================== تذييل الصفحات ====================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`صفحة ${i} من ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.text("مسار الابتكار", pageWidth - margin, pageHeight - 10, { align: "right" });
      }

      // حفظ الملف
      const fileName = `تقرير_${ideaData?.programDescription?.substring(0, 30) || 'البرنامج'}_${new Date().toLocaleDateString("ar-SA")}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("حدث خطأ أثناء إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isExporting}
      variant="outline"
      className="gap-2 bg-primary text-white border-0 hover:bg-primary/90"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري التصدير...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          تصدير الكل إلى PDF
        </>
      )}
    </Button>
  );
}
