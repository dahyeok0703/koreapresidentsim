import { useState } from 'react';
import { useGame } from '../store';
import type { SubRegion } from '../data/subRegions';
import type { Country } from '../types/game';
import type { TradeProfile } from '../data/trade';
import { Panel, Stat, Chip } from './common';
import { fmtInt, fmtNum } from '../utils/format';

// ============ 시군구 상세 모달 ============
export function SubRegionDetailModal({ sub, onClose }: { sub: SubRegion; onClose: () => void }) {
  const state = useGame(s => s.state)!;
  const issueDecision = useGame(s => s.issueDecision);
  const busy = useGame(s => s.busy);
  const region = state.regions.find(r => r.id === sub.parentRegion);
  const party = state.parties.find(p => p.id === sub.mayorParty);
  const buildings = state.buildings.filter(b => b.region === sub.parentRegion);
  // 이름 매칭으로 위치 기반 필터링
  const localBuildings = buildings.filter(b => b.location.includes(sub.name.replace(/(시|군|구|읍|면|동)$/, '')));
  const density = sub.area > 0 ? (sub.population * 10000 / sub.area).toFixed(0) : '-';

  const titlePrefix = sub.type === '자치구' || sub.type === '일반구' ? '구청장' :
                       sub.type === '시' || sub.type === '특별자치시' ? '시장' :
                       sub.type === '군' ? '군수' : '동장';

  const act = (prompt: string, label: string) => issueDecision(prompt, label);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-blue-700 rounded-lg max-w-3xl w-full max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-950 to-slate-900 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-blue-300 tracking-widest">시군구 상세</div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {sub.name} <Chip>{sub.type}</Chip>
            </h2>
            <div className="text-[11px] text-slate-400">{region?.name} 산하 · 인구밀도 {density}명/㎢</div>
          </div>
          <button onClick={onClose} className="text-slate-400 text-2xl leading-none hover:text-white">×</button>
        </div>

        <div className="p-4 space-y-3">
          <Panel title="기본 정보">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <Stat label="인구"     value={`${fmtNum(sub.population, 1)}만명`} />
              <Stat label="면적"     value={`${fmtNum(sub.area, 0)}㎢`} />
              <Stat label="인구밀도" value={`${density}명/㎢`} />
              <Stat label="유형"     value={sub.type} />
              <Stat label={titlePrefix} value={`${sub.mayor} (${party?.shortName ?? '-'})`} color={party ? `text-[${party.color}]` : ''} />
              <Stat label="소속 정당" value={party?.name ?? '-'} />
            </div>
          </Panel>

          {sub.industries.length > 0 && (
            <Panel title="주요 산업">
              <div className="flex flex-wrap gap-1">
                {sub.industries.map((ind, i) => <Chip key={i}>{ind}</Chip>)}
              </div>
            </Panel>
          )}

          {sub.notable && (
            <Panel title="랜드마크·특이사항">
              <div className="text-[12px] text-slate-200">{sub.notable}</div>
            </Panel>
          )}

          {localBuildings.length > 0 && (
            <Panel title={`관할 건축물·시설 (${localBuildings.length})`}>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {localBuildings.map(b => (
                  <div key={b.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">{b.isLandmark && '⭐ '}{b.name}</span>
                      <Chip>{b.category}</Chip>
                    </div>
                    <div className="text-[10px] text-slate-500">{b.location}{b.size ? ` · ${b.size}` : ''}{b.builtYear ? ` · ${b.builtYear}년` : ''}</div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="지자체 정책 (결정 모드)">
            <div className="grid grid-cols-2 gap-1">
              <button disabled={!!busy} onClick={() => act(`${sub.name}에 SOC(도로·철도·항만·공항) 특별 예산을 편성한다.`, `${sub.name} SOC 예산`)}
                className="btn text-[10px] py-1.5 disabled:opacity-40">🛤️ SOC 예산 편성</button>
              <button disabled={!!busy} onClick={() => act(`${sub.name}의 주력산업(${sub.industries.join('·') || '주요산업'}) 클러스터를 정부 차원에서 지원한다.`, `${sub.name} 산업 지원`)}
                className="btn text-[10px] py-1.5 disabled:opacity-40">🏭 산업 지원</button>
              <button disabled={!!busy} onClick={() => act(`${sub.name}을 신도시·혁신도시·기업도시로 지정·승격한다.`, `${sub.name} 도시 지정`)}
                className="btn text-[10px] py-1.5 disabled:opacity-40">🏙️ 도시 지정</button>
              <button disabled={!!busy} onClick={() => act(`${sub.name}을 ${titlePrefix} ${sub.mayor}와 함께 방문해 민생 현장을 점검한다.`, `${sub.name} 현장 방문`)}
                className="btn text-[10px] py-1.5 disabled:opacity-40">🚙 현장 방문</button>
              <button disabled={!!busy} onClick={() => act(`${sub.name}의 청년·신혼부부 주거 패키지를 시행한다.`, `${sub.name} 청년 주거`)}
                className="btn text-[10px] py-1.5 disabled:opacity-40">👨‍👩‍👧 청년 주거</button>
              <button disabled={!!busy} onClick={() => act(`${sub.name}을 재난·재해 특별 대응 지역으로 지정한다.`, `${sub.name} 재난 대응`)}
                className="btn text-[10px] py-1.5 disabled:opacity-40">🛡️ 재난 대응</button>
            </div>
            <div className="text-[10px] text-slate-500 mt-2">💡 시군구 분할·통합·신설은 채팅 결정으로 가능. 예: "{sub.name}을 A시·B시로 분할"</div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ============ 무역 정책 세부 모달 ============
export type TradePolicyType = 'FTA' | 'RESOURCE' | 'EXPORT_EXPAND' | 'ANTIDUMPING' | 'TARIFF_UP' | 'EXPORT_CONTROL';

export function TradePolicyModal({
  country, profile, type, onClose,
}: {
  country: Country; profile: TradeProfile; type: TradePolicyType; onClose: () => void;
}) {
  const issueDecision = useGame(s => s.issueDecision);
  const busy = useGame(s => s.busy);

  // 정책별 폼 상태
  const [ftaScope, setFtaScope] = useState<'전면' | '부분' | '디지털·서비스'>('전면');
  const [ftaExcludeAgri, setFtaExcludeAgri] = useState(true);
  const [ftaPhaseYears, setFtaPhaseYears] = useState(10);

  const [resourceField, setResourceField] = useState<'에너지' | '핵심광물' | '식량' | '반도체 소재'>('핵심광물');
  const [resourceInvestB, setResourceInvestB] = useState(2);

  const [exportIndustry, setExportIndustry] = useState<'반도체' | '자동차' | '방산' | 'K-콘텐츠' | '바이오·의약' | '이차전지'>('자동차');
  const [exportSupportB, setExportSupportB] = useState(1);

  const [antidumpingTarget, setAntidumpingTarget] = useState(profile.importItems[0]?.category ?? '');
  const [antidumpingStage, setAntidumpingStage] = useState<'조사 착수' | '잠정 조치' | '확정 부과'>('조사 착수');

  const [tariffItem, setTariffItem] = useState(profile.importItems[0]?.category ?? '');
  const [tariffRate, setTariffRate] = useState(10);
  const [tariffEffective, setTariffEffective] = useState<'즉시' | '60일 후' | '6개월 후'>('60일 후');

  const [exportCtrlItem, setExportCtrlItem] = useState(profile.exportItems[0]?.category ?? '');
  const [exportCtrlMode, setExportCtrlMode] = useState<'개별 라이선스' | '완전 금지' | '심사 강화'>('개별 라이선스');

  const title = type === 'FTA' ? `🤝 ${country.name} FTA 협상` :
                type === 'RESOURCE' ? `⛏️ ${country.name} 자원 협력` :
                type === 'EXPORT_EXPAND' ? `📈 ${country.name} 수출 확대` :
                type === 'ANTIDUMPING' ? `⚖️ ${country.name} 반덤핑 조사` :
                type === 'TARIFF_UP' ? `📈 ${country.name} 관세 인상` : `🚫 ${country.name} 수출 통제`;

  const isHostile = type === 'ANTIDUMPING' || type === 'TARIFF_UP' || type === 'EXPORT_CONTROL';

  const submit = () => {
    let prompt = '';
    let label = '';
    if (type === 'FTA') {
      label = `${country.name} FTA ${ftaScope}`;
      prompt = `${country.name}과의 FTA(자유무역협정) 협상을 추진한다.
- 협상 범위: ${ftaScope}
- 농산물 제외: ${ftaExcludeAgri ? '예 (민감 품목 보호)' : '아니오 (전면 개방)'}
- 단계적 관세 철폐 기간: ${ftaPhaseYears}년
양국 무역 활성화·지정학적 협력 강화 목적.`;
    } else if (type === 'RESOURCE') {
      label = `${country.name} ${resourceField} 협력`;
      prompt = `${country.name}과의 ${resourceField} 자원·소재 협력을 강화한다.
- 분야: ${resourceField}
- 정부 투자 보증·차관 규모: $${resourceInvestB}B
- 자원외교·공급망 다변화 차원.`;
    } else if (type === 'EXPORT_EXPAND') {
      label = `${country.name} ${exportIndustry} 수출`;
      prompt = `${country.name}으로의 ${exportIndustry} 산업 수출 확대 패키지를 발표한다.
- 대상 산업: ${exportIndustry}
- 정부 지원 규모: ₩${exportSupportB}조 (마케팅·해외영업·금융)
- 신규 진출·점유율 확대 목적.`;
    } else if (type === 'ANTIDUMPING') {
      label = `${country.name} ${antidumpingTarget} 반덤핑`;
      prompt = `${country.name}산 "${antidumpingTarget}"에 대한 반덤핑·세이프가드를 ${antidumpingStage} 단계로 발동한다.
- 대상 품목: ${antidumpingTarget}
- 조치 단계: ${antidumpingStage}
- 국내 산업 보호 목적. ${country.name}의 반발·맞대응 예상.`;
    } else if (type === 'TARIFF_UP') {
      label = `${country.name} ${tariffItem} 관세 ${tariffRate}%`;
      prompt = `${country.name}산 "${tariffItem}"에 대한 수입 관세를 ${tariffRate}%p 인상한다.
- 품목: ${tariffItem}
- 인상 폭: +${tariffRate}%p
- 발효: ${tariffEffective}
관세 보복·물가 상승·WTO 제소 등 가능성.`;
    } else if (type === 'EXPORT_CONTROL') {
      label = `${country.name} ${exportCtrlItem} 수출통제`;
      prompt = `${country.name}으로 향하는 "${exportCtrlItem}"에 대한 수출 통제를 발동한다.
- 품목: ${exportCtrlItem}
- 방식: ${exportCtrlMode}
- 안보·기술 보호 또는 외교 압박 수단. 양국 관계 악화 가능.`;
    }
    if (prompt) {
      issueDecision(prompt, label);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-blue-700 rounded-lg max-w-2xl w-full max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-950 to-slate-900 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-blue-300 tracking-widest">{country.flag} {country.name} · 무역 정책 세부 설정</div>
            <h2 className="text-lg font-bold">{title}</h2>
            <div className="text-[10px] text-slate-400">관계 {country.relation > 0 ? '+' : ''}{country.relation} · 교역 ${fmtInt(profile.totalExportUSD + profile.totalImportUSD)}M · 의존도 {profile.riskLevel}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 text-2xl leading-none hover:text-white">×</button>
        </div>

        <div className="p-4 space-y-3">
          {type === 'FTA' && (<>
            <Section title="협상 범위">
              <div className="grid grid-cols-3 gap-1">
                {(['전면','부분','디지털·서비스'] as const).map(s => (
                  <button key={s} onClick={() => setFtaScope(s)}
                    className={`btn text-xs ${ftaScope === s ? 'bg-blue-700 text-white border-blue-600' : ''}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Section>
            <Section title="민감 품목 보호">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={ftaExcludeAgri} onChange={e => setFtaExcludeAgri(e.target.checked)} />
                <span>농수산물 제외 (자국 농민 보호) — {ftaExcludeAgri ? '제외' : '전면 개방'}</span>
              </label>
            </Section>
            <Section title="단계적 관세 철폐 기간">
              <input type="range" min={5} max={20} value={ftaPhaseYears} onChange={e => setFtaPhaseYears(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-slate-300">{ftaPhaseYears}년 (짧을수록 충격 큼, 길수록 점진적)</div>
            </Section>
          </>)}

          {type === 'RESOURCE' && (<>
            <Section title="협력 분야">
              <div className="grid grid-cols-2 gap-1">
                {(['에너지','핵심광물','식량','반도체 소재'] as const).map(s => (
                  <button key={s} onClick={() => setResourceField(s)}
                    className={`btn text-xs ${resourceField === s ? 'bg-blue-700 text-white border-blue-600' : ''}`}>{s}</button>
                ))}
              </div>
            </Section>
            <Section title="정부 투자 규모">
              <input type="range" min={0.5} max={20} step={0.5} value={resourceInvestB} onChange={e => setResourceInvestB(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-slate-300">${resourceInvestB}B (정부 지원·차관 보증·투자 협력)</div>
            </Section>
          </>)}

          {type === 'EXPORT_EXPAND' && (<>
            <Section title="대상 산업">
              <div className="grid grid-cols-3 gap-1">
                {(['반도체','자동차','방산','K-콘텐츠','바이오·의약','이차전지'] as const).map(s => (
                  <button key={s} onClick={() => setExportIndustry(s)}
                    className={`btn text-xs ${exportIndustry === s ? 'bg-blue-700 text-white border-blue-600' : ''}`}>{s}</button>
                ))}
              </div>
            </Section>
            <Section title="정부 지원 규모">
              <input type="range" min={0.1} max={10} step={0.1} value={exportSupportB} onChange={e => setExportSupportB(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-slate-300">₩{exportSupportB}조 (수출 보증·무역금융·마케팅·정상외교)</div>
            </Section>
          </>)}

          {type === 'ANTIDUMPING' && (<>
            <Section title="대상 품목">
              <select className="input w-full text-xs" value={antidumpingTarget} onChange={e => setAntidumpingTarget(e.target.value)}>
                {profile.importItems.map((it, i) => <option key={i} value={it.category}>{it.category} (${it.valueUSD}M)</option>)}
              </select>
            </Section>
            <Section title="조치 단계">
              <div className="grid grid-cols-3 gap-1">
                {(['조사 착수','잠정 조치','확정 부과'] as const).map(s => (
                  <button key={s} onClick={() => setAntidumpingStage(s)}
                    className={`btn text-xs ${antidumpingStage === s ? 'bg-orange-700 text-white border-orange-600' : ''}`}>{s}</button>
                ))}
              </div>
            </Section>
          </>)}

          {type === 'TARIFF_UP' && (<>
            <Section title="대상 품목">
              <select className="input w-full text-xs" value={tariffItem} onChange={e => setTariffItem(e.target.value)}>
                {profile.importItems.map((it, i) => <option key={i} value={it.category}>{it.category} (${it.valueUSD}M)</option>)}
              </select>
            </Section>
            <Section title="관세 인상 폭">
              <input type="range" min={5} max={50} step={5} value={tariffRate} onChange={e => setTariffRate(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-red-300">+{tariffRate}%p ({tariffRate >= 25 ? '강경' : tariffRate >= 15 ? '중간' : '온건'})</div>
            </Section>
            <Section title="발효 시점">
              <div className="grid grid-cols-3 gap-1">
                {(['즉시','60일 후','6개월 후'] as const).map(s => (
                  <button key={s} onClick={() => setTariffEffective(s)}
                    className={`btn text-xs ${tariffEffective === s ? 'bg-red-700 text-white border-red-600' : ''}`}>{s}</button>
                ))}
              </div>
            </Section>
          </>)}

          {type === 'EXPORT_CONTROL' && (<>
            <Section title="대상 품목">
              <select className="input w-full text-xs" value={exportCtrlItem} onChange={e => setExportCtrlItem(e.target.value)}>
                {profile.exportItems.map((it, i) => <option key={i} value={it.category}>{it.category} (${it.valueUSD}M)</option>)}
              </select>
            </Section>
            <Section title="통제 방식">
              <div className="grid grid-cols-3 gap-1">
                {(['심사 강화','개별 라이선스','완전 금지'] as const).map(s => (
                  <button key={s} onClick={() => setExportCtrlMode(s)}
                    className={`btn text-xs ${exportCtrlMode === s ? 'bg-red-700 text-white border-red-600' : ''}`}>{s}</button>
                ))}
              </div>
            </Section>
          </>)}

          <div className="bg-slate-950/60 border border-slate-700 rounded p-2 text-[11px] text-slate-300">
            <div className="text-[10px] text-blue-300 mb-1">📋 결정 미리보기</div>
            <div className="leading-relaxed">
              {type === 'FTA' && `${country.name}과 ${ftaScope} FTA 협상 추진. 농수산물 ${ftaExcludeAgri ? '제외' : '포함'}. ${ftaPhaseYears}년 단계 철폐.`}
              {type === 'RESOURCE' && `${country.name}과 ${resourceField} 자원 협력. 정부 지원 $${resourceInvestB}B.`}
              {type === 'EXPORT_EXPAND' && `${country.name}으로 ${exportIndustry} 수출 확대. 지원 규모 ₩${exportSupportB}조.`}
              {type === 'ANTIDUMPING' && `${country.name}산 ${antidumpingTarget} ${antidumpingStage}.`}
              {type === 'TARIFF_UP' && `${country.name}산 ${tariffItem} 관세 +${tariffRate}%p · ${tariffEffective} 발효.`}
              {type === 'EXPORT_CONTROL' && `${country.name}으로 ${exportCtrlItem} 수출 ${exportCtrlMode}.`}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="btn flex-1 text-sm">취소</button>
            <button onClick={submit} disabled={!!busy}
              className={`flex-1 text-sm py-2 rounded font-semibold disabled:opacity-40 ${
                isHostile ? 'bg-rok-red hover:bg-red-700 text-white' : 'bg-rok-blue hover:bg-blue-700 text-white'
              }`}>
              {isHostile ? '⚠️ 강경 정책 발동' : '✅ 정책 추진'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-950/40 border border-slate-800 rounded p-2">
      <div className="text-[10px] text-slate-400 mb-1.5 tracking-widest">{title}</div>
      {children}
    </div>
  );
}
