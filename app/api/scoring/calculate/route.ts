import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateModuleScore, generateModuleResult } from '@/lib/scoring';
import { ModuleType } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

interface CalculateScoreRequest {
  session_id?: string;
  module_type: ModuleType;
  required_correct: number;
  required_total: number;
  extra_correct: number;
  extra_total: number;
  difficulty: number;
  user_id?: string;
}

interface AnswerRecord {
  id: string;
  questionId: string;
  isCorrect: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CalculateScoreRequest;

    const {
      session_id,
      module_type,
      required_correct,
      required_total,
      extra_correct,
      extra_total,
      difficulty,
      user_id,
    } = body;

    if (!module_type) {
      return NextResponse.json(
        { success: false, error: 'Module type is required' },
        { status: 400 }
      );
    }

    if (required_total === undefined || required_total < 0) {
      return NextResponse.json(
        { success: false, error: 'Required total must be a positive number' },
        { status: 400 }
      );
    }

    if (difficulty === undefined || difficulty < 0.8 || difficulty > 5.9) {
      return NextResponse.json(
        { success: false, error: 'Difficulty must be between 0.8 and 5.9' },
        { status: 400 }
      );
    }

    const moduleResult = generateModuleResult(
      module_type,
      required_correct,
      required_total,
      extra_correct,
      extra_total,
      difficulty
    );

    if (user_id && session_id) {
      try {
        await prisma.userAnswer.updateMany({
          where: {
            userId: user_id,
          },
          data: {
            score: Math.round(moduleResult.score),
          },
        });
      } catch (error) {
        console.error('Failed to update user answers:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        moduleResult,
        explanation: {
          baseScore: moduleResult.baseScore,
          extraScore: moduleResult.extraScore,
          formula: {
            base: '60 × (Accuracy / 0.6) × (Difficulty / 3)',
            extra: 'Extra Correct × Reward × Diminishing × (Difficulty / 3)',
          },
          notes: [],
        },
      },
    });
  } catch (error) {
    console.error('Failed to calculate score:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
