import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    // TODO: 实现真正的认证逻辑
    // 这里是临时的 mock 响应
    if (action === 'login') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'temp-user-id',
          email,
          nickname: '临时用户',
        },
      });
    }

    if (action === 'register') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'temp-user-id',
          email,
          nickname: '新用户',
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: '未知操作',
    }, { status: 400 });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({
      success: false,
      error: '服务器错误',
    }, { status: 500 });
  }
}
