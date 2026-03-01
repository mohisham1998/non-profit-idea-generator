import { TrendingUp } from 'lucide-react';
import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function KpiListIcons({ title, blocks, theme }: LayoutProps) {
  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <ul className="space-y-3">
        {blocks.map((b, i) => (
          <li key={i} className="flex gap-3 items-start">
            <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: theme.primaryColor }} />
            {b.type === 'stat' && b.value != null ? (
              <div>
                <span className="font-bold" style={{ color: theme.primaryColor }}>{b.value}{b.unit || ''}</span>
                {b.label && <span className="me-2"> - {b.label}</span>}
              </div>
            ) : (
              <span>{b.content}</span>
            )}
          </li>
        ))}
      </ul>
    </LayoutBase>
  );
}
