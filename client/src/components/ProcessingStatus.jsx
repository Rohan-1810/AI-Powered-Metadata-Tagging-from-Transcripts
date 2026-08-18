import React from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';

const stages = [
  'Uploading',
  'Parsing',
  'Extracting metadata',
  'Analyzing sentiment',
  'Detecting entities',
  'Generating classification',
  'Completed'
];

const ProcessingStatus = ({ status = 'processing', error = null }) => {
  if (status === 'completed') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Completed</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>Failed</span>
      </div>
    );
  }

  if (status === 'queued') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>Queued</span>
      </div>
    );
  }

  // Processing state
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
      <span>AI Processing...</span>
    </div>
  );
};

export const ProcessingStepper = ({ status = 'processing' }) => {
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-slate-400">
        <span className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : isFailed ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          )}
          <span className="font-semibold text-slate-200">
            {isCompleted ? 'Analysis Completed' : isFailed ? 'Analysis Failed' : 'AI Pipeline In Progress'}
          </span>
        </span>
        <ProcessingStatus status={status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        {stages.map((stage, idx) => {
          let stepStatus = 'upcoming';
          if (isCompleted) stepStatus = 'done';
          else if (isFailed) stepStatus = idx === 0 ? 'done' : 'error';
          else if (status === 'queued') stepStatus = idx === 0 ? 'active' : 'upcoming';
          else {
            // Simulated active progressing stages
            stepStatus = idx <= 4 ? 'done' : idx === 5 ? 'active' : 'upcoming';
          }

          return (
            <div
              key={idx}
              className={`p-2 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                stepStatus === 'done'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                  : stepStatus === 'active'
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-sm'
                  : stepStatus === 'error'
                  ? 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              {stepStatus === 'done' ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              ) : stepStatus === 'active' ? (
                <Loader2 className="w-3 h-3 text-indigo-400 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
              )}
              <span className="truncate">{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingStatus;
