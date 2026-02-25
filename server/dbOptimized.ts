/**
 * استعلامات محسنة لقاعدة البيانات
 * تحسين الأداء من خلال:
 * - تقليل عدد الاستعلامات (N+1 problem)
 * - استخدام select محدد بدلاً من select *
 * - استخدام batch loading
 */

import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, 
  ideas, 
  permissions, 
  projectTracking, 
  projectTasks, 
  budgetTracking, 
  kpiTracking, 
  riskTracking 
} from "../drizzle/schema";

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
 * جلب إحصائيات المستخدمين في استعلام واحد بدلاً من 4 استعلامات
 */
export async function getUserStatsOptimized() {
  const db = await getDb();
  if (!db) {
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }

  try {
    // استعلام واحد بدلاً من 4 استعلامات منفصلة
    const result = await db.select({
      total: sql<number>`COUNT(*)`,
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
      approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
      rejected: sql<number>`SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)`,
    }).from(users);

    return {
      total: result[0]?.total || 0,
      pending: result[0]?.pending || 0,
      approved: result[0]?.approved || 0,
      rejected: result[0]?.rejected || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get user stats:", error);
    throw error;
  }
}

/**
 * جلب المستخدمين مع صلاحياتهم في استعلامين فقط بدلاً من N+1
 */
export async function getAllUsersWithPermissionsOptimized() {
  const db = await getDb();
  if (!db) return [];

  try {
    // جلب جميع المستخدمين
    const allUsers = await db.select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      organizationName: users.organizationName,
      organizationLogo: users.organizationLogo,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    }).from(users).orderBy(desc(users.createdAt));

    if (allUsers.length === 0) return [];

    // جلب جميع الصلاحيات في استعلام واحد
    const userIds = allUsers.map(u => u.id);
    const allPermissions = await db.select().from(permissions).where(
      inArray(permissions.userId, userIds)
    );

    // إنشاء map للصلاحيات
    const permissionsMap = new Map(
      allPermissions.map(p => [p.userId, p])
    );

    // دمج البيانات
    return allUsers.map(user => ({
      ...user,
      permissions: permissionsMap.get(user.id) || null,
    }));
  } catch (error) {
    console.error("[Database] Failed to get users with permissions:", error);
    return [];
  }
}

/**
 * جلب أفكار المستخدم مع الحقول المطلوبة فقط (للقائمة)
 */
export async function getUserIdeasListOptimized(
  userId: number, 
  limit = 50, 
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  try {
    // جلب الحقول المطلوبة فقط للقائمة
    return await db.select({
      id: ideas.id,
      programDescription: ideas.programDescription,
      selectedName: ideas.selectedName,
      idea: ideas.idea,
      createdAt: ideas.createdAt,
    })
    .from(ideas)
    .where(eq(ideas.userId, userId))
    .orderBy(desc(ideas.createdAt))
    .limit(limit)
    .offset(offset);
  } catch (error) {
    console.error("[Database] Failed to get user ideas:", error);
    throw error;
  }
}

/**
 * جلب لوحة المتابعة الكاملة في استعلامات متوازية
 */
export async function getFullDashboardOptimized(ideaId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    // جلب أو إنشاء تتبع المشروع
    let tracking = await db.select().from(projectTracking)
      .where(and(
        eq(projectTracking.ideaId, ideaId),
        eq(projectTracking.userId, userId)
      ))
      .limit(1);

    if (tracking.length === 0) {
      tracking = await db.insert(projectTracking).values({
        ideaId,
        userId,
        status: 'planning',
        overallProgress: 0,
      }).returning();
    }

    const trackingData = tracking[0];
    const trackingId = trackingData.id;

    // جلب جميع البيانات بالتوازي
    const [tasks, budget, kpis, risks] = await Promise.all([
      db.select().from(projectTasks)
        .where(eq(projectTasks.projectTrackingId, trackingId))
        .orderBy(projectTasks.sortOrder),
      
      db.select().from(budgetTracking)
        .where(eq(budgetTracking.projectTrackingId, trackingId)),
      
      db.select().from(kpiTracking)
        .where(eq(kpiTracking.projectTrackingId, trackingId)),
      
      db.select().from(riskTracking)
        .where(eq(riskTracking.projectTrackingId, trackingId)),
    ]);

    return {
      tracking: trackingData,
      tasks,
      budgetItems: budget,
      kpis,
      risks,
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard:", error);
    throw error;
  }
}

/**
 * جلب عدد الأفكار والمشاريع للمستخدم في استعلام واحد
 */
export async function getUserSummaryOptimized(userId: number) {
  const db = await getDb();
  if (!db) return { ideasCount: 0, projectsCount: 0, completedProjects: 0 };

  try {
    const [ideasResult, projectsResult] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` })
        .from(ideas)
        .where(eq(ideas.userId, userId)),
      
      db.select({
        total: sql<number>`COUNT(*)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      })
        .from(projectTracking)
        .where(eq(projectTracking.userId, userId)),
    ]);

    return {
      ideasCount: ideasResult[0]?.count || 0,
      projectsCount: projectsResult[0]?.total || 0,
      completedProjects: projectsResult[0]?.completed || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get user summary:", error);
    throw error;
  }
}

/**
 * Batch loading للصلاحيات
 */
export async function getPermissionsBatch(userIds: number[]) {
  const db = await getDb();
  if (!db || userIds.length === 0) return new Map();

  try {
    const results = await db.select().from(permissions).where(
      inArray(permissions.userId, userIds)
    );

    return new Map(results.map(p => [p.userId, p]));
  } catch (error) {
    console.error("[Database] Failed to batch load permissions:", error);
    return new Map();
  }
}

/**
 * تحسين البحث باستخدام FULLTEXT (إذا كان متاحاً)
 */
export async function searchIdeasFulltext(
  userId: number,
  searchQuery: string,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];

  try {
    // محاولة استخدام FULLTEXT search إذا كان الفهرس موجوداً
    // مع fallback إلى LIKE إذا فشل
    const result = await db.select({
      id: ideas.id,
      programDescription: ideas.programDescription,
      selectedName: ideas.selectedName,
      idea: ideas.idea,
      createdAt: ideas.createdAt,
    })
    .from(ideas)
    .where(and(
      eq(ideas.userId, userId),
      sql`MATCH(idea, programDescription, selectedName) AGAINST(${searchQuery} IN NATURAL LANGUAGE MODE)`
    ))
    .orderBy(desc(ideas.createdAt))
    .limit(limit)
    .offset(offset);

    return result;
  } catch (error) {
    // Fallback إلى LIKE search
    console.warn("[Database] Fulltext search failed, falling back to LIKE:", error);
    const searchPattern = `%${searchQuery}%`;
    
    return await db.select({
      id: ideas.id,
      programDescription: ideas.programDescription,
      selectedName: ideas.selectedName,
      idea: ideas.idea,
      createdAt: ideas.createdAt,
    })
    .from(ideas)
    .where(and(
      eq(ideas.userId, userId),
      sql`(idea LIKE ${searchPattern} OR programDescription LIKE ${searchPattern} OR selectedName LIKE ${searchPattern})`
    ))
    .orderBy(desc(ideas.createdAt))
    .limit(limit)
    .offset(offset);
  }
}

export default {
  getUserStatsOptimized,
  getAllUsersWithPermissionsOptimized,
  getUserIdeasListOptimized,
  getFullDashboardOptimized,
  getUserSummaryOptimized,
  getPermissionsBatch,
  searchIdeasFulltext,
};
