import { useState } from 'react';
import { PARTIES } from '../data/parties';
import { createInitialState } from '../data/initialState';
import { useGame } from '../store';
import type { PartyId } from '../types/game';

export default function SetupScreen() {
  const init = useGame(s => s.init);
  const [name, setName] = useState('이정민');
  const [party, setParty] = useState<PartyId>('DPK');
  const [age, setAge] = useState(60);
  const [ideology, setIdeology] = useState(-30);
  const [bg, setBg] = useState('변호사 출신 5선 의원, 광역단체장 1회 역임. 민생경제와 정치개혁을 핵심 의제로 내세움.');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');

  const start = () => {
    const s = createInitialState({ presidentName: name, party, age, ideology, background: bg });
    s.settings.openaiApiKey = apiKey.trim();
    s.settings.model = model;
    init(s);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="max-w-3xl w-full panel space-y-5 p-6">
        <header className="text-center space-y-1 mb-2">
          <div className="text-xs tracking-[0.3em] text-rok-red">REPUBLIC OF KOREA</div>
          <h1 className="text-3xl font-bold">대한민국 대통령 시뮬레이터</h1>
          <p className="text-sm text-slate-400">2025년 6월 4일, 당신은 대한민국 제21대 대통령으로 취임합니다.</p>
        </header>

        <section className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">이름</label>
            <input className="input w-full" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">나이</label>
            <input type="number" min={35} max={90} className="input w-full" value={age} onChange={e => setAge(Number(e.target.value))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1">소속 정당</label>
            <div className="grid grid-cols-4 gap-2">
              {PARTIES.filter(p => p.id !== 'IND').map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setParty(p.id); setIdeology(p.ideology); }}
                  className={`px-2 py-2 rounded border text-xs transition-all ${party === p.id ? 'border-blue-400 bg-blue-900/40' : 'border-slate-700 bg-slate-800/60 hover:bg-slate-700'}`}
                  style={{ borderLeftColor: p.color, borderLeftWidth: 4 }}
                >
                  <div className="font-bold">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.seats}석 · 지지 {p.supportRate}%</div>
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1">정치 이념: <span className="font-mono">{ideology}</span> ({ideology < -30 ? '진보' : ideology > 30 ? '보수' : '중도'})</label>
            <input type="range" min={-100} max={100} value={ideology} onChange={e => setIdeology(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-slate-500"><span>극좌</span><span>중도</span><span>극우</span></div>
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1">약력</label>
            <textarea className="input w-full h-20" value={bg} onChange={e => setBg(e.target.value)} />
          </div>
        </section>

        <div className="border-t border-slate-800 pt-4 space-y-2">
          <h3 className="text-sm font-semibold">OpenAI API 설정</h3>
          <p className="text-[11px] text-slate-400">키는 브라우저 localStorage에만 저장되며 OpenAI 외부 어디에도 전송되지 않습니다.</p>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="password"
              placeholder="sk-..."
              className="input col-span-2"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
            <select className="input" value={model} onChange={e => setModel(e.target.value)}>
              <option value="gpt-4o-mini">gpt-4o-mini (저렴)</option>
              <option value="gpt-4o">gpt-4o (고품질)</option>
              <option value="gpt-4.1-mini">gpt-4.1-mini</option>
              <option value="gpt-4.1">gpt-4.1</option>
              <option value="o4-mini">o4-mini (추론)</option>
            </select>
          </div>
        </div>

        <button onClick={start} className="btn-primary w-full text-base py-3">
          취임 선서 — 게임 시작
        </button>
      </div>
    </div>
  );
}
