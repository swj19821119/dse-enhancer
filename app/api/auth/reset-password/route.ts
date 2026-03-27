import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    if (!user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json(
        { success: false, error: '未找到密码重置请求' },
        { status: 400 }
      );
    }

    if (user.resetToken !== token) {
      return NextResponse.json(
        { success: false, error: '重置令牌无效' },
        { status: 400 }
      );
    }

    if (user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: '重置令牌已过期，请重新申请' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to reset password:', error);
    return NextResponse.json(
      { success: false, error: '密码重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}