import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function StatBlocks3({ title, blocks, theme }: LayoutProps) {
  const stats = blocks.filter((b) => b.type === 'stat' || (b.value != null)).slice(0, 3);
  const fallback = blocks.slice(0, 3);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(stats.length > 0 ? stats : fallback).map((b, i) => (
          <div key={i} className="p-6 rounded-xl text-center border-2" style={{ borderColor: theme.primaryColor + '40', backgroundColor: theme.primaryColor + '08' }}>
            {b.type === 'stat' && b.value != null ? (
              <>
                <div className="text-4xl font-bold mb-1" style={{ color: theme.primaryColor }}>{b.value}{b.unit || ''}</div>
                {b.label && <p className="text-sm opacity-80">{b.label}</p>}
              </>
            ) : (
              <p className="text-lg">{b.content}</p>
            )}
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
