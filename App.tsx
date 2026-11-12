import React, { useState, useEffect, useCallback } from 'react';
import { SmartLink, OverviewStats, TabType } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { LinksListView } from './components/LinksListView';
import { GeneratorView } from './components/GeneratorView';
import { BulkGeneratorView } from './components/BulkGeneratorView';
import { BackupSettingsView } from './components/BackupSettingsView';
import { GuideView } from './components/GuideView';
import { EditLinkModal } from './components/EditLinkModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { QRModal } from './components/QRModal';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [links, setLinks] = useState<SmartLink[]>([]);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingLink, setEditingLink] = useState<SmartLink | null>(null);
  const [analyticsLink, setAnalyticsLink] = useState<SmartLink | null>(null);
  const [qrModalData, setQrModalData] = useState<{ url: string; title: string } | null>(null);

  // Offline detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [linksRes, statsRes] = await Promise.all([
        fetch('/api/links'),
        fetch('/api/stats/overview'),
      ]);

      const linksData = await linksRes.json();
      const statsData = await statsRes.json();

      if (linksData.success) {
        setLinks(linksData.data);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll stats every 30 seconds for live click updates
    const timer = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Toggle active / paused status
  const handleToggleStatus = async (linkId: string, currentStatus: 'active' | 'paused') => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/links/${linkId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLinks((prev) =>
          prev.map((l) => (l.id === linkId ? { ...l, status: newStatus } : l))
        );
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Delete link
  const handleDeleteLink = async (linkId: string) => {
    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  // Handle single link created
  const handleLinkCreated = (newLink: SmartLink) => {
    setLinks((prev) => [newLink, ...prev]);
    fetchData();
  };

  // Handle bulk created
  const handleBulkCreated = (newBatch: SmartLink[]) => {
    setLinks((prev) => [...newBatch, ...prev]);
    fetchData();
  };

  // Handle link updated
  const handleLinkUpdated = (updatedLink: SmartLink) => {
    setLinks((prev) => prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)));
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-50">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Cached SmartLink configurations are displayed.</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCreateModal={() => setCurrentTab('create')}
        totalLinksCount={links.length}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6">
        {loading && links.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
            <span className="text-xs font-medium">Loading SmartLink Hub...</span>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                links={links}
                onSelectTab={setCurrentTab}
                onOpenCreate={() => setCurrentTab('create')}
                onSelectLink={(link) => setAnalyticsLink(link)}
              />
            )}

            {currentTab === 'links' && (
              <LinksListView
                links={links}
                onToggleStatus={handleToggleStatus}
                onEditLink={(link) => setEditingLink(link)}
                onDeleteLink={handleDeleteLink}
                onSelectLink={(link) => setAnalyticsLink(link)}
                onOpenQR={(url, title) => setQrModalData({ url, title })}
                onCreateNew={() => setCurrentTab('create')}
              />
            )}

            {currentTab === 'create' && (
              <GeneratorView
                onLinkCreated={handleLinkCreated}
                onEditLink={(link) => setEditingLink(link)}
                onDeleteLink={handleDeleteLink}
                onOpenQR={(url, title) => setQrModalData({ url, title })}
              />
            )}

            {currentTab === 'bulk' && (
              <BulkGeneratorView onBulkCreated={handleBulkCreated} />
            )}

            {currentTab === 'backup' && (
              <BackupSettingsView onDataRestored={fetchData} />
            )}

            {currentTab === 'guide' && <GuideView />}
          </>
        )}
      </main>

      {/* Mobile Fixed Bottom Thumb Zone Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Modals */}
      <EditLinkModal
        link={editingLink}
        isOpen={!!editingLink}
        onClose={() => setEditingLink(null)}
        onSave={handleLinkUpdated}
      />

      <AnalyticsModal
        link={analyticsLink}
        isOpen={!!analyticsLink}
        onClose={() => setAnalyticsLink(null)}
      />

      <QRModal
        url={qrModalData?.url || null}
        title={qrModalData?.title || null}
        isOpen={!!qrModalData}
        onClose={() => setQrModalData(null)}
      />
    </div>
  );
}
