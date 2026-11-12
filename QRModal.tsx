import React from 'react';
import { X, Smartphone, ExternalLink, Copy, Check } from 'lucide-react';

interface QRModalProps {
  url: string | null;
  title: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ url, title, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !url) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&bgcolor=ffffff&color=090d16&data=${encodeURIComponent(
    url
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Scan with Android Phone</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-bold text-base text-white truncate">{title || 'SmartLink QR'}</h3>
          <p className="text-xs text-slate-400">
            Open camera app on your phone to test the instant HTTP 302 redirect.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-inner mx-auto w-fit">
          <img
            src={qrImageUrl}
            alt="QR code for redirect"
            className="w-56 h-56 rounded-lg object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Link readout and copy button */}
        <div className="space-y-2">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-sky-300 truncate select-all text-center">
            {url}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied URL!' : 'Copy Link'}</span>
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 rounded-xl transition"
              title="Test in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
