import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight, Lightbulb, Target, Rocket } from 'lucide-react';
import Background3D from '@/components/Background3D';
import Navbar from '@/components/Navbar';

export default function MethodologyChoice() {
  const [, setLocation] = useLocation();

  const handleEvaluationClick = () => {
    setLocation('/program-evaluation');
  };

  const handleGenerateClick = () => {
    setLocation('/home');
  };

  return (
    <div className="min-h-screen relative">
      {/* خلفية 3D متحركة */}
      <Background3D />
      
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="py-10 md:py-16 lg:py-24 gradient-subtle">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            {/* إطار زجاجي يجمع العناصر */}
            <div className="inline-block px-6 md:px-8 py-3 md:py-4 mb-6 md:mb-8 rounded-2xl backdrop-blur-md bg-gradient-to-r from-orange-100/60 via-amber-50/60 to-orange-100/60 border border-orange-200/50 shadow-lg animate-scale-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600 mb-2">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 animate-pulse-soft text-primary" />
                مدعوم بالذكاء الاصطناعي
              </div>
              <p className="text-base md:text-lg lg:text-xl font-semibold bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                اختر مسارك نحو التميز
              </p>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight animate-slide-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              أدوات متكاملة لتطوير
              <br />
              <span className="text-primary">برامجك ومبادراتك</span>
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed px-2 animate-slide-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              اختر الخدمة التي تناسب احتياجاتك - سواء كنت تريد توليد أفكار جديدة
              أو تقييم برامجك الحالية وفق منهجيات علمية معترف بها.
            </p>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Card 1: توليد الأفكار */}
              <Card 
                onClick={handleGenerateClick}
                className="shadow-lg border-0 glass glass-card-enhanced card-3d cursor-pointer transition-all duration-300 hover:scale-105 animate-slide-up opacity-0"
                style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
              >
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-amber-500/10 pb-4 p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-2xl flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                        توليد الأفكار
                      </CardTitle>
                      <CardDescription className="text-sm md:text-base">
                        حوّل أفكارك إلى برامج ومبادرات متكاملة
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 p-4 md:p-6">
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                      أداة ذكية تساعدك على تطوير أفكار البرامج والمبادرات بشكل احترافي ومتكامل
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      من الفكرة إلى النتائج المتوقعة، استخدم الذكاء الاصطناعي لتوليد برامج ومبادرات متكاملة تشمل الأهداف والمخرجات والأنشطة والميزانية.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-4">
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs md:text-sm font-medium">
                        توليد الأفكار
                      </span>
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs md:text-sm font-medium">
                        تصميم البرامج
                      </span>
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs md:text-sm font-medium">
                        تخطيط المبادرات
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: التقييم المنهجي */}
              <Card 
                onClick={handleEvaluationClick}
                className="shadow-lg border-0 glass glass-card-enhanced card-3d cursor-pointer transition-all duration-300 hover:scale-105 animate-slide-up opacity-0"
                style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}
              >
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 pb-4 p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-2xl flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        التقييم المنهجي
                      </CardTitle>
                      <CardDescription className="text-sm md:text-base">
                        خطوتك الأولى نحو تعظيم العائد على الاستثمار الاجتماعي
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-6 w-6 text-purple-600 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6 p-4 md:p-6">
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                      هل لديك برنامج أو مبادرة وتريد تقييمها وفق منهجية علمية؟
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      استخدم أدوات التقييم المتقدمة لقياس تأثير برنامجك بدقة واحترافية. اختر من بين عدة منهجيات معترف بها عالمياً لتقييم فعالية مبادرتك.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-4">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs md:text-sm font-medium">
                        قياس التأثير
                      </span>
                      <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs md:text-sm font-medium">
                        تقييم النتائج
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs md:text-sm font-medium">
                        تحسين الأداء
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer Info */}
            <div className="mt-12 text-center animate-slide-up opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100/60 via-amber-50/60 to-orange-100/60 border border-orange-200/50">
                <Rocket className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-600">أدوات متكاملة لتطوير وتقييم برامجك ومبادراتك بشكل احترافي</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
