const H = { 'Content-Type': 'application/json' };
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: H });
const mapLink = (r: any) => ({ id: r.id, name: r.name, originalUrl: r.original_url, slug: r.slug, subId: r.sub_id || '', description: r.description || '', thumbnailUrl: r.thumbnail_url || undefined, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at, clickCount: r.click_count || 0, uniqueCount: r.unique_count || 0 });
const mapClick = (r: any) => ({ id: r.id, linkId: r.link_id, linkSlug: r.link_slug, linkName: r.link_name, subId: r.sub_id || '', timestamp: r.timestamp, userAgent: r.user_agent, deviceType: r.device_type, browser: r.browser, os: r.os, ipHash: r.ip_hash, referrer: r.referrer || '', queryParams: r.query_params || {}, destinationUrl: r.destination_url });
const toRow = (b: any) => {
  const o: any = {};
  if (b.name !== undefined) o.name = b.name;
  if (b.originalUrl !== undefined) o.original_url = b.originalUrl;
  if (b.slug !== undefined) o.slug = b.slug;
  if (b.subId !== undefined) o.sub_id = b.subId;
  if (b.description !== undefined) o.description = b.description;
  if (b.thumbnailUrl !== undefined) o.thumbnail_url = b.thumbnailUrl || null;
  if (b.status !== undefined) o.status = b.status;
  return o;
};

export default async (req: Request) => {
  const url = new URL(req.url);
  const m = req.method;
  const sp = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const SU = process.env.SUPABASE_URL;
  const SK = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!SU || !SK) return json({ success: false, error: 'Supabase credentials are not set in Netlify environment variables.' }, 503);
  const sb = (p: string, init: RequestInit = {}) =>
    fetch(`${SU}/rest/v1/${p}`, { ...init, headers: { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...((init.headers as any) || {}) } });

  try {
    if (m === 'GET' && sp === 'links') {
      const r = await sb('links?select=*&order=created_at.desc');
      return json({ success: true, data: (await r.json()).map(mapLink) });
    }
    if (m === 'POST' && sp === 'links') {
      const b = await req.json();
      const r = await sb('links', { method: 'POST', body: JSON.stringify(toRow(b)) });
      if (r.status === 409) return json({ success: false, error: 'That short name is already used. Choose another.' }, 409);
      const d = await r.json();
      if (!r.ok) return json({ success: false, error: d.message || 'Could not create the link' }, 400);
      return json({ success: true, data: mapLink(d[0]) }, 201);
    }
    if (m === 'GET' && sp === 'backup') {
      const r = await sb('links?select=*&order=created_at.asc');
      return json({ success: true, data: { version: 1, links: (await r.json()).map(mapLink) } });
    }
    if (m === 'POST' && sp === 'restore') {
      const b = await req.json();
      const rows = (b.links || []).map((l: any) => ({ ...toRow(l), id: l.id, click_count: l.clickCount || 0, unique_count: l.uniqueCount || 0, created_at: l.createdAt }));
      if (!rows.length) return json({ success: false, error: 'The backup has no links.' }, 400);
      const r = await sb('links?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(rows) });
      if (!r.ok) return json({ success: false, error: 'Restore failed. A short name may already be used.' }, 400);
      return json({ success: true, count: (await r.json()).length });
    }
    if (m === 'GET' && sp === 'stats/overview') {
      const links = (await (await sb('links?select=*')).json()) as any[];
      const since = new Date(Date.now() - 6 * 864e5); since.setUTCHours(0, 0, 0, 0);
      const clicks = ((await (await sb(`clicks?select=*&timestamp=gte.${since.toISOString()}&order=timestamp.desc&limit=5000`)).json()) as any[]) || [];
      const day = (d: Date) => d.toISOString().slice(0, 10);
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = day(new Date(since.getTime() + i * 864e5));
        const c = clicks.filter((x) => x.timestamp.slice(0, 10) === d);
        return { date: d, clicks: c.length, uniques: new Set(c.map((x) => x.ip_hash)).size };
      });
      const devices = { mobile: 0, desktop: 0, tablet: 0, bot: 0 } as Record<string, number>;
      clicks.forEach((c) => { if (c.device_type in devices) devices[c.device_type]++; });
      return json({ success: true, data: {
        totalLinks: links.length, activeLinks: links.filter((l) => l.status === 'active').length, pausedLinks: links.filter((l) => l.status === 'paused').length,
        totalClicks: links.reduce((a, l) => a + (l.click_count || 0), 0), uniqueVisitors: links.reduce((a, l) => a + (l.unique_count || 0), 0),
        todayClicks: last7Days[6].clicks, last7Days, devices, recentActivity: clicks.slice(0, 10).map(mapClick) } });
    }
    const mm = sp.match(/^links\/([^/]+)(?:\/(status|clicks))?$/);
    if (mm) {
      const id = encodeURIComponent(mm[1]);
      if (m === 'GET' && mm[2] === 'clicks') {
        const r = await sb(`clicks?select=*&link_id=eq.${id}&order=timestamp.desc&limit=100`);
        return json({ success: true, data: (await r.json()).map(mapClick) });
      }
      if (m === 'PATCH' && mm[2] === 'status') {
        const b = await req.json();
        const r = await sb(`links?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: b.status, updated_at: new Date().toISOString() }) });
        return json({ success: r.ok });
      }
      if (m === 'PUT' && !mm[2]) {
        const b = await req.json();
        const r = await sb(`links?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ ...toRow(b), updated_at: new Date().toISOString() }) });
        if (r.status === 409) return json({ success: false, error: 'That short name is already used.' }, 409);
        const d = await r.json();
        return r.ok && d[0] ? json({ success: true, data: mapLink(d[0]) }) : json({ success: false, error: 'Could not save' }, 400);
      }
      if (m === 'DELETE' && !mm[2]) {
        const r = await sb(`links?id=eq.${id}`, { method: 'DELETE' });
        return json({ success: r.ok });
      }
    }
    return json({ success: false, error: `Unknown route: ${sp}` }, 404);
  } catch (err: any) {
    return json({ success: false, error: err.message }, 500);
  }
};

export const config = { path: ['/api/*'] };
