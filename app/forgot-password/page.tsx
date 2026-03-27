'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setResetToken(data.data?.token || null);
      } else {
        setError(data.error || '请求失败，请稍后重试');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">忘记密码</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white/80">密码重置请求已提交</p>
              <p className="text-white/60 text-sm">在实际应用中，重置链接将通过邮件发送</p>
              {resetToken && (
                <div className="bg-white/10 p-3 rounded-lg border border-white/20 mt-4">
                  <p className="text-white/60 text-xs mb-1">开发模式 - 重置令牌：</p>
                  <code className="text-white text-xs break-all">{resetToken}</code>
                </div>
              )}
              <Button
                onClick={() => router.push('/reset-password')}
                className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                前往重置密码
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm block mb-2">邮箱地址</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入注册邮箱"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                disabled={loading}
              >
                {loading ? '提交中...' : '提交重置请求'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-white/60 hover:text-white"
                  onClick={() => router.push('/login')}
                >
                  返回登录
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}