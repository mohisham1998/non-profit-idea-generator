import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Target,
  Lightbulb,
  BarChart3,
  Calendar,
  DollarSign,
  Leaf,
  ArrowRight,
  Download,
  Copy,
  Shield,
  TrendingUp,
  Zap,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressIndicator } from "@/components/ProgressIndicator";

export default function SustainabilityExpert() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  
  const { data: idea, isLoading: ideaLoading } = trpc.ideas.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const { data: sustainability, isLoading: sustainabilityLoading, refetch } = 
    trpc.sustainability.getAnalysis.useQuery(
      { ideaId: Number(id) },
      { enabled: !!id }
    );

  const generateAnalysis = trpc.sustainability.generateAnalysis.useMutation({
    onSuccess: () => {
      toast.success("تم توليد تحليل الاستدامة بنجاح");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء توليد تحليل الاستدامة");
    }
  });

  const approveMutation = trpc.ideas.approve.useMutation({
    onSuccess: () => {
      toast.success("تم اعتماد البرنامج بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء اعتماد البرنامج");
    }
  });

  const unapproveMutation = trpc.ideas.unapprove.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء اعتماد البرنامج بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إلغاء الاعتماد");
    }
  });

  if (ideaLoading || sustainabilityLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Navbar />
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mx-auto flex items-center justify-center animate-pulse">
                <Leaf className="h-10 w-10 text-white" />
              </div>
            </div>
            <p className="text-lg text-gray-600 mt-6 font-medium">جاري تحميل تحليل الاستدامة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <Card className="border-red-200 bg-red-50/50 max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">لم يتم العثور على المشروع</h3>
              <p className="text-red-600 mb-6">المشروع المطلوب غير موجود أو تم حذفه</p>
              <Button onClick={() => navigate("/history")} className="bg-gradient-to-r from-emerald-600 to-teal-600">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للسجل
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleGenerateAnalysis = () => {
    if (!idea?.isApproved) {
      toast.error("يجب اعتماد المشروع أولاً قبل توليد تحليل الاستدامة");
      return;
    }
    generateAnalysis.mutate({ ideaId: Number(id) });
  };

  const handleExportPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('sustainability-content');
    if (!element) return;
    
    const opt = {
      margin: 1,
      filename: `تحليل-الاستدامة-${idea.selectedName || idea.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
    toast.success("تم تصدير PDF بنجاح");
  };

  const handleCopyContent = () => {
    const element = document.getElementById('sustainability-content');
    if (!element) return;
    
    const text = element.innerText;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("تم نسخ المحتوى بنجاح");
    }).catch(() => {
      toast.error("فشل نسخ المحتوى");
    });
  };

  const indicators = sustainability?.indicators ? 
    (typeof sustainability.indicators === 'string' ? JSON.parse(sustainability.indicators) : sustainability.indicators) : [];
  const recommendations = sustainability?.recommendations ? 
    (typeof sustainability.recommendations === 'string' ? JSON.parse(sustainability.recommendations) : sustainability.recommendations) : [];
  const longTermPlan = sustainability?.longTermPlan ? 
    (typeof sustainability.longTermPlan === 'string' ? JSON.parse(sustainability.longTermPlan) : sustainability.longTermPlan) : {};
  const risks = sustainability?.risks ? 
    (typeof sustainability.risks === 'string' ? JSON.parse(sustainability.risks) : sustainability.risks) : [];

  const projectName = idea.selectedName || idea.programDescription?.substring(0, 50) || 'المشروع';

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'from-emerald-500 to-green-500', text: 'text-emerald-700', light: 'bg-emerald-50', label: 'ممتاز' };
    if (score >= 60) return { bg: 'from-teal-500 to-cyan-500', text: 'text-teal-700', light: 'bg-teal-50', label: 'جيد' };
    if (score >= 40) return { bg: 'from-amber-500 to-yellow-500', text: 'text-amber-700', light: 'bg-amber-50', label: 'متوسط' };
    return { bg: 'from-red-500 to-orange-500', text: 'text-red-700', light: 'bg-red-50', label: 'يحتاج تحسين' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50">
      <Navbar />
      
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        
        {/* ===== زر الرجوع مع عنوان المشروع ===== */}
        <div className="mb-6">
          <button 
            onClick={() => navigate("/history")}
            className="group flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors duration-200 mb-4"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">العودة إلى السجل</span>
          </button>
          
          {/* عنوان المشروع */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500"></div>
              <span className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">اسم المشروع</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mr-5">{projectName}</h2>
          </div>
        </div>

        {/* ===== الهيدر الرئيسي ===== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 mb-8 shadow-xl">
          {/* خلفية زخرفية */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  خبير الاستدامة المالية
                </h1>
                <p className="text-emerald-100 text-sm md:text-base">
                  تحليل مالي شامل وأفكار واقعية لضمان استمرارية المشروع
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {sustainability && (
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
              {idea.isApproved ? (
                <Button 
                  onClick={() => unapproveMutation.mutate({ id: idea.id })}
                  disabled={unapproveMutation.isPending}
                  size="sm"
                  className="bg-red-500/80 hover:bg-red-500 text-white border-0"
                >
                  {unapproveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4 ml-1" />}
                  إلغاء الاعتماد
                </Button>
              ) : (
                <Button 
                  onClick={() => approveMutation.mutate({ id: idea.id })}
                  disabled={approveMutation.isPending}
                  size="sm"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 border-0"
                >
                  {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 ml-1" />}
                  اعتماد البرنامج
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ===== مؤشر التقدم ===== */}
        {generateAnalysis.isPending && (
          <ProgressIndicator
            isGenerating={true}
            title="جاري توليد تحليل الاستدامة"
            icon={<Leaf className="h-5 w-5 text-white" />}
            stages={[
              { label: "تحليل المشروع وأهدافه", duration: 3000 },
              { label: "تقييم مؤشرات الاستدامة", duration: 4000 },
              { label: "تحديد مصادر التمويل المحتملة", duration: 3500 },
              { label: "وضع خطة طويلة المدى", duration: 3000 },
              { label: "تحليل المخاطر والتوصيات", duration: 2500 },
              { label: "إعداد التقرير النهائي", duration: 2000 }
            ]}
          />
        )}

        {/* ===== حالة عدم وجود تحليل ===== */}
        {!sustainability && !generateAnalysis.isPending ? (
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 p-12">
            <div className="absolute top-4 left-4 w-20 h-20 bg-emerald-100 rounded-full opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-teal-100 rounded-full opacity-50"></div>
            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">لم يتم توليد التحليل المالي بعد</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {!idea?.isApproved ? (
                  <span className="text-amber-600 font-medium">
                    يجب اعتماد المشروع أولاً قبل توليد تحليل الاستدامة
                  </span>
                ) : (
                  "اضغط على الزر أدناه لتوليد تحليل مالي شامل مع أفكار واقعية للتمويل والاستمرارية"
                )}
              </p>
              <Button 
                onClick={handleGenerateAnalysis}
                disabled={generateAnalysis.isPending || !idea?.isApproved}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 disabled:opacity-50 px-8"
              >
                <Sparkles className="h-5 w-5 ml-2" />
                توليد تحليل الاستدامة
              </Button>
            </div>
          </div>
        ) : sustainability ? (
          <div id="sustainability-content" className="space-y-8">
            
            {/* ═══════════════ درجة الاستدامة الإجمالية ═══════════════ */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">درجة الاستدامة المالية</h2>
              </div>
              
              <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* الدائرة */}
                    <div className="relative w-40 h-40 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <circle 
                          cx="60" cy="60" r="52" fill="none" 
                          stroke="url(#scoreGradient)" 
                          strokeWidth="10" 
                          strokeLinecap="round"
                          strokeDasharray={`${(sustainability.overallScore / 100) * 327} 327`}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#14b8a6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800">{sustainability.overallScore}%</span>
                        <span className={`text-xs font-semibold ${getScoreColor(sustainability.overallScore).text}`}>
                          {getScoreColor(sustainability.overallScore).label}
                        </span>
                      </div>
                    </div>
                    
                    {/* تفاصيل */}
                    <div className="flex-1 text-center md:text-right">
                      <Badge className={`bg-gradient-to-r ${getScoreColor(sustainability.overallScore).bg} text-white border-0 px-4 py-1 text-sm mb-3`}>
                        {getScoreColor(sustainability.overallScore).label}
                      </Badge>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        تم تقييم المشروع بناءً على عدة مؤشرات مالية واستراتيجية. النتيجة الإجمالية تعكس مدى جاهزية المشروع للاستدامة المالية على المدى الطويل.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* ═══════════ فاصل زخرفي ═══════════ */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent"></div>
              <Leaf className="h-4 w-4 text-emerald-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent"></div>
            </div>

            {/* ═══════════════ مؤشرات الاستدامة ═══════════════ */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">مؤشرات الاستدامة المالية</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indicators?.map((indicator: any, index: number) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white overflow-hidden group">
                    <div className={`h-1.5 bg-gradient-to-r ${
                      indicator.score >= 70 ? 'from-emerald-400 to-green-400' :
                      indicator.score >= 40 ? 'from-amber-400 to-yellow-400' :
                      'from-red-400 to-orange-400'
                    }`}></div>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-800 text-sm">{indicator.name}</span>
                        <span className={`text-lg font-bold ${
                          indicator.score >= 70 ? 'text-emerald-600' :
                          indicator.score >= 40 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>{indicator.score}%</span>
                      </div>
                      <Progress value={indicator.score} className="h-2 mb-3" />
                      <p className="text-xs text-gray-500 leading-relaxed">{indicator.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* ═══════════ فاصل زخرفي ═══════════ */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent"></div>
              <DollarSign className="h-4 w-4 text-teal-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent"></div>
            </div>

            {/* ═══════════════ مصادر التمويل ═══════════════ */}
            {(() => {
              const fundingSources = sustainability?.fundingSources ? 
                (typeof sustainability.fundingSources === 'string' ? JSON.parse(sustainability.fundingSources) : sustainability.fundingSources) : [];
              
              return fundingSources.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">مصادر التمويل المحتملة</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fundingSources.map((source: any, index: number) => (
                      <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-400"></div>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              </div>
                              <h4 className="font-bold text-gray-800">{source.type}</h4>
                            </div>
                            <Badge 
                              variant="outline"
                              className={`text-xs ${
                                source.probability === 'high' || source.probability === 'عالية' ? 'border-green-400 text-green-700 bg-green-50' :
                                source.probability === 'medium' || source.probability === 'متوسطة' ? 'border-amber-400 text-amber-700 bg-amber-50' :
                                'border-red-400 text-red-700 bg-red-50'
                              }`}
                            >
                              {source.probability === 'high' ? 'عالية' : source.probability === 'medium' ? 'متوسطة' : source.probability === 'low' ? 'منخفضة' : source.probability}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{source.description}</p>
                          
                          <div className="space-y-2 bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-500">المبلغ:</span>
                              <span className="font-bold text-green-700">{source.potentialAmount}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <span className="text-gray-500">الإطار الزمني:</span>
                              <span className="text-gray-700">{source.timeline}</span>
                            </div>
                            {source.requirements && (
                              <div className="flex items-start gap-2 text-sm pt-1 border-t border-gray-200">
                                <Shield className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-gray-500">المتطلبات:</span>
                                  <p className="text-gray-600 text-xs mt-0.5">{source.requirements}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* ═══════════ فاصل زخرفي ═══════════ */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
              <Lightbulb className="h-4 w-4 text-amber-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
            </div>

            {/* ═══════════════ التوصيات ═══════════════ */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-md">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">توصيات لتحسين الاستدامة</h2>
              </div>
              
              <div className="space-y-3">
                {recommendations?.map((rec: any, index: number) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                            rec.priority === 'high' || rec.priority === 'عالية' ? 'bg-gradient-to-br from-red-500 to-rose-500' :
                            rec.priority === 'medium' || rec.priority === 'متوسطة' ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
                            'bg-gradient-to-br from-blue-500 to-cyan-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-800">{rec.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                rec.priority === 'high' || rec.priority === 'عالية' ? 'border-red-300 text-red-600 bg-red-50' :
                                rec.priority === 'medium' || rec.priority === 'متوسطة' ? 'border-amber-300 text-amber-600 bg-amber-50' :
                                'border-blue-300 text-blue-600 bg-blue-50'
                              }`}
                            >
                              {rec.priority === 'high' ? 'عالية' : rec.priority === 'medium' ? 'متوسطة' : rec.priority === 'low' ? 'منخفضة' : rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{rec.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.expectedImpact && (
                              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                <Zap className="h-3 w-3" />
                                الأثر: {rec.expectedImpact}
                              </span>
                            )}
                            {rec.implementationCost && (
                              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                                <DollarSign className="h-3 w-3" />
                                التكلفة: {rec.implementationCost}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* ═══════════ فاصل زخرفي ═══════════ */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent"></div>
              <Calendar className="h-4 w-4 text-cyan-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent"></div>
            </div>

            {/* ═══════════════ الخطة طويلة المدى ═══════════════ */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">خطة الاستدامة طويلة المدى</h2>
              </div>
              
              <div className="relative">
                {/* خط زمني */}
                <div className="absolute right-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-300 to-purple-300 hidden md:block"></div>
                
                <div className="space-y-6">
                  {[
                    { key: 'year1', label: 'السنة الأولى', color: 'from-blue-500 to-cyan-500', lightBg: 'from-blue-50 to-cyan-50', milestone: 'breakEvenPoint', milestoneLabel: 'نقطة التعادل' },
                    { key: 'year2', label: 'السنة الثانية', color: 'from-indigo-500 to-blue-500', lightBg: 'from-indigo-50 to-blue-50', milestone: 'sustainabilityMilestone', milestoneLabel: 'معلم الاستدامة' },
                    { key: 'year3', label: 'السنة الثالثة', color: 'from-purple-500 to-indigo-500', lightBg: 'from-purple-50 to-indigo-50', milestone: 'selfSufficiencyRate', milestoneLabel: 'نسبة الاكتفاء الذاتي' },
                  ].map((year) => {
                    const data = longTermPlan?.[year.key];
                    if (!data) return null;
                    return (
                      <div key={year.key} className="relative md:pr-12">
                        {/* نقطة على الخط الزمني */}
                        <div className={`absolute right-0 top-6 w-12 h-12 rounded-full bg-gradient-to-br ${year.color} flex items-center justify-center shadow-lg hidden md:flex`}>
                          <span className="text-white font-bold text-sm">{year.key.replace('year', '')}</span>
                        </div>
                        
                        <Card className="border-0 shadow-md bg-white overflow-hidden">
                          <div className={`h-1.5 bg-gradient-to-r ${year.color}`}></div>
                          <CardContent className="p-5">
                            <h4 className={`font-bold text-lg mb-3 bg-gradient-to-r ${year.color} bg-clip-text text-transparent`}>
                              {year.label}
                            </h4>
                            {typeof data === 'object' ? (
                              <div className="space-y-3">
                                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                  <p className="text-sm"><span className="font-semibold text-gray-700">التركيز:</span> <span className="text-gray-600">{data.focus}</span></p>
                                  <p className="text-sm"><span className="font-semibold text-gray-700">استراتيجية التمويل:</span> <span className="text-gray-600">{data.fundingStrategy}</span></p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-1 mb-1">
                                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                                      <span className="text-xs text-emerald-600 font-semibold">الإيرادات</span>
                                    </div>
                                    <p className="text-emerald-800 font-bold text-sm">{data.expectedRevenue}</p>
                                  </div>
                                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                    <div className="flex items-center gap-1 mb-1">
                                      <BarChart3 className="h-3 w-3 text-red-500" />
                                      <span className="text-xs text-red-600 font-semibold">المصروفات</span>
                                    </div>
                                    <p className="text-red-800 font-bold text-sm">{data.expectedExpenses}</p>
                                  </div>
                                </div>
                                {data[year.milestone] && (
                                  <div className={`p-3 bg-gradient-to-r ${year.lightBg} rounded-xl border border-gray-100`}>
                                    <span className="text-xs font-semibold text-gray-600">{year.milestoneLabel}:</span>
                                    <p className="text-sm font-medium text-gray-800 mt-1">{data[year.milestone]}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-700 text-sm">{data}</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ═══════════ فاصل زخرفي ═══════════ */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent"></div>
              <AlertCircle className="h-4 w-4 text-red-300" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent"></div>
            </div>

            {/* ═══════════════ تحليل المخاطر ═══════════════ */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-md">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">تحليل المخاطر على الاستدامة</h2>
              </div>
              
              <div className="space-y-3">
                {risks?.map((risk: any, index: number) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
                    <div className={`h-1.5 ${
                      risk.severity === 'عالية' || risk.severity === 'high' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                      risk.severity === 'متوسطة' || risk.severity === 'medium' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                      'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}></div>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          risk.severity === 'عالية' || risk.severity === 'high' ? 'bg-red-100' :
                          risk.severity === 'متوسطة' || risk.severity === 'medium' ? 'bg-amber-100' :
                          'bg-blue-100'
                        }`}>
                          <AlertCircle className={`h-5 w-5 ${
                            risk.severity === 'عالية' || risk.severity === 'high' ? 'text-red-600' :
                            risk.severity === 'متوسطة' || risk.severity === 'medium' ? 'text-amber-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-800">{risk.title}</h4>
                            <Badge className={`text-xs border-0 ${
                              risk.severity === 'عالية' || risk.severity === 'high' ? 'bg-red-100 text-red-700' :
                              risk.severity === 'متوسطة' || risk.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {risk.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{risk.description}</p>
                          
                          <div className="space-y-2">
                            {risk.financialImpact && (
                              <div className="flex items-start gap-2 p-2.5 bg-orange-50 rounded-lg">
                                <DollarSign className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-orange-700">الأثر المالي</span>
                                  <p className="text-xs text-gray-600 mt-0.5">{risk.financialImpact}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-start gap-2 p-2.5 bg-emerald-50 rounded-lg">
                              <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-semibold text-emerald-700">استراتيجية التخفيف</span>
                                <p className="text-xs text-gray-600 mt-0.5">{risk.mitigation}</p>
                              </div>
                            </div>
                            {risk.contingencyPlan && (
                              <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg">
                                <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-semibold text-blue-700">الخطة البديلة</span>
                                  <p className="text-xs text-gray-600 mt-0.5">{risk.contingencyPlan}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* ═══════════ أزرار الإجراءات ═══════════ */}
            <div className="flex gap-3 justify-center pt-4 pb-8">
              <Button 
                onClick={handleExportPDF}
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Download className="h-4 w-4 ml-2" />
                تصدير PDF
              </Button>
              <Button 
                onClick={handleCopyContent}
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                <Copy className="h-4 w-4 ml-2" />
                نسخ المحتوى
              </Button>
              <Button 
                onClick={handleGenerateAnalysis}
                disabled={generateAnalysis.isPending}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md"
              >
                {generateAnalysis.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 ml-2" />
                    تحديث التحليل
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
