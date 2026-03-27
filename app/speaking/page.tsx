'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mic, Square, Play, Pause, RotateCcw, CheckCircle2, Volume2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/store/toast';

interface SpeakingQuestion {
  id: string;
  type: string;
  subType: string;
  topic: string;
  difficulty: number;
  content: {
    title: string;
    instruction: string;
    preparationTips: string[];
    timeLimit: number;
  };
  samples: {
    level3: { content: string; wordCount: number; duration: string };
    level4: { content: string; wordCount: number; duration: string };
    level5: { content: string; wordCount: number; duration: string };
  };
  explanation: string;
}

interface SelfEvaluation {
  pronunciation: boolean;
  fluency: boolean;
  content: boolean;
  interaction: boolean;
  vocabulary: boolean;
}

type RecordingState = 'idle' | 'preparing' | 'recording' | 'recorded' | 'playing';

export default function SpeakingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<'level3' | 'level4' | 'level5'>('level4');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [preparationTime, setPreparationTime] = useState(60);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<SelfEvaluation>({
    pronunciation: false,
    fluency: false,
    content: false,
    interaction: false,
    vocabulary: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/speaking?limit=10');
        const data = await response.json();

        if (data.success) {
          setQuestions(data.data.questions || []);
        }
      } catch (err) {
        console.error('Failed to fetch speaking questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      setRecordingState('recording');
      setRecordingTime(0);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        }
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState('recorded');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('无法访问麦克风，请检查权限设置');
      setRecordingState('idle');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  const playRecording = useCallback(() => {
    if (audioRef.current && audioUrl) {
      setRecordingState('playing');
      audioRef.current.play();
    }
  }, [audioUrl]);

  const handleAudioEnded = useCallback(() => {
    setRecordingState('recorded');
  }, []);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingState('idle');
    setEvaluation({
      pronunciation: false,
      fluency: false,
      content: false,
      interaction: false,
      vocabulary: false,
    });
  }, [audioUrl]);

  const toggleEvaluation = (key: keyof SelfEvaluation) => {
    setEvaluation(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user?.id || !currentQuestion || !audioUrl) return;

    try {
      setSaving(true);
      
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      await new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          await fetch('/api/speaking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              questionId: currentQuestion.id,
              audioBlob: base64Audio,
              duration: recordingTime,
              evaluation: {
                ...evaluation,
                score: Object.values(evaluation).filter(Boolean).length * 20,
              },
            }),
          });
          resolve();
        };
      });

      toast.success('保存成功！');
    } catch (error) {
      console.error('Failed to save speaking record:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetRecording();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = (diff: number) => {
    const colors: Record<number, string> = {
      1: 'bg-green-500/20 text-green-400 border-green-500/30',
      2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      4: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      5: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[diff] || colors[3];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-white/80 mb-4">请先登录后再进行口语练习</p>
            <Button onClick={() => router.push('/login')} className="bg-gradient-to-r from-purple-500 to-pink-500">
              去登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-white/20"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Mic className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-4">暂无口语题目</p>
            <Button onClick={() => router.push('/dashboard')} className="bg-gradient-to-r from-purple-500 to-pink-500">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSample = currentQuestion?.samples[selectedLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold text-white">口语练习</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getDifficultyBadge(currentQuestion.difficulty)} border`}>
              Level {currentQuestion.difficulty}
            </Badge>
            <span className="text-white/70">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">{currentQuestion.content.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 mb-4">{currentQuestion.content.instruction}</p>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-white/70 text-sm font-medium mb-2">准备要点（1分钟）</p>
                  <ul className="space-y-2">
                    {currentQuestion.content.preparationTips.map((tip, idx) => (
                      <li key={idx} className="text-white/60 text-sm flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">录音</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white mb-2">
                        {formatTime(recordingTime)}
                      </div>
                      <p className="text-white/60 text-sm">
                        {recordingState === 'recording' ? '正在录音...' : 
                         recordingState === 'recorded' ? '录音完成' :
                         '点击开始录音'}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {recordingState === 'idle' && (
                        <Button
                          onClick={startRecording}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Mic className="w-5 h-5 mr-2" />
                          开始录音
                        </Button>
                      )}

                      {recordingState === 'recording' && (
                        <Button
                          onClick={stopRecording}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Square className="w-5 h-5 mr-2" />
                          停止录音
                        </Button>
                      )}

                      {recordingState === 'recorded' && (
                        <>
                          <Button onClick={playRecording} className="bg-green-500 hover:bg-green-600">
                            <Play className="w-5 h-5 mr-2" />
                            播放录音
                          </Button>
                          <Button onClick={resetRecording} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <RotateCcw className="w-5 h-5 mr-2" />
                            重新录制
                          </Button>
                        </>
                      )}

                      {recordingState === 'playing' && (
                        <Button onClick={() => audioRef.current?.pause()} className="bg-yellow-500 hover:bg-yellow-600">
                          <Pause className="w-5 h-5 mr-2" />
                          暂停
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                    >
                      上一题
                    </Button>
                    <div className="flex gap-2">
                      {['level3', 'level4', 'level5'].map((level) => {
                        const levelLabels = { level3: 'Level 3', level4: 'Level 4', level5: 'Level 5' };
                        return (
                          <Button
                            key={level}
                            size="sm"
                            variant={selectedLevel === level ? 'default' : 'outline'}
                            className={selectedLevel === level 
                              ? 'bg-purple-500 hover:bg-purple-600' 
                              : 'border-white/20 text-white hover:bg-white/10'
                            }
                            onClick={() => setSelectedLevel(level as typeof selectedLevel)}
                          >
                            {levelLabels[level as keyof typeof levelLabels]}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={handleNext}
                      disabled={currentIndex === questions.length - 1}
                    >
                      下一题
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">自评清单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'pronunciation' as const, label: '发音准确' },
                    { key: 'fluency' as const, label: '流利表达' },
                    { key: 'content' as const, label: '内容完整' },
                    { key: 'vocabulary' as const, label: '词汇丰富' },
                    { key: 'interaction' as const, label: '互动自然' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleEvaluation(item.key)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        evaluation[item.key]
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${evaluation[item.key] ? 'text-green-400' : 'text-white/40'}`} />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-white/70 text-sm mb-1">自评分：{Object.values(evaluation).filter(Boolean).length * 20} / 100</p>
                  <p className="text-white/40 text-xs">{currentQuestion.explanation}</p>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving || !audioUrl}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {saving ? '保存中...' : '保存记录'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">参考范文</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(currentSample?.content || '');
                      utterance.lang = 'en-US';
                      utterance.rate = 0.9;
                      speechSynthesis.speak(utterance);
                    }}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    朗读
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getDifficultyBadge(selectedLevel === 'level3' ? 3 : selectedLevel === 'level4' ? 4 : 5)}>
                    {selectedLevel === 'level3' ? '基础' : selectedLevel === 'level4' ? '良好' : '优秀'}
                  </Badge>
                  <span className="text-white/60 text-sm">
                    {currentSample?.wordCount} 词 · {currentSample?.duration}
                  </span>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <pre className="whitespace-pre-wrap text-white/90 text-sm font-sans">
                    {currentSample?.content}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">口语技巧</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>开头要有问候语，结尾要有感谢</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>控制语速，不要过快或过慢</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>使用连接词串联观点（First, Second, In conclusion）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>注意时态和主谓一致</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>适当加入个人观点和例子</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl || undefined} onEnded={handleAudioEnded} className="hidden" />
    </div>
  );
}