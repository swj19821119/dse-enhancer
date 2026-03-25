/**
 * Scoring System - PRD Section 3.13
 * Implements marginal diminishing scoring with adaptive difficulty
 */

/**
 * Module type for scoring calculation
 */
export type ModuleType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'error_review' | 'part_b';

/**
 * Module result data structure
 */
export interface ModuleResult {
  moduleType: ModuleType;
  requiredCorrect: number;  // Correct answers for required questions
  requiredTotal: number;    // Required questions (default quota)
  extraCorrect: number;     // Correct answers for extra questions
  extraTotal: number;       // Extra questions attempted
  score: number;            // Total module score (0-100)
  accuracy: number;         // Overall accuracy
  baseScore: number;        // Base score (max 60)
  extraScore: number;       // Extra score (max 40)
}

/**
 * Difficulty level mapping to coefficients
 * Based on PRD Table 3.13.1
 */
export interface DifficultyLevel {
  level: string;
  minDifficulty: number;
  maxDifficulty: number;
  coefficient: number;
}

export const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
  'Pre Level': { level: 'Pre Level', minDifficulty: 0.8, maxDifficulty: 1.0, coefficient: 0.8 },
  'Level 1': { level: 'Level 1', minDifficulty: 1.0, maxDifficulty: 1.9, coefficient: 1.0 },
  'Level 2': { level: 'Level 2', minDifficulty: 2.0, maxDifficulty: 2.9, coefficient: 1.2 },
  'Level 3': { level: 'Level 3', minDifficulty: 3.0, maxDifficulty: 3.9, coefficient: 1.4 },
  'Level 4': { level: 'Level 4', minDifficulty: 4.0, maxDifficulty: 4.9, coefficient: 1.5 },
  'Level 5': { level: 'Level 5', minDifficulty: 5.0, maxDifficulty: 5.9, coefficient: 1.5 },
};

/**
 * Calculate base score for required questions
 * Formula: Base Score = 60 × (Accuracy / 0.6) × (Difficulty / 3)
 * Max score: 60 points
 *
 * @param correctCount - Number of correct answers in required questions
 * @param totalCount - Total number of required questions
 * @param difficulty - Current difficulty coefficient (0.8-5.9)
 * @returns Base score (0-60)
 */
export function calculateBaseScore(
  correctCount: number,
  totalCount: number,
  difficulty: number
): number {
  if (totalCount === 0) return 0;

  const accuracy = correctCount / totalCount;
  const basePoints = 60;
  const accuracyCoefficient = Math.min(1.0, accuracy / 0.6); // Capped at 1.0
  const difficultyCoefficient = difficulty / 3;

  const baseScore = basePoints * accuracyCoefficient * difficultyCoefficient;
  return Math.min(60, baseScore);
}

/**
 * Calculate extra score with diminishing returns
 * Formula: Extra Score = Extra Correct × Reward Coefficient × Diminishing Coefficient × (Difficulty / 3)
 * Max score: 40 points
 *
 * @param extraCorrect - Number of correct answers in extra questions
 * @param extraTotal - Total number of extra questions attempted
 * @param difficulty - Current difficulty coefficient (0.8-5.9)
 * @returns Extra score (0-40)
 */
export function calculateExtraScore(
  extraCorrect: number,
  extraTotal: number,
  difficulty: number
): number {
  if (extraCorrect === 0 || extraTotal === 0) return 0;

  const accuracy = extraCorrect / extraTotal;

  // Calculate reward coefficient based on accuracy
  let rewardCoefficient = 0;
  if (accuracy >= 0.8) {
    rewardCoefficient = 1.0;
  } else if (accuracy >= 0.6) {
    rewardCoefficient = 0.7;
  } else {
    rewardCoefficient = 0; // No reward for low accuracy
  }

  // Diminishing coefficient: 1 / (1 + 0.1 × extraTotal)
  // Each extra question reduces marginal benefit by 10%
  const diminishingCoefficient = 1 / (1 + 0.1 * extraTotal);
  const difficultyCoefficient = difficulty / 3;

  // Extra points based on correct answers with diminishing returns
  const extraScore = extraCorrect * rewardCoefficient * diminishingCoefficient * difficultyCoefficient;
  return Math.min(40, extraScore);
}

/**
 * Calculate total module score
 * Formula: Module Score = Base Score + Extra Score
 * Max score: 100 points
 *
 * @param requiredCorrect - Correct answers in required questions
 * @param requiredTotal - Total required questions
 * @param extraCorrect - Correct answers in extra questions
 * @param extraTotal - Total extra questions
 * @param difficulty - Current difficulty coefficient
 * @returns Total module score (0-100, rounded to 1 decimal)
 */
