import React from 'react';
import { OverviewStats, SmartLink, TabType } from '../types';
import {
  Link2,
  MousePointerClick,
  Users,
  Calendar,
  PlusCircle,
  Smartphone,
  Monitor,
  Tablet,
  ExternalLink,
  ArrowUpRight,
  Info,
  CheckCircle2,
  PauseCircle,
  Activity,
  Layers,
} from 'lucide-react';

interface DashboardViewProps {
  stats: OverviewStats | null;
  links: SmartLink[];
  onSelectTab: (tab: TabType) => void;
  onOpenCreate: () => void;
  onSelectLink: (link: SmartLink) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  links,
  onSelectTab,
  onOpenCreate,
  onSelectLink,
}) => {
  const totalLinks = stats?.totalLinks ?? links.length;
  const activeLinks = stats?.activeLinks ?? links.filter((l) => l.status === 'active').length;
  const totalClicks = stats?.totalClicks ?? links.reduce((sum, l) => sum + l.clickCount, 0);
  const uniqueVisitors = stats?.uniqueVisitors ?? links.reduce((sum, l) => sum + l.uniqueCount, 0);
  const todayClicks = stats?.todayClicks ?? 0;

  // Compute maximum clicks for chart scaling
  const chartDays = stats?.last7Days || [];
  const maxChartClicks = Math.max(...chartDays.map((d) => d.clicks), 10);

  // Device breakdown percentages
  const deviceCounts = stats?.devices || { mobile: 0, desktop: 0, tablet: 0, bot: 0 };
  const deviceTotal = (deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet + deviceCounts.bot) || 1;
  const mobilePct = Math.round((deviceCounts.mobile / deviceTotal) * 100);
  const desktopPct = Math.round((deviceCounts.desktop / deviceTotal) * 100);
  const tabletPct = Math.round((deviceCounts.tablet / deviceTotal) * 100);

  const recentClicks = stats?.recentActivity || [];

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Hero Welcome / Actions Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 md:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1 tracking-wide uppercase">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Redirect Hub</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Adsterra Traffic & SmartLink Center
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
              Genuine HTTP 302 server redirects with sub-ID preservation and detailed inbound click telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreate}
              className="flex items-center justify-center gap-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 active:scale-95 transition-all text-xs md:text-sm whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Create Link</span>
            </button>
            <button
              onClick={() => onSelectTab('bulk')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition text-xs md:text-sm whitespace-nowrap cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Bulk Create</span>
            </button>
            <a
              href="/api/download-zip"
              download="smartlink-manager-pro.zip"
              className="flex items-center gap-2 bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 font-semibold px-4 py-2.5 rounded-xl border border-sky-800/60 transition text-xs md:text-sm whitespace-nowrap active:scale-95"
              title="Download Complete Source Code ZIP Archive"
            >
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span>Download ZIP</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Operations Hub (All Core Features at a Glance) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => onSelectTab('create')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Single Link</span>
            <span className="text-[10px] text-slate-400">Generator</span>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('bulk')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Bulk Creator</span>
            <span className="text-[10px] text-slate-400">Multi-links</span>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('links')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Saved Links</span>
            <span className="text-[10px] text-slate-400">Manage & Edit</span>
          </div>
        </button>

        <button
          onClick={() => onSelectTab('backup')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">CSV & Backup</span>
            <span className="text-[10px] text-slate-400">Import/Export</span>
          </div>
        </button>

        <a
          href="/api/download-zip"
          download="smartlink-manager-pro.zip"
          className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-sky-400 block">Download ZIP</span>
            <span className="text-[10px] text-slate-400">Source code</span>
          </div>
        </a>

        <button
          onClick={() => onSelectTab('guide')}
          className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-xl flex flex-col items-center text-center gap-2 transition group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Adsterra Guide</span>
            <span className="text-[10px] text-slate-400">PWA & Setup</span>
          </div>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        {/* Total Redirect Clicks */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Redirects</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Recorded server-side</span>
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Unique Visitors</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
              {uniqueVisitors.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>Deduplicated IP hashes</span>
            </div>
          </div>
        </div>

        {/* Today's Clicks */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Today's Clicks</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
              {todayClicks.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>Since 00:00 UTC</span>
            </div>
          </div>
        </div>

        {/* Active SmartLinks */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active SmartLinks</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tabular-nums">
              {activeLinks} <span className="text-sm font-normal text-slate-500">/ {totalLinks}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>{totalLinks - activeLinks} paused campaigns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Device Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Performance Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Redirect Velocity (Last 7 Days)</h2>
              <p className="text-xs text-slate-400">Daily redirect request volume forwarded to Adsterra</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">UTC Daily</span>
          </div>

          {/* SVG Bar/Trend Chart */}
          <div className="mt-6 h-44 flex items-end justify-between gap-2 pt-6">
            {chartDays.map((day) => {
              const heightPct = Math.max(Math.round((day.clicks / maxChartClicks) * 100), 6);
              const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-800 border border-slate-700 text-white px-2 py-0.5 rounded shadow whitespace-nowrap mb-1">
                    {day.clicks} clicks ({day.uniques} uniq)
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-sky-600/40 via-sky-500 to-sky-400 group-hover:brightness-110 transition-all duration-300"
                  />
                  {/* Label */}
                  <span className="text-[11px] font-medium text-slate-400 mt-1">
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Distribution Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Visitor Devices</h2>
            <p className="text-xs text-slate-400">Estimated client device categories</p>
          </div>

          <div className="my-5 space-y-3.5">
            {/* Mobile */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  Mobile (Android / iOS)
                </span>
                <span className="font-mono text-white font-semibold tabular-nums">{mobilePct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${mobilePct}%` }} className="bg-sky-400 h-full rounded-full" />
              </div>
            </div>

            {/* Desktop */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  Desktop (PC / Mac)
                </span>
                <span className="font-mono text-white font-semibold tabular-nums">{desktopPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${desktopPct}%` }} className="bg-indigo-400 h-full rounded-full" />
              </div>
            </div>

            {/* Tablet */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Tablet className="w-3.5 h-3.5 text-purple-400" />
                  Tablet
                </span>
                <span className="font-mono text-white font-semibold tabular-nums">{tabletPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${tabletPct}%` }} className="bg-purple-400 h-full rounded-full" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3 flex items-center justify-between">
            <span>Bot traffic filtered:</span>
            <span className="font-mono text-slate-400">{deviceCounts.bot} detected</span>
          </div>
        </div>
      </div>

      {/* Traffic Reconciliation Note */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Reconciliation Notice:</strong> SmartLink Manager Pro records every genuine inbound HTTP redirect request at the server gate. Adsterra publisher stats may differ due to advertiser bot filtering, visitor drop-offs before page render, adblockers, and 24-hour unique impression frequency caps. Check the <button onClick={() => onSelectTab('guide')} className="text-sky-400 hover:underline font-medium">Adsterra Guide</button> to compare data.
        </div>
      </div>

      {/* Top Performing Links Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Active Campaigns</h2>
            <p className="text-xs text-slate-400">Your top performing Adsterra SmartLinks</p>
          </div>
          <button
            onClick={() => onSelectTab('links')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <span>View All ({links.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {links.slice(0, 5).map((link) => {
            const shareUrl = `${window.location.origin}/r/${link.slug}`;
            return (
              <div
                key={link.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">
                    {link.status === 'active' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <PauseCircle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-200 truncate group-hover:text-white transition">
                        {link.name}
                      </span>
                      {link.subId && (
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          sub:{link.subId}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
                      /r/{link.slug}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-7 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-extrabold text-white font-mono tabular-nums">
                      {link.clickCount.toLocaleString()} <span className="text-xs text-slate-500 font-normal">clicks</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {link.uniqueCount.toLocaleString()} unique
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectLink(link)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      Stats
                    </button>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      title="Test Live Redirect"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Live Stream */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Live Redirect Activity</h2>
            <p className="text-xs text-slate-400">Actual incoming requests forwarded to destination</p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Latest {recentClicks.length} events
          </span>
        </div>

        {recentClicks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No clicks recorded yet. Share your links to see live activity here!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentClicks.slice(0, 10).map((click) => {
              const timeAgo = new Date(click.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateStr = new Date(click.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={click.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded bg-slate-800 text-slate-400 shrink-0">
                      {click.deviceType === 'mobile' ? (
                        <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                      ) : click.deviceType === 'tablet' ? (
                        <Tablet className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-slate-200 font-medium truncate">
                        {click.linkName || click.linkSlug}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                        <span>{click.browser} / {click.os}</span>
                        <span>·</span>
                        <span className="truncate">{click.referrer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-slate-400 text-[11px]">{timeAgo}</span>
                    <div className="text-[10px] text-slate-600">{dateStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
