import { useGame } from '../store';
import { Panel } from './common';
import { randomKoreanName, genId } from '../data/initialState';
import { useState } from 'react';

export default function CabinetPanel() {
  const state = useGame(s => s.state)!;
  const patch = useGame(s => s.patch);
  const [filter, setFilter] = useState('');
  const cab = state.cabinet.filter(o =>
    o.name.includes(filter) || o.ministryName.includes(filter));

  const replace = (id: string) => {
    patch(s => ({
      ...s,
      cabinet: s.cabinet.map(o => o.id === id ? {
        ...o,
        id: genId('off'),
        name: randomKoreanName(),
        loyalty: 60 + Math.floor(Math.random() * 35),
        competence: 50 + Math.floor(Math.random() * 45),
        publicFavor: 35 + Math.floor(Math.random() * 35),
        scandalRisk: Math.floor(Math.random() * 20),
        appointedAt: s.clock.currentDate,
      } : o),
    }));
  };

  return (
    <Panel title={`내각 / 주요 인사 (${state.cabinet.length}명)`} right={
      <input className="input text-[10px] py-0.5 px-1.5 w-20" placeholder="검색" value={filter} onChange={e => setFilter(e.target.value)} />
    }>
      <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
        {cab.map(o => (
          <div key={o.id} className="bg-slate-950/40 border border-slate-800 rounded px-2 py-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">{o.name}</div>
                <div className="text-[10px] text-slate-500">{o.ministryName}</div>
              </div>
              <button onClick={() => replace(o.id)} className="text-[10px] text-orange-400 hover:text-orange-300">교체</button>
            </div>
            <div className="grid grid-cols-4 gap-1 mt-1 text-[10px]">
              <div><span className="text-slate-500">충성</span> <span className="font-mono">{o.loyalty}</span></div>
              <div><span className="text-slate-500">능력</span> <span className="font-mono">{o.competence}</span></div>
              <div><span className="text-slate-500">여론</span> <span className="font-mono">{o.publicFavor}</span></div>
              <div className={o.scandalRisk > 50 ? 'text-red-400' : 'text-slate-500'}>
                <span>리스크</span> <span className="font-mono">{o.scandalRisk}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
