# SmartLink Manager Pro

Professional, mobile-first Adsterra SmartLink redirect management platform with genuine server-side HTTP 302 forwarding, click analytics, sub-ID parameter preservation, and bulk campaign automation.

---

## What is in this ZIP Package

```
├── DEPLOYMENT_GUIDE.md          # Complete setup, Netlify & Supabase guide
├── netlify.toml                 # Netlify routing and build configuration
├── package.json                 # Project dependencies & scripts
├── server.ts                    # Full-Stack Express server with HTTP 302 redirects
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite build & PWA configuration
├── index.html                   # Mobile-first HTML entry point
├── metadata.json                # AI Studio application metadata
│
├── netlify/
│   └── functions/
│       ├── redirect.mts         # Serverless HTTP 302 redirect function for Netlify
│       └── api.mts              # Serverless API proxy for Supabase
│
├── supabase/
│   └── schema.sql               # PostgreSQL schema & atomic click increment function
│
├── data/
│   └── smartlinks.json          # Persistent local disk database storage
│
├── public/
│   ├── icon.svg                 # Vector app mark
│   ├── pwa-192x192.png          # Android home screen icon
│   ├── pwa-512x512.png          # Splash screen icon
│   └── apple-touch-icon.png     # iOS Safari home screen icon
│
├── src/
│   ├── App.tsx                  # Root application component
│   ├── main.tsx                 # React DOM entry
│   ├── index.css                # Tailwind CSS v4 styling
│   ├── types.ts                 # TypeScript data models
│   ├── server/
│   │   └── db.ts                # Disk-backed persistent database & telemetry engine
│   ├── hooks/
│   │   └── usePWAInstall.ts     # PWA install prompt hook
│   └── components/
│       ├── Navbar.tsx           # Responsive header bar
│       ├── BottomNav.tsx        # Mobile thumb-zone bottom navigation
│       ├── DashboardView.tsx    # KPI metrics, 7-day velocity chart & live feed
│       ├── GeneratorView.tsx    # Single SmartLink generator with QR code
│       ├── LinksListView.tsx    # Search, filter, edit, pause & delete links
│       ├── BulkGeneratorView.tsx# Batch campaign creator & CSV export
│       ├── BackupSettingsView.tsx# Data import/export & ZIP downloader
│       ├── GuideView.tsx        # Adsterra reconciliation & Android install guide
│       ├── EditLinkModal.tsx    # In-place link editor modal
│       ├── AnalyticsModal.tsx   # Detailed click telemetry drilldown
│       └── QRModal.tsx          # Mobile QR code scanner modal
```

---

## How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## Deploy to Netlify (Free Serverless)

1. Create a free project at [https://supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Push this project to GitHub and connect to [Netlify](https://app.netlify.com).
4. Add environment variables in Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Netlify will deploy your frontend and the serverless redirect function from `netlify/functions/redirect.mts`.

---

## Testing Real HTTP 302 Redirects

Test direct redirect via curl or your browser:
```bash
curl -i "http://localhost:3000/r/viral-promo?subid=test_affiliate&custom=123"
```
You will receive:
```http
HTTP/1.1 302 Found
Location: https://www.highcpmgate.com/example-smartlink-1?subid=test_affiliate&custom=123
```
