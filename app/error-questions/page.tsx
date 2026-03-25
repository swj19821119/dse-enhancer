'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useErrorNotebookStore } from '@/store/errorNotebook';
import { XCircle, BookOpen, Clock, Trophy, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getMasteryProgress, getStageDescription } from '@/lib/ebbinghaus';

export default function ErrorQuestionsPage() {
  const router = useRouter();
  const { stats, loadStats, isLoading } = useErrorNotebookStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadStats();
  }, [loadStats]);

  const handleStartReview = () => {
    router.push('/error-questions/review');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
            ← 返回首页
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">错题本</h1>
          <p className="text-white/70">Ebbinghaus 8阶段间隔重复系统，帮你高效掌握错题</p>
        </div>

        {isLoading && !stats ? (
          <div className="text-center text-white/70 py-20">
            加载中...
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">总错题数</CardTitle>
                  <XCircle className="w-5 h-5 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.total_errors}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">今日待复习</CardTitle>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.due_today_count}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">已掌握</CardTitle>
                  <Trophy className="w-5 h-5 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.mastered_count}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">复习记录</CardTitle>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.review_history_total}</div>
                </CardContent>
              </Card>
            </div>

            {stats.due_today_count > 0 && (
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-8">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        🎯 今日有 {stats.due_today_count} 道错题待复习
                      </h3>
                      <p className="text-white/80">
                        按照Ebbinghaus遗忘曲线，及时复习可以极大提高记忆效果
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleStartReview}
                      className="h-16 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <BookOpen className="w-6 h-6 mr-2" />
                      开始今日复习
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
              <CardHeader>
                <CardTitle className="text-white text-xl">阶段分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.stage_breakdown.map((stage) => {
                    const progress = getMasteryProgress(stage.stage);
                    return (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                                stage.stage <= 2
                                  ? 'bg-red-500'
                                  : stage.stage <= 4
                                    ? 'bg-yellow-500'
                                    : stage.stage <= 6
                                      ? 'bg-blue-500'
                                      : 'bg-green-500'
                              }`}
                            >
                              {stage.stage}
                            </div>
                            <span className="text-white/80 text-sm">
                              {getStageDescription(stage.stage)}
                            </span>
                          </div>
                          <span className="text-white font-bold">{stage.count} 题</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {stats.due_today_count === 0 && (
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                <CardContent className="pt-8 pb-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">太棒了！</h3>
                  <p className="text-white/80">
                    今日没有待复习的错题，继续保持！
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-8 pb-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">加载失败</h3>
              <p className="text-white/80 mb-4">无法加载错题数据，请稍后重试</p>
              <Button onClick={loadStats}>重新加载</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
