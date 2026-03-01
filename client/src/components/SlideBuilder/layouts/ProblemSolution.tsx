import { ArrowLeft } from 'lucide-react';
import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function ProblemSolution({ title, blocks, theme }: LayoutProps) {
  const problem = blocks[0]?.content ?? '';
  const solution = blocks[1]?.content ?? '';

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
          <h3 className="font-bold text-red-700 mb-2">التحدي</h3>
          <p>{problem}</p>
        </div>
        <div className="flex items-center justify-center">
          <ArrowLeft className="w-8 h-8" style={{ color: theme.primaryColor }} />
        </div>
        <div className="p-4 rounded-lg border-2" style={{ borderColor: theme.primaryColor + '60', backgroundColor: theme.primaryColor + '10' }}>
          <h3 className="font-bold mb-2" style={{ color: theme.primaryColor }}>الحل</h3>
          <p>{solution}</p>
        </div>
      </div>
    </LayoutBase>
  );
}
