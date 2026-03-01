import { eq, desc, like, or, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, ideas, InsertIdea, Idea, conversations, messages, InsertConversation, Conversation, InsertMessage, Message, permissions, Permission, InsertPermission, systemFeatures, SystemFeature, InsertSystemFeature, projectTracking, ProjectTracking, InsertProjectTracking, projectTasks, ProjectTask, InsertProjectTask, budgetTracking, BudgetTracking, InsertBudgetTracking, kpiTracking, KpiTracking, InsertKpiTracking, riskTracking, RiskTracking, InsertRiskTracking, dashboardLayouts, DashboardLayout, InsertDashboardLayout, slideDecks, SlideDeck, InsertSlideDeck, layoutSelectionLogs } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized ?? undefined;
      updateSet[field] = normalized ?? undefined;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * جلب مستخدم بالـ id الداخلي
 */
export async function getUserByInternalId(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== Ideas Functions ====================

/**
 * حفظ فكرة جديدة في قاعدة البيانات
 */
export async function createIdea(idea: InsertIdea): Promise<Idea | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create idea: database not available");
    return null;
  }

  try {
    const result = await db.insert(ideas).values(idea).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create idea:", error);
    throw error;
  }
}

/**
 * جلب جميع أفكار مستخدم معين
 */
export async function getUserIdeas(userId: number, limit = 50, offset = 0): Promise<Idea[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ideas: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(ideas)
      .where(eq(ideas.userId, userId))
      .orderBy(desc(ideas.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get user ideas:", error);
    throw error;
  }
}

/**
 * البحث في أفكار المستخدم
 */
export async function searchUserIdeas(
  userId: number, 
  searchQuery: string,
  limit = 50,
  offset = 0
): Promise<Idea[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search ideas: database not available");
    return [];
  }

  try {
    const searchPattern = `%${searchQuery}%`;
    
    const result = await db
      .select()
      .from(ideas)
      .where(
        and(
          eq(ideas.userId, userId),
          or(
            like(ideas.programDescription, searchPattern),
            like(ideas.idea, searchPattern),
            like(ideas.objective, searchPattern)
          )
        )
      )
      .orderBy(desc(ideas.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to search ideas:", error);
    throw error;
  }
}

/**
 * جلب فكرة واحدة بالـ ID
 */
export async function getIdeaById(ideaId: number, userId: number): Promise<Idea | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get idea: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(ideas)
      .where(and(eq(ideas.id, ideaId), eq(ideas.userId, userId)))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get idea:", error);
    throw error;
  }
}

/**
 * حذف فكرة
 */
export async function deleteIdea(ideaId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete idea: database not available");
    return false;
  }

  try {
    const result = await db
      .delete(ideas)
      .where(and(eq(ideas.id, ideaId), eq(ideas.userId, userId)))
      .returning({ id: ideas.id });
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to delete idea:", error);
    throw error;
  }
}

/**
 * عدد أفكار المستخدم
 */
export async function countUserIdeas(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot count ideas: database not available");
    return 0;
  }

  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(ideas)
      .where(eq(ideas.userId, userId));
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error("[Database] Failed to count ideas:", error);
    throw error;
  }
}


/**
 * تحديث فكرة موجودة
 */
export async function updateIdea(
  ideaId: number, 
  userId: number, 
  updates: Partial<Pick<Idea, 'idea' | 'objective' | 'justifications' | 'features' | 'strengths' | 'outputs' | 'expectedResults' | 'logFrame' | 'vision' | 'detailedObjectives' | 'generalObjective' | 'selectedName' | 'proposedNames' | 'risks'>>
): Promise<Idea | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update idea: database not available");
    return null;
  }

  try {
    // التحقق من أن الفكرة تخص المستخدم
    const existing = await getIdeaById(ideaId, userId);
    if (!existing) {
      return null;
    }

    // تحديث الفكرة
    await db
      .update(ideas)
      .set(updates)
      .where(and(eq(ideas.id, ideaId), eq(ideas.userId, userId)));

    // إرجاع الفكرة المحدثة
    const updated = await getIdeaById(ideaId, userId);
    return updated;
  } catch (error) {
    console.error("[Database] Failed to update idea:", error);
    throw error;
  }
}


