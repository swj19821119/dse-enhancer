'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { BookOpen, Trophy, GraduationCap, Clock, LogOut, BrainCircuit, BarChart3, XCircle, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface AbilityData {
  reading: number;
  listening: number;
  writing: number;
  speaking: number;
}

interface TrendData {
  date: string;
  score: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isGuest, setGuest } = useAuthStore();
  const [studyMode, setStudyMode] = useState<'relaxed' | 'diligent'>('relaxed');
  const [todayCompleted, setTodayCompleted] = useState(false);
  
  const [abilityData, setAbilityData] = useState<AbilityData | null>(null);
  const [trendData, setTrendData] = useState<TrendData[] | null>(null);
  const [stats, setStats] = useState({
    studyDays: 0,
    vocabulary: 0,
    consecutiveDays: 0,
    level: 'Level 1',
    averageScore: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkTodayStatus = () => {
      const lastStudy = localStorage.getItem('lastStudyDate');
      const today = new Date().toDateString();
      setTodayCompleted(lastStudy === today);
    };

    checkTodayStatus();
  }, []);

  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode');
    const guestId = localStorage.getItem('guestId');

    if (guestMode && guestId) {
      setGuest(true, guestId);
    } else if (!user) {
      router.push('/login');
    }
  }, [user, router, setGuest]);

  useEffect(() => {
    if (!user || isGuest) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [abilityRes, trendRes] = await Promise.all([
          fetch(`/api/dashboard/ability?user_id=${user.id}`),
          fetch(`/api/dashboard/trend?user_id=${user.id}&timeframe=7d`),
        ]);

        const abilityData = await abilityRes.json();
        const trendData = await trendRes.json();

        if (abilityData.success) {
          setAbilityData(abilityData.data);
        }

        if (trendData.success) {
          setTrendData(trendData.data.dailyProgress || []);
          setStats({
            studyDays: trendData.data.statistics?.totalDays || 0,
            vocabulary: abilityData.data.reading || 1,
            consecutiveDays: 0,
            level: `Level ${abilityData.data.reading || 1}`,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isGuest]);

  if (!user && !isGuest) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getLevelLabel = (level: number) => {
    const labels: Record<number, string> = {
      1: '基础',
      2: '初级',
      3: '中级',
      4: '进阶',
      5: '高级',
    };
    return labels[level] || 'Level 1';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">DSE Enhancer</h1>
            {isGuest ? (
              <p className="text-white/70">欢迎体验！</p>
            ) : (
              <p className="text-white/70">欢迎回来，{user?.nickname}！</p>
            )}
          </div>
          {isGuest ? (
            <div className="flex gap-3">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                  注册保存数据
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
                onClick={() => {
                  localStorage.removeItem('guestMode');
                  localStorage.removeItem('guestId');
                  setGuest(false, undefined);
                  router.push('/');
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {isGuest && (
          <div className="mb-10">
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  ⚠️ 体验模式
                </h3>
                <ul className="text-white/80 text-left space-y-3 mb-6">
                  <li>• 你当前正在体验模式下使用</li>
                  <li>• 你的学习进度和数据不会保存</li>
                  <li>• 注册账号后可以保存你的学习数据</li>
                  <li>• 享受更多功能，包括能力追踪、错题本等！</li>
                </ul>
                <Link href="/register">
                  <Button className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                    立即注册，保存数据
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-white font-medium">{error}</p>
          </div>
        )}

        <div className="mb-10">
          {!user || isGuest ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">学习天数</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-white">{loading ? '...' : stats.studyDays} 天</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">当前等级</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-white">
                    {loading ? '...' : stats.level}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">阅读能力</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-white">
                    {loading ? '...' : `Level ${abilityData?.reading || 1}`}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">听力能力</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-cyan-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-white">
                    {loading ? '...' : `Level ${abilityData?.listening || 1}`}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">写作能力</CardTitle>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-white">
                    {loading ? '...' : `Level ${abilityData?.writing || 1}`}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-white/80 text-center py-10">
              请先登录查看学习数据
            </p>
          )}
        </div>

        <div className="mb-10">
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-white/20"></div>
              </div>
          )}

          {!loading && !isGuest && user && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/assessment">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-[1.02]">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3">
                      <BrainCircuit className="w-7 h-7 text-purple-400" />
                    </div>
                    <CardTitle className="text-white text-xl">入学测试</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70">15分钟精准评估你的DSE英语水平</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/study">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-[1.02]">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3">
                      <GraduationCap className="w-7 h-7 text-green-400" />
                    </div>
                    <CardTitle className="text-white text-xl">每日学习</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70">词汇、语法、阅读、错题复习</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/error-questions">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-[1.02]">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-3">
                      <XCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <CardTitle className="text-white text-xl">错题本</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70">复习错题，巩固知识点</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/vocabulary">
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all cursor-pointer hover:scale-[1.02]">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-3">
                      <BookOpen className="w-7 h-7 text-blue-400" />
                    </div>
                    <CardTitle className="text-white text-xl">词汇闯关</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70">背单词、生词本、间隔重复</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {trendData && trendData.length > 0 && (
            <Card className="col-span-full bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg font-semibold">学习趋势（近7天）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 mb-2 text-sm">平均分数</p>
                    <p className="text-3xl font-extrabold text-white">
                      {trendData.statistics?.averageScore || 0}
                    </p>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {trendData.dailyProgress.map((day, index) => {
                      const date = new Date(day.date);
                      const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <span className="text-white/60 text-xs mb-1">{dayLabel}</span>
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center ${
                              day.score > Number(trendData.data.statistics?.averageScore || 0)
                                ? 'bg-green-500/20 border-2 border-green-400'
                                : 'bg-red-500/20 border-2 border-red-400'
                            }"
                          >
                            <span className="text-white text-sm font-semibold">{day.score}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
