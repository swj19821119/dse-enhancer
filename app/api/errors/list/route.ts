import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: string;
  email: string;
}

interface ListResponse {
  code: 0 | 401 | 500;
  data: {
    errors: Array<{
      id: string;
      question_id: string;
      question_type: string;
      question_content: string;
      question_difficulty: number;
      question_topic?: string | null;
      error_count: number;
      stage: number;
      next_review: string;
      is_mastered: boolean;
      last_wrong_at: string;
      created_at: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      has_more: boolean;
    };
  } | null;
  message: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const errorResponse: ListResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      const errorResponse: ListResponse = {
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
      const errorResponse: ListResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = payload.userId;
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const type = searchParams.get('type');
    const mastered = searchParams.get('mastered');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (topic) {
      where.question = {
        topic,
      };
    }

    if (type) {
      where.question = {
        ...where.question,
        type,
      };
    }

    if (mastered !== null) {
      where.isMastered = mastered === 'true';
    }

    const [errors, total] = await Promise.all([
      prisma.userErrorQuestion.findMany({
        where,
        include: {
          question: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.userErrorQuestion.count({ where }),
    ]);

    const formattedErrors = errors.map((error) => ({
      id: error.id,
      question_id: error.questionId,
      question_type: error.question.type,
      question_content: error.question.content,
      question_difficulty: error.question.difficulty,
      question_topic: error.question.topic,
      error_count: error.errorCount,
      stage: error.stage,
      next_review: error.nextReview.toISOString(),
      is_mastered: error.isMastered,
      last_wrong_at: error.lastWrongAt.toISOString(),
      created_at: error.createdAt.toISOString(),
    }));

    const successResponse: ListResponse = {
      code: 0,
      data: {
        errors: formattedErrors,
        pagination: {
          page,
          limit,
          total,
          has_more: skip + formattedErrors.length < total,
        },
      },
      message: '获取错题列表成功',
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch error list:', error);
    const errorResponse: ListResponse = {
      code: 500,
      data: null,
      message: '获取错题列表失败，请稍后重试',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
