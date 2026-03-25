import prisma from '@/lib/prisma';
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
  id: string;
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

export async function createSession(data: Omit<Session, 'id' | 'answers' | 'currentQuestionIndex' | 'createdAt'>): Promise<string> {
  const sessionId = randomUUID();

  try {
    await prisma.$executeRaw`
      INSERT INTO PlacementSession (id, userId, grade, questions, answers, currentQuestionIndex, createdAt)
      VALUES (${sessionId}, ${data.userId}, ${data.grade}, ${JSON.stringify(data.questions)}, ${JSON.stringify([])}, 0, ${new Date()})
    `;
  } catch (error) {
    console.error('Failed to create session:', error);
  }

  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const rows = await prisma.$queryRaw<Array<{
      id: string;
      userId: string | null;
      grade: string;
      questions: string;
      answers: string;
      currentQuestionIndex: number;
      createdAt: Date;
    }>>`
      SELECT * FROM PlacementSession WHERE id = ${sessionId}
    `;

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      userId: row.userId,
      grade: row.grade as Grade,
      questions: JSON.parse(row.questions) as QuestionData[],
      answers: JSON.parse(row.answers) as Session['answers'],
      currentQuestionIndex: row.currentQuestionIndex,
      createdAt: row.createdAt,
    };
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<boolean> {
  try {
    const session = await getSession(sessionId);
    if (!session) return false;

    const merged = { ...session, ...updates };

    await prisma.$executeRaw`
      UPDATE PlacementSession
      SET answers = ${JSON.stringify(merged.answers)},
          currentQuestionIndex = ${merged.currentQuestionIndex}
      WHERE id = ${sessionId}
    `;

    return true;
  } catch (error) {
    console.error('Failed to update session:', error);
    return false;
  }
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await prisma.$executeRaw`
      DELETE FROM PlacementSession WHERE id = ${sessionId}
    `;
    return true;
  } catch (error) {
    console.error('Failed to delete session:', error);
    return false;
  }
}

export type { Session, QuestionData, Grade, QuestionType };
