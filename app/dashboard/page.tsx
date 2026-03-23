'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { BookOpen, Trophy, GraduationCap, Clock, LogOut, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white">DSE Enhancer</h1>
            <p className="text-white/70">欢迎回来，{user.nickname}！</p>
          </div>
          <Button
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        {/* Quick Actions */}
        <div className="mb-10">
          <Link href="/study">
            <Button className="text-xl px-10 py-8 w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-xl shadow-blue-500/30">
              <Clock className="w-6 h-6 mr-3" />
              一键开始今日40分钟学习
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/70">学习天数</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">0 天</div>
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
                Level {user.currentLevel || 1}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/70">累计词汇</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">0 词</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/70">连续学习</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">0 天</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </main>
    </div>
  );
}
