import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function TextOverlay({ title, blocks, theme, images }: LayoutProps) {
  const img = images[0]?.url;
  const text = blocks[0]?.content ?? title;

  return (
    <LayoutBase>
      <div
        className="relative rounded-xl min-h-[400px] flex flex-col justify-end p-8"
        style={{
          background: img ? `linear-gradient(to top, rgba(0,0,0,0.7), transparent), url(${img}) center/cover` : theme.primaryColor + '20',
        }}
      >
        <h2 className="text-3xl font-bold text-white drop-shadow-md">{title}</h2>
        <p className="text-xl text-white/95 mt-2">{text}</p>
      </div>
    </LayoutBase>
  );
}
