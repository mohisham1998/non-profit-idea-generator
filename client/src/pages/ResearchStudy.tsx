import { useParams, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Building2, 
  Lightbulb, 
  FileText, 
  Download, 
  Loader2, 
  Copy, 
  Sparkles,
  AlertCircle,
  ChevronLeft,
  GraduationCap,
  ExternalLink,
  CalendarDays,
  BookMarked,
  ChevronDown,
  ChevronsUpDown
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { ProgressIndicator } from "../components/ProgressIndicator";
import Navbar from "../components/Navbar";
import { useRef, useEffect, useState, useMemo } from "react";
import { SideTableOfContents } from "../components/SideTableOfContents";

interface Reference {
  title: string;
  author: string;
  year: string;
  source: string;
  url?: string;
}

export default function ResearchStudy() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const ideaId = parseInt(params.id || "0");
  const resultsRef = useRef<HTMLDivElement>(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [referencesCollapsed, setReferencesCollapsed] = useState(false);

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const { data: idea, isLoading: ideaLoading } = trpc.ideas.getById.useQuery({ id: ideaId });
  const { data: study, isLoading: studyLoading } = trpc.research.getByIdeaId.useQuery({ ideaId });

  const generateMutation = trpc.research.generateStudy.useMutation({
    onSuccess: () => {
      trpc.useUtils().research.getByIdeaId.invalidate({ ideaId });
      setJustGenerated(true);
    },
  });

  // تمرير تلقائي لعرض النتائج بعد التوليد
  useEffect(() => {
    if (justGenerated && study && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setJustGenerated(false);
      }, 300);
    }
  }, [justGenerated, study]);

  const handleGenerate = () => {
    generateMutation.mutate({ ideaId });
  };

  const handleExportPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('research-content');
    if (!element || !idea) return;
    
    const opt = {
      margin: 1,
      filename: `الدراسة-البحثية-${idea.selectedName || idea.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
    toast.success("تم تصدير PDF بنجاح");
  };

  const handleCopyContent = () => {
    const element = document.getElementById('research-content');
    if (!element) return;
    
    const text = element.innerText;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("تم نسخ المحتوى بنجاح");
    }).catch(() => {
      toast.error("فشل نسخ المحتوى");
    });
  };

  const sections = useMemo(() => [
    { 
      key: 'executiveSummary', 
      title: 'الملخص التنفيذي', 
      subtitle: 'نظرة عامة شاملة على الدراسة',
      icon: FileText, 
      color: 'from-blue-500 to-indigo-500',
      lightBg: 'from-blue-50 to-indigo-50',
      dividerIcon: FileText,
      dividerColor: 'via-blue-200'
    },
    { 
      key: 'programImportance', 
      title: 'أهمية البرنامج', 
      subtitle: 'تحليل أكاديمي لأهمية البرنامج للمجتمع',
      icon: Lightbulb, 
      color: 'from-purple-500 to-violet-500',
      lightBg: 'from-purple-50 to-violet-50',
      dividerIcon: Lightbulb,
      dividerColor: 'via-purple-200'
    },
    { 
      key: 'socialReturn', 
      title: 'العائد الاجتماعي المتوقع', 
      subtitle: 'الأثر المتوقع على المستفيدين والمجتمع',
      icon: Users, 
      color: 'from-emerald-500 to-teal-500',
      lightBg: 'from-emerald-50 to-teal-50',
      dividerIcon: Users,
      dividerColor: 'via-emerald-200'
    },
    { 
      key: 'organizationReturn', 
      title: 'العائد للجمعية', 
      subtitle: 'الفوائد المباشرة للمنظمة غير الربحية',
      icon: Building2, 
      color: 'from-orange-500 to-amber-500',
      lightBg: 'from-orange-50 to-amber-50',
      dividerIcon: Building2,
      dividerColor: 'via-orange-200'
    },
    { 
      key: 'recommendations', 
      title: 'التوصيات والخلاصة', 
      subtitle: 'توصيات عملية لتنفيذ البرنامج بنجاح',
      icon: ArrowRight, 
      color: 'from-cyan-500 to-blue-500',
      lightBg: 'from-cyan-50 to-blue-50',
      dividerIcon: ArrowRight,
      dividerColor: 'via-cyan-200'
    },
  ], []);

  const tocSections = useMemo(() => [
    ...sections.map(s => ({ id: `section-${s.key}`, title: s.title, icon: s.icon, color: s.color })),
    { id: 'section-references', title: 'المراجع العلمية', icon: BookOpen, color: 'from-amber-500 to-orange-500' }
  ], [sections]);

  const toggleAllSections = () => {
    const allKeys = [...sections.map(s => s.key), 'references'];
    const anyOpen = allKeys.some(k => k === 'references' ? !referencesCollapsed : !collapsedSections[k]);
    if (anyOpen) {
      const newState: Record<string, boolean> = {};
      sections.forEach(s => { newState[s.key] = true; });
      setCollapsedSections(newState);
      setReferencesCollapsed(true);
    } else {
      setCollapsedSections({});
      setReferencesCollapsed(false);
    }
  };

  if (ideaLoading || studyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-blue-50">
        <Navbar />
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 mx-auto flex items-center justify-center animate-pulse">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <p className="text-lg text-gray-600 mt-6 font-medium">جاري تحميل الدراسة البحثية...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-blue-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <Card className="border-red-200 bg-red-50/50 max-w-lg mx-auto border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">لم يتم العثور على المشروع</h3>
              <p className="text-red-600 mb-6">المشروع المطلوب غير موجود أو تم حذفه</p>
              <Button onClick={() => navigate("/history")} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للسجل
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  let references: Reference[] = [];
  if (study?.references) {
    try {
      references = JSON.parse(study.references as string);
    } catch (e) {
      console.error("Failed to parse references:", e);
    }
  }

  const projectName = idea?.selectedName || idea?.programDescription?.substring(0, 50) || 'المشروع';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-blue-50">
      <Navbar />
      
      {/* ===== فهرس التنقل الجانبي ===== */}
      <SideTableOfContents sections={tocSections} visible={!!study} />
      
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        
        {/* ===== زر الرجوع مع عنوان المشروع ===== */}
        <div className="mb-6">
          <button 
            onClick={() => navigate("/history")}
            className="group flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 mb-4"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">العودة إلى السجل</span>
          </button>
          
          {/* عنوان المشروع */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              <span className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">اسم المشروع</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mr-5">{projectName}</h2>
            {idea.targetAudience && (
              <div className="flex gap-2 mr-5 mt-2">
                <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-600 bg-indigo-50">
                  <Users className="h-3 w-3 ml-1" />
                  {idea.targetAudience}
                </Badge>
                {idea.duration && (
                  <Badge variant="outline" className="text-xs border-purple-200 text-purple-600 bg-purple-50">
                    <CalendarDays className="h-3 w-3 ml-1" />
                    {idea.duration}
                  </Badge>
                )}
                {idea.isApproved && (
                  <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">
                    ✓ معتمد
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== الهيدر الرئيسي ===== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 mb-8 shadow-xl">
          {/* خلفية زخرفية */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  الدراسة البحثية
                </h1>
                <p className="text-indigo-100 text-sm md:text-base">
                  دراسة أكاديمية شاملة مع مراجع علمية موثوقة
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {study && (
                <>
                  <Button 
                    onClick={handleExportPDF}
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تصدير PDF
                  </Button>
                  <Button 
                    onClick={handleCopyContent}
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
                  >
                    <Copy className="h-4 w-4 ml-2" />
                    نسخ
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== زر توليد الدراسة (يظهر دائماً إذا لم تكن هناك دراسة) ===== */}
        {!study && !generateMutation.isPending && (
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-12 mb-8">
            <div className="absolute top-4 left-4 w-20 h-20 bg-indigo-100 rounded-full opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-purple-100 rounded-full opacity-50"></div>
            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">لم يتم توليد الدراسة البحثية بعد</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {!idea?.isApproved ? (
                  <span className="text-amber-600 font-medium">
                    يجب اعتماد المشروع أولاً قبل توليد الدراسة البحثية
                  </span>
                ) : (
                  "اضغط على الزر أدناه لتوليد دراسة بحثية شاملة تتضمن أهمية البرنامج، العائد الاجتماعي، والمراجع العلمية"
                )}
              </p>
              <Button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !idea?.isApproved}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 disabled:opacity-50 px-8"
              >
                <FileText className="h-5 w-5 ml-2" />
                توليد الدراسة البحثية
              </Button>
            </div>
          </div>
        )}

        {/* ===== مؤشر التقدم ===== */}
        {generateMutation.isPending && (
          <div className="mb-8">
            <ProgressIndicator
              isGenerating={true}
              title="جاري توليد الدراسة البحثية"
              icon={<BookOpen className="h-5 w-5 text-white" />}
              stages={[
                { label: "تحليل أهداف المشروع", duration: 3000 },
                { label: "مراجعة الأدبيات والمراجع العلمية", duration: 4000 },
                { label: "تقييم العائد الاجتماعي", duration: 3500 },
                { label: "تحليل العائد للجمعية", duration: 3000 },
                { label: "صياغة التوصيات", duration: 2500 },
                { label: "إعداد الدراسة النهائية", duration: 2000 }
              ]}
            />
          </div>
        )}

        {/* ===== عرض نتائج الدراسة (تظهر تلقائياً بعد التوليد) ===== */}
        {study && (
          <div ref={resultsRef} id="research-content" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* ═══════ رسالة نجاح التوليد ═══════ */}
            {justGenerated && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-500">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800 text-sm">تم توليد الدراسة البحثية بنجاح!</p>
                  <p className="text-emerald-600 text-xs">يمكنك الاطلاع على الدراسة أدناه وتصديرها أو نسخها</p>
                </div>
              </div>
            )}

            {/* ═════ زر طي/فتح الكل ═════ */}
            <div className="flex justify-end mb-2">
              <button
                onClick={toggleAllSections}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all duration-200"
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
                {sections.some(s => !collapsedSections[s.key]) || !referencesCollapsed ? 'طي الكل' : 'فتح الكل'}
              </button>
            </div>

            {/* ═══════════════ أقسام الدراسة ═══════════════ */}
            {sections.map((section, sectionIndex) => {
              const content = (study as any)[section.key];
              if (!content) return null;
              const Icon = section.icon;
              const isCollapsed = !!collapsedSections[section.key];
              
              return (
                <div key={section.key} id={`section-${section.key}`}>
                  {/* فاصل زخرفي بين الأقسام */}
                  {sectionIndex > 0 && (
                    <div className="flex items-center gap-4 py-4 mb-4">
                      <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${section.dividerColor} to-transparent`}></div>
                      <section.dividerIcon className="h-4 w-4 text-gray-300" />
                      <div className={`flex-1 h-px bg-gradient-to-r from-transparent ${section.dividerColor} to-transparent`}></div>
                    </div>
                  )}
                  
                  <section>
                    {/* عنوان القسم - قابل للنقر للطي/الفتح */}
                    <button
                      onClick={() => toggleSection(section.key)}
                      className="w-full flex items-center gap-3 mb-4 group cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-md transition-transform duration-200 ${isCollapsed ? 'scale-90' : ''}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 text-right">
                        <h2 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{section.title}</h2>
                        <p className="text-xs text-gray-500">{section.subtitle}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-indigo-100 transition-all duration-300 ${isCollapsed ? '' : 'rotate-180'}`}>
                        <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </button>
                    
                    {/* محتوى القسم - قابل للطي */}
                    <div
                      className={`transition-all duration-400 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}
                    >
                      <Card className="border-0 shadow-md bg-white overflow-hidden">
                        <div className={`h-1.5 bg-gradient-to-r ${section.color}`}></div>
                        <CardContent className="p-6">
                          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {content}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                </div>
              );
            })}

            {/* ═══════════ فاصل زخرفي ═══════════ */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
              <BookMarked className="h-4 w-4 text-amber-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
            </div>

            {/* ═══════════════ المراجع العلمية ═══════════════ */}
            <section id="section-references">
              <button
                onClick={() => setReferencesCollapsed(!referencesCollapsed)}
                className="w-full flex items-center gap-3 mb-4 group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md transition-transform duration-200 ${referencesCollapsed ? 'scale-90' : ''}`}>
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-right">
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">المراجع العلمية</h2>
                  <p className="text-xs text-gray-500">مصادر موثوقة ومراجع أكاديمية</p>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-amber-100 transition-all duration-300 ${referencesCollapsed ? '' : 'rotate-180'}`}>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-amber-600 transition-colors" />
                </div>
              </button>
              
              <div className={`transition-all duration-400 ease-in-out overflow-hidden ${referencesCollapsed ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'}`}>
              <Card className="border-0 shadow-md bg-white overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {references.map((ref, index) => (
                      <div key={index} className="group flex gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 hover:from-amber-50 hover:to-orange-50 transition-colors duration-200 border border-amber-100/50">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm mb-1 leading-relaxed">{ref.title}</h4>
                          <p className="text-xs text-gray-500 mb-1">
                            <span className="font-medium text-gray-600">{ref.author}</span>
                            {ref.year && <span className="mx-1">({ref.year})</span>}
                          </p>
                          <p className="text-xs text-gray-400">{ref.source}</p>
                          {ref.url && (
                            <a 
                              href={ref.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
                            >
                              <ExternalLink className="h-3 w-3" />
                              عرض المصدر
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </div>
            </section>

            {/* ═══════════ معلومات الدراسة ═══════════ */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>تاريخ الإنشاء: {new Date(study.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
                <span>آخر تحديث: {new Date(study.updatedAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>

            {/* ═══════════ أزرار الإجراءات ═══════════ */}
            <div className="flex gap-3 justify-center pt-2 pb-8">
              <Button 
                onClick={handleExportPDF}
                variant="outline"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير PDF
              </Button>
              <Button 
                onClick={handleCopyContent}
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Copy className="h-4 w-4 ml-2" />
                نسخ المحتوى
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 ml-2" />
                    تحديث الدراسة
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
