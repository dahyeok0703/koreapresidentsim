import { useState } from 'react';
import { useGame } from '../store';
import { Panel, Stat, StatBar, Chip } from './common';
import { fmtNum, fmtPct, fmtInt, severityColor, categoryLabel } from '../utils/format';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, AreaChart, Area } from 'recharts';
import { MINISTRY_CATEGORY } from '../data/ministries';
import { randomKoreanName, genId } from '../data/initialState';
import type { CountryId } from '../types/game';

const TABS = [
  { id: 'OVERVIEW',     label: '종합',     icon: '📊' },
  { id: 'ECONOMY',      label: '경제',     icon: '💰' },
  { id: 'SOCIAL',       label: '사회',     icon: '👥' },
  { id: 'MILITARY',     label: '군사',     icon: '🛡️' },
  { id: 'DIPLOMACY',    label: '외교',     icon: '🌐' },
  { id: 'POLITICS',     label: '정치',     icon: '🏛️' },
  { id: 'CABINET',      label: '행정부',   icon: '🏢' },
  { id: 'ASSEMBLY',     label: '국회',     icon: '🏛️' },
  { id: 'JUDICIARY',    label: '사법부',   icon: '⚖️' },
  { id: 'EVENTS',       label: '사건로그', icon: '📜' },
  { id: 'INTL',         label: '국제',     icon: '🌍' },
  { id: 'MEDIA',        label: '언론',     icon: '📰' },
  { id: 'SNS',          label: 'SNS',      icon: '📱' },
] as const;
type TabId = typeof TABS[number]['id'];

