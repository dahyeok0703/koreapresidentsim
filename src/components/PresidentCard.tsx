import { useGame } from '../store';
import { Panel } from './common';

export default function PresidentCard() {
  const p = useGame(s => s.state!.president);
  const parties = useGame(s => s.state!.parties);
  const party = parties.find(x => x.id === p.party);
  return (
    <Panel title="대통령">
      <div className="flex items-start gap-3">
        <div className="w-16 h-20 rounded bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-2xl font-bold text-slate-300">
          {p.name[0]}
        </div>
        <div className="flex-1">
          <div className="text-base font-bold">{p.name} <span className="text-[10px] text-slate-400">{p.nameHanja ?? ''}</span></div>
          <div className="text-[10px] text-slate-500">{p.nameEng}</div>
          <div className="text-xs mt-0.5">
            <span style={{ color: party?.color }} className="font-semibold">{party?.name}</span>
            <span className="text-slate-500"> · 제{p.termNumber}대 대통령</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 italic">"{p.slogan}"</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2 text-[11px]">
        <KV k="나이/성별" v={`${p.age}세 / ${p.gender === 'M' ? '남' : '여'}`} />
        <KV k="이념" v={`${p.ideology > 0 ? '+' : ''}${p.ideology} (${p.ideology < -30 ? '진보' : p.ideology > 30 ? '보수' : '중도'})`} />
        <KV k="신장/체중" v={`${p.height}cm / ${p.weight}kg`} />
        <KV k="혈액형/MBTI" v={`${p.bloodType} / ${p.mbti ?? '-'}`} />
        <KV k="출생지" v={p.birthplace} />
        <KV k="종교" v={p.religion} />
        <KV k="건강" v={p.healthStatus} />
        <KV k="자산" v={`${p.assets}억원`} />
      </div>
      <details className="mt-1">
        <summary className="text-[10px] text-slate-400 cursor-pointer">학력 / 경력 / 가족 ▾</summary>
        <div className="text-[11px] space-y-1 mt-1">
          <div>
            <div className="text-[10px] text-slate-500">학력</div>
            <ul className="space-y-0.5">
              {p.education.map((e, i) => <li key={i}>· {e.school} {e.major && `(${e.major})`} {e.level}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">주요 경력</div>
            <ul className="space-y-0.5">
              {p.career.map((c, i) => <li key={i}>· [{c.period}] {c.position}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">가족</div>
            <ul className="space-y-0.5">
              {p.family.spouse && <li>· 배우자: {p.family.spouse} ({p.family.spouseJob ?? '-'})</li>}
              {p.family.children.map((c, i) => <li key={i}>· 자녀: {c.name} ({c.age}세{c.job ? `, ${c.job}` : ''})</li>)}
            </ul>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">취미 / 언어</div>
            <div>· 취미: {p.hobby.join(', ')}</div>
            <div>· 언어: {p.languages.join(', ')}</div>
          </div>
        </div>
      </details>
    </Panel>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{k}</span>
      <span className="text-slate-200 font-mono">{v}</span>
    </div>
  );
}
