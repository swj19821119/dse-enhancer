'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, BookText } from 'lucide-react';
import type { Question } from '@/store/study';

interface GrammarModuleProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string, timeSpent: number) => Promise<void>;
  onNext: () => void;
  isLastQuestion: boolean;
}

export default function GrammarModule({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onNext,
  isLastQuestion,
}: GrammarModuleProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption || showResult) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    await onAnswer(selectedOption, timeSpent);

    const correct = selectedOption === question.answer;
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
    onNext();
  };

  const options = question.options
    ? typeof question.options === 'string'
      ? JSON.parse(question.options)
      : question.options
    : [];

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <BookText className="w-5 h-5 text-green-400" />
            语法题
          </CardTitle>
          <span className="text-white/60 text-sm">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-white text-lg leading-relaxed">{question.content}</div>

        <div className="space-y-3">
          {Object.entries(options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleOptionSelect(key)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                showResult
                  ? key === question.answer
                    ? 'bg-green-500/20 border-green-500 text-white'
                    : selectedOption === key
                    ? 'bg-red-500/20 border-red-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 cursor-not-allowed'
                  : selectedOption === key
                  ? 'bg-green-500/20 border-green-500 text-white hover:bg-green-500/30'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="font-medium mr-3">{key}.</span>
              {value as string}
            </button>
          ))}
        </div>

        {showResult && question.explanation && (
          <div
            className={`p-4 rounded-xl border-2 ${
              isCorrect
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '正确！' : '错误'}
                </p>
                <p className="text-white/70 text-sm">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交答案
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isLastQuestion ? '完成模块' : '下一题'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
