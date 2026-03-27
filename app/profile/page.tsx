'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import { User, Mail, GraduationCap, Target, BookOpen, Save, ArrowLeft } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  grade: string | null;
  targetLevel: number | null;
  currentLevel: number | null;
  isVip: boolean;
  studyMode: string | null;
  createdAt: string;
  abilities: {
    readingLevel: number;
    listeningLevel: number;
    writingLevel: number;
    speakingLevel: number;
    vocabularyLevel: number;
    grammarLevel: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, setUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [grade, setGrade] = useState('');
  const [targetLevel, setTargetLevel] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setProfile(data.data.user);
          setNickname(data.data.user.nickname);
          setGrade(data.data.user.grade || '');
          setTargetLevel(data.data.user.targetLevel || 3);
        } else {
          setError(data.error || '获取用户信息失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, router]);

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname,
          grade: grade || undefined,
          targetLevel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data.user);
        setUser({
          ...user!,
          nickname: data.data.user.nickname,
        });
        setSuccess('保存成功！');
      } else {
        setError(data.error || '保存失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = {
      1: 'bg-green-500 text-white',
      2: 'bg-blue-500 text-white',
      3: 'bg-yellow-500 text-white',
      4: 'bg-orange-500 text-white',
      5: 'bg-red-500 text-white',
    };
    return colors[level as keyof typeof colors] || colors[1];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-white/80 mb-4">请先登录</p>
            <Button onClick={() => router.push('/login')} className="bg-gradient-to-r from-blue-500 to-indigo-500">
              去登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-white/20"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-white">个人资料</h1>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white/70">邮箱</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-white/50" />
                  <span className="text-white">{profile?.email}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="nickname" className="text-white/70">昵称</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入昵称"
                  className="bg-white/5 border-white/20 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="grade" className="text-white/70 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  年级
                </Label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="">请选择年级</option>
                  <option value="form1">中一 (Form 1)</option>
                  <option value="form2">中二 (Form 2)</option>
                  <option value="form3">中三 (Form 3)</option>
                  <option value="form4">中四 (Form 4)</option>
                  <option value="form5">中五 (Form 5)</option>
                  <option value="form6">中六 (Form 6)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="targetLevel" className="text-white/70 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  目标DSE等级 (1-5)
                </Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setTargetLevel(level)}
                      className={`w-12 h-12 rounded-lg font-bold transition-all ${
                        targetLevel === level
                          ? getLevelColor(level)
                          : 'bg-white/10 text-white/50 hover:bg-white/20'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                能力等级
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'readingLevel', label: '阅读', value: profile?.abilities.readingLevel || 1 },
                  { key: 'listeningLevel', label: '听力', value: profile?.abilities.listeningLevel || 1 },
                  { key: 'writingLevel', label: '写作', value: profile?.abilities.writingLevel || 1 },
                  { key: 'speakingLevel', label: '口语', value: profile?.abilities.speakingLevel || 1 },
                  { key: 'vocabularyLevel', label: '词汇', value: profile?.abilities.vocabularyLevel || 1 },
                  { key: 'grammarLevel', label: '语法', value: profile?.abilities.grammarLevel || 1 },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <p className="text-white/60 text-sm mb-1">{item.label}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-sm ${
                            i < item.value ? 'bg-blue-400' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-white font-bold mt-1">Level {item.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-sm mt-4 text-center">
                能力等级通过入学测试和日常学习自动更新
              </p>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
              {success}
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                保存中...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                保存修改
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-white/50 text-sm">
              注册时间：{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('zh-CN') : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}