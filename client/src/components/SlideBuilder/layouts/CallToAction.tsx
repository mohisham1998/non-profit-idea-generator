import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function CallToAction({ title, blocks, theme }: LayoutProps) {
  const main = blocks[0];
  const sub = blocks.slice(1, 4);

  return (
    <LayoutBase>
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="flex flex-col items-center justify-center min-h-[180px] text-center">
        <p className="text-xl font-semibold mb-4">{main?.content}</p>
        {sub.length > 0 && (
          <ul className="space-y-2 text-sm opacity-90">
            {sub.map((b, i) => <li key={i}>{b.content}</li>)}
          </ul>
        )}
      </div>
    </LayoutBase>
  );
}
