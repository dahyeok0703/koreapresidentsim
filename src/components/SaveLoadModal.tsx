import { useEffect, useState } from 'react';
import { listSaves, saveSlot, loadSlot, deleteSlot, type SaveSlot } from '../db/storage';
import { useGame } from '../store';
import { genId } from '../data/initialState';

export default function SaveLoadModal({ onClose }: { onClose: () => void }) {
  const state = useGame(s => s.state);
  const init = useGame(s => s.init);
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [name, setName] = useState('');

  const refresh = async () => setSlots(await listSaves());
  useEffect(() => { refresh(); }, []);

  const save = async () => {
    if (!state) return;
    const slot: SaveSlot = {
      id: genId('save'),
      name: name.trim() || `${state.president.name} - ${state.clock.currentDate}`,
      updatedAt: new Date().toISOString(),
      state,
    };
    await saveSlot(slot);
    setName('');
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full p-4 space-y-3 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">저장 / 불러오기</h2>
          <button onClick={onClose} className="text-slate-400 text-lg">×</button>
        </div>
        <div className="flex gap-1">
          <input className="input flex-1" placeholder="저장 슬롯 이름" value={name} onChange={e => setName(e.target.value)} />
          <button onClick={save} className="btn-primary">현재 상태 저장</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {slots.length === 0 && <div className="text-xs text-slate-500 text-center py-4">저장된 게임이 없습니다.</div>}
          {slots.map(s => (
            <div key={s.id} className="bg-slate-950/50 border border-slate-800 rounded p-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-[10px] text-slate-500">
                  {s.state.president.name} · {s.state.clock.currentDate} · 지지율 {s.state.approval.overall.toFixed(1)}% · 저장 {new Date(s.updatedAt).toLocaleString('ko-KR')}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => load(s.id)} className="btn-primary text-[10px] py-1 px-2">불러오기</button>
                <button onClick={() => del(s.id)} className="btn-danger text-[10px] py-1 px-2">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
