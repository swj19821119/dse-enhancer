import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponseData {
  user: {
    id: string;
    email: string;
    nickname: string;
    grade: string | null;
    targetLevel: number | null;
    currentLevel: number | null;
    isVip: boolean;
    createdAt: string;
  };
  token: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/login
 * 用户登录API
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginInput = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: '请填写邮箱和密码'
        },
        { status: 422 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: '邮箱格式不正确'
        },
        { status: 422 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          data: null,
          message: '邮箱或密码错误'
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          code: 401,
          data: null,
          message: '邮箱或密码错误'
        },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.email);

    const responseData: LoginResponseData = {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        grade: user.grade,
        targetLevel: user.targetLevel,
        currentLevel: user.currentLevel,
        isVip: user.isVip,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };

    return NextResponse.json(
      {
        code: 0,
        data: responseData,
        message: '登录成功'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('登录失败:', error);

    return NextResponse.json(
      {
        code: 500,
        data: null,
        message: '登录失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
