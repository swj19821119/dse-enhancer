/**
 * Adaptive Difficulty Adjustment - PRD Section 3.13
 * Implements dynamic difficulty adjustment based on user performance
 */

import {
  ModuleResult,
  calculateDailyScore,
  calculateOverallAccuracy,
} from './scoring';

/**
 * Daily report data structure
 */
export interface DailyReport {
  date: string;
  totalScore: number;
  moduleBreakdown: ModuleResult[];
  accuracy: number;
  currentDifficulty: number;
  nextDifficulty: number;
  difficultyChange: number;
  recommendations: string[];
}

/**
 * Progress trend data for charts
 */
export interface ProgressTrend {
  date: string;
  score: number;
  accuracy: number;
  difficulty: number;
}

/**
 * Calculate next difficulty based on current difficulty and accuracy
 * Based on PRD Section 3.13 "Difficulty Adjustment Rules"
 *
 * Rules:
 * - Accuracy < 60%: Decrease difficulty by 0.1
 * - Accuracy 60-80%: Maintain current difficulty
 * - Accuracy > 80% and extra questions completed: Increase difficulty by 0.05 to 0.1
 *
 * @param currentDifficulty - Current difficulty coefficient (0.8-5.9)
 * @param accuracy - Overall accuracy (0-1)
 * @param extraQuestionsCompleted - Whether user completed extra questions
 * @returns Next difficulty coefficient (0.8-5.9)
 */
export function calculateNextDifficulty(
  currentDifficulty: number,
  accuracy: number,
  extraQuestionsCompleted: boolean = false
): number {
  if (accuracy < 0.6) {
    // Below 60%: decrease difficulty, add more basic questions
    return Math.max(0.8, currentDifficulty - 0.1);
  } else if (accuracy > 0.8 && extraQuestionsCompleted) {
    // Above 80% and extra questions completed: increase difficulty
    // Base increase of 0.05 + (accuracy - 0.8) * 0.25
    // This means:
    //   80% accuracy → +0.05
    //   85% accuracy → +0.075
    //   90% accuracy → +0.1
    //   100% accuracy → +0.125
    const increase = 0.05 + (accuracy - 0.8) * 0.25;
    return Math.min(5.9, currentDifficulty + increase);
  } else if (accuracy > 0.8) {
    // Above 80% but no extra questions: small increase
    return Math.min(5.9, currentDifficulty + 0.02);
  }
  // 60-80%: maintain current difficulty
  return currentDifficulty;
}

/**
 * Generate question difficulty range for adaptive selection
 * Based on PRD Section 3.13 "Push Difficulty Calculation"
 *
 * Formula: Difficulty Range = [Current Difficulty - 0.3, Current Difficulty + 0.2]
 * Constraints:
 * - Never exceed Current Difficulty + 0.5
 * - Minimum difficulty is 0.8 (Pre Level)
 *
 * @param currentDifficulty - Current difficulty coefficient (0.8-5.9)
 * @returns Difficulty range [min, max]
 */
export function getQuestionDifficultyRange(currentDifficulty: number): [number, number] {
  const minDifficulty = Math.max(0.8, currentDifficulty - 0.3);
  const maxDifficulty = Math.min(currentDifficulty + 0.2, currentDifficulty + 0.5, 5.9);
  return [minDifficulty, maxDifficulty];
}

/**
 * Check if a question is too difficult for current level
 * "Far超出当前水平"判定
 *
 * @param questionDifficulty - Question's difficulty coefficient
 * @param userDifficulty - User's current difficulty coefficient
 * @returns True if question is too difficult
 */
export function isQuestionTooDifficult(
  questionDifficulty: number,
  userDifficulty: number
): boolean {
  const maxAllowedDifficulty = userDifficulty + 0.5;
  return questionDifficulty > maxAllowedDifficulty;
}

/**
 * Generate personalized recommendations based on module results
 *
 * @param moduleResults - Array of module results
 * @returns Array of recommendation strings
 */
export function generateRecommendations(moduleResults: ModuleResult[]): string[] {
  const recommendations: string[] = [];

  moduleResults.forEach(result => {
    const { moduleType, requiredCorrect, requiredTotal, extraTotal, score, accuracy } = result;

    // Low performance recommendations
    if (accuracy < 0.6) {
      const moduleNames: Record<string, string> = {
        vocabulary: '词汇',
        grammar: '语法',
        reading: '阅读',
        listening: '听力',
        error_review: '错题复习',
        part_b: '写作/口语 Part B',
      };
      recommendations.push(
        `${moduleNames[moduleType] || moduleType}模块正确率较低，建议加强基础练习`
      );
    }

    // Encourage extra questions
    if (extraTotal === 0 && requiredCorrect / requiredTotal >= 0.8) {
      const moduleNames: Record<string, string> = {
        vocabulary: '词汇',
        grammar: '语法',
        reading: '阅读',
        listening: '听力',
        error_review: '错题复习',
        part_b: '写作/口语 Part B',
      };
      recommendations.push(
        `${moduleNames[moduleType] || moduleType}模块表现不错，可以尝试多做一些额外题目获取加分`
      );
    }

    // Diminishing returns warning
    if (extraTotal > 5 && accuracy < 0.8) {
      recommendations.push(
        `虽然做了${extraTotal}道额外题目，但正确率不高，建议先巩固基础再追求额外加分`
      );
    }
  });

  // Overall performance recommendations
  const overallAccuracy = calculateOverallAccuracy(moduleResults);

  if (overallAccuracy >= 0.85) {
    recommendations.push('表现优异！继续保持，系统会逐步提升题目难度');
  } else if (overallAccuracy >= 0.7) {
    recommendations.push('表现良好，继续保持当前学习节奏');
  } else if (overallAccuracy >= 0.5) {
    recommendations.push('建议加强基础知识复习，不要急于做额外题目');
  } else {
    recommendations.push('建议从基础题型开始，扎实打好基础');
  }

  // Study time recommendation
  const totalExtraQuestions = moduleResults.reduce((sum, m) => sum + m.extraTotal, 0);
  if (totalExtraQuestions === 0) {
    recommendations.push('多做题可以获得更高的分数，建议在保证正确率的前提下尝试额外题目');
  } else if (totalExtraQuestions > 10) {
    recommendations.push('额外题目数量较多，注意控制时间，确保每道题都经过思考');
  }

  return recommendations;
}

