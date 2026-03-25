import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

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

interface UpdateProfileData {
  nickname?: string;
  grade?: string;
  targetLevel?: number;
  studyMode?: string;
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
 * 验证JWT token并返回用户ID
 */
async function verifyToken(authHeader: string | null): Promise<string> {
  if (!authHeader) {
    throw new Error('未登录或token已过期');
  }

  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
  if (!tokenMatch) {
    throw new Error('未登录或token已过期');
  }

  const token = tokenMatch[1];

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('未登录或token已过期');
  }

  return payload.userId;
}

/**
 * GET /api/user/profile
 * 获取当前用户详细信息（包含能力图谱）
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request.headers.get('authorization'));

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

    if (error instanceof Error && (error.message === '未登录或token已过期')) {
      const errorResponse: ErrorResponse = {
        code: 401,
        data: null,
        message: error.message
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const errorResponse: ErrorResponse = {
      code: 500,
      data: null,
      message: '获取用户信息失败，请稍后重试'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/user/profile
 * 更新用户个人信息
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await verifyToken(request.headers.get('authorization'));

    const body = await request.json();
    const { nickname, grade, targetLevel, studyMode } = body;

    if (nickname !== undefined && typeof nickname !== 'string') {
      const errorResponse: ErrorResponse = {
        code: 400,
        data: null,
        message: '昵称格式错误'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (grade !== undefined && typeof grade !== 'string') {
      const errorResponse: ErrorResponse = {
        code: 400,
        data: null,
        message: '年级格式错误'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (targetLevel !== undefined && (typeof targetLevel !== 'number' || targetLevel < 1 || targetLevel > 5)) {
      const errorResponse: ErrorResponse = {
        code: 400,
        data: null,
        message: '目标等级必须是1-5之间的数字'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (studyMode !== undefined && typeof studyMode !== 'string') {
      const errorResponse: ErrorResponse = {
        code: 400,
        data: null,
        message: '学习模式格式错误'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const updateData: UpdateProfileData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (grade !== undefined) updateData.grade = grade;
    if (targetLevel !== undefined) updateData.targetLevel = targetLevel;
    if (studyMode !== undefined) updateData.studyMode = studyMode;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        abilities: true,
      },
    });

    const userData: UserData = {
      id: updatedUser.id,
      email: updatedUser.email,
      nickname: updatedUser.nickname,
      grade: updatedUser.grade,
      targetLevel: updatedUser.targetLevel,
      currentLevel: updatedUser.currentLevel,
      isVip: updatedUser.isVip,
      studyMode: updatedUser.studyMode,
      createdAt: updatedUser.createdAt.toISOString(),
      abilities: {
        readingLevel: updatedUser.abilities?.readingLevel || 1,
        listeningLevel: updatedUser.abilities?.listeningLevel || 1,
        writingLevel: updatedUser.abilities?.writingLevel || 1,
        speakingLevel: updatedUser.abilities?.speakingLevel || 1,
        vocabularyLevel: updatedUser.abilities?.vocabularyLevel || 1,
        grammarLevel: updatedUser.abilities?.grammarLevel || 1,
      },
    };

    const successResponse: SuccessResponse = {
      code: 0,
      data: {
        user: userData,
      },
      message: '更新成功'
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error('更新用户信息失败:', error);

    if (error instanceof Error && (error.message === '未登录或token已过期')) {
      const errorResponse: ErrorResponse = {
        code: 401,
        data: null,
        message: error.message
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const errorResponse: ErrorResponse = {
      code: 500,
      data: null,
      message: '更新用户信息失败，请稍后重试'
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
