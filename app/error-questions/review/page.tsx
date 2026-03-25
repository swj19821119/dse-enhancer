'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useErrorNotebookStore, ErrorRecord } from '@/store/errorNotebook';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { getStageDescription, getStageIntervalText } from '@/lib/ebbinghaus';

export default function ErrorReviewPage() {
  const router = useRouter();
  const { dueErrors, currentReviewIndex, loadDueErrors, submitReview, isLoading } = useErrorNotebookStore();
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentError = dueErrors[currentReviewIndex];
  const progress = dueErrors.length > 0 ? ((currentReviewIndex + 1) / dueErrors.length) * 100 : 0;

  useEffect(() => {
    loadDueErrors();
  }, [loadDueErrors]);

  useEffect(() => {
    setUserAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
  }, [currentReviewIndex]);

  const handleSubmit = async () => {
    if (!currentError || !userAnswer.trim()) return;

    const correct = userAnswer.trim().toLowerCase() === (currentError.question_answer || '').toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    await submitReview(currentError.id, correct);
  };

  const handleNext = () => {
    if (currentReviewIndex < dueErrors.length - 1) {
      setShowFeedback(false);
      setUserAnswer('');
    } else {
      router.push('/error-questions');
    }
  };

  const handleRetry = () => {
    setShowFeedback(false);
    setIsCorrect(false);
  };

  if (!currentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/70">加载中...</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">没有待复习的错题</h3>
                <p className="text-white/80 mb-6">太棒了！你已完成所有待复习的错题</p>
                <div className="flex gap-3">
                  <Link href="/error-questions" className="flex-1">
                    <Button className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/30">
                      返回错题本
                    </Button>
                  </Link>
                  <Link href="/study" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                      开始学习
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/error-questions" className="text-white/70 hover:text-white transition-colors flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回错题本
            </Link>
            <div className="text-white/80">
              第 {currentReviewIndex + 1} / {dueErrors.length} 题
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-white/60 text-sm mt-2 text-center">复习进度: {Math.round(progress)}%</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardContent className="pt-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  {currentError.question_type === 'grammar'
                    ? '语法'
                    : currentError.question_type === 'vocabulary'
                      ? '词汇'
                      : currentError.question_type === 'reading'
                        ? '阅读'
                        : currentError.question_type}
                </span>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>错误 {currentError.error_count} 次</span>
                  <span>•</span>
                  <span>{getStageDescription(currentError.stage)}</span>
                </div>
              </div>

              <h2 className="text-xl text-white font-medium mb-6">{currentError.question_content}</h2>

              {currentError.question_options && (
                <div className="space-y-3 mb-6">
                  {currentError.question_options.map((option, index) => {
                    const isCorrectOption =
                      index === currentError.question_options?.indexOf(currentError.question_answer || '');
                    const isSelected = userAnswer.trim() === option;

                    return (
                      <div
                        key={index}
                        className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          showFeedback
                            ? isCorrectOption
                              ? 'border-green-500 bg-green-500/20'
                              : isSelected && !isCorrect
                                ? 'border-red-500 bg-red-500/20'
                                : 'border-white/10 bg-white/5 opacity-50'
                            : isSelected
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
                        }`}
                        onClick={() => !showFeedback && setUserAnswer(option)}
                      >
                        <span
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${
                            showFeedback
                              ? isCorrectOption
                                ? 'bg-green-500 text-white'
                                : isSelected && !isCorrect
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white/10 text-white/50'
                              : isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 text-white'
                          }`}
                        >
                          {showFeedback && isCorrectOption ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : showFeedback && isSelected && !isCorrect ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </span>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mb-6">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={showFeedback}
                  placeholder={currentError.question_options ? '选择上方答案' : '请输入答案'}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {showFeedback && (
                <div
                  className={`p-6 rounded-xl border mb-6 ${
                    isCorrect
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                      : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h3 className={`text-lg font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? '回答正确！' : '回答错误'}
                      </h3>
                      <p className="text-white/90 mb-2">
                        正确答案：<span className="font-bold">{currentError.question_answer}</span>
                      </p>
                      {currentError.question_explanation && (
                        <p className="text-white/80">{currentError.question_explanation}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/60 mt-4 pt-4 border-t border-white/10">
                    <span>当前阶段：{currentError.stage}</span>
                    <span>•</span>
                    <span>
                      下次复习：{isCorrect ? getStageIntervalText(Math.min(8, currentError.stage + 1)) : getStageIntervalText(Math.max(1, currentError.stage - 2))}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                {!showFeedback ? (
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 h-14"
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim() || isLoading}
                  >
                    提交答案
                  </Button>
                ) : (
                  <>
                    {!isCorrect && (
                      <Button
                        variant="secondary"
                        className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/30 h-14"
                        onClick={handleRetry}
                      >
                        再试一次
                      </Button>
                    )}
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-14"
                      onClick={handleNext}
                    >
                      {currentReviewIndex < dueErrors.length - 1 ? (
                        <>
                          下一题
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </>
                      ) : (
                        '完成复习'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
