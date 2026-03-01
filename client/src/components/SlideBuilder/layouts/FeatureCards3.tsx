import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase, BlockCard } from './LayoutBase';

export function FeatureCards3({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 3);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((b, i) => (
          <BlockCard key={i} block={b} theme={theme} className="min-h-[120px]" />
        ))}
      </div>
    </LayoutBase>
  );
}
