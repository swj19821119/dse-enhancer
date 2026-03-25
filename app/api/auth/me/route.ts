import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JwtPayload {
  userId: string;
  email: string;
}

interface UserAbilityData {
  readingLevel: number;
  listeningLevel: number;
  writingLevel: number;
  speakingLevel: number;
  vocabularyLevel: number;
  grammarLevel: number;
}

interface UserData {
  id: string;
  email: string;
  nickname: string;
  grade: string | null;
  targetLevel: number | null;
  currentLevel: number | null;
  isVip: boolean;
  studyMode: string | null;
  createdAt: string;
  abilities: UserAbilityData;
}

interface SuccessResponse {
  code: 0;
  data: {
    user: UserData;
  };
  message: string;
}

interface ErrorResponse {
  code: number;
  data: null;
  message: string;
}

/**
 * GET /api/auth/me
 * 获取当前用户信息API
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      const errorResponse: ErrorResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期'
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      const errorResponse: ErrorResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期'
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const token = tokenMatch[1];

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      console.error('Token验证失败:', error);
      const errorResponse: ErrorResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期'
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userId = payload.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        abilities: true,
      },
    });

    if (!user) {
      const errorResponse: ErrorResponse = {
        code: 401,
        data: null,
        message: '未登录或token已过期'
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const userData: UserData = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      grade: user.grade,
      targetLevel: user.targetLevel,
      currentLevel: user.currentLevel,
      isVip: user.isVip,
      studyMode: user.studyMode,
      createdAt: user.createdAt.toISOString(),
      abilities: {
        readingLevel: user.abilities?.readingLevel || 1,
        listeningLevel: user.abilities?.listeningLevel || 1,
        writingLevel: user.abilities?.writingLevel || 1,
        speakingLevel: user.abilities?.speakingLevel || 1,
        vocabularyLevel: user.abilities?.vocabularyLevel || 1,
        grammarLevel: user.abilities?.grammarLevel || 1,
      },
    };

    const successResponse: SuccessResponse = {
      code: 0,
      data: {
        user: userData,
      },
      message: '获取成功'
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('获取用户信息失败:', error);

    const errorResponse: ErrorResponse = {
      code: 500,
      data: null,
      message: '获取用户信息失败，请稍后重试'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
