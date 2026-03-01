import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function SectionDivider({ title, theme }: LayoutProps) {
  return (
    <LayoutBase>
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <h2 className="text-4xl font-bold" style={{ color: theme.primaryColor }}>
            {title}
          </h2>
        </div>
      </div>
    </LayoutBase>
  );
}
