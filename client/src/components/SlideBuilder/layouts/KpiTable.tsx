import type { LayoutProps } from '../../../lib/types/layouts';
import { LayoutBase } from './LayoutBase';

export function KpiTable({ title, blocks, theme }: LayoutProps) {
  const rows = blocks.slice(0, 12);

  return (
    <LayoutBase>
      <h2 className="text-xl font-bold mb-4" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: theme.primaryColor + '40' }}>
        <table className="w-full text-right">
          <colgroup>
            <col className="w-[75%]" />
            <col className="w-[25%]" />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: theme.primaryColor + '20' }}>
              <th className="p-3 font-bold">المؤشر</th>
              <th className="p-3 font-bold">القيمة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 align-top min-w-[220px] break-words">
                  {b.type === 'stat' ? b.label ?? b.content : b.content}
                </td>
                <td className="p-3 font-bold align-top w-16 whitespace-nowrap" style={{ color: theme.primaryColor }}>
                  {b.type === 'stat' && b.value != null ? `${b.value}${b.unit || ''}` : (i + 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LayoutBase>
  );
}
