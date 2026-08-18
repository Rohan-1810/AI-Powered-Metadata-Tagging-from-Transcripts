import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UploadZone from '../components/UploadZone';
import { ProcessingStepper } from '../components/ProcessingStatus';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTranscript, setActiveTranscript] = useState(null);

  // Poll for completion of currently uploaded transcript
  useEffect(() => {
    let intervalId = null;

    if (
      activeTranscript &&
      (activeTranscript.status === 'queued' || activeTranscript.status === 'processing')
    ) {
      intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/transcripts/${activeTranscript._id}`);
          if (res.data && res.data.transcript) {
            const updated = res.data.transcript;
            setActiveTranscript(updated);
            if (updated.status === 'completed') {
              toast.success('AI Metadata extraction complete!');
              clearInterval(intervalId);
            } else if (updated.status === 'failed') {
              toast.error(updated.error || 'Processing failed.');
              clearInterval(intervalId);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTranscript]);

  const handleUploadSubmit = async ({ isFile, payload }) => {
    setIsSubmitting(true);
    try {
      let res;
      if (isFile) {
        res = await api.post('/transcripts', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/transcripts', payload);
      }

      const created = res.data.transcript;
      setActiveTranscript(created);
      toast.success('Transcript queued for AI analysis!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please check file format.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl overflow-hidden">
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Model NLP Pipeline</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Upload & Tag Transcripts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload script files (.txt, .json) or paste dialogue blocks for automated entity extraction, sentiment analysis, scene segmentation, and content classification.
            </p>
          </div>

          {/* Active Job Stepper Display */}
          {activeTranscript && (
            <div className="space-y-4">
              <ProcessingStepper status={activeTranscript.status} />

              {activeTranscript.status === 'completed' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {activeTranscript.title}
                      </h4>
                      <p className="text-xs text-emerald-400">
                        All NLP models finished processing successfully.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/transcripts/${activeTranscript._id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
                  >
                    <span>Inspect Metadata</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeTranscript.status === 'failed' && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">Analysis Failed</h4>
                      <p className="text-xs text-rose-400">
                        {activeTranscript.error || 'Metadata processing failed. Please retry.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTranscript(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold"
                  >
                    Upload Another
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Upload Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
            <UploadZone
              onUploadSubmit={handleUploadSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Upload;