// ==================== Conversations Functions ====================

/**
 * إنشاء محادثة جديدة
 */
export async function createConversation(conversation: InsertConversation): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create conversation: database not available");
    return null;
  }

  try {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create conversation:", error);
    throw error;
  }
}

/**
 * جلب محادثات فكرة معينة
 */
export async function getIdeaConversations(ideaId: number, userId: number): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversations: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.ideaId, ideaId), eq(conversations.userId, userId)))
      .orderBy(desc(conversations.createdAt));
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get conversations:", error);
    throw error;
  }
}

/**
 * جلب محادثة بالـ ID
 */
export async function getConversationById(conversationId: number, userId: number): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversation: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get conversation:", error);
    throw error;
  }
}

// ==================== Messages Functions ====================

/**
 * إضافة رسالة جديدة
 */
export async function addMessage(message: InsertMessage): Promise<Message | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add message: database not available");
    return null;
  }

  try {
    const result = await db.insert(messages).values(message).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to add message:", error);
    throw error;
  }
}

/**
 * جلب رسائل محادثة معينة
 */
export async function getConversationMessages(conversationId: number): Promise<Message[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get messages: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get messages:", error);
    throw error;
  }
}


// ==================== Admin Functions ====================

/**
 * جلب جميع المستخدمين (للمدير فقط)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    throw error;
  }
}

/**
 * جلب المستخدمين حسب الحالة
 */
export async function getUsersByStatus(status: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.status, status))
      .orderBy(desc(users.createdAt));
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get users by status:", error);
    throw error;
  }
}

/**
 * تحديث حالة المستخدم
 */
export async function updateUserStatus(userId: number, status: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user status: database not available");
    return false;
  }

  try {
    const result = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning({ id: users.id });
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to update user status:", error);
    throw error;
  }
}

/**
 * إحصائيات المستخدمين
 */
export async function getUserStats() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user stats: database not available");
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }

  try {
    const total = await db.select({ count: sql<number>`count(*)` }).from(users);
    const pending = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, 'pending'));
    const approved = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, 'approved'));
    const rejected = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, 'rejected'));
    
    return {
      total: total[0]?.count || 0,
      pending: pending[0]?.count || 0,
      approved: approved[0]?.count || 0,
      rejected: rejected[0]?.count || 0,
    };
  } catch (error) {
    console.error("[Database] Failed to get user stats:", error);
    throw error;
  }
}

/**
 * جلب مستخدم بالـ ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    throw error;
  }
}

/** US9: Get user's selected AI model ID (OpenRouter). Returns null if not set. */
export async function getSelectedModelForUser(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select({ selectedModelId: users.selectedModelId }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.selectedModelId ?? null;
}


// دوال إدارة الصلاحيات
export const getPermissions = async (userId: number) => {
  const db = await getDb();
  if (!db) return null;
  
  const result = await (db as any).select().from(permissions).where(eq(permissions.userId, userId)).limit(1);
  return result[0] || null;
};

export const updatePermissions = async (userId: number, updates: Partial<InsertPermission>) => {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getPermissions(userId);
  
  if (existing) {
    return await db
      .update(permissions)
      .set(updates)
      .where(eq(permissions.userId, userId));
  } else {
    return await db.insert(permissions).values({
      userId,
      ...updates,
    });
  }
};

export const initializePermissions = async (userId: number) => {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getPermissions(userId);
  if (!existing) {
    return await db.insert(permissions).values({
      userId,
      canGenerateIdea: 1,
      canGenerateKPIs: 1,
      canEstimateBudget: 1,
      canGenerateSWOT: 1,
      canGenerateLogFrame: 1,
      canGeneratePMDPro: 1,
      canGenerateDesignThinking: 1,
      canChat: 1,
      canExportPDF: 1,
    });
  }
  return existing;
};


// ==================== System Features Functions ====================

/**
 * جلب جميع الميزات العامة
 */
export async function getAllSystemFeatures(): Promise<SystemFeature[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get features: database not available");
    return [];
  }

  try {
    return await db.select().from(systemFeatures).orderBy(systemFeatures.category);
  } catch (error) {
    console.error("[Database] Failed to get features:", error);
    return [];
  }
}

