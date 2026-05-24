import { useState, useEffect, useRef } from 'react';
import { useGame } from '../store';

export default function EncounterModal() {
  const enc = useGame(s => s.encounter);
  const state = useGame(s => s.state);
  const sendMessage = useGame(s => s.sendEncounterMessage);
  const closeEncounter = useGame(s => s.closeEncounter);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [enc?.messages.length, enc?.busy]);

  if (!enc || !state) return null;
  const country = state.countries.find(c => c.id === enc.countryId);
  if (!country) return null;

  const typeLabel = enc.type === 'CALL' ? '정상 통화' :
                    enc.type === 'SUMMIT' ? '정상 회담' :
                    enc.type === 'EMERGENCY' ? '긴급 핫라인' : '다자 정상회의';
  const typeIcon = enc.type === 'CALL' ? '📞' :
                    enc.type === 'SUMMIT' ? '🤝' :
                    enc.type === 'EMERGENCY' ? '🚨' : '🏛️';

  const submit = async () => {
    const t = text.trim();
    if (!t || enc.busy) return;
    setText('');
    await sendMessage(t);
  };

  const pCount = enc.messages.filter(m => m.role === 'PRESIDENT').length;
  const fCount = enc.messages.filter(m => m.role === 'FOREIGN').length;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border-2 border-blue-700 rounded-lg max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-700 bg-gradient-to-r from-blue-950 to-slate-900 px-4 py-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{typeIcon}</div>
              <div>
                <div className="text-[10px] text-blue-300 tracking-widest">{typeLabel.toUpperCase()} · LIVE</div>
                <h2 className="text-lg font-bold text-white">
                  {country.flag} {country.name} — {country.leader} <span className="text-xs text-slate-400">({country.leaderTitle})</span>
                </h2>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  관계 <span className={country.relation >= 0 ? 'text-emerald-300' : 'text-red-300'}>{country.relation > 0 ? '+' : ''}{country.relation}</span>
                  <span className="mx-1">·</span>
                  신뢰 {country.trustLevel}
                  <span className="mx-1">·</span>
                  동맹지위 {({ALLY:'동맹', PARTNER:'파트너', NEUTRAL:'중립', RIVAL:'경쟁', HOSTILE:'적대'} as any)[country.alliance]}
                  <span className="mx-1">·</span>
                  발언 {pCount} ↔ {fCount}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => closeEncounter(true)} disabled={!!enc.busy || pCount === 0}
                className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40">
                ✅ 종료 + 결과 반영
              </button>
              <button onClick={() => closeEncounter(false)} disabled={!!enc.busy}
                className="btn-danger text-xs px-3 py-1.5 disabled:opacity-40">
                ❌ 결과 없이 종료
              </button>
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
          {enc.messages.map(m => {
            if (m.role === 'SYSTEM') {
              return (
                <div key={m.id} className="text-center">
                  <span className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800 rounded px-3 py-1">
                    {m.content}
                  </span>
                </div>
              );
            }
            const isPres = m.role === 'PRESIDENT';
            return (
              <div key={m.id} className={`flex ${isPres ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-lg px-3 py-2 text-sm ${
                  isPres ? 'bg-rok-blue text-white' : 'bg-slate-800 text-slate-100 border border-slate-700'
                }`}>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold opacity-80">{m.speaker}</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                </div>
              </div>
            );
          })}
          {enc.busy && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300">
                <span className="inline-block animate-pulse">● ● ●</span> {enc.busy}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-700 p-3 bg-slate-900">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
              }}
              placeholder={`${country.leader} ${country.leaderTitle}께 발언 (예: "관세 인하를 요청합니다", "북핵 공조를 강화해야 합니다")`}
              className="input flex-1 resize-none h-16 text-sm"
              disabled={!!enc.busy}
              autoFocus
            />
            <button onClick={submit} disabled={!!enc.busy || !text.trim()}
              className="btn-primary px-5 self-stretch text-sm disabled:opacity-40">
              발언
            </button>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>⌘/Ctrl+Enter 전송 · 대화는 외국 정상과 실시간으로 진행됩니다</span>
            <span className="text-emerald-300">최종 종료 시 AI가 합의·효과·언론·SNS·국제 반응 모두 자동 산출</span>
          </div>
        </div>
      </div>
    </div>
  );
}
