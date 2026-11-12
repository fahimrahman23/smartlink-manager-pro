export const shortUrl = (slug: string) => `${location.origin}/r/${slug}`;
export async function api(path: string, method = 'GET', body?: unknown) {
  const r = await fetch('/api' + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  return r.json();
}
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const rand = () => Math.random().toString(36).slice(2, 8);
export const copy = (t: string) => navigator.clipboard?.writeText(t);
export const inp = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-sky-500';
export const btn = 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50';
export const ghost = 'border border-slate-700 hover:border-slate-500 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg';
export const card = 'bg-slate-900/60 border border-slate-800 rounded-xl p-4';
