import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase, BlockCard } from './LayoutBase';

export function FeatureCards4({ title, blocks, theme }: LayoutProps) {
  const items = blocks.slice(0, 4);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((b, i) => (
          <BlockCard key={i} block={b} theme={theme} className="min-h-[100px]" />
        ))}
      </div>
    </LayoutBase>
  );
}
