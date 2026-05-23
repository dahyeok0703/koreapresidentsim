import { useState, useEffect } from 'react';
import { PARTIES } from '../data/parties';
import { createInitialState } from '../data/initialState';
import { useGame } from '../store';
import { listSaves, loadSlot, deleteSlot, type SaveSlot } from '../db/storage';
import type { PartyId, PresidentProfile, EducationEntry, CareerEntry } from '../types/game';

const PRESETS: Partial<PresidentProfile>[] = [
  {
    name: '이정민', nameEng: 'Lee Jung-min',
    party: 'DPK', ideology: -35,
    birthDate: '1965-04-12', birthplace: '경기도 안동시', gender: 'M',
    height: 174, weight: 78, bloodType: 'O', mbti: 'ENTJ', religion: '천주교',
    slogan: '다시, 사람이 먼저다',
    inaugurationAddress: '국민의 삶을 회복하고 분열된 대한민국을 통합하겠습니다',
    traits: ['결단력', '실용주의', '협상력'],
    hobby: ['독서', '등산', '야구'],
    languages: ['한국어', '영어(상)', '일본어(중)'],
    assets: 38, assetsDetail: '주택 2채, 예금, 부친 상속 토지',
    healthStatus: '양호',
    family: { spouse: '김선영', spouseJob: '교수', children: [{ name: '이수민', age: 28, job: '회사원' }] },
    education: [
      { level: '고등학교', school: '경기고', year: 1983 },
      { level: '학사',     school: '서울대학교', major: '법학', year: 1987 },
      { level: '석사',     school: '하버드 로스쿨', major: 'LL.M.', year: 1991 },
    ],
    career: [
      { period: '1990~1996', position: '변호사', org: '대형 로펌' },
      { period: '2000~2008', position: '제17·18대 국회의원', org: '국회 / 경기 성남' },
      { period: '2010~2014', position: '경기도지사', org: '경기도청' },
      { period: '2016~2024', position: '제20·21대 국회의원', org: '국회 / 인천 계양' },
    ],
  },
  {
    name: '한지원', nameEng: 'Han Ji-won',
    party: 'PPP', ideology: 55,
    birthDate: '1967-08-23', birthplace: '경상남도 거제시', gender: 'M',
    height: 178, weight: 82, bloodType: 'A', mbti: 'ESTJ', religion: '개신교',
    slogan: '강한 대한민국, 안전한 나라',
    inaugurationAddress: '자유민주주의를 굳건히 지키고 시장경제를 활성화하겠습니다',
    traits: ['강단', '원칙주의', '안보 강조'],
    hobby: ['골프', '서예', '클래식'],
    languages: ['한국어', '영어(중)'],
    assets: 52, assetsDetail: '강남 아파트, 거제 토지, 주식',
    healthStatus: '양호',
    family: { spouse: '박혜진', spouseJob: '주부', children: [{ name: '한도윤', age: 30 }, { name: '한지유', age: 26 }] },
    education: [
      { level: '고등학교', school: '거제고', year: 1985 },
      { level: '학사',     school: '연세대학교', major: '경영학', year: 1989 },
      { level: '석사',     school: '서울대 행정대학원', major: '정책학', year: 1994 },
    ],
    career: [
      { period: '1991~2005', position: '대기업 임원', org: 'OO그룹' },
      { period: '2008~2012', position: '거제시장', org: '거제시청' },
      { period: '2016~2024', position: '제20·21대 국회의원', org: '국회 / 부산 해운대' },
    ],
  },
];

