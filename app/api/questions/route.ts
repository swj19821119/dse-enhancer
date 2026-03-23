import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      take: 10,
    });
    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch questions',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = await prisma.question.create({
      data: body,
    });
    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('Failed to create question:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create question',
    }, { status: 500 });
  }
}
