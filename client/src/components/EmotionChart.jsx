import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const emotionColors = {
  joy: '#10B981',       // Emerald
  surprise: '#06B6D4',  // Cyan
  neutral: '#6B7280',   // Gray
  sadness: '#3B82F6',   // Blue
  fear: '#8B5CF6',      // Purple
  disgust: '#F59E0B',   // Amber
  anger: '#EF4444',     // Red
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-slate-200 capitalize">{data.label}</p>
        <p className="text-indigo-400 font-mono font-medium mt-0.5">
          Confidence: {(data.score * 100).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const EmotionChart = ({ emotions = [] }) => {
  if (!emotions || emotions.length === 0) {
    return (
      <div className="text-sm text-slate-400 italic py-6 text-center">
        No emotion distribution detected.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = emotions.map((item) => ({
    label: item.label,
    score: item.score,
    percentage: Math.round(item.score * 100)
  }));

  return (
    <div className="w-full h-64 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
            stroke="#64748b"
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#cbd5e1', textTransform: 'capitalize' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={16}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={emotionColors[entry.label.toLowerCase()] || '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionChart;
