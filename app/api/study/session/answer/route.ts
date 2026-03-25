import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getNextReviewTime } from '@/lib/ebbinghaus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, question_id, answer, time_spent } = body;

    if (!session_id || !question_id || answer === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: session_id, question_id, answer',
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

    const question = await prisma.question.findUnique({
      where: { id: question_id },
    });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question not found',
        },
        { status: 404 }
      );
    }

    const isCorrect = answer === question.answer;

    await prisma.userAnswer.create({
      data: {
        userId: userId || 'guest',
        questionId: question_id,
        userAnswer: JSON.stringify(answer),
        isCorrect,
        score: isCorrect ? 1 : 0,
      },
    });

    if (!isCorrect && userId) {
      const existingError = await prisma.userErrorQuestion.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId: question_id,
          },
        },
      });

      if (existingError) {
        await prisma.userErrorQuestion.update({
          where: { id: existingError.id },
          data: {
            errorCount: existingError.errorCount + 1,
            lastWrongAt: new Date(),
            stage: 1,
            nextReview: getNextReviewTime(1),
            isMastered: false,
          },
        });
      } else {
        const now = new Date();
        await prisma.userErrorQuestion.create({
          data: {
            userId,
            questionId: question_id,
            errorCount: 1,
            stage: 1,
            nextReview: getNextReviewTime(1, now),
            lastWrongAt: now,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          is_correct: isCorrect,
          explanation: question.explanation,
        },
        message: "操作成功"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to submit answer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit answer',
      },
      { status: 500 }
    );
  }
}
