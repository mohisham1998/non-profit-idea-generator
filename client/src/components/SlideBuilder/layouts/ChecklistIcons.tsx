import { CheckCircle2 } from 'lucide-react';
import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function ChecklistIcons({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 10);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <ul className="space-y-3 list-none p-0 m-0">
        {items.map((b, i) => (
          <li key={i} className="flex gap-3 items-start">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: theme.primaryColor }} />
            <span>{b.content}</span>
          </li>
        ))}
      </ul>
    </LayoutBase>
  );
}
