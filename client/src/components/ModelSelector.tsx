/**
 * ModelSelector — US9: Compact model selector for slide generation
 * Allows users to select AI model from available OpenRouter models.
 */
import { useState } from 'react';
import { Cpu, ChevronDown, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export function ModelSelector() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = trpc.adminDashboard.getModels.useQuery();
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

  const selectedModelId = storeSelectedId ?? selectedData?.selectedModelId ?? null;
  const models = (data?.models ?? []) as Array<{
    id: string;
    name: string;
    provider: string;
    complexity: string;
    pricing?: { prompt: number; completion: number };
    estCostPerIdea?: number;
  }>;
  const selectedModel = models.find((m) => m.id === selectedModelId);

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    updateMutation.mutate({ modelId });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 min-w-[140px] justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Cpu className="h-4 w-4" />
              <span className="truncate">
                {selectedModel ? selectedModel.name : 'النموذج'}
              </span>
              {selectedModel && (
                <Badge variant="secondary" className={cn('text-xs shrink-0', COMPLEXITY_COLORS[selectedModel.complexity] || '')}>
                  {COMPLEXITY_LABELS[selectedModel.complexity] || selectedModel.complexity}
                </Badge>
              )}
            </>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
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
                  className="flex items-center justify-between gap-2"
                >
                  <span className="font-medium truncate">{m.name}</span>
                  <Badge variant="secondary" className={cn('shrink-0 text-xs', COMPLEXITY_COLORS[m.complexity] || '')}>
                    {COMPLEXITY_LABELS[m.complexity] || m.complexity}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
