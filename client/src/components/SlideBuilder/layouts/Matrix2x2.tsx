import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function Matrix2x2({ title, blocks, theme }: LayoutProps) {
  const n = Math.ceil(blocks.length / 4);
  const quadrants = [blocks.slice(0, n), blocks.slice(n, n * 2), blocks.slice(n * 2, n * 3), blocks.slice(n * 3, n * 4)];

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {quadrants.map((q, i) => (
          <div key={i} className="p-4 rounded-xl border-2 text-center" style={{ borderColor: theme.primaryColor + '50', backgroundColor: theme.primaryColor + '08' }}>
            {q.map((b, j) => <p key={j} className="mb-2 text-sm">{b.content}</p>)}
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
