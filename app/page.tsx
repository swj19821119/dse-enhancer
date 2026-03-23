'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Trophy, Clock, Target, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-4 py-2 bg-white/10 rounded-full border border-white/20">
            <span className="text-white/80 text-sm font-medium">
              🎯 专为香港DSE学生设计
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            DSE Enhancer
          </h1>
          <p className="text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
            每天40分钟，精准提高DSE英语成绩
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/login">
              <Button className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-xl shadow-blue-500/30">
                开始学习
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" className="text-lg px-10 py-7 bg-white/10 text-white hover:bg-white/20 border border-white/30">
                免费注册
              </Button>
            </Link>
            <Link href="/study" onClick={(e) => {
              e.preventDefault();
              localStorage.setItem('guestMode', 'true');
              localStorage.setItem('guestId', 'guest_' + Date.now());
              window.location.href = '/study';
            }}>
              <Button variant="ghost" className="text-lg px-10 py-7 bg-transparent text-white hover:bg-white/10 border-2 border-white/40">
                跳过注册，直接体验
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-3">
                <BrainCircuit className="w-7 h-7 text-blue-400" />
              </div>
              <CardTitle className="text-white text-xl">AI自适应学习</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                智能分析你的弱项，每天自动安排针对性练习
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3">
                <BookOpen className="w-7 h-7 text-green-400" />
              </div>
              <CardTitle className="text-white text-xl">完整题库</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                涵盖DSE历年真题，AI辅助生成新题
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3">
                <GraduationCap className="w-7 h-7 text-purple-400" />
              </div>
              <CardTitle className="text-white text-xl">AI评分反馈</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                作文口语即时评分，详细修改建议
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-3">
                <Clock className="w-7 h-7 text-orange-400" />
              </div>
              <CardTitle className="text-white text-xl">每日40分钟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                碎片化设计，贴合课后学习场景
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center mb-3">
                <Target className="w-7 h-7 text-red-400" />
              </div>
              <CardTitle className="text-white text-xl">能力图谱</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                可视化展示听说读写四个维度
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-lime-500/20 flex items-center justify-center mb-3">
                <Trophy className="w-7 h-7 text-yellow-400" />
              </div>
              <CardTitle className="text-white text-xl">游戏化激励</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">
                排行榜激励，持续学习有动力
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">准备好提高你的DSE英语成绩了吗？</h2>
              <p className="text-lg mb-8 opacity-90">
                完全免费使用，立即开始你的DSE英语提升之旅！
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/register">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                    免费注册
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-white/30 text-lg px-8 py-6">
                    已有账号？登录
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
