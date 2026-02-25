import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import FilePreviewModal from "@/components/FilePreviewModal";
import { exportToWord, exportToPDF, exportToPPT } from "@/lib/exportUtils";
import { TemplateId } from "@/lib/templates";
import { generateMarketingContent } from "@/lib/marketingContentGenerator";
import {
  Loader2,
  ArrowRight,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Handshake,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  Building2,
  Heart,
  Globe,
  Award,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileDown,
  Presentation,
  FileSpreadsheet,
  Check,
  Copy,
  Share2,
  Megaphone,
  Eye
} from "lucide-react";

interface MarketingSection {
  id: string;
  title: string;
  content: string;
  approved: boolean;
}

export default function DonorMarketing() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const ideaId = params.id ? parseInt(params.id) : null;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketingContent, setMarketingContent] = useState<any>(null);
  const [approvedSections, setApprovedSections] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<'word' | 'pdf' | 'ppt' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');

  // جلب معلومات المؤسسة
  const { data: organizationInfo } = trpc.organization.getInfo.useQuery();

  // جلب بيانات الفكرة
  const { data: ideaData, isLoading: ideaLoading } = trpc.ideas.getById.useQuery(
    { id: ideaId! },
    { enabled: !!ideaId }
  );

  // توليد المحتوى التسويقي محلياً (مجاني وفوري)
  const generatedContent = useMemo(() => {
    if (ideaData) {
      return generateMarketingContent(ideaData);
    }
    return null;
  }, [ideaData]);

  // تحديث المحتوى عند توليده
  useEffect(() => {
    if (generatedContent && !marketingContent) {
      setMarketingContent(generatedContent);
    }
  }, [generatedContent]);

  const toggleSectionApproval = (sectionId: string) => {
    setApprovedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const approveAll = () => {
    const allSections = ['summary', 'impact', 'budget', 'partnerships', 'timeline', 'contact'];
    setApprovedSections(new Set(allSections));
    toast.success("تم اعتماد جميع الأقسام");
  };

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      toast.success("تم النسخ!");
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      toast.error("فشل النسخ");
    }
  };

  // فتح نافذة المعاينة
  const openPreview = (format: 'word' | 'pdf' | 'ppt') => {
    if (approvedSections.size === 0) {
      toast.error("يرجى اعتماد قسم واحد على الأقل قبل المعاينة");
      return;
    }
    setPreviewFormat(format);
  };

  // إغلاق نافذة المعاينة
  const closePreview = () => {
    setPreviewFormat(null);
  };

  const handleExport = async (format: 'word' | 'pdf' | 'ppt', templateId: TemplateId = selectedTemplate) => {
    if (approvedSections.size === 0) {
      toast.error("يرجى اعتماد قسم واحد على الأقل قبل التصدير");
      return;
    }

    setIsExporting(format);
    
    try {
      const exportOptions = {
        approvedSections,
        marketingContent: marketingContent || {},
        ideaData: ideaData || {},
        organizationInfo: organizationInfo || undefined,
        templateId,
      };

      if (format === 'word') {
        await exportToWord(exportOptions);
      } else if (format === 'pdf') {
        await exportToPDF(exportOptions);
      } else if (format === 'ppt') {
        await exportToPPT(exportOptions);
      }
      
      toast.success(`تم تصدير الملف بصيغة ${format.toUpperCase()} بنجاح!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(null);
    }
  };

  const generateExportContent = (format: string) => {
    const programName = ideaData?.programDescription || "البرنامج";
    let content = "";

    if (approvedSections.has('summary')) {
      content += `# ${programName}\n\n`;
      content += `## ملخص البرنامج\n`;
      content += `${marketingContent?.summary || ''}\n\n`;
    }

    if (approvedSections.has('impact')) {
      content += `## الأثر المتوقع\n`;
      content += `${marketingContent?.impact || ''}\n\n`;
    }

    if (approvedSections.has('budget')) {
      content += `## الميزانية والتمويل\n`;
      content += `${marketingContent?.budget || ''}\n\n`;
    }

    if (approvedSections.has('partnerships')) {
      content += `## فرص الشراكة\n`;
      content += `${marketingContent?.partnerships || ''}\n\n`;
    }

    if (approvedSections.has('timeline')) {
      content += `## الجدول الزمني\n`;
      content += `${marketingContent?.timeline || ''}\n\n`;
    }

    return content;
  };

  const downloadFile = (content: string, format: string) => {
    const programName = ideaData?.programDescription?.slice(0, 30) || "marketing";
    const filename = `${programName}_donor_proposal`;
    
    let blob: Blob;
    let extension: string;

    if (format === 'word') {
      // إنشاء ملف Word بتنسيق HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Arial', sans-serif; direction: rtl; padding: 40px; line-height: 1.8; }
            h1 { color: #1e7e34; border-bottom: 3px solid #1e7e34; padding-bottom: 10px; }
            h2 { color: #2d5a27; margin-top: 30px; }
            .highlight { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .stat { display: inline-block; background: #f0f9f0; padding: 10px 20px; margin: 5px; border-radius: 5px; }
          </style>
        </head>
        <body>
          ${content.replace(/\n/g, '<br>').replace(/# /g, '<h1>').replace(/## /g, '</h1><h2>').replace(/<h2>$/, '')}
        </body>
        </html>
      `;
      blob = new Blob([htmlContent], { type: 'application/msword' });
      extension = 'doc';
    } else if (format === 'pdf') {
      // للـ PDF نستخدم نص عادي (في الإنتاج يمكن استخدام مكتبة PDF)
      blob = new Blob([content], { type: 'application/pdf' });
      extension = 'txt'; // مؤقتاً
    } else {
      // PowerPoint - نستخدم HTML كبديل
      const pptContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Arial', sans-serif; direction: rtl; }
            .slide { page-break-after: always; padding: 60px; min-height: 500px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); }
            h1 { color: #1e7e34; font-size: 36px; text-align: center; }
            h2 { color: #2d5a27; font-size: 28px; }
            p { font-size: 18px; line-height: 2; }
          </style>
        </head>
        <body>
          ${content.split('## ').map((section, i) => 
            i === 0 ? `<div class="slide"><h1>${section}</h1></div>` : 
            `<div class="slide"><h2>${section.split('\n')[0]}</h2><p>${section.split('\n').slice(1).join('<br>')}</p></div>`
          ).join('')}
        </body>
        </html>
      `;
      blob = new Blob([pptContent], { type: 'application/vnd.ms-powerpoint' });
      extension = 'ppt';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (ideaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Navbar />
        <div className="container py-20 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto animate-pulse">
                <Megaphone className="h-12 w-12 text-white" />
              </div>
              <Loader2 className="h-8 w-8 animate-spin text-green-600 absolute -bottom-2 -right-2" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">جاري تحميل بيانات البرنامج...</h2>
            <p className="text-gray-600">يرجى الانتظار لحظات</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ideaData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Navbar />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800">لم يتم العثور على الفكرة</h2>
          <Button onClick={() => setLocation("/")} className="mt-4">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/")}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowRight className="h-4 w-4 ml-1" />
              العودة
            </Button>
          </div>
          
          <div className="text-center text-white space-y-4">
            <Badge className="bg-white/20 text-white border-0 px-4 py-1">
              <Sparkles className="h-4 w-4 ml-2" />
              تسويق للجهات المانحة
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">
              {ideaData.programDescription?.slice(0, 60)}...
            </h1>
            <p className="text-white/80 max-w-2xl mx-auto">
              محتوى تسويقي احترافي مُعد خصيصاً لعرض برنامجك على الجهات المانحة والداعمة
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 -mt-8">
        <div className="container">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">{marketingContent?.stats?.objectives || 5}</div>
                <div className="text-sm text-gray-600">أهداف رئيسية</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700">{marketingContent?.stats?.beneficiaries || "1000+"}</div>
                <div className="text-sm text-gray-600">مستفيد متوقع</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-700">{marketingContent?.stats?.budget || "50,000"}</div>
                <div className="text-sm text-gray-600">ريال مطلوب</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-700">{marketingContent?.stats?.duration || "12"}</div>
                <div className="text-sm text-gray-600">شهر</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="summary" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-white/50 backdrop-blur">
                  <TabsTrigger value="summary" className="text-xs">الملخص</TabsTrigger>
                  <TabsTrigger value="impact" className="text-xs">الأثر</TabsTrigger>
                  <TabsTrigger value="budget" className="text-xs">الميزانية</TabsTrigger>
                  <TabsTrigger value="partnerships" className="text-xs">الشراكات</TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs">الجدول</TabsTrigger>
                  <TabsTrigger value="contact" className="text-xs">التواصل</TabsTrigger>
                </TabsList>

                {/* Summary Tab */}
                <TabsContent value="summary">
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          ملخص البرنامج التنفيذي
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={approvedSections.has('summary')}
                            onCheckedChange={() => toggleSectionApproval('summary')}
                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-green-600"
                          />
                          <span className="text-sm">اعتماد</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="prose prose-green max-w-none" dir="rtl">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {marketingContent?.summary || ideaData.programDescription}
                        </p>
                      </div>
                      
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          الهدف العام
                        </h4>
                        <p className="text-gray-700">{ideaData.generalObjective}</p>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          الفئة المستهدفة
                        </h4>
                        <p className="text-gray-700">{ideaData.targetAudience}</p>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(marketingContent?.summary || ideaData.programDescription || '', 'summary')}
                        className="w-full"
                      >
                        {copiedItem === 'summary' ? <Check className="h-4 w-4 ml-2" /> : <Copy className="h-4 w-4 ml-2" />}
                        نسخ الملخص
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Impact Tab */}
                <TabsContent value="impact">
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          الأثر المتوقع والنتائج
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={approvedSections.has('impact')}
                            onCheckedChange={() => toggleSectionApproval('impact')}
                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                          />
                          <span className="text-sm">اعتماد</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="prose prose-blue max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {marketingContent?.impact || ideaData.expectedResults}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                          <h4 className="font-bold text-blue-800 mb-2">النتائج قصيرة المدى</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            {(marketingContent?.shortTermResults || ['تحسين الوعي', 'بناء القدرات', 'إشراك المجتمع']).map((result: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <h4 className="font-bold text-green-800 mb-2">النتائج طويلة المدى</h4>
                          <ul className="space-y-2 text-gray-700 text-sm">
                            {(marketingContent?.longTermResults || ['استدامة الأثر', 'التوسع والانتشار', 'التغيير المجتمعي']).map((result: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Budget Tab */}
                <TabsContent value="budget">
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          الميزانية والتمويل المطلوب
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={approvedSections.has('budget')}
                            onCheckedChange={() => toggleSectionApproval('budget')}
                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-amber-600"
                          />
                          <span className="text-sm">اعتماد</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="prose prose-amber max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {marketingContent?.budget || "ميزانية البرنامج مصممة لتحقيق أقصى أثر بأقل تكلفة ممكنة، مع ضمان الشفافية والمساءلة في استخدام الموارد."}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                        <h4 className="font-bold text-amber-800 mb-4 text-center text-xl">توزيع الميزانية</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(marketingContent?.budgetBreakdown || [
                            { category: 'الموارد البشرية', percentage: 40 },
                            { category: 'التشغيل', percentage: 25 },
                            { category: 'المواد والمستلزمات', percentage: 20 },
                            { category: 'الإدارة والمتابعة', percentage: 15 },
                          ]).map((item: any, idx: number) => (
                            <div key={idx} className="text-center">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg">
                                {item.percentage}%
                              </div>
                              <div className="text-sm text-gray-700">{item.category}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                        <div className="text-sm text-gray-600 mb-1">إجمالي التمويل المطلوب</div>
                        <div className="text-3xl font-bold text-green-700">
                          {marketingContent?.totalBudget || "50,000"} ريال
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Partnerships Tab */}
                <TabsContent value="partnerships">
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Handshake className="h-5 w-5" />
                          فرص الشراكة والتعاون
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={approvedSections.has('partnerships')}
                            onCheckedChange={() => toggleSectionApproval('partnerships')}
                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-600"
                          />
                          <span className="text-sm">اعتماد</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <p className="text-gray-700 leading-relaxed">
                        {marketingContent?.partnerships || "نرحب بالشراكات الاستراتيجية مع المؤسسات والجهات المهتمة بدعم هذا البرنامج وتحقيق أهدافه النبيلة."}
                      </p>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 text-center">
                          <Building2 className="h-10 w-10 text-purple-500 mx-auto mb-2" />
                          <h4 className="font-bold text-purple-800 mb-1">شراكة مؤسسية</h4>
                          <p className="text-sm text-gray-600">دعم مالي وتقني</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100 text-center">
                          <Globe className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-bold text-blue-800 mb-1">شراكة دولية</h4>
                          <p className="text-sm text-gray-600">تبادل الخبرات</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 text-center">
                          <Heart className="h-10 w-10 text-green-500 mx-auto mb-2" />
                          <h4 className="font-bold text-green-800 mb-1">شراكة مجتمعية</h4>
                          <p className="text-sm text-gray-600">تطوع ومشاركة</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          مزايا الشراكة
                        </h4>
                        <ul className="grid md:grid-cols-2 gap-2 text-gray-700 text-sm">
                          {(marketingContent?.partnershipBenefits || [
                            'الظهور في جميع المواد الترويجية',
                            'تقارير دورية عن سير البرنامج',
                            'المشاركة في الفعاليات الرسمية',
                            'شهادة تقدير وتكريم'
                          ]).map((benefit: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline">
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          الجدول الزمني للتنفيذ
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={approvedSections.has('timeline')}
                            onCheckedChange={() => toggleSectionApproval('timeline')}
                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600"
                          />
                          <span className="text-sm">اعتماد</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {(marketingContent?.timelinePhases || [
                          { phase: 'المرحلة التحضيرية', duration: '1-2 شهر', activities: 'التخطيط والإعداد' },
                          { phase: 'مرحلة التنفيذ', duration: '6-8 أشهر', activities: 'تنفيذ الأنشطة الرئيسية' },
                          { phase: 'مرحلة المتابعة', duration: '2-3 أشهر', activities: 'التقييم والتوثيق' },
                        ]).map((phase: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-indigo-800">{phase.phase}</h4>
                                <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                                  {phase.duration}
                                </Badge>
                              </div>
                              <p className="text-gray-600 text-sm">{phase.activities}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact">
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
                    <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          معلومات التواصل
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={approvedSections.has('contact')}
                            onCheckedChange={() => toggleSectionApproval('contact')}
                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-teal-600"
                          />
                          <span className="text-sm">اعتماد</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <p className="text-gray-700 leading-relaxed text-center">
                        نرحب بتواصلكم للاستفسار أو المشاركة في دعم هذا البرنامج
                      </p>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100 text-center">
                          <Mail className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                          <h4 className="font-bold text-teal-800 mb-1">البريد الإلكتروني</h4>
                          <p className="text-sm text-gray-600">info@organization.org</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 text-center">
                          <Phone className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <h4 className="font-bold text-blue-800 mb-1">الهاتف</h4>
                          <p className="text-sm text-gray-600">+966 XX XXX XXXX</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 text-center">
                          <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <h4 className="font-bold text-green-800 mb-1">الموقع</h4>
                          <p className="text-sm text-gray-600">المملكة العربية السعودية</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Export Options */}
            <div className="space-y-6">
              {/* Approval Status */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur sticky top-4">
                <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    حالة الاعتماد
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    {[
                      { id: 'summary', label: 'ملخص البرنامج' },
                      { id: 'impact', label: 'الأثر المتوقع' },
                      { id: 'budget', label: 'الميزانية' },
                      { id: 'partnerships', label: 'الشراكات' },
                      { id: 'timeline', label: 'الجدول الزمني' },
                      { id: 'contact', label: 'معلومات التواصل' },
                    ].map((section) => (
                      <div 
                        key={section.id}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          approvedSections.has(section.id) 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <span className="text-sm">{section.label}</span>
                        {approvedSections.has(section.id) ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={approveAll}
                    variant="outline"
                    className="w-full"
                  >
                    <Check className="h-4 w-4 ml-2" />
                    اعتماد الكل
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    {approvedSections.size} من 6 أقسام معتمدة
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                    <Download className="h-5 w-5" />
                    تصدير المحتوى
                  </CardTitle>
                  <CardDescription>
                    اختر صيغة التصدير المناسبة
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Word */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => openPreview('word')}
                      disabled={approvedSections.size === 0}
                      variant="outline"
                      className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      معاينة
                    </Button>
                    <Button 
                      onClick={() => handleExport('word')}
                      disabled={isExporting !== null || approvedSections.size === 0}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isExporting === 'word' ? (
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 ml-2" />
                      )}
                      Word
                    </Button>
                  </div>

                  {/* PDF */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => openPreview('pdf')}
                      disabled={approvedSections.size === 0}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      معاينة
                    </Button>
                    <Button 
                      onClick={() => handleExport('pdf')}
                      disabled={isExporting !== null || approvedSections.size === 0}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isExporting === 'pdf' ? (
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      ) : (
                        <FileDown className="h-4 w-4 ml-2" />
                      )}
                      PDF
                    </Button>
                  </div>

                  {/* PowerPoint */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => openPreview('ppt')}
                      disabled={approvedSections.size === 0}
                      variant="outline"
                      className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      معاينة
                    </Button>
                    <Button 
                      onClick={() => handleExport('ppt')}
                      disabled={isExporting !== null || approvedSections.size === 0}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isExporting === 'ppt' ? (
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      ) : (
                        <Presentation className="h-4 w-4 ml-2" />
                      )}
                      PPT
                    </Button>
                  </div>

                  {approvedSections.size === 0 && (
                    <p className="text-xs text-amber-600 text-center">
                      يرجى اعتماد قسم واحد على الأقل للتصدير
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Share Options */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Share2 className="h-5 w-5" />
                    مشاركة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 ml-2" />
                    إرسال بالبريد
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Copy className="h-4 w-4 ml-2" />
                    نسخ الرابط
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* نافذة المعاينة */}
      {previewFormat && (
        <FilePreviewModal
          isOpen={!!previewFormat}
          onClose={closePreview}
          format={previewFormat}
          previewData={{
            approvedSections,
            marketingContent: marketingContent || {},
            ideaData: ideaData || {},
            organizationInfo: organizationInfo || undefined,
          }}
          onExport={(templateId) => {
            handleExport(previewFormat, templateId);
            closePreview();
          }}
          isExporting={isExporting === previewFormat}
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
        />
      )}
    </div>
  );
}
