import { useGame } from '../store';
import { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, PlayCircle, FastForward } from 'lucide-react';
import SettingsModal from './SettingsModal';
import SaveLoadModal from './SaveLoadModal';

export default function TopBar() {
  const state = useGame(s => s.state)!;
  const nextTurn = useGame(s => s.nextTurn);
  const busy = useGame(s => s.busy);
  const reset = useGame(s => s.reset);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaves, setShowSaves] = useState(false);

  const party = state.parties.find(p => p.id === state.president.party);
  const yearsDone = (state.clock.daysInOffice / 365).toFixed(2);

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="text-xs">
          <span className="text-rok-red font-bold tracking-widest">🇰🇷 REPUBLIC OF KOREA</span>
          <span className="text-slate-500 mx-2">|</span>
          <span className="text-slate-300">대통령 시뮬레이터</span>
        </div>
        <div className="border-l border-slate-700 pl-3">
          <div className="text-sm font-bold">{state.president.name} 대통령</div>
          <div className="text-[10px] text-slate-400">
            <span style={{ color: party?.color }}>{party?.name}</span>
            <span className="mx-1">·</span>
            <span>{state.clock.currentDate}</span>
            <span className="mx-1">·</span>
            <span>취임 {state.clock.daysInOffice}일차 ({yearsDone}년)</span>
            <span className="mx-1">·</span>
            <span>{state.clock.turnNumber}턴</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => nextTurn(1)} disabled={!!busy} className="btn flex items-center gap-1 text-xs disabled:opacity-50">
          <PlayCircle size={14} /> 1일
        </button>
        <button onClick={() => nextTurn(7)} disabled={!!busy} className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50">
          <PlayCircle size={14} /> 1주 진행
        </button>
        <button onClick={() => nextTurn(30)} disabled={!!busy} className="btn flex items-center gap-1 text-xs disabled:opacity-50">
          <FastForward size={14} /> 1개월
        </button>
        <div className="w-px h-5 bg-slate-700 mx-1" />
        <button onClick={() => setShowSaves(true)} className="btn flex items-center gap-1 text-xs">
          <Save size={14} /> 저장/불러오기
        </button>
        <button onClick={() => setShowSettings(true)} className="btn flex items-center gap-1 text-xs">
          <SettingsIcon size={14} /> 설정
        </button>
        <button onClick={() => { if (confirm('현재 게임을 초기화하고 새로 시작하시겠습니까?')) reset(); }} className="btn text-xs">
          <RotateCcw size={14} />
        </button>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showSaves && <SaveLoadModal onClose={() => setShowSaves(false)} />}
    </div>
  );
}
