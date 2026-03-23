import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerUser, loginUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nickname, action } = body;

    if (action === 'register') {
      if (!email || !password || !nickname) {
        return NextResponse.json({
          success: false,
          error: '请填写完整信息',
        }, { status: 400 });
      }

      const result = await registerUser(email, password, nickname);

      return NextResponse.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({
          success: false,
          error: '请填写邮箱和密码',
        }, { status: 400 });
      }

      const result = await loginUser(email, password);

      return NextResponse.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    }

    return NextResponse.json({
      success: false,
      error: '未知操作',
    }, { status: 400 });

  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '服务器错误',
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
