import { useGame } from '../store';
import { Panel } from './common';

export default function DiplomacyPanel() {
  const foreign = useGame(s => s.state!.foreign);
  const color = (r: number) =>
    r >= 50 ? 'bg-emerald-500' : r >= 0 ? 'bg-lime-500' : r >= -40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <Panel title="외교 관계">
      <div className="space-y-1.5">
        {foreign.map(f => (
          <div key={f.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-sm font-semibold">{f.name}</span>
                <span className="text-[10px] text-slate-500 ml-2">{f.leader}</span>
              </div>
              <span className={`font-mono text-xs ${f.relation >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                {f.relation > 0 ? '+' : ''}{f.relation}
              </span>
            </div>
            <div className="bar-bg h-1 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
              <div
                className={`bar-fill ${color(f.relation)}`}
                style={{
                  width: `${Math.abs(f.relation) / 2}%`,
                  marginLeft: f.relation >= 0 ? '50%' : `${50 - Math.abs(f.relation) / 2}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>신뢰 {f.trustLevel}</span>
              <span>교역 {f.tradeVolume}억$</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
