import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '15');
    const mode = searchParams.get('mode') || 'practice'; // practice | review

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userLevel = level ? parseInt(level) : (user.currentLevel || 1);
    const difficultyRange = [
      Math.max(1, userLevel - 1),
      userLevel,
      Math.min(5, userLevel + 1)
    ];

    let words;

    if (mode === 'review') {
      const userVocab = await prisma.userVocabulary.findMany({
        where: {
          userId,
          status: 'unknown',
        },
        include: {
          vocabulary: true,
        },
        take: limit,
      });

      words = userVocab.map(uv => ({
        id: uv.vocabulary.id,
        word: uv.vocabulary.word,
        phonetic: uv.vocabulary.phonetic,
        definition: uv.vocabulary.definition,
        example: uv.vocabulary.example,
        difficulty: uv.vocabulary.difficulty,
        status: uv.status,
      }));
    } else {
      const userVocab = await prisma.userVocabulary.findMany({
        where: {
          userId,
        },
        select: {
          vocabularyId: true,
        }
      });

      const learnedWordIds = userVocab.map(uv => uv.vocabularyId);

      const whereClause = learnedWordIds.length > 0
        ? {
            difficulty: { in: difficultyRange },
            id: { notIn: learnedWordIds },
          }
        : {
            difficulty: { in: difficultyRange },
          };

      const vocabulary = await prisma.vocabulary.findMany({
        where: whereClause,
        take: limit,
        orderBy: {
          frequency: 'desc',
        }
      });

      words = vocabulary.map(v => ({
        id: v.id,
        word: v.word,
        phonetic: v.phonetic,
        definition: v.definition,
        example: v.example,
        difficulty: v.difficulty,
        topic: v.topic,
        status: 'new',
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        words,
        total: words.length,
        level: userLevel,
        mode,
      },
      message: '获取词汇成功'
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch vocabulary:', error);
    return NextResponse.json(
      { success: false, error: '获取词汇失败' },
      { status: 500 }
    );
  }
}