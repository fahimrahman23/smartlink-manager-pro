import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SmartLink {
  id: string;
  name: string;
  originalUrl: string;
  slug: string;
  subId: string;
  description: string;
  thumbnailUrl?: string;
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
  clickCount: number;
  uniqueCount: number;
}

export interface ClickRecord {
  id: string;
  linkId: string;
  linkSlug: string;
  linkName: string;
  subId: string;
  timestamp: string;
  userAgent: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'bot';
  browser: string;
  os: string;
  ipHash: string;
  referrer: string;
  queryParams: Record<string, string>;
  destinationUrl: string;
}

interface DatabaseSchema {
  links: SmartLink[];
  clicks: ClickRecord[];
  meta: {
    version: string;
    lastUpdated: string;
  };
}

const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'smartlinks.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed data to give user a rich experience right out of the box
const DEFAULT_LINKS: SmartLink[] = [
  {
    id: 'link_ast_1',
    name: 'Social Media Viral Traffic (US/CA)',
    originalUrl: 'https://www.highcpmgate.com/example-smartlink-1',
    slug: 'viral-promo',
    subId: 'fb_feed_tier1',
    description: 'High-tier North America direct display and popunder smartlink for social shares.',
    thumbnailUrl: '',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    clickCount: 142,
    uniqueCount: 128,
  },
  {
    id: 'link_ast_2',
    name: 'Telegram Channel Gaming Campaign',
    originalUrl: 'https://www.highcpmgate.com/example-smartlink-2',
    slug: 'gaming-zone',
    subId: 'tg_gamers_hub',
    description: 'Targeted gaming content smartlink for Telegram channel broadcast messages.',
    thumbnailUrl: '',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    clickCount: 89,
    uniqueCount: 76,
  },
  {
    id: 'link_ast_3',
    name: 'Tech Blog Footer Banner',
    originalUrl: 'https://www.highcpmgate.com/example-smartlink-3',
    slug: 'tech-gadgets',
    subId: 'web_footer_cta',
    description: 'Organic reader referral link placed below tutorial articles.',
    thumbnailUrl: '',
    status: 'paused',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
    clickCount: 34,
    uniqueCount: 31,
  },
];

