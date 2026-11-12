import { LayoutDashboard, List, PlusCircle, Layers, Archive, BookOpen } from 'lucide-react';
import { TabType } from '../types';
const items: [TabType, string, any][] = [['dashboard', 'Home', LayoutDashboard], ['links', 'Links', List], ['create', 'Create', PlusCircle], ['bulk', 'Bulk', Layers], ['backup', 'Backup', Archive], ['guide', 'Guide', BookOpen]];
export function BottomNav({ currentTab, onSelectTab }: { currentTab: TabType; onSelectTab: (t: TabType) => void }) {
  return (
    <>
      <div className="h-20 md:hidden" />
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0d1220] border-t border-slate-800 flex pb-[env(safe-area-inset-bottom)]">
        {items.map(([t, l, I]) => (
          <button key={t} onClick={() => onSelectTab(t)} className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] ${currentTab === t ? 'text-sky-400' : 'text-slate-500'}`}><I className="w-5 h-5" />{l}</button>
        ))}
      </nav>
    </>
  );
}
