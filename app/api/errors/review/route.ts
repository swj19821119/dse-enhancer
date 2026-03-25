import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { adjustStage, getNextReviewTime, isMastered } from '@/lib/ebbinghaus';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: string;
  email: string;
}

interface ReviewRequestBody {
  error_id: string;
  is_correct: boolean;
}

interface ReviewResponse {
  code: 0 | 400 | 401 | 403 | 404 | 500;
  data: {
    error_record: {
      id: string;
      question_id: string;
      error_count: number;
      stage: number;
      last_review: string;
      next_review: string;
      is_mastered: boolean;
    } | null;
    was_correct: boolean;
    stage_changed: {
      from: number;
      to: number;
    };
  } | null;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const errorResponse: ReviewResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      const errorResponse: ReviewResponse = {
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
      const errorResponse: ReviewResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = payload.userId;
    const body: ReviewRequestBody = await request.json();
    const { error_id, is_correct } = body;

    if (!error_id || typeof is_correct !== 'boolean') {
      const errorResponse: ReviewResponse = {
        code: 400,
        data: null,
        message: '缺少必要参数: error_id 或 is_correct',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const errorRecord = await prisma.userErrorQuestion.findUnique({
      where: { id: error_id },
    });

    if (!errorRecord) {
      const errorResponse: ReviewResponse = {
        code: 404,
        data: null,
        message: '错题记录不存在',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    if (errorRecord.userId !== userId) {
      const errorResponse: ReviewResponse = {
        code: 403,
        data: null,
        message: '无权访问此错题记录',
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const oldStage = errorRecord.stage;
    const newStage = adjustStage(oldStage, is_correct);
    const now = new Date();
    const nextReview = getNextReviewTime(newStage, now);
    const mastered = isMastered(newStage, is_correct);

    await prisma.$transaction(async (tx) => {
      await tx.errorReview.create({
        data: {
          errorId: error_id,
          stageAtReview: oldStage,
          isCorrect: is_correct,
          reviewedAt: now,
        },
      });

      await tx.userErrorQuestion.update({
        where: { id: error_id },
        data: {
          stage: newStage,
          lastReview: now,
          nextReview,
          isMastered: mastered,
        },
      });
    });

    const successResponse: ReviewResponse = {
      code: 0,
      data: {
        error_record: {
          id: errorRecord.id,
          question_id: errorRecord.questionId,
          error_count: errorRecord.errorCount,
          stage: newStage,
          last_review: now.toISOString(),
          next_review: nextReview.toISOString(),
          is_mastered: mastered,
        },
        was_correct: is_correct,
        stage_changed: {
          from: oldStage,
          to: newStage,
        },
      },
      message: mastered ? '恭喜！此错题已掌握' : is_correct ? '回答正确，进入下一阶段' : '回答错误，返回前一阶段',
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Failed to submit review:', error);
    const errorResponse: ReviewResponse = {
      code: 500,
      data: null,
      message: '提交复习失败，请稍后重试',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
