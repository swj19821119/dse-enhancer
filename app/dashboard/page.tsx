'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { BookOpen, Trophy, GraduationCap, Clock, LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DSE Enhancer</h1>
            <p className="text-gray-600">欢迎回来，{user.nickname}！</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <Link href="/study">
            <Button className="text-xl px-8 py-6 w-full md:w-auto">
              <Clock className="w-5 h-5 mr-2" />
              一键开始今日40分钟学习
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">学习天数</CardTitle>
              <GraduationCap className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 天</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">当前等级</CardTitle>
              <Trophy className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {user.currentLevel || 1}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">累计词汇</CardTitle>
              <BookOpen className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 词</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">连续学习</CardTitle>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 天</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/vocabulary">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>词汇闯关</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">背单词、练发音、生词本</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/study">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <GraduationCap className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>每日学习</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">词汇、语法、阅读、听力</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/questions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Trophy className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>题库练习</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">历年真题、AI 新题</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
