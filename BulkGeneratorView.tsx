import { useState } from 'react';
import { SmartLink } from './types';
import { api, slugify, rand, inp, btn, card } from './linkutil';
export function BulkGeneratorView({ onBulkCreated }: { onBulkCreated: (l: SmartLink[]) => void }) {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  async function run() {
    const lines = text.split('\n').map((s) => s.trim()).filter(Boolean);
    const made: SmartLink[] = []; let bad = 0; setBusy(true); setMsg('');
    for (const line of lines) {
      const [name, url, subId = ''] = line.split('|').map((s) => s.trim());
      if (!name || !/^https?:\/\//.test(url || '')) { bad++; continue; }
      const res = await api('/links', 'POST', { name, originalUrl: url, subId, slug: slugify(name) || rand(), description: '' });
      if (res.success) made.push(res.data); else bad++;
    }
    setBusy(false); onBulkCreated(made);
    setMsg(`${made.length} links created${bad ? `, ${bad} skipped (check the format or a name already used)` : ''}.`);
    if (made.length) setText('');
  }
  return (
    <div className={`${card} max-w-xl space-y-3`}>
      <p className="text-sm text-slate-300">One link per line: <span className="text-sky-300">name | destination link | Sub ID</span></p>
      <textarea className={`${inp} h-48 font-mono text-xs`} placeholder={'offer1 | https://... | fb_post1\noffer2 | https://... | tg_post1'} value={text} onChange={(e) => setText(e.target.value)} />
      <button className={btn} disabled={busy || !text.trim()} onClick={run}>{busy ? 'Creating...' : 'Create all links'}</button>
      {msg && <div className="text-xs text-slate-300">{msg}</div>}
    </div>
  );
}
