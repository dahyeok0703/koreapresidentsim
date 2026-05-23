import { useGame } from '../store';
import { Panel } from './common';

export default function AssemblyPanel() {
  const state = useGame(s => s.state)!;
  const { assembly, parties, president } = state;
  const total = assembly.totalSeats;
  return (
    <Panel title="국회 (제22대 · 300석)" right={<span className="text-[10px] text-slate-500">의장 {assembly.speaker.name} ({assembly.speaker.party})</span>}>
      {/* Seat bar */}
      <div className="flex h-3 rounded overflow-hidden border border-slate-700 mb-2">
        {parties.map(p => {
          const seats = assembly.bySeat[p.id] ?? 0;
          if (!seats) return null;
          return (
            <div
              key={p.id}
              style={{ width: `${(seats / total) * 100}%`, background: p.color }}
              title={`${p.name} ${seats}석`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {parties.map(p => {
          const seats = assembly.bySeat[p.id] ?? 0;
          if (!seats) return null;
          const isRuling = p.id === president.party;
          return (
            <div key={p.id} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded" style={{ background: p.color }} />
                <span className={isRuling ? 'font-bold text-white' : 'text-slate-300'}>{p.shortName}</span>
                {isRuling && <span className="text-[9px] text-blue-300">[여당]</span>}
              </span>
              <span className="font-mono text-slate-400">{seats}석 ({Math.round(seats / total * 100)}%)</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-xs">
        <div>
          <div className="text-[10px] text-slate-500">여당</div>
          <div className="font-mono text-blue-300">{assembly.rulingCoalitionSeats}석</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500">의결정족수</div>
          <div className="font-mono">151</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500">야권</div>
          <div className="font-mono text-red-300">{assembly.oppositionSeats}석</div>
        </div>
      </div>
      {assembly.rulingCoalitionSeats < 151 && (
        <div className="mt-2 text-[10px] text-orange-400 bg-orange-950/30 border border-orange-900 rounded px-2 py-1">
          ⚠ 여소야대 상황 — 정부 법안 통과에 야당 협조 필수
        </div>
      )}
    </Panel>
  );
}
