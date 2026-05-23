import { useGame } from '../store';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const settings = useGame(s => s.state!.settings);
  const setSettings = useGame(s => s.setSettings);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-4 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">설정</h2>
          <button onClick={onClose} className="text-slate-400 text-lg">×</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">OpenAI API 키 (localStorage 저장)</label>
            <input
              type="password"
              className="input w-full"
              placeholder="sk-..."
              value={settings.openaiApiKey}
              onChange={e => setSettings({ openaiApiKey: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">모델</label>
            <select
              className="input w-full"
              value={settings.model}
              onChange={e => setSettings({ model: e.target.value })}
            >
              <option value="gpt-4o-mini">gpt-4o-mini (저렴/빠름)</option>
              <option value="gpt-4o">gpt-4o (균형)</option>
              <option value="gpt-4.1-mini">gpt-4.1-mini</option>
              <option value="gpt-4.1">gpt-4.1 (고품질)</option>
              <option value="o4-mini">o4-mini (추론)</option>
              <option value="o3-mini">o3-mini</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">난이도</label>
            <select className="input w-full" value={settings.difficulty} onChange={e => setSettings({ difficulty: e.target.value as any })}>
              <option value="EASY">쉬움</option>
              <option value="NORMAL">보통</option>
              <option value="HARD">어려움</option>
              <option value="NIGHTMARE">악몽</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">현실성</label>
            <select className="input w-full" value={settings.realismLevel} onChange={e => setSettings({ realismLevel: e.target.value as any })}>
              <option value="ARCADE">아케이드 (과장된 효과)</option>
              <option value="BALANCED">균형</option>
              <option value="REALISTIC">사실적 (보수적 효과)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">턴 진행 시 자동 이벤트</label>
            <input
              type="checkbox"
              checked={settings.autoEvents}
              onChange={e => setSettings({ autoEvents: e.target.checked })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">턴당 이벤트 수: {settings.eventsPerTurn}</label>
            <input
              type="range" min={1} max={5}
              value={settings.eventsPerTurn}
              onChange={e => setSettings({ eventsPerTurn: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
        <button onClick={onClose} className="btn-primary w-full">닫기</button>
      </div>
    </div>
  );
}
