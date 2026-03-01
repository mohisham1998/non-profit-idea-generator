import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase, BlockCard } from './LayoutBase';

export function BenefitsGrid({ title, blocks, theme }: LayoutProps) {
  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((b, i) => (
          <BlockCard key={i} block={b} theme={theme} />
        ))}
      </div>
    </LayoutBase>
  );
}
