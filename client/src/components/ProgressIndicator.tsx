import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface ProgressStage {
  label: string;
  duration: number; // بالميلي ثانية
}

interface ProgressIndicatorProps {
  isGenerating: boolean;
  stages: ProgressStage[];
  title: string;
  icon?: React.ReactNode;
}

export function ProgressIndicator({ 
  isGenerating, 
  stages, 
  title,
  icon = <Sparkles className="h-5 w-5" />
}: ProgressIndicatorProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStageIndex(0);
      setProgress(0);
      setStageProgress(0);
      return;
    }

    // حساب إجمالي المدة
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    
    // حساب المدة المنقضية حتى المرحلة الحالية
    const elapsedDuration = stages
      .slice(0, currentStageIndex)
      .reduce((sum, stage) => sum + stage.duration, 0);

    // تحديث التقدم داخل المرحلة الحالية
    const currentStageDuration = stages[currentStageIndex]?.duration || 1000;
    const interval = setInterval(() => {
      setStageProgress((prev) => {
        if (prev >= 100) {
          // الانتقال للمرحلة التالية
          if (currentStageIndex < stages.length - 1) {
            setCurrentStageIndex((idx) => idx + 1);
            return 0;
          }
          return 100;
        }
        return prev + (100 / (currentStageDuration / 100));
      });
    }, 100);

    // تحديث التقدم الإجمالي
    const overallProgress = ((elapsedDuration + (stageProgress / 100) * currentStageDuration) / totalDuration) * 100;
    setProgress(Math.min(overallProgress, 95)); // لا نصل إلى 100% حتى ينتهي التوليد فعلياً

    return () => clearInterval(interval);
  }, [isGenerating, currentStageIndex, stageProgress, stages]);

  // إعادة التعيين عند انتهاء التوليد
  useEffect(() => {
    if (!isGenerating && progress > 0) {
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setCurrentStageIndex(0);
        setStageProgress(0);
      }, 1000);
    }
  }, [isGenerating, progress]);

  if (!isGenerating) return null;

  const currentStage = stages[currentStageIndex];

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg">
      <CardContent className="py-8 px-6">
        <div className="space-y-6">
          {/* العنوان والأيقونة */}
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl animate-pulse">
              {icon}
            </div>
            <h3 className="text-xl font-bold text-purple-900">{title}</h3>
          </div>

          {/* شريط التقدم الإجمالي */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-700 font-medium">التقدم الإجمالي</span>
              <span className="text-purple-900 font-bold text-lg">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-3 bg-purple-100"
            />
          </div>

          {/* المرحلة الحالية */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span className="text-indigo-700 font-medium">
                {currentStage?.label || "جاري المعالجة..."}
              </span>
            </div>

            {/* شريط تقدم المرحلة الحالية */}
            <Progress 
              value={stageProgress} 
              className="h-2 bg-indigo-100"
            />
          </div>

          {/* قائمة المراحل */}
          <div className="mt-4 space-y-2">
            {stages.map((stage, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 text-sm transition-all ${
                  index < currentStageIndex
                    ? "text-green-600 font-medium"
                    : index === currentStageIndex
                    ? "text-indigo-700 font-semibold"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    index < currentStageIndex
                      ? "bg-green-500"
                      : index === currentStageIndex
                      ? "bg-indigo-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                <span>{stage.label}</span>
                {index < currentStageIndex && (
                  <span className="mr-auto">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* رسالة تشجيعية */}
          <div className="text-center text-sm text-purple-600 italic mt-4">
            الرجاء الانتظار... نقوم بتوليد محتوى عالي الجودة لك
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