export default function RightTabs() {
  const [tab, setTab] = useState<TabId>('OVERVIEW');
  const pendingCount = useGame(s => s.state!.events.filter(e => !e.resolved && e.choices?.length).length);

  return (
    <div className="h-full flex flex-col bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden">
      <div className="border-b border-slate-800 flex flex-wrap gap-px bg-slate-950">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[70px] text-[11px] px-2 py-1.5 transition-colors ${
              tab === t.id ? 'bg-rok-blue text-white font-semibold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
            }`}
          >
            {t.icon} {t.label}
            {t.id === 'EVENTS' && pendingCount > 0 && (
              <span className="ml-1 inline-block bg-red-600 text-white text-[9px] px-1 rounded">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tab === 'OVERVIEW'  && <OverviewTab />}
        {tab === 'ECONOMY'   && <EconomyTab />}
        {tab === 'SOCIAL'    && <SocialTab />}
        {tab === 'MILITARY'  && <MilitaryTab />}
        {tab === 'DIPLOMACY' && <DiplomacyTab />}
        {tab === 'POLITICS'  && <PoliticsTab />}
        {tab === 'CABINET'   && <CabinetTab />}
        {tab === 'ASSEMBLY'  && <AssemblyTab />}
        {tab === 'JUDICIARY' && <JudiciaryTab />}
        {tab === 'EVENTS'    && <EventsTab />}
        {tab === 'INTL'      && <InternationalTab />}
        {tab === 'MEDIA'     && <MediaTab />}
        {tab === 'SNS'       && <SnsTab />}
      </div>
    </div>
  );
}

// ============== 종합 ==============
function OverviewTab() {
  const s = useGame(st => st.state)!;
  return (
    <>
      <Panel title="국가 개요">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Stat label="대통령" value={s.president.name} />
          <Stat label="소속 정당" value={s.parties.find(p => p.id === s.president.party)?.name ?? ''} />
          <Stat label="취임일" value={s.president.inauguratedAt} />
          <Stat label="현재일자" value={s.clock.currentDate} />
          <Stat label="임기" value={`${(s.clock.daysInOffice / 365).toFixed(2)}년 / 5년`} />
          <Stat label="총 인구" value={`${fmtInt(s.social.totalPopulation)}만명`} />
          <Stat label="GDP (명목)" value={`${fmtInt(s.economy.gdpNominal)}조원`} />
          <Stat label="1인당 GDP" value={`$${fmtInt(s.economy.gdpPerCapita)}`} />
          <Stat label="국가신용등급" value="AA (S&P)" />
          <Stat label="군사력 (GFP)" value={`세계 ${s.security.globalFireRank}위`} />
        </div>
      </Panel>
      <Panel title="핵심 지표 한눈에">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="지지율" value={`${s.approval.overall.toFixed(1)}%`} tone={s.approval.overall >= 50 ? 'good' : s.approval.overall >= 30 ? 'warn' : 'bad'} />
          <MiniStat label="물가" value={`${s.economy.inflation.toFixed(1)}%`} tone={Math.abs(s.economy.inflation - 2) < 0.7 ? 'good' : 'warn'} />
          <MiniStat label="실업률" value={`${s.economy.unemployment.toFixed(1)}%`} tone={s.economy.unemployment <= 3.5 ? 'good' : 'warn'} />
          <MiniStat label="GDP성장" value={`${s.economy.gdpGrowth.toFixed(1)}%`} tone={s.economy.gdpGrowth >= 2 ? 'good' : s.economy.gdpGrowth >= 0 ? 'warn' : 'bad'} />
          <MiniStat label="코스피" value={fmtInt(s.economy.kospi)} tone="neutral" />
          <MiniStat label="환율" value={`₩${fmtInt(s.economy.fxUsdKrw)}`} tone="neutral" />
          <MiniStat label="DEFCON" value={String(s.security.defconLevel)} tone={s.security.defconLevel >= 4 ? 'good' : 'bad'} />
          <MiniStat label="北 긴장" value={`${s.security.northKoreaTension}`} tone={s.security.northKoreaTension < 50 ? 'good' : 'bad'} />
          <MiniStat label="출산율" value={s.social.birthRate.toFixed(2)} tone={s.social.birthRate >= 1.0 ? 'good' : 'bad'} />
          <MiniStat label="자살률" value={s.social.suicideRate.toFixed(1)} tone={s.social.suicideRate <= 20 ? 'good' : 'bad'} />
          <MiniStat label="여당 의석" value={`${s.assembly.rulingCoalitionSeats}/300`} tone={s.assembly.rulingCoalitionSeats >= 151 ? 'good' : 'warn'} />
          <MiniStat label="SNS 정서" value={`${s.sns.sentimentScore > 0 ? '+' : ''}${s.sns.sentimentScore}`} tone={s.sns.sentimentScore >= 0 ? 'good' : 'bad'} />
        </div>
      </Panel>
      <Panel title="대통령 프로필">
        <div className="text-xs space-y-1">
          <Stat label="생년월일" value={s.president.birthDate} />
          <Stat label="출생지"   value={s.president.birthplace} />
          <Stat label="신장/체중" value={`${s.president.height}cm / ${s.president.weight}kg`} />
          <Stat label="혈액형/MBTI" value={`${s.president.bloodType} / ${s.president.mbti ?? '-'}`} />
          <Stat label="종교"     value={s.president.religion} />
          <Stat label="자산"     value={`${s.president.assets}억원`} />
          <Stat label="건강"     value={s.president.healthStatus} />
          <div className="pt-1 border-t border-slate-800 mt-1">
            <div className="text-[10px] text-slate-500">슬로건</div>
            <div className="text-slate-200 italic">"{s.president.slogan}"</div>
          </div>
          <details>
            <summary className="text-[10px] text-slate-400 cursor-pointer">학력 ▾</summary>
            <ul className="mt-1 space-y-0.5 text-[11px]">
              {s.president.education.map((e, i) => (
                <li key={i}>· {e.school} {e.major && `(${e.major})`} {e.level} {e.year}</li>
              ))}
            </ul>
          </details>
          <details>
            <summary className="text-[10px] text-slate-400 cursor-pointer">경력 ▾</summary>
            <ul className="mt-1 space-y-0.5 text-[11px]">
              {s.president.career.map((c, i) => (
                <li key={i}>· [{c.period}] {c.position} — {c.org}</li>
              ))}
            </ul>
          </details>
        </div>
      </Panel>
    </>
  );
}

// ============== 경제 ==============
function EconomyTab() {
  const e = useGame(s => s.state!.economy);
  return (
    <>
      <Panel title="거시지표">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="GDP성장률 (YoY)" value={fmtPct(e.gdpGrowth)} color={e.gdpGrowth >= 2 ? 'text-emerald-400' : 'text-yellow-400'} />
          <Stat label="GDP (명목)" value={`${fmtInt(e.gdpNominal)}조원`} />
          <Stat label="1인당 GDP" value={`$${fmtInt(e.gdpPerCapita)}`} />
          <Stat label="1인당 GNI" value={`$${fmtInt(e.gniPerCapita)}`} />
          <Stat label="물가 (CPI)" value={fmtPct(e.inflation)} />
          <Stat label="근원물가" value={fmtPct(e.coreInflation)} />
          <Stat label="생산자물가 PPI" value={fmtPct(e.ppi)} />
          <Stat label="신선식품" value={fmtPct(e.groceryInflation)} />
        </div>
      </Panel>
      <Panel title="고용·노동">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="실업률" value={fmtPct(e.unemployment)} />
          <Stat label="청년실업률" value={fmtPct(e.youthUnemployment)} />
          <Stat label="고용률" value={fmtPct(e.employmentRate)} />
          <Stat label="경제활동참가율" value={fmtPct(e.laborParticipation)} />
        </div>
      </Panel>
      <Panel title="금리·통화">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="한은 기준금리" value={fmtPct(e.baseRate, 2)} />
          <Stat label="CD 91일물" value={fmtPct(e.cd91, 2)} />
          <Stat label="국고채 10년" value={fmtPct(e.treasury10y, 2)} />
          <Stat label="M2 증가율" value={fmtPct(e.m2Growth)} />
        </div>
      </Panel>
      <Panel title="외환·시장">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="USD/KRW" value={`₩${fmtInt(e.fxUsdKrw)}`} />
          <Stat label="100JPY/KRW" value={`₩${fmtNum(e.fxJpyKrw, 2)}`} />
          <Stat label="CNY/KRW" value={`₩${fmtNum(e.fxCnyKrw, 2)}`} />
          <Stat label="EUR/KRW" value={`₩${fmtInt(e.fxEurKrw)}`} />
          <Stat label="코스피" value={fmtInt(e.kospi)} />
          <Stat label="코스닥" value={fmtInt(e.kosdaq)} />
          <Stat label="KOSPI200" value={fmtInt(e.kospi200)} />
          <Stat label="VKOSPI" value={fmtNum(e.vkospi, 1)} />
          <Stat label="시가총액" value={`${fmtInt(e.marketCap)}조`} />
          <Stat label="외환보유고" value={`${fmtInt(e.fxReserves)}억$`} />
        </div>
        <div className="h-24 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={e.history}>
              <XAxis dataKey="date" hide />
              <YAxis yAxisId="k" hide domain={['dataMin - 50', 'dataMax + 50']} />
              <YAxis yAxisId="f" orientation="right" hide domain={['dataMin - 20', 'dataMax + 20']} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11 }} />
              <Line yAxisId="k" type="monotone" dataKey="kospi" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="코스피" />
              <Line yAxisId="f" type="monotone" dataKey="fxUsdKrw" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="환율" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel title="무역·국제수지">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="수출 YoY" value={fmtPct(e.exportYoY)} />
          <Stat label="수입 YoY" value={fmtPct(e.importYoY)} />
          <Stat label="무역수지" value={`${fmtInt(e.tradeBalance)}억$`} />
          <Stat label="경상수지" value={`${fmtInt(e.currentAccount)}억$`} />
          <Stat label="FDI 유입" value={`${fmtInt(e.fdiInflow)}억$`} />
        </div>
        <div className="mt-2 text-[10px] text-slate-500 mb-1">주요 산업 수출 (억$/연)</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <Stat label="반도체" value={fmtInt(e.semiconductorExport)} />
          <Stat label="자동차" value={fmtInt(e.autoExport)} />
          <Stat label="선박" value={fmtInt(e.shipExport)} />
          <Stat label="철강" value={fmtInt(e.steelExport)} />
        </div>
      </Panel>
      <Panel title="재정·부채">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="재정수지/GDP" value={fmtPct(e.fiscalBalance)} />
          <Stat label="기초재정수지" value={fmtPct(e.primaryBalance)} />
          <Stat label="국가채무/GDP" value={fmtPct(e.nationalDebt)} />
          <Stat label="정부총지출" value={`${fmtInt(e.governmentSpending)}조`} />
          <Stat label="가계부채/GDP" value={fmtPct(e.householdDebt)} />
          <Stat label="가계부채 절대" value={`${fmtInt(e.householdDebtAbs)}조`} />
          <Stat label="기업부채/GDP" value={fmtPct(e.corporateDebt)} />
        </div>
      </Panel>
      <Panel title="주택·심리">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="주택가격지수" value={fmtNum(e.housePriceIndex, 1)} />
          <Stat label="주택 YoY" value={fmtPct(e.housePriceYoY)} />
          <Stat label="전세지수" value={fmtNum(e.jeonseIndex, 1)} />
          <Stat label="전세 YoY" value={fmtPct(e.jeonseYoY)} />
          <Stat label="주택공급" value={`${fmtNum(e.housingSupply, 1)}만호`} />
          <Stat label="소비심리 CCSI" value={fmtNum(e.consumerConfidence, 0)} />
          <Stat label="기업심리 BSI" value={fmtNum(e.businessConfidence, 0)} />
          <Stat label="경제심리 ESI" value={fmtNum(e.economicSentimentIndex, 0)} />
        </div>
      </Panel>
    </>
  );
}

// ============== 사회 ==============
function SocialTab() {
  const s = useGame(st => st.state!.social);
  return (
    <>
      <Panel title="인구">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="총 인구" value={`${fmtInt(s.totalPopulation)}만명`} />
          <Stat label="인구증감 YoY" value={fmtPct(s.populationGrowth, 2)} color={s.populationGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <Stat label="합계출산율" value={fmtNum(s.birthRate, 2)} color={s.birthRate >= 1.0 ? 'text-emerald-400' : 'text-red-400'} />
          <Stat label="조사망률" value={`${fmtNum(s.deathRate, 1)}‰`} />
          <Stat label="혼인율" value={`${fmtNum(s.marriageRate, 1)}‰`} />
          <Stat label="이혼율" value={`${fmtNum(s.divorceRate, 1)}‰`} />
          <Stat label="노령화지수" value={fmtNum(s.agingIndex, 1)} />
          <Stat label="중위연령" value={`${fmtNum(s.medianAge, 1)}세`} />
          <Stat label="외국인" value={`${fmtInt(s.immigrantPopulation)}만명`} />
        </div>
      </Panel>
      <Panel title="안전·건강">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="자살률" value={`${fmtNum(s.suicideRate, 1)}/10만`} />
          <Stat label="강력범죄" value={`${fmtNum(s.violentCrimeRate, 1)}/10만`} />
          <Stat label="범죄지수" value={fmtNum(s.crimeIndex, 0)} />
          <Stat label="교통사망(누계)" value={fmtInt(s.trafficDeaths)} />
          <Stat label="마약범죄(누계)" value={fmtInt(s.drugCrimeCount)} />
          <Stat label="PM2.5" value={`${fmtNum(s.airQualityPM25, 0)}㎍`} />
        </div>
      </Panel>
      <Panel title="만족도 / 신뢰">
        <StatBar label="의료 만족도"   value={s.healthcareSatisfaction}    valueLabel={fmtPct(s.healthcareSatisfaction, 0)} />
        <StatBar label="교육 만족도"   value={s.educationSatisfaction}     valueLabel={fmtPct(s.educationSatisfaction, 0)} />
        <StatBar label="연금 신뢰도"   value={s.pensionTrust}              valueLabel={fmtPct(s.pensionTrust, 0)} />
        <StatBar label="치안 만족도"   value={s.publicSafetySatisfaction}  valueLabel={fmtPct(s.publicSafetySatisfaction, 0)} />
        <StatBar label="정부 신뢰도"   value={s.governmentTrust}           valueLabel={fmtPct(s.governmentTrust, 0)} />
      </Panel>
      <Panel title="사회 갈등">
        <StatBar label="젠더 갈등"   value={s.genderConflictIndex}     valueLabel={fmtNum(s.genderConflictIndex, 0)} inverted />
        <StatBar label="세대 갈등"   value={s.generationConflictIndex} valueLabel={fmtNum(s.generationConflictIndex, 0)} inverted />
        <StatBar label="지역 갈등"   value={s.regionalConflictIndex}   valueLabel={fmtNum(s.regionalConflictIndex, 0)} inverted />
        <StatBar label="계층 갈등"   value={s.classConflictIndex}      valueLabel={fmtNum(s.classConflictIndex, 0)} inverted />
        <div className="mt-2 text-[10px] text-slate-500">이민 수용 정서 ({s.immigrationSentiment > 0 ? '+' : ''}{s.immigrationSentiment})</div>
        <div className="bar-bg h-1.5 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
          <div className={`bar-fill ${s.immigrationSentiment >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{ width: `${Math.abs(s.immigrationSentiment) / 2}%`,
              marginLeft: s.immigrationSentiment >= 0 ? '50%' : `${50 - Math.abs(s.immigrationSentiment) / 2}%` }} />
        </div>
      </Panel>
      <Panel title="국제 비교">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="언론자유 (RSF)" value={fmtNum(s.pressFreedomIndex, 1)} sub="↓좋음" />
          <Stat label="부패인식 (CPI)" value={fmtInt(s.corruptionPerceptionIndex)} sub="↑좋음" />
          <Stat label="민주주의 (EIU)" value={fmtNum(s.democracyIndex, 2)} />
          <Stat label="지니계수" value={fmtNum(s.giniIndex, 3)} />
          <Stat label="상대빈곤율" value={fmtPct(s.povertyRate)} />
        </div>
      </Panel>
      <Panel title="환경·에너지">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="탄소배출량" value={`${fmtInt(s.carbonEmission)}백만톤`} />
          <Stat label="재생에너지 비중" value={fmtPct(s.greenEnergyShare)} />
        </div>
      </Panel>
      <Panel title="교육·주거">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="대학진학률" value={fmtPct(s.collegeAdmissionRate)} />
          <Stat label="사교육비/연" value={`${fmtNum(s.privateEduSpending, 1)}조`} />
          <Stat label="주거 취약도" value={fmtNum(s.housingAffordability, 0)} />
        </div>
      </Panel>
    </>
  );
}

