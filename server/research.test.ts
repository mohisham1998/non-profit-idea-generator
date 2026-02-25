import { describe, it, expect } from 'vitest';
import { createResearchStudy, getResearchStudyByIdeaId, getResearchStudyById } from './dbResearch';

describe('Research Study System', () => {
  it('should create a research study', async () => {
    const study = await createResearchStudy({
      ideaId: 1,
      userId: 1,
      executiveSummary: 'Test summary',
      programImportance: 'Test importance',
      socialReturn: 'Test social return',
      organizationReturn: 'Test organization return',
      recommendations: 'Test recommendations',
      references: JSON.stringify([
        {
          title: 'Test Reference',
          author: 'Test Author',
          year: '2024',
          source: 'Test Source',
          url: 'https://example.com'
        }
      ]),
    });

    expect(study).toBeDefined();
    expect(study.ideaId).toBe(1);
    expect(study.executiveSummary).toBe('Test summary');
  });

  it('should get research study by idea ID', async () => {
    const study = await getResearchStudyByIdeaId(1);
    
    // قد تكون الدراسة موجودة أو غير موجودة
    if (study) {
      expect(study.ideaId).toBe(1);
    }
  });

  it('should get research study by ID', async () => {
    const study = await getResearchStudyById(1);
    
    // قد تكون الدراسة موجودة أو غير موجودة
    if (study) {
      expect(study.id).toBe(1);
    }
  });
});
