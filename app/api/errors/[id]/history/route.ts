import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: string;
  email: string;
}

interface HistoryResponse {
  success: boolean;
  data: {
    reviews: Array<{
      id: string;
      stageAtReview: number;
      isCorrect: boolean;
      reviewedAt: string;
    }>;
    total: number;
  } | null;
  message?: string;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const errorResponse: HistoryResponse = {
        success: false,
        data: null,
        error: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      const errorResponse: HistoryResponse = {
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
      const errorResponse: HistoryResponse = {
        success: false,
        data: null,
        error: '未登录或token已过期',
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = payload.userId;
    const errorId = params.id;

    const errorRecord = await prisma.userErrorQuestion.findUnique({
      where: { id: errorId },
    });

    if (!errorRecord) {
      const errorResponse: HistoryResponse = {
        success: false,
        data: null,
        error: '错题记录不存在',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    if (errorRecord.userId !== userId) {
      const errorResponse: HistoryResponse = {
        success: false,
        data: null,
        error: '无权访问此错题记录',
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const reviews = await prisma.errorReview.findMany({
      where: { errorId },
      orderBy: { reviewedAt: 'desc' },
      take: 20,
    });

    const successResponse: HistoryResponse = {
      success: true,
      data: {
        reviews: reviews.map((r) => ({
          id: r.id,
          stageAtReview: r.stageAtReview,
          isCorrect: r.isCorrect,
          reviewedAt: r.reviewedAt.toISOString(),
        })),
        total: reviews.length,
      },
      message: '获取复习历史成功',
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch error history:', error);
    const errorResponse: HistoryResponse = {
      success: false,
      data: null,
      error: '获取复习历史失败，请稍后重试',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}