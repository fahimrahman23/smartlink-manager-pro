import { card } from './linkutil';
const steps = [
  ['Create a link', 'Go to Create, paste your Adsterra Smartlink, and give it a name. The app gives you a short link.'],
  ['Add a Sub ID', 'A Sub ID such as fb_post1 is added to your Smartlink. Use it to see in Adsterra which post sent the click.'],
  ['Share it', 'Copy the short link and share it anywhere. Add your own image and text next to it.'],
  ['Check clicks', 'Open Stats on a link to see clicks, devices and where visitors came from.'],
  ['Keep a backup', 'Download a backup from the Backup tab now and then.'],
];
export function GuideView() {
  return (
    <div className="space-y-3 max-w-xl">
      {steps.map(([t, d]) => (<div key={t} className={card}><b className="text-sm">{t}</b><p className="text-xs text-slate-400 mt-1">{d}</p></div>))}
      <div className={`${card} text-xs text-slate-400`}>Visitors who open a short link are sent to your Smartlink. Keep your previews and text honest so platforms do not block your links.</div>
    </div>
  );
}
