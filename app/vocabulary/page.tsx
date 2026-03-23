'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Volume2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface Word {
  word: string;
  phonetic?: string;
  definition: string;
  example?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

const mockWords: Word[] = [
  {
    word: 'analyse',
    phonetic: '/ˈænəlaɪz/',
    definition: 'v. 分析',
    example: 'The data can be analysed to find patterns.',
    difficulty: 2
  },
  {
    word: 'evaluate',
    phonetic: '/ɪˈvæljueɪt/',
    definition: 'v. 评估',
    example: 'We need to evaluate the results.',
    difficulty: 2
  },
  {
    word: 'comprehensive',
    phonetic: '/ˌkɒmprɪˈhensɪv/',
    definition: 'adj. 全面的',
    example: 'We need a comprehensive analysis.',
    difficulty: 3
  },
  {
    word: 'phenomenon',
    phonetic: '/fɪˈnɒmɪnən/',
    definition: 'n. 现象',
    example: 'This is an interesting phenomenon.',
    difficulty: 3
  },
  {
    word: 'significance',
    phonetic: '/sɪɡˈnɪfɪkəns/',
    definition: 'n. 重要性',
    example: 'The significance of this study is clear.',
    difficulty: 3
  },
  {
    word: 'hypothesis',
    phonetic: '/haɪˈpɒθəsɪs/',
    definition: 'n. 假设',
    example: 'We need to test this hypothesis.',
    difficulty: 4
  },
  {
    word: 'methodology',
    phonetic: '/ˌmeθəˈdɒlədʒi/',
    definition: 'n. 方法论',
    example: 'The methodology is well-designed.',
    difficulty: 4
  },
  {
    word: 'substantial',
    phonetic: '/səbˈstænʃl/',
    definition: 'adj. 大量的',
    example: 'There is a substantial improvement.',
    difficulty: 3
  },
];

export default function VocabularyPage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [unknownWords, setUnknownWords] = useState<string[]>([]);
  const [showDefinition, setShowDefinition] = useState(false);

  const currentWord = mockWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / mockWords.length) * 100;

  const handleKnown = () => {
    setKnownWords([...knownWords, currentWord.word]);
    nextWord();
  };

  const handleUnknown = () => {
    setUnknownWords([...unknownWords, currentWord.word]);
    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < mockWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowDefinition(false);
    }
  };

  const restart = () => {
    setCurrentWordIndex(0);
    setKnownWords([]);
    setUnknownWords([]);
    setShowDefinition(false);
  };

  const getDifficultyColor = (diff: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800',
    };
    return colors[diff as keyof typeof colors];
  };

  const isComplete = currentWordIndex + 1 >= mockWords.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {!isComplete ? (
          <>
            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-white/80">
                  进度: {currentWordIndex + 1} / {mockWords.length}
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
                  <h2 className="text-5xl font-extrabold text-white mb-4">
                    {currentWord.word}
                  </h2>
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
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      不认识，加入生词本
                    </Button>
                    <Button
                      className="flex-1 h-16 text-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      onClick={handleKnown}
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
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="pt-6">
                  <p className="text-white/70 text-sm mb-2">生词本</p>
                  <p className="text-3xl font-bold text-red-400">{unknownWords.length}</p>
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
                    <p className="text-3xl font-bold text-white">{mockWords.length}</p>
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
                    <li>• 本次正确率：{Math.round((knownWords.length / mockWords.length) * 100)}%</li>
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
