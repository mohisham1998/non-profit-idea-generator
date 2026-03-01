import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function TimelineHorizontal({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 6);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="relative">
        <div className="hidden md:block absolute top-6 right-0 left-0 h-0.5" style={{ backgroundColor: theme.primaryColor + '60' }} />
        <div className="flex flex-wrap justify-between gap-4">
          {items.map((b, i) => (
            <div key={i} className="relative flex flex-col items-center text-center flex-1 min-w-[100px]">
              <span className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm z-10" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>{i + 1}</span>
              <p className="mt-3 text-sm">{b.content}</p>
            </div>
          ))}
        </div>
      </div>
    </LayoutBase>
  );
}
