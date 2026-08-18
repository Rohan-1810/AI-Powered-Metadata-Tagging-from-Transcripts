import React from 'react';

const labelColors = {
  PERSON: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  ORG: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  GPE: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  LOC: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  DATE: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  TIME: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  PRODUCT: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
  EVENT: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  WORK_OF_ART: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
  FAC: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  NORP: 'bg-lime-500/10 text-lime-300 border-lime-500/30',
  DEFAULT: 'bg-slate-700/30 text-slate-300 border-slate-600/40'
};

const EntityChip = ({ text, label }) => {
  const colorClass = labelColors[label?.toUpperCase()] || labelColors.DEFAULT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${colorClass} transition-all hover:scale-105`}
    >
      <span className="font-semibold text-slate-200">{text}</span>
      <span className="text-[10px] uppercase tracking-wider px-1 py-0.2 rounded bg-black/30 font-mono opacity-80">
        {label}
      </span>
    </span>
  );
};

export default EntityChip;
