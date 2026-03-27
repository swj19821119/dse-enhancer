'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStudyStore } from '@/store/study';
import { useAuthStore } from '@/store/auth';
import VocabularyModule from './modules/VocabularyModule';
import GrammarModule from './modules/GrammarModule';
import ReadingModule from './modules/ReadingModule';
import ListeningModule from './modules/ListeningModule';
import ErrorReviewModule from './modules/ErrorReviewModule';
import PartBModule from './modules/PartBModule';
import { Play, Pause, Clock, CheckCircle2, ArrowLeft, AlertCircle, Star, TrendingUp } from 'lucide-react';

const MODULE_CONFIG = {
  vocabulary: { name: '词汇', icon: '📚', color: 'from-blue-500 to-indigo-500' },
  grammar: { name: '语法', icon: '📝', color: 'from-green-500 to-emerald-500' },
  reading: { name: '阅读', icon: '📖', color: 'from-purple-500 to-pink-500' },
  listening: { name: '听力', icon: '🎧', color: 'from-cyan-500 to-teal-500' },
  error_review: { name: '错题复习', icon: '🔄', color: 'from-orange-500 to-amber-500' },
  part_b: { name: '综合练习', icon: '✍️', color: 'from-rose-500 to-red-500' },
};

function StudyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as 'relaxed' | 'diligent') || 'relaxed';

  const {
    session_id,
    is_paused,
    is_complete,
    current_module,
    current_question,
    current_question_index,
    questions_in_module,
    questions_answered,
    time_remaining,
    module_time_remaining,
    current_module_score,
    current_module_answers,
    current_difficulty,
    startSession,
    submitAnswer,
    nextQuestion,
    completeModule,
    nextModule,
    completeSession,
    loadProgress,
    saveProgress,
    calculateModuleScore,
  } = useStudyStore();

  const { user, token } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const savedSession = localStorage.getItem('study_session');
        if (savedSession) {
          const saved = JSON.parse(savedSession);
          loadProgress(saved);
        } else {
          await startSession(mode);
        }
        setIsLoading(false);
      } catch (error: any) {
        console.error('Failed to initialize session:', error);
        setLoadingError(error.message || '启动会话失败');
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (!is_paused && !is_complete && time_remaining > 0) {
      const interval = setInterval(() => {
        useStudyStore.getState().updateTimer();
        if (useStudyStore.getState().time_remaining <= 0) {
          completeSession();
        }
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [is_paused, is_complete, time_remaining]);

  useEffect(() => {
    if (!isLoading) {
      saveProgress();
    }
  }, [current_question_index, time_remaining, module_time_remaining]);

  const handleAnswer = async (answer: string, timeSpent: number) => {
    if (!session_id) return;

    try {
      await submitAnswer(answer, timeSpent);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleNextQuestion = async () => {
    if (!session_id) return;

    if (current_question_index < questions_in_module.length - 1) {
      nextQuestion();
    } else {
      await handleModuleComplete();
    }
  };

  const handleModuleComplete = async () => {
    if (!session_id || !current_module) return;

    try {
      await calculateModuleScore(current_difficulty);

      const score = useStudyStore.getState().current_module_score;
      if (!score) return;

      const result = await completeModule(current_module, score.score);

      if (!result) return;

      if ((result as any).session_complete) {
        completeSession();
      } else if ((result as any).next_module && (result as any).questions) {
        nextModule((result as any).next_module, (result as any).questions);
      }
    } catch (error) {
      console.error('Failed to complete module:', error);
    }
  };

  const handlePause = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    useStudyStore.getState().pauseSession();
    saveProgress();
  };

  const handleResume = () => {
    useStudyStore.getState().resumeSession();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBonusInfo = () => {
    if (!current_module_answers || current_module_answers.length === 0) {
      return { showBonus: false, extraQuestions: 0, showWarning: false };
    }

    const defaultQuota = 10;
    const extraQuestions = Math.max(0, current_module_answers.length - defaultQuota);
    const showBonus = extraQuestions > 0;
    const showWarning = extraQuestions > 5;

    return { showBonus, extraQuestions, showWarning };
  };

  const getCurrentModuleComponent = () => {
    if (!current_question) return null;

    const isLastQuestion = current_question_index === questions_in_module.length - 1;

    switch (current_module) {
      case 'vocabulary':
        return (
          <VocabularyModule
            question={current_question}
            questionIndex={current_question_index}
            totalQuestions={questions_in_module.length}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            isLastQuestion={isLastQuestion}
          />
        );
      case 'grammar':
        return (
          <GrammarModule
            question={current_question}
            questionIndex={current_question_index}
            totalQuestions={questions_in_module.length}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            isLastQuestion={isLastQuestion}
          />
        );
      case 'reading':
        return (
          <ReadingModule
            question={current_question}
            questionIndex={current_question_index}
            totalQuestions={questions_in_module.length}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            isLastQuestion={isLastQuestion}
          />
        );
      case 'listening':
        return (
          <ListeningModule
            question={current_question}
            questionIndex={current_question_index}
            totalQuestions={questions_in_module.length}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            isLastQuestion={isLastQuestion}
          />
        );
      case 'error_review':
        return (
          <ErrorReviewModule
            question={current_question}
            questionIndex={current_question_index}
            totalQuestions={questions_in_module.length}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            isLastQuestion={isLastQuestion}
          />
        );
      case 'part_b':
        return (
          <PartBModule
            question={current_question}
            questionIndex={current_question_index}
            totalQuestions={questions_in_module.length}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            isLastQuestion={isLastQuestion}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl" aria-live="polite">正在加载...</div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">加载失败</h2>
            <p className="text-white/70 mb-6">{loadingError}</p>
            <div className="flex gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                重新加载
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="secondary"
                className="flex-1 bg-white/10 text-white hover:bg-white/20"
              >
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (is_complete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                今日学习完成！
              </h1>
              <p className="text-lg text-white/70 mb-8">
                太棒了！你已完成今日{mode === 'relaxed' ? '40' : '60'}分钟学习！
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                返回首页
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentConfig = MODULE_CONFIG[current_module as keyof typeof MODULE_CONFIG];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            onClick={() => {
              handlePause();
              router.push('/dashboard');
            }}
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
            aria-label="返回首页"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        <div className="grid gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentConfig?.color} flex items-center justify-center text-2xl`}>
                    {currentConfig?.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{currentConfig?.name}</h3>
                    <p className="text-white/60 text-sm">
                      {current_question_index + 1} / {questions_in_module.length} 题
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-white/60" />
                    <span className="text-white font-mono text-xl">{formatTime(module_time_remaining)}</span>
                  </div>
                  {current_module_score && (
                    <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/30">
                      <Star className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-bold text-lg">
                        {current_module_score.score.toFixed(1)}分
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {current_module_score && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">基础分</span>
                    <span className="text-white font-semibold">{current_module_score.baseScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-white/60">额外加分</span>
                    <span className="text-green-400 font-semibold">
                      +{current_module_score.extraScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {(() => {
                const { showBonus, extraQuestions, showWarning } = getBonusInfo();
                if (!showBonus) return null;

                return (
                  <div className={`mt-3 pt-3 border-t ${showWarning ? 'border-yellow-500/30' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${showWarning ? 'text-yellow-400' : 'text-blue-400'}`} />
                        <span className={showWarning ? 'text-yellow-400' : 'text-white/60'}>
                          {showWarning ? '边际递减警告' : '额外做题加分'}
                        </span>
                      </div>
                      <span className={showWarning ? 'text-yellow-400 font-semibold' : 'text-blue-400 font-semibold'}>
                        +{extraQuestions} 题
                      </span>
                    </div>
                    {showWarning && (
                      <p className="text-yellow-400/80 text-xs mt-1">
                        已做 {extraQuestions} 道额外题目，边际效益递减，建议确保正确率
                      </p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">总进度</span>
                <span className="text-white/60 text-sm">
                  {formatTime(time_remaining)} 剩余
                </span>
              </div>
              <Progress value={questions_answered * 10} className="h-2" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-white/60 text-sm">已完成 {questions_answered} 题</span>
                <span className="text-white/60 text-sm">
                  {mode === 'relaxed' ? '40' : '60'} 分钟计划
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {is_paused ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-12 pb-12 text-center">
              <Pause className="w-20 h-20 text-white/60 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">学习已暂停</h2>
              <p className="text-white/70 mb-8">
                进度已保存，随时可以继续学习
              </p>
              <Button
                onClick={handleResume}
                className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-500"
              >
                <Play className="w-5 h-5 mr-2" />
                继续学习
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <Button
                onClick={handlePause}
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
              >
                <Pause className="w-4 h-4 mr-2" />
                暂停
              </Button>
            </div>

             {getCurrentModuleComponent()}
           </>
         )}
       </div>
     </div>
   );
 }

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <StudyContent />
    </Suspense>
  );
}
