/**
 * DataTable — Generic data table component
 *
 * Features:
 * - Generic column configuration
 * - Status badge renderer
 * - Action buttons per row
 * - Sortable columns
 * - Pagination controls
 * - Empty state handling
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileQuestion,
  Pencil,
  Eye,
  Copy,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableAction<T> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (row: T) => void;
  variant?: 'default' | 'ghost' | 'destructive';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  actions?: DataTableAction<T>[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sort?: {
    column: string;
    direction: SortDirection;
    onSort: (column: string) => void;
  };
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  rowClassName?: (row: T, index: number) => string;
  isLoading?: boolean;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  archived: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  actions,
  pagination,
  sort,
  emptyMessage = 'لا توجد بيانات',
  emptyIcon,
  rowClassName,
  isLoading,
  className,
}: DataTableProps<T>) {
  const getCellValue = (row: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = row;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  const renderCell = (col: DataTableColumn<T>, row: T) => {
    const value = getCellValue(row, col.key);
    if (col.render) return col.render(value, row);
    if (col.key.toLowerCase().includes('status') && typeof value === 'string') {
      const statusKey = value.toLowerCase().replace(/\s+/g, '');
      const badgeClass = STATUS_COLORS[statusKey] || STATUS_COLORS.draft;
      return (
        <Badge variant="secondary" className={cn('font-normal', badgeClass)}>
          {value}
        </Badge>
      );
    }
    return String(value ?? '—');
  };

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  if (data.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16',
          className
        )}
      >
        {emptyIcon ?? <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />}
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <div className={cn('rounded-xl border bg-card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-right font-medium text-muted-foreground',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground',
                    col.className
                  )}
                  onClick={() => col.sortable && sort?.onSort(col.key)}
                >
                  <div className="flex items-center justify-end gap-1">
                    {col.label}
                    {col.sortable && sort && (
                      <span className="inline-flex">
                        {sort.column === col.key ? (
                          sort.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 text-right font-medium text-muted-foreground w-24">
                  إجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {data.map((row, idx) => (
                <motion.tr
                  key={String(row.id ?? idx)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'border-b last:border-b-0 transition-colors hover:bg-muted/30',
                    rowClassName?.(row, idx)
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3', col.className)}>
                      {renderCell(col, row)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {actions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={action.label}
                              variant={action.variant ?? 'ghost'}
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => action.onClick(row)}
                              title={action.label}
                            >
                              <Icon className="h-4 w-4" />
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            صفحة {pagination.page} من {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
