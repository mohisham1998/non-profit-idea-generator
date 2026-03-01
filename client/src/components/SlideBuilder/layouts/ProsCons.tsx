import { Check, X } from 'lucide-react';
import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function ProsCons({ title, blocks, theme }: LayoutProps) {
  const mid = Math.ceil(blocks.length / 2);
  const pros = blocks.slice(0, mid);
  const cons = blocks.slice(mid, mid * 2);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: theme.primaryColor + '15' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: theme.primaryColor }}>
            <Check className="w-5 h-5" /> الإيجابيات
          </h3>
          <ul className="space-y-2">
            {pros.map((b, i) => <li key={i} className="flex gap-2 items-start"><Check className="w-4 h-4 flex-shrink-0 mt-1 text-green-600" />{b.content}</li>)}
          </ul>
        </div>
        <div className="p-6 rounded-xl" style={{ backgroundColor: theme.secondaryColor + '15' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: theme.secondaryColor }}>
            <X className="w-5 h-5" /> السلبيات
          </h3>
          <ul className="space-y-2">
            {cons.map((b, i) => <li key={i} className="flex gap-2 items-start"><X className="w-4 h-4 flex-shrink-0 mt-1 text-red-600" />{b.content}</li>)}
          </ul>
        </div>
      </div>
    </LayoutBase>
  );
}