export function calculateModuleScore(
  requiredCorrect: number,
  requiredTotal: number,
  extraCorrect: number,
  extraTotal: number,
  difficulty: number
): number {
  const baseScore = calculateBaseScore(requiredCorrect, requiredTotal, difficulty);
  const extraScore = calculateExtraScore(extraCorrect, extraTotal, difficulty);

  const totalScore = baseScore + extraScore;
  return Math.round(totalScore * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate daily total score across all modules
 * Formula: Daily Score = Σ(Module Scores) / Module Count
 * Max score: 100 points
 *
 * @param moduleScores - Array of module scores
 * @returns Daily score (0-100)
 */
export function calculateDailyScore(moduleScores: number[]): number {
  if (moduleScores.length === 0) return 0;

  const average = moduleScores.reduce((sum, score) => sum + score, 0) / moduleScores.length;
  return Math.min(100, Math.round(average * 10) / 10); // Round to 1 decimal
}

/**
 * Calculate overall accuracy across modules
 *
 * @param moduleResults - Array of module results
 * @returns Overall accuracy (0-1)
 */
export function calculateOverallAccuracy(moduleResults: ModuleResult[]): number {
  if (moduleResults.length === 0) return 0;

  let totalCorrect = 0;
  let totalQuestions = 0;

  moduleResults.forEach(result => {
    const requiredCorrect = result.requiredCorrect;
    const requiredTotal = result.requiredTotal;
    const extraCorrect = result.extraCorrect;
    const extraTotal = result.extraTotal;

    // For required questions, consider all answers
    const totalInRequired = requiredTotal;
    const correctInRequired = requiredCorrect;

    // For extra questions, only count if user attempted them
    const totalInExtra = extraTotal;
    const correctInExtra = extraCorrect;

    totalCorrect += correctInRequired + correctInExtra;
    totalQuestions += totalInRequired + totalInExtra;
  });

  if (totalQuestions === 0) return 0;
  return totalCorrect / totalQuestions;
}

/**
 * Generate a detailed module result
 *
 * @param moduleType - Type of module
 * @param requiredCorrect - Correct in required questions
 * @param requiredTotal - Total required questions
 * @param extraCorrect - Correct in extra questions
 * @param extraTotal - Total extra questions
 * @param difficulty - Current difficulty coefficient
 * @returns Module result object
 */
export function generateModuleResult(
  moduleType: ModuleType,
  requiredCorrect: number,
  requiredTotal: number,
  extraCorrect: number,
  extraTotal: number,
  difficulty: number
): ModuleResult {
  const baseScore = calculateBaseScore(requiredCorrect, requiredTotal, difficulty);
  const extraScore = calculateExtraScore(extraCorrect, extraTotal, difficulty);
  const score = baseScore + extraScore;

  const totalCorrect = requiredCorrect + extraCorrect;
  const totalQuestions = requiredTotal + extraTotal;
  const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;

  return {
    moduleType,
    requiredCorrect,
    requiredTotal,
    extraCorrect,
    extraTotal,
    score: Math.round(score * 10) / 10,
    accuracy,
    baseScore: Math.round(baseScore * 10) / 10,
    extraScore: Math.round(extraScore * 10) / 10,
  };
}

/**
 * Get difficulty level from difficulty coefficient
 *
 * @param difficulty - Current difficulty coefficient (0.8-5.9)
 * @returns Difficulty level object
 */
export function getDifficultyLevel(difficulty: number): DifficultyLevel | null {
  for (const [key, level] of Object.entries(DIFFICULTY_LEVELS)) {
    if (difficulty >= level.minDifficulty && difficulty <= level.maxDifficulty) {
      return level;
    }
  }
  return null;
}

/**
 * Calculate default question count for a module based on difficulty
 * This is a placeholder - actual implementation should come from question bank
 *
 * @param moduleType - Type of module
 * @param difficulty - Current difficulty coefficient
 * @returns Default question count for the module
 */
export function getDefaultQuestionCount(moduleType: ModuleType, difficulty: number): number {
  // Default quotas based on PRD requirements
  const defaultQuotas: Record<ModuleType, number> = {
    vocabulary: 15,
    grammar: 15,
    reading: 10,
    listening: 10,
    error_review: 10,
    part_b: 5,
  };

  return defaultQuotas[moduleType] || 10;
}
