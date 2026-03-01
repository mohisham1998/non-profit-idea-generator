import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function Compare2Col({ title, blocks, theme }: LayoutProps) {
  const mid = Math.ceil(blocks.length / 2);
  const left = blocks.slice(0, mid);
  const right = blocks.slice(mid, mid * 2);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border-2 text-right" style={{ borderColor: theme.primaryColor + '60' }}>
          <ul className="space-y-2 list-disc list-inside">
            {left.map((b, i) => (
              <li key={i}>{b.content}</li>
            ))}
          </ul>
        </div>
        <div className="p-6 rounded-xl border-2 text-right" style={{ borderColor: theme.accentColor + '60' }}>
          <ul className="space-y-2 list-disc list-inside">
            {right.map((b, i) => (
              <li key={i}>{b.content}</li>
            ))}
          </ul>
        </div>
      </div>
    </LayoutBase>
  );
}
