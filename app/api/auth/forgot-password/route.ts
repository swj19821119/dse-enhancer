import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱地址' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '该邮箱未注册' },
        { status: 404 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        token: resetToken,
        expiresIn: '1小时',
        message: '密码重置链接已生成。在实际应用中，此链接将通过邮件发送。',
        hint: '开发模式：使用此token调用 /api/auth/reset-password'
      },
      message: '密码重置请求已提交'
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to process forgot password request:', error);
    return NextResponse.json(
      { success: false, error: '处理请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}