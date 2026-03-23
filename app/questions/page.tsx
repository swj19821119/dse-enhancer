'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react';

interface Question {
  id: string;
  type: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'vocabulary',
    difficulty: 2,
    content: 'What is the meaning of "analyse"?',
    options: ['分析', '综合', '评估', '测试'],
    correctAnswer: 0,
    explanation: '"analyse" 意为"分析"'
  },
  {
    id: '2',
    type: 'grammar',
    difficulty: 2,
    content: 'He ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 1,
    explanation: '主语是第三人称单数，用 goes'
  },
  {
    id: '3',
    type: 'grammar',
    difficulty: 3,
    content: 'Which of the following is the correct sentence?',
    options: [
      'She dont like apples',
      'She doesn\'t like apples',
      'She don\'t likes apples',
      'She doesn\'t likes apples'
    ],
    correctAnswer: 1,
    explanation: '否定句用 doesn\'t + 动词原形'
  },
  {
    id: '4',
    type: 'vocabulary',
    difficulty: 3,
    content: 'What is the antonym of "difficult"?',
    options: ['hard', 'easy', 'simple', 'complex'],
    correctAnswer: 1,
    explanation: '"difficult" 的反义词是 "easy"'
  },
];

export default function QuestionsPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: number; isCorrect: boolean }[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

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

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // 保存答案
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: currentQuestion.correctAnswer,
      isCorrect
    }]);

    // 更新分数
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // 检查是否完成
    if (currentQuestionIndex + 1 >= mockQuestions.length) {
      setIsComplete(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const restart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {!isComplete ? (
          <>
            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-white/80">题目练习</span>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    难度 {currentQuestion.difficulty}
                  </span>
                  <span className="text-white/80">
                    第 {currentQuestionIndex + 1} 题 / 共 {mockQuestions.length} 题
                  </span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 题目卡片 */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="pt-8">
                <div className="mb-6">
                  <p className="text-xl text-white font-medium mb-6 whitespace-pre-line">
                    {currentQuestion.content}
                  </p>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const showFeedback = selectedAnswer !== null;
                      const isSelected = selectedAnswer === index;
                      const isCorrectAnswer = index === currentQuestion.correctAnswer;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => !showFeedback && handleAnswerSelect(index)}
                          disabled={showFeedback}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            showFeedback
                              ? isCorrectAnswer
                                ? 'border-green-500 bg-green-500/20'
                                : isSelected
                                  ? 'border-red-500 bg-red-500/20'
                                  : 'border-white/10 bg-white/5 opacity-50'
                              : isSelected
                                ? 'border-blue-500 bg-blue-500/20 text-white'
                                : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4 font-bold">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {showFeedback && isCorrectAnswer && (
                              <CheckCircle2 className="w-6 h-6 text-green-400 ml-2" />
                            )}
                            {showFeedback && isSelected && !isCorrectAnswer && (
                              <XCircle className="w-6 h-6 text-red-400 ml-2" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 答案解析 */}
                {selectedAnswer !== null && currentQuestion.explanation && (
                  <div className={`p-4 rounded-xl mb-6 ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-orange-500/20 border border-orange-500/30'
                  }`}>
                    <p className="text-white/80">
                      💡 {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* 下一题按钮 */}
                {selectedAnswer !== null && (
                  <Button
                    className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestionIndex < mockQuestions.length - 1 ? (
                      <>
                        下一题
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      '查看结果'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          /* 完成页面 */
          <div className="text-center">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                练习完成！
              </h1>
              <p className="text-lg text-white/80 mb-8">
                太棒了！你已完成这一轮题目练习！
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
              <CardContent className="pt-8 pb-8">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 rounded-xl p-6">
                    <p className="text-white/70 text-sm mb-2">总题数</p>
                    <p className="text-3xl font-bold text-white">{mockQuestions.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6">
                    <p className="text-white/70 text-sm mb-2">答对</p>
                    <p className="text-3xl font-bold text-green-400">{score}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6">
                    <p className="text-white/70 text-sm mb-2">正确率</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {Math.round((score / mockQuestions.length) * 100)}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6">
                    <p className="text-white/70 text-sm mb-2">等级</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {score >= mockQuestions.length * 0.8 ? 'A' : score >= mockQuestions.length * 0.6 ? 'B' : score >= mockQuestions.length * 0.4 ? 'C' : 'D'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-6 border border-blue-500/30 mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">
                    📊 练习报告
                  </h3>
                  <ul className="text-white/80 text-left space-y-2">
                    <li>• 继续保持这个正确率！</li>
                    <li>• 建议重点复习错题对应的知识点</li>
                    <li>• 每天坚持练习，稳步提升！</li>
                  </ul>
                </div>

                <div className="flex gap-4 flex-col sm:flex-row">
                  <Button
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    返回首页
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 h-14 text-lg bg-white/10 text-white hover:bg-white/20 border border-white/30"
                    onClick={restart}
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    再练一次
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