/**
 * جلب ميزة بمعرفها
 */
export async function getSystemFeatureByKey(featureKey: string): Promise<SystemFeature | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(systemFeatures).where(eq(systemFeatures.featureKey, featureKey)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get feature:", error);
    return null;
  }
}

/**
 * تحديث حالة ميزة (تفعيل/تعطيل)
 */
export async function toggleSystemFeature(featureKey: string, isEnabled: boolean): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(systemFeatures)
      .set({ isEnabled: isEnabled ? 1 : 0 })
      .where(eq(systemFeatures.featureKey, featureKey));
    return true;
  } catch (error) {
    console.error("[Database] Failed to toggle feature:", error);
    return false;
  }
}

/**
 * جلب جميع المستخدمين مع صلاحياتهم
 */
export async function getAllUsersWithPermissions() {
  const db = await getDb();
  if (!db) return [];

  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const usersWithPermissions = await Promise.all(
      allUsers.map(async (user) => {
        const userPermissions = await getPermissions(user.id);
        return {
          ...user,
          permissions: userPermissions,
        };
      })
    );
    return usersWithPermissions;
  } catch (error) {
    console.error("[Database] Failed to get users with permissions:", error);
    return [];
  }
}

/**
 * تحديث صلاحية مستخدم معين
 */
export async function updateUserPermission(
  userId: number,
  permissionKey: keyof Permission,
  value: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // التأكد من وجود سجل صلاحيات للمستخدم
    await initializePermissions(userId);
    
    await db.update(permissions)
      .set({ [permissionKey]: value })
      .where(eq(permissions.userId, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update permission:", error);
    return false;
  }
}

/**
 * تحديث جميع صلاحيات مستخدم
 */
export async function updateAllUserPermissions(
  userId: number,
  newPermissions: Partial<InsertPermission>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // التأكد من وجود سجل صلاحيات للمستخدم
    await initializePermissions(userId);
    
    await db.update(permissions)
      .set(newPermissions)
      .where(eq(permissions.userId, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update all permissions:", error);
    return false;
  }
}


/**
 * تحديث شعار المؤسسة للمستخدم
 */
export async function updateOrganizationLogo(
  userId: number,
  logoUrl: string | null
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(users)
      .set({ organizationLogo: logoUrl })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update organization logo:", error);
    return false;
  }
}

/**
 * تحديث اسم المؤسسة للمستخدم
 */
export async function updateOrganizationName(
  userId: number,
  name: string | null
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(users)
      .set({ organizationName: name })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update organization name:", error);
    return false;
  }
}

/**
 * تحديث معلومات المؤسسة (الشعار والاسم)
 */
export async function updateOrganizationInfo(
  userId: number,
  info: { logoUrl?: string | null; name?: string | null }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: { organizationLogo?: string | null; organizationName?: string | null } = {};
    
    if (info.logoUrl !== undefined) {
      updateData.organizationLogo = info.logoUrl;
    }
    if (info.name !== undefined) {
      updateData.organizationName = info.name;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));
    }
    return true;
  } catch (error) {
    console.error("[Database] Failed to update organization info:", error);
    return false;
  }
}

/**
 * جلب معلومات المؤسسة للمستخدم
 */
export async function getOrganizationInfo(userId: number): Promise<{ logo: string | null; name: string | null } | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select({
      logo: users.organizationLogo,
      name: users.organizationName,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    if (result.length === 0) return null;
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get organization info:", error);
    return null;
  }
}


