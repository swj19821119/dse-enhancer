'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, BarChart3, Trophy, BookOpen, Mic, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AbilityData {
  name: string;
  level: number; // 1-5
  icon: React.ReactNode;
  color: string;
}

// Mock data - 用 mock 数据先实现
const mockAbilityData: AbilityData[] = [
  {
    name: '阅读',
    level: 3,
    icon: <BookOpen className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    name: '听力',
    level: 2,
    icon: <Mic className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: '写作',
    level: 4,
    icon: <FileText className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: '口语',
    level: 2,
    icon: <Mic className="w-5 h-5" />,
    color: 'from-orange-500 to-amber-500'
  },
  {
    name: '词汇',
    level: 3,
    icon: <BookOpen className="w-5 h-5" />,
    color: 'from-cyan-500 to-teal-500'
  },
  {
    name: '语法',
    level: 3,
    icon: <BrainCircuit className="w-5 h-5" />,
    color: 'from-red-500 to-rose-500'
  }
];

const getLevelLabel = (level: number) => {
  const labels = ['基础', '入门', '中级', '进阶', '高级'];
  return labels[level - 1] || '未知';
};

const getLevelColor = (level: number) => {
  const colors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-blue-400'];
  return colors[level - 1] || 'text-gray-400';
};

const getBarColor = (level: number) => {
  const colors = [
    'bg-gradient-to-r from-red-500 to-rose-500',
    'bg-gradient-to-r from-orange-500 to-amber-500',
    'bg-gradient-to-r from-yellow-500 to-lime-500',
    'bg-gradient-to-r from-green-500 to-emerald-500',
    'bg-gradient-to-r from-blue-500 to-indigo-500'
  ];
  return colors[level - 1] || 'bg-gradient-to-r from-gray-500 to-slate-500';
};

export default function AbilityChartPage() {
  const [abilityData, setAbilityData] = useState<AbilityData[]>(mockAbilityData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/dashboard" className="inline-block mb-4">
              <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <h1 className="text-4xl font-extrabold text-white mb-2">能力图谱</h1>
            <p className="text-white/70">
              可视化展示你的听说读写四个维度能力
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        {/* Bar Chart */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              能力等级分布
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              {abilityData.map((ability, index) => (
                <div key={ability.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">{ability.icon}</span>
                      <span className="text-white font-medium">{ability.name}</span>
                    </div>
                    <span className={`font-bold ${getLevelColor(ability.level)}`}>
                      Level {ability.level} - {getLevelLabel(ability.level)}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getBarColor(ability.level)}`}
                      style={{ width: `${(ability.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-white/70 text-sm mb-2">最高能力等级</p>
              <p className="text-3xl font-bold text-yellow-400">
                Level {Math.max(...abilityData.map(a => a.level))}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-white/70 text-sm mb-2">平均能力等级</p>
              <p className="text-3xl font-bold text-blue-400">
                Level {(abilityData.reduce((sum, a) => sum + a.level, 0) / abilityData.length).toFixed(1)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white/70 text-sm mb-2">达标维度</p>
              <p className="text-3xl font-bold text-green-400">
                {abilityData.filter(a => a.level >= 3).length} / {abilityData.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-8">
          <CardHeader>
            <CardTitle className="text-white text-xl">📊 学习建议</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="text-white/80 space-y-3">
              {abilityData.filter(a => a.level <= 2).length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">⚠️</span>
                  <span>
                    重点提升：{abilityData.filter(a => a.level <= 2).map(a => a.name).join('、')}
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">💡</span>
                <span>
                  建议每天花 40 分钟，重点突破弱项
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✅</span>
                <span>
                  继续保持强项，争取全面提升！
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
