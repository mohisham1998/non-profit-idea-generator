import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function NumberedBadges({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 10);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <ol className="space-y-3 list-none p-0 m-0">
        {items.map((b, i) => (
          <li key={i} className="flex gap-3 items-start min-h-[2.5rem]">
            <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>{i + 1}</span>
            <span className="pt-0.5 flex-1 min-w-0 break-words">{b.content}</span>
          </li>
        ))}
      </ol>
    </LayoutBase>
  );
}
