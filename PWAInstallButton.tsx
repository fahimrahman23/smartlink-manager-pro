import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-sky-500/10 border border-sky-500/30 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition whitespace-nowrap shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> button in Safari's bottom toolbar.<br />
                2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.<br />
                3. Tap <strong className="text-white">Add</strong> to launch SmartLink Manager Pro as a full-screen app.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show a helpful "Install on Mobile" button on desktop/general browsers
  return null;
};
