import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CategoryBadge from '../components/CategoryBadge';
import ProcessingStatus, { ProcessingStepper } from '../components/ProcessingStatus';
import EntityChip from '../components/EntityChip';
import KeywordCloud from '../components/KeywordCloud';
import SentimentChart from '../components/SentimentChart';
import EmotionChart from '../components/EmotionChart';
import SpeakerTable from '../components/SpeakerTable';
import SceneTimeline from '../components/SceneTimeline';
import MetadataCard from '../components/MetadataCard';
import { exportToJson, exportToCsv } from '../utils/exportUtils';
import {
  ArrowLeft,
  Download,
  FileJson,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  Sparkles,
  Tag,
  Users,
  Film,
  HeartHandshake,
  Layers,
  Compass,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const TranscriptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('metadata'); // 'metadata' | 'raw'
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('ALL');

  const fetchTranscript = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await api.get(`/transcripts/${id}`);
      setTranscript(res.data.transcript);
    } catch (err) {
      if (!isSilent) {
        toast.error('Failed to load transcript details.');
        navigate('/');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscript();
  }, [id]);

  // Auto-poll if transcript is currently queued or processing
  useEffect(() => {
    let interval = null;
    if (transcript && (transcript.status === 'queued' || transcript.status === 'processing')) {
      interval = setInterval(() => {
        fetchTranscript(true);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [transcript]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${transcript.title}"?`)) return;

    try {
      await api.delete(`/transcripts/${id}`);
      toast.success('Transcript deleted.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete transcript.');
    }
  };

  const handleRetry = async () => {
    try {
      await api.post(`/transcripts/${id}/retry`);
      toast.success('Analysis re-queued.');
      fetchTranscript();
    } catch (err) {
      toast.error('Failed to retry processing.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading transcript intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transcript) {
    return null;
  }

  const meta = transcript.metadata || {};
  const isCompleted = transcript.status === 'completed';

  // Compute text stats
  const raw = transcript.rawText || '';
  const wordCount = raw.trim() ? raw.trim().split(/\s+/).length : 0;
  const charCount = raw.length;
  const lineCount = raw.split(/\r\n|\r|\n/).length;

  // Group entities by label
  const entities = meta.entities || [];
  const entityLabels = ['ALL', ...new Set(entities.map((e) => e.label))];
  const filteredEntities = selectedEntityFilter === 'ALL'
    ? entities
    : entities.filter((e) => e.label === selectedEntityFilter);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-hidden">
          {/* Back link & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              {transcript.status === 'failed' && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry AI Analysis</span>
                </button>
              )}

              {isCompleted && (
                <>
                  <button
                    onClick={() => exportToJson(transcript)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm hover:border-indigo-500/40"
                    title="Download complete structured metadata in JSON format"
                  >
                    <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    onClick={() => exportToCsv(transcript)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm hover:border-indigo-500/40"
                    title="Download structured metadata flattened in CSV format"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </>
              )}

              <button
                onClick={handleDelete}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete transcript"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Master Title & Top Status Header */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <ProcessingStatus status={transcript.status} />
                  {meta.category && (
                    <CategoryBadge category={meta.category} size="md" />
                  )}
                </div>
                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {transcript.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>Source: {transcript.fileName || 'Pasted script'}</span>
                  <span>•</span>
                  <span>
                    Uploaded on{' '}
                    {new Date(transcript.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Quick Stat Pill Cards */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Words</div>
                  <div className="text-base font-bold text-slate-200 font-mono">{wordCount}</div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Lines</div>
                  <div className="text-base font-bold text-slate-200 font-mono">{lineCount}</div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Scenes</div>
                  <div className="text-base font-bold text-indigo-400 font-mono">
                    {meta.segments ? meta.segments.length : 0}
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Speakers</div>
                  <div className="text-base font-bold text-purple-400 font-mono">
                    {meta.speakers ? meta.speakers.length : 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper if in progress */}
            {!isCompleted && (
              <div className="pt-2">
                <ProcessingStepper status={transcript.status} />
              </div>
            )}
          </div>

          {/* Tabs: Metadata Intelligence vs Raw Source */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'metadata'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Structured Metadata & Visualizations</span>
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'raw'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Raw Source Transcript</span>
            </button>
          </div>

          {activeTab === 'metadata' ? (
            <div className="space-y-6">
              {/* Top Row: Category Classification + Sentiment Gauge */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* H & A. Content Classification */}
                <MetadataCard
                  title="Content Classification"
                  icon={Compass}
                  badge={
                    meta.category && (
                      <span className="text-xs text-indigo-400 font-mono">
                        {Math.round((meta.category.confidence || 0) * 100)}% Confidence
                      </span>
                    )
                  }
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Domain Category</div>
                        <div className="text-lg font-bold text-white capitalize mt-0.5">
                          {meta.category?.label || 'Processing...'}
                        </div>
                      </div>
                      <CategoryBadge category={meta.category} size="md" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Zero-shot sequence inference evaluated candidate categories: <span className="text-slate-300 font-mono">entertainment, interview, meeting, education, news</span>.
                    </p>
                  </div>
                </MetadataCard>

                {/* E. Sentiment Polarity & Score */}
                <MetadataCard title="Sentiment Valence (NLTK VADER)" icon={HeartHandshake}>
                  <SentimentChart sentiment={meta.sentiment} />
                </MetadataCard>
              </div>

              {/* B. Keywords Extraction */}
              <MetadataCard
                title="Topics & Keywords (KeyBERT)"
                icon={Tag}
                badge={
                  meta.keywords && (
                    <span className="text-xs text-slate-400 font-mono">
                      {meta.keywords.length} extracted
                    </span>
                  )
                }
              >
                <KeywordCloud keywords={meta.keywords} />
              </MetadataCard>

              {/* Middle Row: Emotion Distribution + Speakers Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* D. Emotion Analysis */}
                <MetadataCard
                  title="Emotion Distribution (DistilRoBERTa)"
                  icon={Sparkles}
                >
                  <EmotionChart emotions={meta.emotions} />
                </MetadataCard>

                {/* F. Speakers Table */}
                <MetadataCard
                  title="Speaker Identification & Turn Counts"
                  icon={Users}
                  badge={
                    meta.speakers && (
                      <span className="text-xs text-slate-400 font-mono">
                        {meta.speakers.length} identified
                      </span>
                    )
                  }
                >
                  <SpeakerTable speakers={meta.speakers} />
                </MetadataCard>
              </div>

              {/* C. Named Entities Recognition */}
              <MetadataCard
                title="Named Entities (spaCy en_core_web_sm)"
                icon={Layers}
                badge={
                  entities && (
                    <span className="text-xs text-slate-400 font-mono">
                      {entities.length} detected
                    </span>
                  )
                }
              >
                <div className="space-y-4">
                  {/* Filter Pills */}
                  {entityLabels.length > 1 && (
                    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800">
                      {entityLabels.map((lbl) => (
                        <button
                          key={lbl}
                          onClick={() => setSelectedEntityFilter(lbl)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            selectedEntityFilter === lbl
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredEntities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {filteredEntities.map((ent, idx) => (
                        <EntityChip key={idx} text={ent.text} label={ent.label} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 italic py-4 text-center">
                      No entities found for this category filter.
                    </div>
                  )}
                </div>
              </MetadataCard>

              {/* G. Scene & Segment Timeline */}
              <MetadataCard
                title="Time / Scene-Based Segmentation"
                icon={Film}
                badge={
                  meta.segments && (
                    <span className="text-xs text-slate-400 font-mono">
                      {meta.segments.length} segments
                    </span>
                  )
                }
              >
                <SceneTimeline segments={meta.segments} />
              </MetadataCard>
            </div>
          ) : (
            /* Raw Source Tab */
            <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800">
                <span>Raw Transcript Character Stream</span>
                <span>{charCount} chars • {lineCount} lines</span>
              </div>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto p-4 rounded-2xl bg-black/40 border border-slate-800/80">
                {raw}
              </pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TranscriptDetail;
