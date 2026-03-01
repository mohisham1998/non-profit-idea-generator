/**
 * Placeholder layout - used when real layout component not yet implemented
 * Renders content in a basic card format
 */
import type { LayoutProps } from '../../../lib/types/layouts';

export function PlaceholderLayout({ title, blocks, theme }: LayoutProps) {
  return (
    <div className="flex flex-col gap-4 p-6 rtl" dir="rtl">
      <h2 className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
        {title}
      </h2>
      <div className="flex flex-col gap-2">
        {blocks.map((block, i) => (
          <div
            key={i}
            className="rounded-lg border p-3"
            style={{ borderColor: theme.primaryColor + '40' }}
          >
            {block.type === 'stat' && block.value != null ? (
              <div>
                <span className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
                  {block.value}
                  {block.unit || ''}
                </span>
                {block.label && <p className="text-sm opacity-80">{block.label}</p>}
              </div>
            ) : (
              <p>{block.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
