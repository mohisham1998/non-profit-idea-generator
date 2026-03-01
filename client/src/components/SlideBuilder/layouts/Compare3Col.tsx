import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function Compare3Col({ title, blocks, theme }: LayoutProps) {
  const n = Math.ceil(blocks.length / 3);
  const col1 = blocks.slice(0, n);
  const col2 = blocks.slice(n, n * 2);
  const col3 = blocks.slice(n * 2, n * 3);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border text-right" style={{ borderColor: theme.primaryColor + '50' }}>
          {col1.map((b, i) => <p key={i} className="mb-2">{b.content}</p>)}
        </div>
        <div className="p-4 rounded-lg border text-right" style={{ borderColor: theme.secondaryColor + '50' }}>
          {col2.map((b, i) => <p key={i} className="mb-2">{b.content}</p>)}
        </div>
        <div className="p-4 rounded-lg border text-right" style={{ borderColor: theme.accentColor + '50' }}>
          {col3.map((b, i) => <p key={i} className="mb-2">{b.content}</p>)}
        </div>
      </div>
    </LayoutBase>
  );
}