export default function SetupScreen() {
  const init = useGame(s => s.init);
  const [savedSlots, setSavedSlots] = useState<SaveSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [createMode, setCreateMode] = useState(false);

  const refresh = async () => {
    try {
      const list = await listSaves();
      setSavedSlots(list.filter(s => (s.state.version ?? 0) >= 12));
    } catch {/* ignore */}
    finally { setSlotsLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const handleLoad = async (id: string) => {
    const slot = await loadSlot(id);
    if (slot) init(slot.state);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('이 저장 슬롯을 삭제하시겠습니까?')) return;
    await deleteSlot(id);
    refresh();
  };

  const [p, setP] = useState<PresidentProfile>({
    ...(PRESETS[0] as PresidentProfile),
    inauguratedAt: '2025-06-04',
    termEndsAt: '2030-06-03',
    termNumber: 21,
  });
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');

  const set = <K extends keyof PresidentProfile>(k: K, v: PresidentProfile[K]) =>
    setP(prev => ({ ...prev, [k]: v }));

  const usePreset = (i: number) => {
    setP(prev => ({ ...prev, ...PRESETS[i] } as PresidentProfile));
  };

  const editEdu = (i: number, patch: Partial<EducationEntry>) => {
    const arr = [...p.education];
    arr[i] = { ...arr[i], ...patch };
    set('education', arr);
  };
  const addEdu = () => set('education', [...p.education, { level: '학사', school: '', year: 1990 }]);
  const rmEdu = (i: number) => set('education', p.education.filter((_, j) => j !== i));

  const editCar = (i: number, patch: Partial<CareerEntry>) => {
    const arr = [...p.career];
    arr[i] = { ...arr[i], ...patch };
    set('career', arr);
  };
  const addCar = () => set('career', [...p.career, { period: '', position: '', org: '' }]);
  const rmCar = (i: number) => set('career', p.career.filter((_, j) => j !== i));

  const start = () => {
    if (!p.name.trim()) { alert('이름을 입력해주세요.'); return; }
    if (!p.slogan.trim()) { alert('슬로건을 입력해주세요.'); return; }
    const state = createInitialState({
      ...p,
      inauguratedAt: '2025-06-04',
      termEndsAt: '2030-06-03',
      termNumber: 21,
    }, apiKey.trim(), model);
    init(state);
  };

  return (
    <div className="min-h-screen overflow-y-auto p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="max-w-5xl mx-auto panel p-6 space-y-5">
        <header className="text-center space-y-1">
          <div className="text-xs tracking-[0.3em] text-rok-red">REPUBLIC OF KOREA · 제21대</div>
          <h1 className="text-3xl font-bold">대한민국 대통령 시뮬레이터</h1>
          <p className="text-sm text-slate-400">2025년 6월 4일, 당신은 대한민국 제21대 대통령으로 취임합니다.</p>
        </header>

        {/* === 저장된 게임 불러오기 === */}
        <div className="border border-slate-700 rounded p-3 bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-emerald-300">💾 저장된 게임 불러오기</h3>
            <button onClick={refresh} className="text-[10px] text-blue-300 hover:text-blue-200">새로고침</button>
          </div>
          {slotsLoading ? (
            <div className="text-[11px] text-slate-500 text-center py-2">로딩 중...</div>
          ) : savedSlots.length === 0 ? (
            <div className="text-[11px] text-slate-500 text-center py-2">
              저장된 게임이 없습니다. 새 게임을 시작하고 상단 "저장/불러오기" 버튼으로 저장하세요.
            </div>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {savedSlots.map(s => (
                <div key={s.id} className="bg-slate-900/60 border border-slate-800 rounded p-2 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {s.state.president.name} · 제{s.state.president.termNumber}대 · {s.state.clock.currentDate}
                      <span className="mx-1">·</span>
                      지지율 <span className="text-emerald-300 font-mono">{s.state.approval.overall.toFixed(1)}%</span>
                      <span className="mx-1">·</span>
                      <span className="text-slate-500">저장 {new Date(s.updatedAt).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleLoad(s.id)} className="btn-primary text-[10px] py-1 px-2">▶ 이어하기</button>
                    <button onClick={() => handleDelete(s.id)} className="btn-danger text-[10px] py-1 px-2">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === 새 게임 시작 토글 === */}
        <div className="text-center">
          <button onClick={() => setCreateMode(!createMode)}
            className={`text-sm px-4 py-2 rounded border ${createMode ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-blue-600 bg-blue-900/40 text-blue-200'}`}>
            {createMode ? '▲ 캐릭터 생성 접기' : '＋ 새 게임 — 캐릭터 생성하기'}
          </button>
        </div>

        {createMode && (<>
        <div className="flex justify-center gap-2">
          <span className="text-xs text-slate-400 self-center">프리셋:</span>
          <button onClick={() => usePreset(0)} className="btn text-xs">진보 후보 (이정민)</button>
          <button onClick={() => usePreset(1)} className="btn text-xs">보수 후보 (한지원)</button>
        </div>

        {/* === 기본 인적사항 === */}
        <Section title="① 기본 인적사항">
          <Grid cols={4}>
            <Field label="이름 (한글)">
              <input className="input w-full" value={p.name} onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="영문명">
              <input className="input w-full" value={p.nameEng ?? ''} onChange={e => set('nameEng', e.target.value)} />
            </Field>
            <Field label="성별">
              <select className="input w-full" value={p.gender} onChange={e => set('gender', e.target.value as any)}>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
            </Field>
            <Field label="생년월일 (자동으로 나이 계산)">
              <input type="date" className="input w-full" value={p.birthDate} onChange={e => {
                set('birthDate', e.target.value);
              }} />
            </Field>
            <Field label="출생지">
              <input className="input w-full" value={p.birthplace} onChange={e => set('birthplace', e.target.value)} />
            </Field>
            <Field label="종교">
              <select className="input w-full" value={p.religion} onChange={e => set('religion', e.target.value as any)}>
                <option>무교</option><option>개신교</option><option>천주교</option>
                <option>불교</option><option>원불교</option><option>기타</option>
              </select>
            </Field>
            <Field label="키 (cm)">
              <input type="number" className="input w-full" value={p.height} onChange={e => set('height', Number(e.target.value))} />
            </Field>
            <Field label="몸무게 (kg)">
              <input type="number" className="input w-full" value={p.weight} onChange={e => set('weight', Number(e.target.value))} />
            </Field>
            <Field label="혈액형">
              <select className="input w-full" value={p.bloodType} onChange={e => set('bloodType', e.target.value as any)}>
                <option>A</option><option>B</option><option>O</option><option>AB</option>
              </select>
            </Field>
            <Field label="MBTI">
              <input className="input w-full" value={p.mbti ?? ''} placeholder="예: ENTJ" onChange={e => set('mbti', e.target.value.toUpperCase())} />
            </Field>
          </Grid>
        </Section>

        {/* === 정당/이념 === */}
        <Section title="② 정당 · 이념">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PARTIES.filter(x => x.id !== 'IND').map(party => (
              <button
                key={party.id}
                onClick={() => { set('party', party.id as PartyId); set('ideology', party.ideology); }}
                className={`px-2 py-2 rounded border text-xs ${p.party === party.id ? 'border-blue-400 bg-blue-900/40' : 'border-slate-700 bg-slate-800/60 hover:bg-slate-700'}`}
                style={{ borderLeftColor: party.color, borderLeftWidth: 4 }}
              >
                <div className="font-bold">{party.name}</div>
                <div className="text-[10px] text-slate-400">{party.seats}석 · 지지 {party.supportRate}%</div>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              정치 이념: <span className="font-mono">{p.ideology}</span> ({p.ideology < -30 ? '진보' : p.ideology > 30 ? '보수' : '중도'})
            </label>
            <input type="range" min={-100} max={100} value={p.ideology}
              onChange={e => set('ideology', Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-slate-500"><span>극좌</span><span>중도</span><span>극우</span></div>
          </div>
        </Section>

        {/* === 슬로건 / 취임사 === */}
        <Section title="③ 슬로건 · 취임사">
          <Field label="캠페인 슬로건">
            <input className="input w-full" value={p.slogan} onChange={e => set('slogan', e.target.value)}
              placeholder='예: "다시, 사람이 먼저다"' />
          </Field>
          <Field label="취임사 핵심 메시지 (1~2문장)">
            <textarea className="input w-full h-16" value={p.inaugurationAddress}
              onChange={e => set('inaugurationAddress', e.target.value)} />
          </Field>
          <Field label="성향 태그 (쉼표 구분)">
            <input className="input w-full" value={p.traits.join(', ')}
              onChange={e => set('traits', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
          </Field>
        </Section>

        {/* === 학력 === */}
        <Section title="④ 학력" right={<button onClick={addEdu} className="btn text-xs">+ 추가</button>}>
          <div className="space-y-1">
            {p.education.map((e, i) => (
              <div key={i} className="grid grid-cols-12 gap-1 items-center">
                <select className="input col-span-2" value={e.level} onChange={ev => editEdu(i, { level: ev.target.value as any })}>
                  <option>고등학교</option><option>학사</option><option>석사</option>
                  <option>박사</option><option>명예박사</option><option>기타</option>
                </select>
                <input className="input col-span-4" placeholder="학교명" value={e.school} onChange={ev => editEdu(i, { school: ev.target.value })} />
                <input className="input col-span-3" placeholder="전공" value={e.major ?? ''} onChange={ev => editEdu(i, { major: ev.target.value })} />
                <input type="number" className="input col-span-2" placeholder="졸업년도" value={e.year} onChange={ev => editEdu(i, { year: Number(ev.target.value) })} />
                <button onClick={() => rmEdu(i)} className="text-red-400 text-xs">×</button>
              </div>
            ))}
          </div>
        </Section>

        {/* === 경력 === */}
        <Section title="⑤ 주요 경력" right={<button onClick={addCar} className="btn text-xs">+ 추가</button>}>
          <div className="space-y-1">
            {p.career.map((c, i) => (
              <div key={i} className="grid grid-cols-12 gap-1 items-center">
                <input className="input col-span-3" placeholder="기간 (2016~2024)" value={c.period} onChange={ev => editCar(i, { period: ev.target.value })} />
                <input className="input col-span-4" placeholder="직위" value={c.position} onChange={ev => editCar(i, { position: ev.target.value })} />
                <input className="input col-span-4" placeholder="소속 / 지역구" value={c.org} onChange={ev => editCar(i, { org: ev.target.value })} />
                <button onClick={() => rmCar(i)} className="text-red-400 text-xs">×</button>
              </div>
            ))}
          </div>
        </Section>

        {/* === 가족 === */}
        <Section title="⑥ 가족">
          <Grid cols={3}>
            <Field label="배우자 이름">
              <input className="input w-full" value={p.family.spouse ?? ''} onChange={e => set('family', { ...p.family, spouse: e.target.value })} />
            </Field>
            <Field label="배우자 직업">
              <input className="input w-full" value={p.family.spouseJob ?? ''} onChange={e => set('family', { ...p.family, spouseJob: e.target.value })} />
            </Field>
            <Field label="자녀 수">
              <input type="number" min={0} max={10} className="input w-full" value={p.family.children.length}
                onChange={e => {
                  const n = Number(e.target.value);
                  const cur = p.family.children;
                  const next = n > cur.length
                    ? [...cur, ...Array(n - cur.length).fill(0).map(() => ({ name: '', age: 25 }))]
                    : cur.slice(0, n);
                  set('family', { ...p.family, children: next });
                }} />
            </Field>
          </Grid>
          {p.family.children.map((c, i) => (
            <div key={i} className="grid grid-cols-3 gap-1 mt-1">
              <input className="input" placeholder={`자녀 ${i+1} 이름`} value={c.name}
                onChange={e => { const arr = [...p.family.children]; arr[i] = { ...arr[i], name: e.target.value }; set('family', { ...p.family, children: arr }); }} />
              <input className="input" type="number" placeholder="나이" value={c.age}
                onChange={e => { const arr = [...p.family.children]; arr[i] = { ...arr[i], age: Number(e.target.value) }; set('family', { ...p.family, children: arr }); }} />
              <input className="input" placeholder="직업" value={c.job ?? ''}
                onChange={e => { const arr = [...p.family.children]; arr[i] = { ...arr[i], job: e.target.value }; set('family', { ...p.family, children: arr }); }} />
            </div>
          ))}
        </Section>

        {/* === 자산/건강/취미 === */}
        <Section title="⑦ 자산 · 건강 · 기타">
          <Grid cols={3}>
            <Field label="자산 (억원)">
              <input type="number" className="input w-full" value={p.assets} onChange={e => set('assets', Number(e.target.value))} />
            </Field>
            <Field label="건강 상태">
              <select className="input w-full" value={p.healthStatus} onChange={e => set('healthStatus', e.target.value as any)}>
                <option>매우 양호</option><option>양호</option><option>보통</option>
                <option>주의</option><option>위험</option>
              </select>
            </Field>
            <Field label="자산 상세">
              <input className="input w-full" value={p.assetsDetail ?? ''} onChange={e => set('assetsDetail', e.target.value)} />
            </Field>
            <Field label="취미 (쉼표 구분)">
              <input className="input w-full" value={p.hobby.join(', ')}
                onChange={e => set('hobby', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            </Field>
            <Field label="구사 언어 (쉼표 구분)">
              <input className="input w-full" value={p.languages.join(', ')}
                onChange={e => set('languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            </Field>
            <Field label="건강 비고">
              <input className="input w-full" value={p.healthNotes ?? ''} onChange={e => set('healthNotes', e.target.value)} placeholder='예: 고혈압 관리 중' />
            </Field>
          </Grid>
        </Section>

        {/* === OpenAI === */}
        <Section title="⑧ OpenAI API 설정">
          <p className="text-[11px] text-slate-400">키는 브라우저 localStorage에만 저장되며 OpenAI 외엔 어디로도 전송되지 않습니다.</p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <input type="password" placeholder="sk-..." className="input col-span-2"
              value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <select className="input" value={model} onChange={e => setModel(e.target.value)}>
              <option value="gpt-4o-mini">gpt-4o-mini (저렴/빠름)</option>
              <option value="gpt-4o">gpt-4o (균형)</option>
              <option value="gpt-4.1-mini">gpt-4.1-mini</option>
              <option value="gpt-4.1">gpt-4.1 (고품질)</option>
              <option value="o4-mini">o4-mini (추론)</option>
            </select>
          </div>
        </Section>

        <button onClick={start} className="btn-primary w-full text-base py-3">
          🇰🇷 취임 선서 — 게임 시작
        </button>
        </>)}
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
