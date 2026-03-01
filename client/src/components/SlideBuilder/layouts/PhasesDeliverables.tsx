import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function PhasesDeliverables({ title, blocks, theme }: LayoutProps) {
  const perPhase = Math.ceil(blocks.length / 3) || 1;
  const phases = [blocks.slice(0, perPhase), blocks.slice(perPhase, perPhase * 2), blocks.slice(perPhase * 2, perPhase * 3)];

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {phases.map((phase, pi) => (
          <div key={pi} className="rounded-xl border-2 p-4" style={{ borderColor: theme.primaryColor + '50' }}>
            <h3 className="font-bold mb-3" style={{ color: theme.primaryColor }}>المرحلة {pi + 1}</h3>
            <ul className="space-y-1 list-disc list-inside">
              {phase.map((b, i) => <li key={i} className="text-sm">{b.content}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </LayoutBase>
  );
}
