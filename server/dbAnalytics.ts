import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, ideas, conversations, messages, projectTracking, projectTasks } from "../drizzle/schema";
import { eq, sql, and, gte, lte, count, desc, isNotNull } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * إحصائيات النظام العامة
 */
export async function getSystemOverview() {
  const db = await getDb();
  if (!db) return {
    totalUsers: 0, activeUsers: 0, pendingUsers: 0,
    totalIdeas: 0, totalConversations: 0, totalMessages: 0,
    totalProjects: 0, completedProjects: 0,
  };

  const [userStats] = await db
    .select({
      total: count(),
      active: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
    })
    .from(users);

  const [ideaStats] = await db.select({ total: count() }).from(ideas);
  const [conversationStats] = await db.select({ total: count() }).from(conversations);
  const [messageStats] = await db.select({ total: count() }).from(messages);
  const [projectStats] = await db
    .select({
      total: count(),
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    })
    .from(projectTracking);

  return {
    totalUsers: userStats?.total || 0,
    activeUsers: Number(userStats?.active) || 0,
    pendingUsers: Number(userStats?.pending) || 0,
    totalIdeas: ideaStats?.total || 0,
    totalConversations: conversationStats?.total || 0,
    totalMessages: messageStats?.total || 0,
    totalProjects: projectStats?.total || 0,
    completedProjects: Number(projectStats?.completed) || 0,
  };
}

/**
 * نشاط المستخدمين عبر الزمن
 */
export async function getActivityTimeline(days: number = 30) {
  const db = await getDb();
  const dateMap = new Map<string, { registrations: number; ideas: number; logins: number }>();
  
  // إنشاء تواريخ فارغة
  for (let i = 0; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, { registrations: 0, ideas: 0, logins: 0 });
  }

  if (!db) {
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // جلب التسجيلات اليومية
  const registrations = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      count: count(),
    })
    .from(users)
    .where(gte(users.createdAt, startDate))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  // جلب الأفكار اليومية
  const ideasDaily = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      count: count(),
    })
    .from(ideas)
    .where(gte(ideas.createdAt, startDate))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  // جلب تسجيلات الدخول اليومية
  const logins = await db
    .select({
      date: sql<string>`DATE(lastSignedIn)`,
      count: count(),
    })
    .from(users)
    .where(and(
      isNotNull(users.lastSignedIn),
      gte(users.lastSignedIn, startDate)
    ))
    .groupBy(sql`DATE(lastSignedIn)`)
    .orderBy(sql`DATE(lastSignedIn)`);

  // ملء البيانات
  registrations.forEach((r: { date: string; count: number }) => {
    const existing = dateMap.get(r.date) || { registrations: 0, ideas: 0, logins: 0 };
    existing.registrations = r.count;
    dateMap.set(r.date, existing);
  });

  ideasDaily.forEach((i: { date: string; count: number }) => {
    const existing = dateMap.get(i.date) || { registrations: 0, ideas: 0, logins: 0 };
    existing.ideas = i.count;
    dateMap.set(i.date, existing);
  });

  logins.forEach((l: { date: string; count: number }) => {
    const existing = dateMap.get(l.date) || { registrations: 0, ideas: 0, logins: 0 };
    existing.logins = l.count;
    dateMap.set(l.date, existing);
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * أفضل المستخدمين أداءً
 */
export async function getTopUsers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const topUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      organizationName: users.organizationName,
      lastActive: users.lastSignedIn,
      ideasCount: sql<number>`(SELECT COUNT(*) FROM ideas WHERE ideas.userId = users.id)`,
      projectsCount: sql<number>`(SELECT COUNT(*) FROM project_tracking WHERE project_tracking.userId = users.id)`,
      completedProjectsCount: sql<number>`(SELECT COUNT(*) FROM project_tracking WHERE project_tracking.userId = users.id AND project_tracking.status = 'completed')`,
    })
    .from(users)
    .where(eq(users.status, 'approved'))
    .orderBy(desc(sql`(SELECT COUNT(*) FROM ideas WHERE ideas.userId = users.id)`))
    .limit(limit);

  return topUsers;
}

/**
 * إحصائيات استخدام الميزات
 */
