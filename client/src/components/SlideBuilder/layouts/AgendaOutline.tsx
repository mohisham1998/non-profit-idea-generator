import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function AgendaOutline({ title, blocks, theme }: LayoutProps) {
  return (
    <LayoutBase>
      <h2 className="text-2xl font-bold mb-6" style={{ color: theme.primaryColor }}>
        {title}
      </h2>
      <ol className="list-decimal list-inside space-y-3 text-lg">
        {blocks.map((block, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold" style={{ color: theme.primaryColor }}>{i + 1}.</span>
            {block.content}
          </li>
        ))}
      </ol>
    </LayoutBase>
  );
}
