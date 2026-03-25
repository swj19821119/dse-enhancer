/**
 * Ebbinghaus 8-Stage Spaced Repetition System
 *
 * Schedule:
 * Stage 1: 5 minutes
 * Stage 2: 30 minutes
 * Stage 3: 12 hours
 * Stage 4: 1 day
 * Stage 5: 2 days
 * Stage 6: 4 days
 * Stage 7: 7 days
 * Stage 8: 15 days
 *
 * Rules:
 * - If answered CORRECT at any stage: advance to next stage
 * - If answered WRONG at any stage: go back 2 stages (min stage 1)
 * - If answered CORRECT at stage 8: mark as mastered, remove from active review
 */

/**
 * Get the next review time based on the current stage
 * @param stage - Current stage (1-8)
 * @param baseTime - Base time to calculate from (defaults to now)
 * @returns Next review time as Date object
 */
export function getNextReviewTime(stage: number, baseTime: Date = new Date()): Date {
  // Intervals in minutes for each stage
  const intervals = [
    5,           // Stage 1: 5 minutes
    30,          // Stage 2: 30 minutes
    12 * 60,     // Stage 3: 12 hours
    24 * 60,     // Stage 4: 1 day
    2 * 24 * 60, // Stage 5: 2 days
    4 * 24 * 60, // Stage 6: 4 days
    7 * 24 * 60, // Stage 7: 7 days
    15 * 24 * 60 // Stage 8: 15 days
  ];

  // Validate stage
  const validStage = Math.max(1, Math.min(8, stage));
  const minutes = intervals[validStage - 1] || intervals[0];

  return new Date(baseTime.getTime() + minutes * 60 * 1000);
}

/**
 * Adjust stage based on review result
 * @param currentStage - Current stage before review
 * @param isCorrect - Whether the answer was correct
 * @returns New stage (1-8)
 */
export function adjustStage(currentStage: number, isCorrect: boolean): number {
  if (isCorrect) {
    // Correct answer: advance to next stage (max 8)
    return Math.min(8, currentStage + 1);
  } else {
    // Wrong answer: go back 2 stages (min 1)
    return Math.max(1, currentStage - 2);
  }
}

/**
 * Get the time interval for a stage in minutes
 * @param stage - Stage number (1-8)
 * @returns Time interval in minutes
 */
export function getStageInterval(stage: number): number {
  const intervals = [
    5,           // Stage 1: 5 minutes
    30,          // Stage 2: 30 minutes
    12 * 60,     // Stage 3: 12 hours
    24 * 60,     // Stage 4: 1 day
    2 * 24 * 60, // Stage 5: 2 days
    4 * 24 * 60, // Stage 6: 4 days
    7 * 24 * 60, // Stage 7: 7 days
    15 * 24 * 60 // Stage 8: 15 days
  ];

  const validStage = Math.max(1, Math.min(8, stage));
  return intervals[validStage - 1] || intervals[0];
}

/**
 * Get human-readable stage description
 * @param stage - Stage number (1-8)
 * @returns Human-readable description
 */
export function getStageDescription(stage: number): string {
  const descriptions: Record<number, string> = {
    1: '初次复习',
    2: '第二次复习',
    3: '第三次复习',
    4: '第四次复习',
    5: '第五次复习',
    6: '第六次复习',
    7: '第七次复习',
    8: '最终复习',
  };

  return descriptions[stage] || '未知阶段';
}

/**
 * Get human-readable time interval for a stage
 * @param stage - Stage number (1-8)
 * @returns Human-readable time interval
 */
export function getStageIntervalText(stage: number): string {
  const intervals: Record<number, string> = {
    1: '5分钟',
    2: '30分钟',
    3: '12小时',
    4: '1天',
    5: '2天',
    6: '4天',
    7: '7天',
    8: '15天',
  };

  return intervals[stage] || '未知';
}

/**
 * Calculate mastery progress percentage
 * @param stage - Current stage (1-8)
 * @returns Progress percentage (0-100)
 */
export function getMasteryProgress(stage: number): number {
  const validStage = Math.max(1, Math.min(8, stage));
  return Math.round((validStage / 8) * 100);
}

/**
 * Check if an error should be considered mastered
 * @param stage - Current stage
 * @param isCorrect - Whether the last review was correct
 * @returns True if mastered
 */
export function isMastered(stage: number, isCorrect: boolean): boolean {
  return stage === 8 && isCorrect;
}
