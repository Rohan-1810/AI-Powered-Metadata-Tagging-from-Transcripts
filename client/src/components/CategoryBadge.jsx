import React from 'react';

const categoryStyles = {
  entertainment: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  interview: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  meeting: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  education: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  news: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
};

const CategoryBadge = ({ category, confidence, size = 'md' }) => {
  if (!category) return null;

  const label = typeof category === 'string' ? category : category.label || 'Unknown';
  const confValue = confidence !== undefined ? confidence : category.confidence;
  const style = categoryStyles[label.toLowerCase()] || categoryStyles.default;

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style} ${sizeClasses} capitalize transition-all`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      <span>{label}</span>
      {confValue !== undefined && confValue !== null && (
        <span className="opacity-75 font-mono text-[0.85em]">
          {Math.round(confValue * 100)}%
        </span>
      )}
    </span>
  );
};

export default CategoryBadge;
