import { getDb } from "./db";
import { sustainabilityAnalysis } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getSustainabilityAnalysis(ideaId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const analysis = await db
    .select()
    .from(sustainabilityAnalysis)
    .where(eq(sustainabilityAnalysis.ideaId, ideaId))
    .limit(1);
  
  return analysis[0] || null;
}

export async function createSustainabilityAnalysis(data: {
  ideaId: number;
  overallScore: number;
  indicators: any;
  fundingSources: any;
  recommendations: any;
  longTermPlan: any;
  risks: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .insert(sustainabilityAnalysis)
    .values({
      ideaId: data.ideaId,
      overallScore: data.overallScore,
      indicators: JSON.stringify(data.indicators),
      fundingSources: JSON.stringify(data.fundingSources),
      recommendations: JSON.stringify(data.recommendations),
      longTermPlan: JSON.stringify(data.longTermPlan),
      risks: JSON.stringify(data.risks),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  
  return await getSustainabilityAnalysis(data.ideaId);
}

export async function updateSustainabilityAnalysis(
  ideaId: number,
  data: {
    overallScore: number;
    indicators: any;
    fundingSources: any;
    recommendations: any;
    longTermPlan: any;
    risks: any;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(sustainabilityAnalysis)
    .set({
      overallScore: data.overallScore,
      indicators: JSON.stringify(data.indicators),
      fundingSources: JSON.stringify(data.fundingSources),
      recommendations: JSON.stringify(data.recommendations),
      longTermPlan: JSON.stringify(data.longTermPlan),
      risks: JSON.stringify(data.risks),
      updatedAt: new Date()
    })
    .where(eq(sustainabilityAnalysis.ideaId, ideaId));
  
  return await getSustainabilityAnalysis(ideaId);
}
