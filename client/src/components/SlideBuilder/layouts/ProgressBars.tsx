import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function ProgressBars({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 8).map((b) => {
    const val = b.type === 'stat' && typeof b.value === 'number' ? b.value : 50;
    return { label: b.type === 'stat' ? b.label ?? b.content : b.content, value: Math.min(100, Math.max(0, val)) };
  });

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span>{item.label}</span>
              <span className="font-bold" style={{ color: theme.primaryColor }}>{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: theme.primaryColor }} />
            </div>
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
