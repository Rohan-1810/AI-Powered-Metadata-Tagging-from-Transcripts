import React, { useState } from 'react';
import { Film, ChevronDown, ChevronUp, Clock } from 'lucide-react';

const SceneTimeline = ({ segments = [] }) => {
  const [expandedIndices, setExpandedIndices] = useState({ 1: true });

  if (!segments || segments.length === 0) {
    return (
      <div className="text-sm text-slate-400 italic py-6 text-center">
        No segmented scenes or dialogue blocks found.
      </div>
    );
  }

  const toggleExpand = (index) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-3">
      {segments.map((seg) => {
        const isExpanded = !!expandedIndices[seg.index];
        const isSceneHeading = /^(INT|EXT|SCENE)/i.test(seg.heading);
        const isTimestamp = /^Timestamp/i.test(seg.heading);

        return (
          <div
            key={seg.index}
            className="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden transition-all hover:border-slate-700"
          >
            <button
              onClick={() => toggleExpand(seg.index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                  #{seg.index}
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {isTimestamp ? (
                    <Clock className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Film className="w-4 h-4 text-purple-400" />
                  )}
                  <span className="font-semibold text-sm text-slate-200">
                    {seg.heading}
                  </span>
                </div>
              </div>

              <div className="text-slate-400">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-black/20">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {seg.text || 'No dialogue content in this segment.'}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SceneTimeline;
