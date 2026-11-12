import React from 'react';
import { TabType } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Plus,
  Link2,
  Download,
  LayoutDashboard,
  Layers,
  Database,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenCreateModal: () => void;
  totalLinksCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  totalLinksCount = 0,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'links' as TabType, label: `Saved Links (${totalLinksCount})`, icon: Link2 },
    { id: 'create' as TabType, label: 'Create Link', icon: Plus },
    { id: 'bulk' as TabType, label: 'Bulk Generator', icon: Layers },
    { id: 'backup' as TabType, label: 'Backup & ZIP', icon: Database },
    { id: 'guide' as TabType, label: 'Adsterra Guide', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#090d16]/98 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-sky-500/10">
            <Link2 className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              SmartLink <span className="text-sky-400 font-semibold">Pro</span>
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          {/* Direct ZIP download button on top bar */}
          <a
            href="/api/download-zip"
            download="smartlink-manager-pro.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-400 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/60 active:scale-95 transition-all rounded-lg whitespace-nowrap"
            title="Download Full Project ZIP File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </a>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Link</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Always Visible Horizontal Navigation Tab Strip (Works on ALL screen sizes & iFrames) */}
      <div className="border-t border-slate-800/60 bg-slate-950/70 px-3 lg:px-8 py-1.5 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
