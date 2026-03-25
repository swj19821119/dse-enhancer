import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import {
  CreateQuestionSchema,
  UpdateQuestionSchema,
  QuestionFiltersSchema,
} from '@/lib/schemas/question';

export const dynamic = 'force-dynamic';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = QuestionFiltersSchema.parse({
      type: searchParams.get('type') || undefined,
      difficulty_min: searchParams.get('difficulty_min')
        ? parseFloat(searchParams.get('difficulty_min')!)
        : undefined,
      difficulty_max: searchParams.get('difficulty_max')
        ? parseFloat(searchParams.get('difficulty_max')!)
        : undefined,
      topic: searchParams.get('topic') || undefined,
      grade: searchParams.get('grade') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      is_approved: searchParams.get('is_approved')
        ? searchParams.get('is_approved') === 'true'
        : undefined,
    });

    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.difficulty_min !== undefined || filters.difficulty_max !== undefined) {
      where.difficulty = {};
      if (filters.difficulty_min !== undefined) {
        where.difficulty.gte = filters.difficulty_min;
      }
      if (filters.difficulty_max !== undefined) {
        where.difficulty.lte = filters.difficulty_max;
      }
    }

    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }

    if (filters.is_approved !== undefined) {
      where.isApproved = filters.is_approved;
    }

    const skip = (filters.page - 1) * filters.limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      },
      message: "获取题目列表成功",
    });
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取题目列表失败',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '未授权',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateQuestionSchema.parse(body);

    const question = await prisma.question.create({
      data: {
        type: validatedData.type,
        subType: validatedData.subType,
        part: validatedData.part,
        topic: validatedData.topic,
        difficulty: Math.round(validatedData.difficulty * 10) / 10,
        content: validatedData.content,
        options: validatedData.options,
        answer: validatedData.answer,
        explanation: validatedData.explanation,
        source: validatedData.source,
        year: validatedData.year,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: question,
        message: '创建题目成功',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create question:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: '验证失败',
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '创建题目失败',
      },
      { status: 500 }
    );
  }
}
