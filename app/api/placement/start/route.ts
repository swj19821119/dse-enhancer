import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createSession, type QuestionData } from '@/lib/placement/session-db';

export const dynamic = 'force-dynamic';

type Grade = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6';
type QuestionType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

const difficultyMap: Record<Grade, number> = {
  p1: 1.0,
  p2: 1.2,
  p3: 1.4,
  p4: 1.6,
  p5: 1.8,
  p6: 2.0,
  f1: 2.0,
  f2: 2.2,
  f3: 2.5,
  f4: 3.0,
  f5: 3.5,
  f6: 4.0,
};

async function fetchQuestionsByDifficulty(difficulty: number, types: QuestionType[], count: number): Promise<QuestionData[]> {
  const questions = await prisma.question.findMany({
    where: {
      difficulty,
      type: {
        in: types,
      },
    },
    take: count * 3,
  });

  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => ({
    id: q.id,
    type: q.type as QuestionType,
    content: q.content,
    options: q.options ? JSON.parse(q.options) : null,
    difficulty: q.difficulty,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grade } = body;

    const validGrades: Grade[] = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6'];
    if (!grade || !validGrades.includes(grade)) {
      return NextResponse.json(
        {
          success: false,
          error: '年级参数无效，必须是 p1/p2/p3/p4/p5/p6/f1/f2/f3/f4/f5/f6 之一'
        },
        { status: 422 }
      );
    }

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    }

    const initialDifficulty = difficultyMap[grade as Grade];

    const questionTypes: QuestionType[] = ['vocabulary', 'grammar', 'reading'];
    const questionsPerType = 5;
    const allQuestions: QuestionData[] = [];

    for (const type of questionTypes) {
      const typeQuestions = await fetchQuestionsByDifficulty(
        initialDifficulty,
        [type],
        questionsPerType
      );
      allQuestions.push(...typeQuestions);
    }

    if (allQuestions.length < 15) {
      return NextResponse.json(
        {
          success: false,
          error: '题库题目不足，请联系管理员'
        },
        { status: 500 }
      );
    }

    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    const sessionId = await createSession({
      userId,
      grade,
      questions: shuffledQuestions,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId,
          questions: shuffledQuestions,
        },
        message: '开始测试'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to start placement test:', error);
    return NextResponse.json(
      {
        success: false,
        error: '开始测试失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
