import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function CostBreakdownCards({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 6);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((b, i) => (
          <div key={i} className="p-4 rounded-xl border-2" style={{ borderColor: theme.primaryColor + '40', backgroundColor: theme.primaryColor + '08' }}>
            {b.type === 'stat' && b.value != null ? (
              <>
                <div className="text-2xl font-bold mb-1" style={{ color: theme.primaryColor }}>{b.value}{b.unit || ''}</div>
                {b.label && <p className="text-sm opacity-80">{b.label}</p>}
              </>
            ) : (
              <p>{b.content}</p>
            )}
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
