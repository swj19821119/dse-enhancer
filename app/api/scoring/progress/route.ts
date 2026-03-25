import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateProgressTrend, calculateAverageScore, calculateScoreTrend } from '@/lib/adaptive';

export const dynamic = 'force-dynamic';

interface ProgressData {
  date: string;
  totalScore: number;
  accuracy: number;
  nextDifficulty: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const timeframe = searchParams.get('timeframe') || '7d';

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const records = await prisma.dailyStudyRecord.findMany({
      where: {
        userId: user_id,
        studyDate: {
          gte: startDate,
          lte: now,
        },
        completed: true,
      },
      orderBy: {
        studyDate: 'asc',
      },
    });

    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          timeframe,
          progress: [],
          statistics: {
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
            totalDays: 0,
            trend: 'stable',
          },
        },
        message: "操作成功"
      });
    }

    // Type assertion for new scoring fields
    const typedRecords = records as unknown as Array<{
      id: string;
      userId: string;
      studyDate: Date;
      studyMode: string | null;
      totalMinutes: number;
      totalScore: number;
      accuracy: number | null;
      nextDifficulty: number | null;
      modulesData: string | null;
      recommendations: string | null;
      completed: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;

    const progress: ProgressData[] = typedRecords.map(record => ({
      date: record.studyDate.toISOString().split('T')[0],
      totalScore: record.totalScore,
      accuracy: record.accuracy || 0,
      nextDifficulty: record.nextDifficulty || 2.0,
    }));

// Type assertion for new scoring fields
    const averageScore = calculateAverageScore(typedRecords.map(r => ({
      ...r,
      date: r.studyDate.toISOString().split('T')[0],
      moduleBreakdown: [],
      currentDifficulty: r.nextDifficulty || 2.0,
      difficultyChange: 0,
      recommendations: [],
      accuracy: r.accuracy || 0,
      nextDifficulty: r.nextDifficulty || 2.0,
    })));

    const scores = progress.map(p => p.totalScore);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const trend = calculateScoreTrend(typedRecords.map(r => ({
      ...r,
      date: r.studyDate.toISOString().split('T')[0],
      moduleBreakdown: [],
      currentDifficulty: r.nextDifficulty || 2.0,
      difficultyChange: 0,
      recommendations: [],
      accuracy: r.accuracy || 0,
      nextDifficulty: r.nextDifficulty || 2.0,
    })));

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        progress,
        statistics: {
          averageScore,
          highestScore,
          lowestScore,
          totalDays: typedRecords.length,
          trend,
        },
        difficultyProgression: {
          start: typedRecords[0]?.nextDifficulty || 2.0,
          end: typedRecords[typedRecords.length - 1]?.nextDifficulty || 2.0,
          change: (typedRecords[typedRecords.length - 1]?.nextDifficulty || 2.0) - (typedRecords[0]?.nextDifficulty || 2.0),
        },
      },
      message: "操作成功"
    });
  } catch (error) {
    console.error('Failed to fetch progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
