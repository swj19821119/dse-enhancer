import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ModuleScore {
  reading?: number;
  listening?: number;
  writing?: number;
  speaking?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required'
        },
        { status: 400 }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const records = await prisma.dailyStudyRecord.findMany({
      where: {
        userId,
        studyDate: {
          gte: sevenDaysAgo,
        },
        completed: true,
      },
      orderBy: {
        studyDate: 'desc',
      },
      take: 7,
    });

    const skillSums: ModuleScore = {
      reading: 0,
      listening: 0,
      writing: 0,
      speaking: 0,
    };
    let totalRecords = 0;

    for (const record of records) {
      totalRecords++;

      if (record.modulesData) {
        try {
          const modulesData = typeof record.modulesData === 'string' 
            ? JSON.parse(record.modulesData) 
            : record.modulesData;

          if (modulesData.modules) {
            for (const module of modulesData.modules) {
              if (module.type === 'reading' && typeof module.score === 'number') {
                skillSums.reading += module.score;
              } else if (module.type === 'listening' && typeof module.score === 'number') {
                skillSums.listening += module.score;
              } else if (module.type === 'writing' && typeof module.score === 'number') {
                skillSums.writing += module.score;
              } else if (module.type === 'speaking' && typeof module.score === 'number') {
                skillSums.speaking += module.score;
              }
            }
          }
        } catch (error) {
          console.error('Error parsing modulesData:', error);
        }
      }
    }

    const averageScores: ModuleScore = {};
    const validDays = totalRecords > 0 ? totalRecords : 1;

    for (const [skill, sum] of Object.entries(skillSums) as [string, number][]) {
      const avg = sum / validDays;
      (averageScores as any)[skill] = parseFloat(avg.toFixed(1));
    }

    const scoreToLevel = (score: number): number => {
      if (score === 0) return 1;
      if (score <= 20) return 1;
      if (score <= 40) return 2;
      if (score <= 60) return 3;
      if (score <= 80) return 4;
      return 5;
    };

    return NextResponse.json({
      success: true,
      data: {
        reading: scoreToLevel(averageScores.reading || 0),
        listening: scoreToLevel(averageScores.listening || 0),
        writing: scoreToLevel(averageScores.writing || 0),
        speaking: scoreToLevel(averageScores.speaking || 0),
        averageScores,
        totalDays: validDays,
      },
      message: "获取能力数据成功"
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch ability data:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取能力数据失败'
      },
      { status: 500 }
    );
  }
}
