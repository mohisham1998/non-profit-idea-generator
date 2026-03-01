import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function Pillars4({ title, blocks, theme }: LayoutProps) {
  const n = Math.ceil(blocks.length / 4);
  const pillars = [blocks.slice(0, n), blocks.slice(n, n * 2), blocks.slice(n * 2, n * 3), blocks.slice(n * 3, n * 4)];

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pillars.map((p, i) => (
          <div key={i} className="p-4 rounded-xl border-2 text-center" style={{ borderColor: theme.primaryColor + '50', backgroundColor: theme.primaryColor + '08' }}>
            <span className="inline-flex w-10 h-10 rounded-full items-center justify-center font-bold text-sm mb-2" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>{i + 1}</span>
            {p.map((b, j) => <p key={j} className="text-sm mb-1">{b.content}</p>)}
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
