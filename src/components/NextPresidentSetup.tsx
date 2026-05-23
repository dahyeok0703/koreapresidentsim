import { useState } from 'react';
import { useGame } from '../store';
import { PARTIES } from '../data/parties';
import type { PresidentProfile, PartyId, EducationEntry, CareerEntry } from '../types/game';

// 차기 대통령 캐릭터 생성. SetupScreen과 유사하나 임기·취임일은 자동 계산.
export default function NextPresidentSetup({ onClose }: { onClose: () => void }) {
  const prev = useGame(s => s.state!);
  const beginNewTerm = useGame(s => s.beginNewTerm);
  const nextTermNumber = (prev.president.termNumber ?? 21) + 1;

  const [p, setP] = useState<PresidentProfile>({
    name: '',
    nameEng: '',
    party: 'DPK',
    birthDate: '1970-01-01',
    birthplace: '서울특별시',
    gender: 'M',
    height: 175,
    weight: 75,
    bloodType: 'A',
    mbti: 'INTJ',
    religion: '무교',
    ideology: -10,
    slogan: '',
    inaugurationAddress: '',
    traits: ['통합', '실용'],
    education: [{ level: '학사', school: '서울대학교', major: '법학', year: 1992 }],
    career: [{ period: '2010~2024', position: '국회의원', org: '국회' }],
    family: { children: [] },
    assets: 20,
    healthStatus: '양호',
    hobby: ['독서'],
    languages: ['한국어', '영어(중)'],
    inauguratedAt: '',
    termEndsAt: '',
    termNumber: nextTermNumber,
  });

  const set = <K extends keyof PresidentProfile>(k: K, v: PresidentProfile[K]) =>
    setP(prev => ({ ...prev, [k]: v }));

  const editEdu = (i: number, patch: Partial<EducationEntry>) => {
    const arr = [...p.education];
    arr[i] = { ...arr[i], ...patch };
    set('education', arr);
  };
  const editCar = (i: number, patch: Partial<CareerEntry>) => {
    const arr = [...p.career];
    arr[i] = { ...arr[i], ...patch };
    set('career', arr);
  };

  const submit = () => {
    if (!p.name.trim()) return alert('이름을 입력해 주세요.');
    if (!p.slogan.trim()) return alert('슬로건을 입력해 주세요.');
    beginNewTerm(p);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-700 rounded-lg p-5 my-8 space-y-3">
        <div className="text-center">
          <div className="text-xs tracking-[0.3em] text-rok-red">REPUBLIC OF KOREA</div>
          <h2 className="text-2xl font-bold">제{nextTermNumber}대 대통령 — 새 캐릭터 생성</h2>
          <div className="text-[11px] text-slate-400 mt-1">
            전임 {prev.president.name} 임기 만료. 인수 상태: 코스피 {Math.round(prev.economy.kospi)}, 환율 {Math.round(prev.economy.fxUsdKrw)}원, 국고 {prev.economy.treasuryBalanceKRW.toFixed(1)}조, 출산율 {prev.social.birthRate.toFixed(2)}, 북한 긴장 {prev.security.northKoreaTension}.
          </div>
        </div>

        <Section title="① 기본 인적사항">
          <Grid cols={3}>
            <Field label="이름 (한글)"><input className="input w-full" value={p.name} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="영문명"><input className="input w-full" value={p.nameEng ?? ''} onChange={e => set('nameEng', e.target.value)} /></Field>
            <Field label="성별">
              <select className="input w-full" value={p.gender} onChange={e => set('gender', e.target.value as any)}>
                <option value="M">남성</option><option value="F">여성</option>
              </select>
            </Field>
            <Field label="생년월일"><input type="date" className="input w-full" value={p.birthDate} onChange={e => set('birthDate', e.target.value)} /></Field>
            <Field label="출생지"><input className="input w-full" value={p.birthplace} onChange={e => set('birthplace', e.target.value)} /></Field>
            <Field label="종교">
              <select className="input w-full" value={p.religion} onChange={e => set('religion', e.target.value as any)}>
                <option>무교</option><option>개신교</option><option>천주교</option>
                <option>불교</option><option>원불교</option><option>기타</option>
              </select>
            </Field>
            <Field label="키 (cm)"><input type="number" className="input w-full" value={p.height} onChange={e => set('height', Number(e.target.value))} /></Field>
            <Field label="몸무게 (kg)"><input type="number" className="input w-full" value={p.weight} onChange={e => set('weight', Number(e.target.value))} /></Field>
            <Field label="혈액형">
              <select className="input w-full" value={p.bloodType} onChange={e => set('bloodType', e.target.value as any)}>
                <option>A</option><option>B</option><option>O</option><option>AB</option>
              </select>
            </Field>
            <Field label="MBTI"><input className="input w-full" value={p.mbti ?? ''} onChange={e => set('mbti', e.target.value.toUpperCase())} /></Field>
            <Field label="자산 (억원)"><input type="number" className="input w-full" value={p.assets} onChange={e => set('assets', Number(e.target.value))} /></Field>
            <Field label="건강 상태">
              <select className="input w-full" value={p.healthStatus} onChange={e => set('healthStatus', e.target.value as any)}>
                <option>매우 양호</option><option>양호</option><option>보통</option><option>주의</option><option>위험</option>
              </select>
            </Field>
          </Grid>
        </Section>

        <Section title="② 정당·이념">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {PARTIES.filter(x => x.id !== 'IND').map(party => (
              <button key={party.id} onClick={() => { set('party', party.id as PartyId); set('ideology', party.ideology); }}
                className={`px-2 py-2 rounded border text-xs ${p.party === party.id ? 'border-blue-400 bg-blue-900/40' : 'border-slate-700 bg-slate-800/60'}`}
                style={{ borderLeftColor: party.color, borderLeftWidth: 4 }}>
                <div className="font-bold">{party.name}</div>
                <div className="text-[10px] text-slate-400">{party.seats}석</div>
              </button>
            ))}
          </div>
          <label className="block text-xs text-slate-400 mb-1">이념: <span className="font-mono">{p.ideology}</span></label>
          <input type="range" min={-100} max={100} value={p.ideology} onChange={e => set('ideology', Number(e.target.value))} className="w-full" />
        </Section>

        <Section title="③ 슬로건·취임사">
          <Field label="슬로건"><input className="input w-full" value={p.slogan} onChange={e => set('slogan', e.target.value)} placeholder='예: "신뢰의 정치, 따뜻한 경제"' /></Field>
          <Field label="취임사 핵심 메시지"><textarea className="input w-full h-16" value={p.inaugurationAddress} onChange={e => set('inaugurationAddress', e.target.value)} /></Field>
          <Field label="성향 태그 (쉼표)"><input className="input w-full" value={p.traits.join(', ')} onChange={e => set('traits', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></Field>
        </Section>

        <Section title="④ 학력·경력 (간단)" right={
          <div className="flex gap-1">
            <button onClick={() => set('education', [...p.education, { level: '학사', school: '', year: 1990 }])} className="btn text-[10px]">+학력</button>
            <button onClick={() => set('career', [...p.career, { period: '', position: '', org: '' }])} className="btn text-[10px]">+경력</button>
          </div>
        }>
          <div className="text-[10px] text-slate-500 mb-0.5">학력</div>
          {p.education.map((e, i) => (
            <div key={i} className="grid grid-cols-10 gap-1 items-center mb-0.5">
              <select className="input col-span-2 text-xs" value={e.level} onChange={ev => editEdu(i, { level: ev.target.value as any })}>
                <option>고등학교</option><option>학사</option><option>석사</option><option>박사</option><option>명예박사</option>
              </select>
              <input className="input col-span-4 text-xs" placeholder="학교" value={e.school} onChange={ev => editEdu(i, { school: ev.target.value })} />
              <input className="input col-span-3 text-xs" placeholder="전공" value={e.major ?? ''} onChange={ev => editEdu(i, { major: ev.target.value })} />
              <input type="number" className="input col-span-1 text-xs" value={e.year} onChange={ev => editEdu(i, { year: Number(ev.target.value) })} />
            </div>
          ))}
          <div className="text-[10px] text-slate-500 mt-2 mb-0.5">경력</div>
          {p.career.map((c, i) => (
            <div key={i} className="grid grid-cols-10 gap-1 items-center mb-0.5">
              <input className="input col-span-3 text-xs" placeholder="기간" value={c.period} onChange={ev => editCar(i, { period: ev.target.value })} />
              <input className="input col-span-3 text-xs" placeholder="직위" value={c.position} onChange={ev => editCar(i, { position: ev.target.value })} />
              <input className="input col-span-4 text-xs" placeholder="소속" value={c.org} onChange={ev => editCar(i, { org: ev.target.value })} />
            </div>
          ))}
        </Section>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn flex-1">← 평가표로 돌아가기</button>
          <button onClick={submit} className="btn-primary flex-1 py-3">🇰🇷 취임 선서 — 새 5년 시작</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-slate-800 rounded p-3 bg-slate-950/40">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}
function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  const cls = cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4';
  return <div className={`grid ${cls} gap-2`}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );
}
