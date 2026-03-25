import {
  calculateBaseScore,
  calculateExtraScore,
  calculateModuleScore,
  calculateDailyScore,
  calculateOverallAccuracy,
  generateModuleResult,
  getDifficultyLevel,
  getDefaultQuestionCount,
} from '@/lib/scoring';
import { ModuleType } from '@/lib/scoring';

describe('Scoring Functions', () => {
  describe('calculateBaseScore', () => {
    it('should return 0 when total is 0', () => {
      const result = calculateBaseScore(0, 0, 2.0);
      expect(result).toBe(0);
    });

    it('should calculate base score correctly for 60% accuracy', () => {
      const result = calculateBaseScore(6, 10, 3.0);
      expect(result).toBe(60);
    });

    it('should calculate base score correctly for 100% accuracy', () => {
      const result = calculateBaseScore(10, 10, 3.0);
      expect(result).toBe(60);
    });

    it('should calculate base score correctly for 50% accuracy', () => {
      const result = calculateBaseScore(5, 10, 3.0);
      expect(result).toBe(50);
    });

    it('should cap base score at 60', () => {
      const result = calculateBaseScore(10, 10, 5.0);
      expect(result).toBe(60);
    });

    it('should apply difficulty coefficient correctly', () => {
      const result1 = calculateBaseScore(6, 10, 1.0);
      const result2 = calculateBaseScore(6, 10, 3.0);
      expect(result2).toBeGreaterThan(result1);
    });
  });

  describe('calculateExtraScore', () => {
    it('should return 0 when no extra questions', () => {
      const result = calculateExtraScore(0, 0, 2.0);
      expect(result).toBe(0);
    });

    it('should return 0 for low accuracy (< 60%)', () => {
      const result = calculateExtraScore(3, 10, 2.0);
      expect(result).toBe(0);
    });

    it('should apply partial reward for 60-79% accuracy', () => {
      const result = calculateExtraScore(7, 10, 2.0);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(10);
    });

    it('should apply full reward for >= 80% accuracy', () => {
      const result1 = calculateExtraScore(8, 10, 2.0);
      const result2 = calculateExtraScore(7, 10, 2.0);
      expect(result1).toBeGreaterThan(result2);
    });

    it('should apply diminishing returns', () => {
      const result1 = calculateExtraScore(5, 5, 2.0);
      const result2 = calculateExtraScore(5, 10, 2.0);
      expect(result1).toBeGreaterThan(result2);
    });

    it('should cap extra score at 40', () => {
      const result = calculateExtraScore(50, 50, 5.0);
      expect(result).toBeLessThanOrEqual(40);
    });
  });

  describe('calculateModuleScore', () => {
    it('should calculate total module score correctly', () => {
      const result = calculateModuleScore(6, 10, 8, 10, 2.0);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should round to 1 decimal', () => {
      const result = calculateModuleScore(5, 10, 5, 10, 2.5);
      expect(result).toBe(Number(result.toFixed(1)));
    });
  });

  describe('calculateDailyScore', () => {
    it('should return 0 for empty array', () => {
      const result = calculateDailyScore([]);
      expect(result).toBe(0);
    });

    it('should calculate average score correctly', () => {
      const result = calculateDailyScore([60, 70, 80]);
      expect(result).toBe(70);
    });

    it('should cap daily score at 100', () => {
      const result = calculateDailyScore([100, 100, 100]);
      expect(result).toBe(100);
    });
  });

  describe('calculateOverallAccuracy', () => {
    it('should return 0 for empty array', () => {
      const result = calculateOverallAccuracy([]);
      expect(result).toBe(0);
    });

    it('should calculate accuracy correctly across modules', () => {
      const moduleResults = [
        {
          moduleType: 'vocabulary' as ModuleType,
          requiredCorrect: 8,
          requiredTotal: 10,
          extraCorrect: 2,
          extraTotal: 2,
          score: 70,
          accuracy: 0.8,
          baseScore: 50,
          extraScore: 20,
        },
        {
          moduleType: 'grammar' as ModuleType,
          requiredCorrect: 6,
          requiredTotal: 10,
          extraCorrect: 0,
          extraTotal: 0,
          score: 50,
          accuracy: 0.6,
          baseScore: 50,
          extraScore: 0,
        },
      ];
      const result = calculateOverallAccuracy(moduleResults);
      expect(result).toBe(0.8);
    });
  });

  describe('generateModuleResult', () => {
    it('should generate complete module result', () => {
      const result = generateModuleResult('vocabulary', 8, 10, 2, 2, 2.0);
      expect(result.moduleType).toBe('vocabulary');
      expect(result.score).toBeGreaterThan(0);
      expect(result.accuracy).toBeGreaterThan(0);
      expect(result.baseScore).toBeGreaterThanOrEqual(0);
      expect(result.extraScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getDifficultyLevel', () => {
    it('should return Pre Level for 0.8-1.0', () => {
      const result = getDifficultyLevel(0.9);
      expect(result?.level).toBe('Pre Level');
    });

    it('should return Level 1 for 1.0-1.9', () => {
      const result = getDifficultyLevel(1.5);
      expect(result?.level).toBe('Level 1');
    });

    it('should return Level 2 for 2.0-2.9', () => {
      const result = getDifficultyLevel(2.5);
      expect(result?.level).toBe('Level 2');
    });

    it('should return Level 5 for 5.0-5.9', () => {
      const result = getDifficultyLevel(5.5);
      expect(result?.level).toBe('Level 5');
    });

    it('should return null for out of range', () => {
      const result = getDifficultyLevel(10.0);
      expect(result).toBeNull();
    });
  });

  describe('getDefaultQuestionCount', () => {
    it('should return correct default for vocabulary', () => {
      const result = getDefaultQuestionCount('vocabulary', 2.0);
      expect(result).toBe(15);
    });

    it('should return correct default for grammar', () => {
      const result = getDefaultQuestionCount('grammar', 2.0);
      expect(result).toBe(15);
    });

    it('should return correct default for reading', () => {
      const result = getDefaultQuestionCount('reading', 2.0);
      expect(result).toBe(10);
    });

    it('should return 10 for unknown module', () => {
      const result = getDefaultQuestionCount('unknown' as ModuleType, 2.0);
      expect(result).toBe(10);
    });
  });

  describe('Edge cases', () => {
    it('should handle all correct answers', () => {
      const result = calculateModuleScore(10, 10, 10, 10, 3.0);
      expect(result).toBeGreaterThan(60);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should handle all wrong answers', () => {
      const result = calculateModuleScore(0, 10, 0, 10, 3.0);
      expect(result).toBe(0);
    });

    it('should handle partial extra questions', () => {
      const result = calculateModuleScore(6, 10, 3, 5, 2.0);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
});
