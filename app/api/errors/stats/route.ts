import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: string;
  email: string;
}

interface StatsResponse {
  code: 0 | 401 | 500;
  data: {
    total_errors: number;
    mastered_count: number;
    due_today_count: number;
    stage_breakdown: {
      stage: number;
      count: number;
    }[];
    review_history_total: number;
  } | null;
  message: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const errorResponse: StatsResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      const errorResponse: StatsResponse = {
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
      const errorResponse: StatsResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = payload.userId;
    const now = new Date();

    const [totalErrors, masteredCount, dueTodayCount, allErrors, reviewHistoryTotal] = await Promise.all([
      prisma.userErrorQuestion.count({
        where: { userId },
      }),
      prisma.userErrorQuestion.count({
        where: {
          userId,
          isMastered: true,
        },
      }),
      prisma.userErrorQuestion.count({
        where: {
          userId,
          nextReview: {
            lte: now,
          },
          isMastered: false,
        },
      }),
      prisma.userErrorQuestion.findMany({
        where: {
          userId,
          isMastered: false,
        },
        select: {
          stage: true,
        },
      }),
      prisma.errorReview.count({
        where: {
          error: {
            userId,
          },
        },
      }),
    ]);

    const stageBreakdown = Array.from({ length: 8 }, (_, i) => i + 1).map((stage) => ({
      stage,
      count: allErrors.filter((e) => e.stage === stage).length,
    }));

    const successResponse: StatsResponse = {
      code: 0,
      data: {
        total_errors: totalErrors,
        mastered_count: masteredCount,
        due_today_count: dueTodayCount,
        stage_breakdown: stageBreakdown,
        review_history_total: reviewHistoryTotal,
      },
      message: '获取错题统计成功',
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch error stats:', error);
    const errorResponse: StatsResponse = {
      code: 500,
      data: null,
      message: '获取错题统计失败，请稍后重试',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
