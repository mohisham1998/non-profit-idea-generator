/**
 * أدوات تحسين الأداء للواجهة الأمامية
 */

/**
 * Debounce - تأخير تنفيذ الدالة حتى انتهاء المستخدم من الكتابة
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle - تحديد معدل تنفيذ الدالة
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * Memoize - تخزين نتائج الدوال المكلفة
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * تحميل الصور بشكل كسول
 */
export function lazyLoadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * قياس وقت التنفيذ
 */
export function measureTime<T>(
  name: string,
  func: () => T
): T {
  const start = performance.now();
  const result = func();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * قياس وقت التنفيذ للدوال غير المتزامنة
 */
export async function measureTimeAsync<T>(
  name: string,
  func: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await func();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * تأجيل تنفيذ المهام غير الضرورية
 */
export function scheduleIdleTask(
  callback: () => void,
  timeout = 1000
): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * تحميل الموارد مسبقاً
 */
export function prefetchResource(url: string, as: 'script' | 'style' | 'image' | 'fetch'): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * تحميل الصفحات مسبقاً
 */
export function preconnect(url: string): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * تنسيق الأرقام الكبيرة
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'م';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'ك';
  }
  return num.toString();
}

/**
 * تنسيق التاريخ النسبي
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهر`;
  return `منذ ${Math.floor(diffDays / 365)} سنة`;
}

/**
 * تقسيم المصفوفات الكبيرة للمعالجة
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * معالجة المصفوفات الكبيرة بشكل تدريجي
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => R | Promise<R>,
  chunkSize = 100,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const chunks = chunkArray(items, chunkSize);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    if (onProgress) {
      onProgress(results.length, items.length);
    }

    // إعطاء فرصة للـ UI للتحديث
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * مراقب الأداء
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`[PerformanceMonitor] Mark "${startMark}" not found`);
      return 0;
    }

    const duration = performance.now() - start;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);

    return duration;
  }

  getAverages(): Record<string, number> {
    const averages: Record<string, number> = {};
    
    this.measures.forEach((durations, name) => {
      const sum = durations.reduce((a, b) => a + b, 0);
      averages[name] = sum / durations.length;
    });

    return averages;
  }

  report(): void {
    console.log('[PerformanceMonitor] Report:');
    const averages = this.getAverages();
    Object.entries(averages).forEach(([name, avg]) => {
      console.log(`  ${name}: ${avg.toFixed(2)}ms (avg)`);
    });
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

export default {
  debounce,
  throttle,
  memoize,
  lazyLoadImage,
  measureTime,
  measureTimeAsync,
  scheduleIdleTask,
  prefetchResource,
  preconnect,
  formatNumber,
  formatRelativeTime,
  chunkArray,
  processInChunks,
  performanceMonitor,
};
