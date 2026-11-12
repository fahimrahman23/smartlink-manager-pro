import { useState } from 'react';
import { SmartLink } from '../types';
import { api, shortUrl, slugify, rand, copy, inp, btn, card, ghost } from './util';
export function GeneratorView({ onLinkCreated, onEditLink, onDeleteLink, onOpenQR }: { onLinkCreated: (l: SmartLink) => void; onEditLink: (l: SmartLink) => void; onDeleteLink: (id: string) => void; onOpenQR: (url: string, title: string) => void }) {
  const [f, setF] = useState({ name: '', originalUrl: '', slug: '', subId: '', description: '', thumbnailUrl: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [made, setMade] = useState<SmartLink | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  async function submit() {
    setErr('');
    if (!f.name.trim() || !/^https?:\/\//.test(f.originalUrl.trim())) { setErr('Enter a name and a destination link that starts with https://'); return; }
    setBusy(true);
    const res = await api('/links', 'POST', { ...f, originalUrl: f.originalUrl.trim(), slug: slugify(f.slug || f.name) || rand() });
    setBusy(false);
    if (!res.success) { setErr(res.error || 'Could not create the link'); return; }
    setMade(res.data); onLinkCreated(res.data);
    setF({ name: '', originalUrl: '', slug: '', subId: '', description: '', thumbnailUrl: '' });
  }
  return (
    <div className="space-y-4 max-w-xl">
      <div className={`${card} space-y-3`}>
        <input className={inp} placeholder="Link name" value={f.name} onChange={(e) => set('name', e.target.value)} />
        <input className={inp} placeholder="Destination link (your Smartlink)" value={f.originalUrl} onChange={(e) => set('originalUrl', e.target.value)} />
        <input className={inp} placeholder="Short name, for example offer1 (optional)" value={f.slug} onChange={(e) => set('slug', e.target.value)} />
        <input className={inp} placeholder="Sub ID (optional)" value={f.subId} onChange={(e) => set('subId', e.target.value)} />
        <input className={inp} placeholder="Preview text (optional)" value={f.description} onChange={(e) => set('description', e.target.value)} />
        <input className={inp} placeholder="Preview image URL (optional)" value={f.thumbnailUrl} onChange={(e) => set('thumbnailUrl', e.target.value)} />
        {err && <div className="text-xs text-red-400">{err}</div>}
        <button className={btn} disabled={busy} onClick={submit}>{busy ? 'Creating...' : 'Create link'}</button>
      </div>
      {made && (
        <div className={card}>
          <div className="text-xs text-emerald-400 mb-1">Link created</div>
          <div className="text-sm text-sky-300 break-all mb-3">{shortUrl(made.slug)}</div>
          <div className="flex flex-wrap gap-2">
            <button className={ghost} onClick={() => copy(shortUrl(made.slug))}>Copy</button>
            <button className={ghost} onClick={() => onOpenQR(shortUrl(made.slug), made.name)}>QR</button>
            <button className={ghost} onClick={() => onEditLink(made)}>Edit</button>
            <button className={ghost} onClick={() => { onDeleteLink(made.id); setMade(null); }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
