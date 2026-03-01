import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function StatBlocks4({ title, blocks, theme }: LayoutProps) {
  const stats = blocks.filter((b) => b.type === 'stat' || (b.value != null)).slice(0, 4);
  const fallback = blocks.slice(0, 4);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(stats.length > 0 ? stats : fallback).map((b, i) => (
          <div key={i} className="p-4 rounded-lg text-center border" style={{ borderColor: theme.primaryColor + '40' }}>
            {b.type === 'stat' && b.value != null ? (
              <>
                <div className="text-3xl font-bold" style={{ color: theme.primaryColor }}>{b.value}{b.unit || ''}</div>
                {b.label && <p className="text-xs opacity-80 mt-1">{b.label}</p>}
              </>
            ) : <p className="text-sm">{b.content}</p>}
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
