'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface DailyProgress {
  date: string;
  score: number;
}

interface LearningTrendChartProps {
  data: DailyProgress[];
  averageScore?: number;
  timeframe?: string;
}

export function LearningTrendChart({ data, averageScore, timeframe = '7d' }: LearningTrendChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case '7d':
        return '近7天';
      case '30d':
        return '近30天';
      case '90d':
        return '近90天';
      default:
        return '近7天';
    }
  };

  const maxScore = Math.max(...data.map(d => d.score), 100);
  const yAxisMax = Math.ceil(maxScore / 20) * 20;

  const average = averageScore ?? (data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)
    : 0);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">学习趋势（{getTimeframeLabel()}）</h3>
        <div className="text-white/70 text-sm">
          平均分: <span className="text-white font-bold">{average}</span>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] text-white/50">
          <div className="text-center">
            <p className="text-lg mb-2">暂无学习数据</p>
            <p className="text-sm">开始学习后即可查看趋势</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis
                domain={[0, yAxisMax]}
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                }}
                labelFormatter={(label) => `日期: ${formatDate(label as string)}`}
                formatter={(value) => [`${value} 分`, '得分']}
              />
              <ReferenceLine
                y={average}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{
                  value: '平均',
                  fill: '#f59e0b',
                  fontSize: 12,
                  position: 'right',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-white/60 text-xs mb-1">最高分</div>
              <div className="text-white font-bold text-xl">
                {Math.max(...data.map(d => d.score), 0)}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-white/60 text-xs mb-1">最低分</div>
              <div className="text-white font-bold text-xl">
                {Math.min(...data.map(d => d.score), 0)}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-white/60 text-xs mb-1">学习天数</div>
              <div className="text-white font-bold text-xl">{data.length}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}