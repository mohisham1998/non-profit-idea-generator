import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Star,
  Trophy,
  Target,
  Heart,
  Shield,
  Rocket,
  TrendingUp,
  Lightbulb,
  Users,
  DollarSign,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
// Toast notification handled inline

interface UniqueStrength {
  title: string;
  description: string;
  icon: string;
}

interface CompetitiveAdvantage {
  advantage: string;
  comparison: string;
  score: number;
}

interface MarketGap {
  gap: string;
  opportunity: string;
  potential: string;
}

interface UniqueSellingPoint {
  usp: string;
  marketingMessage: string;
  targetAudience: string;
}

interface DonorAttractionFactor {
  factor: string;
  reason: string;
  donorType: string;
}

interface ImprovementRecommendation {
  recommendation: string;
  impact: string;
  priority: string;
  timeframe: string;
}

interface OverallScore {
  uniqueness: number;
  marketFit: number;
  donorAppeal: number;
  scalability: number;
  overall: number;
}

interface ValueAddAnalysisData {
  uniqueStrengths: UniqueStrength[];
  competitiveAdvantages: CompetitiveAdvantage[];
  marketGaps: MarketGap[];
  uniqueSellingPoints: UniqueSellingPoint[];
  donorAttractionFactors: DonorAttractionFactor[];
  improvementRecommendations: ImprovementRecommendation[];
  overallScore: OverallScore;
  executiveSummary: string;
  tagline: string;
}

interface ValueAddAnalysisProps {
  analysis: ValueAddAnalysisData;
  programName: string;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  trophy: Trophy,
  target: Target,
  heart: Heart,
  shield: Shield,
  rocket: Rocket,
};

const getIcon = (iconName: string) => {
  const Icon = iconMap[iconName.toLowerCase()] || Star;
  return Icon;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'عالية':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'متوسطة':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'منخفضة':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPotentialColor = (potential: string) => {
  switch (potential) {
    case 'عالية':
      return 'bg-emerald-100 text-emerald-800';
    case 'متوسطة':
      return 'bg-blue-100 text-blue-800';
    case 'منخفضة':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

const getProgressColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

export function ValueAddAnalysis({ analysis, programName, onClose }: ValueAddAnalysisProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('فشل نسخ النص:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">تحليل القيمة المضافة</h2>
                <p className="text-white/80 text-sm mt-1">{programName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Tagline */}
          <div className="mt-4 bg-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-300" />
              <p className="text-lg font-medium">{analysis.tagline}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(analysis.tagline, 'tagline')}
              className="text-white hover:bg-white/20"
            >
              {copiedItem === 'tagline' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Overall Score */}
          <div className="mt-4 grid grid-cols-5 gap-3">
            {[
              { label: 'التفرد', value: analysis.overallScore.uniqueness, icon: Star },
              { label: 'ملاءمة السوق', value: analysis.overallScore.marketFit, icon: Target },
              { label: 'جاذبية الممولين', value: analysis.overallScore.donorAppeal, icon: DollarSign },
              { label: 'قابلية التوسع', value: analysis.overallScore.scalability, icon: TrendingUp },
              { label: 'الإجمالي', value: analysis.overallScore.overall, icon: Trophy },
            ].map((item, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-3 text-center">
                <item.icon className="w-5 h-5 mx-auto mb-1 text-white/80" />
                <div className="text-2xl font-bold">{item.value}%</div>
                <div className="text-xs text-white/70">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="summary" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="summary">الملخص</TabsTrigger>
              <TabsTrigger value="strengths">نقاط التميز</TabsTrigger>
              <TabsTrigger value="competitive">المنافسة</TabsTrigger>
              <TabsTrigger value="usps">نقاط البيع</TabsTrigger>
              <TabsTrigger value="donors">جذب الممولين</TabsTrigger>
              <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    الملخص التنفيذي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {analysis.executiveSummary}
                  </p>
                </CardContent>
              </Card>

              {/* Score Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    تفاصيل التقييم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'درجة التفرد', value: analysis.overallScore.uniqueness, description: 'مدى تميز البرنامج عن البرامج المشابهة' },
                    { label: 'ملاءمة السوق', value: analysis.overallScore.marketFit, description: 'مدى توافق البرنامج مع احتياجات السوق' },
                    { label: 'جاذبية الممولين', value: analysis.overallScore.donorAppeal, description: 'مدى جاذبية البرنامج للجهات المانحة' },
                    { label: 'قابلية التوسع', value: analysis.overallScore.scalability, description: 'إمكانية توسيع نطاق البرنامج مستقبلاً' },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        <span className={`font-bold ${getScoreColor(item.value)}`}>{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Unique Strengths Tab */}
            <TabsContent value="strengths" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.uniqueStrengths.map((strength, index) => {
                  const Icon = getIcon(strength.icon);
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{strength.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{strength.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Competitive Advantages Tab */}
            <TabsContent value="competitive" className="space-y-6">
              {/* Competitive Advantages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    المزايا التنافسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.competitiveAdvantages.map((item, index) => (
                    <div key={index} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{item.advantage}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">درجة التفوق:</span>
                          <Badge variant="outline" className={`${item.score >= 8 ? 'bg-emerald-100 text-emerald-800' : item.score >= 6 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {item.score}/10
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{item.comparison}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Market Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    فجوات السوق والفرص
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.marketGaps.map((item, index) => (
                    <div key={index} className="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{item.gap}</h4>
                        <Badge className={getPotentialColor(item.potential)}>
                          إمكانية {item.potential}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600 text-sm">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <p>{item.opportunity}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* USPs Tab */}
            <TabsContent value="usps" className="space-y-4">
              {analysis.uniqueSellingPoints.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <h3 className="font-bold text-lg text-gray-900">{item.usp}</h3>
                        </div>
                        <div className="bg-gradient-to-l from-emerald-50 to-teal-50 rounded-lg p-4 mb-3">
                          <p className="text-emerald-800 font-medium">"{item.marketingMessage}"</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>الجمهور المستهدف: {item.targetAudience}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(item.marketingMessage, `usp-${index}`)}
                        className="flex-shrink-0"
                      >
                        {copiedItem === `usp-${index}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Donor Attraction Tab */}
            <TabsContent value="donors" className="space-y-4">
              {analysis.donorAttractionFactors.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{item.factor}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.reason}</p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          مناسب لـ: {item.donorType}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              {analysis.improvementRecommendations.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-bold text-lg text-gray-900">{item.recommendation}</h3>
                      <Badge className={getPriorityColor(item.priority)}>
                        أولوية {item.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{item.impact}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">الإطار الزمني: {item.timeframe}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <Button onClick={onClose} variant="outline">
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
