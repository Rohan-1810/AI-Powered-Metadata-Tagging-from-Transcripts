import React from 'react';
import { Smile, Frown, Meh } from 'lucide-react';

const SentimentChart = ({ sentiment }) => {
  if (!sentiment) {
    return (
      <div className="text-sm text-slate-400 italic py-4 text-center">
        No sentiment data available.
      </div>
    );
  }

  const { polarity = 'neutral', score = 0 } = sentiment;
  // Map compound score (-1.0 to 1.0) to percentage (0% to 100%)
  const percentage = Math.max(0, Math.min(100, ((score + 1) / 2) * 100));

  const polarityConfig = {
    positive: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: Smile,
      label: 'Positive'
    },
    negative: {
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      icon: Frown,
      label: 'Negative'
    },
    neutral: {
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      icon: Meh,
      label: 'Neutral'
    }
  };

  const current = polarityConfig[polarity.toLowerCase()] || polarityConfig.neutral;
  const IconComponent = current.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg border ${current.bg}`}>
            <IconComponent className={`w-5 h-5 ${current.color}`} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Overall Polarity</div>
            <div className={`text-base font-bold capitalize ${current.color}`}>
              {current.label}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">VADER Compound</div>
          <div className="text-lg font-mono font-bold text-slate-200">
            {score > 0 ? `+${score.toFixed(3)}` : score.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Progress Scale Bar */}
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>-1.0 (Negative)</span>
          <span>0.0 (Neutral)</span>
          <span>+1.0 (Positive)</span>
        </div>
        <div className="relative h-2.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="absolute top-0 bottom-0 left-0 transition-all duration-700 rounded-full"
            style={{
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #f43f5e 0%, #fbbf24 50%, #10b981 100%)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;
