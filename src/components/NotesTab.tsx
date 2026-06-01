import { useState, useMemo } from 'react';
import { useGame } from '../store';
import { Panel, Chip } from './common';
import type { UserNote } from '../types/game';

const CATEGORIES: UserNote['category'][] = ['일반', '분석', '시나리오', '일지', '연대기', '브리핑'];

const CAT_COLOR: Record<string, string> = {
  '일반':     'text-slate-300 border-slate-700 bg-slate-800',
  '분석':     'text-blue-300 border-blue-800 bg-blue-900/30',
  '시나리오': 'text-purple-300 border-purple-800 bg-purple-900/30',
  '일지':     'text-emerald-300 border-emerald-800 bg-emerald-900/30',
  '연대기':   'text-amber-300 border-amber-800 bg-amber-900/30',
  '브리핑':   'text-red-300 border-red-800 bg-red-900/30',
};

export default function NotesTab() {
  const notes = useGame(s => s.state!.notes);
  const countries = useGame(s => s.state!.countries);
  const addNote = useGame(s => s.addNote);
  const updateNote = useGame(s => s.updateNote);
  const deleteNote = useGame(s => s.deleteNote);
  const pinNote = useGame(s => s.pinNote);
  const today = useGame(s => s.state!.clock.currentDate);

  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState<UserNote['category'] | 'ALL'>('ALL');
  const [editing, setEditing] = useState<UserNote | null>(null);
  const [composing, setComposing] = useState(false);

  const filtered = useMemo(() => {
    let list = notes;
    if (catFilter !== 'ALL') list = list.filter(n => n.category === catFilter);
    if (filter) {
      const q = filter.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q)));
    }
    return [...list].sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [notes, filter, catFilter]);

  const tagsAll = useMemo(() => Array.from(new Set(notes.flatMap(n => n.tags))).sort(), [notes]);

  return (
    <>
      <Panel title={`노트 (${filtered.length}/${notes.length})`} right={
        <button onClick={() => setComposing(true)} className="text-[10px] bg-blue-700 hover:bg-blue-600 text-white px-2 py-0.5 rounded">
          ＋ 새 노트
        </button>
      }>
        <input className="input w-full text-xs mb-2" placeholder="제목·본문·태그 검색"
          value={filter} onChange={e => setFilter(e.target.value)} />
        <div className="flex gap-1 flex-wrap mb-2">
          <button onClick={() => setCatFilter('ALL')} className={`text-[10px] px-1.5 py-0.5 rounded ${catFilter === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'}`}>전체</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} className={`text-[10px] px-1.5 py-0.5 rounded ${catFilter === c ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'}`}>{c}</button>
          ))}
        </div>
        {tagsAll.length > 0 && (
          <div className="mb-2 text-[10px] text-slate-500">
            태그: {tagsAll.map(t => (
              <button key={t} onClick={() => setFilter(t)} className="text-blue-300 hover:text-blue-200 mr-1">#{t}</button>
            ))}
          </div>
        )}

        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <div className="text-[11px] text-slate-500 text-center py-4">
              아직 작성된 노트가 없습니다. <button onClick={() => setComposing(true)} className="text-blue-300 hover:text-blue-200">＋ 새 노트</button>를 만들어 보세요.
            </div>
          )}
          {filtered.map(n => (
            <div key={n.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
              <div className="flex items-start justify-between mb-1 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {n.pinned && <span className="text-amber-300 text-[10px]">📌</span>}
                    <Chip color={CAT_COLOR[n.category]}>{n.category}</Chip>
                    {n.tags.map(t => <Chip key={t}>#{t}</Chip>)}
                  </div>
                  <div className="text-sm font-semibold text-slate-100">{n.title || '(제목 없음)'}</div>
                  <div className="text-[10px] text-slate-500">
                    수정 {n.updatedAt.slice(0, 10)} · 작성 {n.createdAt.slice(0, 10)}
                    {n.relatedCountries.length > 0 && (
                      <span className="ml-2">관련: {n.relatedCountries.map(cid => countries.find(c => c.id === cid)?.flag).filter(Boolean).join(' ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => pinNote(n.id, !n.pinned)} title={n.pinned ? '고정 해제' : '고정'}
                    className="text-[10px] text-amber-300 hover:text-amber-200">{n.pinned ? '📌' : '📍'}</button>
                  <button onClick={() => setEditing(n)} className="text-[10px] text-blue-300 hover:text-blue-200">편집</button>
                  <button onClick={() => { if (confirm('이 노트를 삭제할까요?')) deleteNote(n.id); }} className="text-[10px] text-red-400 hover:text-red-300">×</button>
                </div>
              </div>
              {n.body && (
                <div className="text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-950/40 border border-slate-800 rounded p-1.5 mt-1">
                  {n.body.length > 240 ? n.body.slice(0, 240) + '…' : n.body}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="빠른 메모">
        <QuickNoteForm
          today={today}
          onSubmit={(title, body) => addNote({
            title, body,
            category: '일지', tags: [], relatedCountries: [], pinned: false,
          })}
        />
      </Panel>

      {composing && (
        <NoteEditor
          countries={countries}
          today={today}
          onClose={() => setComposing(false)}
          onSave={(data) => { addNote(data); setComposing(false); }}
        />
      )}
      {editing && (
        <NoteEditor
          countries={countries}
          today={today}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => { updateNote(editing.id, data); setEditing(null); }}
        />
      )}
    </>
  );
}

function QuickNoteForm({ today, onSubmit }: { today: string; onSubmit: (title: string, body: string) => void }) {
  const [text, setText] = useState('');
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    const lines = t.split('\n');
    const title = lines[0].slice(0, 80);
    const body = lines.length > 1 ? lines.slice(1).join('\n') : '';
    onSubmit(title, body);
    setText('');
  };
  return (
    <div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }}
        className="input w-full text-xs h-20 resize-none"
        placeholder={`${today} 오늘의 메모... (첫 줄=제목, ⌘/Ctrl+Enter 저장)`}
      />
      <button onClick={submit} disabled={!text.trim()} className="btn-primary w-full text-xs mt-1 disabled:opacity-40">+ 일지로 저장</button>
    </div>
  );
}

function NoteEditor({ initial, countries, today, onClose, onSave }: {
  initial?: UserNote;
  countries: { id: string; flag: string; name: string }[];
  today: string;
  onClose: () => void;
  onSave: (data: Omit<UserNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [category, setCategory] = useState<UserNote['category']>(initial?.category ?? '일반');
  const [tagsText, setTagsText] = useState(initial?.tags.join(', ') ?? '');
  const [related, setRelated] = useState<string[]>(initial?.relatedCountries ?? []);
  const [pinned, setPinned] = useState(!!initial?.pinned);
  const [countryFilter, setCountryFilter] = useState('');

  const submit = () => {
    if (!title.trim() && !body.trim()) return;
    onSave({
      title: title.trim() || `노트 ${today}`,
      body,
      category,
      tags: tagsText.split(',').map(s => s.trim()).filter(Boolean),
      relatedCountries: related,
      pinned,
    });
  };

  const filteredCountries = countries.filter(c =>
    !countryFilter || c.name.includes(countryFilter) || c.id.includes(countryFilter)).slice(0, 30);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-blue-700 rounded-lg max-w-2xl w-full max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-950 to-slate-900 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? '노트 편집' : '새 노트'}</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl leading-none">×</button>
        </div>
        <div className="p-4 space-y-3">
          <input className="input w-full text-sm font-semibold" placeholder="제목"
            value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          <div className="grid grid-cols-3 gap-2">
            <select className="input text-xs col-span-1" value={category} onChange={e => setCategory(e.target.value as any)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input text-xs col-span-2" placeholder="태그 (쉼표 구분: 미중관계, 한반도, 통상)"
              value={tagsText} onChange={e => setTagsText(e.target.value)} />
          </div>
          <textarea className="input w-full text-xs h-48 leading-relaxed font-mono"
            placeholder="자유 작성. 줄바꿈 유지됩니다. — 분석·시나리오·메모 등 무엇이든."
            value={body} onChange={e => setBody(e.target.value)} />

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">관련 국가 ({related.length}개 선택)</label>
            <input className="input w-full text-xs mb-1" placeholder="국가 검색"
              value={countryFilter} onChange={e => setCountryFilter(e.target.value)} />
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto bg-slate-950/40 border border-slate-800 rounded p-1">
              {filteredCountries.map(c => {
                const picked = related.includes(c.id);
                return (
                  <button key={c.id} onClick={() => {
                    setRelated(picked ? related.filter(x => x !== c.id) : [...related, c.id]);
                  }}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${picked ? 'bg-blue-700 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    {c.flag} {c.name}
                  </button>
                );
              })}
            </div>
            {related.length > 0 && (
              <div className="text-[10px] text-slate-400 mt-1">선택됨: {related.map(rid => countries.find(c => c.id === rid)?.name).join(', ')}</div>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
            <span>📌 상단 고정</span>
          </label>

          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button onClick={onClose} className="btn flex-1 text-sm">취소</button>
            <button onClick={submit} className="btn-primary flex-1 text-sm">{initial ? '저장' : '+ 작성'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
