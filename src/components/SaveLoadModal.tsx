import { useEffect, useState, useRef } from 'react';
import { listSaves, saveSlot, loadSlot, deleteSlot, type SaveSlot } from '../db/storage';
import { useGame } from '../store';
import { genId } from '../data/initialState';

export default function SaveLoadModal({ onClose }: { onClose: () => void }) {
  const state = useGame(s => s.state);
  const user = useGame(s => s.user);
  const init = useGame(s => s.init);
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [name, setName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = async () => setSlots(await listSaves());
  useEffect(() => { refresh(); }, []);

  const save = async () => {
    if (!state) return;
    const slot: SaveSlot = {
      id: genId('save'),
      name: name.trim() || `${state.president.name} - ${state.clock.currentDate}${user ? ` · ${user.name}` : ''}`,
      updatedAt: new Date().toISOString(),
      state,
    };
    await saveSlot(slot);
    setName('');
    setMsg(`✓ 저장 완료: ${slot.name}`);
    setTimeout(() => setMsg(null), 3000);
    refresh();
  };

  const load = async (id: string) => {
    const s = await loadSlot(id);
    if (s) { init(s.state); onClose(); }
  };

  const del = async (id: string) => {
    if (!confirm('이 저장 슬롯을 삭제하시겠습니까?')) return;
    await deleteSlot(id);
    refresh();
  };

  // === JSON 내보내기 ===
  const exportSlot = (s: SaveSlot) => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kps-save-${s.state.president.name}-${s.state.clock.currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCurrent = () => {
    if (!state) return;
    const slot: SaveSlot = {
      id: genId('save'),
      name: `${state.president.name} - ${state.clock.currentDate}`,
      updatedAt: new Date().toISOString(),
      state,
    };
    exportSlot(slot);
    setMsg('✓ 현재 게임을 JSON 파일로 내보냈습니다.');
    setTimeout(() => setMsg(null), 3000);
  };

  // === JSON 가져오기 ===
  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // 슬롯 형식인지 게임 상태인지 자동 판별
      const slot: SaveSlot = data.state
        ? { ...data, id: genId('save'), updatedAt: new Date().toISOString() }
        : { id: genId('save'), name: `가져온 게임 - ${new Date().toLocaleString('ko-KR')}`, updatedAt: new Date().toISOString(), state: data };
      if (!slot.state?.president || !slot.state?.clock) {
        throw new Error('유효한 게임 저장 파일이 아닙니다.');
      }
      await saveSlot(slot);
      setMsg(`✓ 가져오기 완료: ${slot.name}`);
      setTimeout(() => setMsg(null), 3000);
      refresh();
    } catch (e: any) {
      alert(`파일 가져오기 실패: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full p-4 space-y-3 max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">💾 저장 / 불러오기</h2>
          <button onClick={onClose} className="text-slate-400 text-lg">×</button>
        </div>

        {user && (
          <div className="bg-emerald-950/30 border border-emerald-800 rounded p-2 flex items-center gap-2 text-xs">
            {user.picture && <img src={user.picture} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />}
            <span className="text-emerald-300">로그인됨: <b>{user.name}</b> · 저장 슬롯에 이름 포함</span>
          </div>
        )}

        <div className="flex gap-1">
          <input className="input flex-1" placeholder="저장 슬롯 이름 (비워두면 자동)" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={save} className="btn-primary text-sm">💾 현재 저장</button>
        </div>

        <div className="grid grid-cols-2 gap-1">
          <button onClick={exportCurrent} className="btn text-xs">📦 현재 게임 JSON 내보내기</button>
          <button onClick={() => fileInputRef.current?.click()} className="btn text-xs">📥 JSON 파일 불러오기</button>
          <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = '';
            }} />
        </div>

        {msg && (
          <div className="text-[11px] text-emerald-300 bg-emerald-950/30 border border-emerald-800 rounded px-2 py-1">{msg}</div>
        )}

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {slots.length === 0 && <div className="text-xs text-slate-500 text-center py-4">저장된 게임이 없습니다.</div>}
          {slots.map(s => (
            <div key={s.id} className="bg-slate-950/50 border border-slate-800 rounded p-2 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{s.name}</div>
                <div className="text-[10px] text-slate-500">
                  {s.state.president.name} · 제{s.state.president.termNumber}대 · {s.state.clock.currentDate}
                  <span className="mx-1">·</span>
                  지지율 <span className="text-emerald-300 font-mono">{s.state.approval.overall.toFixed(1)}%</span>
                  <span className="mx-1">·</span>
                  <span className="text-slate-500">{new Date(s.updatedAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => load(s.id)} className="btn-primary text-[10px] py-1 px-2">▶ 불러오기</button>
                <button onClick={() => exportSlot(s)} className="btn text-[10px] py-1 px-2" title="JSON 내보내기">📦</button>
                <button onClick={() => del(s.id)} className="btn-danger text-[10px] py-1 px-2">×</button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-slate-500 bg-slate-950/40 border border-slate-800 rounded p-2 leading-relaxed">
          <b className="text-slate-300">💡 영구 저장 안내</b>
          <br />· 모든 저장은 브라우저 <b>IndexedDB</b>에 영구 보존 — 새로고침·종료·재실행 후에도 유지.
          <br />· 현재 게임은 추가로 <b>localStorage</b>에 자동 저장 — 시작 화면에서 "이어하기" 가능.
          <br />· 다른 기기·브라우저로 옮기려면 <b className="text-amber-300">📦 JSON 내보내기</b> → 다른 곳에서 <b className="text-amber-300">📥 가져오기</b>.
          <br />· Google 로그인은 슬롯에 사용자 이름 표시용 (실제 저장은 로그인 무관).
        </div>
      </div>
    </div>
  );
}
