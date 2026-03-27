'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, FileText, Save, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface WritingQuestion {
  id: string;
  type: string;
  subType: string;
  topic: string;
  difficulty: number;
  content: {
    title: string;
    instruction: string;
    wordLimit: number;
  };
  samples: {
    level3: { content: string; wordCount: number; highlights: string[] };
    level4: { content: string; wordCount: number; highlights: string[] };
    level5: { content: string; wordCount: number; highlights: string[] };
  };
  explanation: string;
}

interface SelfEvaluation {
  content: boolean;
  organization: boolean;
  language: boolean;
  vocabulary: boolean;
  grammar: boolean;
}

export default function WritingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<WritingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'level3' | 'level4' | 'level5'>('level4');
  const [showSample, setShowSample] = useState(false);
  const [evaluation, setEvaluation] = useState<SelfEvaluation>({
    content: false,
    organization: false,
    language: false,
    vocabulary: false,
    grammar: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentQuestion = questions[currentIndex];
  const wordCount = userAnswer.trim().split(/\s+/).filter(w => w.length > 0).length;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/writing?limit=10');
        const data = await response.json();

        if (data.success) {
          setQuestions(data.data.questions || []);
        }
      } catch (err) {
        console.error('Failed to fetch writing questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleSave = async () => {
    if (!user?.id || !currentQuestion || !userAnswer.trim()) return;

    try {
      setSaving(true);
      const response = await fetch('/api/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          questionId: currentQuestion.id,
          userAnswer,
          wordCount,
          evaluation: {
            ...evaluation,
            score: Object.values(evaluation).filter(Boolean).length * 20,
          },
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save writing:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowSample(false);
      setEvaluation({
        content: false,
        organization: false,
        language: false,
        vocabulary: false,
        grammar: false,
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer('');
      setShowSample(false);
      setEvaluation({
        content: false,
        organization: false,
        language: false,
        vocabulary: false,
        grammar: false,
      });
    }
  };

  const toggleEvaluation = (key: keyof SelfEvaluation) => {
    setEvaluation(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-white/80 mb-4">请先登录后再进行写作练习</p>
            <Button onClick={() => router.push('/login')} className="bg-gradient-to-r from-blue-500 to-indigo-500">
              去登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-white/20"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-4">暂无写作题目</p>
            <Button onClick={() => router.push('/dashboard')} className="bg-gradient-to-r from-blue-500 to-indigo-500">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDifficultyBadge = (diff: number) => {
    const colors: Record<number, string> = {
      1: 'bg-green-500/20 text-green-400 border-green-500/30',
      2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      5: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[diff] || colors[3];
  };

  const currentSample = currentQuestion?.samples[selectedLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold text-white">写作练习</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getDifficultyBadge(currentQuestion.difficulty)} border`}>
              Level {currentQuestion.difficulty}
            </Badge>
            <span className="text-white/70">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">{currentQuestion.content.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 mb-4">{currentQuestion.content.instruction}</p>
                <p className="text-white/60 text-sm">
                  建议字数：{currentQuestion.content.wordLimit} 字
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">你的作文</CardTitle>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/60 text-sm">
                    字数：{wordCount} / {currentQuestion.content.wordLimit}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                    >
                      上一题
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={handleNext}
                      disabled={currentIndex === questions.length - 1}
                    >
                      下一题
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="在此输入你的作文..."
                  className="min-h-[300px] bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400"
                />
                <div className="flex justify-between items-center mt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !userAnswer.trim()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : saved ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {saved ? '已保存' : '保存'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">自评清单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'content' as const, label: '内容完整' },
                    { key: 'organization' as const, label: '组织清晰' },
                    { key: 'language' as const, label: '语言流畅' },
                    { key: 'vocabulary' as const, label: '词汇丰富' },
                    { key: 'grammar' as const, label: '语法正确' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleEvaluation(item.key)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        evaluation[item.key]
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${evaluation[item.key] ? 'text-green-400' : 'text-white/40'}`} />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm">
                    自评分：{Object.values(evaluation).filter(Boolean).length * 20} / 100
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">范文对比</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => setShowSample(!showSample)}
                  >
                    {showSample ? '隐藏范文' : '显示范文'}
                  </Button>
                </div>
              </CardHeader>
              {showSample && (
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    {(['level3', 'level4', 'level5'] as const).map((level) => {
                      const levelLabels = { level3: 'Level 3', level4: 'Level 4', level5: 'Level 5' };
                      return (
                        <Button
                          key={level}
                          size="sm"
                          variant={selectedLevel === level ? 'default' : 'outline'}
                          className={selectedLevel === level 
                            ? 'bg-blue-500 hover:bg-blue-600' 
                            : 'border-white/20 text-white hover:bg-white/10'
                          }
                          onClick={() => setSelectedLevel(level)}
                        >
                          {levelLabels[level]}
                        </Button>
                      );
                    })}
                  </div>

                  {currentSample && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getDifficultyBadge(
                          selectedLevel === 'level3' ? 3 : selectedLevel === 'level4' ? 4 : 5
                        )}>
                          {selectedLevel === 'level3' ? '基础' : selectedLevel === 'level4' ? '良好' : '优秀'}
                        </Badge>
                        <span className="text-white/60 text-sm">
                          {currentSample.wordCount} 词
                        </span>
                      </div>

                      <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
                        <pre className="whitespace-pre-wrap text-white/90 text-sm font-sans">
                          {currentSample.content}
                        </pre>
                      </div>

                      <div className="space-y-2">
                        <p className="text-white/70 text-sm font-medium">要点分析：</p>
                        <ul className="space-y-1">
                          {currentSample.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-white/60 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">写作技巧</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>开头要明确表明目的，使用恰当的称呼</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>中间段落要有逻辑，使用连接词串联</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>结尾要总结并表达期望或号召行动</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>注意字数控制，不要超出太多</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>检查语法和拼写错误</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}