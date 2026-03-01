/**
 * AI Agents Panel — Image generation & Slide maker model selection
 * Each model has its own section with dropdown and Test button.
 */
import { useState } from 'react';
import { X, Image, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { IMAGE_MODELS, getSelectedImageModel, setSelectedImageModel } from '@/lib/imageModels';
import { ModelSelector } from '@/components/ModelSelector';
import { useDashboardStore } from '@/store/useStore';

interface AIAgentsPanelProps {
  onClose: () => void;
}

export function AIAgentsPanel({ onClose }: AIAgentsPanelProps) {
  const defaultImageModel = IMAGE_MODELS[0]?.id ?? 'black-forest-labs/flux.2-flex';
  const [imageModelId, setImageModelId] = useState(getSelectedImageModel() ?? defaultImageModel);
  const [imageTestResult, setImageTestResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [slideTestResult, setSlideTestResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const imageTestMutation = trpc.images.testModel.useMutation({
    onSuccess: (data) => {
      setImageTestResult({ success: data.success });
      if (data.success) {
        toast.success(`تم التحقق من ${IMAGE_MODELS.find((m) => m.id === data.modelId)?.name ?? data.modelId}`);
      } else {
        toast.error(data.error ?? 'فشل اختبار النموذج');
      }
    },
    onError: (e) => {
      setImageTestResult({ success: false, error: e.message });
      toast.error(e.message);
    },
  });

  const slideTestMutation = trpc.ideas.testModel.useMutation({
    onSuccess: (data) => {
      setSlideTestResult({ success: data.success });
      if (data.success) {
        toast.success('تم التحقق من نموذج صنع الشرائح');
      } else {
        toast.error(data.error ?? 'فشل اختبار النموذج');
      }
    },
    onError: (e) => {
      setSlideTestResult({ success: false, error: e.message });
      toast.error(e.message);
    },
  });

  const handleImageModelChange = (value: string) => {
    setImageModelId(value);
    setSelectedImageModel(value);
    setImageTestResult(null);
  };

  const handleImageTest = () => {
    setImageTestResult(null);
    imageTestMutation.mutate({ modelId: imageModelId });
  };

  const handleSlideTest = () => {
    setSlideTestResult(null);
    const modelId = useDashboardStore.getState().selectedModelId;
    if (!modelId) {
      toast.error('يرجى اختيار نموذج صنع الشرائح أولاً');
      return;
    }
    slideTestMutation.mutate({ modelId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" dir="rtl">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">وكلاء الذكاء الاصطناعي</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Image Generation Agent */}
          <section className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 font-medium">
              <Image className="h-5 w-5" />
              نموذج توليد الصور
            </div>
            <p className="text-sm text-muted-foreground">
              اختر النموذج لتوليد صور الشرائح بالذكاء الاصطناعي.
            </p>
            <div className="flex gap-2">
              <Select value={imageModelId} onValueChange={handleImageModelChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="اختر النموذج" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        {m.name}
                        {m.verified && (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" title="موثق" />
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImageTest}
                disabled={imageTestMutation.isPending}
              >
                {imageTestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'اختبار'
                )}
              </Button>
            </div>
            {imageTestResult && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  imageTestResult.success ? 'text-emerald-600' : 'text-destructive'
                }`}
              >
                {imageTestResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {imageTestResult.success ? 'تم التحقق' : imageTestResult.error ?? 'فشل'}
              </div>
            )}
          </section>

          {/* Slide Maker Agent */}
          <section className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 font-medium">
              <FileText className="h-5 w-5" />
              نموذج صنع الشرائح
            </div>
            <p className="text-sm text-muted-foreground">
              النموذج المستخدم لتوليد أفكار البرامج والشرائح.
            </p>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <ModelSelector />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSlideTest}
                disabled={slideTestMutation.isPending}
              >
                {slideTestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'اختبار'
                )}
              </Button>
            </div>
            {slideTestResult && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  slideTestResult.success ? 'text-emerald-600' : 'text-destructive'
                }`}
              >
                {slideTestResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {slideTestResult.success ? 'تم التحقق' : slideTestResult.error ?? 'فشل'}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
