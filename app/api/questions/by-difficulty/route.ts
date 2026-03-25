import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { QuestionsByDifficultySchema } from '@/lib/schemas/question';

export const dynamic = 'force-dynamic';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          data: null,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = QuestionsByDifficultySchema.parse({
      target_difficulty: parseFloat(searchParams.get('target_difficulty') || '3'),
      count: parseInt(searchParams.get('count') || '10'),
      types: searchParams.get('types')?.split(',') || undefined,
    });

    const minDifficulty = Math.max(0.5, query.target_difficulty - 0.5);
    const maxDifficulty = Math.min(5.9, query.target_difficulty + 0.5);

    const where: any = {
      difficulty: {
        gte: minDifficulty,
        lte: maxDifficulty,
      },
      isApproved: true,
    };

    if (query.types && query.types.length > 0) {
      where.type = {
        in: query.types,
      };
    }

    const questions = await prisma.question.findMany({
      where,
      take: query.count,
      orderBy: { difficulty: 'asc' },
    });

    return NextResponse.json({
      code: 0,
      data: {
        questions,
        targetDifficulty: query.target_difficulty,
        actualRange: { min: minDifficulty, max: maxDifficulty },
        count: questions.length,
      },
    });
  } catch (error) {
    console.error('Failed to fetch questions by difficulty:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: 'Validation error',
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        code: 500,
        data: null,
        message: 'Failed to fetch questions by difficulty',
      },
      { status: 500 }
    );
  }
}
