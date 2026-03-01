import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase, BlockCard } from './LayoutBase';

export function Split3070({ title, blocks, theme, images }: LayoutProps) {
  const img = images[0]?.url;

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6 flex-1">
        <div className="md:col-span-3 space-y-3">
          {blocks.map((b, i) => (
            <BlockCard key={i} block={b} theme={theme} />
          ))}
        </div>
        <div className="md:col-span-7 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[250px]">
          {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : (
            <div className="text-gray-400 text-sm">صورة</div>
          )}
        </div>
      </div>
    </LayoutBase>
  );
}
