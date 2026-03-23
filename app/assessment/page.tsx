'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';

interface Question {
  id: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    difficulty: 2,
    content: 'What is the meaning of "analyse"?',
    options: ['分析', '综合', '评估', '测试'],
    correctAnswer: 0,
    explanation: '"analyse" 意为"分析"'
  },
  {
    id: '2',
    difficulty: 2,
    content: 'He ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 1,
    explanation: '主语是第三人称单数，用 goes'
  },
  {
    id: '3',
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
    difficulty: 3,
    content: 'What is the antonym of "difficult"?',
    options: ['hard', 'easy', 'simple', 'complex'],
    correctAnswer: 1,
    explanation: '"difficult" 的反义词是 "easy"'
  },
  {
    id: '5',
    difficulty: 4,
    content: 'Read the passage and answer the question:\n\n"The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet."\n\nWhat is special about this sentence?',
    options: [
      'It has no verbs',
      'It contains every letter of the alphabet',
      'It is very short',
      'It has only nouns'
    ],
    correctAnswer: 1,
    explanation: '这是一个 pangram 句子，包含字母表的所有字母'
  }
];

const grades = [
  { value: 'primary', label: '小学 (小学三年级以上)' },
  { value: 'pre-secondary', label: '预初' },
  { value: 'form1', label: '中一 (Form 1)' },
  { value: 'form2', label: '中二 (Form 2)' },
  { value: 'form3', label: '中三 (Form 3)' },
  { value: 'form4', label: '中四 (Form 4)' },
  { value: 'form5', label: '中五 (Form 5)' },
  { value: 'form6', label: '中六 (Form 6)' },
];

