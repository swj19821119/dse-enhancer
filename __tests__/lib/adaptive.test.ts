import {
  calculateNextDifficulty,
  getQuestionDifficultyRange,
  isQuestionTooDifficult,
  generateRecommendations,
  generateDailyReport,
  calculateAverageScore,
  calculateScoreTrend,
  getNextStudyDistribution,
  TrendDirection,
} from '@/lib/adaptive';
import { ModuleResult, ModuleType } from '@/lib/scoring';

describe('Adaptive Functions', () => {
  describe('calculateNextDifficulty', () => {
    it('should decrease difficulty for low accuracy (< 60%)', () => {
      const result = calculateNextDifficulty(2.0, 0.5, false);
      expect(result).toBeLessThan(2.0);
      expect(result).toBeGreaterThanOrEqual(0.8);
    });

    it('should maintain difficulty for 60-80% accuracy', () => {
      const result1 = calculateNextDifficulty(2.0, 0.7, false);
      const result2 = calculateNextDifficulty(2.0, 0.75, false);
      expect(result1).toBe(2.0);
      expect(result2).toBe(2.0);
    });

    it('should increase difficulty for high accuracy (> 80%) with extra questions', () => {
      const result = calculateNextDifficulty(2.0, 0.85, true);
      expect(result).toBeGreaterThan(2.0);
    });

    it('should increase difficulty for high accuracy without extra questions', () => {
      const result = calculateNextDifficulty(2.0, 0.85, false);
      expect(result).toBeGreaterThan(2.0);
      expect(result).toBeLessThan(2.1);
    });

    it('should cap difficulty at 5.9', () => {
      const result = calculateNextDifficulty(5.8, 1.0, true);
      expect(result).toBeLessThanOrEqual(5.9);
    });

    it('should cap difficulty at 0.8 minimum', () => {
      const result = calculateNextDifficulty(0.85, 0.5, false);
      expect(result).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('getQuestionDifficultyRange', () => {
    it('should return correct range for mid-level difficulty', () => {
      const result = getQuestionDifficultyRange(2.5);
      expect(result[0]).toBeLessThanOrEqual(2.2);
      expect(result[1]).toBeGreaterThanOrEqual(2.5);
    });

    it('should handle minimum difficulty', () => {
      const result = getQuestionDifficultyRange(0.8);
      expect(result[0]).toBeGreaterThanOrEqual(0.8);
      expect(result[1]).toBeLessThanOrEqual(1.3);
    });

    it('should handle maximum difficulty', () => {
      const result = getQuestionDifficultyRange(5.9);
      expect(result[0]).toBeGreaterThanOrEqual(5.6);
      expect(result[1]).toBeLessThanOrEqual(5.9);
    });

    it('should enforce max constraint of +0.5', () => {
      const result = getQuestionDifficultyRange(3.0);
      expect(result[1] - 3.0).toBeLessThanOrEqual(0.5);
    });
  });

  describe('isQuestionTooDifficult', () => {
    it('should return true for questions far above user level', () => {
      const result = isQuestionTooDifficult(4.0, 3.0);
      expect(result).toBe(true);
    });

    it('should return false for questions within range', () => {
      const result = isQuestionTooDifficult(3.4, 3.0);
      expect(result).toBe(false);
    });

    it('should return false for questions at exactly +0.5', () => {
      const result = isQuestionTooDifficult(3.5, 3.0);
      expect(result).toBe(false);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for low performance', () => {
      const moduleResults: ModuleResult[] = [
        {
          moduleType: 'vocabulary',
          requiredCorrect: 5,
          requiredTotal: 10,
          extraCorrect: 0,
          extraTotal: 0,
          score: 40,
          accuracy: 0.5,
          baseScore: 40,
          extraScore: 0,
        },
      ];
      const recommendations = generateRecommendations(moduleResults);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.includes('词汇') && r.includes('基础'))).toBe(true);
    });

    it('should generate recommendations for extra questions encouragement', () => {
      const moduleResults: ModuleResult[] = [
        {
          moduleType: 'vocabulary',
          requiredCorrect: 8,
          requiredTotal: 10,
          extraCorrect: 0,
          extraTotal: 0,
          score: 60,
          accuracy: 0.8,
          baseScore: 60,
          extraScore: 0,
        },
      ];
      const recommendations = generateRecommendations(moduleResults);
      expect(recommendations.some(r => r.includes('额外题目'))).toBe(true);
    });

    it('should generate recommendations for diminishing returns', () => {
      const moduleResults: ModuleResult[] = [
        {
          moduleType: 'vocabulary',
          requiredCorrect: 5,
          requiredTotal: 10,
          extraCorrect: 3,
          extraTotal: 10,
          score: 40,
          accuracy: 0.5,
          baseScore: 40,
          extraScore: 0,
        },
      ];
      const recommendations = generateRecommendations(moduleResults);
      expect(recommendations.some(r => r.includes('正确率不高'))).toBe(true);
    });
  });

  describe('generateDailyReport', () => {
    it('should generate complete daily report', () => {
      const moduleResults: ModuleResult[] = [
        {
          moduleType: 'vocabulary',
          requiredCorrect: 8,
          requiredTotal: 10,
          extraCorrect: 2,
          extraTotal: 2,
          score: 70,
          accuracy: 0.8,
          baseScore: 60,
          extraScore: 10,
        },
      ];
      const report = generateDailyReport('user1', '2024-01-01', moduleResults, 2.0);
      expect(report.date).toBe('2024-01-01');
      expect(report.totalScore).toBeGreaterThan(0);
      expect(report.accuracy).toBeGreaterThan(0);
      expect(report.currentDifficulty).toBe(2.0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('calculateAverageScore', () => {
    it('should return 0 for empty array', () => {
      const result = calculateAverageScore([]);
      expect(result).toBe(0);
    });

    it('should calculate average correctly', () => {
      const reports = [
        {
          date: '2024-01-01',
          totalScore: 70,
          moduleBreakdown: [],
          accuracy: 0.7,
          currentDifficulty: 2.0,
          nextDifficulty: 2.0,
          difficultyChange: 0,
          recommendations: [],
        },
        {
          date: '2024-01-02',
          totalScore: 80,
          moduleBreakdown: [],
          accuracy: 0.8,
          currentDifficulty: 2.0,
          nextDifficulty: 2.1,
          difficultyChange: 0.1,
          recommendations: [],
        },
      ];
      const result = calculateAverageScore(reports);
      expect(result).toBe(75);
    });
  });

  describe('calculateScoreTrend', () => {
    it('should return stable for less than 2 reports', () => {
      const result = calculateScoreTrend([]);
      expect(result).toBe('stable');
    });

    it('should detect improving trend', () => {
      const reports = [
        {
          date: '2024-01-01',
          totalScore: 60,
          moduleBreakdown: [],
          accuracy: 0.6,
          currentDifficulty: 2.0,
          nextDifficulty: 2.0,
          difficultyChange: 0,
          recommendations: [],
        },
        {
          date: '2024-01-02',
          totalScore: 70,
          moduleBreakdown: [],
          accuracy: 0.7,
          currentDifficulty: 2.0,
          nextDifficulty: 2.1,
          difficultyChange: 0.1,
          recommendations: [],
        },
        {
          date: '2024-01-03',
          totalScore: 80,
          moduleBreakdown: [],
          accuracy: 0.8,
          currentDifficulty: 2.1,
          nextDifficulty: 2.2,
          difficultyChange: 0.1,
          recommendations: [],
        },
      ];
      const result = calculateScoreTrend(reports);
      expect(result).toBe('improving');
    });

    it('should detect declining trend', () => {
      const reports = [
        {
          date: '2024-01-01',
          totalScore: 80,
          moduleBreakdown: [],
          accuracy: 0.8,
          currentDifficulty: 2.2,
          nextDifficulty: 2.2,
          difficultyChange: 0,
          recommendations: [],
        },
        {
          date: '2024-01-02',
          totalScore: 70,
          moduleBreakdown: [],
          accuracy: 0.7,
          currentDifficulty: 2.2,
          nextDifficulty: 2.1,
          difficultyChange: -0.1,
          recommendations: [],
        },
        {
          date: '2024-01-03',
          totalScore: 60,
          moduleBreakdown: [],
          accuracy: 0.6,
          currentDifficulty: 2.1,
          nextDifficulty: 2.0,
          difficultyChange: -0.1,
          recommendations: [],
        },
      ];
      const result = calculateScoreTrend(reports);
      expect(result).toBe('declining');
    });
  });

  describe('getNextStudyDistribution', () => {
    it('should increase count for low performance modules', () => {
      const moduleResults: ModuleResult[] = [
        {
          moduleType: 'vocabulary',
          requiredCorrect: 5,
          requiredTotal: 10,
          extraCorrect: 0,
          extraTotal: 0,
          score: 40,
          accuracy: 0.5,
          baseScore: 40,
          extraScore: 0,
        },
      ];
      const distribution = getNextStudyDistribution(moduleResults, 2.0);
      expect(distribution['vocabulary'].count).toBeGreaterThan(10);
      expect(distribution['vocabulary'].weakPointFocus).toBe(true);
    });

    it('should decrease count for high performance modules with extra questions', () => {
      const moduleResults: ModuleResult[] = [
        {
          moduleType: 'vocabulary',
          requiredCorrect: 8,
          requiredTotal: 10,
          extraCorrect: 5,
          extraTotal: 5,
          score: 75,
          accuracy: 0.85,
          baseScore: 60,
          extraScore: 15,
        },
      ];
      const distribution = getNextStudyDistribution(moduleResults, 2.0);
      expect(distribution['vocabulary'].count).toBeLessThanOrEqual(10);
    });

    it('should apply correct difficulty range', () => {
      const moduleResults: ModuleResult[] = [
        {
          moduleType: 'vocabulary',
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
      const distribution = getNextStudyDistribution(moduleResults, 2.5);
      const [min, max] = distribution['vocabulary'].difficultyRange;
      expect(min).toBeLessThanOrEqual(2.5);
      expect(max).toBeGreaterThanOrEqual(2.5);
    });
  });
});
