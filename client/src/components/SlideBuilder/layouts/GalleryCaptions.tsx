import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function GalleryCaptions({ title, blocks, theme, images }: LayoutProps) {
  const items = blocks.length > 0 ? blocks : images.map((_, i) => ({ type: 'paragraph' as const, content: `عنصر ${i + 1}` }));

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.slice(0, 6).map((block, i) => (
          <div key={i} className="rounded-lg overflow-hidden border" style={{ borderColor: theme.primaryColor + '40' }}>
            {images[i]?.url ? (
              <img src={images[i].url} alt="" className="w-full h-32 object-cover" />
            ) : (
              <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">صورة</div>
            )}
            <p className="p-2 text-sm">{block.content}</p>
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
