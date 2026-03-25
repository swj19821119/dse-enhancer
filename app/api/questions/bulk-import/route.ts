import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { BulkImportSchema } from '@/lib/schemas/question';

export const dynamic = 'force-dynamic';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function POST(request: NextRequest) {
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
    const validatedData = BulkImportSchema.parse(body);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ index: number; question: any; error: string }>,
    };

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < validatedData.questions.length; i++) {
        const questionData = validatedData.questions[i];

        try {
          await tx.question.create({
            data: {
              type: questionData.type,
              subType: questionData.subType,
              part: questionData.part,
              topic: questionData.topic,
              difficulty: Math.round(questionData.difficulty * 10) / 10,
              content: questionData.content,
              options: questionData.options,
              answer: questionData.answer,
              explanation: questionData.explanation,
              source: questionData.source,
              year: questionData.year,
            },
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            index: i,
            question: questionData,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });

    return NextResponse.json({
      code: 0,
      data: results,
      message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
    });
  } catch (error) {
    console.error('Failed to bulk import questions:', error);

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
        message: 'Failed to bulk import questions',
      },
      { status: 500 }
    );
  }
}
