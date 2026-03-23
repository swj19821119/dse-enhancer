'use client';

import { useState } from 'react';

export default function StudyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);

  const steps = [
    { name: '词汇', time: '10分钟' },
    { name: '语法', time: '10分钟' },
    { name: '阅读', time: '10分钟' },
    { name: '错题复习', time: '10分钟' },
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-2xl font-bold mb-4">今日40分钟学习</h1>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span>当前进度</span>
              <span>{currentStep + 1} / {steps.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center py-8">
            <h2 className="text-3xl font-bold mb-4">
              {steps[currentStep].name}
            </h2>
            <p className="text-xl text-gray-600">
              建议时长：{steps[currentStep].time}
            </p>
          </div>

          <div className="flex gap-4">
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                上一步
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={handleNextStep}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                下一步
              </button>
            ) : (
              <button 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                完成今日学习！
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
