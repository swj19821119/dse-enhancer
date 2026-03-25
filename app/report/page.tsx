'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BookOpen,
  BookText,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface ModuleResult {
  moduleType: string;
  requiredCorrect: number;
  requiredTotal: number;
  extraCorrect: number;
  extraTotal: number;
  score: number;
  accuracy: number;
  baseScore: number;
  extraScore: number;
}

interface DailyReport {
  date: string;
  totalScore: number;
  moduleBreakdown: ModuleResult[];
  accuracy: number;
  currentDifficulty: number;
  nextDifficulty: number;
  difficultyChange: number;
  recommendations: string[];
}

interface ProgressData {
  date: string;
  score: number;
  accuracy: number;
  difficulty: number;
}

const MODULE_CONFIG = {
  vocabulary: { name: '词汇', icon: '📚', color: 'from-blue-500 to-indigo-500' },
  grammar: { name: '语法', icon: '📝', color: 'from-green-500 to-emerald-500' },
  reading: { name: '阅读', icon: '📖', color: 'from-purple-500 to-pink-500' },
  listening: { name: '听力', icon: '🎧', color: 'from-cyan-500 to-teal-500' },
  error_review: { name: '错题复习', icon: '🔄', color: 'from-orange-500 to-amber-50' },
  part_b: { name: '综合练习', icon: '✍️', color: 'from-rose-500 to-red-500' },
};

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const { user } = useAuthStore();

  const [report, setReport] = useState<DailyReport | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchReport();
    fetchProgress();
  }, [user, date, timeframe]);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/scoring/daily-report?user_id=${user?.id}&date=${date}`);

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();
      if (data.success) {
        setReport(data.data.report);
      } else {
        setError(data.error || '加载报告失败');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setError('加载报告失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/scoring/progress?user_id=${user?.id}&timeframe=${timeframe}`);

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      if (data.success) {
        setProgressData(data.data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const getDifficultyIcon = () => {
    if (!report) return <Minus className="w-5 h-5 text-yellow-400" />;

    if (report.difficultyChange > 0) {
      return <TrendingUp className="w-5 h-5 text-green-400" />;
    } else if (report.difficultyChange < 0) {
      return <TrendingDown className="w-5 h-5 text-red-400" />;
    }
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  const getDifficultyMessage = () => {
    if (!report) return '';

    if (report.difficultyChange > 0) {
      return '难度提升，继续努力！';
    } else if (report.difficultyChange < 0) {
      return '难度降低，先打好基础';
    }
    return '难度保持不变';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderProgressChart = () => {
    if (progressData.length === 0) return null;

    const maxScore = Math.max(...progressData.map(d => d.score), 100);
    const chartHeight = 200;
    const chartWidth = progressData.length * 60;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-sm">分数趋势</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={timeframe === '7d' ? 'default' : 'secondary'}
              onClick={() => setTimeframe('7d')}
              className={timeframe === '7d' ? 'bg-blue-500' : 'bg-white/10 text-white'}
            >
              7天
            </Button>
            <Button
              size="sm"
              variant={timeframe === '30d' ? 'default' : 'secondary'}
              onClick={() => setTimeframe('30d')}
              className={timeframe === '30d' ? 'bg-blue-500' : 'bg-white/10 text-white'}
            >
              30天
            </Button>
          </div>
        </div>
        <div className="relative" style={{ width: chartWidth, height: chartHeight }}>
          <svg width={chartWidth} height={chartHeight}>
            {progressData.map((data, index) => {
              const x = index * 60 + 30;
              const y = chartHeight - (data.score / maxScore) * chartHeight - 20;

              return (
                <g key={index}>
                  {index > 0 && (
                    <line
                      x1={(index - 1) * 60 + 30}
                      y1={chartHeight - (progressData[index - 1].score / maxScore) * chartHeight - 20}
                      x2={x}
                      y2={y}
                      stroke="rgb(59 130 246)"
                      strokeWidth="2"
                      fill="none"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill="rgb(59 130 246)"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                  >
                    {data.score.toFixed(1)}
                  </text>
                  <text
                    x={x}
                    y={chartHeight - 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fillOpacity="0.6"
                  >
                    {data.date.slice(5)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">正在加载...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">加载失败</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
            >
              重新加载
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        {report && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {report.date}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className={`text-6xl font-bold ${getScoreColor(report.totalScore)}`}>
                      {report.totalScore.toFixed(1)}
                    </div>
                    <div className="text-white/60 text-lg mt-2">每日总分</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">总体正确率</span>
                      <span className="text-white font-semibold">
                        {(report.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">当前难度</span>
                      <span className="text-white font-semibold">
                        {report.currentDifficulty.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">明日难度</span>
                      <span className="text-white font-semibold">
                        {report.nextDifficulty.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {getDifficultyIcon()}
                    <span>难度调整</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold ${
                      report.difficultyChange > 0 ? 'text-green-400' :
                      report.difficultyChange < 0 ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {report.difficultyChange > 0 ? '+' : ''}{report.difficultyChange.toFixed(2)}
                    </div>
                    <div className="text-white/60 text-lg mt-2">{getDifficultyMessage()}</div>
                  </div>
                  <Progress value={(report.totalScore / 100) * 100} className="h-3" />
                  <div className="text-white/60 text-sm mt-2 text-center">
                    根据今日表现自动调整明日学习难度
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  模块得分明细
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.moduleBreakdown.map((module, index) => {
                    const config = MODULE_CONFIG[module.moduleType as keyof typeof MODULE_CONFIG];
                    return (
                      <Card key={index} className="bg-white/5 border border-white/10">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config?.color} flex items-center justify-center text-xl`}>
                              {config?.icon}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{config?.name}</div>
                              <div className="text-white/60 text-xs">
                                {module.requiredCorrect}/{module.requiredTotal} 正确
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-white/60">总分</span>
                              <span className={`font-semibold ${getScoreColor(module.score)}`}>
                                {module.score.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white/60">基础分</span>
                              <span className="text-white">{module.baseScore.toFixed(1)}</span>
                            </div>
                            {module.extraScore > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-white/60">额外加分</span>
                                <span className="text-green-400">+{module.extraScore.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          {module.extraTotal > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/60">
                              额外做 {module.extraTotal} 题
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white">学习趋势</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {renderProgressChart()}
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  个性化建议
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {report.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-white/90 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/study')}
                className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                开始今日学习
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="secondary"
                className="flex-1 h-14 bg-white/10 text-white hover:bg-white/20 border border-white/30"
              >
                返回首页
              </Button>
             </div>
           </>
         )}
       </div>
     </div>
   );
 }

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}>
      <ReportContent />
    </Suspense>
  );
}
