import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function CoverHero({ title, blocks, theme, images }: LayoutProps) {
  const subtitle = blocks[0]?.content ?? '';
  const bgImage = images.find((i) => i.position === 'background')?.url;

  return (
    <LayoutBase>
      <div
        className="flex flex-col items-center justify-center min-h-[500px] rounded-xl p-8"
        style={{
          background: bgImage ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${bgImage}) center/cover` : theme.primaryColor + '15',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4" style={{ color: theme.primaryColor }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-center opacity-90">{subtitle}</p>
        )}
      </div>
    </LayoutBase>
  );
}