// ==================== Project Tracking Functions ====================

/**
 * إنشاء أو جلب تتبع مشروع لفكرة معينة
 */
export async function getOrCreateProjectTracking(ideaId: number, userId: number): Promise<ProjectTracking | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // التحقق من وجود تتبع للمشروع
    const existing = await db
      .select()
      .from(projectTracking)
      .where(and(eq(projectTracking.ideaId, ideaId), eq(projectTracking.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // إنشاء تتبع جديد
    const result = await db.insert(projectTracking).values({
      ideaId,
      userId,
      status: 'planning',
      overallProgress: 0,
    }).returning();

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get/create project tracking:", error);
    return null;
  }
}

/**
 * تحديث تتبع المشروع
 */
export async function updateProjectTracking(
  trackingId: number,
  userId: number,
  updates: Partial<Pick<ProjectTracking, 'status' | 'overallProgress' | 'actualStartDate' | 'expectedEndDate' | 'actualEndDate' | 'notes'>>
): Promise<ProjectTracking | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(projectTracking)
      .set(updates)
      .where(and(eq(projectTracking.id, trackingId), eq(projectTracking.userId, userId)));

    const updated = await db
      .select()
      .from(projectTracking)
      .where(eq(projectTracking.id, trackingId))
      .limit(1);

    return updated[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update project tracking:", error);
    return null;
  }
}

// ==================== Project Tasks Functions ====================

/**
 * إضافة مهمة جديدة
 */
export async function createProjectTask(task: InsertProjectTask): Promise<ProjectTask | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(projectTasks).values(task).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create task:", error);
    return null;
  }
}

/**
 * جلب مهام المشروع
 */
export async function getProjectTasks(trackingId: number): Promise<ProjectTask[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(projectTasks)
      .where(eq(projectTasks.projectTrackingId, trackingId))
      .orderBy(projectTasks.sortOrder);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get tasks:", error);
    return [];
  }
}

/**
 * تحديث مهمة
 */
export async function updateProjectTask(
  taskId: number,
  updates: Partial<Pick<ProjectTask, 'title' | 'description' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'completedAt' | 'sortOrder'>>
): Promise<ProjectTask | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(projectTasks).set(updates).where(eq(projectTasks.id, taskId));
    const updated = await db.select().from(projectTasks).where(eq(projectTasks.id, taskId)).limit(1);
    return updated[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update task:", error);
    return null;
  }
}

/**
 * حذف مهمة
 */
export async function deleteProjectTask(taskId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db.delete(projectTasks).where(eq(projectTasks.id, taskId)).returning({ id: projectTasks.id });
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to delete task:", error);
    return false;
  }
}

// ==================== Budget Tracking Functions ====================

/**
 * إضافة بند ميزانية
 */
export async function createBudgetItem(item: InsertBudgetTracking): Promise<BudgetTracking | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(budgetTracking).values(item).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create budget item:", error);
    return null;
  }
}

/**
 * جلب بنود الميزانية
 */
export async function getBudgetItems(trackingId: number): Promise<BudgetTracking[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(budgetTracking)
      .where(eq(budgetTracking.projectTrackingId, trackingId))
      .orderBy(desc(budgetTracking.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get budget items:", error);
    return [];
  }
}

/**
 * تحديث بند ميزانية
 */
export async function updateBudgetItem(
  itemId: number,
  updates: Partial<Pick<BudgetTracking, 'category' | 'description' | 'plannedAmount' | 'actualAmount' | 'spentDate' | 'notes'>>
): Promise<BudgetTracking | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(budgetTracking).set(updates).where(eq(budgetTracking.id, itemId));
    const updated = await db.select().from(budgetTracking).where(eq(budgetTracking.id, itemId)).limit(1);
    return updated[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update budget item:", error);
    return null;
  }
}

/**
 * حذف بند ميزانية
 */
