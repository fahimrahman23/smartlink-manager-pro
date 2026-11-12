import { Link2, Plus } from 'lucide-react';
import { TabType } from './types';
export const TABS: [TabType, string][] = [['dashboard', 'Dashboard'], ['links', 'Links'], ['create', 'Create'], ['bulk', 'Bulk'], ['backup', 'Backup'], ['guide', 'Guide']];
export function Navbar({ currentTab, onSelectTab, onOpenCreateModal, totalLinksCount }: { currentTab: TabType; onSelectTab: (t: TabType) => void; onOpenCreateModal: () => void; totalLinksCount: number }) {
  return (
    <header className="border-b border-slate-800 bg-[#0d1220] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link2 className="w-5 h-5 text-sky-400" />
        <b className="text-sm">SmartLink Pro</b>
        <span className="text-xs text-slate-500">{totalLinksCount} links</span>
        <nav className="hidden md:flex gap-1 ml-4">
          {TABS.map(([t, l]) => (
            <button key={t} onClick={() => onSelectTab(t)} className={`text-xs px-3 py-1.5 rounded-lg ${currentTab === t ? 'bg-sky-500/15 text-sky-300' : 'text-slate-400 hover:text-slate-200'}`}>{l}</button>
          ))}
        </nav>
        <button onClick={onOpenCreateModal} className="ml-auto bg-sky-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex gap-1 items-center"><Plus className="w-4 h-4" />New link</button>
      </div>
    </header>
  );
}
