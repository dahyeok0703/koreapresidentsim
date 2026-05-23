import { useGame } from '../store';

export default function NewsTicker() {
  const news = useGame(s => s.state!.newsTicker);
  return (
    <div className="bg-black border-y border-rok-red/40 overflow-hidden h-8 flex items-center">
      <div className="px-3 text-xs font-bold text-rok-red border-r border-slate-800 h-full flex items-center">
        📺 속보
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="flex gap-8 whitespace-nowrap animate-marquee">
          {[...news, ...news].map((n, i) => (
            <span key={i} className="text-xs text-slate-200">▶ {n}</span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 90s linear infinite; }
      `}</style>
    </div>
  );
}
