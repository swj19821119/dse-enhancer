import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { getSession, updateSession, deleteSession, type QuestionData } from '@/lib/placement/session-db';
import { getNextReviewTime } from '@/lib/ebbinghaus';

type QuestionType = 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'writing' | 'speaking';

async function fetchNextQuestion(type: QuestionType, difficulty: number): Promise<QuestionData | null> {
  const questions = await prisma.question.findMany({
    where: {
      type,
      difficulty,
    },
    take: 10,
  });

  if (questions.length === 0) {
    return null;
  }

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  return {
    id: randomQuestion.id,
    type: randomQuestion.type as QuestionType,
    content: randomQuestion.content,
    options: randomQuestion.options ? JSON.parse(randomQuestion.options) : null,
    difficulty: randomQuestion.difficulty,
  };
}

function parseOptions(options: string | null): string[] | null {
  if (!options) return null;
  try {
    return JSON.parse(options);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, userAnswer, currentDifficulty, questionNumber, questionType } = body;

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: '测试会话不存在或已过期'
        },
        { status: 404 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: '题目不存在'
        },
        { status: 404 }
      );
    }

    const isCorrect = userAnswer.toLowerCase() === question.answer?.toLowerCase();

    const newAnswers = [
      ...session.answers,
      {
        questionId,
        userAnswer,
        isCorrect,
        questionType,
        difficulty: currentDifficulty,
      },
    ];

    await updateSession(sessionId, {
      answers: newAnswers,
      currentQuestionIndex: session.currentQuestionIndex + 1,
    });

    let nextDifficulty = currentDifficulty;
    if (isCorrect) {
      nextDifficulty = Math.min(Math.round((currentDifficulty + 0.1) * 10) / 10, 5.0);
    } else {
      nextDifficulty = Math.max(Math.round((currentDifficulty - 0.1) * 10) / 10, 1.0);
    }

    if (session.userId) {
      await prisma.userAnswer.create({
        data: {
          userId: session.userId,
          questionId,
          userAnswer: JSON.stringify({ answer: userAnswer }),
          isCorrect,
          score: isCorrect ? 1 : 0,
        },
      });

      if (!isCorrect) {
        const existingError = await prisma.userErrorQuestion.findUnique({
          where: {
            userId_questionId: {
              userId: session.userId,
              questionId,
            },
          },
        });

        if (existingError) {
          await prisma.userErrorQuestion.update({
            where: { id: existingError.id },
            data: {
              errorCount: existingError.errorCount + 1,
              lastWrongAt: new Date(),
            },
          });
        } else {
          const now = new Date();
          await prisma.userErrorQuestion.create({
            data: {
              userId: session.userId,
              questionId,
              errorCount: 1,
              stage: 1,
              nextReview: getNextReviewTime(1, now),
              lastWrongAt: now,
            },
          });
        }
      }
    }

    if (questionNumber >= 15) {
      const resultId = randomUUID();
      await deleteSession(sessionId);

      return NextResponse.json(
        {
          success: true,
          data: {
            isComplete: true,
            resultId,
          },
          message: '测试完成'
        },
        { status: 200 }
      );
    }

    const nextQuestion = await fetchNextQuestion(questionType, nextDifficulty);

    if (!nextQuestion) {
      const fallbackQuestions = await prisma.question.findMany({
        where: { type: questionType },
        take: 1,
      });

      if (fallbackQuestions.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: '题库题目不足'
          },
          { status: 500 }
        );
      }

      const q = fallbackQuestions[0];
      return NextResponse.json(
        {
          success: true,
          data: {
            isCorrect,
            correctAnswer: question.answer || '',
            explanation: question.explanation,
            nextQuestion: {
              id: q.id,
              type: q.type as QuestionType,
              content: q.content,
              options: parseOptions(q.options),
              difficulty: q.difficulty,
            },
            progress: {
              current: questionNumber + 1,
              total: 15,
            },
          },
          message: isCorrect ? '答案正确' : '答案错误'
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          isCorrect,
          correctAnswer: question.answer || '',
          explanation: question.explanation,
          nextQuestion,
          progress: {
            current: questionNumber + 1,
            total: 15,
          },
        },
        message: isCorrect ? '答案正确' : '答案错误'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to submit answer:', error);
    return NextResponse.json(
      {
        success: false,
        error: '提交答案失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
