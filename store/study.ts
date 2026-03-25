import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDefaultQuestionCount } from '@/lib/scoring';

export type ModuleType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'error_review' | 'part_b';

export interface Question {
  id: string;
  type: string;
  content: string;
  options?: string[] | Record<string, string>;
  answer?: string;
  explanation?: string;
  difficulty: number;
  topic?: string;
}

export interface ModuleProgress {
  completed: number;
  total: number;
  score?: number;
  correctAnswers?: number;
}

export interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: number;
}

export interface ModuleScoreData {
  requiredCorrect: number;
  requiredTotal: number;
  extraCorrect: number;
  extraTotal: number;
  score: number;
  baseScore: number;
  extraScore: number;
}

export interface StudyState {
  // Session state
  session_id: string | null;
  mode: 'relaxed' | 'diligent';
  is_paused: boolean;
  is_complete: boolean;

  // Current module state
  current_module: ModuleType | null;
  current_question_index: number;
  current_question: Question | null;
  questions_in_module: Question[];

  // Progress tracking
  module_progress: Record<ModuleType, ModuleProgress>;
  questions_answered: number;
  questions_total: number;

  // Timer state
  time_remaining: number;
  module_time_remaining: number;
  timer_interval: number | null;

  // Scoring state
  current_module_answers: AnswerRecord[];
  current_module_score: ModuleScoreData | null;
  current_difficulty: number;

  // Actions
  startSession: (mode: 'relaxed' | 'diligent') => Promise<void>;
  submitAnswer: (answer: string, timeSpent: number) => Promise<void>;
  nextQuestion: () => void;
  completeModule: (moduleType: ModuleType, score: number) => Promise<{
    session_complete: boolean;
    next_module?: ModuleType;
    questions?: Question[];
  } | undefined>;
  pauseSession: () => void;
  resumeSession: () => void;
  nextModule: (nextModuleType: ModuleType, questions: Question[]) => void;
  completeSession: () => void;
  loadProgress: (savedState: Partial<StudyState>) => void;
  saveProgress: () => void;
  clearSession: () => void;
  updateTimer: () => void;
  setModuleQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question, index: number) => void;

  // Scoring actions
  calculateModuleScore: (difficulty: number) => Promise<void>;
  resetModuleScore: () => void;
  setDifficulty: (difficulty: number) => void;
}

