import { createHash } from 'node:crypto';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const page = (body: string, status = 200) => new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${body}`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

export default async (req: Request) => {
  const url = new URL(req.url);
  const slug = decodeURIComponent(url.pathname.replace(/^\/(r|\.netlify\/functions\/redirect)\/?/, '').split('/')[0] || '');
  const SU = process.env.SUPABASE_URL;
  const SK = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!SU || !SK || !slug) return page('<title>Not found</title></head><body><p>Link not found.</p></body></html>', 404);
  const sb = (p: string, init: RequestInit = {}) => fetch(`${SU}/rest/v1/${p}`, { ...init, headers: { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json', ...((init.headers as any) || {}) } });

  const rows = await (await sb(`links?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`)).json();
  const link = rows?.[0];
  if (!link) return page('<title>Not found</title></head><body><p>Link not found.</p></body></html>', 404);
  if (link.status !== 'active') return page('<title>Paused</title></head><body><p>This link is paused.</p></body></html>', 410);

  let dest: URL;
  try { dest = new URL(link.original_url); } catch { return page('<title>Error</title></head><body><p>Invalid destination.</p></body></html>', 500); }
  if (link.sub_id) dest.searchParams.set('sub1', link.sub_id);
  const extra: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { extra[k] = v; if (!dest.searchParams.has(k)) dest.searchParams.set(k, v); });

  const ua = req.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|facebookexternalhit|whatsapp|telegram|preview|slurp/i.test(ua);
  if (!isBot) {
    try {
      const ip = req.headers.get('x-nf-client-connection-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown';
      const ipHash = createHash('sha256').update(ip + ua).digest('hex').slice(0, 16);
      const seen = await (await sb(`clicks?select=id&link_id=eq.${link.id}&ip_hash=eq.${ipHash}&limit=1`)).json();
      const deviceType = /ipad|tablet/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop';
      const browser = /edg/i.test(ua) ? 'Edge' : /opr|opera/i.test(ua) ? 'Opera' : /chrome|crios/i.test(ua) ? 'Chrome' : /firefox|fxios/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : 'Other';
      const os = /android/i.test(ua) ? 'Android' : /iphone|ipad|ios/i.test(ua) ? 'iOS' : /windows/i.test(ua) ? 'Windows' : /mac/i.test(ua) ? 'macOS' : /linux/i.test(ua) ? 'Linux' : 'Other';
      await sb('clicks', { method: 'POST', body: JSON.stringify({ link_id: link.id, link_slug: link.slug, link_name: link.name, sub_id: link.sub_id || '', user_agent: ua, device_type: deviceType, browser, os, ip_hash: ipHash, referrer: req.headers.get('referer') || '', query_params: extra, destination_url: dest.toString() }) });
      await sb(`links?id=eq.${link.id}`, { method: 'PATCH', body: JSON.stringify({ click_count: (link.click_count || 0) + 1, unique_count: (link.unique_count || 0) + (seen?.length ? 0 : 1) }) });
    } catch { /* counting must never block the visitor */ }
  }

  const d = dest.toString();
  const og = `<meta property="og:title" content="${esc(link.name)}"><meta property="og:description" content="${esc(link.description || '')}">${link.thumbnail_url ? `<meta property="og:image" content="${esc(link.thumbnail_url)}"><meta name="twitter:card" content="summary_large_image">` : ''}`;
  return page(`<title>${esc(link.name)}</title>${og}<meta http-equiv="refresh" content="0;url=${esc(d)}"><script>location.replace(${JSON.stringify(d).replace(/</g, '\\u003c')})</script></head><body><p><a href="${esc(d)}">Continue</a></p></body></html>`);
};

export const config = { path: '/r/*' };
