import { copy, ghost } from './util';
export function QRModal({ url, title, isOpen, onClose }: { url: string | null; title: string | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !url) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-[#0d1220] border border-slate-800 rounded-xl p-4 w-full max-w-xs text-center space-y-3" onClick={(e) => e.stopPropagation()}>
        <b className="text-sm">{title}</b>
        <img className="mx-auto bg-white p-2 rounded-lg" width={220} height={220} alt="QR code" src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`} />
        <div className="text-xs text-sky-300 break-all">{url}</div>
        <div className="flex gap-2 justify-center"><button className={ghost} onClick={() => copy(url)}>Copy link</button><button className={ghost} onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
