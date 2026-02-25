/**
 * تكوين React Query للأداء الأمثل
 * يحسن التخزين المؤقت وتقليل الاستعلامات المتكررة
 */

// أوقات التخزين المؤقت بالمللي ثانية
export const CACHE_TIMES = {
  // بيانات نادراً ما تتغير (5 دقائق)
  STATIC: 5 * 60 * 1000,
  
  // بيانات تتغير أحياناً (دقيقة واحدة)
  SEMI_STATIC: 60 * 1000,
  
  // بيانات تتغير بشكل متكرر (30 ثانية)
  DYNAMIC: 30 * 1000,
  
  // بيانات المستخدم (دقيقتان)
  USER: 2 * 60 * 1000,
  
  // قوائم الأفكار (دقيقة واحدة)
  IDEAS_LIST: 60 * 1000,
  
  // تفاصيل الفكرة (دقيقتان)
  IDEA_DETAIL: 2 * 60 * 1000,
  
  // بيانات لوحة المتابعة (30 ثانية)
  DASHBOARD: 30 * 1000,
  
  // بيانات الإدارة (دقيقة واحدة)
  ADMIN: 60 * 1000,
} as const;

// أوقات staleTime - متى تصبح البيانات قديمة
export const STALE_TIMES = {
  // بيانات ثابتة (دقيقتان)
  STATIC: 2 * 60 * 1000,
  
  // بيانات شبه ثابتة (30 ثانية)
  SEMI_STATIC: 30 * 1000,
  
  // بيانات ديناميكية (10 ثواني)
  DYNAMIC: 10 * 1000,
  
  // بيانات المستخدم (دقيقة)
  USER: 60 * 1000,
  
  // قوائم (30 ثانية)
  LIST: 30 * 1000,
  
  // تفاصيل (دقيقة)
  DETAIL: 60 * 1000,
} as const;

// تكوين إعادة المحاولة
export const RETRY_CONFIG = {
  // عدد المحاولات
  retry: 2,
  
  // تأخير بين المحاولات (exponential backoff)
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

// تكوين الـ Query Client الافتراضي
export const DEFAULT_QUERY_OPTIONS = {
  queries: {
    staleTime: STALE_TIMES.DYNAMIC,
    gcTime: CACHE_TIMES.DYNAMIC, // كان cacheTime سابقاً
    retry: RETRY_CONFIG.retry,
    retryDelay: RETRY_CONFIG.retryDelay,
    refetchOnWindowFocus: false, // تعطيل إعادة الجلب عند التركيز على النافذة
    refetchOnReconnect: true, // إعادة الجلب عند إعادة الاتصال
  },
  mutations: {
    retry: 1,
  },
} as const;

/**
 * تكوينات محددة لكل نوع من الاستعلامات
 */
export const QUERY_CONFIGS = {
  // بيانات المستخدم الحالي
  currentUser: {
    staleTime: STALE_TIMES.USER,
    gcTime: CACHE_TIMES.USER,
  },
  
  // قائمة الأفكار
  ideasList: {
    staleTime: STALE_TIMES.LIST,
    gcTime: CACHE_TIMES.IDEAS_LIST,
  },
  
  // تفاصيل فكرة
  ideaDetail: {
    staleTime: STALE_TIMES.DETAIL,
    gcTime: CACHE_TIMES.IDEA_DETAIL,
  },
  
  // لوحة المتابعة
  dashboard: {
    staleTime: STALE_TIMES.DYNAMIC,
    gcTime: CACHE_TIMES.DASHBOARD,
  },
  
  // بيانات الإدارة
  admin: {
    staleTime: STALE_TIMES.SEMI_STATIC,
    gcTime: CACHE_TIMES.ADMIN,
  },
  
  // الميزات والصلاحيات
  permissions: {
    staleTime: STALE_TIMES.STATIC,
    gcTime: CACHE_TIMES.STATIC,
  },
} as const;

/**
 * مساعد لإنشاء مفتاح استعلام موحد
 */
export const createQueryKey = {
  ideas: {
    all: ['ideas'] as const,
    list: (userId: number) => ['ideas', 'list', userId] as const,
    detail: (ideaId: number) => ['ideas', 'detail', ideaId] as const,
    search: (userId: number, query: string) => ['ideas', 'search', userId, query] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    detail: (ideaId: number) => ['dashboard', ideaId] as const,
    tasks: (trackingId: number) => ['dashboard', 'tasks', trackingId] as const,
    budget: (trackingId: number) => ['dashboard', 'budget', trackingId] as const,
    kpis: (trackingId: number) => ['dashboard', 'kpis', trackingId] as const,
    risks: (trackingId: number) => ['dashboard', 'risks', trackingId] as const,
  },
  admin: {
    all: ['admin'] as const,
    users: (status?: string) => ['admin', 'users', status] as const,
    stats: () => ['admin', 'stats'] as const,
    permissions: (userId: number) => ['admin', 'permissions', userId] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    byIdea: (ideaId: number) => ['conversations', 'idea', ideaId] as const,
    messages: (conversationId: number) => ['conversations', 'messages', conversationId] as const,
  },
} as const;
