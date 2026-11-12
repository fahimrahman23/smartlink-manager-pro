import React from 'react';
import { TabType } from '../types';
import { LayoutDashboard, Link2, PlusCircle, Layers, Database } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'links' as TabType, label: 'Links', icon: Link2 },
    { id: 'create' as TabType, label: 'Generate', icon: PlusCircle, isPrimary: true },
    { id: 'bulk' as TabType, label: 'Bulk', icon: Layers },
    { id: 'backup' as TabType, label: 'Backup', icon: Database },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5">
      <div className="grid grid-cols-5 items-center justify-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center min-h-[48px] py-1 text-sky-400 group focus:outline-none"
              >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-500/40' : 'bg-sky-400 text-slate-950'} transition-transform active:scale-90 shadow-sm`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-slate-950'}`} />
                </div>
                <span className={`text-[10px] font-semibold mt-1 tracking-tight ${isActive ? 'text-sky-400' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors group focus:outline-none ${
                isActive ? 'text-sky-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform active:scale-95 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
