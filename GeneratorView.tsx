import React, { useState } from 'react';
import { SmartLink } from '../types';
import {
  Link2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  QrCode,
  Share2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';

interface GeneratorViewProps {
  onLinkCreated: (newLink: SmartLink) => void;
  onEditLink: (link: SmartLink) => void;
  onDeleteLink: (linkId: string) => void;
  onOpenQR: (url: string, title: string) => void;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  onLinkCreated,
  onEditLink,
  onDeleteLink,
  onOpenQR,
}) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [subId, setSubId] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<SmartLink | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick slug generator
  const handleGenerateSlug = () => {
    const randomChars = Math.random().toString(36).substring(2, 8);
    const prefix = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 15) : 'post';
    setSlug(`${prefix}-${randomChars}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!originalUrl.trim()) {
      setError('Original Adsterra SmartLink URL is required.');
      return;
    }

    try {
      new URL(originalUrl.trim());
    } catch {
      setError('Please provide a valid URL including http:// or https://');
      return;
    }

    if (!name.trim()) {
      setError('Please provide a descriptive name for this campaign link.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
          name: name.trim(),
          slug: slug.trim(),
          subId: subId.trim(),
          description: description.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create link');
      }

      setGeneratedLink(data.data);
      onLinkCreated(data.data);
      // Reset form fields
      setOriginalUrl('');
      setName('');
      setSlug('');
      setSubId('');
      setDescription('');
      setThumbnailUrl('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the link.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareLink = async (link: SmartLink) => {
    const shareUrl = `${window.location.origin}/r/${link.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.name,
          text: link.description || `Check out this link:`,
          url: shareUrl,
        });
      } catch {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>SmartLink Generator</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Generate an instant HTTP 302 tracking link pointing directly to your original Adsterra SmartLink.
        </p>
      </div>

      {/* Generated Result Highlight Card */}
      {generatedLink && (
        <div className="bg-gradient-to-b from-sky-950/40 to-slate-900 border border-sky-500/40 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-sky-500/20 mb-4">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Link Ready & Active</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              ID: {generatedLink.id}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Generated Shareable URL</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/r/${generatedLink.slug}`}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-sky-300 select-all"
                />
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/r/${generatedLink.slug}`)}
                  className="flex items-center justify-center gap-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition text-xs whitespace-nowrap shrink-0 active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Also show the root short link variant */}
            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
              <span>Root path alternative:</span>
              <code className="text-sky-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {window.location.origin}/{generatedLink.slug}
              </code>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={`${window.location.origin}/r/${generatedLink.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open & Test Redirect</span>
              </a>

              <button
                onClick={() => onOpenQR(`${window.location.origin}/r/${generatedLink.slug}`, generatedLink.name)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Mobile QR Code</span>
              </button>

              <button
                onClick={() => shareLink(generatedLink)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                onClick={() => onEditLink(generatedLink)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition ml-auto"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${generatedLink.name}?`)) {
                    onDeleteLink(generatedLink.id);
                    setGeneratedLink(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Generator Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-7 space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Original Adsterra SmartLink URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            1. Original Adsterra SmartLink URL <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="url"
              required
              placeholder="https://www.highcpmgate.com/..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 transition outline-none"
            />
            <Link2 className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-600 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            The target Adsterra SmartLink destination. Visitors will be sent here directly via HTTP 302.
          </p>
        </div>

        {/* 2. Link Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            2. Link Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. US Viral TikTok Campaign #1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 transition outline-none"
          />
        </div>

        {/* 3. Custom Slug & 4. Sub ID in 2 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Custom Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                3. Custom Slug
              </label>
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-generate</span>
              </button>
            </div>
            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 focus-within:border-sky-500 transition px-3">
              <span className="text-xs text-slate-500 font-mono select-none">/r/</span>
              <input
                type="text"
                placeholder="post1"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                className="w-full bg-transparent py-3 px-1 text-sm font-mono text-slate-100 placeholder-slate-600 outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Example: post1, crypto-offer, deals
            </p>
          </div>

          {/* Sub ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              4. Sub ID (Adsterra Tracking Token)
            </label>
            <input
              type="text"
              placeholder="e.g. fb_group_us or tg_channel_1"
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3.5 py-3 text-sm text-slate-100 placeholder-slate-600 transition outline-none font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Passed to Adsterra as <code className="text-sky-400">?subid=...</code> to identify traffic sources.
            </p>
          </div>
        </div>

        {/* 5. Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            5. Description / Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Campaign details, targeted geo tier, promotion channel..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition outline-none resize-none"
          />
        </div>

        {/* 6. Optional Thumbnail Image URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            6. Thumbnail Image URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://images.example.com/cover.jpg"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-sky-400 hover:bg-sky-300 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
            ) : (
              <>
                <Link2 className="w-4 h-4 stroke-[2.5]" />
                <span>Generate SmartLink</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
