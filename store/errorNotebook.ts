import { create } from 'zustand';

export interface ErrorRecord {
  id: string;
  question_id: string;
  question_type: string;
  question_content: string;
  question_options?: string[];
  question_answer?: string;
  question_explanation?: string;
  question_difficulty: number;
  question_topic?: string;
  error_count: number;
  stage: number;
  last_review: string | null;
  next_review: string;
  created_at: string;
}

export interface ErrorStats {
  total_errors: number;
  mastered_count: number;
  due_today_count: number;
  stage_breakdown: {
    stage: number;
    count: number;
  }[];
  review_history_total: number;
}

export interface ErrorReviewResult {
  error_record: {
    id: string;
    question_id: string;
    error_count: number;
    stage: number;
    last_review: string;
    next_review: string;
    is_mastered: boolean;
  } | null;
  was_correct: boolean;
  stage_changed: {
    from: number;
    to: number;
  };
}

interface ErrorNotebookState {
  dueErrors: ErrorRecord[];
  currentReviewIndex: number;
  stats: ErrorStats | null;
  isLoading: boolean;
  error: string | null;

  loadDueErrors: (limit?: number) => Promise<void>;
  submitReview: (errorId: string, isCorrect: boolean) => Promise<ErrorReviewResult | null>;
  loadStats: () => Promise<void>;
  recordError: (questionId: string, userAnswer: string, correctAnswer: string, sessionId?: string) => Promise<void>;
  resetReview: () => void;
  clearError: () => void;
}

export const useErrorNotebookStore = create<ErrorNotebookState>((set, get) => ({
  dueErrors: [],
  currentReviewIndex: 0,
  stats: null,
  isLoading: false,
  error: null,

  loadDueErrors: async (limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/errors/due?limit=' + limit, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      const data = await response.json();

      if (data.code === 0) {
        set({
          dueErrors: data.data.errors,
          currentReviewIndex: 0,
          isLoading: false,
        });
      } else {
        set({
          error: data.message || 'Failed to load due errors',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load due errors:', error);
      set({
        error: 'Failed to load due errors',
        isLoading: false,
      });
    }
  },

  submitReview: async (errorId: string, isCorrect: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/errors/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          error_id: errorId,
          is_correct: isCorrect,
        }),
      });

      const data = await response.json();

      if (data.code === 0) {
        const result = data.data as ErrorReviewResult;

        if (result.was_correct) {
          set((state) => {
            const newErrors = state.dueErrors.filter((e) => e.id !== errorId);
            return {
              dueErrors: newErrors,
              currentReviewIndex: Math.min(state.currentReviewIndex, newErrors.length - 1),
              isLoading: false,
            };
          });
        } else {
          set({
            currentReviewIndex: Math.min(get().currentReviewIndex + 1, get().dueErrors.length - 1),
            isLoading: false,
          });
        }

        return result;
      } else {
        set({
          error: data.message || 'Failed to submit review',
          isLoading: false,
        });
        return null;
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      set({
        error: 'Failed to submit review',
        isLoading: false,
      });
      return null;
    }
  },

  loadStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/errors/stats', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      const data = await response.json();

      if (data.code === 0) {
        set({
          stats: data.data,
          isLoading: false,
        });
      } else {
        set({
          error: data.message || 'Failed to load stats',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      set({
        error: 'Failed to load stats',
        isLoading: false,
      });
    }
  },

  recordError: async (questionId: string, userAnswer: string, correctAnswer: string, sessionId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/errors/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          question_id: questionId,
          user_answer: userAnswer,
          correct_answer: correctAnswer,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (data.code === 0) {
        set({ isLoading: false });
      } else {
        set({
          error: data.message || 'Failed to record error',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to record error:', error);
      set({
        error: 'Failed to record error',
        isLoading: false,
      });
    }
  },

  resetReview: () => {
    set({
      currentReviewIndex: 0,
    });
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));
