import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { UpdateQuestionSchema } from '@/lib/schemas/question';

export const dynamic = 'force-dynamic';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json(
        {
          code: 404,
          data: null,
          message: 'Question not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: question,
    });
  } catch (error) {
    console.error('Failed to fetch question:', error);
    return NextResponse.json(
      {
        code: 500,
        data: null,
        message: 'Failed to fetch question',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          data: null,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateQuestionSchema.parse(body);

    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        {
          code: 404,
          data: null,
          message: 'Question not found',
        },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (validatedData.type !== undefined) {
      updateData.type = validatedData.type;
    }
    if (validatedData.subType !== undefined) {
      updateData.subType = validatedData.subType;
    }
    if (validatedData.part !== undefined) {
      updateData.part = validatedData.part;
    }
    if (validatedData.topic !== undefined) {
      updateData.topic = validatedData.topic;
    }
    if (validatedData.difficulty !== undefined) {
      updateData.difficulty = Math.round(validatedData.difficulty * 10) / 10;
    }
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
    }
    if (validatedData.options !== undefined) {
      updateData.options = validatedData.options;
    }
    if (validatedData.answer !== undefined) {
      updateData.answer = validatedData.answer;
    }
    if (validatedData.explanation !== undefined) {
      updateData.explanation = validatedData.explanation;
    }
    if (validatedData.source !== undefined) {
      updateData.source = validatedData.source;
    }
    if (validatedData.year !== undefined) {
      updateData.year = validatedData.year;
    }

    const question = await prisma.question.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      code: 0,
      data: question,
      message: 'Question updated successfully',
    });
  } catch (error) {
    console.error('Failed to update question:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: 'Validation error',
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        code: 500,
        data: null,
        message: 'Failed to update question',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        {
          code: 401,
          data: null,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        {
          code: 404,
          data: null,
          message: 'Question not found',
        },
        { status: 404 }
      );
    }

    await prisma.question.update({
      where: { id: params.id },
      data: { isApproved: false },
    });

    return NextResponse.json({
      code: 0,
      data: null,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete question:', error);
    return NextResponse.json(
      {
        code: 500,
        data: null,
        message: 'Failed to delete question',
      },
      { status: 500 }
    );
  }
}
