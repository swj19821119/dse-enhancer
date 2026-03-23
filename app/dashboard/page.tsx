'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // TODO: 获取用户信息
    setUser({
      nickname: '用户',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            你好，{user?.nickname || '用户'}！
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            欢迎来到 DSE Enhancer！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors">
            开始今日40分钟学习
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors">
            词汇闯关
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors">
            题目练习
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">今日进度</h2>
          <div className="text-gray-600">
            还没有学习记录，开始今天的学习吧！
          </div>
        </div>
      </div>
    </div>
  );
}
