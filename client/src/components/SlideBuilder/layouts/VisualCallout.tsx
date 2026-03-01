import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function VisualCallout({ title, blocks, theme, images }: LayoutProps) {
  const callout = blocks[0]?.content ?? '';
  const img = images[0]?.url;

  return (
    <LayoutBase>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden bg-gray-100 min-h-[250px]">
          {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">صورة</div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
          <p className="text-lg p-4 rounded-lg" style={{ backgroundColor: theme.primaryColor + '15', borderRight: `4px solid ${theme.primaryColor}` }}>
            {callout}
          </p>
        </div>
      </div>
    </LayoutBase>
  );
}
