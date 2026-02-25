/**
 * Migration Script: MySQL to PostgreSQL
 * 
 * This script helps migrate data from the old MySQL database to the new PostgreSQL database.
 * 
 * Prerequisites:
 * 1. Both databases should be accessible
 * 2. PostgreSQL database should have the schema already created (run `pnpm run db:push` first)
 * 
 * Usage:
 * 1. Set MYSQL_DATABASE_URL environment variable with your MySQL connection string
 * 2. Set DATABASE_URL environment variable with your PostgreSQL connection string
 * 3. Run: tsx scripts/migrate-mysql-to-postgres.ts
 */

import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Import schema types
import {
  users, ideas, conversations, messages, permissions, systemFeatures,
  projectTracking, projectTasks, budgetTracking, kpiTracking,
  riskTracking, sustainabilityAnalysis, dashboardLayouts, researchStudies
} from "../drizzle/schema";

const MYSQL_URL = process.env.MYSQL_DATABASE_URL;
const POSTGRES_URL = process.env.DATABASE_URL;

if (!MYSQL_URL) {
  console.error("❌ MYSQL_DATABASE_URL environment variable is required");
  process.exit(1);
}

if (!POSTGRES_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

async function migrate() {
  console.log("🚀 Starting migration from MySQL to PostgreSQL...\n");

  try {
    // Connect to both databases
    console.log("📡 Connecting to MySQL...");
    const mysqlDb = drizzleMysql(MYSQL_URL);

    console.log("📡 Connecting to PostgreSQL...");
    const postgresClient = postgres(POSTGRES_URL);
    const postgresDb = drizzlePostgres(postgresClient);

    // Migrate users
    console.log("\n👥 Migrating users...");
    const mysqlUsers = await mysqlDb.select().from(users);
    if (mysqlUsers.length > 0) {
      for (const user of mysqlUsers) {
        await postgresDb.insert(users).values({
          ...user,
          id: undefined, // Let PostgreSQL generate new IDs
        }).onConflictDoUpdate({
          target: users.openId,
          set: user,
        });
      }
      console.log(`✅ Migrated ${mysqlUsers.length} users`);
    } else {
      console.log("ℹ️  No users to migrate");
    }

    // Migrate ideas
    console.log("\n💡 Migrating ideas...");
    const mysqlIdeas = await mysqlDb.select().from(ideas);
    if (mysqlIdeas.length > 0) {
      for (const idea of mysqlIdeas) {
        await postgresDb.insert(ideas).values({
          ...idea,
          id: undefined, // Let PostgreSQL generate new IDs
        });
      }
      console.log(`✅ Migrated ${mysqlIdeas.length} ideas`);
    } else {
      console.log("ℹ️  No ideas to migrate");
    }

    // Migrate conversations
    console.log("\n💬 Migrating conversations...");
    const mysqlConversations = await mysqlDb.select().from(conversations);
    if (mysqlConversations.length > 0) {
      for (const conversation of mysqlConversations) {
        await postgresDb.insert(conversations).values({
          ...conversation,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlConversations.length} conversations`);
    } else {
      console.log("ℹ️  No conversations to migrate");
    }

    // Migrate messages
    console.log("\n📨 Migrating messages...");
    const mysqlMessages = await mysqlDb.select().from(messages);
    if (mysqlMessages.length > 0) {
      for (const message of mysqlMessages) {
        await postgresDb.insert(messages).values({
          ...message,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlMessages.length} messages`);
    } else {
      console.log("ℹ️  No messages to migrate");
    }

    // Migrate permissions
    console.log("\n🔐 Migrating permissions...");
    const mysqlPermissions = await mysqlDb.select().from(permissions);
    if (mysqlPermissions.length > 0) {
      for (const permission of mysqlPermissions) {
        await postgresDb.insert(permissions).values({
          ...permission,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlPermissions.length} permissions`);
    } else {
      console.log("ℹ️  No permissions to migrate");
    }

    // Migrate system features
    console.log("\n⚙️  Migrating system features...");
    const mysqlSystemFeatures = await mysqlDb.select().from(systemFeatures);
    if (mysqlSystemFeatures.length > 0) {
      for (const feature of mysqlSystemFeatures) {
        await postgresDb.insert(systemFeatures).values({
          ...feature,
          id: undefined,
        }).onConflictDoUpdate({
          target: systemFeatures.featureKey,
          set: feature,
        });
      }
      console.log(`✅ Migrated ${mysqlSystemFeatures.length} system features`);
    } else {
      console.log("ℹ️  No system features to migrate");
    }

    // Migrate project tracking
    console.log("\n📊 Migrating project tracking...");
    const mysqlProjectTracking = await mysqlDb.select().from(projectTracking);
    if (mysqlProjectTracking.length > 0) {
      for (const project of mysqlProjectTracking) {
        await postgresDb.insert(projectTracking).values({
          ...project,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlProjectTracking.length} project tracking records`);
    } else {
      console.log("ℹ️  No project tracking to migrate");
    }

    // Migrate project tasks
    console.log("\n✅ Migrating project tasks...");
    const mysqlProjectTasks = await mysqlDb.select().from(projectTasks);
    if (mysqlProjectTasks.length > 0) {
      for (const task of mysqlProjectTasks) {
        await postgresDb.insert(projectTasks).values({
          ...task,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlProjectTasks.length} project tasks`);
    } else {
      console.log("ℹ️  No project tasks to migrate");
    }

    // Migrate budget tracking
    console.log("\n💰 Migrating budget tracking...");
    const mysqlBudgetTracking = await mysqlDb.select().from(budgetTracking);
    if (mysqlBudgetTracking.length > 0) {
      for (const budget of mysqlBudgetTracking) {
        await postgresDb.insert(budgetTracking).values({
          ...budget,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlBudgetTracking.length} budget tracking records`);
    } else {
      console.log("ℹ️  No budget tracking to migrate");
    }

    // Migrate KPI tracking
    console.log("\n📈 Migrating KPI tracking...");
    const mysqlKpiTracking = await mysqlDb.select().from(kpiTracking);
    if (mysqlKpiTracking.length > 0) {
      for (const kpi of mysqlKpiTracking) {
        await postgresDb.insert(kpiTracking).values({
          ...kpi,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlKpiTracking.length} KPI tracking records`);
    } else {
      console.log("ℹ️  No KPI tracking to migrate");
    }

    // Migrate risk tracking
    console.log("\n⚠️  Migrating risk tracking...");
    const mysqlRiskTracking = await mysqlDb.select().from(riskTracking);
    if (mysqlRiskTracking.length > 0) {
      for (const risk of mysqlRiskTracking) {
        await postgresDb.insert(riskTracking).values({
          ...risk,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlRiskTracking.length} risk tracking records`);
    } else {
      console.log("ℹ️  No risk tracking to migrate");
    }

    // Migrate sustainability analysis
    console.log("\n🌱 Migrating sustainability analysis...");
    const mysqlSustainability = await mysqlDb.select().from(sustainabilityAnalysis);
    if (mysqlSustainability.length > 0) {
      for (const sustainability of mysqlSustainability) {
        await postgresDb.insert(sustainabilityAnalysis).values({
          ...sustainability,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlSustainability.length} sustainability analysis records`);
    } else {
      console.log("ℹ️  No sustainability analysis to migrate");
    }

    // Migrate dashboard layouts
    console.log("\n📋 Migrating dashboard layouts...");
    const mysqlDashboardLayouts = await mysqlDb.select().from(dashboardLayouts);
    if (mysqlDashboardLayouts.length > 0) {
      for (const layout of mysqlDashboardLayouts) {
        await postgresDb.insert(dashboardLayouts).values({
          ...layout,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlDashboardLayouts.length} dashboard layouts`);
    } else {
      console.log("ℹ️  No dashboard layouts to migrate");
    }

    // Migrate research studies
    console.log("\n📚 Migrating research studies...");
    const mysqlResearchStudies = await mysqlDb.select().from(researchStudies);
    if (mysqlResearchStudies.length > 0) {
      for (const study of mysqlResearchStudies) {
        await postgresDb.insert(researchStudies).values({
          ...study,
          id: undefined,
        });
      }
      console.log(`✅ Migrated ${mysqlResearchStudies.length} research studies`);
    } else {
      console.log("ℹ️  No research studies to migrate");
    }

    // Close connections
    await postgresClient.end();

    console.log("\n✨ Migration completed successfully!");
    console.log("\n⚠️  Important: Please verify the data in your PostgreSQL database before removing the MySQL database.");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrate();
