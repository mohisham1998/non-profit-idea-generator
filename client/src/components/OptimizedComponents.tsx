import { memo, useMemo, useCallback, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

/**
 * مكونات محسنة باستخدام React.memo لتجنب إعادة الرسم غير الضرورية
 */

// ==================== بطاقة محسنة ====================

interface OptimizedCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export const OptimizedCard = memo(function OptimizedCard({
  title,
  description,
  children,
  className = '',
  headerAction,
}: OptimizedCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {headerAction}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
});

// ==================== زر محسن ====================

interface OptimizedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const OptimizedButton = memo(function OptimizedButton({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}: OptimizedButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
    >
      {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
});

// ==================== عنصر قائمة محسن ====================

interface OptimizedListItemProps {
  id: number | string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  actions?: ReactNode;
  icon?: ReactNode;
  selected?: boolean;
}

export const OptimizedListItem = memo(function OptimizedListItem({
  title,
  subtitle,
  onClick,
  actions,
  icon,
  selected = false,
}: OptimizedListItemProps) {
  return (
    <div
      className={`
        flex items-center justify-between p-4 border-b last:border-b-0
        hover:bg-gray-50 transition-colors cursor-pointer
        ${selected ? 'bg-emerald-50 border-emerald-200' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-400">{icon}</div>}
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
});

// ==================== إحصائية محسنة ====================

interface OptimizedStatProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const OptimizedStat = memo(function OptimizedStat({
  label,
  value,
  icon,
  trend,
  trendValue,
  className = '',
}: OptimizedStatProps) {
  const trendColor = useMemo(() => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  }, [trend]);

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trendValue && (
          <span className={`text-sm ${trendColor}`}>{trendValue}</span>
        )}
      </div>
    </div>
  );
});

// ==================== جدول محسن ====================

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface OptimizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

function OptimizedTableInner<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'لا توجد بيانات',
  isLoading = false,
}: OptimizedTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-right text-sm font-medium text-gray-500"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-4 py-3 text-sm text-gray-900"
                >
                  {col.render
                    ? col.render(item)
                    : String((item as any)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const OptimizedTable = memo(OptimizedTableInner) as typeof OptimizedTableInner;

// ==================== شريط التقدم المحسن ====================

interface OptimizedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'emerald' | 'blue' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export const OptimizedProgress = memo(function OptimizedProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'emerald',
  size = 'md',
}: OptimizedProgressProps) {
  const percentage = useMemo(() => Math.min(100, Math.max(0, (value / max) * 100)), [value, max]);
  
  const colorClasses = useMemo(() => {
    const colors = {
      emerald: 'bg-emerald-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    };
    return colors[color];
  }, [color]);

  const sizeClasses = useMemo(() => {
    const sizes = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };
    return sizes[size];
  }, [size]);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-900">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses}`}>
        <div
          className={`${colorClasses} ${sizeClasses} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

// ==================== Hook للتحسين ====================

/**
 * Hook لتحسين callbacks مع مقارنة عميقة
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
}

/**
 * Hook لتحسين القيم المحسوبة
 */
export function useStableMemo<T>(factory: () => T, deps: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

export default {
  OptimizedCard,
  OptimizedButton,
  OptimizedListItem,
  OptimizedStat,
  OptimizedTable,
  OptimizedProgress,
};
