import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface RegisterInput {
  email: string;
  password: string;
  nickname: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/register
 * 用户注册API
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterInput = await request.json();
    const { email, password, nickname } = body;

    if (!email || !password || !nickname) {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: '请填写完整的注册信息'
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

    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: '密码长度至少6位'
        },
        { status: 422 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: '邮箱已被注册'
        },
        { status: 422 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
      },
    });

    await prisma.userAbility.create({
      data: {
        userId: user.id,
      },
    });

    const token = generateToken(user.id, user.email);

    const responseData = {
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
        message: '注册成功'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册失败:', error);

    return NextResponse.json(
      {
        code: 500,
        data: null,
        message: '注册失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
