import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function BigNumberBreakdown({ title, blocks, theme }: LayoutProps) {
  const main = blocks[0];
  const mainVal = main?.type === 'stat' ? main.value : null;
  const mainLabel = main?.type === 'stat' ? main.label : main?.content;
  const rest = blocks.slice(1, 5);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="text-center">
          {mainVal != null ? (
            <>
              <div className="text-6xl font-bold" style={{ color: theme.primaryColor }}>{mainVal}{main?.type === 'stat' ? main.unit || '' : ''}</div>
              {mainLabel && <p className="text-lg mt-2 opacity-90">{mainLabel}</p>}
            </>
          ) : (
            <p className="text-2xl">{main?.content}</p>
          )}
        </div>
        <div className="flex-1 space-y-2">
          {rest.map((b, i) => (
            <div key={i} className="flex justify-between p-2 rounded" style={{ backgroundColor: theme.primaryColor + '10' }}>
              <span>{b.type === 'stat' ? b.label ?? b.content : b.content}</span>
              {b.type === 'stat' && b.value != null && <span className="font-bold" style={{ color: theme.primaryColor }}>{b.value}{b.unit || ''}</span>}
            </div>
          ))}
        </div>
      </div>
    </LayoutBase>
  );
}