/**
 * Generate a complete daily report
 *
 * @param userId - User ID
 * @param studyDate - Study date (ISO string)
 * @param moduleResults - Array of module results
 * @param currentDifficulty - Current difficulty coefficient
 * @returns Complete daily report
 */
export function generateDailyReport(
  userId: string,
  studyDate: string,
  moduleResults: ModuleResult[],
  currentDifficulty: number
): DailyReport {
  const moduleScores = moduleResults.map(m => m.score);
  const totalScore = calculateDailyScore(moduleScores);
  const accuracy = calculateOverallAccuracy(moduleResults);

  const extraQuestionsCompleted = moduleResults.some(m => m.extraTotal > 0);
  const nextDifficulty = calculateNextDifficulty(
    currentDifficulty,
    accuracy,
    extraQuestionsCompleted
  );

  const difficultyChange = nextDifficulty - currentDifficulty;
  const recommendations = generateRecommendations(moduleResults);

  return {
    date: studyDate,
    totalScore,
    moduleBreakdown: moduleResults,
    accuracy,
    currentDifficulty,
    nextDifficulty,
    difficultyChange,
    recommendations,
  };
}

/**
 * Calculate progress trend over multiple days
 *
 * @param dailyReports - Array of daily reports
 * @returns Array of trend data points
 */
export function calculateProgressTrend(dailyReports: DailyReport[]): ProgressTrend[] {
  return dailyReports.map(report => ({
    date: report.date,
    score: report.totalScore,
    accuracy: report.accuracy,
    difficulty: report.currentDifficulty,
  }));
}

/**
 * Calculate average score over a period
 *
 * @param dailyReports - Array of daily reports
 * @returns Average score or 0 if no data
 */
export function calculateAverageScore(dailyReports: DailyReport[]): number {
  if (dailyReports.length === 0) return 0;

  const sum = dailyReports.reduce((total, report) => total + report.totalScore, 0);
  return Math.round((sum / dailyReports.length) * 10) / 10;
}

/**
 * Calculate score trend (improving, stable, declining)
 *
 * @param dailyReports - Array of daily reports
 * @returns Trend direction
 */
export type TrendDirection = 'improving' | 'stable' | 'declining';

export function calculateScoreTrend(dailyReports: DailyReport[]): TrendDirection {
  if (dailyReports.length < 2) return 'stable';

  const recent = dailyReports.slice(-3);
  const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
  const secondHalf = recent.slice(Math.ceil(recent.length / 2));

  const avgFirst = calculateAverageScore(firstHalf.map(r => ({ ...r, moduleBreakdown: [], accuracy: r.accuracy, currentDifficulty: r.currentDifficulty, nextDifficulty: r.nextDifficulty, difficultyChange: r.difficultyChange, recommendations: [] })));
  const avgSecond = calculateAverageScore(secondHalf.map(r => ({ ...r, moduleBreakdown: [], accuracy: r.accuracy, currentDifficulty: r.currentDifficulty, nextDifficulty: r.nextDifficulty, difficultyChange: r.difficultyChange, recommendations: [] })));

  if (avgSecond > avgFirst + 2) return 'improving';
  if (avgSecond < avgFirst - 2) return 'declining';
  return 'stable';
}

/**
 * Get optimal question distribution for next study session
 * Based on current performance and weak areas
 *
 * @param moduleResults - Array of module results
 * @param currentDifficulty - Current difficulty coefficient
 * @returns Question distribution configuration
 */
export interface QuestionDistribution {
  [moduleType: string]: {
    count: number;
    difficultyRange: [number, number];
    weakPointFocus: boolean;
  };
}

export function getNextStudyDistribution(
  moduleResults: ModuleResult[],
  currentDifficulty: number
): QuestionDistribution {
  const distribution: QuestionDistribution = {};
  const difficultyRange = getQuestionDifficultyRange(currentDifficulty);

  moduleResults.forEach(result => {
    const { moduleType, accuracy } = result;

    // Default distribution
    let count = 10;
    let weakPointFocus = false;

    // Adjust based on performance
    if (accuracy < 0.6) {
      // Low performance: focus more on this module
      count = 15;
      weakPointFocus = true;
    } else if (accuracy >= 0.8 && result.extraTotal > 5) {
      // High performance with extra questions: can reduce count
      count = 8;
      weakPointFocus = false;
    }

    distribution[moduleType] = {
      count,
      difficultyRange,
      weakPointFocus,
    };
  });

  return distribution;
}
