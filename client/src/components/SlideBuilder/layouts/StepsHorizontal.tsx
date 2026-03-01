import { ChevronLeft } from 'lucide-react';
import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function StepsHorizontal({ title, blocks, theme }: LayoutProps) {
  const steps = blocks.slice(0, 6);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="flex flex-wrap items-stretch justify-center gap-2">
        {steps.map((b, i) => (
          <div key={i} className="flex items-center">
            <div className="p-4 rounded-xl border-2 min-w-[140px] text-center" style={{ borderColor: theme.primaryColor + '60', backgroundColor: theme.primaryColor + '10' }}>
              <span className="inline-flex w-8 h-8 rounded-full items-center justify-center font-bold text-sm mb-2" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>{i + 1}</span>
              <p className="text-sm">{b.content}</p>
            </div>
            {i < steps.length - 1 && <ChevronLeft className="w-6 h-6 flex-shrink-0 rotate-180 opacity-50" style={{ color: theme.primaryColor }} />}
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
