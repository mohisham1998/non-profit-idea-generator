import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function SwotGrid({ title, blocks, theme }: LayoutProps) {
  const n = Math.ceil(blocks.length / 4);
  const s = blocks.slice(0, n);
  const w = blocks.slice(n, n * 2);
  const o = blocks.slice(n * 2, n * 3);
  const t = blocks.slice(n * 3, n * 4);
  const labels = ['نقاط القوة', 'نقاط الضعف', 'الفرص', 'التهديدات'];
  const cells = [s, w, o, t];
  const colors = [theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.primaryColor];

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {cells.map((cell, i) => (
          <div key={i} className="p-4 rounded-xl border-2" style={{ borderColor: colors[i] + '60', backgroundColor: colors[i] + '10' }}>
            <h3 className="font-bold mb-2 text-center" style={{ color: colors[i] }}>{labels[i]}</h3>
            <ul className="space-y-1 list-disc list-inside text-sm">
              {cell.map((b, j) => <li key={j}>{b.content}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
