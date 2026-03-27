'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Layers, Headphones, BookOpen, BookText, Volume2, VolumeX } from 'lucide-react';
import type { Question } from '@/store/study';

interface PartBModuleProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (answer: string, timeSpent: number) => Promise<void>;
  onNext: () => void;
  isLastQuestion: boolean;
}

const MODULE_TYPE_ICON: Record<string, { icon: typeof Layers; label: string; color: string }> = {
  vocabulary: { icon: BookOpen, label: '词汇Part B', color: 'text-blue-400' },
  grammar: { icon: BookText, label: '语法Part B', color: 'text-green-400' },
  reading: { icon: Layers, label: '阅读Part B', color: 'text-purple-400' },
  listening: { icon: Headphones, label: '听力Part B', color: 'text-cyan-400' },
};

export default function PartBModule({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onNext,
  isLastQuestion,
}: PartBModuleProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());
  const [isPlaying, setIsPlaying] = useState(false);

  const questionType = question.type as keyof typeof MODULE_TYPE_ICON;
  const typeInfo = MODULE_TYPE_ICON[questionType] || MODULE_TYPE_ICON.vocabulary;
  const TypeIcon = typeInfo.icon;

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
    setIsPlaying(false);
    onNext();
  };

  const handlePlayAudio = () => {
    if ('speechSynthesis' in window && question.content) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.content);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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
            <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
            {typeInfo.label}
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm">
              {questionIndex + 1} / {totalQuestions}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Level {question.difficulty}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-white text-lg leading-relaxed">{question.content}</div>

        {questionType === 'listening' && (
          <div className="flex justify-center">
            <Button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className="h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-5 h-5 mr-2" />
                  播放中...
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 mr-2" />
                  播放音频
                </>
              )}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {Array.isArray(options) ? (
            options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(String.fromCharCode(65 + index))}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  showResult
                    ? option === question.answer
                      ? 'border-green-500 bg-green-500/20'
                      : selectedOption === String.fromCharCode(65 + index)
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-white/10 bg-white/5 opacity-50'
                    : selectedOption === String.fromCharCode(65 + index)
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
                }`}
              >
                <span
                  className={`w-10 h-10 rounded-full inline-flex items-center justify-center mr-4 font-bold ${
                    showResult
                      ? option === question.answer
                        ? 'bg-green-500 text-white'
                        : selectedOption === String.fromCharCode(65 + index)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/10 text-white/50'
                      : selectedOption === String.fromCharCode(65 + index)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={showResult && option === question.answer ? 'text-green-400 font-bold' : ''}>
                  {option}
                </span>
              </button>
            ))
          ) : (
            Object.entries(options).map(([key, value]) => {
              const isCorrectOption = key === question.answer;
              return (
                <button
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showResult
                      ? isCorrectOption
                        ? 'border-green-500 bg-green-500/20'
                        : selectedOption === key
                          ? 'border-red-500 bg-red-500/20'
                          : 'border-white/10 bg-white/5 opacity-50'
                      : selectedOption === key
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/30 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white/10'
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-full inline-flex items-center justify-center mr-4 font-bold ${
                      showResult
                        ? isCorrectOption
                          ? 'bg-green-500 text-white'
                          : selectedOption === key
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white/50'
                        : selectedOption === key
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white'
                    }`}
                  >
                    {key}
                  </span>
                  <span className={showResult && isCorrectOption ? 'text-green-400 font-bold' : ''}>
                    {String(value)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={selectedOption || ''}
            onChange={(e) => !showResult && setSelectedOption(e.target.value.toUpperCase())}
            placeholder="或输入答案 (A/B/C/D)"
            disabled={showResult}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {showResult && (
          <div
            className={`p-6 rounded-xl border mb-6 ${
              isCorrect
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`text-lg font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '回答正确！' : '回答错误'}
                </h3>
                {!isCorrect && (
                  <p className="text-white/90 mb-2">
                    正确答案：<span className="font-bold">{question.answer}</span>
                  </p>
                )}
                {question.explanation && (
                  <p className="text-white/80">{question.explanation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {!showResult ? (
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 h-14"
              onClick={handleSubmit}
              disabled={!selectedOption}
            >
              提交答案
            </Button>
          ) : (
            <>
              {!isCorrect && (
                <Button
                  variant="secondary"
                  className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/30 h-14"
                  onClick={() => {
                    setShowResult(false);
                    setSelectedOption(null);
                    setIsCorrect(null);
                  }}
                >
                  再试一次
                </Button>
              )}
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-14"
                onClick={handleNext}
              >
                {isLastQuestion ? '完成练习' : '下一题'}
              </Button>
            </>
          )}
        </div>

        {!showResult && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm">
              <strong>Part B 提示：</strong>这是高难度综合练习题，题目来源于各模块的进阶内容。
              请仔细阅读题目，合理分配答题时间。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}