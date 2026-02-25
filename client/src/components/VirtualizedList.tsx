import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
  loadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

/**
 * مكون قائمة افتراضية لتحسين أداء القوائم الطويلة
 * يعرض فقط العناصر المرئية في الشاشة
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  emptyMessage = 'لا توجد عناصر',
  loadMore,
  hasMore = false,
  isLoading = false,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // حساب العناصر المرئية
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  // تحديث ارتفاع الحاوية
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();
    
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // معالجة التمرير
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);

    // تحميل المزيد عند الوصول للنهاية
    if (loadMore && hasMore && !isLoading) {
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (scrollBottom < itemHeight * 3) {
        loadMore();
      }
    }
  }, [loadMore, hasMore, isLoading, itemHeight]);

  if (items.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
        </div>
      )}
    </div>
  );
}

/**
 * Hook لإدارة التحميل التدريجي (Infinite Scroll)
 */
export function useInfiniteScroll<T>({
  fetchFn,
  pageSize = 20,
  enabled = true,
}: {
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>;
  pageSize?: number;
  enabled?: boolean;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (!enabled || isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page, pageSize);
      setItems(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, isLoading, hasMore, page, pageSize, fetchFn]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, []);

  // تحميل الصفحة الأولى
  useEffect(() => {
    if (enabled && items.length === 0 && hasMore) {
      loadMore();
    }
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
  };
}

/**
 * مكون لتحميل المزيد عند التمرير
 */
interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading, threshold]);

  if (!hasMore) return null;

  return (
    <div ref={triggerRef} className="h-1">
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600" />
        </div>
      )}
    </div>
  );
}

export default VirtualizedList;
