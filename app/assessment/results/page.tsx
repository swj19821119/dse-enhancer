'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, BrainCircuit, AlertCircle, BarChart3 } from 'lucide-react';
import { usePlacementStore } from '@/store/placement';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

interface AbilityResult {
  readingLevel: number;
  listeningLevel: number;
  writingLevel: number;
  speakingLevel: number;
  vocabularyLevel: number;
  grammarLevel: number;
}

interface AnalysisResult {
  strongPoints: string[];
  weakPoints: string[];
}

interface ResultData {
  overallLevel: number;
  abilities: AbilityResult;
  analysis: AnalysisResult;
}

function PlacementResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('resultId');
  const { token, user } = useAuthStore();
  const { answers, currentDifficulty, reset } = usePlacementStore();

  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resultId) {
      router.push('/assessment');
      return;
    }

    fetchResults();
  }, [resultId, router]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/placement/result?resultId=${resultId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(data.message || '获取结果失败');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取结果失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: 'Level 1 (基础)',
      2: 'Level 2 (入门)',
      3: 'Level 3 (中级)',
      4: 'Level 4 (进阶)',
      5: 'Level 5 (高级)',
    };
    return labels[level] || `Level ${level}`;
  };

  const getAbilityLabel = (key: string) => {
    const labels: Record<string, string> = {
      readingLevel: '阅读',
      listeningLevel: '听力',
      writingLevel: '写作',
      speakingLevel: '口语',
      vocabularyLevel: '词汇',
      grammarLevel: '语法',
    };
    return labels[key] || key;
  };

  const getLevelColor = (level: number) => {
    const colors = {
      1: 'from-green-400 to-emerald-500',
      2: 'from-blue-400 to-indigo-500',
      3: 'from-purple-400 to-pink-500',
      4: 'from-orange-400 to-amber-500',
      5: 'from-red-400 to-rose-500',
    };
    return colors[level as keyof typeof colors] || colors[2];
  };

  const handleStartLearning = () => {
    reset();
    router.push('/study');
  };

  const handleRetest = () => {
    reset();
    router.push('/assessment');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                <BrainCircuit className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-white text-lg">正在分析你的能力...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md w-full">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">获取结果失败</h2>
              <p className="text-white/70 mb-6">{error || '未知错误'}</p>
              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                onClick={() => router.push('/assessment')}
              >
                返回重新测试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">测试完成！</h1>
          <p className="text-xl text-white/80">以下是你的DSE英语能力评估结果</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
          <CardContent className="pt-10 pb-10">
            <div className="text-center mb-8">
              <p className="text-white/60 text-sm mb-3 uppercase tracking-wider">你的DSE英语水平</p>
              <div className={`text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${getLevelColor(result.overallLevel)}`}>
                {getLevelLabel(result.overallLevel)}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white/5 rounded-xl p-5">
                <p className="text-white/60 text-sm mb-2">答题总数</p>
                <p className="text-4xl font-bold text-white">{answers.length}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5">
                <p className="text-white/60 text-sm mb-2">答对</p>
                <p className="text-4xl font-bold text-green-400">{correctCount}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5">
                <p className="text-white/60 text-sm mb-2">答错</p>
                <p className="text-4xl font-bold text-red-400">{answers.length - correctCount}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5">
                <p className="text-white/60 text-sm mb-2">正确率</p>
                <p className="text-4xl font-bold text-blue-400">{accuracy}%</p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-purple-400" />
                能力维度分析
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(result.abilities).map(([key, level]) => (
                  <div
                    key={key}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <p className="text-white/70 text-sm mb-2">{getAbilityLabel(key)}</p>
                    <p className="text-2xl font-bold text-white">Level {level}</p>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${(level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.analysis.strongPoints.length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-3 text-green-400" />
                  你的强项
                </h3>
                <ul className="text-white/80 space-y-2">
                  {result.analysis.strongPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-green-400">•</span>
                      <span>{point}能力出色，继续保持！</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.analysis.weakPoints.length > 0 && (
              <div className="mb-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <XCircle className="w-6 h-6 mr-3 text-red-400" />
                  需要加强
                </h3>
                <ul className="text-white/80 space-y-2">
                  {result.analysis.weakPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-red-400">•</span>
                      <span>{point}需要加强，建议重点复习</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-6 border border-blue-500/30 mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BrainCircuit className="w-6 h-6 mr-3 text-blue-400" />
                个性化学习建议
              </h3>
              <ul className="text-white/80 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  <span>根据你的能力水平，系统已生成个性化学习计划</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  <span>建议每天学习40分钟，稳步提升各项能力</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-blue-400">•</span>
                  <span>系统会根据你的弱项自动安排针对性练习</span>
                </li>
                {result.analysis.weakPoints.length > 0 && (
                  <li className="flex items-start">
                    <span className="mr-2 text-blue-400">•</span>
                    <span>
                      重点攻克薄弱环节，目标 Level {Math.min(result.overallLevel + 1, 5)}！
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div className="flex gap-4 flex-col sm:flex-row">
              <Button
                className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                onClick={handleStartLearning}
              >
                开始学习
              </Button>
              <Button
                variant="secondary"
                className="flex-1 h-14 text-lg bg-white/10 text-white hover:bg-white/20 border border-white/30"
                onClick={handleRetest}
              >
                再测一次
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors text-sm">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PlacementResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
          <BrainCircuit className="w-8 h-8 text-blue-400" />
        </div>
      </div>
    }>
      <PlacementResultsContent />
    </Suspense>
  );
}
