import React from 'react';
import { Tag } from 'lucide-react';

const KeywordCloud = ({ keywords = [] }) => {
  if (!keywords || keywords.length === 0) {
    return (
      <div className="text-sm text-slate-400 italic py-4 text-center">
        No keywords extracted.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all shadow-sm group hover:border-indigo-500/40 cursor-default"
        >
          <Tag className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <span className="capitalize">{keyword}</span>
        </span>
      ))}
    </div>
  );
};

export default KeywordCloud;
