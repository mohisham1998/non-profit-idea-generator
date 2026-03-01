import { CheckCircle, Target, Zap } from 'lucide-react';
import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

const ICONS = [CheckCircle, Target, Zap];

export function IconCards3({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 3);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((b, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={i} className="flex gap-4 p-4 rounded-lg border" style={{ borderColor: theme.primaryColor + '40' }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primaryColor + '20', color: theme.primaryColor }}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                {b.type === 'stat' && b.value != null ? (
                  <><span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>{b.value}{b.unit || ''}</span>{b.label && <p className="text-sm opacity-80">{b.label}</p>}</>
                ) : <p>{b.content}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </LayoutBase>
  );
}
