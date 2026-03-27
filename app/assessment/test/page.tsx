'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { usePlacementStore, QuestionData } from '@/store/placement';
import { useAuthStore } from '@/store/auth';

export default function PlacementTestPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const {
    sessionId,
    questions,
    answers,
    currentQuestionIndex,
    currentDifficulty,
    isLoading,
    error,
    setQuestions,
    addAnswer,
    setCurrentQuestionIndex,
    setCurrentDifficulty,
    setLoading,
    setError,
    setComplete,
    setResultId,
    reset,
  } = usePlacementStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
  } | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const totalQuestions = 15;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      router.push('/assessment');
      return;
    }

    if (currentQuestionIndex >= totalQuestions) {
      handleTestComplete();
    }
  }, [sessionId, currentQuestionIndex, router]);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error, setError]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleConfirmAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || showFeedback) return;

    setLoading(true);
    try {
      const response = await fetch('/api/placement/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          userAnswer: selectedAnswer,
          currentDifficulty,
          questionNumber: currentQuestionIndex + 1,
          questionType: currentQuestion.type,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '提交答案失败');
      }

      const isCorrect = selectedAnswer.toLowerCase() ===
        (result.data.correctAnswer || '').toLowerCase();

      setFeedbackData({
        isCorrect,
        correctAnswer: result.data.correctAnswer,
        explanation: result.data.explanation,
      });

      addAnswer({
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
        isCorrect,
        questionType: currentQuestion.type,
        difficulty: currentDifficulty,
      });

      if (result.data.isComplete) {
        setResultId(result.data.resultId);
        setComplete(true);
        router.push(`/assessment/results?resultId=${result.data.resultId}`);
      } else {
        setShowFeedback(true);

        const nextDifficulty = isCorrect
          ? Math.min(currentDifficulty + 1, 5)
          : Math.max(currentDifficulty - 1, 1);

        setCurrentDifficulty(nextDifficulty);

        setTimeout(() => {
          setShowFeedback(false);
          setSelectedAnswer(null);
          setFeedbackData(null);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, isCorrect ? 1000 : 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交答案失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestComplete = () => {
    if (answers.length === totalQuestions) {
      router.push('/assessment/results');
    }
  };

  const getDifficultyColor = (diff: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800',
    };
    return colors[diff as keyof typeof colors] || colors[2];
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vocabulary: '词汇',
      grammar: '语法',
      reading: '阅读',
      listening: '听力',
      writing: '写作',
      speaking: '口语',
    };
    return labels[type] || type;
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-white text-lg">正在加载题目...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-white">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm">
                第 {currentQuestionIndex + 1} 题 / 共 {totalQuestions} 题
              </span>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentDifficulty)}`}>
                难度 {currentDifficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {getQuestionTypeLabel(currentQuestion.type)}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="pt-6">
            <div className="mb-6">
              <h2 className="text-xl text-white font-medium mb-6 whitespace-pre-line leading-relaxed">
                {currentQuestion.content}
              </h2>

              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const optionLetter = String.fromCharCode(65 + index);

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showFeedback}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
                        } ${showFeedback ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center">
                          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 font-bold text-sm">
                            {optionLetter}
                          </span>
                          <span className="flex-1">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!currentQuestion.options && (
                <input
                  type="text"
                  value={selectedAnswer || ''}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={showFeedback}
                  placeholder="请输入你的答案"
                  className="w-full p-4 rounded-xl bg-white/10 border-2 border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {showFeedback && feedbackData && (
              <div
                className={`p-4 rounded-xl mb-6 ${
                  feedbackData.isCorrect
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                <div className="flex items-start">
                  {feedbackData.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-400 mr-3 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 mr-3 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">
                      {feedbackData.isCorrect ? '答对了！' : '答错了'}
                    </p>
                    {!feedbackData.isCorrect && feedbackData.correctAnswer && (
                      <p className="text-white/80 text-sm mb-2">
                        正确答案: <span className="font-semibold">{feedbackData.correctAnswer}</span>
                      </p>
                    )}
                    {feedbackData.explanation && (
                      <p className="text-white/70 text-sm">
                        {feedbackData.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!showFeedback && (
              <Button
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedAnswer || isLoading}
                onClick={handleConfirmAnswer}
              >
                {isLoading ? '提交中...' : '确认答案'}
                {!isLoading && <ChevronRight className="w-5 h-5 ml-2" />}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
