import { useGame } from '../store';
import { categoryLabel, severityColor } from '../utils/format';

export default function EventChoiceModal() {
  const id = useGame(s => s.selectedEventId);
  const events = useGame(s => s.state?.events ?? []);
  const pick = useGame(s => s.pickEventChoice);
  const close = useGame(s => s.selectEvent);
  const busy = useGame(s => s.busy);

  const ev = events.find(e => e.id === id);
  if (!ev) return null;

  const renderEffectsHint = (eff: any) => {
    const items: string[] = [];
    if (eff?.approval !== undefined) items.push(`지지율 ${eff.approval > 0 ? '+' : ''}${eff.approval}`);
    if (eff?.economy?.kospi !== undefined) items.push(`코스피 ${eff.economy.kospi > 0 ? '+' : ''}${eff.economy.kospi}`);
    if (eff?.security?.northKoreaTension !== undefined) items.push(`北긴장 ${eff.security.northKoreaTension > 0 ? '+' : ''}${eff.security.northKoreaTension}`);
    if (eff?.foreign) {
      for (const [k, v] of Object.entries(eff.foreign)) {
        const rel = (v as any).relation;
        if (rel !== undefined) items.push(`${k} 관계 ${rel > 0 ? '+' : ''}${rel}`);
      }
    }
    return items.slice(0, 4).join(' · ');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className={`p-3 border-b border-slate-800 ${severityColor(ev.severity)}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex gap-1 text-[10px]">
              <span className="chip">{categoryLabel(ev.category)}</span>
              <span className="chip">{ev.severity}</span>
              <span className="text-slate-400">{ev.date} · {ev.source}</span>
            </div>
            <button onClick={() => close(null)} className="text-slate-400 hover:text-white text-lg leading-none">×</button>
          </div>
          <h2 className="text-lg font-bold text-slate-100">{ev.headline}</h2>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">{ev.body}</p>
        </div>
        <div className="p-3 space-y-2">
          <div className="text-[11px] text-slate-400 mb-1">대통령의 대응을 선택하세요:</div>
          {ev.choices?.map(c => (
            <button
              key={c.id}
              disabled={!!busy}
              onClick={() => pick(ev.id, c.id)}
              className="w-full text-left p-3 rounded border border-slate-700 bg-slate-800/60 hover:bg-slate-700 hover:border-blue-500 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-100">{c.label}</span>
                <span className={`text-[10px] ${c.ideology < -20 ? 'text-blue-300' : c.ideology > 20 ? 'text-red-300' : 'text-slate-400'}`}>
                  {c.ideology < -20 ? '진보' : c.ideology > 20 ? '보수' : '중도'} 성향
                </span>
              </div>
              <div className="text-xs text-slate-300">{c.description}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">예상: {renderEffectsHint(c.expectedEffects)}</div>
            </button>
          ))}
          {busy && <div className="text-xs text-blue-300 text-center mt-2">{busy}</div>}
        </div>
      </div>
    </div>
  );
}
