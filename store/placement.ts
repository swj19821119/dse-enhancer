import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Grade = 'form3' | 'form4' | 'form5' | 'form6';
type QuestionType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

export interface QuestionData {
  id: string;
  type: QuestionType;
  content: string;
  options: string[] | null;
  difficulty: number;
}

export interface AnswerData {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  questionType: QuestionType;
  difficulty: number;
}

interface PlacementState {
  sessionId: string | null;
  grade: Grade | null;
  questions: QuestionData[];
  answers: AnswerData[];
  currentQuestionIndex: number;
  currentDifficulty: number;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
  resultId: string | null;

  setSessionId: (sessionId: string | null) => void;
  setGrade: (grade: Grade | null) => void;
  setQuestions: (questions: QuestionData[]) => void;
  setAnswers: (answers: AnswerData[]) => void;
  addAnswer: (answer: AnswerData) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setCurrentDifficulty: (difficulty: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setComplete: (isComplete: boolean) => void;
  setResultId: (resultId: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  grade: null,
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  currentDifficulty: 2,
  isLoading: false,
  error: null,
  isComplete: false,
  resultId: null,
};

export const usePlacementStore = create<PlacementState>()(
  persist(
    (set) => ({
      ...initialState,

      setSessionId: (sessionId) => set({ sessionId }),
      setGrade: (grade) => set({ grade }),
      setQuestions: (questions) => set({ questions }),
      setAnswers: (answers) => set({ answers }),
      addAnswer: (answer) =>
        set((state) => ({
          answers: [...state.answers, answer],
        })),
      setCurrentQuestionIndex: (currentQuestionIndex) =>
        set({ currentQuestionIndex }),
      setCurrentDifficulty: (currentDifficulty) => set({ currentDifficulty }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setComplete: (isComplete) => set({ isComplete }),
      setResultId: (resultId) => set({ resultId }),
      reset: () => set(initialState),
    }),
    {
      name: 'placement-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        grade: state.grade,
        questions: state.questions,
        answers: state.answers,
        currentQuestionIndex: state.currentQuestionIndex,
        currentDifficulty: state.currentDifficulty,
        isComplete: state.isComplete,
        resultId: state.resultId,
      }),
    }
  )
);
