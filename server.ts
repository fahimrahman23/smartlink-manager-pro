import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { db, SmartLink } from './src/server/db.ts';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to construct destination URL with preserved query parameters
function buildDestinationUrl(originalUrl: string, incomingQuery: Record<string, any>, linkSubId?: string): string {
  try {
    const url = new URL(originalUrl);

    // If a default subId is set and no subid was passed in incoming query, inject it
    if (linkSubId && !incomingQuery.subid && !incomingQuery.sub_id && !incomingQuery.sub1) {
      url.searchParams.set('subid', linkSubId);
    }

    // Merge and preserve all incoming query parameters
    for (const [key, value] of Object.entries(incomingQuery)) {
      if (value !== undefined && value !== null && key !== '') {
        if (Array.isArray(value)) {
          url.searchParams.set(key, String(value[0]));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  } catch {
    // If not a standard URL, append query manually
    const queryString = new URLSearchParams(incomingQuery as Record<string, string>).toString();
    if (!queryString) return originalUrl;
    return originalUrl.includes('?') ? `${originalUrl}&${queryString}` : `${originalUrl}?${queryString}`;
  }
}

// -------------------------------------------------------------
// Real Server-Side HTTP 302 Redirect Handler
// -------------------------------------------------------------
function handleRedirect(slug: string, req: Request, res: Response, isDirectPrefix = false) {
  const link = db.getLinkBySlug(slug);

  if (!link) {
    if (isDirectPrefix) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Not Found | SmartLink Manager Pro</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            h1 { font-size: 24px; margin: 0 0 12px; color: #f87171; }
            p { color: #94a3b8; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
            a { display: inline-block; background: #38bdf8; color: #090d16; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Link Not Found</h1>
            <p>The SmartLink slug <strong>"${slug}"</strong> does not exist or has been removed by the publisher.</p>
            <a href="/">Open SmartLink Manager Pro</a>
          </div>
        </body>
        </html>
      `);
    }
    return false; // let next middleware handle
  }

  // Handle Paused Link
  if (link.status === 'paused') {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campaign Paused | SmartLink Manager Pro</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
          .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .badge { display: inline-block; background: #334155; color: #f59e0b; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
          h1 { font-size: 22px; margin: 0 0 12px; color: #f1f5f9; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 24px; }
          a { display: inline-block; background: #1e293b; color: #f1f5f9; font-weight: 600; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; border: 1px solid #334155; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Campaign Temporarily Inactive</div>
          <h1>${link.name}</h1>
          <p>This SmartLink offer is currently paused by the publisher. No traffic is forwarded at this moment.</p>
          <a href="/">Dashboard</a>
        </div>
      </body>
      </html>
    `);
  }

  // Construct destination URL with parameter forwarding
  const incomingQuery = req.query as Record<string, any>;
  const destinationUrl = buildDestinationUrl(link.originalUrl, incomingQuery, link.subId);

  // Extract client details
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  const referrer = (req.headers['referer'] || req.headers['referrer'] || 'Direct / None') as string;

  // Record redirect in persistent database
  db.recordRedirect(link, {
    userAgent,
    ip,
    referrer,
    queryParams: incomingQuery,
    destinationUrl,
  });

  // Issue real HTTP 302 redirect directly to Adsterra SmartLink
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.redirect(302, destinationUrl);
}

// Explicit redirect route /r/:slug
app.get('/r/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  handleRedirect(slug, req, res, true);
});

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Overview statistics
app.get('/api/stats/overview', (_req: Request, res: Response) => {
  try {
    const stats = db.getOverviewStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List all links
app.get('/api/links', (_req: Request, res: Response) => {
  try {
    const links = db.getLinks();
    res.json({ success: true, data: links });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Check slug availability
app.get('/api/check-slug/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const excludeId = req.query.excludeId as string | undefined;
  const available = db.isSlugAvailable(slug, excludeId);
  res.json({ success: true, slug, available });
});

// Create single link
app.post('/api/links', (req: Request, res: Response) => {
  try {
    const { name, originalUrl, slug, subId, description, thumbnailUrl, status } = req.body;

    if (!originalUrl || typeof originalUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'Original Adsterra SmartLink URL is required.' });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Link Name is required.' });
    }

    // Basic URL format validation
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid URL format. Please include http:// or https://' });
    }

    const created = db.createLink({
      name,
      originalUrl,
      slug: slug || '',
      subId: subId || '',
      description: description || '',
      thumbnailUrl: thumbnailUrl || '',
      status: status === 'paused' ? 'paused' : 'active',
    });

    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk link generator
app.post('/api/links/bulk', (req: Request, res: Response) => {
  try {
    const { items, namePrefix, baseSubId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Provide a list of link entries to create.' });
    }

    const createdLinks: SmartLink[] = [];

    items.forEach((item, index) => {
      const url = typeof item === 'string' ? item.trim() : (item.originalUrl || '').trim();
      if (!url) return;

      const name = item.name || (namePrefix ? `${namePrefix} #${index + 1}` : `Adsterra Campaign #${index + 1}`);
      const subId = item.subId || (baseSubId ? `${baseSubId}_${index + 1}` : '');
      const slugCandidate = item.slug || `promo-${Date.now().toString(36)}-${index + 1}`;

      const created = db.createLink({
        name,
        originalUrl: url,
        slug: slugCandidate,
        subId,
        description: item.description || 'Generated via Bulk Link Generator',
        thumbnailUrl: item.thumbnailUrl || '',
        status: 'active',
      });

      createdLinks.push(created);
    });

    res.status(201).json({
      success: true,
      count: createdLinks.length,
      data: createdLinks,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update link
app.put('/api/links/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, originalUrl, slug, subId, description, thumbnailUrl, status } = req.body;

    const existing = db.getLinkById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    const updated = db.updateLink(id, {
      name,
      originalUrl,
      slug,
      subId,
      description,
      thumbnailUrl,
      status,
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle pause/active
app.patch('/api/links/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'active' && status !== 'paused') {
      return res.status(400).json({ success: false, error: 'Status must be active or paused' });
    }

    const updated = db.setLinkStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete link
app.delete('/api/links/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteLink(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }
    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single link analytics
app.get('/api/links/:id/analytics', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const link = db.getLinkById(id);
    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }
    const clicks = db.getLinkClicks(id);
    res.json({
      success: true,
      link,
      totalClicks: clicks.length,
      clicks: clicks.slice(0, 100), // latest 100 records
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CSV Export
app.get('/api/export/csv', (_req: Request, res: Response) => {
  try {
    const links = db.getLinks();
    const headers = ['ID', 'Name', 'Slug', 'SubID', 'OriginalUrl', 'Status', 'ClickCount', 'UniqueCount', 'CreatedAt'];
    const rows = links.map((l) => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      l.slug,
      `"${(l.subId || '').replace(/"/g, '""')}"`,
      `"${(l.originalUrl || '').replace(/"/g, '""')}"`,
      l.status,
      l.clickCount,
      l.uniqueCount,
      l.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="smartlinks-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CSV Import
app.post('/api/import/csv', (req: Request, res: Response) => {
  try {
    const { csvData } = req.body;
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ success: false, error: 'CSV data string required' });
    }

    const lines = csvData.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, error: 'CSV is empty or missing data rows' });
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    const urlIdx = header.findIndex((h) => h.includes('url') || h.includes('original'));
    const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('title'));
    const slugIdx = header.findIndex((h) => h.includes('slug'));
    const subIdIdx = header.findIndex((h) => h.includes('sub'));

    if (urlIdx === -1) {
      return res.status(400).json({ success: false, error: 'Could not find URL column in CSV header' });
    }

    const itemsToImport: Partial<SmartLink>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV splitting
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const url = cols[urlIdx];
      if (!url) continue;

      itemsToImport.push({
        originalUrl: url,
        name: nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Imported Link ${i}`,
        slug: slugIdx !== -1 && cols[slugIdx] ? cols[slugIdx] : '',
        subId: subIdIdx !== -1 && cols[subIdIdx] ? cols[subIdIdx] : '',
      });
    }

    const result = db.importLinks(itemsToImport);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// JSON Full Backup
app.get('/api/export/backup', (_req: Request, res: Response) => {
  try {
    const backup = db.exportData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="smartlinks-backup-${Date.now()}.json"`);
    res.json(backup);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full Project Source Code ZIP Download
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve('public/smartlink-manager-pro.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="smartlink-manager-pro.zip"');
    res.sendFile(zipPath);
  } else {
    res.status(404).send('ZIP file not found. Please regenerate.');
  }
});

// Check if a root path could be a short link slug (e.g., /post1 or /crypto-offer)
const RESERVED_PREFIXES = [
  'api',
  'src',
  'node_modules',
  'assets',
  'public',
  'smartlink-manager-pro.zip',
  'icon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-maskable-512x512.png',
  'manifest.webmanifest',
  'registerSW.js',
  'sw.js',
  'workbox-',
  '@',
];

// Fallback short slug route: /:slug (e.g. /post1)
app.get('/:slug', (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  // Skip system routes and static file extensions
  if (
    RESERVED_PREFIXES.some((prefix) => slug.startsWith(prefix)) ||
    slug.includes('.') ||
    slug === ''
  ) {
    return next();
  }

  const handled = handleRedirect(slug, req, res, false);
  if (handled === false) {
    // If slug is not found in database, pass to next (which serves Vite / React frontend)
    return next();
  }
});

// -------------------------------------------------------------
// Dev & Production Vite Server Integration
// -------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[SmartLink Manager Pro] Full-Stack server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
