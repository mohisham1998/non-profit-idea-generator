import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function BulletHierarchy({ title, blocks, theme }: LayoutProps) {
  const bullets = blocks.slice(0, 12);
  const indent = (level: number) => ({ marginRight: `${level * 1.5}rem` });

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <ul className="space-y-2 list-none p-0 m-0">
        {bullets.map((b, i) => {
          const depth = b.type === 'bullet' && b.level != null ? b.level : Math.min(2, i % 3);
          return (
            <li key={i} className="flex gap-2 items-start min-h-[1.75rem]" style={indent(depth)}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: theme.primaryColor }} />
              <span className="flex-1 min-w-0 break-words">{b.content}</span>
            </li>
          );
        })}
      </ul>
    </LayoutBase>
  );
}