// ============== 군사 ==============
function MilitaryTab() {
  const s = useGame(st => st.state!.security);
  const defconColor = s.defconLevel <= 2 ? 'text-red-400' : s.defconLevel <= 3 ? 'text-orange-400' : 'text-emerald-400';
  return (
    <>
      <Panel title="비상 태세">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">DEFCON</div>
            <div className={`text-3xl font-bold ${defconColor}`}>{s.defconLevel}</div>
            <div className="text-[10px] text-slate-500">
              {s.defconLevel === 5 ? '평시' : s.defconLevel === 4 ? '주의' : s.defconLevel === 3 ? '경계' : s.defconLevel === 2 ? '준전시' : '전쟁임박'}
            </div>
          </div>
          <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">WATCHCON (대북정보)</div>
            <div className="text-3xl font-bold text-orange-300">{s.watchcon}</div>
          </div>
        </div>
      </Panel>
      <Panel title="위협도">
        <StatBar label="북한 긴장도"        value={s.northKoreaTension}         valueLabel={fmtPct(s.northKoreaTension, 0)} inverted />
        <StatBar label="북한 도발 위험"     value={s.northKoreaProvocationRisk} valueLabel={fmtPct(s.northKoreaProvocationRisk, 0)} inverted />
        <StatBar label="사이버 위협"        value={s.cyberThreatLevel}          valueLabel={fmtPct(s.cyberThreatLevel, 0)} inverted />
        <StatBar label="테러 위협"          value={s.terrorThreatLevel}         valueLabel={fmtPct(s.terrorThreatLevel, 0)} inverted />
      </Panel>
      <Panel title="국군 전력">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="현역" value={`${s.troopsActive}만명`} />
          <Stat label="예비역" value={`${s.troopsReserve}만명`} />
          <Stat label="국방예산" value={`${fmtNum(s.defenseBudget, 1)}조`} />
          <Stat label="국방비/GDP" value={fmtPct(s.defenseBudgetPctGdp)} />
          <Stat label="GFP 순위" value={`세계 ${s.globalFireRank}위`} />
          <Stat label="군 준비태세" value={`${s.rokMilitaryReadiness}/100`} />
        </div>
        <div className="mt-2 text-[10px] text-slate-500 mb-1">주요 장비</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <Stat label="전차" value={fmtInt(s.tanks)} />
          <Stat label="항공기" value={fmtInt(s.aircraft)} />
          <Stat label="함정" value={fmtInt(s.warships)} />
          <Stat label="잠수함" value={fmtInt(s.submarines)} />
          <Stat label="탄도미사일" value={fmtInt(s.missilesBallistic)} />
          <Stat label="핵보유" value={s.nukesAvailable ? '예' : '없음'} color={s.nukesAvailable ? 'text-red-400' : ''} />
        </div>
      </Panel>
      <Panel title="동맹·연합">
        <Stat label="한미동맹 결속도" value={`${s.usAllianceStrength}/100`} />
        <Stat label="주한미군" value={`${fmtInt(s.usftKorea)}명`} />
        <Stat label="NATO 파트너십" value={`${s.natoPartnership}/100`} />
      </Panel>
      <Panel title="북한 군사력 (추정)">
        <Stat label="핵탄두 추정" value={`${s.northKoreaNukes}기`} color="text-red-400" />
        <Stat label="올해 미사일 발사" value={`${s.northKoreaMissilesYear}회`} />
        <div className="text-[10px] text-slate-500 mt-2">
          ※ 김정은 "대남 적대 2국가" 노선 고착. 북러 군사협력 심화로 ICBM 기술 진전 우려.
        </div>
      </Panel>
    </>
  );
}

