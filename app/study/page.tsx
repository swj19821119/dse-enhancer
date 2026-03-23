'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, BookText, FileText, RotateCcw, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const steps = [
  { name: '词汇', time: '10分钟', icon: BookOpen, color: 'from-blue-500 to-indigo-500' },
  { name: '语法', time: '10分钟', icon: BookText, color: 'from-green-500 to-emerald-500' },
  { name: '阅读', time: '10分钟', icon: FileText, color: 'from-purple-500 to-pink-500' },
  { name: '错题复习', time: '10分钟', icon: RotateCcw, color: 'from-orange-500 to-amber-500' },
];

export default function StudyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setIsComplete(false);
  };

  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {!isComplete ? (
          <>
            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-white/80">今日40分钟学习</span>
                <span className="text-white/80">
                  第 {currentStep + 1} 步 / 共 {steps.length} 步
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* 当前步骤 */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="pt-10 pb-10">
                <div className="text-center">
                  <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center`}>
                    <StepIcon className="w-12 h-12 text-white" />
                  </div>
                  
                  <h2 className="text-4xl font-extrabold text-white mb-4">
                    {currentStepData.name}
                  </h2>
                  <p className="text-xl text-white/70 mb-8">
                    建议时长：{currentStepData.time}
                  </p>

                  <div className="flex gap-4">
                    {currentStep > 0 && (
                      <Button
                        className="flex-1 h-14 text-lg bg-white/10 text-white hover:bg-white/20 border border-white/30"
                        onClick={handlePrevStep}
                      >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        上一步
                      </Button>
                    )}
                    <Button
                      className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      onClick={handleNextStep}
                    >
                      {currentStep < steps.length - 1 ? (
                        <>
                          下一步
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </>
                      ) : (
                        '完成今日学习！'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 所有步骤概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isPast = index < currentStep;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? 'bg-white/20 border-white/50'
                        : isPast
                        ? 'bg-green-500/20 border-green-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {isPast ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <StepIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/50'}`} />
                      )}
                    </div>
                    <p className={`text-sm text-center font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                      {step.name}
                    </p>
                  </div>
                );
              })}
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
                今日学习完成！
              </h1>
              <p className="text-lg text-white/80 mb-8">
                太棒了！你已完成今日40分钟学习！
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
              <CardContent className="pt-8 pb-8">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30 mb-8">
                  <h3 className="text-xl font-bold text-white mb-3">
                    🎉 学习成果
                  </h3>
                  <ul className="text-white/80 text-left space-y-2">
                    <li>• 完成词汇学习：10分钟</li>
                    <li>• 完成语法练习：10分钟</li>
                    <li>• 完成阅读训练：10分钟</li>
                    <li>• 完成错题复习：10分钟</li>
                    <li>• 总计：40分钟专注学习！</li>
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
                    再学一轮
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
