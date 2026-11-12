import { useState } from 'react';
import { api, btn, card, ghost } from './linkutil';
export function BackupSettingsView({ onDataRestored }: { onDataRestored: () => void }) {
  const [msg, setMsg] = useState('');
  async function exportAll() {
    const res = await api('/backup');
    if (!res.success) { setMsg('Backup failed.'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' }));
    a.download = `smartlinks-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setMsg('Backup downloaded.');
  }
  async function importFile(f?: File) {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const res = await api('/restore', 'POST', data);
      setMsg(res.success ? `${res.count} links restored.` : res.error || 'Restore failed.');
      if (res.success) onDataRestored();
    } catch { setMsg('That file is not a valid backup.'); }
  }
  return (
    <div className="space-y-4 max-w-xl">
      <div className={card}><div className="text-sm mb-3">Download all your links as a file.</div><button className={btn} onClick={exportAll}>Download backup</button></div>
      <div className={card}><div className="text-sm mb-3">Restore links from a backup file.</div><label className={`${ghost} inline-block cursor-pointer`}>Choose backup file<input type="file" accept=".json" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} /></label></div>
      {msg && <div className="text-xs text-slate-300">{msg}</div>}
    </div>
  );
}
