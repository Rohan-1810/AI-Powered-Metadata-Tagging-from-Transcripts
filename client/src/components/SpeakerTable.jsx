import React from 'react';
import { UserCheck } from 'lucide-react';

const SpeakerTable = ({ speakers = [] }) => {
  if (!speakers || speakers.length === 0) {
    return (
      <div className="text-sm text-slate-400 italic py-6 text-center">
        No identifiable speaker turns detected in this transcript.
      </div>
    );
  }

  const totalLines = speakers.reduce((acc, curr) => acc + (curr.lineCount || 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-700">
          <tr>
            <th className="px-4 py-2.5 font-semibold">Speaker</th>
            <th className="px-4 py-2.5 font-semibold text-center">Lines</th>
            <th className="px-4 py-2.5 font-semibold">Dialogue Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {speakers.map((spk, idx) => {
            const share = totalLines > 0 ? Math.round((spk.lineCount / totalLines) * 100) : 0;
            return (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                    {spk.speaker.charAt(0)}
                  </div>
                  <span>{spk.speaker}</span>
                </td>
                <td className="px-4 py-3 text-center font-mono font-semibold text-indigo-400">
                  {spk.lineCount}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-mono w-10 text-right">
                      {share}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SpeakerTable;