// Helper to generate seed clicks for realistic charts
function generateInitialClicks(): ClickRecord[] {
  const clicks: ClickRecord[] = [];
  const now = Date.now();
  const devices: ('mobile' | 'desktop' | 'tablet')[] = ['mobile', 'mobile', 'mobile', 'desktop', 'desktop', 'tablet'];
  const referrers = ['https://m.facebook.com/', 'https://t.me/', 'https://twitter.com/', 'https://www.reddit.com/', 'Direct / None'];
  const browsers = ['Chrome Mobile', 'Safari Mobile', 'Chrome', 'Firefox', 'Edge'];
  const osList = ['Android 14', 'iOS 17.5', 'Windows 11', 'macOS 14', 'Android 13'];

  DEFAULT_LINKS.forEach((link) => {
    const count = link.clickCount;
    for (let i = 0; i < count; i++) {
      // spread clicks across the last 4 days
      const randomOffset = Math.random() * (4 * 86400000);
      const clickTime = new Date(now - randomOffset).toISOString();
      const dev = devices[Math.floor(Math.random() * devices.length)];
      clicks.push({
        id: `clk_${link.id}_${i}`,
        linkId: link.id,
        linkSlug: link.slug,
        linkName: link.name,
        subId: link.subId,
        timestamp: clickTime,
        userAgent: `Mozilla/5.0 (SmartLink-Agent-${dev})`,
        deviceType: dev,
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: osList[Math.floor(Math.random() * osList.length)],
        ipHash: crypto.createHash('sha256').update(`ip_${i % (link.uniqueCount || 10)}`).digest('hex').slice(0, 16),
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        queryParams: { subid: link.subId, ref: 'test' },
        destinationUrl: link.originalUrl,
      });
    }
  });

  return clicks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

class PersistentStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading database file, initializing defaults:', err);
    }

    const initialData: DatabaseSchema = {
      links: DEFAULT_LINKS,
      clicks: generateInitialClicks(),
      meta: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      },
    };
    this.saveDirect(initialData);
    return initialData;
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private persist() {
    this.data.meta.lastUpdated = new Date().toISOString();
    this.saveDirect(this.data);
  }

  // Links operations
  public getLinks(): SmartLink[] {
    return [...this.data.links];
  }

  public getLinkById(id: string): SmartLink | undefined {
    return this.data.links.find((l) => l.id === id);
  }

  public getLinkBySlug(slug: string): SmartLink | undefined {
    const cleanSlug = slug.trim().toLowerCase();
    return this.data.links.find((l) => l.slug.toLowerCase() === cleanSlug);
  }

  public isSlugAvailable(slug: string, excludeId?: string): boolean {
    const clean = slug.trim().toLowerCase();
    const existing = this.data.links.find((l) => l.slug.toLowerCase() === clean);
    if (!existing) return true;
    if (excludeId && existing.id === excludeId) return true;
    return false;
  }

  public createLink(linkInput: Omit<SmartLink, 'id' | 'createdAt' | 'updatedAt' | 'clickCount' | 'uniqueCount'>): SmartLink {
    const id = `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    let slug = linkInput.slug.trim().toLowerCase();
    if (!slug) {
      slug = `post${this.data.links.length + 1}`;
    }
    // Ensure slug uniqueness
    let counter = 1;
    let finalSlug = slug;
    while (!this.isSlugAvailable(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const newLink: SmartLink = {
      id,
      name: linkInput.name.trim(),
      originalUrl: linkInput.originalUrl.trim(),
      slug: finalSlug,
      subId: linkInput.subId ? linkInput.subId.trim() : '',
      description: linkInput.description ? linkInput.description.trim() : '',
      thumbnailUrl: linkInput.thumbnailUrl ? linkInput.thumbnailUrl.trim() : '',
      status: linkInput.status || 'active',
      createdAt: now,
      updatedAt: now,
      clickCount: 0,
      uniqueCount: 0,
    };

    this.data.links.unshift(newLink);
    this.persist();
    return newLink;
  }

  public updateLink(id: string, updates: Partial<Omit<SmartLink, 'id' | 'createdAt' | 'clickCount' | 'uniqueCount'>>): SmartLink | null {
    const index = this.data.links.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const current = this.data.links[index];
    let newSlug = current.slug;
    if (updates.slug && updates.slug.trim()) {
      const candidate = updates.slug.trim().toLowerCase();
      if (this.isSlugAvailable(candidate, id)) {
        newSlug = candidate;
      }
    }

    const updated: SmartLink = {
      ...current,
      ...updates,
      slug: newSlug,
      updatedAt: new Date().toISOString(),
    };

    this.data.links[index] = updated;
    this.persist();
    return updated;
  }

  public setLinkStatus(id: string, status: 'active' | 'paused'): SmartLink | null {
    return this.updateLink(id, { status });
  }

  public deleteLink(id: string): boolean {
    const initialLen = this.data.links.length;
    this.data.links = this.data.links.filter((l) => l.id !== id);
    // keep clicks for historical auditing or optionally cascade
    const changed = this.data.links.length < initialLen;
    if (changed) {
      this.persist();
    }
    return changed;
  }

  // Click & Redirect Recording
  public recordRedirect(
    link: SmartLink,
    metadata: {
      userAgent: string;
      ip: string;
      referrer: string;
      queryParams: Record<string, string>;
      destinationUrl: string;
    }
  ): ClickRecord {
    const salt = 'smartlink_salt_2026';
    const ipHash = crypto
      .createHash('sha256')
      .update(`${metadata.ip}_${salt}`)
      .digest('hex')
      .substring(0, 16);

    const ua = metadata.userAgent.toLowerCase();
    let deviceType: 'mobile' | 'desktop' | 'tablet' | 'bot' = 'desktop';
    if (/bot|crawl|spider|googlebot|bingbot|yahoo|slurp/i.test(ua)) {
      deviceType = 'bot';
    } else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android/i.test(ua)) {
      deviceType = 'mobile';
    }

    let browser = 'Unknown';
    if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edg/')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';

    let os = 'Unknown OS';
    if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';

    const clickId = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: ClickRecord = {
      id: clickId,
      linkId: link.id,
      linkSlug: link.slug,
      linkName: link.name,
      subId: metadata.queryParams.subid || metadata.queryParams.sub_id || link.subId || '',
      timestamp: new Date().toISOString(),
      userAgent: metadata.userAgent,
      deviceType,
      browser,
      os,
      ipHash,
      referrer: metadata.referrer || 'Direct / None',
      queryParams: metadata.queryParams,
      destinationUrl: metadata.destinationUrl,
    };

    this.data.clicks.unshift(record);
    // Limit stored clicks history in file to latest 10,000 to keep JSON memory lean
    if (this.data.clicks.length > 10000) {
      this.data.clicks = this.data.clicks.slice(0, 10000);
    }

    // Update link counters
    const linkObj = this.data.links.find((l) => l.id === link.id);
    if (linkObj) {
      linkObj.clickCount += 1;
      // Recalculate unique count based on distinct IP hashes for this link
      const distinctIps = new Set(this.data.clicks.filter((c) => c.linkId === link.id).map((c) => c.ipHash));
      linkObj.uniqueCount = distinctIps.size;
    }

    this.persist();
    return record;
  }

  // Analytics & Aggregations
  public getOverviewStats() {
    const totalLinks = this.data.links.length;
    const activeLinks = this.data.links.filter((l) => l.status === 'active').length;
    const pausedLinks = totalLinks - activeLinks;

    const totalClicks = this.data.clicks.length;
    const uniqueIps = new Set(this.data.clicks.map((c) => c.ipHash)).size;

    // Today's clicks (UTC)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayClicks = this.data.clicks.filter((c) => c.timestamp.startsWith(todayStr)).length;

    // Last 7 days breakdown
    const last7Days: { date: string; clicks: number; uniques: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const dayClicks = this.data.clicks.filter((c) => c.timestamp.startsWith(d));
      const dayUniques = new Set(dayClicks.map((c) => c.ipHash)).size;
      last7Days.push({
        date: d,
        clicks: dayClicks.length,
        uniques: dayUniques,
      });
    }

    // Device breakdown
    const devices = { mobile: 0, desktop: 0, tablet: 0, bot: 0 };
    this.data.clicks.forEach((c) => {
      if (devices[c.deviceType] !== undefined) {
        devices[c.deviceType]++;
      }
    });

    // Recent activity (latest 20 clicks)
    const recentActivity = this.data.clicks.slice(0, 20);

    return {
      totalLinks,
      activeLinks,
      pausedLinks,
      totalClicks,
      uniqueVisitors: uniqueIps,
      todayClicks,
      last7Days,
      devices,
      recentActivity,
    };
  }

  public getLinkClicks(linkId: string): ClickRecord[] {
    return this.data.clicks.filter((c) => c.linkId === linkId);
  }

  // Backup & Import
  public exportData(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public importLinks(linksToImport: Partial<SmartLink>[]): { imported: number; skipped: number } {
    let imported = 0;
    let skipped = 0;

    for (const item of linksToImport) {
      if (!item.originalUrl) {
        skipped++;
        continue;
      }

      const name = item.name || `Imported Link ${this.data.links.length + 1}`;
      const slugCandidate = item.slug || `imp-${Date.now().toString(36)}-${imported}`;
      
      this.createLink({
        name,
        originalUrl: item.originalUrl,
        slug: slugCandidate,
        subId: item.subId || '',
        description: item.description || 'Imported via CSV/JSON',
        thumbnailUrl: item.thumbnailUrl || '',
        status: item.status === 'paused' ? 'paused' : 'active',
      });
      imported++;
    }

    return { imported, skipped };
  }
}

export const db = new PersistentStore();
