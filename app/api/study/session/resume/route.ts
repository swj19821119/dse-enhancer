import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, time_remaining, module_time_remaining, current_module } = body;

    if (!session_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: session_id',
        },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      userId = decoded?.userId || null;
    }

    const session = await prisma.studySession.findUnique({
      where: { id: session_id },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 404 }
      );
    }

    if (userId && session.userId !== userId && session.userId !== 'guest') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        resumed: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to resume session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to resume session',
      },
      { status: 500 }
    );
  }
}
