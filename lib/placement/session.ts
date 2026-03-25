import { randomUUID } from 'crypto';

type Grade = 'form3' | 'form4' | 'form5' | 'form6';
type QuestionType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

interface QuestionData {
  id: string;
  type: QuestionType;
  content: string;
  options: string[] | null;
  difficulty: number;
}

interface Session {
  userId: string | null;
  grade: Grade;
  questions: QuestionData[];
  answers: Array<{
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    questionType: QuestionType;
    difficulty: number;
  }>;
  currentQuestionIndex: number;
  createdAt: Date;
}

// TODO: In production, replace with Redis or database session storage
const sessions = new Map<string, Session>();

export function createSession(data: Omit<Session, 'answers' | 'currentQuestionIndex' | 'createdAt'>): string {
  const sessionId = randomUUID();
  sessions.set(sessionId, {
    ...data,
    answers: [],
    currentQuestionIndex: 0,
    createdAt: new Date(),
  });
  return sessionId;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function updateSession(sessionId: string, updates: Partial<Session>): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;

  sessions.set(sessionId, { ...session, ...updates });
  return true;
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export type { Session, QuestionData, Grade, QuestionType };
