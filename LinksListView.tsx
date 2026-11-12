import { useState } from 'react';
import { Copy, QrCode, BarChart3, Pencil, Pause, Play, Trash2 } from 'lucide-react';
import { SmartLink } from '../types';
import { shortUrl, copy, inp, card, ghost, btn } from './util';
export function LinksListView({ links, onToggleStatus, onEditLink, onDeleteLink, onSelectLink, onOpenQR, onCreateNew }: { links: SmartLink[]; onToggleStatus: (id: string, s: 'active' | 'paused') => void; onEditLink: (l: SmartLink) => void; onDeleteLink: (id: string) => void; onSelectLink: (l: SmartLink) => void; onOpenQR: (url: string, title: string) => void; onCreateNew: () => void }) {
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState('');
  const list = links.filter((l) => (l.name + l.slug + l.subId).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="flex gap-2"><input className={inp} placeholder="Search links" value={q} onChange={(e) => setQ(e.target.value)} /><button className={btn} onClick={onCreateNew}>New</button></div>
      {!list.length && <div className={`${card} text-sm text-slate-400`}>No links found.</div>}
      {list.map((l) => (
        <div key={l.id} className={card}>
          <div className="flex justify-between gap-2"><b className="text-sm truncate">{l.name}</b><span className={`text-[11px] ${l.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>{l.status}</span></div>
          <div className="text-xs text-sky-300 truncate">{shortUrl(l.slug)}</div>
          <div className="text-xs text-slate-500 truncate mb-2">{l.originalUrl}</div>
          <div className="text-xs text-slate-400 mb-3">{l.clickCount} clicks, {l.uniqueCount} unique{l.subId ? `, Sub ID ${l.subId}` : ''}</div>
          <div className="flex flex-wrap gap-2">
            <button className={ghost} onClick={() => { copy(shortUrl(l.slug)); setCopied(l.id); setTimeout(() => setCopied(''), 1500); }}><Copy className="w-3.5 h-3.5 inline mr-1" />{copied === l.id ? 'Copied' : 'Copy'}</button>
            <button className={ghost} onClick={() => onOpenQR(shortUrl(l.slug), l.name)}><QrCode className="w-3.5 h-3.5 inline mr-1" />QR</button>
            <button className={ghost} onClick={() => onSelectLink(l)}><BarChart3 className="w-3.5 h-3.5 inline mr-1" />Stats</button>
            <button className={ghost} onClick={() => onEditLink(l)}><Pencil className="w-3.5 h-3.5 inline mr-1" />Edit</button>
            <button className={ghost} onClick={() => onToggleStatus(l.id, l.status)}>{l.status === 'active' ? <><Pause className="w-3.5 h-3.5 inline mr-1" />Pause</> : <><Play className="w-3.5 h-3.5 inline mr-1" />Resume</>}</button>
            <button className={ghost} onClick={() => confirm(`Delete "${l.name}"?`) && onDeleteLink(l.id)}><Trash2 className="w-3.5 h-3.5 inline mr-1" />Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
