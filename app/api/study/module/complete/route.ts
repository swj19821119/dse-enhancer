import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

type ModuleType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'error_review' | 'part_b';

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

  const errorQuestions = await prisma.userErrorQuestion.findMany({
    where: { userId },
    take: count,
    orderBy: { errorCount: 'desc' },
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
    const { session_id, module_type, score } = body;

    if (!session_id || !module_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: session_id, module_type',
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

    const session = await prisma.studySession.findUnique({
      where: { id: session_id },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 404 }
      );
    }

    if (!session.modules) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session has no modules configured',
        },
        { status: 400 }
      );
    }

    const modules = JSON.parse(session.modules);
    const currentModuleIndex = session.currentModule;

    if (currentModuleIndex >= modules.length) {
      return NextResponse.json(
        {
          success: true,
          data: {
            session_complete: true,
          },
          message: "操作成功"
        },
        { status: 200 }
      );
    }

    const nextModuleIndex = currentModuleIndex + 1;

    if (nextModuleIndex >= modules.length) {
      await prisma.studySession.update({
        where: { id: session_id },
        data: {
          finishedAt: new Date(),
        },
      });

      if (userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingRecord = await prisma.dailyStudyRecord.findFirst({
          where: {
            userId,
            studyDate: today,
          },
        });

        const totalMinutes = Math.round((new Date().getTime() - session.startedAt.getTime()) / 60000);

        if (existingRecord) {
          await prisma.dailyStudyRecord.update({
            where: { id: existingRecord.id },
            data: {
              completed: true,
              totalMinutes: existingRecord.totalMinutes + totalMinutes,
            },
          });
        } else {
          await prisma.dailyStudyRecord.create({
            data: {
              userId,
              studyDate: today,
              totalMinutes,
              completed: true,
            },
          });
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            session_complete: true,
          },
          message: "操作成功"
        },
        { status: 200 }
      );
    }

    const nextModule = modules[nextModuleIndex];
    let nextQuestions: any[] = [];

    if (nextModule.type === 'error_review') {
      nextQuestions = await fetchErrorReviewQuestions(userId, nextModule.questionsCount);
    } else if (nextModule.questionsCount > 0) {
      nextQuestions = await fetchQuestionsForModule(
        userId,
        nextModule.type,
        nextModule.questionsCount
      );
    }

    await prisma.studySession.update({
      where: { id: session_id },
      data: {
        currentModule: nextModuleIndex,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          next_module: nextModule.type,
          questions: nextQuestions,
          module_time: nextModule.timeMinutes * 60,
          session_complete: false,
        },
        message: "操作成功"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to complete module:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete module',
      },
      { status: 500 }
    );
  }
}
