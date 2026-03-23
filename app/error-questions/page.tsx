'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface ErrorQuestion {
  id: string;
  questionId: string;
  errorCount: number;
  lastWrongAt: Date;
  question: {
    id: string;
    type: string;
    content: string;
    options?: string[];
    answer?: string;
    explanation?: string;
  };
}

// Mock data for now
const mockErrorQuestions: ErrorQuestion[] = [
  {
    id: '1',
    questionId: 'q1',
    errorCount: 2,
    lastWrongAt: new Date(Date.now() - 86400000),
    question: {
      id: 'q1',
      type: 'grammar',
      content: 'He ___ to school every day.',
      options: ['go', 'goes', 'going', 'gone'],
      answer: 'goes',
      explanation: '主语是第三人称单数，用 goes'
    }
  },
  {
    id: '2',
    questionId: 'q2',
    errorCount: 1,
    lastWrongAt: new Date(Date.now() - 172800000),
    question: {
      id: 'q2',
      type: 'vocabulary',
      content: 'What is the antonym of "difficult"?',
      options: ['hard', 'easy', 'simple', 'complex'],
      answer: 'easy',
      explanation: '"difficult" 的反义词是 "easy"'
    }
  }
];

export default function ErrorQuestionsPage() {
  const [errorQuestions, setErrorQuestions] = useState<ErrorQuestion[]>(mockErrorQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<ErrorQuestion | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleRemove = (id: string) => {
    setErrorQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleReset = () => {
    setErrorQuestions([]);
  };

  const handlePractice = (question: ErrorQuestion) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
  };

  const handleBack = () => {
    setSelectedQuestion(null);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {!selectedQuestion ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-white mb-2">错题本</h1>
                <p className="text-white/70">
                  共 {errorQuestions.length} 道错题需要复习
                </p>
              </div>
              <div className="flex gap-3">
                {errorQuestions.length > 0 && (
                  <Button
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    清空错题本
                  </Button>
                )}
                <Link href="/dashboard">
                  <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/30">
                    返回首页
                  </Button>
                </Link>
              </div>
            </div>

            {/* Error Questions List */}
            {errorQuestions.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="pt-12 pb-12 text-center">
                  <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">太棒了！</h3>
                  <p className="text-white/70">
                    你的错题本是空的，继续保持！
                  </p>
                  <Link href="/study" className="mt-6 inline-block">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                      开始学习
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {errorQuestions.map((eq) => (
                  <Card key={eq.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                    <CardContent className="pt-6 pb-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 mb-2">
                            {eq.question.type === 'grammar' ? '语法' : 
                             eq.question.type === 'vocabulary' ? '词汇' : eq.question.type}
                          </span>
                          <div className="flex gap-4 text-sm text-white/60">
                            <span>错误 {eq.errorCount} 次</span>
                            <span>最后错误：{eq.lastWrongAt.toLocaleDateString('zh-CN')}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleRemove(eq.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-white text-lg font-medium mb-4">
                        {eq.question.content}
                      </p>
                      {eq.question.options && (
                        <div className="space-y-2 mb-4">
                          {eq.question.options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center p-3 rounded-lg bg-white/5 border border-white/10"
                            >
                              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3 font-bold">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="text-white/80">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        onClick={() => handlePractice(eq)}
                      >
                        练习这道题
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Practice View */
          <div>
            {/* Back Button */}
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 border border-white/30 mb-6"
              onClick={handleBack}
            >
              ← 返回错题本
            </Button>

            {/* Question Card */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
              <CardContent className="pt-8">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 mb-4">
                    {selectedQuestion.question.type === 'grammar' ? '语法' : 
                     selectedQuestion.question.type === 'vocabulary' ? '词汇' : selectedQuestion.question.type}
                  </span>
                  <p className="text-xl text-white font-medium mb-6">
                    {selectedQuestion.question.content}
                  </p>

                  {selectedQuestion.question.options && (
                    <div className="space-y-3 mb-6">
                      {selectedQuestion.question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            showAnswer
                              ? index === selectedQuestion.question.options!.indexOf(selectedQuestion.question.answer!)
                                ? 'border-green-500 bg-green-500/20'
                                : 'border-white/10 bg-white/5 opacity-50'
                              : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
                          }`}
                          onClick={() => !showAnswer && setShowAnswer(true)}
                        >
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${
                            showAnswer
                              ? index === selectedQuestion.question.options!.indexOf(selectedQuestion.question.answer!)
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 text-white/50'
                              : 'bg-white/10 text-white'
                          }`}>
                            {showAnswer && index === selectedQuestion.question.options!.indexOf(selectedQuestion.question.answer!) ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : showAnswer ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Answer Explanation */}
                  {showAnswer && (
                    <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                      <h4 className="text-white font-bold mb-2">💡 答案解析</h4>
                      {selectedQuestion.question.answer && (
                        <p className="text-white/90 mb-2">
                          正确答案：<span className="font-bold text-green-400">{selectedQuestion.question.answer}</span>
                        </p>
                      )}
                      {selectedQuestion.question.explanation && (
                        <p className="text-white/80">{selectedQuestion.question.explanation}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-6">
                    {!showAnswer ? (
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        onClick={() => setShowAnswer(true)}
                      >
                        查看答案
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/30"
                          onClick={handleBack}
                        >
                          下一题
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          onClick={() => {
                            handleRemove(selectedQuestion.id);
                            handleBack();
                          }}
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          已掌握，移除错题
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
