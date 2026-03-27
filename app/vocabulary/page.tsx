'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Volume2, CheckCircle2, XCircle, RotateCcw, ArrowLeft, VolumeX } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface Word {
  id: string;
  word: string;
  phonetic?: string;
  definition: string;
  example?: string;
  difficulty: number;
  topic?: string;
  status?: string;
}

export default function VocabularyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [unknownWords, setUnknownWords] = useState<string[]>([]);
  const [showDefinition, setShowDefinition] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentWord = words[currentWordIndex];
  const progress = words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

  useEffect(() => {
    const fetchWords = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/vocabulary?user_id=${user.id}&limit=15`);
        const data = await response.json();

        if (data.success) {
          setWords(data.data.words || []);
        } else {
          setError(data.error || '获取词汇失败');
        }
      } catch (err) {
        console.error('Failed to fetch words:', err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [user?.id]);

  const speakWord = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleKnown = async () => {
    if (!currentWord || !user?.id) return;

    setSubmitting(true);
    try {
      await fetch('/api/vocabulary/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          wordId: currentWord.id,
          known: true,
        }),
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setSubmitting(false);
    }

    setKnownWords([...knownWords, currentWord.word]);
    nextWord();
  };

  const handleUnknown = async () => {
    if (!currentWord || !user?.id) return;

    setSubmitting(true);
    try {
      await fetch('/api/vocabulary/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          wordId: currentWord.id,
          known: false,
        }),
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setSubmitting(false);
    }

    setUnknownWords([...unknownWords, currentWord.word]);
    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowDefinition(false);
    }
  };

  const restart = async () => {
    setCurrentWordIndex(0);
    setKnownWords([]);
    setUnknownWords([]);
    setShowDefinition(false);

    if (user?.id) {
      try {
        const response = await fetch(`/api/vocabulary?user_id=${user.id}&limit=15`);
        const data = await response.json();
        if (data.success) {
          setWords(data.data.words || []);
        }
      } catch (err) {
        console.error('Failed to fetch words:', err);
      }
    }
  };

  const getDifficultyColor = (diff: number) => {
    const colors: Record<number, string> = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800',
    };
    return colors[diff] || colors[1];
  };

  const isComplete = currentWordIndex + 1 >= words.length && words.length > 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-white/80 mb-4">请先登录后再学习词汇</p>
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-white/20" aria-label="Loading"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-white/80 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-500 to-indigo-500">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-2">暂无词汇可学习</p>
            <p className="text-white/40 text-sm mb-6">请稍后再试或联系管理员添加词汇</p>
            <Button onClick={() => router.push('/dashboard')} className="bg-gradient-to-r from-blue-500 to-indigo-500">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {!isComplete ? (
          <>
            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-white/80">
                  进度: {currentWordIndex + 1} / {words.length}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentWord.difficulty)}`}>
                  难度 {currentWord.difficulty}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 单词卡片 */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="pt-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <h2 className="text-5xl font-extrabold text-white">
                      {currentWord.word}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => speakWord(currentWord.word)}
                      disabled={isSpeaking}
                      aria-label={isSpeaking ? "停止发音" : "播放发音"}
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-6 w-6" />
                      ) : (
                        <Volume2 className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                  {currentWord.phonetic && (
                    <p className="text-2xl text-white/70 mb-6">
                      {currentWord.phonetic}
                    </p>
                  )}
                </div>

                {/* 释义和例句 - 点击显示 */}
                {!showDefinition ? (
                  <Button
                    className="w-full h-16 text-lg bg-white/10 text-white hover:bg-white/20 border border-white/30 mb-6"
                    onClick={() => setShowDefinition(true)}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    查看释义
                  </Button>
                ) : (
                  <div className="mb-8">
                    <div className="bg-white/5 rounded-xl p-6 mb-4 border border-white/10">
                      <p className="text-2xl font-medium text-white mb-2">
                        {currentWord.definition}
                      </p>
                      {currentWord.example && (
                        <p className="text-lg text-white/70 italic">
                          "{currentWord.example}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                {showDefinition && (
                  <div className="flex gap-4">
                    <Button
                      className="flex-1 h-16 text-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                      onClick={handleUnknown}
                      disabled={submitting}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      不认识，加入生词本
                    </Button>
                    <Button
                      className="flex-1 h-16 text-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      onClick={handleKnown}
                      disabled={submitting}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      认识，继续
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 统计 */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="pt-6">
                  <p className="text-white/70 text-sm mb-2">已认识</p>
                  <p className="text-3xl font-bold text-green-400">{knownWords.length}</p>
                </CardContent>
              </Card>
              <Card 
                className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/15 transition-all"
                onClick={() => router.push('/vocabulary/new-words')}
              >
                <CardContent className="pt-6">
                  <p className="text-white/70 text-sm mb-2">生词本</p>
                  <p className="text-3xl font-bold text-red-400">{unknownWords.length}</p>
                  <p className="text-white/50 text-xs mt-1">点击查看 →</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* 完成页面 */
          <div className="text-center">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                词汇闯关完成！
              </h1>
              <p className="text-lg text-white/80 mb-8">
                太棒了！你已经完成了这一轮词汇学习
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
              <CardContent className="pt-8 pb-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/70 text-sm mb-2">总词数</p>
                    <p className="text-3xl font-bold text-white">{words.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/70 text-sm mb-2">已认识</p>
                    <p className="text-3xl font-bold text-green-400">{knownWords.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/70 text-sm mb-2">生词</p>
                    <p className="text-3xl font-bold text-red-400">{unknownWords.length}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30 mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">
                    📊 学习报告
                  </h3>
                  <ul className="text-white/80 text-left space-y-2">
                    <li>• 本次正确率：{words.length > 0 ? Math.round((knownWords.length / words.length) * 100) : 0}%</li>
                    <li>• 建议重点复习生词本中的 {unknownWords.length} 个单词</li>
                    <li>• 坚持每天学习，稳步提升词汇量！</li>
                  </ul>
                </div>

                <div className="flex gap-4 flex-col sm:flex-row">
                  <Button
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    onClick={() => window.location.href = '/study'}
                  >
                    继续学习
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 h-14 text-lg bg-white/10 text-white hover:bg-white/20 border border-white/30"
                    onClick={restart}
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    再闯一次
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
