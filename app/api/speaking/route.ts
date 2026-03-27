import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'speaking';
    const difficulty = searchParams.get('difficulty');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: any = { 
      type: 'speaking',
      isApproved: true 
    };

    if (difficulty) {
      whereClause.difficulty = parseInt(difficulty);
    }

    if (topic) {
      whereClause.topic = { contains: topic };
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      }
    });

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      type: q.type,
      subType: q.subType,
      topic: q.topic,
      difficulty: q.difficulty,
      content: typeof q.content === 'string' ? JSON.parse(q.content) : q.content,
      samples: typeof q.answer === 'string' ? JSON.parse(q.answer) : q.answer,
      explanation: q.explanation,
    }));

    return NextResponse.json({
      success: true,
      data: {
        questions: formattedQuestions,
        total: formattedQuestions.length,
      },
      message: '获取口语题目成功'
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch speaking questions:', error);
    return NextResponse.json(
      { success: false, error: '获取口语题目失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, questionId, audioBlob, duration, evaluation } = body;

    if (!userId || !questionId || !audioBlob) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const speakingRecord = await prisma.dailyStudyRecord.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        studyDate: new Date(),
        studyMode: 'speaking',
        totalMinutes: 0,
        totalScore: evaluation?.score || 0,
        modulesData: JSON.stringify({
          type: 'speaking',
          questionId,
          audioData: audioBlob,
          duration,
          evaluation: evaluation || null,
        }),
        completed: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: speakingRecord,
      message: '保存口语记录成功'
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to save speaking record:', error);
    return NextResponse.json(
      { success: false, error: '保存口语记录失败' },
      { status: 500 }
    );
  }
}
