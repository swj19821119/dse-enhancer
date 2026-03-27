'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, ArrowLeft, BookOpen, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface Word {
  id: string;
  word: string;
  phonetic?: string;
  definition: string;
  example?: string;
  difficulty: number;
  status: string;
  lastReviewed?: string;
  nextReview?: string;
}

export default function NewWordsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWords = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/vocabulary/progress?user_id=${user.id}&status=unknown`);
        const data = await response.json();

        if (data.success) {
          setWords(data.data.words || []);
        } else {
          setError(data.error || '获取生词本失败');
        }
      } catch (err) {
        console.error('Failed to fetch new words:', err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, [user?.id]);

  const speakWord = useCallback((text: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;

      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleMarkAsLearned = async (wordId: string) => {
    if (!user?.id) return;

    try {
      await fetch('/api/vocabulary/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          wordId: wordId,
          known: true,
        }),
      });

      setWords(words.filter(w => w.id!== wordId));
    } catch (err) {
      console.error('Failed to mark as learned:', err);
    }
  };

  const getDifficultyColor = (diff: number) => {
    const colors: Record<number, string> = {
      1: 'bg-green-500/20 text-green-400 border-green-500/30',
      2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      5: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[diff] || colors[1];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-white/80 mb-4">请先登录后查看生词本</p>
            <Button onClick={() => router.push('/login')} className="bg-gradient-to-r from-blue-500 to-indigo-500">
              去登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            <h1 className="text-3xl font-bold text-white">生词本</h1>
          </div>
          <div className="text-white/70">
            {words.length} 个生词
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-white/20"></div>
          </div>
        ) : error ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-white/80 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                重试
              </Button>
            </CardContent>
          </Card>
        ) : words.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-12 pb-12 text-center">
              <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-2">生词本是空的</p>
              <p className="text-white/40 text-sm mb-6">在词汇闯关中标记不认识的单词会自动添加到这里</p>
              <Button onClick={() => router.push('/vocabulary')} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                开始词汇闯关
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {words.map((word) => (
              <Card key={word.id} className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">{word.word}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                          onClick={() => speakWord(word.word, word.id)}
                          disabled={speakingId === word.id}
                        >
                          {speakingId === word.id ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(word.difficulty)}`}>
                          Level {word.difficulty}
                        </span>
                      </div>
                      {word.phonetic && (
                        <p className="text-white/60 text-sm mb-2">{word.phonetic}</p>
                      )}
                      <p className="text-white text-lg mb-2">{word.definition}</p>
                      {word.example && (
                        <p className="text-white/60 text-sm italic">"{word.example}"</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleMarkAsLearned(word.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}