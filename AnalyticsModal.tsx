import React, { useEffect, useState } from 'react';
import { ClickRecord, SmartLink } from '../types';
import {
  X,
  MousePointerClick,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Globe,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AnalyticsModalProps {
  link: SmartLink | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ link, isOpen, onClose }) => {
  const [clicks, setClicks] = useState<ClickRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (link && isOpen) {
      setLoading(true);
      fetch(`/api/links/${link.id}/analytics`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setClicks(res.clicks || []);
          }
        })
        .catch((err) => console.error('Error fetching analytics:', err))
        .finally(() => setLoading(false));
    }
  }, [link, isOpen]);

  if (!isOpen || !link) return null;

  // Compute breakdown
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, bot: 0 };
  const referrerCounts: Record<string, number> = {};

  clicks.forEach((c) => {
    if (deviceCounts[c.deviceType] !== undefined) deviceCounts[c.deviceType]++;
    const ref = c.referrer || 'Direct / None';
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
  });

  const total = clicks.length || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-5 md:p-6 shadow-2xl text-slate-100 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{link.name}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  link.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {link.status}
              </span>
            </h3>
            <p className="text-xs text-sky-400 font-mono mt-0.5">
              {window.location.origin}/r/{link.slug}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 block">Total Redirects</span>
            <span className="text-xl font-extrabold text-white font-mono tabular-nums">
              {link.clickCount.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 block">Unique Visitors</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {link.uniqueCount.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 block">Mobile Share</span>
            <span className="text-xl font-extrabold text-sky-400 font-mono tabular-nums">
              {Math.round((deviceCounts.mobile / total) * 100)}%
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-500 block">Sub ID Token</span>
            <span className="text-xs font-bold text-slate-300 font-mono truncate block mt-1">
              {link.subId || 'None'}
            </span>
          </div>
        </div>

        {/* Detailed Redirect Log */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recent Inbound Click Events ({clicks.length})
            </h4>
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />}
          </div>

          {clicks.length === 0 ? (
            <div className="text-center py-8 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-500">
              No click records found for this specific link yet.
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800/80 max-h-64 overflow-y-auto">
              {clicks.map((click) => {
                const date = new Date(click.timestamp).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div key={click.id} className="p-3 text-xs flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded">
                          {click.deviceType}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {click.browser} on {click.os}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        <span>Referrer: {click.referrer}</span>
                        {click.queryParams && Object.keys(click.queryParams).length > 0 && (
                          <span className="ml-2 text-slate-400 font-mono">
                            Params: {JSON.stringify(click.queryParams)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-slate-400">{date}</span>
                      <div className="text-[10px] text-slate-600 font-mono">
                        IP: {click.ipHash.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
