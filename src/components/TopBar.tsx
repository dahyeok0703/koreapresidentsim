import { useGame } from '../store';
import { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, PlayCircle, FastForward, Undo2 } from 'lucide-react';
import SettingsModal from './SettingsModal';
import SaveLoadModal from './SaveLoadModal';

export default function TopBar() {
  const state = useGame(s => s.state)!;
  const nextTurn = useGame(s => s.nextTurn);
  const busy = useGame(s => s.busy);
  const reset = useGame(s => s.reset);
  const undo = useGame(s => s.undo);
  const undoStackLen = useGame(s => s.undoStack.length);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaves, setShowSaves] = useState(false);

  const party = state.parties.find(p => p.id === state.president.party);
  const yearsDone = (state.clock.daysInOffice / 365).toFixed(2);
  const mode = state.flags.gameMode as string | undefined;
  const isWar = mode === 'WAR';
  const isOp = mode === 'OPERATION';
  const isSpecial = isWar || isOp;

  return (
    <>
    {isSpecial && (
      <div className={`px-4 py-1.5 text-center text-xs font-semibold border-y ${
        isWar ? 'bg-red-950 border-red-700 text-red-200' : 'bg-orange-950 border-orange-700 text-orange-200'
      }`}>
        {isWar ? '⚔️ 전쟁 상태' : '💥 군사작전 상태'} —
        {isWar
          ? ` ${state.flags.warName ?? ''} — 하루 단위 진행만 가능 · 매일 작전 보고 발행 · 경제·전력 자동 감모`
          : ` ${state.flags.opName ?? ''} — 30일 자동 종료 · 하루 단위 진행만 가능`}
      </div>
    )}
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
        <button onClick={() => nextTurn(1)} disabled={!!busy}
          className={`btn flex items-center gap-1 text-xs disabled:opacity-50 ${isSpecial ? 'bg-red-800 hover:bg-red-700 text-white border-red-900' : ''}`}>
          <PlayCircle size={14} /> 1일{isSpecial ? ' (특수모드)' : ''}
        </button>
        <button onClick={() => nextTurn(7)} disabled={!!busy || isSpecial}
          className="btn-primary flex items-center gap-1 text-xs disabled:opacity-30"
          title={isSpecial ? '전쟁·작전 모드에서는 하루씩만 진행 가능' : ''}>
          <PlayCircle size={14} /> 1주 진행
        </button>
        <button onClick={() => nextTurn(30)} disabled={!!busy || isSpecial}
          className="btn flex items-center gap-1 text-xs disabled:opacity-30">
          <FastForward size={14} /> 1개월
        </button>
        <div className="w-px h-5 bg-slate-700 mx-1" />
        <button onClick={undo} disabled={undoStackLen === 0 || !!busy}
          className="btn flex items-center gap-1 text-xs disabled:opacity-30"
          title={`${undoStackLen}회 되돌리기 가능`}>
          <Undo2 size={14} /> 되돌리기 {undoStackLen > 0 && <span className="text-[10px] text-amber-300">({undoStackLen})</span>}
        </button>
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
    </>
  );
}
