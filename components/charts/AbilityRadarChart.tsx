'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface AbilityRadarChartProps {
  data: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  };
}

const skillLabels: Record<string, string> = {
  reading: '阅读',
  listening: '听力',
  writing: '写作',
  speaking: '口语',
};

export function AbilityRadarChart({ data }: AbilityRadarChartProps) {
  const chartData = [
    { skill: '阅读', value: data.reading || 1, fullMark: 5 },
    { skill: '听力', value: data.listening || 1, fullMark: 5 },
    { skill: '写作', value: data.writing || 1, fullMark: 5 },
    { skill: '口语', value: data.speaking || 1, fullMark: 5 },
  ];

  const averageLevel = (
    (data.reading + data.listening + data.writing + data.speaking) / 4
  ).toFixed(1);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">能力雷达图</h3>
        <div className="text-white/70 text-sm">
          平均等级: <span className="text-white font-bold">{averageLevel}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 14 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="能力等级"
            dataKey="value"
            stroke="#60a5fa"
            fill="#3b82f6"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {Object.entries(data).map(([key, value]) => (
          <div
            key={key}
            className="text-center p-2 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="text-white/60 text-xs mb-1">
              {skillLabels[key] || key}
            </div>
            <div className="text-white font-bold text-lg">Lv.{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}