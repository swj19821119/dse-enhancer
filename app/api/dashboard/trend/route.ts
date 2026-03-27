import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface DailyProgress {
  date: string;
  score: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const timeframe = searchParams.get('timeframe') || '7d';

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required'
        },
        { status: 400 }
      );
    }

    let startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const records = await prisma.dailyStudyRecord.findMany({
      where: {
        userId,
        studyDate: {
          gte: startDate,
          lte: new Date(),
        },
        completed: true,
      },
      orderBy: {
        studyDate: 'asc',
      },
    });

    const dailyProgress: DailyProgress[] = records.map(record => ({
      date: record.studyDate.toISOString().split('T')[0],
      score: record.totalScore || 0,
    }));

    const scores = dailyProgress.map(p => p.score);
    
    const averageScore = scores.length > 0 
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : 0;

    const maxScore = Math.max(...scores, 0);
    const minScore = Math.min(...scores, 0);
    const totalDays = dailyProgress.length;

    const movingAverage: DailyProgress[] = [];
    for (let i = 0; i < dailyProgress.length; i++) {
      const windowSize = 7;
      const startIdx = Math.max(0, i - Math.floor(windowSize / 2) + 1);
      const endIdx = Math.min(dailyProgress.length - 1, i + Math.floor(windowSize / 2));
      
      if (endIdx > startIdx) {
        const windowScores = dailyProgress.slice(startIdx, endIdx + 1).map(p => p.score);
        const avg = windowScores.reduce((a, b) => a + b, 0) / windowScores.length;
        movingAverage.push({
          date: dailyProgress[i].date,
          score: parseFloat(avg.toFixed(1)),
        });
      } else {
        movingAverage.push({
          date: dailyProgress[i].date,
          score: dailyProgress[i].score,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        dailyProgress,
        statistics: {
          totalDays,
          averageScore: averageScore,
          averageMinutes: 0,
          highestScore: maxScore,
          lowestScore: minScore,
        },
      },
      message: "获取学习趋势成功"
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch learning trend:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取学习趋势失败'
      },
      { status: 500 }
    );
  }
}
