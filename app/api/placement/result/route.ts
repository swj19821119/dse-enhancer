import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type QuestionType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

interface AbilityResult {
  readingLevel: number;
  listeningLevel: number;
  writingLevel: number;
  speakingLevel: number;
  vocabularyLevel: number;
  grammarLevel: number;
}

function calculateAbilityLevel(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 1;

  const accuracy = correctCount / totalCount;

  if (accuracy >= 0.8) return 5;
  if (accuracy >= 0.6) return 4;
  if (accuracy >= 0.4) return 3;
  if (accuracy >= 0.2) return 2;
  return 1;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get('resultId');

    if (!resultId) {
      return NextResponse.json(
        {
          code: 422,
          data: null,
          message: '缺少 resultId 参数'
        },
        { status: 422 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          code: 401,
          data: null,
          message: '需要登录才能获取结果'
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          code: 401,
          data: null,
          message: 'Token 无效'
        },
        { status: 401 }
      );
    }

    const recentAnswers = await prisma.userAnswer.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        question: {
          select: {
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 15,
    });

    if (recentAnswers.length === 0) {
      return NextResponse.json(
        {
          code: 404,
          data: null,
          message: '未找到测试记录'
        },
        { status: 404 }
      );
    }

    const typeStats: Record<QuestionType, { correct: number; total: number }> = {
      vocabulary: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
      writing: { correct: 0, total: 0 },
      speaking: { correct: 0, total: 0 },
    };

    for (const answer of recentAnswers) {
      const type = answer.question.type as QuestionType;
      if (typeStats[type]) {
        typeStats[type].total++;
        if (answer.isCorrect) {
          typeStats[type].correct++;
        }
      }
    }

    const abilities: AbilityResult = {
      readingLevel: calculateAbilityLevel(typeStats.reading.correct, typeStats.reading.total),
      listeningLevel: calculateAbilityLevel(typeStats.listening.correct, typeStats.listening.total),
      writingLevel: calculateAbilityLevel(typeStats.writing.correct, typeStats.writing.total),
      speakingLevel: calculateAbilityLevel(typeStats.speaking.correct, typeStats.speaking.total),
      vocabularyLevel: calculateAbilityLevel(typeStats.vocabulary.correct, typeStats.vocabulary.total),
      grammarLevel: calculateAbilityLevel(typeStats.grammar.correct, typeStats.grammar.total),
    };

    const totalLevels =
      abilities.readingLevel +
      abilities.listeningLevel +
      abilities.writingLevel +
      abilities.speakingLevel +
      abilities.vocabularyLevel +
      abilities.grammarLevel;

    const overallLevel = Math.round(totalLevels / 6);

    const strongPoints: string[] = [];
    const weakPoints: string[] = [];

    const typeLabels: Record<QuestionType, string> = {
      vocabulary: '词汇',
      grammar: '语法',
      reading: '阅读',
      listening: '听力',
      writing: '写作',
      speaking: '口语',
    };

    for (const [type, stats] of Object.entries(typeStats)) {
      if (stats.total === 0) continue;

      const accuracy = stats.correct / stats.total;
      const label = typeLabels[type as QuestionType];

      if (accuracy >= 0.7) {
        strongPoints.push(label);
      } else if (accuracy < 0.4 && stats.total > 2) {
        weakPoints.push(label);
      }
    }

    try {
      const existingAbility = await prisma.userAbility.findUnique({
        where: { userId: decoded.userId },
      });

      if (existingAbility) {
        await prisma.userAbility.update({
          where: { userId: decoded.userId },
          data: abilities,
        });
      } else {
        await prisma.userAbility.create({
          data: {
            userId: decoded.userId,
            ...abilities,
          },
        });
      }

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { currentLevel: overallLevel },
      });
    } catch (dbError) {
      console.error('Failed to update user abilities:', dbError);
    }

    return NextResponse.json(
      {
        code: 0,
        data: {
          overallLevel,
          abilities,
          analysis: {
            strongPoints,
            weakPoints,
          },
        },
        message: '获取成功'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to get placement result:', error);
    return NextResponse.json(
      {
        code: 500,
        data: null,
        message: '获取结果失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
