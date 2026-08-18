import React from 'react';

const MetadataCard = ({ title, icon: Icon, badge, action, children, className = '' }) => {
  return (
    <div className={`glass-card rounded-2xl p-5 border border-slate-800 shadow-lg ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h3 className="font-semibold text-sm sm:text-base text-slate-100">{title}</h3>
          {badge && <span className="ml-2">{badge}</span>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default MetadataCard;
