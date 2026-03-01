import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function CoverSplit({ title, blocks, theme, images }: LayoutProps) {
  const subtitle = blocks[0]?.content ?? '';
  const img = images[0]?.url;

  return (
    <LayoutBase>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.primaryColor }}>
            {title}
          </h1>
          {subtitle && <p className="text-lg opacity-90">{subtitle}</p>}
        </div>
        <div className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center min-h-[200px]">
          {img ? (
            <img src={img} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 text-sm">صورة</div>
          )}
        </div>
      </div>
    </LayoutBase>
  );
}
