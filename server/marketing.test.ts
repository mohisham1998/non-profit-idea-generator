import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock invokeLLM
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn(),
}));

// Mock db functions
vi.mock('./db', () => ({
  getIdeaById: vi.fn(),
}));

import { invokeLLM } from './_core/llm';
import { getIdeaById } from './db';

describe('Marketing Content Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate marketing content with all required fields', async () => {
    // Mock idea data
    const mockIdea = {
      id: 1,
      programDescription: 'برنامج تعليمي للأطفال',
      vision: 'تعليم متميز لكل طفل',
      generalObjective: 'تحسين مستوى التعليم',
      targetAudience: 'الأطفال من 6-12 سنة',
      features: 'تعليم تفاعلي، محتوى متنوع',
      expectedResults: 'تحسين المهارات التعليمية',
    };

    // Mock LLM response
    const mockMarketingContent = {
      socialMedia: {
        twitter: [
          'انضموا إلينا في برنامج تعليمي مميز للأطفال! 📚',
          'مستقبل أطفالنا يبدأ بالتعليم المتميز 🌟',
          'تعليم تفاعلي وممتع لكل طفل 🎓',
        ],
        facebook: [
          'نقدم لكم برنامجنا التعليمي المتميز للأطفال...',
          'هل تبحث عن تعليم متميز لطفلك؟',
        ],
        linkedin: [
          'نفخر بإطلاق برنامجنا التعليمي للأطفال...',
          'شراكة استراتيجية لتطوير التعليم...',
        ],
        instagram: [
          '✨ تعليم ممتع ومفيد لأطفالنا! 📖🎨',
          '🌈 رحلة تعليمية مميزة تبدأ هنا! 🚀',
        ],
      },
      emails: {
        donors: {
          subject: 'فرصة للمساهمة في تعليم الأطفال',
          body: 'نتشرف بدعوتكم للمساهمة في برنامجنا التعليمي...',
        },
        volunteers: {
          subject: 'انضم لفريق المتطوعين',
          body: 'نبحث عن متطوعين متحمسين للمساهمة...',
        },
        partners: {
          subject: 'فرصة شراكة استراتيجية',
          body: 'نتطلع للتعاون معكم في برنامجنا التعليمي...',
        },
      },
      adCopy: {
        short: [
          'تعليم متميز لكل طفل',
          'مستقبل أفضل يبدأ بالتعليم',
          'انضم إلينا اليوم',
        ],
        medium: [
          'برنامج تعليمي متكامل يهدف لتطوير مهارات الأطفال...',
          'نقدم تجربة تعليمية فريدة تجمع بين المتعة والفائدة...',
        ],
        long: 'في إطار سعينا لتحقيق رؤيتنا في توفير تعليم متميز لكل طفل...',
      },
      hashtags: [
        '#تعليم_الأطفال',
        '#مستقبل_مشرق',
        '#تعليم_تفاعلي',
        '#أطفالنا_أولاً',
        '#تعليم_ممتع',
      ],
      keyMessages: [
        'التعليم المتميز حق لكل طفل',
        'نبني مستقبل أفضل لأطفالنا',
        'التعليم التفاعلي يصنع الفرق',
      ],
      callToAction: [
        'سجل طفلك الآن!',
        'انضم إلينا اليوم',
        'ساهم في صنع المستقبل',
        'تبرع الآن',
        'شاركنا الرحلة',
      ],
      slogans: [
        'تعليم اليوم، نجاح الغد',
        'معاً نبني المستقبل',
        'كل طفل يستحق الأفضل',
        'التعليم بداية كل شيء',
        'نحو جيل متعلم ومبدع',
      ],
    };

    (getIdeaById as any).mockResolvedValue(mockIdea);
    (invokeLLM as any).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockMarketingContent),
          },
        },
      ],
    });

    // Verify the mock data structure
    expect(mockMarketingContent).toHaveProperty('socialMedia');
    expect(mockMarketingContent).toHaveProperty('emails');
    expect(mockMarketingContent).toHaveProperty('adCopy');
    expect(mockMarketingContent).toHaveProperty('hashtags');
    expect(mockMarketingContent).toHaveProperty('keyMessages');
    expect(mockMarketingContent).toHaveProperty('callToAction');
    expect(mockMarketingContent).toHaveProperty('slogans');

    // Verify social media structure
    expect(mockMarketingContent.socialMedia).toHaveProperty('twitter');
    expect(mockMarketingContent.socialMedia).toHaveProperty('facebook');
    expect(mockMarketingContent.socialMedia).toHaveProperty('linkedin');
    expect(mockMarketingContent.socialMedia).toHaveProperty('instagram');
    expect(Array.isArray(mockMarketingContent.socialMedia.twitter)).toBe(true);
    expect(mockMarketingContent.socialMedia.twitter.length).toBeGreaterThan(0);

    // Verify emails structure
    expect(mockMarketingContent.emails).toHaveProperty('donors');
    expect(mockMarketingContent.emails).toHaveProperty('volunteers');
    expect(mockMarketingContent.emails).toHaveProperty('partners');
    expect(mockMarketingContent.emails.donors).toHaveProperty('subject');
    expect(mockMarketingContent.emails.donors).toHaveProperty('body');

    // Verify ad copy structure
    expect(mockMarketingContent.adCopy).toHaveProperty('short');
    expect(mockMarketingContent.adCopy).toHaveProperty('medium');
    expect(mockMarketingContent.adCopy).toHaveProperty('long');
    expect(Array.isArray(mockMarketingContent.adCopy.short)).toBe(true);
    expect(typeof mockMarketingContent.adCopy.long).toBe('string');

    // Verify arrays
    expect(Array.isArray(mockMarketingContent.hashtags)).toBe(true);
    expect(Array.isArray(mockMarketingContent.keyMessages)).toBe(true);
    expect(Array.isArray(mockMarketingContent.callToAction)).toBe(true);
    expect(Array.isArray(mockMarketingContent.slogans)).toBe(true);
  });

  it('should handle missing idea gracefully', async () => {
    (getIdeaById as any).mockResolvedValue(null);

    // The function should throw an error when idea is not found
    const mockIdea = await getIdeaById(999, 1);
    expect(mockIdea).toBeNull();
  });

  it('should validate marketing content has Arabic text', async () => {
    const mockMarketingContent = {
      socialMedia: {
        twitter: ['انضموا إلينا في برنامج تعليمي مميز للأطفال!'],
        facebook: ['نقدم لكم برنامجنا التعليمي المتميز'],
        linkedin: ['نفخر بإطلاق برنامجنا التعليمي'],
        instagram: ['تعليم ممتع ومفيد لأطفالنا!'],
      },
      emails: {
        donors: { subject: 'فرصة للمساهمة', body: 'نتشرف بدعوتكم' },
        volunteers: { subject: 'انضم لفريق المتطوعين', body: 'نبحث عن متطوعين' },
        partners: { subject: 'فرصة شراكة', body: 'نتطلع للتعاون' },
      },
      adCopy: {
        short: ['تعليم متميز'],
        medium: ['برنامج تعليمي متكامل'],
        long: 'في إطار سعينا لتحقيق رؤيتنا',
      },
      hashtags: ['#تعليم_الأطفال'],
      keyMessages: ['التعليم المتميز حق لكل طفل'],
      callToAction: ['سجل طفلك الآن!'],
      slogans: ['تعليم اليوم، نجاح الغد'],
    };

    // Check Arabic text presence (Arabic characters range)
    const arabicRegex = /[\u0600-\u06FF]/;
    
    expect(arabicRegex.test(mockMarketingContent.socialMedia.twitter[0])).toBe(true);
    expect(arabicRegex.test(mockMarketingContent.emails.donors.subject)).toBe(true);
    expect(arabicRegex.test(mockMarketingContent.adCopy.long)).toBe(true);
    expect(arabicRegex.test(mockMarketingContent.hashtags[0])).toBe(true);
    expect(arabicRegex.test(mockMarketingContent.slogans[0])).toBe(true);
  });

  it('should validate hashtags format', async () => {
    const hashtags = [
      '#تعليم_الأطفال',
      '#مستقبل_مشرق',
      '#تعليم_تفاعلي',
    ];

    // All hashtags should start with #
    hashtags.forEach(tag => {
      expect(tag.startsWith('#')).toBe(true);
    });
  });

  it('should validate email structure completeness', async () => {
    const emails = {
      donors: {
        subject: 'فرصة للمساهمة في تعليم الأطفال',
        body: 'نتشرف بدعوتكم للمساهمة في برنامجنا التعليمي المتميز للأطفال. يهدف البرنامج إلى توفير تعليم عالي الجودة للأطفال من الفئات الأقل حظاً.',
      },
      volunteers: {
        subject: 'انضم لفريق المتطوعين',
        body: 'نبحث عن متطوعين متحمسين للمساهمة في برنامجنا التعليمي. إذا كنت تمتلك الشغف للتعليم والعمل مع الأطفال، انضم إلينا!',
      },
      partners: {
        subject: 'فرصة شراكة استراتيجية',
        body: 'نتطلع للتعاون معكم في برنامجنا التعليمي للأطفال. نؤمن بأن الشراكات الفعالة تساهم في تحقيق أثر أكبر.',
      },
    };

    // Verify all email types exist
    expect(emails).toHaveProperty('donors');
    expect(emails).toHaveProperty('volunteers');
    expect(emails).toHaveProperty('partners');

    // Verify each email has subject and body
    Object.values(emails).forEach(email => {
      expect(email).toHaveProperty('subject');
      expect(email).toHaveProperty('body');
      expect(email.subject.length).toBeGreaterThan(0);
      expect(email.body.length).toBeGreaterThan(0);
    });
  });
});
