import { getDb } from "./db";
import { researchStudies, ResearchStudy, InsertResearchStudy } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * إنشاء دراسة بحثية جديدة
 */
export async function createResearchStudy(data: InsertResearchStudy): Promise<ResearchStudy> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [created] = await db.insert(researchStudies).values(data).returning();
  if (!created) throw new Error('Failed to create research study');
  return created;
}

/**
 * الحصول على دراسة بحثية حسب معرف الفكرة
 */
export async function getResearchStudyByIdeaId(ideaId: number): Promise<ResearchStudy | null> {
  const db = await getDb();
  if (!db) return null;
  const studies = await db.select().from(researchStudies).where(eq(researchStudies.ideaId, ideaId)).limit(1);
  return studies.length > 0 ? studies[0] : null;
}

/**
 * الحصول على دراسة بحثية حسب المعرف
 */
export async function getResearchStudyById(id: number): Promise<ResearchStudy | null> {
  const db = await getDb();
  if (!db) return null;
  const studies = await db.select().from(researchStudies).where(eq(researchStudies.id, id)).limit(1);
  return studies.length > 0 ? studies[0] : null;
}

/**
 * تحديث دراسة بحثية
 */
export async function updateResearchStudy(
  id: number,
  data: Partial<InsertResearchStudy>
): Promise<ResearchStudy | null> {
  const db = await getDb();
  if (!db) return null;
  await db.update(researchStudies).set(data).where(eq(researchStudies.id, id));
  return getResearchStudyById(id);
}

/**
 * حذف دراسة بحثية
 */
export async function deleteResearchStudy(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(researchStudies).where(eq(researchStudies.id, id));
  return true;
}

/**
 * الحصول على جميع الدراسات البحثية لمستخدم معين
 */
export async function getResearchStudiesByUserId(userId: number): Promise<ResearchStudy[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(researchStudies).where(eq(researchStudies.userId, userId));
}
