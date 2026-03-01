import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function Pillars3({ title, blocks, theme }: LayoutProps) {
  const n = Math.ceil(blocks.length / 3);
  const pillars = [blocks.slice(0, n), blocks.slice(n, n * 2), blocks.slice(n * 2, n * 3)];

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((p, i) => (
          <div key={i} className="p-6 rounded-xl border-2 text-center" style={{ borderColor: theme.primaryColor + '60', backgroundColor: theme.primaryColor + '10' }}>
            <span className="inline-flex w-12 h-12 rounded-full items-center justify-center font-bold text-lg mb-3" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>{i + 1}</span>
            {p.map((b, j) => <p key={j} className="mb-2">{b.content}</p>)}
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
