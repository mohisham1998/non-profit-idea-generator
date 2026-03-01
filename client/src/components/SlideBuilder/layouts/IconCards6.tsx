import { CheckCircle, Target, Zap, Star, Award, TrendingUp } from 'lucide-react';
import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

const ICONS = [CheckCircle, Target, Zap, Star, Award, TrendingUp];

export function IconCards6({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 6);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((b, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={i} className="flex gap-3 p-3 rounded-lg border" style={{ borderColor: theme.primaryColor + '40' }}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                {b.type === 'stat' && b.value != null ? (
                  <><span className="text-lg font-bold" style={{ color: theme.primaryColor }}>{b.value}{b.unit || ''}</span>{b.label && <p className="text-xs opacity-80 truncate">{b.label}</p>}</>
                ) : <p className="text-sm truncate">{b.content}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </LayoutBase>
  );
}
