import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function FunnelJourney({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 5);
  const widths = items.map((_, i) => 100 - i * 15);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="flex flex-col items-center gap-2">
        {items.map((b, i) => (
          <div
            key={i}
            className="p-4 rounded-lg text-center text-right transition-all"
            style={{ width: `${Math.max(40, widths[i])}%`, backgroundColor: theme.primaryColor + (20 - i * 3).toString().padStart(2, '0'), borderColor: theme.primaryColor + '60', borderWidth: 1 }}
          >
            <p className="text-sm">{b.content}</p>
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
