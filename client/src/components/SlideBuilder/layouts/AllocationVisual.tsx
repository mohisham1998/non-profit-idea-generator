import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function AllocationVisual({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 6).map((b) => {
    const val = b.type === 'stat' && typeof b.value === 'number' ? b.value : 100 / 6;
    return { label: b.type === 'stat' ? b.label ?? b.content : b.content, value: Math.max(0, val) };
  });
  const total = items.reduce((s, i) => s + i.value, 0) || 1;

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="flex flex-wrap gap-1 rounded-xl overflow-hidden">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex-1 min-w-[60px] p-3 text-center text-white text-sm font-bold"
            style={{ backgroundColor: [theme.primaryColor, theme.secondaryColor, theme.accentColor][i % 3], flex: item.value / total }}
          >
            {item.label}
            <span className="block text-xs opacity-90">{item.value}</span>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between text-sm">
            <span>{item.label}</span>
            <span className="font-bold" style={{ color: theme.primaryColor }}>{item.value} ({(item.value / total * 100).toFixed(0)}%)</span>
          </li>
        ))}
      </ul>
    </LayoutBase>
  );
}
