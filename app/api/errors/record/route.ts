import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { getNextReviewTime } from '@/lib/ebbinghaus';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: string;
  email: string;
}

interface RecordRequestBody {
  question_id: string;
  user_answer: string;
  correct_answer: string;
  session_id?: string;
}

interface RecordResponse {
  success: boolean;
  data: {
    error_record_id?: string;
    stage?: number;
    next_review?: string;
    error_count?: number;
  } | null;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const errorResponse: RecordResponse = {
        success: false,
        data: null,
        error: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      const errorResponse: RecordResponse = {
        success: false,
        data: null,
        error: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const token = tokenMatch[1];
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      console.error('Token验证失败:', error);
      const errorResponse: RecordResponse = {
        success: false,
        data: null,
        error: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = payload.userId;
    const body: RecordRequestBody = await request.json();
    const { question_id, user_answer, correct_answer, session_id } = body;

    if (!question_id) {
      const errorResponse: RecordResponse = {
        success: false,
        data: null,
        error: '缺少必要参数: question_id',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: question_id },
    });

    if (!question) {
      const errorResponse: RecordResponse = {
        success: false,
        data: null,
        error: '题目不存在',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const existingError = await prisma.userErrorQuestion.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId: question_id,
        },
      },
    });

    let errorRecord;

    if (existingError) {
      errorRecord = await prisma.userErrorQuestion.update({
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
      errorRecord = await prisma.userErrorQuestion.create({
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

    const successResponse: RecordResponse = {
      success: true,
      data: {
        error_record_id: errorRecord.id,
        stage: errorRecord.stage,
        next_review: errorRecord.nextReview.toISOString(),
        error_count: errorRecord.errorCount,
      },
      message: '错题记录成功',
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Failed to record error:', error);
    const errorResponse: RecordResponse = {
      success: false,
      data: null,
      error: '记录错题失败，请稍后重试',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
