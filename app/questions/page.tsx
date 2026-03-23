'use client';

import { useState } from 'react';

interface Question {
  id: string;
  type: string;
  content: string;
  options?: string[];
}

const mockQuestions: Question[] = [
  {
    id: '1',
    type: 'vocabulary',
    content: 'What is the meaning of "analyse"?',
    options: ['分析', '综合', '评估', '测试'],
  },
  {
    id: '2',
    type: 'grammar',
    content: 'He ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
  },
];

export default function QuestionsPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  const handleAnswerSelect = (option: string) => {
    setSelectedAnswer(option);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">题目练习</h1>
            <div className="text-lg">
              得分: <span className="font-bold text-blue-600">{score}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              第 {currentQuestionIndex + 1} 题 / 共 {mockQuestions.length} 题
            </p>
            <div className="text-lg font-medium mb-4">
              {currentQuestion.content}
            </div>

            {currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedAnswer && (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            >
              {currentQuestionIndex < mockQuestions.length - 1
                ? '下一题'
                : '完成'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