export async function getFeatureUsage() {
  const db = await getDb();
  if (!db) return {
    ideaGeneration: 0, chatUsage: 0, totalMessages: 0,
    kpisGeneration: 0, logFrameGeneration: 0, pmdproGeneration: 0,
    designThinking: 0, evaluation: 0,
  };

  const [ideaGeneration] = await db.select({ count: count() }).from(ideas);
  const [chatUsage] = await db.select({ count: count() }).from(conversations);
  const [totalMessages] = await db.select({ count: count() }).from(messages);
  const [kpisGeneration] = await db.select({ count: count() }).from(ideas).where(isNotNull(ideas.kpis));
  const [logFrameGeneration] = await db.select({ count: count() }).from(ideas).where(isNotNull(ideas.logFrame));
  const [pmdproGeneration] = await db.select({ count: count() }).from(ideas).where(isNotNull(ideas.pmdpro));
  const [designThinking] = await db.select({ count: count() }).from(ideas).where(isNotNull(ideas.designThinking));
  const [evaluation] = await db.select({ count: count() }).from(ideas).where(isNotNull(ideas.evaluation));

  return {
    ideaGeneration: ideaGeneration?.count || 0,
    chatUsage: chatUsage?.count || 0,
    totalMessages: totalMessages?.count || 0,
    kpisGeneration: kpisGeneration?.count || 0,
    logFrameGeneration: logFrameGeneration?.count || 0,
    pmdproGeneration: pmdproGeneration?.count || 0,
    designThinking: designThinking?.count || 0,
    evaluation: evaluation?.count || 0,
  };
}

/**
 * إحصائيات حالة المشاريع
 */
export async function getProjectsStatus() {
  const db = await getDb();
  if (!db) return { planning: 0, inProgress: 0, completed: 0, onHold: 0, cancelled: 0 };

  const [stats] = await db
    .select({
      planning: sql<number>`SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END)`,
      inProgress: sql<number>`SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)`,
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      onHold: sql<number>`SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END)`,
      cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`,
    })
    .from(projectTracking);

  return {
    planning: Number(stats?.planning) || 0,
    inProgress: Number(stats?.inProgress) || 0,
    completed: Number(stats?.completed) || 0,
    onHold: Number(stats?.onHold) || 0,
    cancelled: Number(stats?.cancelled) || 0,
  };
}

/**
 * إحصائيات المهام
 */
export async function getTasksStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0, overdue: 0 };

  const now = new Date();
  
  const [stats] = await db
    .select({
      total: count(),
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
      inProgress: sql<number>`SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)`,
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`,
      overdue: sql<number>`SUM(CASE WHEN status != 'completed' AND status != 'cancelled' AND dueDate < ${now.getTime()} THEN 1 ELSE 0 END)`,
    })
    .from(projectTasks);

  return {
    total: stats?.total || 0,
    pending: Number(stats?.pending) || 0,
    inProgress: Number(stats?.inProgress) || 0,
    completed: Number(stats?.completed) || 0,
    cancelled: Number(stats?.cancelled) || 0,
    overdue: Number(stats?.overdue) || 0,
  };
}

/**
 * معدلات النمو
 */
export async function getGrowthRates() {
  const db = await getDb();
  if (!db) return {
    thisMonthUsers: 0, lastMonthUsers: 0, usersGrowth: 0,
    thisMonthIdeas: 0, lastMonthIdeas: 0, ideasGrowth: 0,
  };

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonthUsers] = await db.select({ count: count() }).from(users).where(gte(users.createdAt, thisMonthStart));
  const [lastMonthUsers] = await db.select({ count: count() }).from(users).where(and(gte(users.createdAt, lastMonthStart), lte(users.createdAt, lastMonthEnd)));
  const [thisMonthIdeas] = await db.select({ count: count() }).from(ideas).where(gte(ideas.createdAt, thisMonthStart));
  const [lastMonthIdeas] = await db.select({ count: count() }).from(ideas).where(and(gte(ideas.createdAt, lastMonthStart), lte(ideas.createdAt, lastMonthEnd)));

  const thisUsers = thisMonthUsers?.count || 0;
  const lastUsers = lastMonthUsers?.count || 0;
  const thisIdeas = thisMonthIdeas?.count || 0;
  const lastIdeas = lastMonthIdeas?.count || 0;

  return {
    thisMonthUsers: thisUsers,
    lastMonthUsers: lastUsers,
    usersGrowth: lastUsers > 0 ? Math.round(((thisUsers - lastUsers) / lastUsers) * 100) : (thisUsers > 0 ? 100 : 0),
    thisMonthIdeas: thisIdeas,
    lastMonthIdeas: lastIdeas,
    ideasGrowth: lastIdeas > 0 ? Math.round(((thisIdeas - lastIdeas) / lastIdeas) * 100) : (thisIdeas > 0 ? 100 : 0),
  };
}

/**
 * جلب جميع الإحصائيات مرة واحدة
 */
export async function getFullAnalytics(days: number = 30) {
  const [overview, activity, topUsers, featureUsage, projectStatus, tasksStats, growthRates] = await Promise.all([
    getSystemOverview(),
    getActivityTimeline(days),
    getTopUsers(10),
    getFeatureUsage(),
    getProjectsStatus(),
    getTasksStats(),
    getGrowthRates(),
  ]);

  return {
    overview,
    activity,
    topUsers,
    featureUsage,
    projectStatus,
    tasksStats,
    growthRates,
  };
}
