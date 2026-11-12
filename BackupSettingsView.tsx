import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface BackupSettingsViewProps {
  onDataRestored: () => void;
}

export const BackupSettingsView: React.FC<BackupSettingsViewProps> = ({ onDataRestored }) => {
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Trigger CSV export download
  const handleExportCSV = () => {
    window.location.href = '/api/export/csv';
  };

  // Trigger JSON backup download
  const handleExportJSON = () => {
    window.location.href = '/api/export/backup';
  };

  // Handle CSV paste import
  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setImporting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvText }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to import CSV');
      }

      setStatusMessage({
        type: 'success',
        text: `Successfully imported ${data.imported} links! (${data.skipped} skipped)`,
      });
      setCsvText('');
      onDataRestored();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error importing CSV data',
      });
    } finally {
      setImporting(false);
    }
  };

  // Handle file upload for JSON restore
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.links || !Array.isArray(json.links)) {
          throw new Error('Invalid backup file format: missing links array');
        }

        // Import the links
        const res = await fetch('/api/import/csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Convert to simple CSV format for the endpoint
            csvData: [
              'Name,Slug,SubID,OriginalUrl',
              ...json.links.map(
                (l: any) => `"${l.name}","${l.slug}","${l.subId || ''}","${l.originalUrl}"`
              ),
            ].join('\n'),
          }),
        });

        const result = await res.json();
        if (result.success) {
          setStatusMessage({
            type: 'success',
            text: `Restored ${result.imported} links from backup file.`,
          });
          onDataRestored();
        } else {
          throw new Error(result.error);
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Restore failed: ${err.message}`,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-400" />
          <span>Data Backup & Restore</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Export your campaigns to spreadsheets, restore saved configurations, and guarantee persistent link continuity.
        </p>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Complete Project ZIP Download Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-indigo-950/50 to-slate-900 border border-sky-500/40 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Download className="w-4 h-4" />
              <span>Full Source Code Package</span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-white">
              Download smartlink-manager-pro.zip
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Complete ready-to-run package with all frontend React code, Express full-stack backend, Netlify Functions, Supabase SQL schema, PWA manifest, and mobile assets.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/api/download-zip"
              download="smartlink-manager-pro.zip"
              className="flex items-center justify-center gap-2 bg-sky-400 hover:bg-sky-300 active:scale-95 text-slate-950 font-bold px-5 py-3 rounded-xl transition text-xs shadow-lg shadow-sky-500/20 whitespace-nowrap"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download ZIP (130 KB)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Export on Left, Restore on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Download className="w-4 h-4" />
              <span>Export Campaigns</span>
            </div>
            <h2 className="text-base font-bold text-white">Download Backups</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Save your generated links, slugs, sub IDs, and click metrics to CSV spreadsheets or full JSON snapshots.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-3 rounded-xl border border-slate-700 transition text-xs active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export All Links to CSV (.csv)</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-4 py-3 rounded-xl border border-slate-700 transition text-xs active:scale-98"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Export Full JSON Database Backup (.json)</span>
            </button>
          </div>
        </div>

        {/* File Restore Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Upload className="w-4 h-4" />
              <span>Restore Data</span>
            </div>
            <h2 className="text-base font-bold text-white">Import from Backup File</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Upload a previously exported JSON backup file or CSV spreadsheet to instantly repopulate your campaigns.
            </p>
          </div>

          <div>
            <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer bg-slate-950/60 transition group">
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-sky-400 transition mb-2" />
              <span className="text-xs font-semibold text-slate-300">
                Click to upload JSON or CSV backup
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                .json or .csv files supported
              </span>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* CSV Paste Import Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">Quick CSV Raw Text Import</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste raw comma-separated rows. Required column: <code>OriginalUrl</code>. Optional: <code>Name</code>, <code>Slug</code>, <code>SubID</code>.
          </p>
        </div>

        <form onSubmit={handleImportCSV} className="space-y-3">
          <textarea
            rows={4}
            placeholder={`Name,Slug,SubID,OriginalUrl\nCampaign 1,post1,sub_fb_1,https://www.highcpmgate.com/example1\nCampaign 2,post2,sub_fb_2,https://www.highcpmgate.com/example2`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-3 text-xs font-mono text-slate-200 placeholder-slate-600 outline-none transition"
          />

          <button
            type="submit"
            disabled={importing || !csvText.trim()}
            className="flex items-center justify-center gap-2 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition text-xs"
          >
            {importing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Process & Import Pasted Rows</span>
          </button>
        </form>
      </div>

      {/* Persistence Architecture Info */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Server-Side Storage Guarantees</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          SmartLink Manager Pro does <strong>not</strong> use fragile browser LocalStorage for global click tracking. Your links and redirect telemetry are stored in an atomic disk-backed persistent engine (and compatible with Supabase SQL). Your data persists across reboots, device switches, and browser clears.
        </p>
      </div>
    </div>
  );
};
