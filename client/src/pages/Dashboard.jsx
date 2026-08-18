import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CategoryBadge from '../components/CategoryBadge';
import ProcessingStatus from '../components/ProcessingStatus';
import EmptyState from '../components/EmptyState';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');

  const fetchTranscripts = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (sentimentFilter) params.sentiment = sentimentFilter;

      const res = await api.get('/transcripts', { params });
      setTranscripts(res.data.transcripts || []);
    } catch (err) {
      if (!isPolling) {
        toast.error('Failed to load transcripts.');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter, sentimentFilter]);

  // Initial fetch and dependency trigger
  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);

  // Auto-polling for active background processing
  useEffect(() => {
    const hasActiveJobs = transcripts.some(
      (t) => t.status === 'queued' || t.status === 'processing'
    );

    let intervalId = null;
    if (hasActiveJobs) {
      intervalId = setInterval(() => {
        fetchTranscripts(true);
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transcripts, fetchTranscripts]);

  const handleDelete = async (id, title, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Delete transcript "${title}"?`)) return;

    try {
      await api.delete(`/transcripts/${id}`);
      toast.success('Transcript deleted successfully.');
      setTranscripts((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error('Failed to delete transcript.');
    }
  };

  const handleRetry = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await api.post(`/transcripts/${id}/retry`);
      toast.success('Transcript analysis re-queued.');
      fetchTranscripts();
    } catch (err) {
      toast.error('Failed to retry transcript processing.');
    }
  };

  // Compute stat metrics
  const totalCount = transcripts.length;
  const completedCount = transcripts.filter((t) => t.status === 'completed').length;
  const processingCount = transcripts.filter(
    (t) => t.status === 'processing' || t.status === 'queued'
  ).length;
  const failedCount = transcripts.filter((t) => t.status === 'failed').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-hidden">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || 'Evaluator'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                AI-Powered Transcript Metadata & Content Intelligence Dashboard
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTranscripts()}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Refresh list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/25 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>New Transcript</span>
              </Link>
            </div>
          </div>

          {/* Overview Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Transcripts</span>
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono">
                {totalCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Uploaded and managed</div>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
                {completedCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Ready for discovery & export</div>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Processing / Queued</span>
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2 font-mono">
                {processingCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">NLP pipeline running</div>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Failed</span>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-2 font-mono">
                {failedCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Retry available</div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search transcripts by title..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="queued">Queued</option>
                <option value="failed">Failed</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="entertainment">Entertainment</option>
                <option value="interview">Interview</option>
                <option value="meeting">Meeting</option>
                <option value="education">Education</option>
                <option value="news">News</option>
              </select>

              {/* Sentiment Filter */}
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          {/* Transcripts List Table */}
          <div className="glass-card rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Recent Transcripts & Scripts</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {transcripts.length} {transcripts.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs">Fetching transcript metadata...</p>
              </div>
            ) : transcripts.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No Transcripts Found"
                  description={
                    searchTerm || categoryFilter || statusFilter || sentimentFilter
                      ? 'No transcripts match your current search and filter criteria.'
                      : 'Upload movie scripts, interview transcripts, or meeting notes to begin automated metadata extraction.'
                  }
                  actionLink="/upload"
                  actionText="Upload First Script"
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-[11px] uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Title & Source</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Category</th>
                      <th className="px-5 py-3 font-semibold">Sentiment</th>
                      <th className="px-5 py-3 font-semibold">Created</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {transcripts.map((t) => {
                      const category = t.metadata?.category;
                      const sentiment = t.metadata?.sentiment;
                      const isComplete = t.status === 'completed';

                      return (
                        <tr
                          key={t._id}
                          className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                        >
                          <td className="px-5 py-4">
                            <Link to={`/transcripts/${t._id}`} className="block">
                              <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                                {t.title}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {t.fileName || 'Pasted script'}
                              </div>
                            </Link>
                          </td>

                          <td className="px-5 py-4">
                            <ProcessingStatus status={t.status} />
                            {t.error && (
                              <div className="text-[10px] text-rose-400 mt-1 truncate max-w-[160px]" title={t.error}>
                                {t.error}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {category ? (
                              <CategoryBadge category={category} size="sm" />
                            ) : (
                              <span className="text-xs text-slate-500 font-mono">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {sentiment ? (
                              <div className="flex items-center gap-1.5 text-xs capitalize">
                                {sentiment.polarity === 'positive' ? (
                                  <Smile className="w-3.5 h-3.5 text-emerald-400" />
                                ) : sentiment.polarity === 'negative' ? (
                                  <Frown className="w-3.5 h-3.5 text-rose-400" />
                                ) : (
                                  <Meh className="w-3.5 h-3.5 text-amber-400" />
                                )}
                                <span className={
                                  sentiment.polarity === 'positive' ? 'text-emerald-400' :
                                  sentiment.polarity === 'negative' ? 'text-rose-400' : 'text-amber-400'
                                }>
                                  {sentiment.polarity}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 font-mono">—</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                            {new Date(t.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {t.status === 'failed' && (
                                <button
                                  onClick={(e) => handleRetry(t._id, e)}
                                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors"
                                  title="Retry AI analysis"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <Link
                                to={`/transcripts/${t._id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-200 hover:text-indigo-300 border border-slate-700 text-xs font-medium transition-all"
                              >
                                <span>Inspect</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>

                              <button
                                onClick={(e) => handleDelete(t._id, t.title, e)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete transcript"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
