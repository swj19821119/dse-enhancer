import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, wordId, known } = body;

    if (!userId || !wordId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Word ID are required' },
        { status: 400 }
      );
    }

    const vocabulary = await prisma.vocabulary.findUnique({
      where: { id: wordId }
    });

    if (!vocabulary) {
      return NextResponse.json(
        { success: false, error: 'Word not found' },
        { status: 404 }
      );
    }

    const status = known ? 'learned' : 'unknown';

    const existing = await prisma.userVocabulary.findUnique({
      where: {
        userId_vocabularyId: {
          userId,
          vocabularyId: wordId,
        }
      }
    });

    if (existing) {
      const updated = await prisma.userVocabulary.update({
        where: { id: existing.id },
        data: {
          status,
          lastReviewed: new Date(),
          nextReview: known ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date(Date.now() + 5 * 60 * 1000),
        }
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: known ? '标记为已掌握' : '已加入生词本'
      }, { status: 200 });
    }

    const userVocab = await prisma.userVocabulary.create({
      data: {
        userId,
        vocabularyId: wordId,
        status,
        lastReviewed: new Date(),
        nextReview: known ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date(Date.now() + 5 * 60 * 1000),
      }
    });

    return NextResponse.json({
      success: true,
      data: userVocab,
      message: known ? '标记为已掌握' : '已加入生词本'
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to update vocabulary progress:', error);
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status;
    }

    const userVocabulary = await prisma.userVocabulary.findMany({
      where: whereClause,
      include: {
        vocabulary: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    const words = userVocabulary.map(uv => ({
      id: uv.vocabulary.id,
      word: uv.vocabulary.word,
      phonetic: uv.vocabulary.phonetic,
      definition: uv.vocabulary.definition,
      example: uv.vocabulary.example,
      difficulty: uv.vocabulary.difficulty,
      status: uv.status,
      lastReviewed: uv.lastReviewed,
      nextReview: uv.nextReview,
    }));

    return NextResponse.json({
      success: true,
      data: {
        words,
        total: words.length,
      },
      message: '获取生词本成功'
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch vocabulary progress:', error);
    return NextResponse.json(
      { success: false, error: '获取生词本失败' },
      { status: 500 }
    );
  }
}