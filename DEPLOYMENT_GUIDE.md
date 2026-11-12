# SmartLink Manager Pro - Complete Setup & Deployment Guide

Welcome to **SmartLink Manager Pro**, the professional mobile-first redirect management platform designed specifically for Adsterra publishers, affiliate marketers, and media buyers.

---

## 1. How the Application Works Right Now

You have a complete full-stack application running right now:
- **Express Backend (`server.ts`)**: Handles instant server-side **HTTP 302 redirects** at `/r/:slug` and `/:slug`.
- **Parameter Preservation**: All incoming UTM parameters, ad network tags, and tracking tokens (`fbclid`, `subid`, etc.) are automatically merged and forwarded to your original Adsterra SmartLink.
- **Real Click & Redirect Telemetry**: Every redirect request logs the timestamp, device type (Mobile, Desktop, Tablet), operating system, browser, referrer, and salted IP hash for privacy-safe unique visitor estimation.
- **Persistent Database (`data/smartlinks.json`)**: All links, status toggles (Active / Paused), and click history persist across reboots, device switches, and sessions.
- **PWA Mobile-First**: Installable directly onto your Android or iOS smartphone home screen.

---

## 2. Testing the Redirect in Real-Time

1. Open the dashboard and tap **"Create New Link"** or use one of the pre-configured campaign links.
2. Enter your Adsterra SmartLink URL (e.g., `https://www.highcpmgate.com/your-adsterra-code`).
3. Set a custom slug, such as `post1` or `crypto-offer`, and a Sub ID like `fb_group_1`.
4. Click **"Generate Link"**.
5. Copy the generated URL (e.g., `https://your-domain.com/r/post1?test_param=123`).
6. Paste it into an incognito window or your Android phone browser:
   - Notice you are immediately redirected via **HTTP 302** directly to Adsterra.
   - Return to your dashboard and refresh: the **Total Clicks**, **Today's Clicks**, and **Device Breakdown** will have recorded your visit!

---

## 3. Deploying to Netlify (Free Serverless Hosting)

To deploy your own production instance on Netlify with custom domain support:

### Step 1: Create a Free Supabase Database
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. In the Supabase dashboard, click **SQL Editor** on the left menu.
3. Open the file `supabase/schema.sql` from this project, copy all lines, paste them into the SQL Editor, and click **Run**.
4. Go to **Project Settings** -> **API**:
   - Copy **Project URL** (e.g., `https://xyzcompany.supabase.co`).
   - Copy **service_role secret key** (or anon key).

### Step 2: Deploy to Netlify
1. Push this repository to your GitHub account or drag-and-drop the project folder to [Netlify](https://app.netlify.com).
2. In Netlify Site Settings -> **Environment variables**, add:
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key.
3. Netlify will build the frontend using `npm run build` and deploy the serverless redirect function from `netlify/functions/redirect.mts`.
4. Your redirects will now be processed at `https://your-netlify-subdomain.netlify.app/r/:slug`!

---

## 4. Installing on Android Phone (PWA)

SmartLink Manager Pro is built mobile-first:
1. Open the application in **Google Chrome** on your Android smartphone.
2. Tap the **"Install App"** button at the top of the dashboard, or tap the three dots **(⋮)** in Chrome and select **"Add to Home screen"** / **"Install app"**.
3. The app icon will be added to your home screen and open in full-screen standalone mode without the browser URL bar.
4. You can create, manage, pause, and copy links directly on the go.

---

## 5. Understanding Your Redirect Stats vs. Adsterra Dashboard

A critical question publishers often ask:
> *"Why does SmartLink Manager Pro show 1,000 redirect requests, but my Adsterra dashboard shows 820 impressions or clicks?"*

Here is the exact technical explanation of how traffic accounting works in affiliate and ad networks:

| Factor | SmartLink Manager Pro | Adsterra Publisher Dashboard |
| :--- | :--- | :--- |
| **Point of Measurement** | **At the door**: Recorded the exact millisecond a visitor hits your link before being sent to Adsterra. | **After delivery**: Recorded once Adsterra's landing page fully loads and renders the advertiser's offer. |
| **Drop-offs & Network Latency** | Counts the initial request. | If a visitor has slow 3G/4G or closes the tab while loading, Adsterra will not count it. |
| **Adblockers & Browser Shields** | Counts the redirect because your domain is not on adblock lists. | Browser adblockers (Brave, uBlock Origin) may block Adsterra scripts from firing. |
| **Bot & Web Crawler Filtering** | Distinguishes and flags bots in your activity logs. | Adsterra silently discards scrapers, crawlers, and data-center IPs. |
| **Geo-Targeting Availability** | Counts traffic from all countries. | If an advertiser does not have active bids for a particular tier-3 country or carrier at that moment, it may be categorized differently. |
| **Frequency Capping** | Logs every click (while showing unique IP estimates). | Adsterra generally caps payouts to 1 impression per unique visitor per 24 hours depending on the ad format. |

**Pro Tip**: Use SmartLink Manager Pro's **Sub ID** feature (e.g. `subid=telegram_ch1` vs `subid=fb_group_2`). You can view your Sub ID stats directly inside your Adsterra reporting tab to see which traffic source converts the best!
