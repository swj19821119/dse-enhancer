import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: string;
  email: string;
}

interface DueResponse {
  code: 0 | 401 | 500;
  data: {
    errors: Array<{
      id: string;
      question_id: string;
      question_type: string;
      question_content: string;
      question_options?: string[] | undefined;
      question_answer?: string | null | undefined;
      question_explanation?: string | null | undefined;
      question_difficulty: number;
      error_count: number;
      stage: number;
      last_review: string | null;
      next_review: string;
      created_at: string;
    }>;
    total_due: number;
  } | null;
  message: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const errorResponse: DueResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      const errorResponse: DueResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const token = tokenMatch[1];
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      console.error('Token验证失败:', error);
      const errorResponse: DueResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = payload.userId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const now = new Date();

    const dueErrors = await prisma.userErrorQuestion.findMany({
      where: {
        userId,
        nextReview: {
          lte: now,
        },
        isMastered: false,
      },
      include: {
        question: true,
      },
      orderBy: {
        nextReview: 'asc',
      },
      take: limit,
    });

    const formattedErrors = dueErrors.map((error) => {
      let options: string[] | undefined;
      if (error.question.options) {
        try {
          options = JSON.parse(error.question.options);
        } catch (e) {
          options = undefined;
        }
      }

      return {
        id: error.id,
        question_id: error.questionId,
        question_type: error.question.type,
        question_content: error.question.content,
        question_options: options,
        question_answer: error.question.answer,
        question_explanation: error.question.explanation,
        question_difficulty: error.question.difficulty,
        error_count: error.errorCount,
        stage: error.stage,
        last_review: error.lastReview?.toISOString() || null,
        next_review: error.nextReview.toISOString(),
        created_at: error.createdAt.toISOString(),
      };
    });

    const successResponse: DueResponse = {
      code: 0,
      data: {
        errors: formattedErrors,
        total_due: formattedErrors.length,
      },
      message: '获取待复习错题成功',
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch due errors:', error);
    const errorResponse: DueResponse = {
      code: 500,
      data: null,
      message: '获取待复习错题失败，请稍后重试',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
