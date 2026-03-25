import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const session = await prisma.studySession.findUnique({
      where: { id },
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

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    }

    if (userId && session.userId !== userId && session.userId !== 'guest') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 403 }
      );
    }

    const modules = session.modules ? JSON.parse(session.modules) : [];
    const currentModuleData = modules[session.currentModule];

    const answers = await prisma.userAnswer.findMany({
      where: {
        userId: session.userId,
        createdAt: {
          gte: session.startedAt,
        },
      },
    });

    const totalAnswered = answers.length;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const score = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    const isComplete = !!session.finishedAt;

    const totalTimeElapsed = isComplete
      ? Math.round((session.finishedAt!.getTime() - session.startedAt.getTime()) / 1000)
      : Math.round((new Date().getTime() - session.startedAt.getTime()) / 1000);

    return NextResponse.json(
      {
        success: true,
        session: {
          id: session.id,
          current_module: session.currentModule,
          current_module_type: currentModuleData?.type || null,
          total_modules: modules.length,
          is_complete: isComplete,
          started_at: session.startedAt,
          finished_at: session.finishedAt,
        },
        progress: {
          current_module: session.currentModule + 1,
          total_modules: modules.length,
          questions_answered: totalAnswered,
          score: score,
        },
        time: {
          elapsed_seconds: totalTimeElapsed,
          remaining_seconds: 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to get session status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get session status',
      },
      { status: 500 }
    );
  }
}
