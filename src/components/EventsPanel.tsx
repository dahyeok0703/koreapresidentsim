import { useGame } from '../store';
import { Panel, Chip } from './common';
import { severityColor, categoryLabel } from '../utils/format';
import { useState } from 'react';

export default function EventsPanel() {
  const events = useGame(s => s.state!.events);
  const select = useGame(s => s.selectEvent);
  const dismiss = useGame(s => s.dismissEvent);
  const [tab, setTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const list = tab === 'PENDING' ? events.filter(e => !e.resolved) : events;

  return (
    <Panel
      title={`이벤트 / 사건 (${events.filter(e => !e.resolved).length}건 대기)`}
      right={
        <div className="flex gap-1">
          <button onClick={() => setTab('PENDING')} className={`text-[10px] px-1.5 py-0.5 rounded ${tab === 'PENDING' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>대기</button>
          <button onClick={() => setTab('ALL')} className={`text-[10px] px-1.5 py-0.5 rounded ${tab === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>전체</button>
        </div>
      }
    >
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {list.length === 0 && <div className="text-xs text-slate-500 text-center py-3">표시할 이벤트가 없습니다.</div>}
        {list.map(ev => (
          <div key={ev.id} className={`border rounded p-2 ${severityColor(ev.severity)}`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1 text-[10px]">
                <Chip>{categoryLabel(ev.category)}</Chip>
                <Chip>{ev.severity}</Chip>
                <span className="text-slate-400">{ev.date}</span>
              </div>
              <span className="text-[10px] text-slate-400">{ev.source}</span>
            </div>
            <div className="text-xs font-semibold text-slate-100">{ev.headline}</div>
            <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{ev.body}</div>
            {ev.choices && !ev.resolved && (
              <div className="mt-2 flex gap-1 flex-wrap">
                <button onClick={() => select(ev.id)} className="btn-primary text-[10px] py-1 px-2">
                  대응 결정 ({ev.choices.length}개 선택지)
                </button>
                <button onClick={() => dismiss(ev.id)} className="btn text-[10px] py-1 px-2">무시</button>
              </div>
            )}
            {ev.resolution && (
              <div className="text-[10px] text-emerald-400 mt-1">✓ 대응: {ev.resolution}</div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
