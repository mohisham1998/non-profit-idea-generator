import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, CheckCircle, TrendingUp, Sparkles, Target, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import Background3D from '@/components/Background3D';
import Navbar from '@/components/Navbar';

type EvaluationMethodology = 'logframe' | 'theory-of-change' | 'results-based' | 'participatory';

interface EvaluationForm {
  programName: string;
  programDescription: string;
  objectives: string;
  targetBeneficiaries: string;
  outcomes: string;
  challenges: string;
}

interface EvaluationReport {
  executiveSummary: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
  recommendations: string;
  successIndicators: string;
  qualityScore: number;
}

export default function ProgramEvaluation() {
  const [, setLocation] = useLocation();
  const [selectedMethodology, setSelectedMethodology] = useState<EvaluationMethodology | null>(null);
  const [formData, setFormData] = useState<EvaluationForm>({
    programName: '',
    programDescription: '',
    objectives: '',
    targetBeneficiaries: '',
    outcomes: '',
    challenges: '',
  });
  const [evaluationResult, setEvaluationResult] = useState<{
    report: EvaluationReport;
    methodology: EvaluationMethodology;
  } | null>(null);

  const evaluateMutation = trpc.evaluation.evaluateProgram.useMutation({
    onSuccess: (data) => {
      setEvaluationResult(data);
      toast.success('تم إنشاء التقرير بنجاح');
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ في إنشاء التقرير');
    },
  });

  const methodologies = [
    {
      id: 'logframe' as const,
      name: 'الإطار المنطقي',
      description: 'تقييم شامل باستخدام الإطار المنطقي (Logical Framework)',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'theory-of-change' as const,
      name: 'نظرية التغيير',
      description: 'تحليل سلسلة التغيير من المدخلات إلى التأثير',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'results-based' as const,
      name: 'الإدارة القائمة على النتائج',
      description: 'تقييم مركز على النتائج والمؤشرات القابلة للقياس',
      icon: Target,
      color: 'from-emerald-500 to-green-500',
    },
    {
      id: 'participatory' as const,
      name: 'التقييم التشاركي',
      description: 'تقييم يشارك فيه المستفيدون والشركاء',
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedMethodology) {
      toast.error('يرجى اختيار منهجية التقييم');
      return;
    }

    if (!formData.programName || !formData.programDescription) {
      toast.error('يرجى ملء البيانات الأساسية للبرنامج');
      return;
    }

    await evaluateMutation.mutateAsync({
      programName: formData.programName,
      programDescription: formData.programDescription,
      objectives: formData.objectives || undefined,
      targetBeneficiaries: formData.targetBeneficiaries || undefined,
      outcomes: formData.outcomes || undefined,
      challenges: formData.challenges || undefined,
      methodology: selectedMethodology,
    });
  };

  if (evaluationResult) {
    const { report, methodology } = evaluationResult;
    const methodologyName = methodologies.find(m => m.id === methodology)?.name;

    return (
      <div className="min-h-screen relative">
        <Background3D />
        
        {/* Header */}
        <Navbar />

        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Header Info */}
              <div className="mb-8 text-center animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                <div className="inline-flex items-center gap-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <h2 className="text-2xl md:text-3xl font-bold">تم إنشاء التقرير بنجاح</h2>
                </div>
                <p className="text-muted-foreground">
                  تم التقييم باستخدام منهجية: <span className="font-semibold text-primary">{methodologyName}</span>
                </p>
              </div>

              {/* Quality Score */}
              <Card className="shadow-lg border-0 glass glass-card-enhanced mb-6 animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">درجة جودة البرنامج</p>
                      <p className="text-4xl font-bold text-primary">
                        {report.qualityScore.toFixed(1)}/10
                      </p>
                    </div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                      <TrendingUp className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Executive Summary */}
              <Card className="shadow-lg border-0 glass glass-card-enhanced mb-6 animate-slide-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    الملخص التنفيذي
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {report.executiveSummary}
                  </p>
                </CardContent>
              </Card>

              {/* SWOT Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Strengths */}
                <Card className="shadow-lg border-0 glass glass-card-enhanced border-r-4 border-r-green-500 animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <span className="text-2xl">💪</span>
                      نقاط القوة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-line text-sm">
                      {report.strengths}
                    </p>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="shadow-lg border-0 glass glass-card-enhanced border-r-4 border-r-red-500 animate-slide-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <span className="text-2xl">⚠️</span>
                      نقاط الضعف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-line text-sm">
                      {report.weaknesses}
                    </p>
                  </CardContent>
                </Card>

                {/* Opportunities */}
                <Card className="shadow-lg border-0 glass glass-card-enhanced border-r-4 border-r-blue-500 animate-slide-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <span className="text-2xl">🌟</span>
                      الفرص
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-line text-sm">
                      {report.opportunities}
                    </p>
                  </CardContent>
                </Card>

                {/* Threats */}
                <Card className="shadow-lg border-0 glass glass-card-enhanced border-r-4 border-r-orange-500 animate-slide-up opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <span className="text-2xl">🚨</span>
                      التهديدات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-line text-sm">
                      {report.threats}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="shadow-lg border-0 glass glass-card-enhanced mb-6 animate-slide-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    التوصيات
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {report.recommendations}
                  </p>
                </CardContent>
              </Card>

              {/* Success Indicators */}
              <Card className="shadow-lg border-0 glass glass-card-enhanced mb-6 animate-slide-up opacity-0" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    مؤشرات النجاح
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {report.successIndicators}
                  </p>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 animate-slide-up opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                <Button
                  onClick={() => {
                    setEvaluationResult(null);
                    setSelectedMethodology(null);
                    setFormData({
                      programName: '',
                      programDescription: '',
                      objectives: '',
                      targetBeneficiaries: '',
                      outcomes: '',
                      challenges: '',
                    });
                  }}
                  className="flex-1 gap-2 gradient-primary border-0"
                >
                  تقييم برنامج جديد
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    const reportText = `
تقرير التقييم - ${methodologyName}

${report.executiveSummary}

نقاط القوة:
${report.strengths}

نقاط الضعف:
${report.weaknesses}

الفرص:
${report.opportunities}

التهديدات:
${report.threats}

التوصيات:
${report.recommendations}

مؤشرات النجاح:
${report.successIndicators}

درجة الجودة: ${report.qualityScore}/10
                    `;
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportText));
                    element.setAttribute('download', `evaluation-report-${Date.now()}.txt`);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    toast.success('تم تحميل التقرير بنجاح');
                  }}
                >
                  تحميل التقرير
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Background3D />
      
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-8 md:py-12 gradient-subtle">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* إطار زجاجي يجمع العناصر */}
            <div className="inline-block px-6 md:px-8 py-3 md:py-4 mb-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-orange-100/60 via-amber-50/60 to-orange-100/60 border border-orange-200/50 shadow-lg animate-scale-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600 mb-2">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 animate-pulse-soft text-primary" />
                مدعوم بالذكاء الاصطناعي
              </div>
              <p className="text-base md:text-lg font-semibold bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                تقييم احترافي وفق منهجيات عالمية
              </p>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              تقييم البرنامج أو المبادرة
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed px-2 animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              اختر منهجية التقييم وأكمل البيانات لإنشاء تقرير شامل
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Methodology Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {methodologies.map((methodology, index) => {
                const Icon = methodology.icon;
                return (
                  <Card
                    key={methodology.id}
                    onClick={() => setSelectedMethodology(methodology.id)}
                    className={`shadow-lg border-0 glass glass-card-enhanced cursor-pointer transition-all duration-300 hover:scale-105 animate-slide-up opacity-0 ${
                      selectedMethodology === methodology.id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    }`}
                    style={{ animationDelay: `${0.5 + index * 0.1}s`, animationFillMode: 'forwards' }}
                  >
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${methodology.color} flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{methodology.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {methodology.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            {/* Form */}
            {selectedMethodology && (
              <Card className="shadow-lg border-0 glass glass-card-enhanced animate-slide-up opacity-0" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10">
                  <CardTitle>بيانات البرنامج</CardTitle>
                  <CardDescription>
                    أكمل المعلومات التالية لإنشاء التقييم
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      اسم البرنامج أو المبادرة
                    </label>
                    <Input
                      name="programName"
                      value={formData.programName}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم البرنامج"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      وصف البرنامج
                    </label>
                    <Textarea
                      name="programDescription"
                      value={formData.programDescription}
                      onChange={handleInputChange}
                      placeholder="اشرح البرنامج بإيجاز"
                      dir="rtl"
                      className="min-h-24"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الأهداف الرئيسية
                    </label>
                    <Textarea
                      name="objectives"
                      value={formData.objectives}
                      onChange={handleInputChange}
                      placeholder="اذكر الأهداف الرئيسية للبرنامج"
                      dir="rtl"
                      className="min-h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الفئة المستهدفة
                    </label>
                    <Textarea
                      name="targetBeneficiaries"
                      value={formData.targetBeneficiaries}
                      onChange={handleInputChange}
                      placeholder="من هي الفئات المستفيدة من البرنامج"
                      dir="rtl"
                      className="min-h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      النتائج والمخرجات المتوقعة
                    </label>
                    <Textarea
                      name="outcomes"
                      value={formData.outcomes}
                      onChange={handleInputChange}
                      placeholder="ما هي النتائج المتوقعة من البرنامج"
                      dir="rtl"
                      className="min-h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      التحديات والعوائق
                    </label>
                    <Textarea
                      name="challenges"
                      value={formData.challenges}
                      onChange={handleInputChange}
                      placeholder="اذكر التحديات التي تواجه البرنامج"
                      dir="rtl"
                      className="min-h-20"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={evaluateMutation.isPending}
                    size="lg"
                    className="w-full gradient-primary border-0 gap-2"
                  >
                    {evaluateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري إنشاء التقرير...
                      </>
                    ) : (
                      'إنشاء التقرير'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
