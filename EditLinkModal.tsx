import { useEffect, useState } from 'react';
import { SmartLink } from './types';
import { api, inp, btn, ghost } from './linkutil';
export function EditLinkModal({ link, isOpen, onClose, onSave }: { link: SmartLink | null; isOpen: boolean; onClose: () => void; onSave: (l: SmartLink) => void }) {
  const [f, setF] = useState({ name: '', originalUrl: '', slug: '', subId: '', description: '', thumbnailUrl: '' });
  const [err, setErr] = useState('');
  useEffect(() => { if (link) { setF({ name: link.name, originalUrl: link.originalUrl, slug: link.slug, subId: link.subId, description: link.description, thumbnailUrl: link.thumbnailUrl || '' }); setErr(''); } }, [link]);
  if (!isOpen || !link) return null;
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  async function save() {
    const res = await api(`/links/${link!.id}`, 'PUT', f);
    if (!res.success) { setErr(res.error || 'Could not save'); return; }
    onSave(res.data); onClose();
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-3" onClick={onClose}>
      <div className="bg-[#0d1220] border border-slate-800 rounded-xl p-4 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <b className="text-sm">Edit link</b>
        {(['name', 'originalUrl', 'slug', 'subId', 'description', 'thumbnailUrl'] as const).map((k) => (<input key={k} className={inp} placeholder={k} value={f[k]} onChange={(e) => set(k, e.target.value)} />))}
        {err && <div className="text-xs text-red-400">{err}</div>}
        <div className="flex gap-2"><button className={btn} onClick={save}>Save changes</button><button className={ghost} onClick={onClose}>Cancel</button></div>
      </div>
    </div>
  );
}
