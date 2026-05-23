import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store';
import clsx from 'clsx';

export default function ChatPanel() {
  const state = useGame(s => s.state)!;
  const sendChat = useGame(s => s.sendChat);
  const issueDecision = useGame(s => s.issueDecision);
  const busy = useGame(s => s.busy);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'CHAT' | 'DECISION'>('CHAT');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chat.length, busy]);

  const submit = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setText('');
    if (mode === 'DECISION') {
      await issueDecision(t);
    } else {
      await sendChat(t);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-lg">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-slate-400">집무실 대화</div>
        <div className="flex gap-1 text-[10px]">
          <button
            onClick={() => setMode('CHAT')}
            className={clsx('px-2 py-0.5 rounded', mode === 'CHAT' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400')}
          >대화 (질문/협의)</button>
          <button
            onClick={() => setMode('DECISION')}
            className={clsx('px-2 py-0.5 rounded', mode === 'DECISION' ? 'bg-rok-red text-white' : 'bg-slate-800 text-slate-400')}
          >결정 (효과 반영)</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {state.chat.map(m => {
          const isUser = m.role === 'user';
          const isSystem = m.role === 'system';
          return (
            <div key={m.id} className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
              <div className={clsx(
                'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                isUser ? 'bg-rok-blue text-white' :
                isSystem ? 'bg-yellow-950/40 border border-yellow-800 text-yellow-200 text-xs' :
                'bg-slate-800 text-slate-100 border border-slate-700'
              )}>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[10px] font-semibold opacity-80">{m.speaker ?? m.role}</span>
                  <span className="text-[9px] opacity-50">{m.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300">
              <span className="inline-block animate-pulse">● ● ●</span> {busy}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-800 p-2">
        <div className="flex gap-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
            }}
            placeholder={mode === 'DECISION'
              ? '대통령 지시 / 결정을 입력 (예: 전국민 25만원 민생지원금 지급)'
              : '비서실장에게 질문/지시 (예: 한일 정상회담 추진 방안?)'}
            className="input flex-1 resize-none h-16 text-sm"
            disabled={!!busy}
          />
          <button
            onClick={submit}
            disabled={!!busy || !text.trim()}
            className={clsx(
              'px-4 self-stretch rounded font-semibold text-sm',
              mode === 'DECISION' ? 'bg-rok-red hover:bg-red-700' : 'bg-rok-blue hover:bg-blue-700',
              'text-white disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            전송
          </button>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">⌘/Ctrl+Enter 전송 · 결정 모드는 지표에 즉시 반영됩니다</div>
      </div>
    </div>
  );
}
