import { useEffect, useState } from 'react';
import { SmartLink, ClickRecord } from '../types';
import { api, ghost } from './util';
export function AnalyticsModal({ link, isOpen, onClose }: { link: SmartLink | null; isOpen: boolean; onClose: () => void }) {
  const [rows, setRows] = useState<ClickRecord[] | null>(null);
  useEffect(() => { if (isOpen && link) { setRows(null); api(`/links/${link.id}/clicks`).then((r) => setRows(r.success ? r.data : [])); } }, [isOpen, link]);
  if (!isOpen || !link) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-3" onClick={onClose}>
      <div className="bg-[#0d1220] border border-slate-800 rounded-xl p-4 w-full max-w-lg max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3"><b className="text-sm">{link.name}</b><button className={ghost} onClick={onClose}>Close</button></div>
        <div className="text-xs text-slate-400 mb-3">{link.clickCount} clicks, {link.uniqueCount} unique</div>
        {rows === null && <div className="text-xs text-slate-500">Loading...</div>}
        {rows && !rows.length && <div className="text-xs text-slate-500">No clicks yet.</div>}
        {rows?.map((c) => (<div key={c.id} className="border-t border-slate-800 py-2 text-xs"><div>{new Date(c.timestamp).toLocaleString()}</div><div className="text-slate-400">{c.deviceType}, {c.browser}, {c.os}{c.referrer ? `, from ${c.referrer}` : ''}</div></div>))}
      </div>
    </div>
  );
}
