import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function OptionsTable({ title, blocks, theme }: LayoutProps) {
  const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(blocks.length))));
  const rows: typeof blocks[] = [];
  for (let i = 0; i < cols; i++) rows.push(blocks.filter((_, j) => j % cols === i));

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: theme.primaryColor + '40' }}>
        <table className="w-full text-right">
          <thead>
            <tr style={{ backgroundColor: theme.primaryColor + '20' }}>
              {Array.from({ length: cols }, (_, i) => (
                <th key={i} className="p-3 font-bold">الخيار {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(...rows.map(r => r.length)) }, (_, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {rows.map((col, ci) => (
                  <td key={ci} className="p-3">{col[ri]?.content ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LayoutBase>
  );
}
