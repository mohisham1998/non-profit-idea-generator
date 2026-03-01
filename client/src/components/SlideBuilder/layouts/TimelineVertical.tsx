import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function TimelineVertical({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 6);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="relative mr-6">
        <div className="absolute top-0 bottom-0 w-0.5" style={{ backgroundColor: theme.primaryColor + '60' }} />
        <div className="space-y-6">
          {items.map((b, i) => (
            <div key={i} className="flex gap-4">
              <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 z-10" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>{i + 1}</span>
              <div className="flex-1 pb-2">
                <p>{b.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutBase>
  );
}
