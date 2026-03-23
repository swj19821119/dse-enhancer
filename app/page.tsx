import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Trophy, Clock, Target, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            DSE Enhancer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            每天40分钟，精准提高DSE英语成绩
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button className="text-lg px-8 py-6">
                开始学习
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" className="text-lg px-8 py-6">
                免费注册
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BrainCircuit className="w-12 h-12 text-blue-600 mb-2" />
              <CardTitle>AI自适应学习</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                智能分析你的弱项，每天自动安排针对性练习
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="w-12 h-12 text-green-600 mb-2" />
              <CardTitle>完整题库</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                涵盖DSE历年真题，AI辅助生成新题
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="w-12 h-12 text-purple-600 mb-2" />
              <CardTitle>AI评分反馈</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                作文口语即时评分，详细修改建议
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="w-12 h-12 text-orange-600 mb-2" />
              <CardTitle>每日40分钟</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                碎片化设计，贴合课后学习场景
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="w-12 h-12 text-red-600 mb-2" />
              <CardTitle>能力图谱</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                可视化展示听说读写四个维度
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="w-12 h-12 text-yellow-600 mb-2" />
              <CardTitle>游戏化PK</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                排行榜激励，好友对战增加学习乐趣
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
                立即注册，开始你的7天免费试用！
              </p>
              <Link href="/register">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                  免费开始
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
