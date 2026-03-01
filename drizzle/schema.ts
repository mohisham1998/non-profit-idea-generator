import { boolean, integer, jsonb, pgTable, text, timestamp, varchar, serial, bigint } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("internal").notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  /** حالة المستخدم: pending (في انتظار الموافقة), approved (موافق عليه), rejected (مرفوض) */
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  /** شعار المؤسسة - رابط الصورة في S3 */
  organizationLogo: text("organizationLogo"),
  /** اسم المؤسسة */
  organizationName: varchar("organizationName", { length: 255 }),
  /** اسم الجمعية */
  associationName: varchar("associationName", { length: 255 }),
  /** رقم التواصل */
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  /** اللون الأساسي للمؤسسة */
  primaryColor: varchar("primaryColor", { length: 7 }),
  /** اللون الثانوي للمؤسسة */
  secondaryColor: varchar("secondaryColor", { length: 7 }),
  /** لون الخلفية */
  backgroundColor: varchar("backgroundColor", { length: 7 }),
  /** موضع الشعار: cover, footer, hidden */
  logoPlacement: varchar("logoPlacement", { length: 20 }).default("cover"),
  /** معرف نموذج AI المختار */
  selectedModelId: varchar("selectedModelId", { length: 100 }),
  /** مفتاح OpenRouter API (مشفر) */
  openRouterApiKey: text("openRouterApiKey"),
  /** حد الاستخدام بالدولار */
  quotaLimitUsd: integer("quotaLimitUsd").default(50),
  /** الاستخدام الحالي بالدولار */
  currentUsageUsd: integer("currentUsageUsd").default(0),
  /** تخزين الصور المستخدم (بايت) */
  imageStorageUsedBytes: bigint("imageStorageUsedBytes", { mode: "number" }).default(0).notNull(),
  /** حد تخزين الصور (بايت، 10GB افتراضي) */
  imageStorageLimitBytes: bigint("imageStorageLimitBytes", { mode: "number" }).default(10737418240).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول الأفكار المولدة - يحفظ جميع الأفكار التي يولدها المستخدمون
 */