export default function AssessmentPage() {
  const [step, setStep] = useState<'grade' | 'quiz' | 'result'>('grade');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: number; isCorrect: boolean }[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [score, setScore] = useState(0);

  const totalQuestions = 15;
  const currentQuestion = mockQuestions[currentQuestionIndex % mockQuestions.length];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    setStep('quiz');
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
      // 答对了，难度提升（不超过5）
      setCurrentDifficulty(prev => Math.min(prev + 1, 5) as 1 | 2 | 3 | 4 | 5);
    } else {
      // 答错了，难度降低（不低于1）
      setCurrentDifficulty(prev => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4 | 5);
    }

    // 检查是否完成
    if (currentQuestionIndex + 1 >= totalQuestions) {
      setStep('result');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const calculateLevel = () => {
    // 计算加权分数（考虑题目难度）
    let weightedScore = 0;
    let maxWeightedScore = 0;
    
    answers.forEach((answer, index) => {
      const question = mockQuestions[index % mockQuestions.length];
      const weight = question.difficulty; // 难度作为权重
      
      maxWeightedScore += weight;
      if (answer.isCorrect) {
        weightedScore += weight;
      }
    });

    const weightedAccuracy = maxWeightedScore > 0 ? weightedScore / maxWeightedScore : 0;
    const rawAccuracy = score / totalQuestions;
    
    // 综合考虑加权正确率和原始正确率
    const finalAccuracy = (weightedAccuracy * 0.7 + rawAccuracy * 0.3);

    // 更精细的分级
    if (finalAccuracy >= 0.85) return 5;
    if (finalAccuracy >= 0.70) return 4;
    if (finalAccuracy >= 0.50) return 3;
    if (finalAccuracy >= 0.30) return 2;
    return 1;
  };

  const getStrengthsAndWeaknesses = () => {
    // 简单分析强项和弱项
    const difficultyStats: Record<number, { total: number; correct: number }> = {
      1: { total: 0, correct: 0 },
      2: { total: 0, correct: 0 },
      3: { total: 0, correct: 0 },
      4: { total: 0, correct: 0 },
      5: { total: 0, correct: 0 },
    };

    answers.forEach((answer, index) => {
      const question = mockQuestions[index % mockQuestions.length];
      difficultyStats[question.difficulty].total++;
      if (answer.isCorrect) {
        difficultyStats[question.difficulty].correct++;
      }
    });

    // 找出强项（正确率高的难度）
    const strengths: number[] = [];
    const weaknesses: number[] = [];

    Object.entries(difficultyStats).forEach(([diff, stats]) => {
      if (stats.total >= 2) {
        const accuracy = stats.correct / stats.total;
        if (accuracy >= 0.8) {
          strengths.push(parseInt(diff));
        } else if (accuracy <= 0.4) {
          weaknesses.push(parseInt(diff));
        }
      }
    });

    return { strengths, weaknesses, difficultyStats };
  };

  const userLevel = calculateLevel();
  const { strengths, weaknesses } = getStrengthsAndWeaknesses();

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

  const getLevelLabel = (level: number) => {
    const labels = {
      1: 'Level 1 (基础)',
      2: 'Level 2 (入门)',
      3: 'Level 3 (中级)',
      4: 'Level 4 (进阶)',
      5: 'Level 5 (高级)',
    };
    return labels[level as keyof typeof labels];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* 年级选择 */}
        {step === 'grade' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <BrainCircuit className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                入学自适应测试
              </h1>
              <p className="text-lg text-white/80 mb-8">
                15分钟，15道题，精准评估你的DSE英语水平
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl text-center">
                  请选择你的年级
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {grades.map((grade) => (
                  <Button
                    key={grade.value}
                    className="w-full h-16 text-lg bg-white/10 text-white hover:bg-white/20 border border-white/30"
                    onClick={() => handleGradeSelect(grade.value)}
                  >
                    {grade.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 答题 */}
        {step === 'quiz' && (
          <div>
            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-white/80">
                  第 {currentQuestionIndex + 1} 题 / 共 {totalQuestions} 题
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentDifficulty)}`}>
                  难度 {currentDifficulty}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <p className="text-xl text-white font-medium mb-6 whitespace-pre-line">
                    {currentQuestion.content}
                  </p>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedAnswer === index
                            ? 'border-blue-500 bg-blue-500/20 text-white'
                            : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-4 font-bold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 答案反馈 */}
                {selectedAnswer !== null && (
                  <div className={`p-4 rounded-xl mb-6 ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    <div className="flex items-center">
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 mr-3" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 mr-3" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {selectedAnswer === currentQuestion.correctAnswer ? '答对了！' : '答错了'}
                        </p>
                        {currentQuestion.explanation && (
                          <p className="text-white/70 text-sm mt-1">
                            {currentQuestion.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  disabled={selectedAnswer === null}
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex + 1 >= totalQuestions ? '查看结果' : '下一题'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 结果 */}
        {step === 'result' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                测试完成！
              </h1>
              <p className="text-lg text-white/80 mb-8">
                以下是你的能力评估结果
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
              <CardContent className="pt-8 pb-8">
                <div className="mb-6">
                  <p className="text-white/70 text-sm mb-2">你的DSE英语水平</p>
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    {getLevelLabel(userLevel)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/70 text-sm">答题数</p>
                    <p className="text-3xl font-bold text-white">{totalQuestions}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/70 text-sm">答对</p>
                    <p className="text-3xl font-bold text-green-400">{score}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/70 text-sm">正确率</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {Math.round((score / totalQuestions) * 100)}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-white/70 text-sm">目标年级</p>
                    <p className="text-3xl font-bold text-white">
                      {selectedGrade ? grades.find(g => g.value === selectedGrade)?.label : '-'}
                    </p>
                  </div>
                </div>

                {/* 能力分析 */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {strengths.length > 0 && (
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                        <h3 className="text-xl font-bold text-white mb-3">
                          💪 你的强项
                        </h3>
                        <ul className="text-white/80 text-left space-y-2">
                          <li>• 难度 {strengths.join('、')} 的题目表现很好！</li>
                          <li>• 继续保持这个优势！</li>
                        </ul>
                      </div>
                    )}
                    {weaknesses.length > 0 && (
                      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30">
                        <h3 className="text-xl font-bold text-white mb-3">
                          📚 需要加强
                        </h3>
                        <ul className="text-white/80 text-left space-y-2">
                          <li>• 难度 {weaknesses.join('、')} 的题目需要多练习</li>
                          <li>• 建议重点复习这部分内容！</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-6 border border-blue-500/30 mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">
                    🎯 个性化学习建议
                  </h3>
                  <ul className="text-white/80 text-left space-y-2">
                    <li>• 根据你的水平，我们已生成个性化学习计划</li>
                    <li>• 建议每天学习40分钟，稳步提升</li>
                    <li>• 系统会根据你的弱项自动安排针对性练习</li>
                    <li>• 坚持学习，目标 Level {Math.min(userLevel + 1, 5)}！</li>
                  </ul>
                </div>

                <div className="flex gap-4 flex-col sm:flex-row">
                  <Button className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                    开始学习
                  </Button>
                  <Button variant="secondary" className="flex-1 h-14 text-lg bg-white/10 text-white hover:bg-white/20 border border-white/30">
                    再测一次
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
