import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { createSession, type QuestionData } from '@/lib/placement/session-db';

type Grade = 'form3' | 'form4' | 'form5' | 'form6';
type QuestionType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

const difficultyMap: Record<Grade, number> = {
  form3: 2,
  form4: 3,
  form5: 3,
  form6: 4,
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

    const validGrades: Grade[] = ['form3', 'form4', 'form5', 'form6'];
    if (!grade || !validGrades.includes(grade)) {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: '年级参数无效，必须是 form3/form4/form5/form6 之一'
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
          code: 500,
          data: null,
          message: '题库题目不足，请联系管理员'
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
        code: 0,
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
        code: 500,
        data: null,
        message: '开始测试失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