export async function deleteBudgetItem(itemId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db.delete(budgetTracking).where(eq(budgetTracking.id, itemId)).returning({ id: budgetTracking.id });
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to delete budget item:", error);
    return false;
  }
}

// ==================== KPI Tracking Functions ====================

/**
 * إضافة مؤشر أداء
 */
export async function createKpiItem(item: InsertKpiTracking): Promise<KpiTracking | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(kpiTracking).values(item).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create KPI item:", error);
    return null;
  }
}

/**
 * جلب مؤشرات الأداء
 */
export async function getKpiItems(trackingId: number): Promise<KpiTracking[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(kpiTracking)
      .where(eq(kpiTracking.projectTrackingId, trackingId))
      .orderBy(desc(kpiTracking.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get KPI items:", error);
    return [];
  }
}

/**
 * تحديث مؤشر أداء
 */
export async function updateKpiItem(
  itemId: number,
  updates: Partial<Pick<KpiTracking, 'kpiName' | 'targetValue' | 'actualValue' | 'unit' | 'measurementDate' | 'notes'>>
): Promise<KpiTracking | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(kpiTracking).set(updates).where(eq(kpiTracking.id, itemId));
    const updated = await db.select().from(kpiTracking).where(eq(kpiTracking.id, itemId)).limit(1);
    return updated[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update KPI item:", error);
    return null;
  }
}

/**
 * حذف مؤشر أداء
 */
export async function deleteKpiItem(itemId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db.delete(kpiTracking).where(eq(kpiTracking.id, itemId)).returning({ id: kpiTracking.id });
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to delete KPI item:", error);
    return false;
  }
}

// ==================== Risk Tracking Functions ====================

/**
 * إضافة خطر
 */
export async function createRiskItem(item: InsertRiskTracking): Promise<RiskTracking | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(riskTracking).values(item).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create risk item:", error);
    return null;
  }
}

/**
 * جلب المخاطر
 */
export async function getRiskItems(trackingId: number): Promise<RiskTracking[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(riskTracking)
      .where(eq(riskTracking.projectTrackingId, trackingId))
      .orderBy(desc(riskTracking.createdAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get risk items:", error);
    return [];
  }
}

/**
 * تحديث خطر
 */
export async function updateRiskItem(
  itemId: number,
  updates: Partial<Pick<RiskTracking, 'riskDescription' | 'severity' | 'likelihood' | 'status' | 'mitigationStrategy' | 'owner'>>
): Promise<RiskTracking | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(riskTracking).set(updates).where(eq(riskTracking.id, itemId));
    const updated = await db.select().from(riskTracking).where(eq(riskTracking.id, itemId)).limit(1);
    return updated[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update risk item:", error);
    return null;
  }
}

/**
 * حذف خطر
 */
export async function deleteRiskItem(itemId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db.delete(riskTracking).where(eq(riskTracking.id, itemId)).returning({ id: riskTracking.id });
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to delete risk item:", error);
    return false;
  }
}

/**
 * اعتماد برنامج
 */
export async function approveIdea(ideaId: number, userId: number, approverId: number): Promise<Idea | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot approve idea: database not available");
    return null;
  }

  try {
    // التحقق من أن الفكرة تخص المستخدم
    const idea = await getIdeaById(ideaId, userId);
    if (!idea) {
      console.warn("[Database] Idea not found or doesn't belong to user");
      return null;
    }

    // تحديث حالة الاعتماد
    await db
      .update(ideas)
      .set({
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: approverId,
      })
      .where(eq(ideas.id, ideaId));

    // إرجاع الفكرة المحدثة
    const updated = await getIdeaById(ideaId, userId);
    return updated;
  } catch (error) {
    console.error("[Database] Failed to approve idea:", error);
    return null;
  }
}

/**
 * إلغاء اعتماد برنامج
 */
