import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase, BlockCard } from './LayoutBase';

export function Split5050({ title, blocks, theme, images }: LayoutProps) {
  const mid = Math.ceil(blocks.length / 2);
  const left = blocks.slice(0, mid);
  const right = blocks.slice(mid);
  const img = images[0]?.url;

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        <div className="space-y-3">
          {left.map((b, i) => (
            <BlockCard key={i} block={b} theme={theme} />
          ))}
        </div>
        <div className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[200px]">
          {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : (
            <div className="space-y-3 w-full p-4">
              {right.map((b, i) => (
                <BlockCard key={i} block={b} theme={theme} />
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutBase>
  );
}
