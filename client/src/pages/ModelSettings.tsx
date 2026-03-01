/**
 * ModelSettings — النماذج الذكية
 *
 * Searchable dropdown of curated AI models with complexity, pricing, and quota impact.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore } from '@/store/useStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const COMPLEXITY_LABELS: Record<string, string> = {
  basic: 'أساسي',
  standard: 'قياسي',
  advanced: 'متقدم',
};

const COMPLEXITY_COLORS: Record<string, string> = {
  basic: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  standard: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  advanced: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
};

function formatPricing(prompt: number, completion: number): string {
  const p = (prompt * 1_000_000).toFixed(2);
  const c = (completion * 1_000_000).toFixed(2);
  return `$${p} / $${c} (1M tokens)`;
}

function formatQuotaImpact(estCost: number, complexity?: string): string {
  let impact: string;
  if (estCost < 0.001) impact = 'منخفض جداً';
  else if (estCost < 0.01) impact = 'منخفض';
  else if (estCost < 0.05) impact = 'متوسط';
  else impact = 'مرتفع';
  // Advanced models never show "very low" – reflect their higher resource usage
  if (complexity === 'advanced' && (impact === 'منخفض جداً' || impact === 'منخفض')) {
    impact = 'متوسط';
  }
  return impact;
}

export default function ModelSettings() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, refetch } = trpc.adminDashboard.getModels.useQuery();
  const { data: selectedData } = trpc.adminDashboard.getSelectedModel.useQuery();
  const updateMutation = trpc.adminDashboard.updateSelectedModel.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ النموذج المختار');
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const storeSelectedId = useDashboardStore((s) => s.selectedModelId);
  const setSelectedModel = useDashboardStore((s) => s.setSelectedModel);
  const setAvailableModels = useDashboardStore((s) => s.setAvailableModels);
  const setModelsLoading = useDashboardStore((s) => s.setModelsLoading);
  const setModelsError = useDashboardStore((s) => s.setModelsError);

  // Use store for immediate UI update on select; fall back to server when store is empty
  const selectedModelId = storeSelectedId ?? selectedData?.selectedModelId ?? null;

  useEffect(() => {
    setModelsLoading(isLoading);
  }, [isLoading, setModelsLoading]);

  useEffect(() => {
    if (data) {
      setModelsError(data.error ?? null);
      if (data.models?.length) {
        setAvailableModels(
          data.models.map((m: { id: string; name: string }) => ({
            id: m.id,
            name: m.name,
          }))
        );
      }
    }
  }, [data, setAvailableModels, setModelsError]);

  useEffect(() => {
    if (selectedModelId) setSelectedModel(selectedModelId);
  }, [selectedModelId, setSelectedModel]);

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    updateMutation.mutate({ modelId });
  };

  const hasError = data?.error != null;
  const models = (data?.models ?? []) as Array<{
    id: string;
    name: string;
    provider: string;
    complexity: string;
    pricing?: { prompt: number; completion: number };
    estCostPerIdea?: number;
  }>;
  const selectedModel = models.find((m) => m.id === selectedModelId);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="h-7 w-7 text-cyan-500" />
          النماذج الذكية
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          اختر نموذج الذكاء الاصطناعي لتوليد الأفكار. النماذج المعروضة موثوقة ومناسبة لهذه المهمة.
        </p>
      </div>

      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-800 dark:text-amber-200">تعذر جلب قائمة النماذج</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{data?.error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'إعادة المحاولة'}
            </Button>
          </div>
        </motion.div>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            <p className="text-slate-600 dark:text-slate-400">جاري جلب النماذج...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !hasError && models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>النموذج المختار</CardTitle>
            <CardDescription>اختر نموذجاً من القائمة — يمكنك البحث بالاسم</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between min-h-[56px] h-auto py-3"
                >
                  {selectedModel ? (
                    <div className="flex flex-col items-start gap-1 text-right w-full">
                      <span className="font-medium">{selectedModel.name}</span>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className={cn('text-xs', COMPLEXITY_COLORS[selectedModel.complexity] || '')}>
                          {COMPLEXITY_LABELS[selectedModel.complexity] || selectedModel.complexity}
                        </Badge>
                        {selectedModel.pricing && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatPricing(selectedModel.pricing.prompt, selectedModel.pricing.completion)}
                          </span>
                        )}
                        {selectedModel.estCostPerIdea != null && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            استهلاك: {formatQuotaImpact(selectedModel.estCostPerIdea, selectedModel.complexity)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">اختر نموذجاً...</span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="بحث عن نموذج..." />
                  <CommandList>
                    <CommandEmpty>لا توجد نتائج</CommandEmpty>
                    <CommandGroup>
                      {models.map((m) => (
                        <CommandItem
                          key={m.id}
                          value={`${m.name} ${m.id} ${m.provider}`}
                          onSelect={() => handleSelect(m.id)}
                          className="flex flex-col items-stretch gap-1 py-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{m.name}</span>
                            <Badge variant="secondary" className={cn('shrink-0 text-xs', COMPLEXITY_COLORS[m.complexity] || '')}>
                              {COMPLEXITY_LABELS[m.complexity] || m.complexity}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            {m.pricing && (
                              <span>التسعير: {formatPricing(m.pricing.prompt, m.pricing.completion)}</span>
                            )}
                            {m.estCostPerIdea != null && (
                              <span>التأثير على الحصة: {formatQuotaImpact(m.estCostPerIdea, m.complexity)}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      )}

      {!isLoading && !hasError && models.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            لا توجد نماذج متاحة. تأكد من إعداد OPENROUTER_API_KEY.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
