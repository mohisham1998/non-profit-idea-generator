import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function BeforeAfter({ title, blocks, theme }: LayoutProps) {
  const mid = Math.ceil(blocks.length / 2);
  const before = blocks.slice(0, mid);
  const after = blocks.slice(mid, mid * 2);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border-2 border-dashed" style={{ borderColor: theme.secondaryColor + '60' }}>
          <h3 className="font-bold mb-3 text-center" style={{ color: theme.secondaryColor }}>قبل</h3>
          {before.map((b, i) => <p key={i} className="mb-2 text-right">{b.content}</p>)}
        </div>
        <div className="p-6 rounded-xl border-2" style={{ borderColor: theme.primaryColor + '60' }}>
          <h3 className="font-bold mb-3 text-center" style={{ color: theme.primaryColor }}>بعد</h3>
          {after.map((b, i) => <p key={i} className="mb-2 text-right">{b.content}</p>)}
        </div>
      </div>
    </LayoutBase>
  );
}
