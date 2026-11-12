import React, { useState, useMemo } from 'react';
import { SmartLink } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  Play,
  Pause,
  QrCode,
  Share2,
  BarChart2,
  AlertCircle,
  Link2,
} from 'lucide-react';

interface LinksListViewProps {
  links: SmartLink[];
  onToggleStatus: (linkId: string, currentStatus: 'active' | 'paused') => Promise<void>;
  onEditLink: (link: SmartLink) => void;
  onDeleteLink: (linkId: string) => Promise<void>;
  onSelectLink: (link: SmartLink) => void;
  onOpenQR: (url: string, title: string) => void;
  onCreateNew: () => void;
}

export const LinksListView: React.FC<LinksListViewProps> = ({
  links,
  onToggleStatus,
  onEditLink,
  onDeleteLink,
  onSelectLink,
  onOpenQR,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'clicks' | 'uniques'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter and sort links
  const filteredLinks = useMemo(() => {
    return links
      .filter((link) => {
        // Search filter (name, slug, subId, or originalUrl)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = link.name.toLowerCase().includes(q);
          const matchSlug = link.slug.toLowerCase().includes(q);
          const matchSubId = link.subId.toLowerCase().includes(q);
          const matchUrl = link.originalUrl.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchSubId && !matchUrl) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && link.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'clicks') {
          return b.clickCount - a.clickCount;
        }
        if (sortBy === 'uniques') {
          return b.uniqueCount - a.uniqueCount;
        }
        return 0;
      });
  }, [links, searchTerm, statusFilter, sortBy]);

  const copyUrl = async (link: SmartLink) => {
    const url = `${window.location.origin}/r/${link.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Saved SmartLinks
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Manage your generated redirect URLs, tracking tokens, and campaign statuses.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition text-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Link2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Link</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by link name, custom slug, or Sub ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({links.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({links.filter((l) => l.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('paused')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'paused'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paused ({links.filter((l) => l.status === 'paused').length})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 outline-none transition cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="clicks">Sort: Most Clicked</option>
              <option value="uniques">Sort: Unique Visitors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-8">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No matching SmartLinks found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or create a new campaign link.
          </p>
          <button
            onClick={onCreateNew}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs rounded-xl transition"
          >
            Create Your First Link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => {
            const shareUrl = `${window.location.origin}/r/${link.slug}`;
            const isCopied = copiedId === link.id;
            const dateFormatted = new Date(link.createdAt).toLocaleDateString([], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={link.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 md:p-5 transition group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm md:text-base text-white truncate">
                        {link.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          link.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {link.status}
                      </span>
                      {link.subId && (
                        <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">
                          sub:{link.subId}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        {dateFormatted}
                      </span>
                    </div>

                    {/* URLs */}
                    <div className="space-y-1">
                      {/* Generated Shareable URL */}
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-500 select-none">Share:</span>
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-300 hover:text-sky-200 underline decoration-sky-500/30 truncate"
                        >
                          {shareUrl}
                        </a>
                      </div>

                      {/* Original Target */}
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 truncate">
                        <span className="select-none">Target:</span>
                        <span className="truncate">{link.originalUrl}</span>
                      </div>
                    </div>

                    {link.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {link.description}
                      </p>
                    )}
                  </div>

                  {/* Middle: Stats */}
                  <div className="flex items-center gap-6 py-2 lg:py-0 border-y lg:border-y-0 border-slate-800/80 lg:px-4 shrink-0">
                    <div>
                      <div className="text-xl md:text-2xl font-extrabold text-white font-mono tabular-nums">
                        {link.clickCount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                        Redirects
                      </div>
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-extrabold text-sky-400 font-mono tabular-nums">
                        {link.uniqueCount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                        Uniques
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center flex-wrap gap-2 shrink-0">
                    {/* Copy Button */}
                    <button
                      onClick={() => copyUrl(link)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                        isCopied
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                      title="Copy Shareable Link"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    {/* Open Test Redirect */}
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                      title="Open & Test Redirect"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* QR Code */}
                    <button
                      onClick={() => onOpenQR(shareUrl, link.name)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                      title="Mobile QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    {/* Analytics Drilldown */}
                    <button
                      onClick={() => onSelectLink(link)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl transition"
                      title="View Detailed Analytics"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Pause / Activate Toggle */}
                    <button
                      onClick={() => onToggleStatus(link.id, link.status)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                        link.status === 'active'
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                      }`}
                      title={link.status === 'active' ? 'Pause Campaign' : 'Activate Campaign'}
                    >
                      {link.status === 'active' ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span className="hidden sm:inline">Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span className="hidden sm:inline">Activate</span>
                        </>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEditLink(link)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                      title="Edit Link Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete SmartLink "${link.name}"? This action cannot be undone.`)) {
                          onDeleteLink(link.id);
                        }
                      }}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition"
                      title="Delete Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
