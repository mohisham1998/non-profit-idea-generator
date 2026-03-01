import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function BudgetTable({ title, blocks, theme }: LayoutProps) {
  const rows = blocks.slice(0, 12);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: theme.primaryColor + '40' }}>
        <table className="w-full text-right">
          <thead>
            <tr style={{ backgroundColor: theme.primaryColor + '20' }}>
              <th className="p-3 font-bold">الفئة</th>
              <th className="p-3 font-bold">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3">{b.type === 'stat' ? b.label ?? b.content : b.content}</td>
                <td className="p-3 font-bold" style={{ color: theme.primaryColor }}>
                  {b.type === 'stat' && b.value != null ? `${b.value}${b.unit || ''}` : b.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LayoutBase>
  );
}