const INITIAL_MODULE_PROGRESS: Record<ModuleType, ModuleProgress> = {
  vocabulary: { completed: 0, total: 0 },
  grammar: { completed: 0, total: 0 },
  reading: { completed: 0, total: 0 },
  listening: { completed: 0, total: 0 },
  error_review: { completed: 0, total: 0 },
  part_b: { completed: 0, total: 0 },
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      // Initial state
      session_id: null,
      mode: 'relaxed',
      is_paused: false,
      is_complete: false,
      current_module: null,
      current_question_index: 0,
      current_question: null,
      questions_in_module: [],
      module_progress: INITIAL_MODULE_PROGRESS,
      questions_answered: 0,
      questions_total: 0,
      time_remaining: 0,
      module_time_remaining: 0,
      timer_interval: null,
      current_module_answers: [],
      current_module_score: null,
      current_difficulty: 2.0,

      // Actions
      startSession: async (mode) => {
        try {
          const response = await fetch('/api/study/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode }),
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to start session');
          }

          set({
            session_id: data.session_id,
            mode,
            is_paused: false,
            is_complete: false,
            current_module: data.first_module,
            questions_in_module: data.questions || [],
            current_question: data.questions?.[0] || null,
            current_question_index: 0,
            time_remaining: mode === 'relaxed' ? 40 * 60 : 60 * 60,
            module_time_remaining: data.module_time || 10 * 60,
          });
        } catch (error) {
          console.error('Failed to start session:', error);
          throw error;
        }
      },

      submitAnswer: async (answer, timeSpent) => {
        const { session_id, current_question, current_module } = get();
        if (!session_id || !current_question || !current_module) return;

        const isCorrect = answer === current_question.answer;

        try {
          const response = await fetch('/api/study/session/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id,
              question_id: current_question.id,
              answer,
              time_spent: timeSpent,
            }),
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to submit answer');
          }

          set((state) => ({
            questions_answered: state.questions_answered + 1,
            current_module_answers: [
              ...state.current_module_answers,
              {
                questionId: current_question.id,
                userAnswer: answer,
                isCorrect,
                timeSpent,
                timestamp: Date.now(),
              },
            ],
          }));
        } catch (error) {
          console.error('Failed to submit answer:', error);
          throw error;
        }
      },

      nextQuestion: () => {
        set((state) => {
          const nextIndex = state.current_question_index + 1;
          if (nextIndex < state.questions_in_module.length) {
            return {
              current_question_index: nextIndex,
              current_question: state.questions_in_module[nextIndex],
            };
          }
          return {};
        });
      },

      completeModule: async (moduleType, score) => {
        const { session_id } = get();
        if (!session_id) return;

        try {
          const response = await fetch('/api/study/module/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id,
              module_type: moduleType,
              score,
            }),
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to complete module');
          }

          set((state) => ({
            module_progress: {
              ...state.module_progress,
              [moduleType]: {
                completed: state.questions_in_module.length,
                total: state.questions_in_module.length,
                score,
              },
            },
          }));

          return data;
        } catch (error) {
          console.error('Failed to complete module:', error);
          throw error;
        }
      },

      pauseSession: () => {
        const { timer_interval } = get();
        if (timer_interval) {
          clearInterval(timer_interval);
        }

        set((state) => ({
          is_paused: true,
          timer_interval: null,
        }));

        get().saveProgress();
      },

      resumeSession: () => {
        set({
          is_paused: false,
        });
      },

      nextModule: (nextModuleType, questions) => {
        set({
          current_module: nextModuleType,
          questions_in_module: questions,
          current_question: questions[0] || null,
          current_question_index: 0,
          module_time_remaining: get().mode === 'relaxed' ? 10 * 60 : 10 * 60,
          current_module_answers: [],
          current_module_score: null,
        });
      },

      completeSession: () => {
        const { timer_interval } = get();
        if (timer_interval) {
          clearInterval(timer_interval);
        }

        set({
          is_complete: true,
          timer_interval: null,
          is_paused: true,
        });

        get().clearSession();
      },

      loadProgress: (savedState) => {
        set(savedState);
      },

      saveProgress: () => {
        const state = get();
        const toSave = {
          session_id: state.session_id,
          mode: state.mode,
          current_module: state.current_module,
          current_question_index: state.current_question_index,
          questions_in_module: state.questions_in_module,
          module_progress: state.module_progress,
          questions_answered: state.questions_answered,
          questions_total: state.questions_total,
          time_remaining: state.time_remaining,
          module_time_remaining: state.module_time_remaining,
          is_paused: state.is_paused,
        };
        localStorage.setItem('study_session', JSON.stringify(toSave));
      },

      clearSession: () => {
        localStorage.removeItem('study_session');
      },

      updateTimer: () => {
        set((state) => {
          if (state.is_paused || state.is_complete) return {};

          const newTimeRemaining = Math.max(0, state.time_remaining - 1);
          const newModuleTimeRemaining = Math.max(0, state.module_time_remaining - 1);

          return {
            time_remaining: newTimeRemaining,
            module_time_remaining: newModuleTimeRemaining,
          };
        });
      },

      setModuleQuestions: (questions) => {
        set({
          questions_in_module: questions,
          current_question: questions[0] || null,
          current_question_index: 0,
        });
      },

      setCurrentQuestion: (question, index) => {
        set({
          current_question: question,
          current_question_index: index,
        });
      },

      // Scoring actions
      calculateModuleScore: async (difficulty) => {
        const { current_module_answers, current_module } = get();
        if (current_module_answers.length === 0 || !current_module) return;

        const defaultTotal = getDefaultQuestionCount(current_module, difficulty);
        const requiredAnswers = current_module_answers.slice(0, defaultTotal);
        const extraAnswers = current_module_answers.slice(defaultTotal);

        const requiredCorrect = requiredAnswers.filter(a => a.isCorrect).length;
        const requiredTotal = requiredAnswers.length;
        const extraCorrect = extraAnswers.filter(a => a.isCorrect).length;
        const extraTotal = extraAnswers.length;

        try {
          const response = await fetch('/api/scoring/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              module_type: current_module,
              required_correct: requiredCorrect,
              required_total: requiredTotal,
              extra_correct: extraCorrect,
              extra_total: extraTotal,
              difficulty,
            }),
          });

          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || 'Failed to calculate score');
          }

          set({
            current_module_score: {
              requiredCorrect,
              requiredTotal,
              extraCorrect,
              extraTotal,
              score: data.data.moduleResult.score,
              baseScore: data.data.moduleResult.baseScore,
              extraScore: data.data.moduleResult.extraScore,
            },
          });
        } catch (error) {
          console.error('Failed to calculate module score:', error);
        }
      },

      resetModuleScore: () => {
        set({
          current_module_answers: [],
          current_module_score: null,
        });
      },

      setDifficulty: (difficulty) => {
        set({ current_difficulty: difficulty });
      },
    }),
    {
      name: 'study-storage',
      partialize: (state) => ({
        session_id: state.session_id,
        mode: state.mode,
        current_module: state.current_module,
        current_question_index: state.current_question_index,
        questions_in_module: state.questions_in_module,
        module_progress: state.module_progress,
        questions_answered: state.questions_answered,
        questions_total: state.questions_total,
        time_remaining: state.time_remaining,
        module_time_remaining: state.module_time_remaining,
        is_paused: state.is_paused,
        current_module_answers: state.current_module_answers,
        current_module_score: state.current_module_score,
        current_difficulty: state.current_difficulty,
      }),
    }
  )
);