export async function unapproveIdea(ideaId: number, userId: number): Promise<Idea | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot unapprove idea: database not available");
    return null;
  }

  try {
    // التحقق من أن الفكرة تخص المستخدم
    const idea = await getIdeaById(ideaId, userId);
    if (!idea) {
      console.warn("[Database] Idea not found or doesn't belong to user");
      return null;
    }

    // إلغاء حالة الاعتماد
    await db
      .update(ideas)
      .set({
        isApproved: false,
        approvedAt: null,
        approvedBy: null,
      })
      .where(eq(ideas.id, ideaId));

    // إرجاع الفكرة المحدثة
    const updated = await getIdeaById(ideaId, userId);
    return updated;
  } catch (error) {
    console.error("[Database] Failed to unapprove idea:", error);
    return null;
  }
}

/**
 * الحصول على البرامج المعتمدة للمستخدم
 */
export async function getApprovedIdeas(userId: number, limit = 50, offset = 0): Promise<Idea[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get approved ideas: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(ideas)
      .where(and(eq(ideas.userId, userId), eq(ideas.isApproved, true)))
      .orderBy(desc(ideas.approvedAt))
      .limit(limit)
      .offset(offset);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get approved ideas:", error);
    return [];
  }
}


// ==================== Dashboard Layout Functions ====================

/**
 * الحصول على تخصيص لوحة المتابعة للمستخدم
 */
export async function getDashboardLayout(userId: number): Promise<DashboardLayout | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get dashboard layout: database not available");
    return null;
  }

  try {
    const [layout] = await db
      .select()
      .from(dashboardLayouts)
      .where(eq(dashboardLayouts.userId, userId))
      .limit(1);

    return layout || null;
  } catch (error) {
    console.error("[Database] Failed to get dashboard layout:", error);
    return null;
  }
}

/**
 * حفظ أو تحديث تخصيص لوحة المتابعة
 */
export async function saveDashboardLayout(
  userId: number,
  tabsOrder: string[]
): Promise<DashboardLayout | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save dashboard layout: database not available");
    return null;
  }

  try {
    // التحقق من وجود تخصيص سابق
    const existing = await getDashboardLayout(userId);
    const tabsOrderJson = JSON.stringify(tabsOrder);

    if (existing) {
      // تحديث التخصيص الموجود
      await db
        .update(dashboardLayouts)
        .set({
          tabsOrder: tabsOrderJson,
        })
        .where(eq(dashboardLayouts.id, existing.id));

      return await getDashboardLayout(userId);
    } else {
      // إنشاء تخصيص جديد
      await db
        .insert(dashboardLayouts)
        .values({
          userId,
          tabsOrder: tabsOrderJson,
        });

      return await getDashboardLayout(userId);
    }
  } catch (error) {
    console.error("[Database] Failed to save dashboard layout:", error);
    return null;
  }
}

/**
 * إعادة تعيين تخصيص لوحة المتابعة للإعدادات الافتراضية
 */
export async function resetDashboardLayout(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reset dashboard layout: database not available");
    return false;
  }

  try {
    await db
      .delete(dashboardLayouts)
      .where(eq(dashboardLayouts.userId, userId));

    return true;
  } catch (error) {
    console.error("[Database] Failed to reset dashboard layout:", error);
    return false;
  }
}

// ==================== Slide Deck Functions ====================

/**
 * جلب عروض الشرائح للمستخدم
 */
export async function getSlideDecks(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get slide decks: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(slideDecks)
      .where(eq(slideDecks.userId, userId))
      .orderBy(desc(slideDecks.updatedAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get slide decks:", error);
    return [];
  }
}

/**
 * جلب عرض شرائح بالمعرف (لتحميل واستعادة layoutId, layoutConfig, overflowStrategy)
 */
export async function getSlideDeckById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const [deck] = await db
      .select()
      .from(slideDecks)
      .where(and(eq(slideDecks.id, id), eq(slideDecks.userId, userId)))
      .limit(1);
    return deck ?? null;
  } catch (e) {
    console.error("[Database] Failed to get slide deck by id:", e);
    return null;
  }
}

