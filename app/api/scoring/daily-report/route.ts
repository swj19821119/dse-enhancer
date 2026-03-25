import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDailyReport, calculateNextDifficulty } from '@/lib/adaptive';
import { ModuleResult, ModuleType } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

interface DailyReportRequest {
  user_id: string;
  date?: string;
  module_results?: ModuleResult[];
  current_difficulty?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DailyReportRequest;

    const { user_id, date, module_results: initialModuleResults, current_difficulty } = body;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const studyDate = date || new Date().toISOString().split('T')[0];
    const startDate = new Date(studyDate);
    const endDate = new Date(studyDate);
    endDate.setHours(23, 59, 59, 999);

    let existingRecord = null;
    try {
      existingRecord = await prisma.dailyStudyRecord.findFirst({
        where: {
          userId: user_id,
          studyDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    } catch (error) {
      console.error('Failed to fetch existing record:', error);
    }

    let currentDifficulty = current_difficulty;

    if (!currentDifficulty && existingRecord) {
      currentDifficulty = existingRecord.totalScore > 0 ? existingRecord.totalScore : 2.0;
    }

    if (!currentDifficulty) {
      currentDifficulty = 2.0;
    }

    let module_results = initialModuleResults;

    if (!module_results && existingRecord) {
      try {
        const typedExistingRecord = existingRecord as unknown as {
          modulesData: string;
        };
        if (typedExistingRecord.modulesData) {
          const modulesData = JSON.parse(typedExistingRecord.modulesData);
          if (modulesData && Array.isArray(modulesData)) {
            module_results = modulesData;
          }
        }
      } catch (error) {
        console.error('Failed to parse existing modules data:', error);
      }
    }

    if (!module_results) {
      return NextResponse.json(
        { success: false, error: 'Module results are required to generate report' },
        { status: 400 }
      );
    }

    const report = generateDailyReport(user_id, studyDate, module_results, currentDifficulty);

    const reportData = {
      totalScore: report.totalScore,
      accuracy: report.accuracy,
      nextDifficulty: report.nextDifficulty,
      modulesData: JSON.stringify(report.moduleBreakdown),
      recommendations: report.recommendations.join('; '),
      completed: true,
    };

    let dailyRecord;

    if (existingRecord) {
      dailyRecord = await prisma.dailyStudyRecord.update({
        where: { id: existingRecord.id },
        data: reportData,
      });
    } else {
      dailyRecord = await prisma.dailyStudyRecord.create({
        data: {
          userId: user_id,
          studyDate: startDate,
          ...reportData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        report,
        dailyRecord,
        difficultyAdjustment: {
          current: report.currentDifficulty,
          next: report.nextDifficulty,
          change: report.difficultyChange,
          message: report.difficultyChange > 0
            ? '难度提升，继续努力！'
            : report.difficultyChange < 0
            ? '难度降低，先打好基础'
            : '难度保持不变',
        },
      },
      message: "操作成功"
    });
  } catch (error) {
    console.error('Failed to generate daily report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate daily report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const date = searchParams.get('date');

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const studyDate = date || new Date().toISOString().split('T')[0];
    const startDate = new Date(studyDate);
    const endDate = new Date(studyDate);
    endDate.setHours(23, 59, 59, 999);

     const record = await prisma.dailyStudyRecord.findFirst({
       where: {
         userId: user_id,
         studyDate: {
           gte: startDate,
           lte: endDate,
         },
       },
     });

     if (!record) {
       return NextResponse.json(
         { success: false, error: 'No daily record found for the specified date' },
         { status: 404 }
       );
     }

     const typedRecord = record as unknown as {
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
     };
     
     let parsedModulesData: ModuleResult[] = [];
     if (typedRecord.modulesData) {
       try {
         parsedModulesData = JSON.parse(typedRecord.modulesData) as ModuleResult[];
       } catch (e) {
         parsedModulesData = [];
       }
     }
     
     const parsedRecommendations = typedRecord.recommendations ? typedRecord.recommendations.split('; ') : [];
     
      return NextResponse.json({
        success: true,
        data: {
          record: typedRecord,
          modulesData: parsedModulesData,
          recommendations: parsedRecommendations,
        },
        message: "操作成功"
      });
  } catch (error) {
    console.error('Failed to fetch daily report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily report' },
      { status: 500 }
    );
  }
}