// ============== 외교 ==============
function DiplomacyTab() {
  const foreign = useGame(s => s.state!.foreign);
  const [pickedId, setPicked] = useState<CountryId | null>(null);
  const picked = foreign.find(f => f.id === pickedId);
  const allianceColor = (a: string) => ({
    ALLY: 'text-blue-300', PARTNER: 'text-emerald-300', NEUTRAL: 'text-slate-300',
    RIVAL: 'text-orange-300', HOSTILE: 'text-red-300',
  } as any)[a];
  const allianceLabel = (a: string) => ({ ALLY: '동맹', PARTNER: '파트너', NEUTRAL: '중립', RIVAL: '경쟁', HOSTILE: '적대' } as any)[a];
  return (
    <>
      <Panel title="국가 관계 (클릭하여 상세)">
        <div className="grid grid-cols-2 gap-1">
          {foreign.map(f => (
            <button key={f.id} onClick={() => setPicked(f.id)}
              className={`text-left bg-slate-950/40 border rounded p-1.5 hover:border-blue-500 ${pickedId === f.id ? 'border-blue-500' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{f.flag} {f.name}</span>
                <span className={`text-[10px] ${f.relation >= 0 ? 'text-emerald-300' : 'text-red-300'} font-mono`}>{f.relation > 0 ? '+' : ''}{f.relation}</span>
              </div>
              <div className="text-[10px] text-slate-500">{f.leader} · <span className={allianceColor(f.alliance)}>{allianceLabel(f.alliance)}</span></div>
              <div className="bar-bg h-1 mt-1 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
                <div className={`bar-fill ${f.relation >= 50 ? 'bg-emerald-500' : f.relation >= 0 ? 'bg-lime-500' : f.relation >= -40 ? 'bg-orange-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.abs(f.relation) / 2}%`, marginLeft: f.relation >= 0 ? '50%' : `${50 - Math.abs(f.relation) / 2}%` }} />
              </div>
            </button>
          ))}
        </div>
      </Panel>
      {picked && (
        <Panel title={`${picked.flag} ${picked.name} 상세`}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            <Stat label="현지명" value={picked.nameLocal ?? '-'} />
            <Stat label="수도"   value={picked.capital} />
            <Stat label="정상"   value={`${picked.leader} (${picked.leaderTitle})`} />
            <Stat label="인구"   value={`${fmtInt(picked.population)}만`} />
            <Stat label="GDP"    value={`$${fmtNum(picked.gdp, 1)}조`} />
            {picked.militaryRank && <Stat label="군사력 (GFP)" value={`${picked.militaryRank}위`} />}
            <Stat label="핵보유" value={picked.nuclear ? '예' : '아니오'} color={picked.nuclear ? 'text-red-400' : ''} />
            <Stat label="UNSC 상임" value={picked.unscPermanent ? '예' : '아니오'} />
            <Stat label="동맹지위" value={<span className={allianceColor(picked.alliance)}>{allianceLabel(picked.alliance)}</span>} />
            <Stat label="FTA"     value={picked.hasFTA ? '체결' : '없음'} />
            <Stat label="무비자"  value={picked.visaFreeKorean ? '가능' : '불가'} />
            <Stat label="교민"    value={`${fmtNum(picked.koreanResidents, 1)}만`} />
            <Stat label="교역"    value={`${fmtInt(picked.tradeVolume)}억$`} />
            <Stat label="대韓수출" value={`${fmtInt(picked.exportTo)}억$`} />
            <Stat label="대韓수입" value={`${fmtInt(picked.importFrom)}억$`} />
            <Stat label="관계점수" value={`${picked.relation > 0 ? '+' : ''}${picked.relation}`} />
            <Stat label="신뢰도"   value={`${picked.trustLevel}/100`} />
          </div>
          <div className="mt-2 text-[10px] text-slate-500">조약·협정</div>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {picked.treaties.map((t, i) => <Chip key={i}>{t}</Chip>)}
          </div>
          <div className="mt-2 text-[10px] text-slate-500">최근 이슈</div>
          <ul className="text-[11px] text-slate-300 mt-0.5 space-y-0.5">
            {picked.recentEvents.map((r, i) => <li key={i}>· {r}</li>)}
          </ul>
        </Panel>
      )}
    </>
  );
}

// ============== 정치 (정당, 대선/총선, 여론) ==============
function PoliticsTab() {
  const state = useGame(s => s.state)!;
  const { parties, assembly, president, approval } = state;
  return (
    <>
      <Panel title="정당 지형 (제22대 국회)">
        <div className="space-y-1.5">
          {parties.map(p => (
            <div key={p.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="w-2 h-2 rounded" style={{ background: p.color }} />
                  <span className={p.id === president.party ? 'font-bold text-white' : 'text-slate-200'}>{p.name}</span>
                  {p.id === president.party && <Chip color="text-blue-200 bg-blue-900/40 border-blue-700">여당</Chip>}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{p.seats}석 ({Math.round(p.seats / 300 * 100)}%)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] mt-1 text-slate-400">
                <span>대표: <span className="text-slate-200">{p.leader}</span></span>
                <span>창당: <span className="text-slate-200">{p.founded}</span></span>
                <span>지지율: <span className="text-slate-200">{p.supportRate}%</span></span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{p.description}</div>
              <div className="mt-1 bar-bg h-1 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
                <div className={`bar-fill ${p.ideology < 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.abs(p.ideology) / 2}%`,
                    marginLeft: p.ideology < 0 ? `${50 - Math.abs(p.ideology) / 2}%` : '50%' }} />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                <span>진보 ←</span>
                <span>이념 {p.ideology > 0 ? '+' : ''}{p.ideology}</span>
                <span>→ 보수</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="원내 의석 분포">
        <div className="flex h-4 rounded overflow-hidden border border-slate-700 mb-2">
          {parties.map(p => {
            const s = assembly.bySeat[p.id] ?? 0;
            if (!s) return null;
            return <div key={p.id} style={{ width: `${(s / 300) * 100}%`, background: p.color }} title={`${p.name} ${s}석`} />;
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><div className="text-[10px] text-slate-500">여당</div><div className="font-mono text-blue-300">{assembly.rulingCoalitionSeats}석</div></div>
          <div className="text-center"><div className="text-[10px] text-slate-500">의결정족수</div><div className="font-mono">151</div></div>
          <div className="text-right"><div className="text-[10px] text-slate-500">야권</div><div className="font-mono text-red-300">{assembly.oppositionSeats}석</div></div>
        </div>
        {assembly.rulingCoalitionSeats < 151 && (
          <div className="mt-2 text-[10px] text-orange-400 bg-orange-950/30 border border-orange-900 rounded px-2 py-1">
            ⚠ 여소야대 — 정부 법안 통과에 야당 협조 필수
          </div>
        )}
      </Panel>
      <Panel title="지역 정치 (광역단체장)">
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          {state.regions.map(r => {
            const party = parties.find(x => x.id === r.governorParty);
            return (
              <div key={r.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 flex items-center justify-between">
                <div>
                  <div className="text-slate-200">{r.name}</div>
                  <div className="text-[10px] text-slate-500">{r.governor} · 지지 {Math.round(approval.byRegion[r.id])}%</div>
                </div>
                <span className="w-2 h-2 rounded" style={{ background: party?.color }} title={party?.name} />
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

// ============== 행정부 ==============
function CabinetTab() {
  const state = useGame(s => s.state)!;
  const patch = useGame(s => s.patch);
  const [filter, setFilter] = useState('');
  const cab = state.cabinet.filter(o => o.name.includes(filter) || o.ministryName.includes(filter));
  const replace = (id: string) => {
    patch(s => ({
      ...s,
      cabinet: s.cabinet.map(o => o.id === id ? {
        ...o, id: genId('off'), name: randomKoreanName(),
        loyalty: 60 + Math.floor(Math.random() * 35),
        competence: 50 + Math.floor(Math.random() * 45),
        publicFavor: 35 + Math.floor(Math.random() * 35),
        scandalRisk: Math.floor(Math.random() * 20),
        appointedAt: s.clock.currentDate,
      } : o),
    }));
  };
  const groups: Record<string, typeof state.cabinet> = {};
  for (const o of cab) {
    const cat = MINISTRY_CATEGORY[o.ministry] ?? '기타';
    (groups[cat] ??= []).push(o);
  }
  return (
    <>
      <Panel title={`행정부 인사 (${state.cabinet.length}명)`} right={
        <input className="input text-[10px] py-0.5 px-1.5 w-24" placeholder="검색" value={filter} onChange={e => setFilter(e.target.value)} />
      }>
        <div className="space-y-2">
          {Object.entries(groups).map(([cat, items]) => (
            <div key={cat}>
              <div className="text-[10px] text-slate-500 mb-1">{cat}</div>
              <div className="space-y-1">
                {items.map(o => (
                  <div key={o.id} className="bg-slate-950/40 border border-slate-800 rounded px-2 py-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200">{o.name} <span className="text-[10px] text-slate-500">({o.age}세)</span></div>
                        <div className="text-[10px] text-slate-500">{o.ministryName} · {o.education}</div>
                      </div>
                      <button onClick={() => replace(o.id)} className="text-[10px] text-orange-400 hover:text-orange-300">교체</button>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1 text-[10px]">
                      <div><span className="text-slate-500">충성</span> <span className="font-mono">{o.loyalty}</span></div>
                      <div><span className="text-slate-500">능력</span> <span className="font-mono">{o.competence}</span></div>
                      <div><span className="text-slate-500">여론</span> <span className="font-mono">{o.publicFavor}</span></div>
                      <div className={o.scandalRisk > 50 ? 'text-red-400' : 'text-slate-500'}>
                        <span>리스크</span> <span className="font-mono">{o.scandalRisk}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ============== 국회 ==============
function AssemblyTab() {
  const a = useGame(s => s.state!.assembly);
  const parties = useGame(s => s.state!.parties);
  return (
    <>
      <Panel title="국회 (제22대 · 300석)" right={<span className="text-[10px] text-slate-500">의장 {a.speaker.name}</span>}>
        <div className="flex h-3 rounded overflow-hidden border border-slate-700 mb-2">
          {parties.map(p => {
            const s = a.bySeat[p.id] ?? 0;
            if (!s) return null;
            return <div key={p.id} style={{ width: `${(s / 300) * 100}%`, background: p.color }} title={`${p.name} ${s}석`} />;
          })}
        </div>
        <Stat label="국회의장" value={`${a.speaker.name} (${a.speaker.party})`} />
        {a.deputySpeakers.map((d, i) => <Stat key={i} label={`부의장 ${i+1}`} value={`${d.name} (${d.party})`} />)}
        <Stat label="여당 의석" value={`${a.rulingCoalitionSeats}/300`} />
        <Stat label="탄핵소추 누계" value={`${a.impeachmentMotions}건`} />
        <Stat label="필리버스터 일수" value={`${a.filibusterDays}일`} />
      </Panel>
      <Panel title={`상임위원회 (${a.committees.length}개)`}>
        <div className="space-y-1 text-xs">
          {a.committees.map(c => {
            const party = parties.find(p => p.id === c.chairParty);
            return (
              <div key={c.name} className="bg-slate-950/40 border border-slate-800 rounded px-2 py-1.5 flex items-center justify-between">
                <div>
                  <div className="text-slate-200">{c.name}</div>
                  <div className="text-[10px] text-slate-500">위원장 {c.chair} · {c.membersCount}명</div>
                </div>
                <span className="w-2 h-2 rounded" style={{ background: party?.color }} />
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

// ============== 사법부 ==============
function JudiciaryTab() {
  const j = useGame(s => s.state!.judiciary);
  return (
    <>
      <Panel title="대법원">
        <Stat label="대법원장" value={j.supremeCourt.chiefJustice} />
        <Stat label="대법관" value={`${j.supremeCourt.justices.length}명`} />
        <StatBar label="대국민 신뢰도" value={j.supremeCourt.publicTrust} valueLabel={`${j.supremeCourt.publicTrust}%`} />
        <details className="mt-2">
          <summary className="text-[11px] text-slate-400 cursor-pointer">대법관 명단 ▾</summary>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] mt-1">
            {j.supremeCourt.justices.map(jc => (
              <div key={jc.name} className="flex justify-between">
                <span>{jc.name}</span>
                <span className={`text-[10px] ${jc.ideology < 0 ? 'text-blue-300' : 'text-red-300'}`}>{jc.appointedBy}</span>
              </div>
            ))}
          </div>
        </details>
        <div className="mt-2 text-[10px] text-slate-500">계류 주요 사건</div>
        <ul className="text-[11px] text-slate-300 space-y-0.5">
          {j.supremeCourt.pendingMajorCases.map((c, i) => <li key={i}>· {c}</li>)}
        </ul>
      </Panel>
      <Panel title="헌법재판소">
        <Stat label="소장" value={j.constitutionalCourt.chief} />
        <Stat label="재판관" value={`${j.constitutionalCourt.justices.length}명`} />
        <StatBar label="대국민 신뢰도" value={j.constitutionalCourt.publicTrust} valueLabel={`${j.constitutionalCourt.publicTrust}%`} />
        <details className="mt-2">
          <summary className="text-[11px] text-slate-400 cursor-pointer">재판관 명단 ▾</summary>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] mt-1">
            {j.constitutionalCourt.justices.map(jc => (
              <div key={jc.name} className="flex justify-between">
                <span>{jc.name}</span>
                <span className={`text-[10px] ${jc.ideology < 0 ? 'text-blue-300' : 'text-red-300'}`}>{jc.appointedBy}</span>
              </div>
            ))}
          </div>
        </details>
        <div className="mt-2 text-[10px] text-slate-500">계류 사건</div>
        <ul className="text-[11px] text-slate-300 space-y-0.5">
          {j.constitutionalCourt.pendingCases.map((c, i) => <li key={i}>· {c}</li>)}
        </ul>
      </Panel>
      <Panel title="검찰">
        <Stat label="검찰총장" value={j.prosecution.prosecutorGeneral} />
        <StatBar label="신뢰도" value={j.prosecution.publicTrust} valueLabel={`${j.prosecution.publicTrust}%`} />
        <StatBar label="정치적 독립성" value={j.prosecution.independenceIndex} valueLabel={`${j.prosecution.independenceIndex}%`} />
        <div className="mt-2 text-[10px] text-slate-500">진행 중인 주요 수사</div>
        <ul className="text-[11px] text-slate-300 space-y-0.5">
          {j.prosecution.activeMajorInvestigations.map((c, i) => <li key={i}>· {c}</li>)}
        </ul>
      </Panel>
      <Panel title="경찰">
        <Stat label="경찰청장" value={j.police.commissioner} />
        <StatBar label="신뢰도" value={j.police.publicTrust} valueLabel={`${j.police.publicTrust}%`} />
      </Panel>
      <Panel title="최근 주요 판결">
        <ul className="space-y-1 text-[11px]">
          {j.rulings.map((r, i) => (
            <li key={i} className="bg-slate-950/40 border border-slate-800 rounded p-1.5">
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>{r.date}</span><span>{r.court}</span>
              </div>
              <div className="text-slate-200">{r.summary}</div>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

// ============== 사건 로그 ==============
function EventsTab() {
  const events = useGame(s => s.state!.events);
  const select = useGame(s => s.selectEvent);
  const dismiss = useGame(s => s.dismissEvent);
  const [tab, setTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const list = tab === 'PENDING'
    ? events.filter(e => !e.resolved)
    : events;
  return (
    <Panel title={`사건 / 뉴스 (총 ${events.length}건)`}
      right={
        <div className="flex gap-1">
          <button onClick={() => setTab('PENDING')} className={`text-[10px] px-1.5 py-0.5 rounded ${tab === 'PENDING' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>대기</button>
          <button onClick={() => setTab('ALL')} className={`text-[10px] px-1.5 py-0.5 rounded ${tab === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>전체</button>
        </div>
      }>
      <div className="space-y-1.5">
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

// ============== 국제 정세 ==============
function InternationalTab() {
  const i = useGame(s => s.state!.international);
  return (
    <>
      <Panel title="세계 경제">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="세계 GDP 성장" value={fmtPct(i.globalEconomy.worldGdpGrowth)} />
          <Stat label="미국 성장" value={fmtPct(i.globalEconomy.usGrowth)} />
          <Stat label="중국 성장" value={fmtPct(i.globalEconomy.chinaGrowth)} />
          <Stat label="EU 성장" value={fmtPct(i.globalEconomy.euGrowth)} />
          <Stat label="WTI 유가" value={`$${fmtNum(i.globalEconomy.oilPriceWTI, 1)}`} />
          <Stat label="Brent 유가" value={`$${fmtNum(i.globalEconomy.oilPriceBrent, 1)}`} />
          <Stat label="금" value={`$${fmtInt(i.globalEconomy.goldPrice)}/oz`} />
          <Stat label="달러인덱스 DXY" value={fmtNum(i.globalEconomy.dxy, 1)} />
        </div>
      </Panel>
      <Panel title="글로벌 증시">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="S&P 500" value={fmtInt(i.sp500)} />
          <Stat label="Nasdaq" value={fmtInt(i.nasdaq)} />
          <Stat label="니케이225" value={fmtInt(i.nikkei)} />
          <Stat label="항셍" value={fmtInt(i.hangseng)} />
          <Stat label="상하이종합" value={fmtInt(i.shanghai)} />
          <Stat label="비트코인" value={`$${fmtInt(i.bitcoin)}`} />
        </div>
      </Panel>
      <Panel title={`진행 중 분쟁 (${i.ongoingConflicts.length}건)`}>
        <div className="space-y-1.5">
          {i.ongoingConflicts.map(c => (
            <div key={c.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{c.name}</span>
                <Chip color={c.status === 'ACTIVE' ? 'text-red-300 border-red-700 bg-red-900/30' : 'text-yellow-300 border-yellow-700 bg-yellow-900/30'}>{c.status}</Chip>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">참여: {c.parties.join(', ')} · 시작 {c.startDate}</div>
              <StatBar label="강도" value={c.intensity} valueLabel={`${c.intensity}`} inverted />
              <div className="text-[11px] text-slate-300 mt-1">{c.description}</div>
              <div className="text-[10px] text-blue-300 mt-1">한국 개입: {c.koreaInvolvement}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="현재 글로벌 이슈">
        <ul className="text-[11px] text-slate-300 space-y-0.5">
          {i.globalIssues.map((g, idx) => <li key={idx}>· {g}</li>)}
        </ul>
      </Panel>
    </>
  );
}

// ============== 언론 ==============
function MediaTab() {
  const media = useGame(s => s.state!.media);
  const groups: Record<string, typeof media> = {};
  for (const m of media) (groups[m.type] ??= []).push(m);
  return (
    <Panel title={`언론 매체 (${media.length}개)`}>
      <div className="space-y-3">
        {Object.entries(groups).map(([type, items]) => (
          <div key={type}>
            <div className="text-[10px] text-slate-500 mb-1">{type}</div>
            <div className="space-y-1">
              {items.map(m => (
                <div key={m.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-semibold">{m.name}</span>
                    <span className={`text-[10px] ${m.bias < -20 ? 'text-blue-300' : m.bias > 20 ? 'text-red-300' : 'text-slate-400'}`}>
                      {m.bias < -20 ? '진보' : m.bias > 20 ? '보수' : '중도'} ({m.bias > 0 ? '+' : ''}{m.bias})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {m.owner && `${m.owner} · `}
                    {m.circulation && `${m.circulation}만부 · `}
                    {m.viewership && `시청률 ${m.viewership}% · `}
                    영향력 {m.influence}
                  </div>
                  <div className="mt-1 bar-bg h-1 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-500" />
                    <div className={`bar-fill ${m.favorToPresident >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.abs(m.favorToPresident) / 2}%`,
                        marginLeft: m.favorToPresident >= 0 ? '50%' : `${50 - Math.abs(m.favorToPresident) / 2}%` }} />
                  </div>
                  <div className="text-[10px] text-right text-slate-500 mt-0.5">대통령 호의도: {m.favorToPresident > 0 ? '+' : ''}{m.favorToPresident}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ============== SNS ==============
function SnsTab() {
  const sns = useGame(s => s.state!.sns);
  return (
    <>
      <Panel title="여론 모니터링">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">대통령 일일 언급량</div>
            <div className="text-2xl font-bold text-slate-100">{fmtInt(sns.presidentMentions)}만</div>
          </div>
          <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">종합 정서 점수</div>
            <div className={`text-2xl font-bold ${sns.sentimentScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {sns.sentimentScore > 0 ? '+' : ''}{sns.sentimentScore}
            </div>
          </div>
        </div>
        <StatBar label="시위·집회 동력" value={sns.protestSentiment} valueLabel={`${sns.protestSentiment}/100`} inverted />
      </Panel>
      <Panel title={`플랫폼별 (${sns.platforms.length}개)`}>
        <div className="space-y-1">
          {sns.platforms.map(p => (
            <div key={p.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-semibold">{p.name}</span>
                <span className="text-[10px] text-slate-500">{fmtInt(p.monthlyUsers)}만 MAU</span>
              </div>
              <div className="text-[10px] text-slate-500">{p.mainAge} · {p.desc}</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <div className="text-[10px] text-slate-500">평균 성향</div>
                  <div className="bar-bg h-1 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-500" />
                    <div className={`bar-fill ${p.bias < 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.abs(p.bias) / 2}%`,
                        marginLeft: p.bias < 0 ? `${50 - Math.abs(p.bias) / 2}%` : '50%' }} />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">대통령 호감</div>
                  <div className="bar-bg h-1 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-500" />
                    <div className={`bar-fill ${p.presidentFavor < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.abs(p.presidentFavor) / 2}%`,
                        marginLeft: p.presidentFavor < 0 ? `${50 - Math.abs(p.presidentFavor) / 2}%` : '50%' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="실시간 트렌드 키워드">
        <div className="space-y-1">
          {sns.hotKeywords.map(k => (
            <div key={k.keyword} className="flex items-center justify-between text-xs bg-slate-950/40 border border-slate-800 rounded px-2 py-1">
              <span className="text-slate-200">#{k.keyword}</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500">{fmtInt(k.volume)}만건</span>
                <span className={`font-mono text-[10px] ${k.sentiment >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {k.sentiment > 0 ? '+' : ''}{k.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      {sns.recentPosts.length > 0 && (
        <Panel title="최근 인기 게시물">
          <div className="space-y-1">
            {sns.recentPosts.slice(0, 8).map(post => (
              <div key={post.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>[{post.platform}] {post.author}</span>
                  <span className={post.sentiment >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                    {post.sentiment > 0 ? '+' : ''}{post.sentiment}
                  </span>
                </div>
                <div className="text-slate-200">{post.content}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">♥ {fmtInt(post.likes)} · ↻ {fmtInt(post.reposts)}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}

// ====== 작은 유틸 ======
function MiniStat({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const color =
    tone === 'good' ? 'text-emerald-400 border-emerald-900 bg-emerald-950/30' :
    tone === 'warn' ? 'text-yellow-400 border-yellow-900 bg-yellow-950/30' :
    tone === 'bad'  ? 'text-red-400 border-red-900 bg-red-950/30' :
    'text-slate-300 border-slate-800 bg-slate-950/30';
  return (
    <div className={`border rounded p-2 ${color}`}>
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="text-base font-bold font-mono">{value}</div>
    </div>
  );
}
