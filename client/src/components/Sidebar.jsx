import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  Terminal,
  Database,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Recent Transcripts'
    },
    {
      to: '/upload',
      label: 'Upload Transcript',
      icon: UploadCloud,
      description: 'Upload .txt/.json or paste text'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0B0F19] md:bg-transparent border-r border-slate-800/80 p-4 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* AI Pipeline Architecture Info Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>NLP Architecture</span>
            </div>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>Keywords:</span>
                <span className="font-mono text-indigo-300">KeyBERT</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Entities:</span>
                <span className="font-mono text-indigo-300">spaCy en_core</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sentiment:</span>
                <span className="font-mono text-indigo-300">NLTK VADER</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Emotion:</span>
                <span className="font-mono text-indigo-300">DistilRoBERTa</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Classification:</span>
                <span className="font-mono text-indigo-300">BART-Large</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 text-center">
          <span className="text-slate-300 font-semibold">Cognizant Hackathon</span>
          <div className="text-[10px] text-slate-500">Kaggle Movie Scripts Corpus</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
