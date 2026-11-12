import React from 'react';
import {
  HelpCircle,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export const GuideView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-24 md:pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <span>Adsterra Publisher & Verification Guide</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Detailed guide on testing your redirects, installing on Android, and analyzing traffic data between SmartLink Manager Pro and Adsterra.
        </p>
      </div>

      {/* 1. Android Installation Guide */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <Smartphone className="w-4 h-4" />
          <span>Mobile-First Android Installation</span>
        </div>
        <h2 className="text-base font-bold text-white">How to Install on Android in 15 Seconds</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-bold text-sky-400 block">Step 1: Open Chrome</span>
            <p className="text-slate-400">Open this app URL in Google Chrome on your Android smartphone.</p>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-bold text-sky-400 block">Step 2: Tap Menu or Install</span>
            <p className="text-slate-400">Tap the "Install App" button in the top bar, or tap the 3 dots (⋮) in Chrome.</p>
          </div>
          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
            <span className="font-bold text-sky-400 block">Step 3: Add to Home Screen</span>
            <p className="text-slate-400">Select "Install app" or "Add to Home screen". The app now opens full-screen like a native app!</p>
          </div>
        </div>
      </div>

      {/* 2. Discrepancy Breakdown Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          <span>Traffic Accounting</span>
        </div>
        <h2 className="text-base font-bold text-white">
          Comparing SmartLink Manager Pro Stats with Adsterra Dashboard
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Why might your SmartLink Manager Pro show 1,000 redirect requests while Adsterra records 800–900 impressions? Here is how legitimate ad networks operate:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Traffic Factor</th>
                <th className="py-2.5 px-3 text-sky-400">SmartLink Manager Pro</th>
                <th className="py-2.5 px-3 text-purple-400">Adsterra Publisher Dashboard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-medium">Measurement Point</td>
                <td className="py-2.5 px-3 text-slate-400">
                  <strong>At the Gate</strong>: Instant count when visitor initiates redirect request.
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  <strong>At Render</strong>: Counted after visitor loads advertiser page.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Network Latency / Drop-Off</td>
                <td className="py-2.5 px-3 text-slate-400">
                  Recorded immediately via 302 HTTP header.
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  If visitor closes tab before advertiser page renders, Adsterra cannot record it.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Adblockers & Shields</td>
                <td className="py-2.5 px-3 text-slate-400">
                  100% recorded (your custom domain is clean).
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  Aggressive client adblockers may block Adsterra scripts from firing.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Bot / Crawler Filtering</td>
                <td className="py-2.5 px-3 text-slate-400">
                  Flags bot user-agents in activity log.
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  Adsterra anti-fraud automatically discards data center & scraper bots.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Frequency Capping</td>
                <td className="py-2.5 px-3 text-slate-400">
                  Records every click + distinct unique IP estimate.
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  Adsterra generally credits 1 impression per unique visitor per 24h.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Sub ID Strategy Guide */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Pro Publisher Tip: Sub ID Optimization</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Always assign unique Sub IDs to each link (for example, <code className="text-sky-300">fb_us_feed</code>, <code className="text-sky-300">tg_crypto_bot</code>, <code className="text-sky-300">web_native_banner</code>).
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          When visitors click your link, SmartLink Manager Pro passes this Sub ID directly to Adsterra. In your Adsterra Publisher statistics, filter by <strong>Sub ID</strong> to see exactly which channel yields the highest CPM and revenue!
        </p>
      </div>

      {/* 4. Real Testing Checklist */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-3">
        <h2 className="text-base font-bold text-white">Verification Checklist</h2>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>1. Create a SmartLink with your real or test Adsterra URL.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>2. Copy the generated URL (<code className="text-sky-300">/r/slug</code>) and open in incognito or mobile.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>3. Verify that browser network inspector returns <strong>HTTP 302 Found</strong> pointing to destination.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>4. Verify all query parameters (<code className="text-sky-300">?subid=xyz&test=1</code>) are retained.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>5. Check your dashboard to verify the redirect request counter increments immediately.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
