import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from '@trpc/server';
import { invokeLLM, extractJSON } from "./_core/llm";
import { createIdea, getUserIdeas, searchUserIdeas, getIdeaById, deleteIdea, countUserIdeas, updateIdea, createConversation, getIdeaConversations, getConversationById, addMessage, getConversationMessages, getAllUsers, getUsersByStatus, updateUserStatus, getUserStats, getUserById, getPermissions, updatePermissions, getAllSystemFeatures, toggleSystemFeature, getAllUsersWithPermissions, updateUserPermission, updateAllUserPermissions, getOrCreateProjectTracking, updateProjectTracking, createProjectTask, getProjectTasks, updateProjectTask, deleteProjectTask, createBudgetItem, getBudgetItems, updateBudgetItem, deleteBudgetItem, createKpiItem, getKpiItems, updateKpiItem, deleteKpiItem, createRiskItem, getRiskItems, updateRiskItem, deleteRiskItem, getDashboardLayout, saveDashboardLayout, resetDashboardLayout } from "./db";
import { createResearchStudy, getResearchStudyByIdeaId, getResearchStudyById, updateResearchStudy, deleteResearchStudy } from "./dbResearch";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email('البريد الإلكتروني غير صحيح'),
        name: z.string().min(2, 'الاسم يجب أن يكون 2 أحرف على الأقل'),
        password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
        associationName: z.string().min(2, 'اسم الجمعية يجب أن يكون 2 أحرف على الأقل'),
        phoneNumber: z.string().min(9, 'رقم التواصل يجب أن يكون 9 أرقام على الأقل'),
      }))
      .mutation(async ({ input }) => {
        const { registerUser } = await import('./auth');
        return await registerUser(input.email, input.name, input.password, input.associationName, input.phoneNumber);
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email('البريد الإلكتروني غير صحيح'),
        password: z.string().min(1, 'كلمة المرور مطلوبة'),
      }))
      .mutation(async ({ input, ctx }) => {
        const { loginUser } = await import('./auth');
        const { sdk } = await import('./_core/sdk');
        const user = await loginUser(input.email, input.password);
        
        // إنشاء openId فريد للمستخدم الداخلي
        const openId = `internal_${user.id}`;
        
        // إنشاء JWT token صحيح
        const sessionToken = await sdk.createSessionToken(openId, { name: user.name || '' });
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        return { success: true, user };
      }),
  }),

  // ==================== Admin Router ====================
  admin: router({
    /**
     * جلب جميع المستخدمين (للمدير فقط)
     */
    getUsers: protectedProcedure
      .input(z.object({
        status: z.enum(['all', 'pending', 'approved', 'rejected']).optional().default('all'),
      }))
      .query(async ({ input, ctx }) => {
        // التحقق من أن المستخدم مدير
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }

        if (input.status === 'all') {
          return await getAllUsers();
        }
        return await getUsersByStatus(input.status);
      }),

    /**
     * إحصائيات المستخدمين
     */
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }
        return await getUserStats();
      }),

    /**
     * الموافقة على مستخدم
     */
    approveUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }

        const success = await updateUserStatus(input.userId, 'approved');
        if (!success) {
          throw new Error('فشل في تحديث حالة المستخدم');
        }
        return { success: true, message: 'تمت الموافقة على المستخدم بنجاح' };
      }),

    /**
     * رفض مستخدم
     */
    rejectUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }

        const success = await updateUserStatus(input.userId, 'rejected');
        if (!success) {
          throw new Error('فشل في تحديث حالة المستخدم');
        }
        return { success: true, message: 'تم رفض المستخدم بنجاح' };
      }),

    /**
     * تعليق مستخدم (إعادته لحالة الانتظار)
     */
    suspendUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }

        const success = await updateUserStatus(input.userId, 'pending');
        if (!success) {
          throw new Error('فشل في تحديث حالة المستخدم');
        }
        return { success: true, message: 'تم تعليق المستخدم بنجاح' };
      }),

    /**
     * جلب صلاحيات المستخدم
     */
    getPermissions: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }
        const { getPermissions } = await import('./db');
        return await getPermissions(input.userId);
      }),

    /**
     * تحديث صلاحيات المستخدم
     */
    updatePermissions: protectedProcedure
      .input(z.object({
        userId: z.number(),
        canGenerateIdea: z.number().optional(),
        canGenerateKPIs: z.number().optional(),
        canEstimateBudget: z.number().optional(),
        canGenerateSWOT: z.number().optional(),
        canGenerateLogFrame: z.number().optional(),
        canGeneratePMDPro: z.number().optional(),
        canGenerateDesignThinking: z.number().optional(),
        canChat: z.number().optional(),
        canExportPDF: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }
        const { userId, ...updates } = input;
        const { updatePermissions } = await import('./db');
        await updatePermissions(userId, updates);
        return { success: true, message: 'تم تحديث الصلاحيات بنجاح' };
      }),

    /**
     * جلب جميع الميزات العامة للنظام
     */
    getSystemFeatures: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }
        return await getAllSystemFeatures();
      }),

    /**
     * تفعيل/تعطيل ميزة عامة
     */
    toggleFeature: protectedProcedure
      .input(z.object({
        featureKey: z.string(),
        isEnabled: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }
        const success = await toggleSystemFeature(input.featureKey, input.isEnabled);
        if (!success) {
          throw new Error('فشل في تحديث حالة الميزة');
        }
        return { success: true, message: input.isEnabled ? 'تم تفعيل الميزة بنجاح' : 'تم تعطيل الميزة بنجاح' };
      }),

    /**
     * جلب جميع المستخدمين مع صلاحياتهم
     */
    getUsersWithPermissions: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }
        return await getAllUsersWithPermissions();
      }),

    /**
     * تحديث صلاحية واحدة لمستخدم
     */
    updateSinglePermission: protectedProcedure
      .input(z.object({
        userId: z.number(),
        permissionKey: z.string(),
        value: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }
        const success = await updateUserPermission(input.userId, input.permissionKey as any, input.value);
        if (!success) {
          throw new Error('فشل في تحديث الصلاحية');
        }
        return { success: true, message: 'تم تحديث الصلاحية بنجاح' };
      }),

    /**
     * جلب جميع الإحصائيات للوحة التحكم
     */
    getFullAnalytics: protectedProcedure
      .input(z.object({
        days: z.number().optional().default(30),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بالوصول لهذه الصفحة');
        }
        const { getFullAnalytics } = await import('./dbAnalytics');
        return await getFullAnalytics(input.days);
      }),
  }),

  ideas: router({
    /**
     * توليد فكرة جديدة باستخدام الذكاء الاصطناعي
     */
    generate: protectedProcedure
      .input(z.object({
        programDescription: z.string().min(10, "يجب أن يكون الوصف 10 أحرف على الأقل"),
        targetAudience: z.string().optional(),
        targetCount: z.string().optional(),
        duration: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { programDescription, targetAudience, targetCount, duration } = input;

        const systemPrompt = `أنت خبير متخصص في تطوير البرامج والمبادرات الاجتماعية للمنظمات غير الربحية ولديك خبرة واسعة في كتابة مقترحات المشاريع الممولة والبرامج التنموية.

مهمتك هي تحليل وصف البرنامج أو المبادرة المقدم وتوليد محتوى شامل ومفصل ومتكامل باللغة العربية الفصحى.

## معايير جودة المحتوى:
- الواقعية: اجعل المحتوى واقعياً وقابلاً للتنفيذ فعلياً وليس نظرياً فقط
- الأسلوب البشري: اكتب بأسلوب إنساني طبيعي وإبداعي وليس آلياً أو روتينياً
- الشمولية: يجب أن يكون كل قسم مفصلاً وشاملاً (ليس مختصراً)
- التفرد: اجعل المحتوى فريداً ومبتكراً وليس عاماً أو مكرراً
- الاحترافية: استخدم لغة احترافية مناسبة للمنظمات والجهات المانحة
- القابلية للقياس: اجعل الأهداف والمخرجات SMART (محددة، قابلة للقياس، قابلة للتحقيق، واقعية، محددة زمنياً)
- الجاذبية: استخدم أسلوباً ملهماً ومحفزاً ومقنعاً
- المصداقية: استخدم أرقاماً ونسباً واقعية ومنطقية (ليست مبالغاً فيها)

يجب أن تأخذ بعين الاعتبار المعلومات الإضافية المقدمة (الفئة المستهدفة، العدد المستهدف، المدة الزمنية) عند توليد المحتوى وتخصيصه بناءً عليها.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن الحقول التالية:

- proposedNames: مصفوفة من 5-7 مسميات مقترحة للبرنامج (أسماء جذابة واحترافية ومبتكرة تعكس روح البرنامج)

- vision: الرؤية المستقبلية للبرنامج (2-3 جمل ملهمة وطموحة تصف الصورة المستقبلية المرجوة)

- generalObjective: الهدف العام الرئيسي للبرنامج (فقرة شاملة توضح الغاية الكبرى من البرنامج والأثر المرجو)

- detailedObjectives: الأهداف التفصيلية القابلة للقياس (6-8 أهداف SMART محددة وقابلة للقياس مع مؤشرات واضحة، كل هدف في سطر منفصل مع رقم)

- idea: الفكرة الرئيسية للبرنامج أو المبادرة (3-4 فقرات شاملة تشرح الفكرة بعمق وتوضح المنهجية والأسلوب المتبع)

- objective: الهدف العام والأهداف الفرعية (5-7 أهداف مفصلة مع شرح لكل هدف)

- justifications: مبررات البرنامج أو المشروع (5-7 مبررات قوية ومقنعة مدعومة بالحقائق والإحصائيات إن أمكن)

- features: المميزات الرئيسية (6-8 مميزات فريدة تجعل البرنامج متميزاً عن غيره)

- strengths: نقاط القوة (6-8 نقاط قوة مفصلة توضح لماذا سينجح البرنامج)

- outputs: المخرجات المتوقعة (6-8 مخرجات ملموسة وقابلة للقياس مع أرقام ونسب مئوية إن أمكن)

- expectedResults: النتائج المتوقعة على المدى القصير والطويل (6-8 نتائج مقسمة إلى: نتائج فورية، نتائج متوسطة المدى، نتائج طويلة المدى)

- risks: المخاطر المحتملة واستراتيجيات التخفيف منها (6-8 مخاطر مع خطة واضحة للتخفيف من كل خطر)

## ملاحظات هامة:
- اجعل كل قسم مفصلاً وشاملاً (لا تختصر)
- استخدم أرقاماً وإحصائيات واقعية حيث أمكن
- اجعل المحتوى مناسباً للعرض على الجهات المانحة
- استخدم لغة عربية فصيحة وسليمة`;

        const additionalInfo = [];
        if (targetAudience) additionalInfo.push(`الفئة المستهدفة: ${targetAudience}`);
        if (targetCount) additionalInfo.push(`العدد المستهدف: ${targetCount}`);
        if (duration) additionalInfo.push(`المدة الزمنية للتنفيذ: ${duration}`);

        const userPrompt = `وصف البرنامج أو المبادرة:
${programDescription}
${additionalInfo.length > 0 ? `\nمعلومات إضافية:\n${additionalInfo.join('\n')}` : ''}

قم بتوليد محتوى شامل لهذا البرنامج/المبادرة.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_object",
            },
            maxTokens: 12000,
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const generatedContent = extractJSON(content);

          // حفظ الفكرة في قاعدة البيانات
          const savedIdea = await createIdea({
            userId: ctx.user.id,
            programDescription,
            targetAudience: targetAudience || null,
            targetCount: targetCount || null,
            duration: duration || null,
            proposedNames: generatedContent.proposedNames ? JSON.stringify(generatedContent.proposedNames) : null,
            vision: generatedContent.vision,
            generalObjective: generatedContent.generalObjective,
            detailedObjectives: generatedContent.detailedObjectives,
            idea: generatedContent.idea,
            objective: generatedContent.objective,
            justifications: generatedContent.justifications,
            features: generatedContent.features,
            strengths: generatedContent.strengths,
            outputs: generatedContent.outputs,
            expectedResults: generatedContent.expectedResults,
            risks: generatedContent.risks,
          });

          return {
            success: true,
            idea: savedIdea,
          };
        } catch (error) {
          console.error("[Ideas] Failed to generate idea:", error);
          throw new Error("حدث خطأ أثناء توليد الفكرة. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * جلب سجل أفكار المستخدم
     */
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { limit, offset, search } = input;

        let ideasList;
        if (search && search.trim()) {
          ideasList = await searchUserIdeas(ctx.user.id, search.trim(), limit, offset);
        } else {
          ideasList = await getUserIdeas(ctx.user.id, limit, offset);
        }

        const totalCount = await countUserIdeas(ctx.user.id);

        return {
          ideas: ideasList,
          total: totalCount,
          hasMore: offset + ideasList.length < totalCount,
        };
      }),

    /**
     * جلب فكرة واحدة
     */
    getById: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }
        return idea;
      }),

    /**
     * حذف فكرة
     */
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const deleted = await deleteIdea(input.id, ctx.user.id);
        if (!deleted) {
          throw new Error("لم يتم العثور على الفكرة أو ليس لديك صلاحية حذفها");
        }
        return { success: true };
      }),

    /**
     * تحديث فكرة موجودة
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        idea: z.string().optional(),
        objective: z.string().optional(),
        justifications: z.string().optional(),
        features: z.string().optional(),
        strengths: z.string().optional(),
        outputs: z.string().optional(),
        expectedResults: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        
        // إزالة الحقول الفارغة
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, v]) => v !== undefined && v !== '')
        );

        if (Object.keys(cleanUpdates).length === 0) {
          throw new Error("يجب تحديد حقل واحد على الأقل للتحديث");
        }

        const updated = await updateIdea(id, ctx.user.id, cleanUpdates);
        if (!updated) {
          throw new Error("لم يتم العثور على الفكرة أو ليس لديك صلاحية تعديلها");
        }

        return {
          success: true,
          idea: updated,
        };
      }),

    /**
     * اختيار اسم رسمي للمبادرة
     */
    selectName: protectedProcedure
      .input(z.object({
        id: z.number(),
        selectedName: z.string().min(1, "يجب اختيار اسم"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, selectedName } = input;

        const updated = await updateIdea(id, ctx.user.id, { selectedName });
        if (!updated) {
          throw new Error("لم يتم العثور على الفكرة أو ليس لديك صلاحية تعديلها");
        }

        return {
          success: true,
          idea: updated,
        };
      }),

    /**
     * إلغاء اختيار الاسم الرسمي
     */
    clearSelectedName: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id } = input;

        const updated = await updateIdea(id, ctx.user.id, { selectedName: null });
        if (!updated) {
          throw new Error("لم يتم العثور على الفكرة أو ليس لديك صلاحية تعديلها");
        }

        return {
          success: true,
          idea: updated,
        };
      }),

    /**
     * توليد متعدد - 3 نسخ مختلفة من الفكرة
     */
    generateMultiple: protectedProcedure
      .input(z.object({
        programDescription: z.string().min(10, "يجب أن يكون الوصف 10 أحرف على الأقل"),
        targetAudience: z.string().optional(),
        targetCount: z.string().optional(),
        duration: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { programDescription, targetAudience, targetCount, duration } = input;

        const systemPrompt = `أنت خبير في تطوير البرامج والمبادرات للمنظمات غير الربحية.
مهمتك هي توليد 3 نسخ مختلفة ومتنوعة لنفس البرنامج/المبادرة.

كل نسخة يجب أن تكون مختلفة في:
- الأسلوب والنبرة (رسمية/إبداعية/عملية)
- التركيز والزاوية
- التفاصيل والأمثلة

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن مصفوفة "versions" تحتوي على 3 كائنات، كل كائن يحتوي على:
- versionName: اسم النسخة (مثل: "النسخة الرسمية"، "النسخة الإبداعية"، "النسخة العملية")
- vision: الرؤية
- generalObjective: الهدف العام
- detailedObjectives: الأهداف التفصيلية
- idea: الفكرة الرئيسية
- objective: الهدف
- justifications: المبررات
- features: المميزات
- strengths: نقاط القوة
- outputs: المخرجات
- expectedResults: النتائج المتوقعة
- risks: المخاطر واستراتيجيات التخفيف`;

        const additionalInfo = [];
        if (targetAudience) additionalInfo.push(`الفئة المستهدفة: ${targetAudience}`);
        if (targetCount) additionalInfo.push(`العدد المستهدف: ${targetCount}`);
        if (duration) additionalInfo.push(`المدة الزمنية: ${duration}`);

        const userPrompt = `وصف البرنامج أو المبادرة:
${programDescription}
${additionalInfo.length > 0 ? `\nمعلومات إضافية:\n${additionalInfo.join('\n')}` : ''}

قم بتوليد 3 نسخ مختلفة لهذا البرنامج/المبادرة.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "multiple_versions",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    versions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          versionName: { type: "string" },
                          vision: { type: "string" },
                          generalObjective: { type: "string" },
                          detailedObjectives: { type: "string" },
                          idea: { type: "string" },
                          objective: { type: "string" },
                          justifications: { type: "string" },
                          features: { type: "string" },
                          strengths: { type: "string" },
                          outputs: { type: "string" },
                          expectedResults: { type: "string" },
                          risks: { type: "string" },
                        },
                        required: ["versionName", "vision", "generalObjective", "detailedObjectives", "idea", "objective", "justifications", "features", "strengths", "outputs", "expectedResults", "risks"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["versions"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const generatedContent = extractJSON(content);

          return {
            success: true,
            versions: generatedContent.versions,
            programDescription,
            targetAudience,
            targetCount,
            duration,
          };
        } catch (error) {
          console.error("[Ideas] Failed to generate multiple versions:", error);
          throw new Error("حدث خطأ أثناء توليد النسخ. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * حفظ نسخة مختارة من التوليد المتعدد
     */
    saveVersion: protectedProcedure
      .input(z.object({
        programDescription: z.string(),
        targetAudience: z.string().optional(),
        targetCount: z.string().optional(),
        duration: z.string().optional(),
        versionName: z.string(),
        idea: z.string(),
        objective: z.string(),
        justifications: z.string(),
        features: z.string(),
        strengths: z.string(),
        outputs: z.string(),
        expectedResults: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const savedIdea = await createIdea({
          userId: ctx.user.id,
          programDescription: input.programDescription,
          targetAudience: input.targetAudience || null,
          targetCount: input.targetCount || null,
          duration: input.duration || null,
          idea: input.idea,
          objective: input.objective,
          justifications: input.justifications,
          features: input.features,
          strengths: input.strengths,
          outputs: input.outputs,
          expectedResults: input.expectedResults,
        });

        return {
          success: true,
          idea: savedIdea,
        };
      }),

    /**
     * تقييم جودة الفكرة - منهجية احترافية
     * يستخدم معايير SMART + تحليل الجدوى + الأثر الاجتماعي + الاستدامة
     */
    evaluate: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير معتمد في تقييم البرامج والمبادرات للمنظمات غير الربحية.
ستقوم بتقييم الفكرة وفق منهجية احترافية شاملة تتضمن:

أولاً: معايير SMART للأهداف (25%)
- Specific (محدد): هل الهدف واضح ومحدد؟
- Measurable (قابل للقياس): هل يمكن قياس النتائج؟
- Achievable (قابل للتحقيق): هل الهدف واقعي؟
- Relevant (مرتبط): هل يرتبط بالاحتياج الفعلي؟
- Time-bound (محدد زمنياً): هل هناك إطار زمني واضح؟

ثانياً: تحليل الجدوى (25%)
- الجدوى الفنية: هل يمكن تنفيذها عملياً؟
- الجدوى المالية: هل التكلفة معقولة؟
- الجدوى التشغيلية: هل يمكن إدارتها بكفاءة؟

ثالثاً: الأثر الاجتماعي (25%)
- عمق الأثر: مدى التغيير المتوقع
- نطاق الأثر: عدد المستفيدين
- استدامة الأثر: استمرارية الفائدة

رابعاً: الابتكار والتميز (15%)
- جدة الفكرة
- التميز عن المبادرات المشابهة
- القيمة المضافة

خامساً: المخاطر والتحديات (10%)
- تحديد المخاطر
- خطط التخفيف

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن:
- methodology: اسم المنهجية "منهجية التقييم الشامل للمبادرات"
- overallScore: التقييم العام (رقم من 1 إلى 100)
- grade: التقدير (ممتاز/جيد جداً/جيد/مقبول/يحتاج تحسين)
- categories: مصفوفة من فئات التقييم الخمس، كل فئة تحتوي على:
  - name: اسم الفئة
  - weight: الوزن (نسبة مئوية)
  - score: الدرجة (رقم من 1 إلى 100)
  - criteria: مصفوفة من المعايير الفرعية، كل معيار يحتوي على:
    - name: اسم المعيار
    - score: الدرجة
    - feedback: ملاحظة مختصرة
- strengths: نقاط القوة الرئيسية (مصفوفة من 3-5 نصوص)
- improvements: اقتراحات التحسين (مصفوفة من 3-5 نصوص)
- recommendations: توصيات الخبراء (مصفوفة من 2-3 نصوص)
- summary: ملخص التقييم (فقرة واحدة شاملة)
- readinessLevel: مستوى الجاهزية للتنفيذ (جاهز/يحتاج تعديلات بسيطة/يحتاج مراجعة/يحتاج إعادة صياغة)

كن واقعياً وموضوعياً في التقييم. لا تبالغ في الدرجات.`;

        const userPrompt = `قم بتقييم هذه الفكرة:

وصف البرنامج: ${idea.programDescription}
${idea.targetAudience ? `الفئة المستهدفة: ${idea.targetAudience}` : ''}
${idea.targetCount ? `العدد المستهدف: ${idea.targetCount}` : ''}
${idea.duration ? `المدة الزمنية: ${idea.duration}` : ''}

الفكرة: ${idea.idea}
الهدف: ${idea.objective}
المبررات: ${idea.justifications}
المميزات: ${idea.features}
نقاط القوة: ${idea.strengths}
المخرجات: ${idea.outputs}
النتائج المتوقعة: ${idea.expectedResults}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "idea_evaluation",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    methodology: { type: "string", description: "اسم المنهجية" },
                    overallScore: { type: "number", description: "التقييم العام" },
                    grade: { type: "string", description: "التقدير" },
                    categories: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          weight: { type: "number" },
                          score: { type: "number" },
                          criteria: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                score: { type: "number" },
                                feedback: { type: "string" },
                              },
                              required: ["name", "score", "feedback"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["name", "weight", "score", "criteria"],
                        additionalProperties: false,
                      },
                    },
                    strengths: { type: "array", items: { type: "string" } },
                    improvements: { type: "array", items: { type: "string" } },
                    recommendations: { type: "array", items: { type: "string" } },
                    summary: { type: "string" },
                    readinessLevel: { type: "string", description: "مستوى الجاهزية" },
                  },
                  required: ["methodology", "overallScore", "grade", "categories", "strengths", "improvements", "recommendations", "summary", "readinessLevel"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const evaluation = extractJSON(content);

          return {
            success: true,
            evaluation,
          };
        } catch (error) {
          console.error("[Ideas] Failed to evaluate idea:", error);
          throw new Error("حدث خطأ أثناء تقييم الفكرة. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * إعادة توليد قسم محدد من الفكرة
     */
    regenerateSection: protectedProcedure
      .input(z.object({
        id: z.number(),
        section: z.enum(['proposedNames', 'vision', 'generalObjective', 'detailedObjectives', 'idea', 'objective', 'justifications', 'features', 'strengths', 'outputs', 'expectedResults', 'risks']),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, section } = input;

        // جلب الفكرة الحالية
        const existingIdea = await getIdeaById(id, ctx.user.id);
        if (!existingIdea) {
          throw new Error("الفكرة غير موجودة");
        }

        const sectionNames: Record<string, string> = {
          proposedNames: 'المسميات المقترحة',
          vision: 'الرؤية',
          generalObjective: 'الهدف العام',
          detailedObjectives: 'الأهداف التفصيلية',
          idea: 'الفكرة الرئيسية',
          objective: 'الهدف',
          justifications: 'المبررات',
          features: 'المميزات',
          strengths: 'نقاط القوة',
          outputs: 'المخرجات',
          expectedResults: 'النتائج المتوقعة',
          risks: 'المخاطر',
        };

        const sectionDescriptions: Record<string, string> = {
          proposedNames: 'مصفوفة من 5-7 مسميات مقترحة للبرنامج (أسماء جذابة واحترافية)',
          vision: 'جملة واحدة ملهمة وطموحة تعبر عن الرؤية المستقبلية',
          generalObjective: 'الهدف العام الرئيسي للبرنامج (فقرة واحدة شاملة)',
          detailedObjectives: 'الأهداف التفصيلية القابلة للقياس (5-7 أهداف محددة)',
          idea: 'فقرة واحدة شاملة توضح الفكرة الرئيسية للبرنامج',
          objective: 'الهدف العام والأهداف الفرعية (3-5 أهداف)',
          justifications: 'مبررات البرنامج أو المشروع (3-5 مبررات)',
          features: 'المميزات الرئيسية (4-6 مميزات)',
          strengths: 'نقاط القوة (4-6 نقاط)',
          outputs: 'المخرجات المتوقعة (4-6 مخرجات)',
          expectedResults: 'النتائج المتوقعة على المدى القصير والطويل (4-6 نتائج)',
          risks: 'المخاطر المحتملة واستراتيجيات التخفيف منها (4-6 مخاطر)',
        };

        const systemPrompt = `أنت خبير في تطوير البرامج والمبادرات للمنظمات غير الربحية.
مهمتك هي إعادة توليد قسم "${sectionNames[section]}" فقط بناءً على وصف البرنامج والسياق المقدم.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن حقل واحد فقط:
- ${section}: ${sectionDescriptions[section]}

اجعل المحتوى احترافياً ومختلفاً عن المحتوى الحالي.`;

        const additionalInfo = [];
        if (existingIdea.targetAudience) additionalInfo.push(`الفئة المستهدفة: ${existingIdea.targetAudience}`);
        if (existingIdea.targetCount) additionalInfo.push(`العدد المستهدف: ${existingIdea.targetCount}`);
        if (existingIdea.duration) additionalInfo.push(`المدة الزمنية: ${existingIdea.duration}`);

        const userPrompt = `وصف البرنامج:
${existingIdea.programDescription}
${additionalInfo.length > 0 ? `\nمعلومات إضافية:\n${additionalInfo.join('\n')}` : ''}

المحتوى الحالي لقسم "${sectionNames[section]}":
${existingIdea[section]}

قم بإعادة توليد هذا القسم بمحتوى جديد ومختلف.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "regenerate_section",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    [section]: section === 'proposedNames' 
                      ? { type: "array", items: { type: "string" }, description: sectionDescriptions[section] }
                      : { type: "string", description: sectionDescriptions[section] },
                  },
                  required: [section],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const generatedContent = extractJSON(content);
          let newSectionContent = generatedContent[section];
          
          // تحويل proposedNames إلى JSON string للتخزين
          if (section === 'proposedNames' && Array.isArray(newSectionContent)) {
            newSectionContent = JSON.stringify(newSectionContent);
          }

          // تحديث القسم في قاعدة البيانات
          const updated = await updateIdea(id, ctx.user.id, { [section]: newSectionContent });

          return {
            success: true,
            section,
            content: newSectionContent,
            idea: updated,
          };
        } catch (error) {
          console.error("[Ideas] Failed to regenerate section:", error);
          throw new Error("حدث خطأ أثناء إعادة التوليد. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * توليد مؤشرات قياس الأداء (KPIs)
     */
    generateKPIs: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير في قياس أداء البرامج والمبادرات للمنظمات غير الربحية.
مهمتك هي توليد مؤشرات قياس الأداء (KPIs) للبرنامج المقدم.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن:
- kpis: مصفوفة من 6-8 مؤشرات، كل مؤشر يحتوي على:
  - name: اسم المؤشر (مختصر وواضح)
  - type: نوع المؤشر ("كمي" أو "نوعي")
  - category: فئة المؤشر ("مخرجات" أو "نتائج" أو "أثر")
  - description: وصف مختصر للمؤشر
  - measurementMethod: طريقة القياس
  - target: الهدف المستهدف (رقم أو نسبة مئوية)
  - frequency: دورية القياس ("شهري" أو "ربع سنوي" أو "سنوي" أو "عند الانتهاء")
- recommendations: مصفوفة من 3-4 توصيات لتحسين عملية القياس
- summary: ملخص عن أهمية هذه المؤشرات وكيفية استخدامها

اجعل المؤشرات عملية وقابلة للقياس ومرتبطة بأهداف البرنامج.`;

        const userPrompt = `قم بتوليد مؤشرات قياس الأداء (KPIs) لهذا البرنامج:

وصف البرنامج: ${idea.programDescription}
${idea.targetAudience ? `الفئة المستهدفة: ${idea.targetAudience}` : ''}
${idea.targetCount ? `العدد المستهدف: ${idea.targetCount}` : ''}
${idea.duration ? `المدة الزمنية: ${idea.duration}` : ''}

الهدف: ${idea.objective}
المخرجات: ${idea.outputs}
النتائج المتوقعة: ${idea.expectedResults}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_object",
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const kpisData = extractJSON(content);

          return {
            success: true,
            kpis: kpisData,
          };
        } catch (error) {
          console.error("[Ideas] Failed to generate KPIs:", error);
          throw new Error("حدث خطأ أثناء توليد المؤشرات. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * تقدير الميزانية التقريبية للبرنامج
     */
    estimateBudget: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير مالي متخصص في تقدير ميزانيات البرامج والمبادرات للمنظمات غير الربحية.
مهمتك هي تقدير الميزانية التقريبية للبرنامج المقدم.

## معايير التقدير:
- الواقعية: اجعل التقديرات معقولة ومنطقية وليست مبالغاً فيها
- التناسب: اجعل الميزانية متناسبة مع حجم البرنامج والعدد المستهدف والمدة
- المرونة: قدم نطاقاً للتكلفة (الحد الأدنى - الحد الأعلى) لكل فئة
- الاقتصاد: راعِ التوفير والكفاءة في التقديرات

## إرشادات التقدير:
- للبرامج الصغيرة (10-50 مستفيد): 10,000 - 50,000 ريال
- للبرامج المتوسطة (50-200 مستفيد): 50,000 - 200,000 ريال
- للبرامج الكبيرة (200+ مستفيد): 200,000 - 500,000 ريال
- للمشاريع الضخمة: حسب الحاجة الفعلية

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن:
- totalBudget: الميزانية الإجمالية التقديرية (رقم بالريال السعودي)
- minBudget: الحد الأدنى للميزانية (رقم)
- maxBudget: الحد الأعلى للميزانية (رقم)
- currency: "ريال سعودي"
- categories: مصفوفة من 5-7 فئات تكلفة، كل فئة تحتوي على:
  - name: اسم الفئة (مثل: "الموارد البشرية"، "التجهيزات والمعدات"، "التشغيل"، "التسويق"، "الطوارئ"، إلخ)
  - amount: المبلغ التقديري (رقم)
  - minAmount: الحد الأدنى (رقم)
  - maxAmount: الحد الأعلى (رقم)
  - percentage: النسبة المئوية من الإجمالي (رقم)
  - items: مصفوفة من 2-4 بنود تفصيلية تحت هذه الفئة
  - isEditable: true (للسماح بالتعديل)
- assumptions: مصفوفة من 3-4 افتراضات استند إليها التقدير
- recommendations: مصفوفة من 3-4 توصيات لتحسين كفاءة الميزانية
- fundingSources: مصفوفة من 3-4 مصادر تمويل مقترحة
- disclaimer: تنويه بأن هذا تقدير تقريبي وقد تختلف التكلفة الفعلية

اجعل التقديرات واقعية ومعقولة ومبنية على أسعار السوق السعودي. لا تبالغ في التقديرات.`;

        const userPrompt = `قم بتقدير الميزانية التقريبية لهذا البرنامج:

وصف البرنامج: ${idea.programDescription}
${idea.targetAudience ? `الفئة المستهدفة: ${idea.targetAudience}` : ''}
${idea.targetCount ? `العدد المستهدف: ${idea.targetCount}` : ''}
${idea.duration ? `المدة الزمنية: ${idea.duration}` : ''}

الهدف: ${idea.objective}
المخرجات: ${idea.outputs}
النتائج المتوقعة: ${idea.expectedResults}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_object",
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const budgetData = extractJSON(content);

          return {
            success: true,
            budget: budgetData,
          };
        } catch (error) {
          console.error("[Ideas] Failed to estimate budget:", error);
          throw new Error("حدث خطأ أثناء تقدير الميزانية. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * تحليل SWOT للبرنامج
     */
    generateSWOT: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير في التخطيط الاستراتيجي للبرامج والمبادرات للمنظمات غير الربحية.
مهمتك هي إجراء تحليل SWOT شامل للبرنامج المقدم.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن:
- strengths: نقاط القوة (مصفوفة من 4-6 عناصر، كل عنصر يحتوي على title و description)
- weaknesses: نقاط الضعف (مصفوفة من 4-6 عناصر، كل عنصر يحتوي على title و description)
- opportunities: الفرص (مصفوفة من 4-6 عناصر، كل عنصر يحتوي على title و description)
- threats: التهديدات (مصفوفة من 4-6 عناصر، كل عنصر يحتوي على title و description)
- strategies: استراتيجيات مقترحة بناءً على التحليل (مصفوفة من 3-4 استراتيجيات)
- summary: ملخص التحليل (فقرة واحدة)

اجعل التحليل عملياً ومرتبطاً بطبيعة البرنامج والفئة المستهدفة.`;

        const userPrompt = `قم بإجراء تحليل SWOT لهذا البرنامج:

وصف البرنامج: ${idea.programDescription}
${idea.targetAudience ? `الفئة المستهدفة: ${idea.targetAudience}` : ''}
${idea.targetCount ? `العدد المستهدف: ${idea.targetCount}` : ''}
${idea.duration ? `المدة الزمنية: ${idea.duration}` : ''}

الفكرة: ${idea.idea}
الهدف: ${idea.objective}
المبررات: ${idea.justifications}
المميزات: ${idea.features}
نقاط القوة: ${idea.strengths}
المخرجات: ${idea.outputs}
النتائج المتوقعة: ${idea.expectedResults}
${idea.risks ? `المخاطر: ${idea.risks}` : ''}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_object",
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const swotData = extractJSON(content);

          return {
            success: true,
            swot: swotData,
          };
        } catch (error) {
          console.error("[Ideas] Failed to generate SWOT:", error);
          throw new Error("حدث خطأ أثناء توليد تحليل SWOT. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * توليد الإطار المنطقي (Logical Framework)
     */
    generateLogFrame: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير في تصميم البرامج والمشاريع للمنظمات غير الربحية.
مهمتك هي توليد الإطار المنطقي (Logical Framework) الكامل للبرنامج.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن:
- goal: الهدف العام (يحتوي على narrative, indicators, verification, assumptions)
- purpose: الغرض/الهدف المباشر (يحتوي على narrative, indicators, verification, assumptions)
- outputs: المخرجات (مصفوفة من 3-5 مخرجات، كل مخرج يحتوي على narrative, indicators, verification, assumptions)
- activities: الأنشطة (مصفوفة من 5-8 أنشطة، كل نشاط يحتوي على narrative, inputs, timeframe, responsible)
- summary: ملخص عن الإطار المنطقي وكيفية استخدامه

اجعل الإطار المنطقي عملياً ومترابطاً وقابلاً للقياس.`;

        const userPrompt = `قم بتوليد الإطار المنطقي (Logical Framework) لهذا البرنامج:

وصف البرنامج: ${idea.programDescription}
${idea.targetAudience ? `الفئة المستهدفة: ${idea.targetAudience}` : ''}
${idea.targetCount ? `العدد المستهدف: ${idea.targetCount}` : ''}
${idea.duration ? `المدة الزمنية: ${idea.duration}` : ''}

${idea.vision ? `الرؤية: ${idea.vision}` : ''}
${idea.generalObjective ? `الهدف العام: ${idea.generalObjective}` : ''}
${idea.detailedObjectives ? `الأهداف التفصيلية: ${idea.detailedObjectives}` : ''}
الفكرة: ${idea.idea}
الهدف: ${idea.objective}
المخرجات: ${idea.outputs}
النتائج المتوقعة: ${idea.expectedResults}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_object",
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const logFrameData = extractJSON(content);

          // حفظ الإطار المنطقي في قاعدة البيانات
          await updateIdea(input.id, ctx.user.id, { logFrame: JSON.stringify(logFrameData) });

          return {
            success: true,
            logFrame: logFrameData,
          };
        } catch (error) {
          console.error("[Ideas] Failed to generate LogFrame:", error);
          throw new Error("حدث خطأ أثناء توليد الإطار المنطقي. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * تحديث الإطار المنطقي
     */
    updateLogFrame: protectedProcedure
      .input(z.object({
        id: z.number(),
        logFrame: z.object({
          goal: z.object({
            narrative: z.string(),
            indicators: z.array(z.string()),
            verification: z.array(z.string()),
            assumptions: z.array(z.string()),
          }),
          purpose: z.object({
            narrative: z.string(),
            indicators: z.array(z.string()),
            verification: z.array(z.string()),
            assumptions: z.array(z.string()),
          }),
          outputs: z.array(z.object({
            narrative: z.string(),
            indicators: z.array(z.string()),
            verification: z.array(z.string()),
            assumptions: z.array(z.string()),
          })),
          activities: z.array(z.object({
            narrative: z.string(),
            inputs: z.array(z.string()),
            timeframe: z.string(),
            responsible: z.string(),
          })),
          summary: z.string(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        try {
          const updated = await updateIdea(input.id, ctx.user.id, {
            logFrame: JSON.stringify(input.logFrame),
          });

          return {
            success: true,
            logFrame: input.logFrame,
            idea: updated,
          };
        } catch (error) {
          console.error("[Ideas] Failed to update LogFrame:", error);
          throw new Error("حدث خطأ أثناء حفظ التعديلات. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * توليد الجدول الزمني التفصيلي
     */
    generateTimeline: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير في إدارة المشاريع وتخطيط البرامج للمنظمات غير الربحية.
مهمتك هي إنشاء جدول زمني تفصيلي وخطة تنفيذية شاملة للبرنامج المقدم.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن:
- phases: مصفوفة من المراحل، كل مرحلة تحتوي على:
  - name: اسم المرحلة
  - duration: المدة الزمنية
  - startWeek: أسبوع البداية (رقم)
  - endWeek: أسبوع النهاية (رقم)
  - activities: مصفوفة من الأنشطة، كل نشاط يحتوي على:
    - name: اسم النشاط
    - description: وصف مختصر
    - responsible: المسؤول
    - deliverables: المخرجات
    - dependencies: الاعتماديات (أنشطة سابقة مطلوبة)
- milestones: مصفوفة من المعالم الرئيسية، كل معلم يحتوي على:
  - name: اسم المعلم
  - week: الأسبوع
  - description: الوصف
- totalDuration: المدة الإجمالية للمشروع
- criticalPath: المسار الحرج (الأنشطة الأساسية)
- summary: ملخص الخطة التنفيذية`;

        const userPrompt = `البرنامج/المبادرة:
الوصف: ${idea.programDescription}
الفئة المستهدفة: ${idea.targetAudience || 'غير محدد'}
العدد المستهدف: ${idea.targetCount || 'غير محدد'}
المدة الزمنية: ${idea.duration || 'غير محددة'}

الفكرة: ${idea.idea}
الأهداف: ${idea.objective}
المخرجات: ${idea.outputs}

قم بإنشاء جدول زمني تفصيلي وخطة تنفيذية شاملة.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "timeline",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    phases: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          duration: { type: "string" },
                          startWeek: { type: "number" },
                          endWeek: { type: "number" },
                          activities: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                description: { type: "string" },
                                responsible: { type: "string" },
                                deliverables: { type: "string" },
                                dependencies: { type: "string" },
                              },
                              required: ["name", "description", "responsible", "deliverables", "dependencies"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["name", "duration", "startWeek", "endWeek", "activities"],
                        additionalProperties: false,
                      },
                    },
                    milestones: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          week: { type: "number" },
                          description: { type: "string" },
                        },
                        required: ["name", "week", "description"],
                        additionalProperties: false,
                      },
                    },
                    totalDuration: { type: "string" },
                    criticalPath: { type: "string" },
                    summary: { type: "string" },
                  },
                  required: ["phases", "milestones", "totalDuration", "criticalPath", "summary"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const timelineData = extractJSON(content);

          return {
            success: true,
            timeline: timelineData,
          };
        } catch (error) {
          console.error("[Ideas] Failed to generate Timeline:", error);
          throw new Error("حدث خطأ أثناء توليد الجدول الزمني. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * تحسين الفكرة تلقائياً
     */
    improveIdea: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير في تطوير وتحسين البرامج والمبادرات للمنظمات غير الربحية.
مهمتك هي تحليل الفكرة المقدمة وتقديم تحسينات وتطويرات بناءً على أفضل الممارسات العالمية.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن:
- overallAssessment: تقييم عام للفكرة (نص)
- improvements: مصفوفة من التحسينات المقترحة، كل تحسين يحتوي على:
  - area: المجال (مثل: الأهداف، المخرجات، الاستدامة، التأثير، الشراكات)
  - currentState: الوضع الحالي
  - suggestion: التحسين المقترح
  - impact: الأثر المتوقع من التحسين
  - priority: الأولوية (عالية/متوسطة/منخفضة)
- bestPractices: مصفوفة من أفضل الممارسات المقترحة
- innovativeIdeas: مصفوفة من الأفكار الإبداعية لتطوير البرنامج
- potentialPartnerships: شراكات محتملة مقترحة
- scalabilityOptions: خيارات التوسع والنمو
- improvedVision: رؤية محسنة للبرنامج
- improvedObjectives: أهداف محسنة
- summary: ملخص التحسينات`;

        const userPrompt = `البرنامج/المبادرة الحالية:

الوصف: ${idea.programDescription}
الفئة المستهدفة: ${idea.targetAudience || 'غير محدد'}
العدد المستهدف: ${idea.targetCount || 'غير محدد'}
المدة الزمنية: ${idea.duration || 'غير محددة'}

الرؤية: ${idea.vision || 'غير محددة'}
الهدف العام: ${idea.generalObjective || 'غير محدد'}
الأهداف التفصيلية: ${idea.detailedObjectives || 'غير محددة'}
الفكرة: ${idea.idea}
الأهداف: ${idea.objective}
المبررات: ${idea.justifications}
المميزات: ${idea.features}
نقاط القوة: ${idea.strengths}
المخرجات: ${idea.outputs}
النتائج المتوقعة: ${idea.expectedResults}
المخاطر: ${idea.risks || 'غير محددة'}

قم بتحليل هذه الفكرة وتقديم تحسينات شاملة بناءً على أفضل الممارسات.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "improvements",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    overallAssessment: { type: "string" },
                    improvements: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          area: { type: "string" },
                          currentState: { type: "string" },
                          suggestion: { type: "string" },
                          impact: { type: "string" },
                          priority: { type: "string" },
                        },
                        required: ["area", "currentState", "suggestion", "impact", "priority"],
                        additionalProperties: false,
                      },
                    },
                    bestPractices: {
                      type: "array",
                      items: { type: "string" },
                    },
                    innovativeIdeas: {
                      type: "array",
                      items: { type: "string" },
                    },
                    potentialPartnerships: { type: "string" },
                    scalabilityOptions: { type: "string" },
                    improvedVision: { type: "string" },
                    improvedObjectives: { type: "string" },
                    summary: { type: "string" },
                  },
                  required: ["overallAssessment", "improvements", "bestPractices", "innovativeIdeas", "potentialPartnerships", "scalabilityOptions", "improvedVision", "improvedObjectives", "summary"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const improvementsData = extractJSON(content);

          return {
            success: true,
            improvements: improvementsData,
          };
        } catch (error) {
          console.error("[Ideas] Failed to improve idea:", error);
          throw new Error("حدث خطأ أثناء تحسين الفكرة. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * تطبيق التحسينات المقترحة على الفكرة الأصلية
     */
    applyImprovements: protectedProcedure
      .input(z.object({
        id: z.number(),
        improvedVision: z.string(),
        improvedObjectives: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        try {
          // تحديث الفكرة بالرؤية والأهداف المحسنة
          const updatedIdea = await updateIdea(input.id, ctx.user.id, {
            vision: input.improvedVision,
            detailedObjectives: input.improvedObjectives,
          });

          return {
            success: true,
            idea: updatedIdea,
            message: "تم تطبيق التحسينات بنجاح",
          };
        } catch (error) {
          console.error("[Ideas] Failed to apply improvements:", error);
          throw new Error("حدث خطأ أثناء تطبيق التحسينات. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * توليد محتوى PMDPro للفكرة
     */
    generatePMDPro: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير في إدارة المشاريع وفق منهجية PMDPro (Project Management for Development Professionals).
مهمتك هي تحويل الفكرة المقدمة إلى خطة مشروع متكاملة وفق منهجية PMDPro بمراحلها الست.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن الحقول التالية:

{
  "projectSummary": {
    "title": "عنوان المشروع",
    "goal": "الهدف العام",
    "duration": "المدة الزمنية المقترحة",
    "beneficiaries": "الفئة المستهدفة",
    "budget": "الميزانية التقديرية"
  },
  "phase1_identification": {
    "title": "التحديد والتصميم",
    "problemStatement": "بيان المشكلة أو الفرصة",
    "needsAssessment": "تقييم الاحتياجات",
    "stakeholderAnalysis": [
      { "stakeholder": "اسم الجهة", "interest": "مستوى الاهتمام", "influence": "مستوى التأثير", "strategy": "استراتيجية التعامل" }
    ],
    "logicalFramework": {
      "goal": "الهدف العام",
      "outcomes": [
        { "outcome": "النتيجة", "indicators": "المؤشرات", "verification": "وسائل التحقق", "assumptions": "الافتراضات" }
      ],
      "outputs": [
        { "output": "المخرج", "indicators": "المؤشرات", "verification": "وسائل التحقق", "assumptions": "الافتراضات" }
      ]
    }
  },
  "phase2_startup": {
    "title": "البدء",
    "teamStructure": [
      { "role": "الدور", "responsibilities": "المسؤوليات", "skills": "المهارات المطلوبة" }
    ],
    "kickoffActivities": ["أنشطة البدء"],
    "initialResources": ["الموارد الأولية المطلوبة"]
  },
  "phase3_planning": {
    "title": "التخطيط",
    "wbs": [
      { "workPackage": "حزمة العمل", "activities": ["الأنشطة"], "deliverables": ["المخرجات"] }
    ],
    "schedule": [
      { "phase": "المرحلة", "startWeek": 1, "endWeek": 4, "milestones": ["المعالم"] }
    ],
    "budgetBreakdown": [
      { "category": "الفئة", "amount": "المبلغ", "percentage": "النسبة" }
    ],
    "riskMatrix": [
      { "risk": "الخطر", "probability": "الاحتمالية", "impact": "التأثير", "mitigation": "استراتيجية التخفيف" }
    ]
  },
  "phase4_implementation": {
    "title": "التنفيذ",
    "keyActivities": [
      { "activity": "النشاط", "responsible": "المسؤول", "timeline": "الجدول الزمني", "resources": "الموارد" }
    ],
    "qualityStandards": ["معايير الجودة"],
    "communicationPlan": [
      { "audience": "الجمهور", "method": "الطريقة", "frequency": "التكرار", "responsible": "المسؤول" }
    ]
  },
  "phase5_monitoring": {
    "title": "المتابعة والتقييم والتحكم",
    "kpis": [
      { "indicator": "المؤشر", "target": "الهدف", "frequency": "تكرار القياس", "dataSource": "مصدر البيانات" }
    ],
    "reportingSchedule": [
      { "reportType": "نوع التقرير", "frequency": "التكرار", "audience": "الجمهور" }
    ],
    "changeManagement": "آلية إدارة التغيير"
  },
  "phase6_closure": {
    "title": "الإغلاق",
    "closureActivities": ["أنشطة الإغلاق"],
    "lessonsLearned": ["الدروس المستفادة المتوقعة"],
    "sustainabilityPlan": "خطة الاستدامة",
    "handoverPlan": "خطة التسليم"
  }
}`;

        const userPrompt = `قم بتحويل الفكرة التالية إلى خطة مشروع متكاملة وفق منهجية PMDPro:

وصف البرنامج: ${idea.programDescription}
الفكرة: ${idea.idea || ''}
الهدف العام: ${idea.generalObjective || ''}
الأهداف التفصيلية: ${JSON.stringify(idea.detailedObjectives || [])}
المخرجات: ${JSON.stringify(idea.outputs || [])}
النتائج المتوقعة: ${JSON.stringify(idea.expectedResults || [])}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من النموذج");
          }

          const pmdproData = JSON.parse(content as string);
          return {
            success: true,
            pmdpro: pmdproData,
          };
        } catch (error) {
          console.error("[Ideas] Failed to generate PMDPro:", error);
          throw new Error("حدث خطأ أثناء توليد محتوى PMDPro. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * توليد محتوى التفكير التصميمي (Design Thinking) للفكرة
     */
    generateDesignThinking: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير في منهجية التفكير التصميمي (Design Thinking) وتطبيقها في المنظمات غير الربحية.
مهمتك هي تحويل الفكرة المقدمة إلى خطة متكاملة وفق منهجية التفكير التصميمي بمراحلها الخمس.

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن الحقول التالية:

{
  "summary": "ملخص تطبيق التفكير التصميمي على هذا المشروع",
  "phase1_empathize": {
    "title": "التعاطف (Empathize)",
    "description": "وصف مرحلة التعاطف",
    "empathyMap": {
      "says": ["ماذا يقول المستفيدون"],
      "thinks": ["ماذا يفكرون"],
      "does": ["ماذا يفعلون"],
      "feels": ["ماذا يشعرون"]
    },
    "researchMethods": [
      { "method": "طريقة البحث", "description": "الوصف", "participants": "المشاركون", "duration": "المدة" }
    ],
    "keyInsights": ["الرؤى الرئيسية المستخلصة"]
  },
  "phase2_define": {
    "title": "التحديد (Define)",
    "description": "وصف مرحلة التحديد",
    "problemStatement": "بيان المشكلة بصيغة: [المستفيد] يحتاج إلى [الحاجة] لأن [السبب]",
    "pointOfView": "وجهة النظر (POV)",
    "howMightWe": ["أسئلة كيف يمكننا (HMW)"]
  },
  "phase3_ideate": {
    "title": "التفكير (Ideate)",
    "description": "وصف مرحلة التفكير",
    "brainstormRules": ["قواعد العصف الذهني"],
    "ideas": [
      { "idea": "الفكرة", "category": "التصنيف", "feasibility": "قابلية التنفيذ", "impact": "التأثير" }
    ],
    "selectedIdea": "الفكرة المختارة للتنفيذ",
    "selectionCriteria": ["معايير الاختيار"]
  },
  "phase4_prototype": {
    "title": "النموذج الأولي (Prototype)",
    "description": "وصف مرحلة النموذج",
    "prototypeType": "نوع النموذج (ورقي، رقمي، تجريبي)",
    "components": [
      { "component": "المكون", "description": "الوصف", "materials": "المواد المطلوبة", "time": "الوقت" }
    ],
    "buildSteps": ["خطوات بناء النموذج"],
    "budget": "التكلفة التقديرية"
  },
  "phase5_test": {
    "title": "الاختبار (Test)",
    "description": "وصف مرحلة الاختبار",
    "testPlan": {
      "objective": "هدف الاختبار",
      "participants": "المشاركون",
      "duration": "المدة",
      "location": "المكان"
    },
    "testScenarios": [
      { "scenario": "السيناريو", "task": "المهمة", "successCriteria": "معايير النجاح" }
    ],
    "feedbackQuestions": ["أسئلة جمع الملاحظات"],
    "iterationPlan": "خطة التكرار والتحسين"
  },
  "timeline": [
    { "phase": "المرحلة", "duration": "المدة", "activities": ["الأنشطة"] }
  ],
  "resources": [
    { "resource": "المورد", "type": "النوع", "quantity": "الكمية" }
  ],
  "successMetrics": [
    { "metric": "المقياس", "target": "الهدف", "measurement": "طريقة القياس" }
  ]
}`;

        const userPrompt = `قم بتحويل الفكرة التالية إلى خطة متكاملة وفق منهجية التفكير التصميمي:

وصف البرنامج: ${idea.programDescription}
الفكرة: ${idea.idea || ''}
الهدف العام: ${idea.generalObjective || ''}
الفئة المستهدفة: ${idea.targetAudience || ''}
المخرجات: ${JSON.stringify(idea.outputs || [])}
النتائج المتوقعة: ${JSON.stringify(idea.expectedResults || [])}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من النموذج");
          }

          const designThinkingData = JSON.parse(content as string);
          return {
            success: true,
            designThinking: designThinkingData,
          };
        } catch (error) {
          console.error("[Ideas] Failed to generate Design Thinking:", error);
          throw new Error("حدث خطأ أثناء توليد محتوى التفكير التصميمي. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * تصدير شامل للفكرة بجميع عناصرها
     */
    exportFullReport: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.id, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const report = {
          metadata: {
            title: idea.programDescription || "تقرير الفكرة",
            generatedAt: new Date().toISOString(),
            generatedBy: ctx.user.name || "مستخدم",
          },
          basicInfo: {
            programDescription: idea.programDescription,
            targetAudience: idea.targetAudience,
            targetCount: idea.targetCount,
            duration: idea.duration,
            createdAt: idea.createdAt,
          },
          visionAndObjectives: {
            vision: idea.vision,
            generalObjective: idea.generalObjective,
            detailedObjectives: idea.detailedObjectives ? JSON.parse(idea.detailedObjectives) : null,
            idea: idea.idea,
            objective: idea.objective,
          },
          justificationsAndFeatures: {
            justifications: idea.justifications,
            features: idea.features,
            strengths: idea.strengths,
          },
          outputsAndResults: {
            outputs: idea.outputs,
            expectedResults: idea.expectedResults,
            risks: idea.risks,
          },
          kpis: idea.kpis ? JSON.parse(idea.kpis) : null,
          logFrame: idea.logFrame ? JSON.parse(idea.logFrame) : null,
          timeline: idea.timeline ? JSON.parse(idea.timeline) : null,
          pmdpro: idea.pmdpro ? JSON.parse(idea.pmdpro) : null,
          designThinking: idea.designThinking ? JSON.parse(idea.designThinking) : null,
          evaluation: idea.evaluation ? JSON.parse(idea.evaluation) : null,
        };

        return { success: true, report };
      }),

    /**
     * اعتماد برنامج
     */
    approve: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { approveIdea } = await import('./db');
        const approved = await approveIdea(input.id, ctx.user.id, ctx.user.id);
        if (!approved) {
          throw new Error("لم يتم العثور على الفكرة أو ليس لديك صلاحية اعتمادها");
        }
        return {
          success: true,
          idea: approved,
        };
      }),

    /**
     * إلغاء اعتماد برنامج
     */
    unapprove: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { unapproveIdea } = await import('./db');
        const unapproved = await unapproveIdea(input.id, ctx.user.id);
        if (!unapproved) {
          throw new Error("لم يتم العثور على الفكرة أو ليس لديك صلاحية إلغاء اعتمادها");
        }
        return {
          success: true,
          idea: unapproved,
        };
      }),

    /**
     * جلب البرامج المعتمدة
     */
    listApproved: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ input, ctx }) => {
        const { getApprovedIdeas, countUserIdeas } = await import('./db');
        const approvedIdeas = await getApprovedIdeas(ctx.user.id, input.limit, input.offset);
        const totalCount = await countUserIdeas(ctx.user.id);

        return {
          ideas: approvedIdeas,
          total: approvedIdeas.length,
          hasMore: input.offset + approvedIdeas.length < totalCount,
        };
      }),
  }),

  // ==================== Conversations Router ====================
  conversations: router({
    /**
     * بدء محادثة جديدة لتطوير فكرة
     */
    start: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // التحقق من وجود الفكرة
        const idea = await getIdeaById(input.ideaId, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        // إنشاء محادثة جديدة
        const conversation = await createConversation({
          userId: ctx.user.id,
          ideaId: input.ideaId,
          title: `محادثة تطوير: ${idea.programDescription.substring(0, 50)}...`,
          status: "active",
        });

        if (!conversation) {
          throw new Error("فشل في إنشاء المحادثة");
        }

        // إضافة رسالة ترحيبية من المساعد
        const welcomeMessage = `مرحباً! أنا مساعدك لتطوير فكرة "البرنامج/${idea.programDescription.substring(0, 30)}...".

يمكنني مساعدتك في:
- تحسين الأهداف والرؤية
- تطوير المخرجات والنتائج
- إضافة أفكار إبداعية جديدة
- تحليل المخاطر والتحديات
- اقتراح شراكات محتملة

ماذا تريد أن نعمل عليه أولاً؟`;

        await addMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: welcomeMessage,
        });

        return {
          success: true,
          conversation,
          welcomeMessage,
        };
      }),

    /**
     * إرسال رسالة والحصول على رد
     */
    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        message: z.string().min(1, "الرسالة لا يمكن أن تكون فارغة"),
      }))
      .mutation(async ({ input, ctx }) => {
        // التحقق من وجود المحادثة
        const conversation = await getConversationById(input.conversationId, ctx.user.id);
        if (!conversation) {
          throw new Error("المحادثة غير موجودة");
        }

        // جلب الفكرة المرتبطة
        const idea = await getIdeaById(conversation.ideaId, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        // حفظ رسالة المستخدم
        await addMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
        });

        // جلب سجل المحادثة للسياق
        const messageHistory = await getConversationMessages(input.conversationId);

        // إعداد System Prompt ذكي
        const systemPrompt = `أنت مساعد ذكي متخصص في تطوير البرامج والمبادرات للمنظمات غير الربحية.
مهمتك هي مساعدة المستخدم في تطوير وتحسين الفكرة التالية:

=== معلومات الفكرة ===
الوصف: ${idea.programDescription}
الرؤية: ${idea.vision || 'غير محددة'}
الهدف العام: ${idea.generalObjective || 'غير محدد'}
الأهداف التفصيلية: ${idea.detailedObjectives || 'غير محددة'}
الفكرة: ${idea.idea}
الهدف: ${idea.objective}
المبررات: ${idea.justifications}
المميزات: ${idea.features}
نقاط القوة: ${idea.strengths}
المخرجات: ${idea.outputs}
النتائج المتوقعة: ${idea.expectedResults}
المخاطر: ${idea.risks || 'غير محددة'}
الفئة المستهدفة: ${idea.targetAudience || 'غير محددة'}
العدد المستهدف: ${idea.targetCount || 'غير محدد'}
المدة الزمنية: ${idea.duration || 'غير محددة'}
===================

إرشادات:
1. أجب باللغة العربية فقط
2. كن محدداً وعملياً في اقتراحاتك
3. استخدم أمثلة واقعية عند الإمكان
4. اقترح تحسينات قابلة للتطبيق
5. إذا طلب المستخدم تعديل قسم معين، قدم النص المحسن بشكل واضح
6. اسأل أسئلة توضيحية عند الحاجة`;

        // تحويل سجل الرسائل لصيغة LLM
        const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: systemPrompt },
          ...messageHistory.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ];

        try {
          const response = await invokeLLM({
            messages: llmMessages,
          });

          const assistantMessage = response.choices[0]?.message?.content;
          if (!assistantMessage || typeof assistantMessage !== 'string') {
            throw new Error("لم يتم الحصول على رد");
          }

          // حفظ رد المساعد
          await addMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: assistantMessage,
          });

          return {
            success: true,
            message: assistantMessage,
          };
        } catch (error) {
          console.error("[Conversations] Failed to get AI response:", error);
          throw new Error("حدث خطأ أثناء الحصول على الرد. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * جلب سجل المحادثة
     */
    getMessages: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        // التحقق من وجود المحادثة
        const conversation = await getConversationById(input.conversationId, ctx.user.id);
        if (!conversation) {
          throw new Error("المحادثة غير موجودة");
        }

        const messages = await getConversationMessages(input.conversationId);
        return {
          conversation,
          messages,
        };
      }),

    /**
     * جلب محادثات فكرة معينة
     */
    listByIdea: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        const conversations = await getIdeaConversations(input.ideaId, ctx.user.id);
        return conversations;
      }),

    /**
     * الحصول على اقتراحات أسئلة
     */
    getSuggestions: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        const idea = await getIdeaById(input.ideaId, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        // اقتراحات أسئلة بناءً على حالة الفكرة
        const suggestions = [
          "كيف يمكن تحسين الأهداف لتكون أكثر قابلية للقياس؟",
          "ما هي الشراكات المحتملة لهذا البرنامج؟",
          "اقترح أنشطة إبداعية إضافية",
          "كيف يمكن توسيع نطاق البرنامج؟",
          "ما هي مصادر التمويل المقترحة؟",
          "كيف يمكن قياس الأثر الاجتماعي؟",
        ];

        return suggestions;
      }),
  }),

  //  // ==================== Marketing Content Router ====================
  marketing: router({
    /**
     * توليد محتوى تسويقي للفكرة
     */
    generateContent: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // جلب الفكرة
        const idea = await getIdeaById(input.ideaId, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        const systemPrompt = `أنت خبير في التسويق الرقمي والمحتوى للمنظمات غير الربحية.
مهمتك هي إنشاء محتوى تسويقي احترافي وجذاب للبرنامج أو المبادرة المقدمة.

يجب أن يكون المحتوى:
- ملهماً ومحفزاً للمشاركة والدعم
- مناسباً لكل منصة من منصات التواصل الاجتماعي
- يبرز القيمة والأثر الاجتماعي
- يستخدم لغة عربية فصيحة وسلسة

يجب أن يكون ردك بصيغة JSON فقط.`;

        const userPrompt = `البرنامج: ${idea.programDescription}
${idea.vision ? `الرؤية: ${idea.vision}` : ''}
${idea.generalObjective ? `الهدف العام: ${idea.generalObjective}` : ''}
${idea.targetAudience ? `الفئة المستهدفة: ${idea.targetAudience}` : ''}
${idea.features ? `المميزات: ${idea.features}` : ''}
${idea.expectedResults ? `النتائج المتوقعة: ${idea.expectedResults}` : ''}

أنشئ محتوى تسويقي شامل لهذا البرنامج.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "marketing_content",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    socialMedia: {
                      type: "object",
                      properties: {
                        twitter: {
                          type: "array",
                          items: { type: "string" },
                          description: "3 تغريدات مختلفة (كل واحدة أقل من 280 حرف)"
                        },
                        facebook: {
                          type: "array",
                          items: { type: "string" },
                          description: "2 منشور فيسبوك (متوسط الطول)"
                        },
                        linkedin: {
                          type: "array",
                          items: { type: "string" },
                          description: "2 منشور لينكدإن احترافي"
                        },
                        instagram: {
                          type: "array",
                          items: { type: "string" },
                          description: "2 وصف لمنشور إنستغرام مع إيموجي"
                        }
                      },
                      required: ["twitter", "facebook", "linkedin", "instagram"],
                      additionalProperties: false
                    },
                    emails: {
                      type: "object",
                      properties: {
                        donors: {
                          type: "object",
                          properties: {
                            subject: { type: "string", description: "عنوان البريد" },
                            body: { type: "string", description: "نص البريد" }
                          },
                          required: ["subject", "body"],
                          additionalProperties: false
                        },
                        volunteers: {
                          type: "object",
                          properties: {
                            subject: { type: "string", description: "عنوان البريد" },
                            body: { type: "string", description: "نص البريد" }
                          },
                          required: ["subject", "body"],
                          additionalProperties: false
                        },
                        partners: {
                          type: "object",
                          properties: {
                            subject: { type: "string", description: "عنوان البريد" },
                            body: { type: "string", description: "نص البريد" }
                          },
                          required: ["subject", "body"],
                          additionalProperties: false
                        }
                      },
                      required: ["donors", "volunteers", "partners"],
                      additionalProperties: false
                    },
                    adCopy: {
                      type: "object",
                      properties: {
                        short: {
                          type: "array",
                          items: { type: "string" },
                          description: "3 نصوص إعلانية قصيرة (سطر واحد)"
                        },
                        medium: {
                          type: "array",
                          items: { type: "string" },
                          description: "2 نص إعلاني متوسط (2-3 أسطر)"
                        },
                        long: {
                          type: "string",
                          description: "نص إعلاني طويل (فقرة كاملة)"
                        }
                      },
                      required: ["short", "medium", "long"],
                      additionalProperties: false
                    },
                    hashtags: {
                      type: "array",
                      items: { type: "string" },
                      description: "10-15 هاشتاق مقترح"
                    },
                    keyMessages: {
                      type: "array",
                      items: { type: "string" },
                      description: "5-7 رسائل رئيسية للتسويق"
                    },
                    callToAction: {
                      type: "array",
                      items: { type: "string" },
                      description: "5 عبارات تحفيزية للعمل"
                    },
                    slogans: {
                      type: "array",
                      items: { type: "string" },
                      description: "5 شعارات قصيرة وجذابة"
                    }
                  },
                  required: ["socialMedia", "emails", "adCopy", "hashtags", "keyMessages", "callToAction", "slogans"],
                  additionalProperties: false
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const marketingContent = extractJSON(content);

          return {
            success: true,
            content: marketingContent,
            ideaId: input.ideaId,
            programName: idea.programDescription.substring(0, 50),
          };
        } catch (error) {
          console.error("[Marketing] Failed to generate content:", error);
          throw new Error("حدث خطأ أثناء توليد المحتوى التسويقي. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * توليد محتوى تسويقي للجهات المانحة
     */
    generateDonorContent: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const idea = await getIdeaById(input.ideaId, ctx.user.id);
          if (!idea) {
            throw new Error("لم يتم العثور على الفكرة");
          }

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `أنت خبير في كتابة مقترحات التمويل للمنظمات غير الربحية. قم بإنشاء محتوى تسويقي احترافي ومقنع للجهات المانحة والداعمة باللغة العربية.`
              },
              {
                role: "user",
                content: `قم بإنشاء محتوى تسويقي شامل للجهات المانحة للبرنامج التالي:

البرنامج: ${idea.programDescription}
الرؤية: ${idea.vision || 'غير محددة'}
الهدف العام: ${idea.generalObjective || 'غير محدد'}
الفئة المستهدفة: ${idea.targetAudience || 'غير محددة'}
المميزات: ${idea.features || 'غير محددة'}
النتائج المتوقعة: ${idea.expectedResults || 'غير محددة'}`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "donor_marketing_content",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    summary: {
                      type: "string",
                      description: "ملخص تنفيذي احترافي للبرنامج (3-4 فقرات)"
                    },
                    impact: {
                      type: "string",
                      description: "وصف الأثر المتوقع والنتائج (2-3 فقرات)"
                    },
                    shortTermResults: {
                      type: "array",
                      items: { type: "string" },
                      description: "4-5 نتائج قصيرة المدى"
                    },
                    longTermResults: {
                      type: "array",
                      items: { type: "string" },
                      description: "4-5 نتائج طويلة المدى"
                    },
                    budget: {
                      type: "string",
                      description: "وصف الميزانية والتمويل المطلوب"
                    },
                    budgetBreakdown: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: { type: "string" },
                          percentage: { type: "number" }
                        },
                        required: ["category", "percentage"],
                        additionalProperties: false
                      },
                      description: "4 فئات لتوزيع الميزانية"
                    },
                    totalBudget: {
                      type: "string",
                      description: "إجمالي الميزانية المطلوبة (رقم فقط)"
                    },
                    partnerships: {
                      type: "string",
                      description: "وصف فرص الشراكة"
                    },
                    partnershipBenefits: {
                      type: "array",
                      items: { type: "string" },
                      description: "4-6 مزايا للشركاء"
                    },
                    timelinePhases: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          phase: { type: "string" },
                          duration: { type: "string" },
                          activities: { type: "string" }
                        },
                        required: ["phase", "duration", "activities"],
                        additionalProperties: false
                      },
                      description: "3-4 مراحل للتنفيذ"
                    },
                    stats: {
                      type: "object",
                      properties: {
                        objectives: { type: "number" },
                        beneficiaries: { type: "string" },
                        budget: { type: "string" },
                        duration: { type: "string" }
                      },
                      required: ["objectives", "beneficiaries", "budget", "duration"],
                      additionalProperties: false
                    }
                  },
                  required: ["summary", "impact", "shortTermResults", "longTermResults", "budget", "budgetBreakdown", "totalBudget", "partnerships", "partnershipBenefits", "timelinePhases", "stats"],
                  additionalProperties: false
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const donorContent = extractJSON(content);

          return {
            success: true,
            content: donorContent,
            ideaId: input.ideaId,
            programName: idea.programDescription.substring(0, 50),
          };
        } catch (error) {
          console.error("[Marketing] Failed to generate donor content:", error);
          throw new Error("حدث خطأ أثناء توليد المحتوى للممولين. يرجى المحاولة مرة أخرى.");
        }
      }),

    /**
     * مولد القيمة المضافة - تحليل ما يميز البرنامج عن غيره
     */
    generateValueAdd: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // جلب الفكرة
        const idea = await getIdeaById(input.ideaId, ctx.user.id);
        if (!idea) {
          throw new Error("الفكرة غير موجودة");
        }

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `أنت خبير استراتيجي في تحليل القيمة المضافة والميزة التنافسية للمنظمات غير الربحية.
مهمتك هي تحليل البرنامج المقدم واكتشاف:
1. نقاط التميز الفريدة - ما الذي يجعل هذا البرنامج مختلفاً؟
2. الميزة التنافسية - كيف يتفوق على البرامج المشابهة؟
3. فجوات السوق - ما الفرص غير المستغلة؟
4. نقاط البيع الفريدة (USPs) - رسائل تسويقية قوية
5. عوامل الجذب للممولين - لماذا يختارونك؟
6. توصيات التحسين - كيف تزيد قيمتك المضافة؟

كن مبدعاً وعميقاً في التحليل. استخدم لغة عربية فصيحة وملهمة.
يجب أن يكون ردك بصيغة JSON فقط.`
              },
              {
                role: "user",
                content: `حلل القيمة المضافة لهذا البرنامج:

اسم البرنامج: ${idea.programDescription}
الرؤية: ${idea.vision || 'غير محددة'}
الهدف العام: ${idea.generalObjective || 'غير محدد'}
الفئة المستهدفة: ${idea.targetAudience || 'غير محددة'}
المميزات: ${idea.features || 'غير محددة'}
النتائج المتوقعة: ${idea.expectedResults || 'غير محددة'}`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "value_add_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    uniqueStrengths: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string", description: "عنوان نقطة التميز" },
                          description: { type: "string", description: "شرح تفصيلي" },
                          icon: { type: "string", description: "رمز مناسب (star, trophy, target, heart, shield, rocket)" }
                        },
                        required: ["title", "description", "icon"],
                        additionalProperties: false
                      },
                      description: "4-6 نقاط تميز فريدة"
                    },
                    competitiveAdvantages: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          advantage: { type: "string", description: "الميزة التنافسية" },
                          comparison: { type: "string", description: "مقارنة مع البرامج الأخرى" },
                          score: { type: "number", description: "درجة التفوق من 1-10" }
                        },
                        required: ["advantage", "comparison", "score"],
                        additionalProperties: false
                      },
                      description: "4-5 مزايا تنافسية"
                    },
                    marketGaps: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          gap: { type: "string", description: "الفجوة في السوق" },
                          opportunity: { type: "string", description: "الفرصة المتاحة" },
                          potential: { type: "string", description: "الإمكانية (عالية/متوسطة/منخفضة)" }
                        },
                        required: ["gap", "opportunity", "potential"],
                        additionalProperties: false
                      },
                      description: "3-4 فجوات سوقية"
                    },
                    uniqueSellingPoints: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          usp: { type: "string", description: "نقطة البيع الفريدة" },
                          marketingMessage: { type: "string", description: "رسالة تسويقية قوية" },
                          targetAudience: { type: "string", description: "الجمهور المستهدف" }
                        },
                        required: ["usp", "marketingMessage", "targetAudience"],
                        additionalProperties: false
                      },
                      description: "4-5 نقاط بيع فريدة"
                    },
                    donorAttractionFactors: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          factor: { type: "string", description: "عامل الجذب" },
                          reason: { type: "string", description: "لماذا يجذب الممولين" },
                          donorType: { type: "string", description: "نوع الممول المناسب" }
                        },
                        required: ["factor", "reason", "donorType"],
                        additionalProperties: false
                      },
                      description: "4-5 عوامل جذب"
                    },
                    improvementRecommendations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          recommendation: { type: "string", description: "التوصية" },
                          impact: { type: "string", description: "الأثر المتوقع" },
                          priority: { type: "string", description: "الأولوية (عالية/متوسطة/منخفضة)" },
                          timeframe: { type: "string", description: "الإطار الزمني" }
                        },
                        required: ["recommendation", "impact", "priority", "timeframe"],
                        additionalProperties: false
                      },
                      description: "5-6 توصيات للتحسين"
                    },
                    overallScore: {
                      type: "object",
                      properties: {
                        uniqueness: { type: "number", description: "درجة التفرد من 1-100" },
                        marketFit: { type: "number", description: "درجة ملاءمة السوق من 1-100" },
                        donorAppeal: { type: "number", description: "درجة جاذبية الممولين من 1-100" },
                        scalability: { type: "number", description: "درجة قابلية التوسع من 1-100" },
                        overall: { type: "number", description: "الدرجة الإجمالية من 1-100" }
                      },
                      required: ["uniqueness", "marketFit", "donorAppeal", "scalability", "overall"],
                      additionalProperties: false
                    },
                    executiveSummary: {
                      type: "string",
                      description: "ملخص تنفيذي للقيمة المضافة (3-4 فقرات)"
                    },
                    tagline: {
                      type: "string",
                      description: "شعار تسويقي قوي للبرنامج"
                    }
                  },
                  required: ["uniqueStrengths", "competitiveAdvantages", "marketGaps", "uniqueSellingPoints", "donorAttractionFactors", "improvementRecommendations", "overallScore", "executiveSummary", "tagline"],
                  additionalProperties: false
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const valueAddAnalysis = extractJSON(content);

          return {
            success: true,
            analysis: valueAddAnalysis,
            ideaId: input.ideaId,
            programName: idea.programDescription.substring(0, 50),
          };
        } catch (error) {
          console.error("[Marketing] Failed to generate value-add analysis:", error);
          throw new Error("حدث خطأ أثناء تحليل القيمة المضافة. يرجى المحاولة مرة أخرى.");
        }
      }),
  }),

  // ==================== Organization Router ====================
  organization: router({
    /**
     * جلب معلومات المؤسسة
     */
    getInfo: protectedProcedure
      .query(async ({ ctx }) => {
        const { getOrganizationInfo } = await import('./db');
        const info = await getOrganizationInfo(ctx.user.id);
        return info || { logo: null, name: null };
      }),

    /**
     * تحديث اسم المؤسسة
     */
    updateName: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "اسم المؤسسة مطلوب").max(255),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateOrganizationName } = await import('./db');
        const success = await updateOrganizationName(ctx.user.id, input.name);
        if (!success) {
          throw new Error("فشل تحديث اسم المؤسسة");
        }
        return { success: true };
      }),

    /**
     * رفع شعار المؤسسة
     */
    uploadLogo: protectedProcedure
      .input(z.object({
        logoBase64: z.string().min(1, "الشعار مطلوب"),
        mimeType: z.string().default("image/png"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        const { updateOrganizationLogo } = await import('./db');

        // تحويل base64 إلى Buffer
        const base64Data = input.logoBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // إنشاء اسم ملف فريد
        const extension = input.mimeType.split('/')[1] || 'png';
        const fileName = `logos/user-${ctx.user.id}-${Date.now()}.${extension}`;

        // رفع الشعار إلى S3
        const { url } = await storagePut(fileName, buffer, input.mimeType);

        // تحديث رابط الشعار في قاعدة البيانات
        const success = await updateOrganizationLogo(ctx.user.id, url);
        if (!success) {
          throw new Error("فشل تحديث الشعار");
        }

        return { success: true, logoUrl: url };
      }),

    /**
     * حذف شعار المؤسسة
     */
    deleteLogo: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { updateOrganizationLogo } = await import('./db');
        const success = await updateOrganizationLogo(ctx.user.id, null);
        if (!success) {
          throw new Error("فشل حذف الشعار");
        }
        return { success: true };
      }),
  }),

  // ==================== Evaluation Router ====================
  evaluation: router({
    /**
     * تقييم البرنامج باستخدام الذكاء الاصطناعي
     */
    evaluateProgram: protectedProcedure
      .input(z.object({
        programName: z.string().min(1, "اسم البرنامج مطلوب"),
        programDescription: z.string().min(10, "وصف البرنامج مطلوب"),
        objectives: z.string().optional(),
        targetBeneficiaries: z.string().optional(),
        outcomes: z.string().optional(),
        challenges: z.string().optional(),
        methodology: z.enum(['logframe', 'theory-of-change', 'results-based', 'participatory']),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { programName, programDescription, objectives, targetBeneficiaries, outcomes, challenges, methodology } = input;

          // تحديد الـ prompt بناءً على المنهجية المختارة
          let methodologyPrompt = '';
          switch (methodology) {
            case 'logframe':
              methodologyPrompt = `استخدم منهجية الإطار المنطقي (Logical Framework) لتقييم البرنامج. قدم تحليلاً شاملاً يتضمن:
- الهدف العام والأهداف الفرعية
- المخرجات المتوقعة
- الأنشطة الرئيسية
- المؤشرات القابلة للقياس
- وسائل التحقق
- الافتراضات والمخاطر`;
              break;
            case 'theory-of-change':
              methodologyPrompt = `استخدم منهجية نظرية التغيير (Theory of Change) لتقييم البرنامج. قدم تحليلاً يتضمن:
- المشكلة الأساسية والسياق
- الأنشطة والمدخلات
- المخرجات المباشرة
- النتائج قصيرة الأجل
- النتائج طويلة الأجل
- التأثير النهائي
- الافتراضات الحرجة`;
              break;
            case 'results-based':
              methodologyPrompt = `استخدم منهجية الإدارة القائمة على النتائج (Results-Based Management) لتقييم البرنامج. قدم تحليلاً يتضمن:
- النتائج المتوقعة
- المؤشرات الرئيسية
- خطوط الأساس والأهداف
- طرق القياس
- جدول التقييم
- المسؤوليات والموارد`;
              break;
            case 'participatory':
              methodologyPrompt = `استخدم منهجية التقييم التشاركي (Participatory Evaluation) لتقييم البرنامج. قدم تحليلاً يتضمن:
- أصحاب المصلحة الرئيسيين
- آليات المشاركة
- الأسئلة التقييمية المشتركة
- طرق جمع البيانات التشاركية
- الدروس المستفادة
- التحسينات المقترحة`;
              break;
          }

          const systemPrompt = `أنت خبير في تقييم البرامج والمبادرات الاجتماعية. قدم تقييماً شاملاً واحترافياً للبرنامج المقدم.
${methodologyPrompt}

قدم التقرير بصيغة منظمة وسهلة الفهم، مع التركيز على:
1. تحليل نقاط القوة
2. تحديد نقاط الضعف
3. الفرص المتاحة
4. التهديدات المحتملة
5. التوصيات المحددة للتحسين
6. مؤشرات النجاح المقترحة`;

          const userPrompt = `البرنامج: ${programName}

الوصف: ${programDescription}

${objectives ? `الأهداف: ${objectives}` : ''}
${targetBeneficiaries ? `الفئة المستهدفة: ${targetBeneficiaries}` : ''}
${outcomes ? `النتائج المتوقعة: ${outcomes}` : ''}
${challenges ? `التحديات: ${challenges}` : ''}

يرجى تقديم تقرير تقييم شامل وفقاً للمنهجية المحددة.`;

          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "program_evaluation",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    executiveSummary: { type: "string", description: "ملخص تنفيذي" },
                    strengths: { type: "string", description: "نقاط القوة" },
                    weaknesses: { type: "string", description: "نقاط الضعف" },
                    opportunities: { type: "string", description: "الفرص" },
                    threats: { type: "string", description: "التهديدات" },
                    recommendations: { type: "string", description: "التوصيات" },
                    successIndicators: { type: "string", description: "مؤشرات النجاح" },
                    qualityScore: { type: "number", description: "درجة الجودة من 1-10" },
                  },
                  required: ["executiveSummary", "strengths", "weaknesses", "opportunities", "threats", "recommendations", "successIndicators", "qualityScore"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          const evaluationReport = extractJSON(content);

          return {
            success: true,
            report: evaluationReport,
            methodology: methodology,
          };
        } catch (error) {
          console.error("[Evaluation] Failed to evaluate program:", error);
          throw new Error("حدث خطأ أثناء تقييم البرنامج. يرجى المحاولة مرة أخرى.");
        }
      }),
  }),

  // ==================== Project Dashboard API ====================
  dashboard: router({
    // جلب أو إنشاء تتبع المشروع
    getTracking: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .query(async ({ ctx, input }) => {
        const tracking = await getOrCreateProjectTracking(input.ideaId, ctx.user.id);
        if (!tracking) throw new Error("فشل في جلب بيانات التتبع");
        return tracking;
      }),

    // تحديث تتبع المشروع
    updateTracking: protectedProcedure
      .input(z.object({
        trackingId: z.number(),
        status: z.enum(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional(),
        overallProgress: z.number().min(0).max(100).optional(),
        actualStartDate: z.date().optional().nullable(),
        expectedEndDate: z.date().optional().nullable(),
        actualEndDate: z.date().optional().nullable(),
        notes: z.string().optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { trackingId, ...updates } = input;
        const tracking = await updateProjectTracking(trackingId, ctx.user.id, updates);
        if (!tracking) throw new Error("فشل في تحديث بيانات التتبع");
        return tracking;
      }),

    // جلب جميع بيانات اللوحة
    getFullDashboard: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .query(async ({ ctx, input }) => {
        const tracking = await getOrCreateProjectTracking(input.ideaId, ctx.user.id);
        if (!tracking) throw new Error("فشل في جلب بيانات التتبع");

        const [tasks, budgetItems, kpis, risks] = await Promise.all([
          getProjectTasks(tracking.id),
          getBudgetItems(tracking.id),
          getKpiItems(tracking.id),
          getRiskItems(tracking.id),
        ]);

        return {
          tracking,
          tasks,
          budgetItems,
          kpis,
          risks,
        };
      }),

    // ==================== Tasks ====================
    createTask: protectedProcedure
      .input(z.object({
        trackingId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        assignee: z.string().optional(),
        dueDate: z.date().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const task = await createProjectTask({
          projectTrackingId: input.trackingId,
          title: input.title,
          description: input.description,
          priority: input.priority || 'medium',
          assignee: input.assignee,
          dueDate: input.dueDate,
        });
        if (!task) throw new Error("فشل في إنشاء المهمة");
        return task;
      }),

    updateTask: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        assignee: z.string().optional().nullable(),
        dueDate: z.date().optional().nullable(),
        completedAt: z.date().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { taskId, ...updates } = input;
        const task = await updateProjectTask(taskId, updates);
        if (!task) throw new Error("فشل في تحديث المهمة");
        return task;
      }),

    deleteTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await deleteProjectTask(input.taskId);
        if (!success) throw new Error("فشل في حذف المهمة");
        return { success: true };
      }),

    // ==================== Budget ====================
    createBudgetItem: protectedProcedure
      .input(z.object({
        trackingId: z.number(),
        category: z.string().min(1),
        description: z.string().optional(),
        plannedAmount: z.number().min(0),
        actualAmount: z.number().min(0).optional(),
        spentDate: z.date().optional().nullable(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const item = await createBudgetItem({
          projectTrackingId: input.trackingId,
          category: input.category,
          description: input.description,
          plannedAmount: input.plannedAmount,
          actualAmount: input.actualAmount || 0,
          spentDate: input.spentDate,
          notes: input.notes,
        });
        if (!item) throw new Error("فشل في إنشاء بند الميزانية");
        return item;
      }),

    updateBudgetItem: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        category: z.string().optional(),
        description: z.string().optional().nullable(),
        plannedAmount: z.number().min(0).optional(),
        actualAmount: z.number().min(0).optional(),
        spentDate: z.date().optional().nullable(),
        notes: z.string().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { itemId, ...updates } = input;
        const item = await updateBudgetItem(itemId, updates);
        if (!item) throw new Error("فشل في تحديث بند الميزانية");
        return item;
      }),

    deleteBudgetItem: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await deleteBudgetItem(input.itemId);
        if (!success) throw new Error("فشل في حذف بند الميزانية");
        return { success: true };
      }),

    // ==================== KPIs ====================
    createKpi: protectedProcedure
      .input(z.object({
        trackingId: z.number(),
        kpiName: z.string().min(1),
        targetValue: z.string().min(1),
        actualValue: z.string().optional(),
        unit: z.string().optional(),
        measurementDate: z.date().optional().nullable(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const item = await createKpiItem({
          projectTrackingId: input.trackingId,
          kpiName: input.kpiName,
          targetValue: input.targetValue,
          actualValue: input.actualValue,
          unit: input.unit,
          measurementDate: input.measurementDate,
          notes: input.notes,
        });
        if (!item) throw new Error("فشل في إنشاء المؤشر");
        return item;
      }),

    updateKpi: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        kpiName: z.string().optional(),
        targetValue: z.string().optional(),
        actualValue: z.string().optional().nullable(),
        unit: z.string().optional().nullable(),
        measurementDate: z.date().optional().nullable(),
        notes: z.string().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { itemId, ...updates } = input;
        const item = await updateKpiItem(itemId, updates);
        if (!item) throw new Error("فشل في تحديث المؤشر");
        return item;
      }),

    deleteKpi: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await deleteKpiItem(input.itemId);
        if (!success) throw new Error("فشل في حذف المؤشر");
        return { success: true };
      }),

    // ==================== Risks ====================
    createRisk: protectedProcedure
      .input(z.object({
        trackingId: z.number(),
        riskDescription: z.string().min(1),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        likelihood: z.enum(['low', 'medium', 'high']).optional(),
        mitigationStrategy: z.string().optional(),
        owner: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const item = await createRiskItem({
          projectTrackingId: input.trackingId,
          riskDescription: input.riskDescription,
          severity: input.severity || 'medium',
          likelihood: input.likelihood || 'medium',
          mitigationStrategy: input.mitigationStrategy,
          owner: input.owner,
        });
        if (!item) throw new Error("فشل في إنشاء الخطر");
        return item;
      }),

    updateRisk: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        riskDescription: z.string().optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        likelihood: z.enum(['low', 'medium', 'high']).optional(),
        status: z.enum(['identified', 'mitigated', 'occurred', 'closed']).optional(),
        mitigationStrategy: z.string().optional().nullable(),
        owner: z.string().optional().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { itemId, ...updates } = input;
        const item = await updateRiskItem(itemId, updates);
        if (!item) throw new Error("فشل في تحديث الخطر");
        return item;
      }),

    deleteRisk: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await deleteRiskItem(input.itemId);
        if (!success) throw new Error("فشل في حذف الخطر");
        return { success: true };
      }),
  }),

  sustainability: router({
    getAnalysis: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .query(async ({ input }) => {
        const { getSustainabilityAnalysis } = await import('./dbSustainability');
        return await getSustainabilityAnalysis(input.ideaId);
      }),

    generateAnalysis: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { getSustainabilityAnalysis, createSustainabilityAnalysis } = await import('./dbSustainability');
        const { getIdeaById } = await import('./db');
        
        // التحقق من وجود تحليل سابق
        const existing = await getSustainabilityAnalysis(input.ideaId);
        if (existing) {
          return existing;
        }
        
        // الحصول على بيانات الفكرة
        const idea = await getIdeaById(input.ideaId, ctx.user!.id);
        if (!idea) throw new Error("الفكرة غير موجودة");
        
        // توليد التحليل باستخدام الذكاء الاصطناعي
        const prompt = `بصفتك خبير استدامة مالية متخصص في المشاريع والبرامج غير الربحية، قم بتحليل الاستدامة المالية للمشروع التالي وقدم أفكاراً واقعية وعملية لضمان استمراريته:

وصف المشروع: ${idea.programDescription}
الرؤية: ${idea.vision || 'غير محدد'}
الأهداف: ${idea.objective || 'غير محدد'}
الفئة المستهدفة: ${idea.targetAudience || 'غير محدد'}
مدة التنفيذ: ${idea.duration || 'غير محدد'}

قدم تحليلاً مالياً شاملاً بصيغة JSON التالية:
{
  "overallScore": رقم من 0 إلى 100 (درجة الاستدامة المالية الإجمالية),
  
  "indicators": [
    {"name": "تنويع مصادر التمويل", "score": 0-100, "description": "تقييم قدرة المشروع على تنويع مصادر دخله"},
    {"name": "الاكتفاء الذاتي", "score": 0-100, "description": "نسبة الدخل الذاتي من إجمالي التمويل"},
    {"name": "الشراكات الاستراتيجية", "score": 0-100, "description": "إمكانية بناء شراكات مستدامة"},
    {"name": "كفاءة التكاليف", "score": 0-100, "description": "تقييم فعالية استخدام الموارد"},
    {"name": "القابلية للتوسع", "score": 0-100, "description": "إمكانية توسيع المشروع مالياً"}
  ],
  
  "fundingSources": [
    {
      "type": "نوع المصدر (منح/تبرعات/دخل ذاتي/شراكات)",
      "description": "وصف المصدر بشكل واقعي",
      "potentialAmount": "المبلغ المتوقع بالريال",
      "probability": "high/medium/low",
      "timeline": "الإطار الزمني للحصول عليه",
      "requirements": "المتطلبات للحصول على هذا التمويل"
    }
  ],
  
  "recommendations": [
    {
      "priority": "high/medium/low",
      "title": "عنوان التوصية المالية",
      "description": "وصل تفصيلي وعملي للتوصية",
      "expectedImpact": "الأثر المالي المتوقع",
      "implementationCost": "تكلفة التنفيذ إن وجدت"
    }
  ],
  
  "longTermPlan": {
    "year1": {
      "focus": "التركيز الرئيسي",
      "fundingStrategy": "استراتيجية التمويل",
      "expectedRevenue": "الإيرادات المتوقعة",
      "expectedExpenses": "المصروفات المتوقعة",
      "breakEvenPoint": "نقطة التعادل"
    },
    "year2": {
      "focus": "التركيز الرئيسي",
      "fundingStrategy": "استراتيجية التمويل",
      "expectedRevenue": "الإيرادات المتوقعة",
      "expectedExpenses": "المصروفات المتوقعة",
      "sustainabilityMilestone": "معلم الاستدامة"
    },
    "year3": {
      "focus": "التركيز الرئيسي",
      "fundingStrategy": "استراتيجية التمويل",
      "expectedRevenue": "الإيرادات المتوقعة",
      "expectedExpenses": "المصروفات المتوقعة",
      "selfSufficiencyRate": "نسبة الاكتفاء الذاتي"
    }
  },
  
  "risks": [
    {
      "severity": "high/medium/low",
      "title": "عنوان المخاطرة المالية",
      "description": "وصف المخاطرة",
      "financialImpact": "الأثر المالي المتوقع",
      "mitigation": "استراتيجية التخفيف العملية",
      "contingencyPlan": "الخطة البديلة"
    }
  ]
}

ملاحظات مهمة:
- ركز على الاستدامة المالية الواقعية والعملية
- قدم أرقاماً ومبالغ مالية واقعية بالريال السعودي
- اقترح مصادر تمويل متنوعة ومحددة (جهات حكومية، مؤسسات، قطاع خاص)
- اقترح نماذج دخل ذاتي مبتكرة ومناسبة لطبيعة المشروع
- ضع خطة مالية واقعية للوصول للاستدامة في 3 سنوات
- كن محدداً وعملياً في التوصيات والاستراتيجيات`;
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'أنت خبير استدامة مالية متخصص في المشاريع والبرامج غير الربحية. لديك خبرة واسعة في تطوير استراتيجيات التمويل وبناء نماذج الاستدامة المالية. قدم تحليلاً عملياً وواقعياً مع أرقام ومبالغ محددة. يجب أن ترد بصيغة JSON فقط بدون أي نص إضافي.' },
            { role: 'user', content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "sustainability_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  overallScore: { type: "number", description: "درجة الاستدامة الإجمالية من 0 إلى 100" },
                  indicators: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        score: { type: "number" },
                        description: { type: "string" }
                      },
                      required: ["name", "score", "description"],
                      additionalProperties: false
                    }
                  },
                  fundingSources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        description: { type: "string" },
                        potentialAmount: { type: "string" },
                        probability: { type: "string" },
                        timeline: { type: "string" },
                        requirements: { type: "string" }
                      },
                      required: ["type", "description", "potentialAmount", "probability", "timeline", "requirements"],
                      additionalProperties: false
                    }
                  },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        priority: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        expectedImpact: { type: "string" },
                        implementationCost: { type: "string" }
                      },
                      required: ["priority", "title", "description", "expectedImpact", "implementationCost"],
                      additionalProperties: false
                    }
                  },
                  longTermPlan: {
                    type: "object",
                    properties: {
                      year1: {
                        type: "object",
                        properties: {
                          focus: { type: "string" },
                          fundingStrategy: { type: "string" },
                          expectedRevenue: { type: "string" },
                          expectedExpenses: { type: "string" },
                          breakEvenPoint: { type: "string" }
                        },
                        required: ["focus", "fundingStrategy", "expectedRevenue", "expectedExpenses", "breakEvenPoint"],
                        additionalProperties: false
                      },
                      year2: {
                        type: "object",
                        properties: {
                          focus: { type: "string" },
                          fundingStrategy: { type: "string" },
                          expectedRevenue: { type: "string" },
                          expectedExpenses: { type: "string" },
                          sustainabilityMilestone: { type: "string" }
                        },
                        required: ["focus", "fundingStrategy", "expectedRevenue", "expectedExpenses", "sustainabilityMilestone"],
                        additionalProperties: false
                      },
                      year3: {
                        type: "object",
                        properties: {
                          focus: { type: "string" },
                          fundingStrategy: { type: "string" },
                          expectedRevenue: { type: "string" },
                          expectedExpenses: { type: "string" },
                          selfSufficiencyRate: { type: "string" }
                        },
                        required: ["focus", "fundingStrategy", "expectedRevenue", "expectedExpenses", "selfSufficiencyRate"],
                        additionalProperties: false
                      }
                    },
                    required: ["year1", "year2", "year3"],
                    additionalProperties: false
                  },
                  risks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        severity: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        financialImpact: { type: "string" },
                        mitigation: { type: "string" },
                        contingencyPlan: { type: "string" }
                      },
                      required: ["severity", "title", "description", "financialImpact", "mitigation", "contingencyPlan"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["overallScore", "indicators", "fundingSources", "recommendations", "longTermPlan", "risks"],
                additionalProperties: false
              }
            }
          }
        });
        
        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: "لم يتم الحصول على استجابة صحيحة من الذكاء الاصطناعي"
          });
        }
        
        // تنظيف المحتوى من أي markdown code blocks أو نصوص إضافية
        let cleanedContent = content.trim();
        // إزالة جميع أنواع code blocks
        cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
        // إزالة أي نص قبل أول { وبعد آخر }
        const firstBrace = cleanedContent.indexOf('{');
        const lastBrace = cleanedContent.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
        }
        
        let analysisData;
        try {
          analysisData = JSON.parse(cleanedContent);
        } catch (e) {
          console.error('فشل في تحليل JSON:', e);
          console.error('المحتوى الأصلي:', content.substring(0, 300));
          console.error('المحتوى المنظف:', cleanedContent.substring(0, 300));
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: "حدث خطأ أثناء تحليل الاستجابة. يرجى المحاولة مرة أخرى."
          });
        }
        
        // حفظ التحليل في قاعدة البيانات
        const analysis = await createSustainabilityAnalysis({
          ideaId: input.ideaId,
          overallScore: analysisData.overallScore || 0,
          indicators: analysisData.indicators || [],
          fundingSources: analysisData.fundingSources || [],
          recommendations: analysisData.recommendations || [],
          longTermPlan: analysisData.longTermPlan || {},
          risks: analysisData.risks || []
        });
        
        return analysis;
      }),
  }),

  // تخصيص لوحة المتابعة
  layout: router({
    // الحصول على تخصيص لوحة المتابعة
    getLayout: protectedProcedure
      .query(async ({ ctx }) => {
        const layout = await getDashboardLayout(ctx.user.id);
        
        // إذا لم يكن هناك تخصيص، نرجع الترتيب الافتراضي
        if (!layout) {
          return {
            tabsOrder: ['tasks', 'budget', 'kpis', 'risks']
          };
        }
        
        return {
          tabsOrder: JSON.parse(layout.tabsOrder)
        };
      }),
    
    // حفظ تخصيص لوحة المتابعة
    saveLayout: protectedProcedure
      .input(z.object({
        tabsOrder: z.array(z.string())
      }))
      .mutation(async ({ input, ctx }) => {
        const layout = await saveDashboardLayout(ctx.user.id, input.tabsOrder);
        
        if (!layout) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'فشل في حفظ تخصيص لوحة المتابعة'
          });
        }
        
        return {
          success: true,
          tabsOrder: JSON.parse(layout.tabsOrder)
        };
      }),
    
    // إعادة تعيين تخصيص لوحة المتابعة
    resetLayout: protectedProcedure
      .mutation(async ({ ctx }) => {
        const success = await resetDashboardLayout(ctx.user.id);
        
        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'فشل في إعادة تعيين تخصيص لوحة المتابعة'
          });
        }
        
        return {
          success: true,
          tabsOrder: ['tasks', 'budget', 'kpis', 'risks']
        };
      }),
  }),

  // ==================== Research Router ====================
  research: router({ 
    /**
     * توليد دراسة بحثية للمشروع المعتمد
     */
    generateStudy: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // جلب بيانات الفكرة
        const idea = await getIdeaById(input.ideaId, ctx.user.id);
        if (!idea) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'الفكرة غير موجودة'
          });
        }

        // التحقق من أن المشروع معتمد
        if (!idea.isApproved) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'يجب اعتماد المشروع أولاً قبل توليد الدراسة البحثية'
          });
        }

        // التحقق من عدم وجود دراسة سابقة
        const existingStudy = await getResearchStudyByIdeaId(input.ideaId);
        if (existingStudy) {
          return {
            success: true,
            study: existingStudy,
            message: 'تم استرجاع الدراسة البحثية الموجودة'
          };
        }

        const systemPrompt = `أنت باحث أكاديمي متخصص في العلوم الاجتماعية والتنمية ولديك خبرة واسعة في كتابة الدراسات البحثية للبرامج والمشاريع غير الربحية.

مهمتك هي إعداد دراسة بحثية شاملة ومتعمقة للبرنامج المقدم تتضمن:

## معايير جودة الدراسة:
- الأسلوب الأكاديمي: استخدم لغة علمية رصينة وموثقة بالمراجع
- التحليل العميق: قدم تحليلاً معمقاً وليس سطحياً
- المراجع: قدم مراجع علمية موثوقة (دراسات، كتب، تقارير دولية)
- الأرقام والإحصائيات: استخدم بيانات رقمية واقعية وموثوقة
- العائد الاجتماعي: وضح الأثر المتوقع على المجتمع والمستفيدين
- العائد للجمعية: وضح الفوائد المباشرة للمنظمة غير الربحية

يجب أن يكون ردك بصيغة JSON فقط بدون أي نص إضافي، ويتضمن الحقول التالية:

- executiveSummary: ملخص تنفيذي شامل (3-4 فقرات تلخص الدراسة بأكملها)

- programImportance: أهمية البرنامج (تحليل أكاديمي مفصل في 5-7 فقرات يشرح لماذا هذا البرنامج مهم للمجتمع مع إحصائيات ومراجع)

- socialReturn: العائد الاجتماعي المتوقع (تحليل مفصل في 5-7 فقرات يوضح الأثر على المستفيدين والمجتمع مع أرقام ومؤشرات قياس)

- organizationReturn: العائد للجمعية (تحليل في 4-6 فقرات يوضح كيف يساهم البرنامج في تعزيز سمعة الجمعية، بناء القدرات، جذب المانحين، وتحقيق الاستدامة)

- recommendations: التوصيات والخلاصة (4-5 توصيات عملية لتنفيذ البرنامج بنجاح وخلاصة عامة)

- references: مصفوفة من المراجع العلمية (8-12 مرجع موثوق يتضمن كل مرجع: title, author, year, source, url)

## ملاحظات هامة:
- استخدم مراجع حقيقية وموثوقة (دراسات أكاديمية، تقارير منظمات دولية، كتب متخصصة)
- قدم إحصائيات وأرقام واقعية من مصادر موثوقة
- ركز على السياق السعودي والعربي إن أمكن
- اجعل الدراسة مفيدة للجهات المانحة وصناع القرار`;

        const userPrompt = `معلومات البرنامج:
الاسم: ${idea.selectedName || 'غير محدد'}
الوصف: ${idea.programDescription}
الفئة المستهدفة: ${idea.targetAudience || 'غير محدد'}
العدد المستهدف: ${idea.targetCount || 'غير محدد'}
المدة: ${idea.duration || 'غير محدد'}

الرؤية: ${idea.vision}
الهدف العام: ${idea.generalObjective}
الفكرة: ${idea.idea}

قم بإعداد دراسة بحثية شاملة لهذا البرنامج.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "research_study",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    executiveSummary: { type: "string" },
                    programImportance: { type: "string" },
                    socialReturn: { type: "string" },
                    organizationReturn: { type: "string" },
                    recommendations: { type: "string" },
                    references: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          author: { type: "string" },
                          year: { type: "string" },
                          source: { type: "string" },
                          url: { type: "string" },
                        },
                        required: ["title", "author", "year", "source"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["executiveSummary", "programImportance", "socialReturn", "organizationReturn", "recommendations", "references"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          if (!content || typeof content !== 'string') {
            throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي");
          }

          // تنظيف المحتوى من أي markdown code blocks أو نصوص إضافية
          let cleanedResearchContent = content.trim();
          cleanedResearchContent = cleanedResearchContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
          const firstBraceR = cleanedResearchContent.indexOf('{');
          const lastBraceR = cleanedResearchContent.lastIndexOf('}');
          if (firstBraceR !== -1 && lastBraceR !== -1 && lastBraceR > firstBraceR) {
            cleanedResearchContent = cleanedResearchContent.substring(firstBraceR, lastBraceR + 1);
          }

          const generatedStudy = JSON.parse(cleanedResearchContent);

          // حفظ الدراسة في قاعدة البيانات
          const savedStudy = await createResearchStudy({
            ideaId: input.ideaId,
            userId: ctx.user.id,
            executiveSummary: generatedStudy.executiveSummary,
            programImportance: generatedStudy.programImportance,
            socialReturn: generatedStudy.socialReturn,
            organizationReturn: generatedStudy.organizationReturn,
            recommendations: generatedStudy.recommendations,
            references: JSON.stringify(generatedStudy.references),
          });

          return {
            success: true,
            study: savedStudy,
          };
        } catch (error) {
          console.error("[Research] Failed to generate study:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: "حدث خطأ أثناء توليد الدراسة البحثية. يرجى المحاولة مرة أخرى."
          });
        }
      }),

    /**
     * جلب دراسة بحثية حسب معرف الفكرة
     */
    getByIdeaId: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
      }))
      .query(async ({ input }) => {
        const study = await getResearchStudyByIdeaId(input.ideaId);
        return study;
      }),

    /**
     * جلب دراسة بحثية حسب المعرف
     */
    getById: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input }) => {
        const study = await getResearchStudyById(input.id);
        if (!study) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'الدراسة غير موجودة'
          });
        }
        return study;
      }),
  }),

  /**
   * Settings router - إعدادات المستخدم
   */
  settings: router({
    /**
     * جلب إعدادات الألوان
     */
    getColors: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'خطأ في الاتصال بقاعدة البيانات' });
        const user = await db.select({
          primaryColor: users.primaryColor,
          secondaryColor: users.secondaryColor,
          backgroundColor: users.backgroundColor,
        })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

        return user[0] || {
          primaryColor: null,
          secondaryColor: null,
          backgroundColor: null,
        };
      }),

    /**
     * حفظ إعدادات الألوان
     */
    updateColors: protectedProcedure
      .input(z.object({
        primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
        secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
        backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'خطأ في الاتصال بقاعدة البيانات' });
        await db.update(users)
          .set({
            primaryColor: input.primaryColor,
            secondaryColor: input.secondaryColor,
            backgroundColor: input.backgroundColor,
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: "تم حفظ إعدادات الألوان بنجاح",
        };
      }),

    /**
     * إعادة تعيين الألوان للافتراضي
     */
    resetColors: protectedProcedure
      .mutation(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'خطأ في الاتصال بقاعدة البيانات' });
        await db.update(users)
          .set({
            primaryColor: null,
            secondaryColor: null,
            backgroundColor: null,
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: "تم إعادة تعيين الألوان بنجاح",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Note: This line should be removed - it's a duplicate closing brace
// The actual closing brace is at line 2185
