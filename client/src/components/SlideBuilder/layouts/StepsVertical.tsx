import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function StepsVertical({ title, blocks, theme }: LayoutProps) {
  const steps = blocks.slice(0, 6);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="space-y-4">
        {steps.map((b, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: theme.primaryColor, color: 'white' }}>{i + 1}</span>
              {i < steps.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: theme.primaryColor + '60' }} />}
            </div>
            <div className="flex-1 pb-4">
              <p>{b.content}</p>
            </div>
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
