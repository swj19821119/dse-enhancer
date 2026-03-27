import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

type Mode = 'relaxed' | 'diligent';
type ModuleType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'error_review' | 'part_b';

interface ModuleConfig {
  type: ModuleType;
  questionsCount: number;
  timeMinutes: number;
}

const MODE_CONFIG: Record<Mode, ModuleConfig[]> = {
  relaxed: [
    { type: 'vocabulary', questionsCount: 15, timeMinutes: 10 },
    { type: 'grammar', questionsCount: 10, timeMinutes: 10 },
    { type: 'reading', questionsCount: 2, timeMinutes: 10 },
    { type: 'listening', questionsCount: 2, timeMinutes: 10 },
  ],
  diligent: [
    { type: 'vocabulary', questionsCount: 15, timeMinutes: 10 },
    { type: 'grammar', questionsCount: 10, timeMinutes: 10 },
    { type: 'reading', questionsCount: 2, timeMinutes: 10 },
    { type: 'listening', questionsCount: 2, timeMinutes: 10 },
    { type: 'error_review', questionsCount: 5, timeMinutes: 5 },
    { type: 'part_b', questionsCount: 0, timeMinutes: 15 },
  ],
};

async function fetchQuestionsForModule(
  userId: string | null,
  moduleType: ModuleType,
  count: number
) {
  let userLevel = 3;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentLevel: true },
    });
    userLevel = user?.currentLevel || 3;
  }

  const minDifficulty = Math.max(1, Math.floor(userLevel - 0.5));
  const maxDifficulty = Math.min(5, Math.ceil(userLevel + 0.5));

  const whereClause: any = {
    type: moduleType,
    difficulty: {
      gte: minDifficulty,
      lte: maxDifficulty,
    },
    isApproved: true,
  };

  let questions = await prisma.question.findMany({
    where: whereClause,
    take: count * 3,
  });

  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => ({
    id: q.id,
    type: q.type,
    content: q.content,
    options: q.options ? JSON.parse(q.options) : null,
    answer: q.answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    topic: q.topic,
  }));
}

async function fetchErrorReviewQuestions(
  userId: string | null,
  count: number
) {
  if (!userId) {
    return [];
  }

  const now = new Date();

  const errorQuestions = await prisma.userErrorQuestion.findMany({
    where: {
      userId,
      nextReview: {
        lte: now,
      },
      isMastered: false,
    },
    take: count,
    orderBy: { nextReview: 'asc' },
    include: {
      question: true,
    },
  });

  return errorQuestions
    .map((eq) => ({
      id: eq.question.id,
      type: eq.question.type,
      content: eq.question.content,
      options: eq.question.options ? JSON.parse(eq.question.options) : null,
      answer: eq.question.answer,
      explanation: eq.question.explanation,
      difficulty: eq.question.difficulty,
      topic: eq.question.topic,
    }))
    .slice(0, count);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;

    if (!mode || (mode !== 'relaxed' && mode !== 'diligent')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid mode. Must be "relaxed" or "diligent"',
        },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    }

    const config: ModuleConfig[] = MODE_CONFIG[mode as Mode];
    const firstModule = config[0];

    let firstModuleQuestions: any[];

    if (firstModule.type === 'error_review') {
      firstModuleQuestions = await fetchErrorReviewQuestions(userId, firstModule.questionsCount);
    } else {
      firstModuleQuestions = await fetchQuestionsForModule(
        userId,
        firstModule.type,
        firstModule.questionsCount
      );
    }

    const session = await prisma.studySession.create({
      data: {
        userId: userId || undefined,
        currentModule: 0,
        modules: JSON.stringify(config),
      },
    });

    const totalTimeMinutes = config.reduce((sum: number, m: ModuleConfig) => sum + m.timeMinutes, 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          session_id: session.id,
          mode,
          modules: config,
          first_module: firstModule.type,
          questions: firstModuleQuestions,
          module_time: firstModule.timeMinutes * 60,
          total_time: totalTimeMinutes * 60,
        },
        message: "操作成功"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to start study session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start study session',
      },
      { status: 500 }
    );
  }
}
