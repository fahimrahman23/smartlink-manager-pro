import { MousePointerClick, Link2, Users, Sun } from 'lucide-react';
import { SmartLink, OverviewStats, TabType } from './types';
import { card, btn } from './linkutil';
export function DashboardView({ stats, links, onSelectTab, onOpenCreate, onSelectLink }: { stats: OverviewStats | null; links: SmartLink[]; onSelectTab: (t: TabType) => void; onOpenCreate: () => void; onSelectLink: (l: SmartLink) => void }) {
  const cards: [string, number, any][] = [['Total clicks', stats?.totalClicks ?? 0, MousePointerClick], ['Unique visitors', stats?.uniqueVisitors ?? 0, Users], ['Clicks today', stats?.todayClicks ?? 0, Sun], ['Active links', stats?.activeLinks ?? 0, Link2]];
  const days = stats?.last7Days ?? [];
  const max = Math.max(1, ...days.map((d) => d.clicks));
  const top = [...links].sort((a, b) => b.clickCount - a.clickCount).slice(0, 5);
  if (!links.length) return (
    <div className={`${card} text-center py-12`}><p className="text-slate-300 mb-4">No links yet. Create your first one.</p><button className={btn} onClick={onOpenCreate}>Create link</button></div>
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(([l, v, I]) => (<div key={l} className={card}><I className="w-4 h-4 text-sky-400 mb-2" /><div className="text-2xl font-bold">{v}</div><div className="text-xs text-slate-500">{l}</div></div>))}
      </div>
      <div className={card}>
        <div className="text-xs text-slate-400 mb-3">Clicks, last 7 days</div>
        <div className="flex items-end gap-2 h-32">
          {days.map((d) => (<div key={d.date} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-sky-500/70 rounded-t" style={{ height: `${(d.clicks / max) * 100}%`, minHeight: 2 }} /><span className="text-[10px] text-slate-500">{d.date.slice(5)}</span></div>))}
        </div>
      </div>
      <div className={card}>
        <div className="flex justify-between mb-2"><span className="text-xs text-slate-400">Top links</span><button className="text-xs text-sky-400" onClick={() => onSelectTab('links')}>See all</button></div>
        {top.map((l) => (<button key={l.id} onClick={() => onSelectLink(l)} className="w-full flex justify-between py-2 border-t border-slate-800 text-sm text-left"><span className="truncate">{l.name}</span><span className="text-slate-400">{l.clickCount}</span></button>))}
      </div>
    </div>
  );
}
