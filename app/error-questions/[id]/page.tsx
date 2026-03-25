'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, RotateCcw } from 'lucide-react';
import { getStageDescription, getStageIntervalText, getMasteryProgress } from '@/lib/ebbinghaus';

interface ErrorDetail {
  id: string;
  question_id: string;
  question_type: string;
  question_content: string;
  question_options?: string[];
  question_answer?: string;
  question_explanation?: string;
  question_difficulty: number;
  question_topic?: string;
  error_count: number;
  stage: number;
  next_review: string;
  is_mastered: boolean;
  last_wrong_at: string;
  created_at: string;
}

export default function ErrorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const errorId = params.id as string;
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadErrorDetail();
  }, [errorId]);

  const loadErrorDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/errors/list`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      const data = await response.json();

      if (data.code === 0) {
        const error = data.data.errors.find((e: ErrorDetail) => e.id === errorId);
        if (error) {
          setErrorDetail(error);
        } else {
          console.error('Error not found');
        }
      }
    } catch (error) {
      console.error('Failed to load error detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('确定要将此错题重置到阶段1吗？')) return;

    setResetting(true);
    try {
      const response = await fetch('/api/errors/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          error_id: errorId,
          is_correct: false,
        }),
      });

      const data = await response.json();

      if (data.code === 0) {
        loadErrorDetail();
      } else {
        alert('重置失败：' + data.message);
      }
    } catch (error) {
      console.error('Failed to reset error:', error);
      alert('重置失败，请稍后重试');
    } finally {
      setResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white/70">加载中...</div>
      </div>
    );
  }

  if (!errorDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">错题不存在</h3>
            <p className="text-white/80 mb-6">未找到该错题记录</p>
            <Link href="/error-questions">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                返回错题本
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = getMasteryProgress(errorDetail.stage);
  const nextReviewDate = new Date(errorDetail.next_review);
  const isOverdue = nextReviewDate < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/error-questions" className="text-white/70 hover:text-white transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回错题本
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-2xl">错题详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  {errorDetail.question_type === 'grammar'
                    ? '语法'
                    : errorDetail.question_type === 'vocabulary'
                      ? '词汇'
                      : errorDetail.question_type === 'reading'
                        ? '阅读'
                        : errorDetail.question_type}
                </span>
                {errorDetail.question_topic && (
                  <span className="text-white/60 text-sm">{errorDetail.question_topic}</span>
                )}
              </div>

              <h2 className="text-xl text-white font-medium">{errorDetail.question_content}</h2>

              {errorDetail.question_options && (
                <div className="space-y-3">
                  {errorDetail.question_options.map((option, index) => {
                    const isCorrect = option === errorDetail.question_answer;
                    return (
                      <div
                        key={index}
                        className={`flex items-center p-4 rounded-xl border-2 ${
                          isCorrect
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <span
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${
                            isCorrect ? 'bg-green-500 text-white' : 'bg-white/10 text-white'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className={isCorrect ? 'text-green-400 font-bold' : 'text-white/80'}>
                          {option}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {errorDetail.question_explanation && (
                <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <h3 className="text-white font-bold mb-2">💡 答案解析</h3>
                  {errorDetail.question_answer && (
                    <p className="text-white/90 mb-2">
                      正确答案：<span className="font-bold text-green-400">{errorDetail.question_answer}</span>
                    </p>
                  )}
                  <p className="text-white/80">{errorDetail.question_explanation}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white/60 text-sm mb-1">错误次数</p>
                  <p className="text-white font-bold text-lg">{errorDetail.error_count} 次</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">最后错误时间</p>
                  <p className="text-white font-bold text-lg">
                    {new Date(errorDetail.last_wrong_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl">复习进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80">当前阶段：{getStageDescription(errorDetail.stage)}</span>
                  <span className="text-white/60">阶段 {errorDetail.stage} / 8</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-white/60 text-sm mb-1">下次复习间隔</p>
                  <p className="text-white font-bold text-lg">{getStageIntervalText(errorDetail.stage)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">下次复习时间</p>
                  <p className={`font-bold text-lg ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                    {nextReviewDate.toLocaleDateString('zh-CN')} {nextReviewDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    {isOverdue && <span className="ml-2 text-sm">（已逾期）</span>}
                  </p>
                </div>
              </div>

              {errorDetail.is_mastered && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 mt-4">
                  <p className="text-green-400 font-bold text-center">✓ 此错题已掌握</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          {!errorDetail.is_mastered && (
            <Button
              variant="secondary"
              className="flex-1 bg-white/10 text-white hover:bg-white/20 border border-white/30 h-14"
              onClick={handleReset}
              disabled={resetting}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {resetting ? '重置中...' : '重置到阶段1'}
            </Button>
          )}
          <Link href="/error-questions/review" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 h-14">
              开始复习
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