/**
 * إنشاء عرض شرائح جديد
 */
export async function createSlideDeck(deck: { userId: number; title: string; description: string | null; slides: string | null; slideCount?: number }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .insert(slideDecks)
      .values({
        userId: deck.userId,
        title: deck.title,
        description: deck.description,
        slides: deck.slides,
        slideCount: deck.slideCount || 0,
        status: 'draft',
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create slide deck:", error);
    throw error;
  }
}

/**
 * تحديث عرض شرائح
 */
export async function updateSlideDeck(id: number, userId: number, updates: Partial<{ title: string; description: string | null; slides: string | null; slideCount: number; status: 'draft' | 'published' | 'archived' }>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .update(slideDecks)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(slideDecks.id, id), eq(slideDecks.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw new Error("Slide deck not found or access denied");
    }

    return result[0];
  } catch (error) {
    console.error("[Database] Failed to update slide deck:", error);
    throw error;
  }
}

/**
 * حذف عرض شرائح
 */
export async function deleteSlideDeck(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .delete(slideDecks)
      .where(and(eq(slideDecks.id, id), eq(slideDecks.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw new Error("Slide deck not found or access denied");
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to delete slide deck:", error);
    throw error;
  }
}

/**
 * نسخ عرض شرائح
 */
export async function duplicateSlideDeck(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Get original deck
    const original = await db
      .select()
      .from(slideDecks)
      .where(and(eq(slideDecks.id, id), eq(slideDecks.userId, userId)))
      .limit(1);

    if (original.length === 0) {
      throw new Error("Slide deck not found or access denied");
    }

    // Create copy with "نسخة" prefix
    const result = await db
      .insert(slideDecks)
      .values({
        userId: userId,
        title: `نسخة ${original[0].title}`,
        description: original[0].description,
        slides: original[0].slides,
        slideCount: original[0].slideCount,
        thumbnailUrl: original[0].thumbnailUrl,
        status: 'draft',
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("[Database] Failed to duplicate slide deck:", error);
    throw error;
  }
}

/**
 * Delete layout logs for a deck (before replacing with new logs on update).
 */
export async function deleteLayoutLogsForDeck(slideDeckId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.delete(layoutSelectionLogs).where(eq(layoutSelectionLogs.slideDeckId, slideDeckId));
  } catch (e) {
    console.warn("[Database] Failed to delete layout logs:", e);
  }
}

/**
 * Insert layout selection logs from slides JSON (US6).
 * Parses slides and logs layout selections for slides with layoutSelectionLogPayload.
 */
export async function insertLayoutLogsFromSlides(slideDeckId: number, slidesJson: string | null): Promise<void> {
  if (!slidesJson) return;
  const db = await getDb();
  if (!db) return;
  try {
    const slides = JSON.parse(slidesJson) as Array<{
      order?: number;
      layoutSelectionLogPayload?: {
        slideType?: string;
        contentAnalysis: Record<string, unknown>;
        candidateLayouts: string[];
        candidateScores?: Record<string, number>;
        selectedLayoutId: string;
        selectionMethod: 'scoring' | 'fallback' | 'ai';
      };
    }>;
    if (!Array.isArray(slides)) return;
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      const payload = s?.layoutSelectionLogPayload;
      if (!payload?.selectedLayoutId) continue;
      await db.insert(layoutSelectionLogs).values({
        slideDeckId,
        slideIndex: s.order ?? i,
        slideType: payload.slideType ?? null,
        contentAnalysis: payload.contentAnalysis ?? {},
        candidateLayouts: payload.candidateLayouts ?? [],
        candidateScores: payload.candidateScores ?? null,
        selectedLayoutId: payload.selectedLayoutId,
        selectionMethod: payload.selectionMethod ?? 'scoring',
      });
    }
  } catch (e) {
    console.warn("[Database] Failed to insert layout logs from slides:", e);
  }
}