export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  /** وصف البرنامج أو المبادرة المدخل من المستخدم */
  programDescription: text("programDescription").notNull(),
  /** الفئة المستهدفة */
  targetAudience: varchar("targetAudience", { length: 255 }),
  /** العدد المستهدف */
  targetCount: varchar("targetCount", { length: 100 }),
  /** المدة الزمنية للتنفيذ */
  duration: varchar("duration", { length: 100 }),
  /** المسميات المقترحة للبرنامج - يخزن كـ JSON */
  proposedNames: text("proposedNames"),
  /** الاسم الرسمي المختار للمبادرة */
  selectedName: varchar("selectedName", { length: 255 }),
  /** الرؤية */
  vision: text("vision"),
  /** الهدف العام */
  generalObjective: text("generalObjective"),
  /** الأهداف التفصيلية */
  detailedObjectives: text("detailedObjectives"),
  /** الفكرة المولدة */
  idea: text("idea").notNull(),
  /** الهدف */
  objective: text("objective").notNull(),
  /** مبررات البرنامج أو المشروع */
  justifications: text("justifications").notNull(),
  /** المميزات */
  features: text("features").notNull(),
  /** نقاط القوة */
  strengths: text("strengths").notNull(),
  /** المخرجات */
  outputs: text("outputs").notNull(),
  /** النتائج المتوقعة */
  expectedResults: text("expectedResults").notNull(),
  /** المخاطر واستراتيجيات التخفيف */
  risks: text("risks"),
  /** الإطار المنطقي - يخزن كـ JSON */
  logFrame: text("logFrame"),
  /** مؤشرات الأداء - يخزن كـ JSON */
  kpis: text("kpis"),
  /** الجدول الزمني - يخزن كـ JSON */
  timeline: text("timeline"),
  /** PMDPro - يخزن كـ JSON */
  pmdpro: text("pmdpro"),
  /** التفكير التصميمي - يخزن كـ JSON */
  designThinking: text("designThinking"),
  /** التقييم - يخزن كـ JSON */
  evaluation: text("evaluation"),
  /** حالة الاعتماد - هل تم اعتماد البرنامج */
  isApproved: boolean("isApproved").default(false).notNull(),
  /** تاريخ الاعتماد */
  approvedAt: timestamp("approvedAt"),
  /** معرف المستخدم الذي اعتمد البرنامج */
  approvedBy: integer("approvedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = typeof ideas.$inferInsert;

/**
 * جدول المحادثات - يحفظ محادثات تطوير الأفكار
 */
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  ideaId: integer("ideaId").notNull(),
  /** عنوان المحادثة */
  title: varchar("title", { length: 255 }),
  /** حالة المحادثة */
  status: varchar("status", { length: 20 }).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * جدول الرسائل - يحفظ رسائل المحادثات
 */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull(),
  /** دور المرسل: user أو assistant */
  role: varchar("role", { length: 20 }).notNull(),
  /** محتوى الرسالة */
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * جدول الصلاحيات - يحدد الميزات المتاحة لكل مستخدم
 */
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  /** صلاحية توليد الأفكار */
  canGenerateIdea: integer("canGenerateIdea").default(1).notNull(),
  /** صلاحية توليد مؤشرات الأداء */
  canGenerateKPIs: integer("canGenerateKPIs").default(1).notNull(),
  /** صلاحية تقدير الميزانية */
  canEstimateBudget: integer("canEstimateBudget").default(1).notNull(),
  /** صلاحية تحليل SWOT */
  canGenerateSWOT: integer("canGenerateSWOT").default(1).notNull(),
  /** صلاحية الإطار المنطقي */
  canGenerateLogFrame: integer("canGenerateLogFrame").default(1).notNull(),
  /** صلاحية PMDPro */
  canGeneratePMDPro: integer("canGeneratePMDPro").default(1).notNull(),
  /** صلاحية التفكير التصميمي */
  canGenerateDesignThinking: integer("canGenerateDesignThinking").default(1).notNull(),
  /** صلاحية المحادثة التفاعلية */
  canChat: integer("canChat").default(1).notNull(),
  /** صلاحية تصدير PDF */
  canExportPDF: integer("canExportPDF").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

/**
 * جدول الميزات العامة - يحدد الميزات المتاحة في النظام وحالتها
 */
export const systemFeatures = pgTable("system_features", {
  id: serial("id").primaryKey(),
  /** معرف الميزة الفريد */
  featureKey: varchar("featureKey", { length: 100 }).unique().notNull(),
  /** اسم الميزة بالعربية */
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  /** وصف الميزة */
  description: text("description"),
  /** حالة الميزة: 1 = مفعلة, 0 = معطلة */
  isEnabled: integer("isEnabled").default(1).notNull(),
  /** الفئة */
  category: varchar("category", { length: 100 }).default("general").notNull(),
  /** الأيقونة */
  icon: varchar("icon", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SystemFeature = typeof systemFeatures.$inferSelect;
export type InsertSystemFeature = typeof systemFeatures.$inferInsert;


/**
 * جدول تتبع المشروع - يحفظ بيانات متابعة تقدم المشروع
 */
export const projectTracking = pgTable("project_tracking", {
  id: serial("id").primaryKey(),
  ideaId: integer("ideaId").notNull(),
  userId: integer("userId").notNull(),
  /** حالة المشروع: planning, in_progress, completed, on_hold, cancelled */
  status: varchar("status", { length: 50 }).default("planning").notNull(),
  /** نسبة الإنجاز الكلية (0-100) */
  overallProgress: integer("overallProgress").default(0).notNull(),
  /** تاريخ البدء الفعلي */
  actualStartDate: timestamp("actualStartDate"),
  /** تاريخ الانتهاء المتوقع */
  expectedEndDate: timestamp("expectedEndDate"),
  /** تاريخ الانتهاء الفعلي */
  actualEndDate: timestamp("actualEndDate"),
  /** ملاحظات عامة */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProjectTracking = typeof projectTracking.$inferSelect;
export type InsertProjectTracking = typeof projectTracking.$inferInsert;

/**
 * جدول المهام - يحفظ مهام المشروع
 */
export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectTrackingId: integer("projectTrackingId").notNull(),
  /** عنوان المهمة */
  title: varchar("title", { length: 255 }).notNull(),
  /** وصف المهمة */
  description: text("description"),
  /** حالة المهمة: pending, in_progress, completed, cancelled */
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  /** الأولوية: low, medium, high, urgent */
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  /** المسؤول عن المهمة */
  assignee: varchar("assignee", { length: 255 }),
  /** تاريخ الاستحقاق */
  dueDate: timestamp("dueDate"),
  /** تاريخ الإنجاز الفعلي */
  completedAt: timestamp("completedAt"),
  /** ترتيب المهمة */
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

/**
 * جدول تتبع الميزانية - يحفظ المصروفات الفعلية
 */
export const budgetTracking = pgTable("budget_tracking", {
  id: serial("id").primaryKey(),
  projectTrackingId: integer("projectTrackingId").notNull(),
  /** فئة المصروف */
  category: varchar("category", { length: 255 }).notNull(),
  /** وصف المصروف */
  description: text("description"),
  /** المبلغ المخطط */
  plannedAmount: integer("plannedAmount").default(0).notNull(),
  /** المبلغ الفعلي المصروف */
  actualAmount: integer("actualAmount").default(0).notNull(),
  /** تاريخ الصرف */
  spentDate: timestamp("spentDate"),
  /** ملاحظات */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BudgetTracking = typeof budgetTracking.$inferSelect;
export type InsertBudgetTracking = typeof budgetTracking.$inferInsert;

/**
 * جدول تتبع المؤشرات - يحفظ قيم المؤشرات الفعلية
 */
export const kpiTracking = pgTable("kpi_tracking", {
  id: serial("id").primaryKey(),
  projectTrackingId: integer("projectTrackingId").notNull(),
  /** اسم المؤشر */
  kpiName: varchar("kpiName", { length: 255 }).notNull(),
  /** القيمة المستهدفة */
  targetValue: varchar("targetValue", { length: 100 }).notNull(),
  /** القيمة الفعلية */
  actualValue: varchar("actualValue", { length: 100 }),
  /** وحدة القياس */
  unit: varchar("unit", { length: 100 }),
  /** تاريخ القياس */
  measurementDate: timestamp("measurementDate"),
  /** ملاحظات */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type KpiTracking = typeof kpiTracking.$inferSelect;
export type InsertKpiTracking = typeof kpiTracking.$inferInsert;

/**
 * جدول تتبع المخاطر - يحفظ حالة المخاطر
 */
export const riskTracking = pgTable("risk_tracking", {
  id: serial("id").primaryKey(),
  projectTrackingId: integer("projectTrackingId").notNull(),
  /** وصف الخطر */
  riskDescription: text("riskDescription").notNull(),
  /** مستوى الخطورة: low, medium, high, critical */
  severity: varchar("severity", { length: 20 }).default("medium").notNull(),
  /** احتمالية الحدوث: low, medium, high */
  likelihood: varchar("likelihood", { length: 20 }).default("medium").notNull(),
  /** حالة الخطر: identified, mitigated, occurred, closed */
  status: varchar("status", { length: 50 }).default("identified").notNull(),
  /** استراتيجية التخفيف */
  mitigationStrategy: text("mitigationStrategy"),
  /** المسؤول عن المتابعة */
  owner: varchar("owner", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RiskTracking = typeof riskTracking.$inferSelect;
export type InsertRiskTracking = typeof riskTracking.$inferInsert;


/**
 * جدول تحليل الاستدامة - يحفظ تحليل الاستدامة للأفكار
 */
export const sustainabilityAnalysis = pgTable("sustainability_analysis", {
  id: serial("id").primaryKey(),
  ideaId: integer("ideaId").notNull(),
  /** التقييم الإجمالي للاستدامة (0-100) */
  overallScore: integer("overallScore").notNull(),
  /** مؤشرات الاستدامة - يخزن كـ JSON */
  indicators: text("indicators"),
  /** مصادر التمويل المحتملة - يخزن كـ JSON */
  fundingSources: text("fundingSources"),
  /** توصيات لتحسين الاستدامة - يخزن كـ JSON */
  recommendations: text("recommendations"),
  /** خطة الاستدامة طويلة المدى - يخزن كـ JSON */
  longTermPlan: text("longTermPlan"),
  /** المخاطر على الاستدامة - يخزن كـ JSON */
  risks: text("risks"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SustainabilityAnalysis = typeof sustainabilityAnalysis.$inferSelect;
export type InsertSustainabilityAnalysis = typeof sustainabilityAnalysis.$inferInsert;


/**
 * جدول تخصيص لوحة المتابعة - يحفظ تفضيلات ترتيب الأقسام لكل مستخدم
 */
export const dashboardLayouts = pgTable("dashboard_layouts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  /** ترتيب التبويبات - يخزن كـ JSON array مثل ["tasks", "budget", "kpis", "risks"] */
  tabsOrder: text("tabsOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DashboardLayout = typeof dashboardLayouts.$inferSelect;
export type InsertDashboardLayout = typeof dashboardLayouts.$inferInsert;

/**
 * جدول الدراسات البحثية للمشاريع المعتمدة
 */
export const researchStudies = pgTable("researchStudies", {
  id: serial("id").primaryKey(),
  ideaId: integer("ideaId").notNull(),
  userId: integer("userId").notNull(),
  /** الملخص التنفيذي */
  executiveSummary: text("executiveSummary"),
  /** أهمية البرنامج - تحليل أكاديمي */
  programImportance: text("programImportance"),
  /** العائد الاجتماعي المتوقع */
  socialReturn: text("socialReturn"),
  /** العائد للجمعية */
  organizationReturn: text("organizationReturn"),
  /** التوصيات والخلاصة */
  recommendations: text("recommendations"),
  /** المراجع العلمية - JSON array */
  references: text("references"),
  /** تاريخ الإنشاء */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** تاريخ آخر تحديث */
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ResearchStudy = typeof researchStudies.$inferSelect;
export type InsertResearchStudy = typeof researchStudies.$inferInsert;

/**
 * جدول شرائح العرض - يحفف عروض الشرائح المولدة
 */
export const slideDecks = pgTable("slide_decks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  /** عنوان العرض */
  title: varchar("title", { length: 255 }).notNull(),
  /** وصف العرض */
  description: text("description"),
  /** عدد الشرائح */
  slideCount: integer("slideCount").default(0).notNull(),
  /** رابط الصورة المصغرة */
  thumbnailUrl: text("thumbnailUrl"),
  /** محتوى الشرائح - يخزن كـ JSON */
  slides: text("slides"),
  /** حالة العرض: draft, published, archived */
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SlideDeck = typeof slideDecks.$inferSelect;
export type InsertSlideDeck = typeof slideDecks.$inferInsert;

/**
 * جدول الصور المولدة بالذكاء الاصطناعي - DALL-E 3
 */
export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  slideDeckId: integer("slideDeckId").references(() => slideDecks.id, { onDelete: "cascade" }),
  slideId: varchar("slideId", { length: 100 }).notNull(),
  contentType: varchar("contentType", { length: 50 }).notNull(),
  prompt: text("prompt").notNull(),
  contentHash: varchar("contentHash", { length: 64 }).notNull(),
  /** Base64-encoded image data (avoids bytea compatibility) */
  imageData: text("imageData").notNull(),
  fileSize: integer("fileSize").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  generationStatus: varchar("generationStatus", { length: 20 }).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;

/**
 * Layout selection logs - audit trail for AI layout decisions
 */
export const layoutSelectionLogs = pgTable("layout_selection_logs", {
  id: serial("id").primaryKey(),
  slideDeckId: integer("slideDeckId").notNull().references(() => slideDecks.id, { onDelete: "cascade" }),
  slideIndex: integer("slideIndex").notNull(),
  slideType: varchar("slideType", { length: 50 }),
  contentAnalysis: jsonb("contentAnalysis").notNull(),
  candidateLayouts: text("candidateLayouts").array().notNull(),
  candidateScores: jsonb("candidateScores"),
  selectedLayoutId: varchar("selectedLayoutId", { length: 100 }).notNull(),
  selectionMethod: varchar("selectionMethod", { length: 20 }).default("scoring").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LayoutSelectionLog = typeof layoutSelectionLogs.$inferSelect;
export type InsertLayoutSelectionLog = typeof layoutSelectionLogs.$inferInsert;

/**
 * Export jobs - track PDF/PPTX export operations
 */
export const exportJobs = pgTable("export_jobs", {
  id: serial("id").primaryKey(),
  slideDeckId: integer("slideDeckId").notNull().references(() => slideDecks.id, { onDelete: "cascade" }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  format: varchar("format", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  progress: integer("progress").default(0).notNull(),
  outputUrl: text("outputUrl"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = typeof exportJobs.$inferInsert;
