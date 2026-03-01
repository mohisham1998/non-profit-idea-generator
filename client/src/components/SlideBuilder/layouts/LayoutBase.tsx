/**
 * Shared layout base - RTL wrapper with theme
 */
import type { LayoutProps } from '../../../lib/types/layouts';

export function LayoutBase({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[500px] p-6 rtl font-[family-name:var(--font-cairo)]" dir="rtl">
      {children}
    </div>
  );
}

export function BlockCard({
  block,
  theme,
  className = '',
}: {
  block: LayoutProps['blocks'][0];
  theme: LayoutProps['theme'];
  className?: string;
}) {
  return (
    <div
      key={block.content}
      className={`rounded-lg border p-3 ${className}`}
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
      ) : block.type === 'quote' ? (
        <blockquote className="text-xl italic border-s-4 ps-4" style={{ borderColor: theme.primaryColor }}>
          {block.content}
        </blockquote>
      ) : (
        <p>{block.content}</p>
      )}
    </div>
  );
}
