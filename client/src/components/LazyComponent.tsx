import { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * مكون التحميل الافتراضي
 */
export function DefaultLoader({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

/**
 * مكون Skeleton للتحميل
 */
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={style} />
  );
}

/**
 * Skeleton للبطاقات
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton لقائمة البطاقات
 */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton للجدول
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="border-b bg-gray-50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton للرسوم البيانية
 */
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-4">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="flex items-end justify-around h-48 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-8"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * غلاف للمكونات الكسولة
 */
export function LazyWrapper({ children, fallback }: LazyComponentProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoader />}>
      {children}
    </Suspense>
  );
}

/**
 * دالة مساعدة لإنشاء مكون كسول مع Suspense
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComp = lazy(importFn);
  
  return function LazyComponentWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <DefaultLoader />}>
        <LazyComp {...props} />
      </Suspense>
    );
  };
}

/**
 * مكون للتحميل عند الظهور في الشاشة
 */
interface LazyOnViewProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function LazyOnView({
  children,
  fallback = <DefaultLoader />,
  threshold = 0.1,
  rootMargin = '100px',
}: LazyOnViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';

export default LazyWrapper;
