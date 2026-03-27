'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, AlertCircle, Loader2 } from 'lucide-react';
import { usePlacementStore } from '@/store/placement';
import { useAuthStore } from '@/store/auth';

type Grade = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6';

interface GradeOption {
  value: Grade;
  label: string;
  description: string;
}

const grades: GradeOption[] = [
  // Primary (P1-P6)
  {
    value: 'p1',
    label: 'P1',
    description: '小学一年级'
  },
  {
    value: 'p2',
    label: 'P2',
    description: '小学二年级'
  },
  {
    value: 'p3',
    label: 'P3',
    description: '小学三年级'
  },
  {
    value: 'p4',
    label: 'P4',
    description: '小学四年级'
  },
  {
    value: 'p5',
    label: 'P5',
    description: '小学五年级'
  },
  {
    value: 'p6',
    label: 'P6',
    description: '小学六年级'
  },
  // Secondary (F1-F6)
  {
    value: 'f1',
    label: 'F1',
    description: '中学一年级'
  },
  {
    value: 'f2',
    label: 'F2',
    description: '中学二年级'
  },
  {
    value: 'f3',
    label: 'F3',
    description: '中学三年级'
  },
  {
    value: 'f4',
    label: 'F4',
    description: '中学四年级'
  },
  {
    value: 'f5',
    label: 'F5',
    description: '中学五年级'
  },
  {
    value: 'f6',
    label: 'F6',
    description: '中学六年级'
  },
];

export default function AssessmentPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const {
    setSessionId,
    setGrade,
    setQuestions,
    setCurrentDifficulty,
    reset,
  } = usePlacementStore();

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGradeSelect = async (grade: Grade) => {
    setSelectedGrade(grade);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/placement/start/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ grade }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '启动测试失败');
      }

      setSessionId(result.data.sessionId);
      setGrade(grade);
      setQuestions(result.data.questions);

       const initialDifficulty = getDifficultyForGrade(grade);
       setCurrentDifficulty(initialDifficulty);

      router.push('/assessment/test');
    } catch (err) {
      setError(err instanceof Error ? err.message : '启动测试失败');
      setSelectedGrade(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyForGrade = (grade: Grade): number => {
    const difficultyMap: Record<Grade, number> = {
      p1: 1.0,
      p2: 1.2,
      p3: 1.4,
      p4: 1.6,
      p5: 1.8,
      p6: 2.0,
      f1: 2.0,
      f2: 2.2,
      f3: 2.5,
      f4: 3.0,
      f5: 3.5,
      f6: 4.0,
    };
    return difficultyMap[grade];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <BrainCircuit className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">
            入学自适应测试
          </h1>
          <p className="text-xl text-white/80 mb-8">
            15道题，精准评估你的DSE英语水平
          </p>
          <div className="flex justify-center gap-8 text-white/60">
            <div className="flex items-center">
              <BrainCircuit className="w-5 h-5 mr-2" />
              <span>自适应难度</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-400 mr-2">15</span>
              <span>道题</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-400 mr-2">~10</span>
              <span>分钟</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-white">{error}</p>
            </div>
          </div>
        )}

        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              请选择你的年级
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {grades.map((grade) => {
              const isSelected = selectedGrade === grade.value;
              const difficulty = getDifficultyForGrade(grade.value);

              return (
                <button
                  key={grade.value}
                  onClick={() => !isLoading && handleGradeSelect(grade.value)}
                  disabled={isLoading}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
                  } ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {grade.label}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {grade.description}
                      </p>
                    </div>
                    {isSelected && isLoading ? (
                      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    ) : (
                      <div className="text-right">
                        <p className="text-white/60 text-xs mb-1">起始难度</p>
                        <p className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          difficulty <= 2 ? 'bg-green-500/20 text-green-400' :
                          difficulty <= 3 ? 'bg-blue-500/20 text-blue-400' :
                          difficulty <= 4 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          Level {difficulty}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            测试完成后，系统会根据你的答题情况分析各项能力并给出个性化学习建议
          </p>
        </div>
      </div>
    </div>
  );
}
