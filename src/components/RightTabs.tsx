import { useState } from 'react';
import { useGame } from '../store';
import { Panel, Stat, StatBar, Chip } from './common';
import { fmtNum, fmtPct, fmtInt, severityColor, categoryLabel, ageFromBirth } from '../utils/format';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';
import { MINISTRY_CATEGORY } from '../data/ministries';
import { CONTINENT_NAME } from '../data/countries';
import { CONFIRMATION_REQUIRED, NOMINEE_POOL } from '../data/adminBodies';
import type { Continent, MinistryId, BuildingCategory, RegionId, AllianceStatus, WeaponEntry } from '../types/game';

const TABS = [
  { id: 'OVERVIEW',     label: '종합',     icon: '📊' },
  { id: 'ECONOMY',      label: '경제',     icon: '💰' },
  { id: 'SOCIAL',       label: '사회',     icon: '👥' },
  { id: 'MILITARY',     label: '군사',     icon: '🛡️' },
  { id: 'DIPLOMACY',    label: '외교',     icon: '🌐' },
  { id: 'POLITICS',     label: '정치',     icon: '🏛️' },
  { id: 'ADMIN',        label: '행정부',   icon: '🏢' },
  { id: 'ASSEMBLY',     label: '국회',     icon: '🏛️' },
  { id: 'JUDICIARY',    label: '사법부',   icon: '⚖️' },
  { id: 'REGIONS',      label: '행정구역', icon: '🗺️' },
  { id: 'INFRA',        label: '토건',     icon: '🏗️' },
  { id: 'COMPANIES',    label: '기업',     icon: '🏭' },
  { id: 'CULTURE',      label: '문화',     icon: '🎭' },
  { id: 'ELECTIONS',    label: '선거',     icon: '🗳️' },
  { id: 'EVENTS',       label: '사건',     icon: '📜' },
  { id: 'INTL',         label: '국제',     icon: '🌍' },
  { id: 'MEDIA',        label: '언론',     icon: '📰' },
  { id: 'SNS',          label: 'SNS',      icon: '📱' },
] as const;
type TabId = typeof TABS[number]['id'];

export default function RightTabs() {
  const [tab, setTab] = useState<TabId>('OVERVIEW');
  const pendingCount = useGame(s => s.state!.events.filter(e => !e.resolved && (e.choices?.length || e.mandatory)).length);
  return (
    <div className="h-full flex flex-col bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden">
      <div className="border-b border-slate-800 flex flex-wrap gap-px bg-slate-950">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[62px] text-[10px] px-1.5 py-1.5 transition-colors ${
              tab === t.id ? 'bg-rok-blue text-white font-semibold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'}`}>
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
        {tab === 'ADMIN'     && <AdminTab />}
        {tab === 'ASSEMBLY'  && <AssemblyTab />}
        {tab === 'JUDICIARY' && <JudiciaryTab />}
        {tab === 'REGIONS'   && <RegionsTab />}
        {tab === 'INFRA'     && <InfraTab />}
        {tab === 'COMPANIES' && <CompaniesTab />}
        {tab === 'CULTURE'   && <CultureTab />}
        {tab === 'ELECTIONS' && <ElectionsTab />}
        {tab === 'EVENTS'    && <EventsTab />}
        {tab === 'INTL'      && <IntlTab />}
        {tab === 'MEDIA'     && <MediaTab />}
        {tab === 'SNS'       && <SnsTab />}
      </div>
    </div>
  );
}

// ============ 종합 ============
function OverviewTab() {
  const s = useGame(st => st.state)!;
  const p = s.president;
  const age = ageFromBirth(p.birthDate, s.clock.currentDate);
  return (
    <>
      <Panel title="국가 개요">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Stat label="대통령"    value={`${s.president.name} (${age}세)`} />
          <Stat label="소속 정당" value={s.parties.find(p => p.id === s.president.party)?.name ?? ''} />
          <Stat label="취임일"    value={s.president.inauguratedAt} />
          <Stat label="현재일자"  value={s.clock.currentDate} />
          <Stat label="임기"      value={`${(s.clock.daysInOffice / 365).toFixed(2)}년 / 5년`} />
          <Stat label="총 인구"   value={`${fmtInt(s.social.totalPopulation)}만명`} />
          <Stat label="GDP (명목)" value={`$${fmtInt(s.economy.gdpNominalUSD)}B`} sub={`₩${fmtInt(s.economy.gdpNominalKRW)}조`} />
          <Stat label="1인당 GDP"  value={`$${fmtInt(s.economy.gdpPerCapita)}`} />
          <Stat label="국가신용등급" value="AA (S&P)" />
          <Stat label="군사력 (GFP)" value={`세계 ${s.security.globalFireRank}위`} />
          <Stat label="국고 잔액"   value={`₩${fmtNum(s.economy.treasuryBalanceKRW, 2)}조`} />
          <Stat label="외환보유고"  value={`$${fmtInt(s.economy.fxReservesUSD)}B`} />
        </div>
      </Panel>
      <Panel title="핵심 지표 한눈에">
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="지지율" value={`${s.approval.overall.toFixed(1)}%`} tone={s.approval.overall >= 50 ? 'good' : s.approval.overall >= 30 ? 'warn' : 'bad'} />
          <MiniStat label="물가"   value={`${s.economy.inflation.toFixed(1)}%`} tone={Math.abs(s.economy.inflation - 2) < 0.7 ? 'good' : 'warn'} />
          <MiniStat label="실업률" value={`${s.economy.unemployment.toFixed(1)}%`} tone={s.economy.unemployment <= 3.5 ? 'good' : 'warn'} />
          <MiniStat label="GDP성장" value={`${s.economy.gdpGrowth.toFixed(1)}%`} tone={s.economy.gdpGrowth >= 2 ? 'good' : s.economy.gdpGrowth >= 0 ? 'warn' : 'bad'} />
          <MiniStat label="코스피" value={fmtInt(s.economy.kospi)} tone="neutral" />
          <MiniStat label="환율"   value={`$1=₩${fmtInt(s.economy.fxUsdKrw)}`} tone="neutral" />
          <MiniStat label="DEFCON" value={String(s.security.defconLevel)} tone={s.security.defconLevel >= 4 ? 'good' : 'bad'} />
          <MiniStat label="北 긴장" value={`${s.security.northKoreaTension.toFixed(0)}`} tone={s.security.northKoreaTension < 50 ? 'good' : 'bad'} />
          <MiniStat label="출산율" value={s.social.birthRate.toFixed(2)} tone={s.social.birthRate >= 1.0 ? 'good' : 'bad'} />
          <MiniStat label="자살률" value={s.social.suicideRate.toFixed(1)} tone={s.social.suicideRate <= 20 ? 'good' : 'bad'} />
          <MiniStat label="여당 의석" value={`${s.assembly.rulingCoalitionSeats}/300`} tone={s.assembly.rulingCoalitionSeats >= 151 ? 'good' : 'warn'} />
          <MiniStat label="SNS 정서" value={`${s.sns.sentimentScore > 0 ? '+' : ''}${s.sns.sentimentScore.toFixed(0)}`} tone={s.sns.sentimentScore >= 0 ? 'good' : 'bad'} />
        </div>
      </Panel>
      <Panel title="이번 달 무역수지 (월말 정산 후 외환·국고 반영)">
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <Stat label="이번달 수출" value={`$${fmtNum(s.economy.monthlyExportUSD, 1)}B`} />
          <Stat label="이번달 수입" value={`$${fmtNum(s.economy.monthlyImportUSD, 1)}B`} />
          <Stat label="이번달 수지" value={`$${fmtNum(s.economy.monthlyTradeBalanceUSD, 1)}B`}
            color={s.economy.monthlyTradeBalanceUSD >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <Stat label="YTD 무역수지" value={`$${fmtNum(s.economy.ytdTradeBalanceUSD, 1)}B`} />
        </div>
      </Panel>
      <Panel title="진행 중 전쟁·분쟁 개입">
        {s.security.warEngagements.length === 0
          ? <div className="text-[11px] text-slate-500">개입 없음</div>
          : s.security.warEngagements.map(w => (
            <div key={w.id} className="bg-slate-950/40 border border-red-900 rounded p-2 mb-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-300 font-semibold">{w.name}</span>
                <Chip>{w.koreaRole}</Chip>
              </div>
              <div className="text-[10px] text-slate-400">병력 {w.troopsDeployed}명 · 월 비용 {w.costPerMonth.toFixed(2)}조원 · 개시 {w.startDate}</div>
              <div className="text-[10px] text-slate-300 mt-0.5">{w.notes}</div>
            </div>
          ))}
      </Panel>
    </>
  );
}

// ============ 경제 ============
function EconomyTab() {
  const e = useGame(s => s.state!.economy);
  return (
    <>
      <Panel title="거시 (USD 기준 명목 GDP/시총)">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="GDP성장률" value={fmtPct(e.gdpGrowth)} color={e.gdpGrowth >= 2 ? 'text-emerald-400' : 'text-yellow-400'} />
          <Stat label="GDP 명목"  value={`$${fmtInt(e.gdpNominalUSD)}B`} sub={`₩${fmtInt(e.gdpNominalKRW)}조`} />
          <Stat label="GDP PPP"   value={`$${fmtInt(e.gdpPpp)}B`} />
          <Stat label="1인당 GDP" value={`$${fmtInt(e.gdpPerCapita)}`} />
          <Stat label="1인당 GNI" value={`$${fmtInt(e.gniPerCapita)}`} />
          <Stat label="시가총액"  value={`$${fmtInt(e.marketCapUSD)}B`} />
        </div>
      </Panel>
      <Panel title="물가 (YoY)">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="CPI"       value={fmtPct(e.inflation)} />
          <Stat label="근원물가"  value={fmtPct(e.coreInflation)} />
          <Stat label="생산자물가" value={fmtPct(e.ppi)} />
          <Stat label="신선식품"  value={fmtPct(e.groceryInflation)} />
          <Stat label="에너지"    value={fmtPct(e.energyInflation)} />
          <Stat label="주거"      value={fmtPct(e.housingInflation)} />
          <Stat label="서비스"    value={fmtPct(e.servicesInflation)} />
        </div>
      </Panel>
      <Panel title="고용 / 노동">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="실업률"    value={fmtPct(e.unemployment)} />
          <Stat label="청년실업"  value={fmtPct(e.youthUnemployment)} />
          <Stat label="고용률"    value={fmtPct(e.employmentRate)} />
          <Stat label="여성고용"  value={fmtPct(e.femaleEmploymentRate)} />
          <Stat label="경활참가율" value={fmtPct(e.laborParticipation)} />
          <Stat label="비정규직"  value={fmtPct(e.irregularWorkerRatio)} />
        </div>
      </Panel>
      <Panel title="금리 / 통화">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="한은 기준금리" value={fmtPct(e.baseRate, 2)} />
          <Stat label="CD 91일"       value={fmtPct(e.cd91, 2)} />
          <Stat label="국고채 3년"    value={fmtPct(e.treasury3y, 2)} />
          <Stat label="국고채 10년"   value={fmtPct(e.treasury10y, 2)} />
          <Stat label="M2 증가율"     value={fmtPct(e.m2Growth)} />
          <Stat label="M2 총량"       value={`₩${fmtInt(e.m2Total)}조`} />
        </div>
      </Panel>
      <Panel title="환율 (달러 기준)">
        <Stat label="USD/KRW" value={`$1 = ₩${fmtNum(e.fxUsdKrw, 1)}`} />
        <Stat label="VKOSPI" value={fmtNum(e.vkospi, 1)} />
      </Panel>
      <Panel title="증시">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="코스피"   value={fmtInt(e.kospi)} />
          <Stat label="코스닥"   value={fmtInt(e.kosdaq)} />
          <Stat label="KOSPI200" value={fmtInt(e.kospi200)} />
          <Stat label="시총 (전체)" value={`$${fmtInt(e.marketCapUSD)}B`} />
        </div>
        <div className="h-24 mt-2">
          <ResponsiveContainer>
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
      <Panel title="무역 (월별 누적 · 월말 리셋)">
        <Stat label="이번달 수출" value={`$${fmtNum(e.monthlyExportUSD, 2)}B`} />
        <Stat label="이번달 수입" value={`$${fmtNum(e.monthlyImportUSD, 2)}B`} />
        <Stat label="이번달 수지" value={`$${fmtNum(e.monthlyTradeBalanceUSD, 2)}B`}
          color={e.monthlyTradeBalanceUSD >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        <div className="border-t border-slate-800 my-1.5"></div>
        <Stat label="YTD 무역수지" value={`$${fmtNum(e.ytdTradeBalanceUSD, 1)}B`} />
        <Stat label="경상수지 YTD" value={`$${fmtNum(e.currentAccountUSD, 1)}B`} />
        <Stat label="FDI 유입"     value={`$${fmtNum(e.fdiInflowUSD, 1)}B`} />
        <Stat label="외환보유고"   value={`$${fmtInt(e.fxReservesUSD)}B`} />
        <div className="text-[10px] text-slate-500 mt-2">※ 월말 정산 시 무역수지가 외환보유고와 국고에 자동 반영됩니다.</div>
      </Panel>
      <Panel title="산업별 수출 (연 십억$)">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="반도체"    value={`$${fmtInt(e.semiconductorExport)}B`} />
          <Stat label="자동차"    value={`$${fmtInt(e.autoExport)}B`} />
          <Stat label="선박"      value={`$${fmtInt(e.shipExport)}B`} />
          <Stat label="철강"      value={`$${fmtInt(e.steelExport)}B`} />
          <Stat label="석유화학"  value={`$${fmtInt(e.petrochemicalExport)}B`} />
          <Stat label="배터리"    value={`$${fmtInt(e.batteryExport)}B`} />
          <Stat label="디스플레이" value={`$${fmtInt(e.displayExport)}B`} />
        </div>
      </Panel>
      <Panel title="재정 / 국고">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="국고 잔액"     value={`₩${fmtNum(e.treasuryBalanceKRW, 2)}조`} color={e.treasuryBalanceKRW >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <Stat label="연 세수"       value={`₩${fmtInt(e.taxRevenue)}조`} />
          <Stat label="재정수지/GDP"  value={fmtPct(e.fiscalBalance)} />
          <Stat label="기초재정수지"  value={fmtPct(e.primaryBalance)} />
          <Stat label="국가채무/GDP"  value={fmtPct(e.nationalDebt)} />
          <Stat label="정부총지출"    value={`₩${fmtInt(e.governmentSpending)}조`} />
          <Stat label="가계부채/GDP"  value={fmtPct(e.householdDebt)} />
          <Stat label="가계부채 총액" value={`₩${fmtInt(e.householdDebtAbs)}조`} />
          <Stat label="기업부채/GDP"  value={fmtPct(e.corporateDebt)} />
        </div>
      </Panel>
      <Panel title="주택 / 심리">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="주택가격지수" value={fmtNum(e.housePriceIndex, 1)} />
          <Stat label="주택 YoY"     value={fmtPct(e.housePriceYoY)} />
          <Stat label="전세지수"     value={fmtNum(e.jeonseIndex, 1)} />
          <Stat label="전세 YoY"     value={fmtPct(e.jeonseYoY)} />
          <Stat label="주택공급"     value={`${fmtNum(e.housingSupply, 1)}만호`} />
          <Stat label="미분양"       value={`${fmtNum(e.unsoldHousesNationwide, 1)}만호`} />
          <Stat label="소비심리"     value={fmtNum(e.consumerConfidence, 0)} />
          <Stat label="기업심리"     value={fmtNum(e.businessConfidence, 0)} />
          <Stat label="경제심리"     value={fmtNum(e.economicSentimentIndex, 0)} />
        </div>
      </Panel>
    </>
  );
}

// ============ 사회 ============
function SocialTab() {
  const s = useGame(st => st.state!.social);
  return (
    <>
      <Panel title="인구">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="총 인구"      value={`${fmtInt(s.totalPopulation)}만`} />
          <Stat label="인구증감"     value={fmtPct(s.populationGrowth, 2)} color={s.populationGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <Stat label="합계출산율"   value={fmtNum(s.birthRate, 2)} />
          <Stat label="조사망률"     value={`${fmtNum(s.deathRate, 1)}‰`} />
          <Stat label="혼인율"       value={`${fmtNum(s.marriageRate, 1)}‰`} />
          <Stat label="이혼율"       value={`${fmtNum(s.divorceRate, 1)}‰`} />
          <Stat label="노령화지수"   value={fmtNum(s.agingIndex, 1)} />
          <Stat label="중위연령"     value={`${fmtNum(s.medianAge, 1)}세`} />
          <Stat label="외국인"       value={`${fmtInt(s.immigrantPopulation)}만`} />
          <Stat label="다문화 가구"  value={`${fmtNum(s.multiculturalFamilies, 1)}만`} />
        </div>
      </Panel>
      <Panel title="안전 / 건강">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="자살률" value={`${fmtNum(s.suicideRate, 1)}/10만`} />
          <Stat label="강력범죄율" value={`${fmtNum(s.violentCrimeRate, 1)}/10만`} />
          <Stat label="범죄지수" value={fmtNum(s.crimeIndex, 0)} />
          <Stat label="교통사망" value={fmtInt(s.trafficDeaths)} />
          <Stat label="마약범죄" value={fmtInt(s.drugCrimeCount)} />
          <Stat label="사이버범죄" value={fmtInt(s.cyberCrimeCount)} />
          <Stat label="PM2.5"   value={`${fmtNum(s.airQualityPM25, 0)}㎍`} />
          <Stat label="PM10"    value={`${fmtNum(s.airQualityPM10, 0)}㎍`} />
        </div>
      </Panel>
      <Panel title="만족도 / 신뢰">
        <StatBar label="의료 만족도"      value={s.healthcareSatisfaction}     valueLabel={fmtPct(s.healthcareSatisfaction, 0)} />
        <StatBar label="교육 만족도"      value={s.educationSatisfaction}      valueLabel={fmtPct(s.educationSatisfaction, 0)} />
        <StatBar label="연금 신뢰도"      value={s.pensionTrust}               valueLabel={fmtPct(s.pensionTrust, 0)} />
        <StatBar label="치안 만족도"      value={s.publicSafetySatisfaction}   valueLabel={fmtPct(s.publicSafetySatisfaction, 0)} />
        <StatBar label="정부 신뢰도"      value={s.governmentTrust}            valueLabel={fmtPct(s.governmentTrust, 0)} />
        <StatBar label="사법부 신뢰"      value={s.judicialTrust}              valueLabel={fmtPct(s.judicialTrust, 0)} />
        <StatBar label="대통령실 신뢰"    value={s.presidentialOfficeTrust}    valueLabel={fmtPct(s.presidentialOfficeTrust, 0)} />
        <StatBar label="국회 신뢰"        value={s.parliamentTrust}            valueLabel={fmtPct(s.parliamentTrust, 0)} />
      </Panel>
      <Panel title="사회 갈등">
        <StatBar label="젠더 갈등" value={s.genderConflictIndex}     valueLabel={fmtNum(s.genderConflictIndex, 0)} inverted />
        <StatBar label="세대 갈등" value={s.generationConflictIndex} valueLabel={fmtNum(s.generationConflictIndex, 0)} inverted />
        <StatBar label="지역 갈등" value={s.regionalConflictIndex}   valueLabel={fmtNum(s.regionalConflictIndex, 0)} inverted />
        <StatBar label="계층 갈등" value={s.classConflictIndex}      valueLabel={fmtNum(s.classConflictIndex, 0)} inverted />
      </Panel>
      <Panel title="국제 비교">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="언론자유 (RSF)" value={fmtNum(s.pressFreedomIndex, 1)} sub="↓좋음" />
          <Stat label="부패인식 (CPI)" value={fmtInt(s.corruptionPerceptionIndex)} sub="↑좋음" />
          <Stat label="민주주의 (EIU)" value={fmtNum(s.democracyIndex, 2)} />
          <Stat label="지니계수"        value={fmtNum(s.giniIndex, 3)} />
          <Stat label="상대빈곤율"      value={fmtPct(s.povertyRate)} />
        </div>
      </Panel>
      <Panel title="환경 / 에너지">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="탄소배출량"    value={`${fmtInt(s.carbonEmission)}백만톤`} />
          <Stat label="재생E 비중"    value={fmtPct(s.greenEnergyShare)} />
          <Stat label="에너지자급"    value={fmtPct(s.energySelfSufficiency)} />
          <Stat label="식량자급"      value={fmtPct(s.foodSelfSufficiency)} />
        </div>
      </Panel>
      <Panel title="교육 / 주거 / 디지털">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="대학진학률"    value={fmtPct(s.collegeAdmissionRate)} />
          <Stat label="사교육비/연"   value={`₩${fmtNum(s.privateEduSpending, 1)}조`} />
          <Stat label="주거 취약도"   value={fmtNum(s.housingAffordability, 0)} />
          <Stat label="자가보유율"    value={fmtPct(s.homeOwnershipRate)} />
          <Stat label="인터넷 보급"   value={fmtPct(s.internetPenetration)} />
          <Stat label="스마트폰 보급" value={fmtPct(s.smartphonePenetration)} />
        </div>
      </Panel>
    </>
  );
}

// ============ 군사 ============
function MilitaryTab() {
  const sec = useGame(s => s.state!.security);
  const addWeapon = useGame(s => s.addWeapon);
  const removeWeapon = useGame(s => s.removeWeapon);
  const changeWeaponCount = useGame(s => s.changeWeaponCount);
  const [section, setSection] = useState<'STATUS' | 'WEAPONS' | 'BASES' | 'UNITS' | 'PROCURE'>('STATUS');
  const [newW, setNewW] = useState<{ category: WeaponEntry['category']; name: string; count: number; origin: string }>({
    category: '전투기', name: '', count: 1, origin: '미국',
  });
  const defconColor = sec.defconLevel <= 2 ? 'text-red-400' : sec.defconLevel <= 3 ? 'text-orange-400' : 'text-emerald-400';

  const weaponsByCat: Record<string, typeof sec.weapons> = {};
  for (const w of sec.weapons) (weaponsByCat[w.category] ??= []).push(w);
  const unitsByEchelon: Record<string, typeof sec.units> = {};
  for (const u of sec.units) (unitsByEchelon[u.echelon] ??= []).push(u);
  const basesByType: Record<string, typeof sec.bases> = {};
  for (const b of sec.bases) (basesByType[b.type] ??= []).push(b);

  return (
    <>
      <div className="flex gap-1">
        {(['STATUS','WEAPONS','BASES','UNITS','PROCURE'] as const).map(t => (
          <button key={t} onClick={() => setSection(t)}
            className={`text-[10px] px-2 py-1 rounded ${section === t ? 'bg-rok-blue text-white' : 'bg-slate-800 text-slate-300'}`}>
            {t === 'STATUS' ? '태세' : t === 'WEAPONS' ? '무기' : t === 'BASES' ? '기지' : t === 'UNITS' ? '부대' : '도입/폐기'}
          </button>
        ))}
      </div>

      {section === 'STATUS' && (
        <>
          <Panel title="비상 태세">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">DEFCON</div>
                <div className={`text-3xl font-bold ${defconColor}`}>{sec.defconLevel}</div>
                <div className="text-[10px] text-slate-500">
                  {sec.defconLevel === 5 ? '평시' : sec.defconLevel === 4 ? '주의' : sec.defconLevel === 3 ? '경계' : sec.defconLevel === 2 ? '준전시' : '전쟁임박'}
                </div>
              </div>
              <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">WATCHCON</div>
                <div className="text-3xl font-bold text-orange-300">{sec.watchcon}</div>
              </div>
            </div>
          </Panel>
          <Panel title="위협도">
            <StatBar label="북한 긴장도"    value={sec.northKoreaTension}         valueLabel={fmtPct(sec.northKoreaTension, 0)} inverted />
            <StatBar label="북한 도발 위험" value={sec.northKoreaProvocationRisk} valueLabel={fmtPct(sec.northKoreaProvocationRisk, 0)} inverted />
            <StatBar label="사이버 위협"    value={sec.cyberThreatLevel}          valueLabel={fmtPct(sec.cyberThreatLevel, 0)} inverted />
            <StatBar label="테러 위협"      value={sec.terrorThreatLevel}         valueLabel={fmtPct(sec.terrorThreatLevel, 0)} inverted />
          </Panel>
          <Panel title="국군 전력 / 동맹">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <Stat label="현역"      value={`${sec.troopsActive}만명`} />
              <Stat label="예비역"    value={`${sec.troopsReserve}만명`} />
              <Stat label="국방예산"  value={`₩${fmtNum(sec.defenseBudget, 1)}조`} />
              <Stat label="국방비/GDP" value={fmtPct(sec.defenseBudgetPctGdp)} />
              <Stat label="GFP 순위"  value={`세계 ${sec.globalFireRank}위`} />
              <Stat label="군 준비태세" value={`${sec.rokMilitaryReadiness}/100`} />
              <Stat label="한미동맹"   value={`${sec.usAllianceStrength}/100`} />
              <Stat label="주한미군"   value={`${fmtInt(sec.usftKorea)}명`} />
              <Stat label="핵보유"     value={sec.nukesAvailable ? '예' : '없음'} color={sec.nukesAvailable ? 'text-red-400' : ''} />
              <Stat label="北 핵 추정" value={`${sec.northKoreaNukes}기`} color="text-red-400" />
              <Stat label="北 미사일/연" value={`${sec.northKoreaMissilesYear}회`} />
            </div>
          </Panel>
        </>
      )}

      {section === 'WEAPONS' && (
        <Panel title={`무기 인벤토리 (${sec.weapons.length}종)`}>
          {Object.entries(weaponsByCat).map(([cat, items]) => (
            <div key={cat} className="mb-2">
              <div className="text-[10px] text-slate-500 mb-0.5 sticky top-0 bg-slate-900/80 backdrop-blur-sm">{cat} ({items.length}종)</div>
              <div className="space-y-1">
                {items.map(w => (
                  <div key={w.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-200">{w.name}</div>
                        <div className="text-[10px] text-slate-500">{w.origin} · {w.status}{w.notes ? ` · ${w.notes}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => changeWeaponCount(w.id, -10)} className="text-[10px] px-1 bg-red-900/50 rounded">-10</button>
                        <button onClick={() => changeWeaponCount(w.id, -1)} className="text-[10px] px-1 bg-red-900/50 rounded">-1</button>
                        <span className="font-mono w-12 text-center">{fmtInt(w.count)}</span>
                        <button onClick={() => changeWeaponCount(w.id, 1)} className="text-[10px] px-1 bg-emerald-900/50 rounded">+1</button>
                        <button onClick={() => changeWeaponCount(w.id, 10)} className="text-[10px] px-1 bg-emerald-900/50 rounded">+10</button>
                        <button onClick={() => removeWeapon(w.id)} className="text-[10px] text-red-400 ml-1">×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Panel>
      )}

      {section === 'PROCURE' && (
        <Panel title="신규 도입 / 폐기">
          <div className="space-y-1.5">
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">분류</label>
              <select className="input w-full text-xs" value={newW.category}
                onChange={e => setNewW({ ...newW, category: e.target.value as any })}>
                {['전차','장갑차','자주포','견인포','다연장','전투기','공격기','수송기','헬기','구축함','잠수함','호위함','미사일','방공','레이더','드론','기타'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">명칭</label>
              <input className="input w-full text-xs" placeholder="예: KF-21 보라매 추가분"
                value={newW.name} onChange={e => setNewW({ ...newW, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">수량</label>
                <input className="input w-full text-xs" type="number" value={newW.count}
                  onChange={e => setNewW({ ...newW, count: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">원산지</label>
                <input className="input w-full text-xs" value={newW.origin}
                  onChange={e => setNewW({ ...newW, origin: e.target.value })} />
              </div>
            </div>
            <button onClick={() => {
              if (!newW.name) return alert('명칭 필요');
              addWeapon({ ...newW, status: '도입중' as any, notes: '신규 도입' });
              setNewW({ ...newW, name: '', count: 1 });
            }} className="btn-primary w-full text-xs">+ 도입 명령</button>
          </div>
        </Panel>
      )}

      {section === 'BASES' && (
        <Panel title={`군사기지 (${sec.bases.length}개)`}>
          {Object.entries(basesByType).map(([type, items]) => (
            <div key={type} className="mb-2">
              <div className="text-[10px] text-slate-500 mb-0.5">{type} ({items.length})</div>
              <div className="space-y-1">
                {items.map(b => (
                  <div key={b.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-200">{b.name}</span>
                      <span className="text-[10px] text-slate-500">{b.personnel ? fmtInt(b.personnel) + '명' : ''}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{b.location}</div>
                    {b.desc && <div className="text-[10px] text-slate-400">{b.desc}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Panel>
      )}

      {section === 'UNITS' && (
        <Panel title={`부대 편제 (${sec.units.length}개)`}>
          {['군','군단','사단','여단','함대','비행단','특임','예비'].map(ec => {
            const items = unitsByEchelon[ec] ?? [];
            if (items.length === 0) return null;
            return (
              <div key={ec} className="mb-2">
                <div className="text-[10px] text-slate-500 mb-0.5">{ec} ({items.length})</div>
                <div className="space-y-1">
                  {items.map(u => (
                    <div key={u.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-200">{u.name}</span>
                        <span className="text-[10px] text-slate-500">{u.service}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{u.hq} {u.personnel ? `· ${fmtInt(u.personnel)}명` : ''}{u.notes ? ` · ${u.notes}` : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Panel>
      )}
    </>
  );
}

// ============ 외교 (200개국) ============
function DiplomacyTab() {
  const countries = useGame(s => s.state!.countries);
  const issueDecision = useGame(s => s.issueDecision);
  const busy = useGame(s => s.busy);
  const [continent, setContinent] = useState<Continent | 'ALL'>('ALL');
  const [filter, setFilter] = useState('');
  const [pickedId, setPicked] = useState<string | null>(null);
  const picked = countries.find(c => c.id === pickedId);

  const list = countries
    .filter(c => continent === 'ALL' || c.continent === continent)
    .filter(c => !filter || c.name.includes(filter) || c.leader.includes(filter));

  const allianceLabel = (a: AllianceStatus) => ({ ALLY: '동맹', PARTNER: '파트너', NEUTRAL: '중립', RIVAL: '경쟁', HOSTILE: '적대' } as any)[a];
  const allianceColor = (a: AllianceStatus) => ({
    ALLY: 'text-blue-300', PARTNER: 'text-emerald-300', NEUTRAL: 'text-slate-300',
    RIVAL: 'text-orange-300', HOSTILE: 'text-red-300',
  } as any)[a];

  return (
    <>
      <Panel title={`수교국 (${list.length}/${countries.length})`}>
        <div className="flex gap-1 flex-wrap mb-2">
          <button onClick={() => setContinent('ALL')} className={`text-[10px] px-1.5 py-0.5 rounded ${continent === 'ALL' ? 'bg-blue-700' : 'bg-slate-800'}`}>전체</button>
          {(['ASIA','EUROPE','ME','NA','SA','OCEANIA','AFRICA'] as Continent[]).map(c => (
            <button key={c} onClick={() => setContinent(c)} className={`text-[10px] px-1.5 py-0.5 rounded ${continent === c ? 'bg-blue-700' : 'bg-slate-800'}`}>{CONTINENT_NAME[c]}</button>
          ))}
        </div>
        <input className="input w-full text-xs mb-2" placeholder="국가명·지도자 검색"
          value={filter} onChange={e => setFilter(e.target.value)} />
        <div className="grid grid-cols-2 gap-1">
          {list.map(f => (
            <button key={f.id} onClick={() => setPicked(f.id)}
              className={`text-left bg-slate-950/40 border rounded p-1.5 hover:border-blue-500 ${pickedId === f.id ? 'border-blue-500' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold truncate">{f.flag} {f.name}</span>
                <span className={`text-[10px] ${f.relation >= 0 ? 'text-emerald-300' : 'text-red-300'} font-mono`}>{f.relation > 0 ? '+' : ''}{f.relation}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">{f.leader} · <span className={allianceColor(f.alliance)}>{allianceLabel(f.alliance)}</span></div>
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
            <Stat label="현지명"    value={picked.nameLocal ?? '-'} />
            <Stat label="대륙"      value={CONTINENT_NAME[picked.continent]} />
            <Stat label="수도"      value={picked.capital} />
            <Stat label="정상"      value={picked.leader} />
            <Stat label="직위"      value={picked.leaderTitle} />
            <Stat label="정부형태"  value={picked.government} />
            <Stat label="인구"      value={`${fmtInt(picked.population)}만`} />
            <Stat label="면적"      value={`${fmtInt(picked.area / 1000)}천㎢`} />
            <Stat label="GDP"       value={`$${fmtNum(picked.gdpUSD, 1)}B`} />
            <Stat label="1인 GDP"   value={`$${fmtInt(picked.gdpPerCapita)}`} />
            <Stat label="핵보유"    value={picked.nuclear ? '예' : '아니오'} color={picked.nuclear ? 'text-red-400' : ''} />
            <Stat label="UNSC 상임" value={picked.unscPermanent ? '예' : '아니오'} />
            <Stat label="대사관"    value={picked.hasEmbassyInCountry ? '주재' : '미설치'} />
            <Stat label="동맹지위"  value={<span className={allianceColor(picked.alliance)}>{allianceLabel(picked.alliance)}</span>} />
            <Stat label="FTA"       value={picked.hasFTA ? '체결' : '없음'} />
            <Stat label="무비자"    value={picked.visaFreeKorean ? '가능' : '불가'} />
            <Stat label="교민"      value={`${fmtInt(picked.koreanResidents)}명`} />
            <Stat label="교역"      value={`$${fmtInt(picked.tradeVolumeUSD)}억`} />
            <Stat label="관계점수"  value={`${picked.relation > 0 ? '+' : ''}${picked.relation}`} />
            <Stat label="신뢰도"    value={`${picked.trustLevel}/100`} />
          </div>
          {picked.treaties.length > 0 && (<>
            <div className="mt-2 text-[10px] text-slate-500">조약·협정</div>
            <div className="flex flex-wrap gap-1 mt-0.5">{picked.treaties.map((t, i) => <Chip key={i}>{t}</Chip>)}</div>
          </>)}
          {picked.recentEvents.length > 0 && (<>
            <div className="mt-2 text-[10px] text-slate-500">최근 이슈</div>
            <ul className="text-[11px] text-slate-300 mt-0.5 space-y-0.5">{picked.recentEvents.map((r, i) => <li key={i}>· {r}</li>)}</ul>
          </>)}
          <div className="mt-3 pt-2 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 mb-1">외교 행동 (결정 모드로 전송)</div>
            <div className="grid grid-cols-2 gap-1">
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.leader} ${picked.name} ${picked.leaderTitle}과 정상 통화를 진행한다. 양국 협력 방안 논의.`, `${picked.name} 정상통화`)}
                className="btn text-[10px] py-1 disabled:opacity-40">📞 정상통화</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name} ${picked.leader}에게 정상회담을 공식 제안한다.`, `${picked.name} 정상회담 제안`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🤝 정상회담 제안</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}과의 경제 협력 (교역 확대·FTA 협의·투자 유치)을 강화한다.`, `${picked.name} 경제협력`)}
                className="btn text-[10px] py-1 disabled:opacity-40">💼 경제협력 강화</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}에 인도적 지원(의료·식량·재건)을 공식 제공한다.`, `${picked.name} 인도적 지원`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🕊️ 인도적 지원</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}에 대한 항의 성명을 외교부 명의로 발표한다.`, `${picked.name} 항의 성명`)}
                className="btn text-[10px] py-1 disabled:opacity-40">📣 항의 성명</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}에 대한 경제 제재(수출통제·금융제재)를 발동한다.`, `${picked.name} 제재`)}
                className="btn-danger text-[10px] py-1 disabled:opacity-40">⚠️ 제재 발동</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}과의 외교 관계를 격하(대사관 일시 폐쇄·대사 소환)한다.`, `${picked.name} 관계 격하`)}
                className="btn-danger text-[10px] py-1 disabled:opacity-40">🛑 관계 격하</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}과의 단교(외교관계 단절)를 선언한다.`, `${picked.name} 단교`)}
                className="btn-danger text-[10px] py-1 disabled:opacity-40">❌ 단교 선언</button>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">※ 클릭 시 결정 모드로 전송되어 AI가 효과를 산출합니다.</div>
          </div>
        </Panel>
      )}
    </>
  );
}

// ============ 정치 ============
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
        {assembly.rulingCoalitionSeats < 151 && (
          <div className="text-[10px] text-orange-400 bg-orange-950/30 border border-orange-900 rounded px-2 py-1">
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

// ============ 행정부 (부처/처/위원회/청 + 인선 + 업무) ============
function AdminTab() {
  const state = useGame(s => s.state)!;
  const { adminBodies, cabinet, adminTasks } = state;
  const appointOfficial = useGame(s => s.appointOfficial);
  const appointCustom = useGame(s => s.appointCustom);
  const resignOfficial = useGame(s => s.resignOfficial);
  const completeAdminTask = useGame(s => s.completeAdminTask);
  const [pickedBodyId, setPickedBody] = useState<MinistryId | null>(null);
  const [customName, setCustomName] = useState('');
  const [customBio, setCustomBio] = useState('');

  const grouped: Record<string, typeof adminBodies> = {};
  for (const b of adminBodies) (grouped[b.category] ??= []).push(b);

  const officialOf = (mid: MinistryId) => cabinet.find(o => o.ministry === mid);
  const tasksOf = (mid: MinistryId) => adminTasks.filter(t => t.bodyId === mid);

  const picked = pickedBodyId ? adminBodies.find(b => b.id === pickedBodyId) : null;
  const pickedOfficial = picked ? officialOf(picked.id) : null;
  const pickedTasks = picked ? tasksOf(picked.id) : [];
  const pickedNeedsConfirm = picked && CONFIRMATION_REQUIRED.includes(picked.id);
  const pickedCandidates = picked ? (NOMINEE_POOL as any)[picked.id] ?? [] : [];

  const vacantCount = cabinet.filter(o => !o.confirmed && CONFIRMATION_REQUIRED.includes(o.ministry)).length;

  return (
    <>
      <Panel title={`행정 조직 (${adminBodies.length}개)`} right={
        <span className="text-[10px] text-red-300">{vacantCount}개 공석</span>
      }>
        <div className="space-y-2">
          {(['대통령실','국무총리실','부','처','청','위원회','독립기관'] as const).map(cat => {
            const items = grouped[cat] ?? [];
            if (!items.length) return null;
            return (
              <div key={cat}>
                <div className="text-[10px] text-slate-500 mb-1 sticky top-0 bg-slate-900/80 backdrop-blur-sm">{cat} ({items.length})</div>
                <div className="space-y-1">
                  {items.map(b => {
                    const off = officialOf(b.id);
                    const tasks = tasksOf(b.id);
                    const isVacant = !off?.confirmed && CONFIRMATION_REQUIRED.includes(b.id);
                    return (
                      <button key={b.id} onClick={() => setPickedBody(b.id)}
                        className={`w-full text-left bg-slate-950/40 border rounded p-1.5 text-xs hover:border-blue-500 ${pickedBodyId === b.id ? 'border-blue-500' : 'border-slate-800'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-slate-200">{b.name}</span>
                            {b.parentId && <span className="text-[9px] text-slate-500 ml-1">({adminBodies.find(x => x.id === b.parentId)?.name})</span>}
                          </div>
                          {isVacant
                            ? <span className="text-[9px] text-red-400">공석</span>
                            : <span className="text-[9px] text-slate-500">{off?.name}</span>}
                        </div>
                        {tasks.length > 0 && (
                          <div className="text-[9px] text-slate-500 mt-0.5">진행 {tasks.length}건 · 평균 {Math.round(tasks.reduce((a, t) => a + t.progress, 0) / tasks.length)}%</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {picked && (
        <Panel title={`${picked.name} 상세`}>
          {pickedOfficial?.confirmed ? (
            <div className="space-y-1">
              <Stat label="현 책임자"   value={`${pickedOfficial.name} (${pickedOfficial.age}세)`} />
              <Stat label="소속"        value={state.parties.find(p => p.id === pickedOfficial.party)?.name ?? pickedOfficial.party} />
              <Stat label="임명일"      value={pickedOfficial.appointedAt} />
              <div className="text-[10px] text-slate-500">{pickedOfficial.bio}</div>
              <div className="grid grid-cols-4 gap-1 mt-1 text-[10px]">
                <div><span className="text-slate-500">충성</span> <span className="font-mono">{pickedOfficial.loyalty}</span></div>
                <div><span className="text-slate-500">능력</span> <span className="font-mono">{pickedOfficial.competence}</span></div>
                <div><span className="text-slate-500">여론</span> <span className="font-mono">{pickedOfficial.publicFavor}</span></div>
                <div className={pickedOfficial.scandalRisk > 50 ? 'text-red-400' : 'text-slate-500'}>
                  <span>리스크</span> <span className="font-mono">{pickedOfficial.scandalRisk}</span>
                </div>
              </div>
              <button onClick={() => resignOfficial(picked.id)} className="btn-danger w-full text-[11px] mt-2">해임 / 사임 수리</button>
            </div>
          ) : pickedNeedsConfirm ? (
            <div>
              <div className="text-[11px] text-red-300 mb-2">⚠ 공석 — 지명 필요</div>
              <div className="space-y-1">
                {pickedCandidates.map((c: any, i: number) => (
                  <button key={i} onClick={() => appointOfficial(picked.id, i)}
                    className="w-full text-left bg-slate-950/40 border border-slate-700 hover:border-blue-500 rounded p-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-[9px] text-slate-400">충성{c.loyalty}/능력{c.competence}/리스크{c.risk}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{c.bio}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-400 mb-1">직접 지명 (커스텀)</div>
                <input className="input w-full text-xs mb-1" placeholder="이름" value={customName} onChange={e => setCustomName(e.target.value)} />
                <input className="input w-full text-xs mb-1" placeholder="약력" value={customBio} onChange={e => setCustomBio(e.target.value)} />
                <button onClick={() => {
                  if (!customName) return;
                  appointCustom(picked.id, customName, customBio || '대통령 직접 지명');
                  setCustomName(''); setCustomBio('');
                }} className="btn-primary w-full text-[11px]">+ 직접 지명</button>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">{pickedOfficial?.name ?? '-'}</div>
          )}

          <div className="mt-3 pt-2 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 mb-1">진행 중 업무 ({pickedTasks.length})</div>
            {pickedTasks.length === 0 && <div className="text-[10px] text-slate-500">없음</div>}
            <div className="space-y-1">
              {pickedTasks.map(t => (
                <div key={t.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200">{t.title}</span>
                    <Chip color={t.priority === 'CRITICAL' ? 'text-red-300 border-red-800 bg-red-900/30' :
                                  t.priority === 'HIGH' ? 'text-orange-300 border-orange-800 bg-orange-900/30' :
                                  'text-slate-300 border-slate-700 bg-slate-800'}>{t.priority}</Chip>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t.detail}</div>
                  <div className="bar-bg h-1 mt-1">
                    <div className="bar-fill bg-emerald-500" style={{ width: `${t.progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                    <span>{t.status} · 진척 {t.progress.toFixed(1)}%</span>
                    {t.status === 'PROGRESS' && <button onClick={() => completeAdminTask(t.id)} className="text-emerald-400">완료 처리</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}

// ============ 국회 ============
function AssemblyTab() {
  const a = useGame(s => s.state!.assembly);
  const today = useGame(s => s.state!.clock.currentDate);
  const parties = useGame(s => s.state!.parties);
  const vetoBill = useGame(s => s.vetoBill);
  const letBillProceed = useGame(s => s.letBillProceed);
  const daysUntilVote = (introduced: string) => {
    const diff = Math.floor((new Date(today).getTime() - new Date(introduced).getTime()) / 86400000);
    return Math.max(0, 7 - diff);
  };
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
        <Stat label="국회의장"        value={`${a.speaker.name} (${a.speaker.party})`} />
        {a.deputySpeakers.map((d, i) => <Stat key={i} label={`부의장 ${i+1}`} value={`${d.name} (${d.party})`} />)}
        <Stat label="여당 의석"       value={`${a.rulingCoalitionSeats}/300`} />
        <Stat label="탄핵소추 누계"   value={`${a.impeachmentMotions}건`} />
        <Stat label="필리버스터 일수" value={`${a.filibusterDays}일`} />
      </Panel>

      <Panel title={`계류 법안 (${a.pendingBills.length})`} right={<span className="text-[10px] text-slate-500">7일 후 자동 표결</span>}>
        {a.pendingBills.length === 0 && <div className="text-[11px] text-slate-500 text-center py-2">현재 계류 중인 법안이 없습니다.</div>}
        <div className="space-y-1.5">
          {a.pendingBills.map(b => {
            const left = daysUntilVote(b.introducedAt);
            return (
              <div key={b.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 text-[10px]">
                    <Chip color={b.proposer === 'RULING' ? 'text-blue-300 border-blue-800 bg-blue-900/30' : 'text-red-300 border-red-800 bg-red-900/30'}>
                      {b.proposer === 'RULING' ? '여당 발의' : '야권 발의'}
                    </Chip>
                    <Chip color={b.ideologyShift < -20 ? 'text-blue-300 border-blue-800' : b.ideologyShift > 20 ? 'text-red-300 border-red-800' : 'text-slate-300'}>
                      {b.ideologyShift < -20 ? '진보' : b.ideologyShift > 20 ? '보수' : '중도'}
                    </Chip>
                    <span className="text-slate-500">발의 {b.introducedAt}</span>
                  </div>
                  <span className={`text-[10px] ${left <= 2 ? 'text-red-300' : 'text-slate-400'}`}>표결까지 {left}일</span>
                </div>
                <div className="text-xs font-semibold text-slate-100">{b.title}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">{b.summary}</div>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => letBillProceed(b.id)} className="btn-primary text-[10px] py-1 px-2">동의 (즉시 통과)</button>
                  <button onClick={() => vetoBill(b.id)} className="btn-danger text-[10px] py-1 px-2">거부권 행사</button>
                  <span className="text-[10px] text-slate-500 self-center ml-1">(가만히 두면 자동 표결)</span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title={`최근 통과 (${a.passedBills.length}) · 거부 (${a.vetoedBills.length}) · 부결 (${0})`}>
        <details className="text-xs">
          <summary className="cursor-pointer text-[11px] text-slate-400">통과 법안 ▾</summary>
          <ul className="mt-1 space-y-0.5">
            {a.passedBills.slice(0, 10).map(b => (
              <li key={b.id} className="text-[11px] text-emerald-300">✓ {b.title}</li>
            ))}
          </ul>
        </details>
        <details className="text-xs mt-1">
          <summary className="cursor-pointer text-[11px] text-slate-400">거부권 행사 ▾</summary>
          <ul className="mt-1 space-y-0.5">
            {a.vetoedBills.slice(0, 10).map(b => (
              <li key={b.id} className="text-[11px] text-orange-300">✗ {b.title}</li>
            ))}
          </ul>
        </details>
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

// ============ 사법부 ============
function JudiciaryTab() {
  const j = useGame(s => s.state!.judiciary);
  return (
    <>
      <Panel title="대법원">
        <Stat label="대법원장" value={j.supremeCourt.chiefJustice} />
        <Stat label="대법관"   value={`${j.supremeCourt.justices.length}명`} />
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
        <Stat label="소장"     value={j.constitutionalCourt.chief} />
        <Stat label="재판관"   value={`${j.constitutionalCourt.justices.length}명`} />
        <StatBar label="대국민 신뢰도" value={j.constitutionalCourt.publicTrust} valueLabel={`${j.constitutionalCourt.publicTrust}%`} />
        <div className="mt-2 text-[10px] text-slate-500">계류 사건</div>
        <ul className="text-[11px] text-slate-300 space-y-0.5">
          {j.constitutionalCourt.pendingCases.map((c, i) => <li key={i}>· {c}</li>)}
        </ul>
      </Panel>
      <Panel title="검찰">
        <Stat label="검찰총장" value={j.prosecution.prosecutorGeneral} />
        <StatBar label="신뢰도"        value={j.prosecution.publicTrust}        valueLabel={`${j.prosecution.publicTrust}%`} />
        <StatBar label="정치적 독립성" value={j.prosecution.independenceIndex}  valueLabel={`${j.prosecution.independenceIndex}%`} />
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

// ============ 행정구역 ============
function RegionsTab() {
  const regions = useGame(s => s.state!.regions);
  const approval = useGame(s => s.state!.approval);
  const parties = useGame(s => s.state!.parties);
  const buildings = useGame(s => s.state!.buildings);
  const issueDecision = useGame(s => s.issueDecision);
  const busy = useGame(s => s.busy);
  const [pickedId, setPicked] = useState<RegionId | null>(null);
  const picked = regions.find(r => r.id === pickedId);
  return (
    <>
      <Panel title={`행정구역 (17개 광역단체)`}>
        <div className="grid grid-cols-2 gap-1">
          {regions.map(r => {
            const p = parties.find(x => x.id === r.governorParty);
            const ap = approval.byRegion[r.id];
            return (
              <button key={r.id} onClick={() => setPicked(r.id)}
                className={`text-left bg-slate-950/40 border rounded p-1.5 hover:border-blue-500 ${pickedId === r.id ? 'border-blue-500' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200">{r.name}</span>
                  <span className="w-2 h-2 rounded" style={{ background: p?.color }} />
                </div>
                <div className="text-[10px] text-slate-500">{r.governor} · 지지 {Math.round(ap)}%</div>
                <div className="text-[10px] text-slate-500">인구 {fmtInt(r.population)}만 · GRDP ₩{fmtInt(r.grdp)}조</div>
              </button>
            );
          })}
        </div>
      </Panel>
      {picked && (
        <Panel title={`${picked.name} 상세`}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            <Stat label="단체장"    value={`${picked.governor} (${parties.find(p => p.id === picked.governorParty)?.name})`} />
            <Stat label="지지율"    value={`${Math.round(approval.byRegion[picked.id])}%`} />
            <Stat label="인구"      value={`${fmtInt(picked.population)}만`} />
            <Stat label="면적"      value={`${fmtInt(picked.area)}㎢`} />
            <Stat label="GRDP"      value={`₩${fmtInt(picked.grdp)}조`} />
            <Stat label="1인당 소득" value={`₩${fmtInt(picked.perCapitaIncome)}만`} />
            <Stat label="시군구"    value={`${picked.subdivisions}개`} />
            <Stat label="실업률"    value={fmtPct(picked.unemployment)} />
            <Stat label="출산율"    value={fmtNum(picked.birthRate, 2)} />
            <Stat label="고령화"    value={fmtPct(picked.agingRatio)} />
            <Stat label="대학"      value={`${picked.universities}개`} />
            <Stat label="병원"      value={`${picked.hospitals}개`} />
          </div>
          <div className="mt-2 space-y-1.5">
            <div>
              <div className="text-[10px] text-slate-500">주요 도시</div>
              <div className="text-[11px] text-slate-300">{picked.notableCities.join(', ')}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">주요 산업</div>
              <div className="flex flex-wrap gap-1">{picked.industries.map(i => <Chip key={i}>{i}</Chip>)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">특산물</div>
              <div className="text-[11px] text-slate-300">{picked.speciality.join(', ')}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">공항</div>
              <div className="text-[11px] text-slate-300">{picked.airports.length ? picked.airports.join(', ') : '없음'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">항만</div>
              <div className="text-[11px] text-slate-300">{picked.ports.length ? picked.ports.join(', ') : '없음'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">주요 인프라/랜드마크</div>
              <ul className="text-[11px] text-slate-300 space-y-0.5">
                {picked.notableInfra.map((i, idx) => <li key={idx}>· {i}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">관할 건축물 ({buildings.filter(b => b.region === picked.id).length})</div>
              <div className="text-[11px] text-slate-300 max-h-32 overflow-y-auto">
                {buildings.filter(b => b.region === picked.id).slice(0, 20).map(b => (
                  <div key={b.id}>· {b.name} <span className="text-[10px] text-slate-500">({b.category})</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 mb-1">지역 정책 (결정 모드)</div>
            <div className="grid grid-cols-2 gap-1">
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}에 특별 SOC 예산을 편성한다 (도로·철도·항만·공항).`, `${picked.name} SOC 예산`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🛤️ SOC 예산</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name} ${picked.industries[0] ?? '주력산업'} 클러스터 지원 패키지를 발표한다.`, `${picked.name} 산업 지원`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🏭 산업 지원</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name} 청년·신혼부부 주거 지원과 일자리 패키지를 시행한다.`, `${picked.name} 청년 패키지`)}
                className="btn text-[10px] py-1 disabled:opacity-40">👨‍👩‍👧 청년 지원</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name} 재해·재난 대응(폭우·산불·태풍) 예방 예산을 증액한다.`, `${picked.name} 재난 예방`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🛡️ 재난 예방</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name} ${picked.governor} 지사와 청와대 회동을 갖고 현안을 논의한다.`, `${picked.name} 지사 회동`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🤝 지사 회동</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}을 직접 방문해 민생 현장을 점검한다.`, `${picked.name} 현장 방문`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🚙 현장 방문</button>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">※ 클릭 시 결정 모드로 전송됩니다.</div>
          </div>
        </Panel>
      )}
    </>
  );
}

// ============ 토건 (건축물) ============
function InfraTab() {
  const buildings = useGame(s => s.state!.buildings);
  const regions = useGame(s => s.state!.regions);
  const addBuilding = useGame(s => s.addBuilding);
  const removeBuilding = useGame(s => s.removeBuilding);
  const updateBuildingStatus = useGame(s => s.updateBuildingStatus);
  const [cat, setCat] = useState<BuildingCategory | 'ALL'>('ALL');
  const [filter, setFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newB, setNewB] = useState({
    name: '', category: '주거' as BuildingCategory, region: 'SEOUL' as RegionId | 'OFFSHORE' | 'OVERSEAS',
    location: '', size: '', desc: '',
  });

  const list = buildings
    .filter(b => cat === 'ALL' || b.category === cat)
    .filter(b => !filter || b.name.includes(filter) || b.location.includes(filter));

  const grouped: Record<string, typeof buildings> = {};
  for (const b of list) (grouped[b.category] ??= []).push(b);

  const CATEGORIES: BuildingCategory[] = ['주거','상업','공업','교통','에너지','수자원','국방','교육','의료','문화','연구','농수산','관광','해양','우주','기타'];

  return (
    <>
      <Panel title={`전국 건축물·인프라 (${list.length}/${buildings.length})`} right={
        <button onClick={() => setShowAdd(!showAdd)} className="btn text-[10px] py-0.5">+ 건축</button>
      }>
        <div className="flex gap-1 flex-wrap mb-2">
          <button onClick={() => setCat('ALL')} className={`text-[10px] px-1.5 py-0.5 rounded ${cat === 'ALL' ? 'bg-blue-700' : 'bg-slate-800'}`}>전체</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`text-[10px] px-1.5 py-0.5 rounded ${cat === c ? 'bg-blue-700' : 'bg-slate-800'}`}>{c}</button>
          ))}
        </div>
        <input className="input w-full text-xs mb-2" placeholder="명칭/위치 검색"
          value={filter} onChange={e => setFilter(e.target.value)} />

        {showAdd && (
          <div className="bg-slate-950/60 border border-blue-700 rounded p-2 mb-2 space-y-1">
            <div className="text-[10px] text-blue-300">신규 건축 명령</div>
            <input className="input w-full text-xs" placeholder="명칭" value={newB.name}
              onChange={e => setNewB({ ...newB, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-1">
              <select className="input text-xs" value={newB.category}
                onChange={e => setNewB({ ...newB, category: e.target.value as BuildingCategory })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="input text-xs" value={newB.region}
                onChange={e => setNewB({ ...newB, region: e.target.value as any })}>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                <option value="OFFSHORE">해상/도서</option>
                <option value="OVERSEAS">해외</option>
              </select>
            </div>
            <input className="input w-full text-xs" placeholder="위치 (예: 서울 강남구)" value={newB.location}
              onChange={e => setNewB({ ...newB, location: e.target.value })} />
            <input className="input w-full text-xs" placeholder="규모 (예: 50층)" value={newB.size}
              onChange={e => setNewB({ ...newB, size: e.target.value })} />
            <input className="input w-full text-xs" placeholder="설명" value={newB.desc}
              onChange={e => setNewB({ ...newB, desc: e.target.value })} />
            <button onClick={() => {
              if (!newB.name || !newB.location) return alert('명칭·위치 필요');
              addBuilding({ ...newB, status: 'CONSTRUCTING' });
              setNewB({ ...newB, name: '', location: '', size: '', desc: '' });
              setShowAdd(false);
            }} className="btn-primary w-full text-[11px]">건축 시작</button>
          </div>
        )}

        <div className="space-y-2">
          {Object.entries(grouped).map(([c, items]) => (
            <div key={c}>
              <div className="text-[10px] text-slate-500 mb-0.5">{c} ({items.length})</div>
              <div className="space-y-1">
                {items.map(b => (
                  <div key={b.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200">
                        {b.isLandmark && '⭐ '}{b.name}
                      </span>
                      <Chip color={
                        b.status === 'OPERATING'      ? 'text-emerald-300 border-emerald-800 bg-emerald-900/30' :
                        b.status === 'CONSTRUCTING'   ? 'text-yellow-300 border-yellow-800 bg-yellow-900/30' :
                        b.status === 'PLANNED'        ? 'text-blue-300 border-blue-800 bg-blue-900/30' :
                                                        'text-red-300 border-red-800 bg-red-900/30'
                      }>{b.status}</Chip>
                    </div>
                    <div className="text-[10px] text-slate-500">{b.location}{b.size ? ` · ${b.size}` : ''}{b.builtYear ? ` · ${b.builtYear}년` : ''}</div>
                    {b.desc && <div className="text-[10px] text-slate-400 mt-0.5">{b.desc}</div>}
                    <div className="flex gap-1 mt-1">
                      {b.status === 'CONSTRUCTING' && (
                        <button onClick={() => updateBuildingStatus(b.id, 'OPERATING')} className="text-[10px] text-emerald-400">완공 처리</button>
                      )}
                      {b.status === 'OPERATING' && (
                        <button onClick={() => updateBuildingStatus(b.id, 'DECOMMISSIONED')} className="text-[10px] text-orange-400">해체 명령</button>
                      )}
                      <button onClick={() => { if (confirm(`${b.name} 영구 삭제?`)) removeBuilding(b.id); }}
                        className="text-[10px] text-red-400">삭제</button>
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

// ============ 기업 ============
function CompaniesTab() {
  const companies = useGame(s => s.state!.companies);
  const issueDecision = useGame(s => s.issueDecision);
  const busy = useGame(s => s.busy);
  const [sector, setSector] = useState<string>('ALL');
  const [filter, setFilter] = useState('');
  const [pickedRank, setPicked] = useState<number | null>(1);

  const sectors = Array.from(new Set(companies.map(c => c.sector)));
  const list = companies
    .filter(c => sector === 'ALL' || c.sector === sector)
    .filter(c => !filter || c.name.includes(filter) || c.ceo.includes(filter));
  const picked = companies.find(c => c.rank === pickedRank);
  const totalMcap = companies.reduce((a, c) => a + c.marketCapKRW, 0);

  return (
    <>
      <Panel title={`기업 시가총액 순위 (${list.length}/${companies.length}) · 합산 ₩${fmtInt(totalMcap)}조`} right={<span className="text-[10px] text-emerald-300">⏱ 실시간</span>}>
        <div className="flex gap-1 flex-wrap mb-2">
          <button onClick={() => setSector('ALL')} className={`text-[10px] px-1.5 py-0.5 rounded ${sector === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'}`}>전체</button>
          {sectors.map(s => (
            <button key={s} onClick={() => setSector(s)} className={`text-[10px] px-1.5 py-0.5 rounded ${sector === s ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'}`}>{s}</button>
          ))}
        </div>
        <input className="input w-full text-xs mb-2" placeholder="기업명·CEO 검색" value={filter} onChange={e => setFilter(e.target.value)} />
        <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
          {list.map(c => (
            <button key={c.rank} onClick={() => setPicked(c.rank)}
              className={`w-full text-left bg-slate-950/40 border rounded p-1.5 hover:border-blue-500 transition-colors ${pickedRank === c.rank ? 'border-blue-500' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 w-7 shrink-0 text-right">{c.rank}.</span>
                  <span className="text-xs font-semibold text-slate-100 truncate">{c.name}</span>
                  <Chip>{c.sector}</Chip>
                </div>
                <span className="text-[11px] font-mono text-amber-300 shrink-0">₩{fmtNum(c.marketCapKRW, 1)}조</span>
              </div>
            </button>
          ))}
        </div>
      </Panel>

      {picked && (
        <Panel title={`${picked.name} 상세`}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
            <Stat label="순위"      value={`${picked.rank}위`} />
            <Stat label="시가총액"  value={`₩${fmtNum(picked.marketCapKRW, 1)}조`} color="text-amber-300" />
            <Stat label="섹터"      value={picked.sector} />
            <Stat label="상장"      value={picked.listed} />
            {picked.ticker && <Stat label="종목코드"  value={picked.ticker} />}
            <Stat label="설립"      value={`${picked.founded}년`} />
            <Stat label="본사"      value={picked.hq} />
            <Stat label="대표"      value={picked.ceo} />
            <Stat label="임직원"    value={`${fmtInt(picked.employees)}명`} />
          </div>
          <div className="mt-2 text-[10px] text-slate-500">회사 개요</div>
          <div className="text-[11px] text-slate-200 leading-relaxed">{picked.description}</div>
          <div className="mt-2 text-[10px] text-slate-500">최근 투자·이슈</div>
          <ul className="text-[11px] text-slate-300 space-y-0.5">
            {picked.recentMoves.map((m, i) => <li key={i}>· {m}</li>)}
          </ul>
          <div className="mt-3 pt-2 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 mb-1">정부 대응 (결정 모드)</div>
            <div className="grid grid-cols-2 gap-1">
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}의 신규 투자(공장·연구소·인프라)에 정부 보조금·세제 혜택을 지원한다.`, `${picked.name} 투자 지원`)}
                className="btn text-[10px] py-1 disabled:opacity-40">💰 투자 지원</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name} ${picked.ceo} 대표와 청와대 간담회를 개최하고 ${picked.sector} 산업 발전 방안을 논의한다.`, `${picked.name} 청와대 간담회`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🏛️ 청와대 간담회</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}의 해외 진출·수출을 위해 외교적 지원을 제공한다 (정상 방문·수주 외교).`, `${picked.name} 수출 외교`)}
                className="btn text-[10px] py-1 disabled:opacity-40">🌏 수출 외교</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.name}에 대한 공정거래위원회·국세청 합동 조사를 지시한다.`, `${picked.name} 공정위 조사`)}
                className="btn-danger text-[10px] py-1 disabled:opacity-40">⚖️ 합동 조사</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.sector} 분야에 대한 규제 완화 패키지를 발표한다.`, `${picked.sector} 규제 완화`)}
                className="btn text-[10px] py-1 disabled:opacity-40">📉 규제 완화</button>
              <button disabled={!!busy} onClick={() => issueDecision(`${picked.sector} 분야에 대한 규제 강화·재벌개혁을 추진한다.`, `${picked.sector} 규제 강화`)}
                className="btn-danger text-[10px] py-1 disabled:opacity-40">📈 규제 강화</button>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">※ 클릭 시 결정 모드로 전송됩니다.</div>
          </div>
        </Panel>
      )}

      <Panel title="섹터별 합산 시가총액">
        {(() => {
          const bySector: Record<string, number> = {};
          for (const c of companies) bySector[c.sector] = (bySector[c.sector] ?? 0) + c.marketCapKRW;
          const sorted = Object.entries(bySector).sort((a, b) => b[1] - a[1]);
          const max = sorted[0]?.[1] ?? 1;
          return sorted.map(([s, v]) => (
            <div key={s} className="flex items-center gap-2 text-xs mb-0.5">
              <span className="w-28 truncate text-slate-300">{s}</span>
              <div className="flex-1 bar-bg h-2">
                <div className="bar-fill bg-amber-500" style={{ width: `${(v / max) * 100}%` }} />
              </div>
              <span className="w-16 text-right font-mono text-amber-300">₩{fmtNum(v, 0)}조</span>
            </div>
          ));
        })()}
      </Panel>
    </>
  );
}

// ============ 문화 ============
function CultureTab() {
  const c = useGame(s => s.state!.cultural);
  return (
    <>
      <Panel title="한류·K-콘텐츠 글로벌">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="한류 종합지수"       value={`${c.hallyu.overallIndex}/100`} color="text-amber-300" />
          <Stat label="K-POP 음반 수출"     value={`$${c.hallyu.musicExportUSD}M`} />
          <Stat label="콘텐츠 수출 총"      value={`$${fmtInt(c.hallyu.contentExportUSD)}M`} />
          <Stat label="해외 한국어 학습자"  value={`${fmtInt(c.hallyu.foreignKoreanLearners)}만명`} />
          <Stat label="세종학당·문화원"     value={`${c.hallyu.overseasKoreanCenters}곳`} />
          <Stat label="Netflix 한국 점유"   value={fmtPct(c.hallyu.netflixKoreanShare)} />
        </div>
      </Panel>
      <Panel title="UNESCO 등재">
        <Stat label="세계유산"       value={`${c.unesco.worldHeritageCount}건`} />
        <Stat label="인류무형유산"   value={`${c.unesco.intangibleHeritageCount}건`} />
        <Stat label="세계기록유산"   value={`${c.unesco.memoryOfWorldCount}건`} />
        <div className="text-[10px] text-slate-500 mt-1">최근 등재</div>
        <ul className="text-[11px] text-slate-300 space-y-0.5">
          {c.unesco.recentRegistrations.map((r, i) => <li key={i}>· {r}</li>)}
        </ul>
      </Panel>
      <Panel title="영화·OTT">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="연 관객수"           value={`${fmtInt(c.domesticContent.movieAnnualAudience)}만명`} />
          <Stat label="박스오피스"          value={`₩${fmtInt(c.domesticContent.boxOfficeBillionKRW)}10억`} />
          <Stat label="한국영화 점유율"     value={fmtPct(c.domesticContent.koreanMovieShare)} />
          <Stat label="Netflix"             value={`${fmtInt(c.domesticContent.netflixSubscribers)}만`} />
          <Stat label="TVING"               value={`${fmtInt(c.domesticContent.tvingSubscribers)}만`} />
          <Stat label="Wavve"               value={`${fmtInt(c.domesticContent.wavveSubscribers)}만`} />
        </div>
        <div className="text-[10px] text-slate-500 mt-2">주요 영화감독</div>
        <ul className="text-[11px] text-slate-300 space-y-0.5">
          {c.notableDirectors.map((d, i) => <li key={i}>· {d}</li>)}
        </ul>
      </Panel>
      <Panel title="음악">
        <Stat label="국내 음악 시장"  value={`₩${fmtInt(c.music.domesticAnnualSalesBillionKRW)}10억`} />
        <Stat label="멜론 MAU"        value={`${c.music.melonMauMillion}백만`} />
        <div className="text-[10px] text-slate-500 mt-2">대표 K-POP 그룹</div>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {c.music.topGroups.map((g, i) => (
            <div key={i} className="bg-slate-950/40 border border-slate-800 rounded p-1 text-[10px]">
              <div className="text-slate-200 font-semibold">{g.name}</div>
              <div className="text-slate-500">{g.agency} · {g.debut}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="게임·웹툰·이스포츠">
        <Stat label="게임 산업 매출"   value={`$${c.games.industryRevenueBillionUSD}B`} />
        <Stat label="웹툰 매출"        value={`₩${fmtInt(c.games.webtoonRevenueBillionKRW)}10억`} />
        <Stat label="이스포츠 세계랭킹" value={`${c.games.globalEsportsRanking}위`} color="text-amber-300" />
        <div className="text-[10px] text-slate-500 mt-1">대표 퍼블리셔</div>
        <div className="text-[11px] text-slate-300">{c.games.topPublishers.join(' · ')}</div>
      </Panel>
      <Panel title="스포츠">
        <div className="grid grid-cols-3 gap-x-3 gap-y-1">
          <Stat label="🥇" value={`${c.sports.olympicGoldRecord}`} />
          <Stat label="🥈" value={`${c.sports.olympicSilverRecord}`} />
          <Stat label="🥉" value={`${c.sports.olympicBronzeRecord}`} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="KBO 관중"        value={`${c.sports.kboAttendanceMillions}백만`} />
          <Stat label="K리그 관중"      value={`${c.sports.kleagueAttendanceMillions}백만`} />
          <Stat label="FIFA 랭킹"       value={`${c.sports.fifaRanking}위`} />
          <Stat label="국기"            value={c.sports.nationalSports} />
        </div>
      </Panel>
      <Panel title="출판·도서">
        <Stat label="독서율"           value={fmtPct(c.publishing.annualReadingRate)} />
        <Stat label="연간 출판"        value={`${c.publishing.booksPublishedAnnually}만권`} />
        <Stat label="도서관 수"        value={`${fmtInt(c.publishing.librariesNationwide)}개`} />
      </Panel>
      <Panel title="종교 분포">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <Stat label="무교"   value={fmtPct(c.religion.none)} />
          <Stat label="개신교" value={fmtPct(c.religion.protestant)} />
          <Stat label="천주교" value={fmtPct(c.religion.catholic)} />
          <Stat label="불교"   value={fmtPct(c.religion.buddhist)} />
          <Stat label="기타"   value={fmtPct(c.religion.other)} />
        </div>
      </Panel>
      <Panel title="문화 인프라·예산">
        <Stat label="박물관·미술관" value={`${fmtInt(c.museums)}곳`} />
        <Stat label="도서관"        value={`${fmtInt(c.libraries)}곳`} />
        <Stat label="공연장"        value={`${fmtInt(c.performanceVenues)}곳`} />
        <Stat label="문체부 예산"   value={`₩${c.culturalBudgetKRW}조`} />
        <div className="text-[10px] text-slate-500 mt-2">언어</div>
        <Stat label="표준어"        value={c.language.standardName} />
        <Stat label="활동 방언"     value={`${c.language.activeDialects}개`} />
        <Stat label="한글날"        value={c.language.hangulDay} />
      </Panel>
    </>
  );
}

// ============ 선거 일정 ============
function ElectionsTab() {
  const elections = useGame(s => s.state!.elections);
  const today = useGame(s => s.state!.clock.currentDate);
  const pastTerms = useGame(s => s.state!.pastTerms);
  const upcoming = elections.filter(e => !e.occurred && e.date >= today).slice(0, 30);
  const past = elections.filter(e => e.occurred).slice(-15).reverse();

  const typeLabel = (t: string) => ({
    PRESIDENTIAL: '🇰🇷 대선', GENERAL: '🏛️ 총선', LOCAL: '🗳️ 지선',
    BY: '🔁 재보궐', REFERENDUM: '📜 국민투표',
  } as any)[t] ?? t;
  const typeColor = (t: string) => ({
    PRESIDENTIAL: 'text-red-300 border-red-700 bg-red-900/30',
    GENERAL: 'text-blue-300 border-blue-700 bg-blue-900/30',
    LOCAL: 'text-emerald-300 border-emerald-700 bg-emerald-900/30',
  } as any)[t] ?? 'text-slate-300';

  return (
    <>
      <Panel title={`예정된 선거 (${upcoming.length})`}>
        {upcoming.length === 0 && <div className="text-[11px] text-slate-500 text-center py-2">예정된 선거가 없습니다.</div>}
        <div className="space-y-1">
          {upcoming.map(e => {
            const daysLeft = Math.floor((new Date(e.date).getTime() - new Date(today).getTime()) / 86400000);
            return (
              <div key={e.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${typeColor(e.type)}`}>{typeLabel(e.type)}</span>
                  <span className="text-[10px] text-slate-400">{e.date} · D-{daysLeft}</span>
                </div>
                <div className="text-xs font-semibold text-slate-100">{e.name}</div>
                <div className="text-[10px] text-slate-400">{e.desc}</div>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title="과거 임기 평가">
        {pastTerms.length === 0
          ? <div className="text-[11px] text-slate-500 text-center py-2">아직 종료된 임기가 없습니다.</div>
          : pastTerms.map(t => (
            <div key={t.startDate} className="bg-slate-950/40 border border-slate-800 rounded p-2 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">제{t.termNumber}대 {t.president.name}</span>
                <span className={`text-lg font-bold ${
                  t.grade === 'S' ? 'text-yellow-300' : t.grade === 'A' ? 'text-emerald-300' :
                  t.grade === 'B' ? 'text-lime-300' : t.grade === 'C' ? 'text-blue-300' :
                  t.grade === 'D' ? 'text-orange-300' : 'text-red-300'}`}>{t.grade}</span>
              </div>
              <div className="text-[10px] text-slate-500">{t.startDate} ~ {t.endDate} · {t.president.party} · 점수 {t.totalScore.toFixed(1)}/100</div>
              <div className="text-[10px] text-slate-300 mt-0.5">{t.finalNote}</div>
            </div>
          ))}
      </Panel>
      <Panel title={`최근 실시된 선거 (${past.length})`}>
        <div className="space-y-1">
          {past.map(e => (
            <div key={e.id} className="bg-slate-950/30 border border-slate-800 rounded p-1.5 text-xs opacity-80">
              <div className="flex items-center justify-between text-[10px]">
                <span className={`px-1.5 py-0.5 rounded border ${typeColor(e.type)}`}>{typeLabel(e.type)}</span>
                <span className="text-slate-500">{e.date} ✓</span>
              </div>
              <div className="text-slate-200">{e.name}</div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ============ 사건 로그 ============
function EventsTab() {
  const events = useGame(s => s.state!.events);
  const select = useGame(s => s.selectEvent);
  const dismiss = useGame(s => s.dismissEvent);
  const [tab, setTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const list = tab === 'PENDING' ? events.filter(e => !e.resolved) : events;
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
                {ev.mandatory && <Chip color="text-red-300 border-red-700 bg-red-900/40">필수</Chip>}
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
                {!ev.mandatory && <button onClick={() => dismiss(ev.id)} className="btn text-[10px] py-1 px-2">무시</button>}
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

// ============ 국제 (국제기구 + 분쟁) ============
function IntlTab() {
  const i = useGame(s => s.state!.international);
  const orgs = useGame(s => s.state!.intlOrgs);
  const countries = useGame(s => s.state!.countries);
  const worldEvents = useGame(s => s.state!.worldEvents);
  const treaties = useGame(s => s.state!.treaties);
  const joinOrg = useGame(s => s.joinOrg);
  const leaveOrg = useGame(s => s.leaveOrg);
  const createOrg = useGame(s => s.createOrg);
  const deleteOrg = useGame(s => s.deleteOrg);
  const [section, setSection] = useState<'FEED' | 'WORLD' | 'ORGS' | 'CONFLICTS' | 'CREATE' | 'TREATIES'>('FEED');
  const [pickedOrgId, setPickedOrg] = useState<string | null>(null);
  const pickedOrg = orgs.find(o => o.id === pickedOrgId);
  const [newOrg, setNewOrg] = useState<{ name: string; fullName: string; type: import('../types/game').IntlOrg['type']; hq: string; desc: string; foundingMembers: string[] }>({
    name: '', fullName: '', type: 'REGIONAL', hq: '서울', desc: '', foundingMembers: [],
  });
  const memberNames = pickedOrg
    ? pickedOrg.memberCountries.map(cid => {
        if (cid === 'KR') return '🇰🇷 대한민국';
        const c = countries.find(x => x.id === cid);
        return c ? `${c.flag} ${c.name}` : cid;
      })
    : [];

  return (
    <>
      <div className="flex gap-1 flex-wrap">
        {(['FEED','WORLD','ORGS','CONFLICTS','TREATIES','CREATE'] as const).map(t => (
          <button key={t} onClick={() => setSection(t)}
            className={`text-[10px] px-2 py-1 rounded ${section === t ? 'bg-rok-blue text-white' : 'bg-slate-800 text-slate-300'}`}>
            {t === 'FEED' ? '🌐 국제 정세' : t === 'WORLD' ? '세계 경제' : t === 'ORGS' ? '국제기구' : t === 'CONFLICTS' ? '진행 분쟁' : t === 'TREATIES' ? '📜 조약' : '🆕 기구 창설'}
          </button>
        ))}
      </div>

      {section === 'FEED' && (
        <Panel title={`능동 국제정세 피드 (${worldEvents.length})`} right={<span className="text-[10px] text-emerald-300">⏱ 매 턴 갱신</span>}>
          {worldEvents.length === 0 && (
            <div className="text-[11px] text-slate-500 text-center py-3">
              턴을 진행하면 AI가 한국 외 국가들의 능동적 행동을 생성합니다.
            </div>
          )}
          <div className="space-y-1.5">
            {worldEvents.map(w => {
              const impactColor = ({
                NONE: 'text-slate-400',
                LOW:  'text-slate-300',
                MED:  'text-yellow-300',
                HIGH: 'text-red-300',
              } as any)[w.koreaImpact];
              const catLabel = ({
                DIPLOMACY: '외교', WAR: '전쟁', ECONOMY: '경제',
                DOMESTIC: '내정', TECH: '과학기술', DISASTER: '재난',
                LEADERSHIP: '지도부', TREATY: '조약',
              } as any)[w.category] ?? w.category;
              return (
                <div key={w.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1 text-[10px]">
                      <Chip>{catLabel}</Chip>
                      <span className="text-slate-500">{w.date}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400">{w.involvedCountries.slice(0, 4).join(', ')}</span>
                    </div>
                    <span className={`text-[10px] ${impactColor}`}>한국영향 {w.koreaImpact}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100">{w.headline}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{w.body}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {section === 'TREATIES' && (
        <Panel title={`체결 조약 (${treaties.length})`}>
          {treaties.length === 0 && <div className="text-[11px] text-slate-500 text-center py-3">아직 체결된 조약이 없습니다. 채팅에서 "X와 평화조약 체결" 등을 결정하면 AI가 조약 액션을 발행합니다.</div>}
          <div className="space-y-1.5">
            {treaties.map(t => (
              <div key={t.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-slate-100">{t.name}</span>
                  <Chip color={
                    t.victor === 'KOREA' ? 'text-emerald-300 border-emerald-700 bg-emerald-900/30' :
                    t.victor === 'OPPONENT' ? 'text-red-300 border-red-700 bg-red-900/30' :
                    'text-slate-300 border-slate-700'
                  }>{
                    t.victor === 'KOREA' ? '한국 승리' :
                    t.victor === 'OPPONENT' ? '상대 승리' :
                    t.victor === 'COALITION' ? '연합 승리' : '무승부'
                  }</Chip>
                </div>
                <div className="text-[10px] text-slate-500">{t.signedAt} · 당사국 {t.parties.join(', ')}</div>
                <div className="text-[11px] text-slate-300 mt-1">{t.summary}</div>
                <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                  {t.terms.ceasefire && <div>· 휴전 발효</div>}
                  {t.terms.reparationsKRW !== undefined && t.terms.reparationsKRW !== 0 && (
                    <div className={t.terms.reparationsKRW > 0 ? 'text-emerald-300' : 'text-red-300'}>
                      · 배상금 {t.terms.reparationsKRW > 0 ? '수령' : '지불'} {Math.abs(t.terms.reparationsKRW)}조원
                    </div>
                  )}
                  {t.terms.territorialCession?.map((c, i) => (
                    <div key={i} className="text-amber-300">· 영토 할양: {c.fromCountryId} → {c.toCountryId} ({c.description}, {c.sizePercent}%)</div>
                  ))}
                  {t.terms.newCountries?.map((n, i) => (
                    <div key={i} className="text-cyan-300">· 신생 독립국: {n.name} ({n.fromCountryId} 분리)</div>
                  ))}
                  {t.terms.annexations?.map((a, i) => (
                    <div key={i} className="text-red-300">· 완전 합병: {a.absorberId} ← {a.absorbedId}</div>
                  ))}
                  {t.terms.alliances && t.terms.alliances.length > 0 && (
                    <div className="text-blue-300">· 동맹: {t.terms.alliances.join(', ')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {section === 'WORLD' && (
        <>
          <Panel title="세계 경제">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <Stat label="세계 GDP 성장" value={fmtPct(i.globalEconomy.worldGdpGrowth)} />
              <Stat label="미국 성장"     value={fmtPct(i.globalEconomy.usGrowth)} />
              <Stat label="중국 성장"     value={fmtPct(i.globalEconomy.chinaGrowth)} />
              <Stat label="EU 성장"       value={fmtPct(i.globalEconomy.euGrowth)} />
              <Stat label="WTI"           value={`$${fmtNum(i.globalEconomy.oilPriceWTI, 1)}`} />
              <Stat label="Brent"         value={`$${fmtNum(i.globalEconomy.oilPriceBrent, 1)}`} />
              <Stat label="금"            value={`$${fmtInt(i.globalEconomy.goldPrice)}/oz`} />
              <Stat label="달러지수"      value={fmtNum(i.globalEconomy.dxy, 1)} />
            </div>
          </Panel>
          <Panel title="글로벌 증시">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <Stat label="S&P 500"   value={fmtInt(i.sp500)} />
              <Stat label="Nasdaq"    value={fmtInt(i.nasdaq)} />
              <Stat label="니케이225" value={fmtInt(i.nikkei)} />
              <Stat label="항셍"      value={fmtInt(i.hangseng)} />
              <Stat label="상하이"    value={fmtInt(i.shanghai)} />
              <Stat label="비트코인"  value={`$${fmtInt(i.bitcoin)}`} />
            </div>
          </Panel>
          <Panel title="현재 글로벌 이슈">
            <ul className="text-[11px] text-slate-300 space-y-0.5">
              {i.globalIssues.map((g, idx) => <li key={idx}>· {g}</li>)}
            </ul>
          </Panel>
        </>
      )}

      {section === 'ORGS' && (
        <>
          <Panel title={`국제기구 (가입 ${orgs.filter(o => o.koreaMember).length}/${orgs.length})`}>
            <div className="space-y-1">
              {orgs.map(o => (
                <button key={o.id} onClick={() => setPickedOrg(o.id)}
                  className={`w-full text-left bg-slate-950/40 border rounded p-1.5 text-xs hover:border-blue-500 ${pickedOrgId === o.id ? 'border-blue-500' : 'border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-semibold">{o.name}</span>
                    {o.koreaMember
                      ? <Chip color="text-emerald-300 border-emerald-800 bg-emerald-900/30">{o.koreaRole}</Chip>
                      : <Chip color="text-slate-400">비회원</Chip>}
                  </div>
                  <div className="text-[10px] text-slate-500">{o.fullName ?? ''} · {o.founded} · HQ: {o.hq}</div>
                </button>
              ))}
            </div>
          </Panel>
          {pickedOrg && (
            <Panel title={pickedOrg.name}>
              <Stat label="유형"   value={pickedOrg.type} />
              <Stat label="설립"   value={pickedOrg.founded} />
              <Stat label="본부"   value={pickedOrg.hq} />
              <Stat label="회원국" value={`${pickedOrg.memberCountries.length}개`} />
              <Stat label="한국지위" value={pickedOrg.koreaMember ? pickedOrg.koreaRole : '비회원'} />
              {pickedOrg.contributionUSD && <Stat label="연 분담금" value={`$${pickedOrg.contributionUSD}M`} />}
              <div className="text-[11px] text-slate-300 mt-2">{pickedOrg.desc}</div>
              {pickedOrg.benefits && <div className="text-[10px] text-emerald-300 mt-1">혜택: {pickedOrg.benefits}</div>}
              {pickedOrg.notes && <div className="text-[10px] text-orange-300 mt-1">비고: {pickedOrg.notes}</div>}
              <div className="mt-2 text-[10px] text-slate-500">회원국 ({pickedOrg.memberCountries.length})</div>
              <div className="text-[11px] text-slate-300 max-h-32 overflow-y-auto leading-relaxed">
                {memberNames.length ? memberNames.join(', ') : '- 회원국 정보 없음 -'}
              </div>
              <div className="mt-2 flex gap-1">
                {pickedOrg.koreaMember
                  ? <button onClick={() => { if (confirm(`${pickedOrg.name}에서 탈퇴하시겠습니까? 회원국과의 신뢰가 떨어집니다.`)) leaveOrg(pickedOrg.id); }}
                            className="btn-danger flex-1 text-[11px]">탈퇴</button>
                  : <button onClick={() => joinOrg(pickedOrg.id)} className="btn-primary flex-1 text-[11px]">가입 신청</button>}
                {pickedOrg.id.startsWith('CUSTOM_') && (
                  <button onClick={() => { if (confirm(`${pickedOrg.name}을(를) 영구 해체하시겠습니까?`)) { deleteOrg(pickedOrg.id); setPickedOrg(null); } }}
                          className="btn-danger text-[11px]">기구 해체</button>
                )}
              </div>
            </Panel>
          )}
        </>
      )}

      {section === 'CREATE' && (
        <Panel title="🆕 신규 국제기구 창설">
          <div className="text-[11px] text-slate-400 mb-2 leading-relaxed">
            대한민국이 주도하는 새로운 다자기구를 창설합니다. 창설국 참여국과의 외교 관계가 강화되고,
            서구·동구 진영에 따라 다른 국가들의 반응이 갈립니다.
          </div>
          <div className="space-y-1.5">
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">기구 이름 (약칭)</label>
              <input className="input w-full text-xs" placeholder="예: AICN" value={newOrg.name}
                onChange={e => setNewOrg({ ...newOrg, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">정식 명칭</label>
              <input className="input w-full text-xs" placeholder="예: Asian Inclusive Cooperation Network" value={newOrg.fullName}
                onChange={e => setNewOrg({ ...newOrg, fullName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">유형</label>
                <select className="input w-full text-xs" value={newOrg.type}
                  onChange={e => setNewOrg({ ...newOrg, type: e.target.value as any })}>
                  <option value="UN">UN 산하</option>
                  <option value="SECURITY">안보</option>
                  <option value="ECONOMIC">경제</option>
                  <option value="TRADE">무역</option>
                  <option value="CULTURAL">문화</option>
                  <option value="HEALTH">보건</option>
                  <option value="ENVIRONMENT">환경·기후</option>
                  <option value="REGIONAL">지역</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">본부 (도시)</label>
                <input className="input w-full text-xs" value={newOrg.hq}
                  onChange={e => setNewOrg({ ...newOrg, hq: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">설립 취지·역할</label>
              <textarea className="input w-full text-xs h-16" placeholder="예: 아시아 국가 간 디지털·AI 표준 협력"
                value={newOrg.desc} onChange={e => setNewOrg({ ...newOrg, desc: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">창설국 (한국 외, 클릭하여 토글 · {newOrg.foundingMembers.length}개 선택)</label>
              <div className="max-h-40 overflow-y-auto bg-slate-950/40 border border-slate-800 rounded p-1 space-y-0.5">
                {countries.filter(c => c.relation >= 30 || newOrg.foundingMembers.includes(c.id)).slice(0, 40).map(c => {
                  const picked = newOrg.foundingMembers.includes(c.id);
                  return (
                    <button key={c.id} onClick={() => {
                      setNewOrg({
                        ...newOrg,
                        foundingMembers: picked
                          ? newOrg.foundingMembers.filter(x => x !== c.id)
                          : [...newOrg.foundingMembers, c.id],
                      });
                    }} className={`w-full flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded ${picked ? 'bg-blue-700/40 border border-blue-600' : 'bg-slate-800/60 border border-slate-700'}`}>
                      <span>{c.flag} {c.name}</span>
                      <span className="text-slate-400">관계 {c.relation > 0 ? '+' : ''}{c.relation}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">※ 관계 30 이상 국가만 표시. 우호국이 많을수록 가입 가능성 ↑</div>
            </div>
            <button onClick={() => {
              if (!newOrg.name.trim()) return alert('기구 이름을 입력해 주세요.');
              if (!newOrg.desc.trim()) return alert('설립 취지를 입력해 주세요.');
              if (newOrg.foundingMembers.length === 0) {
                if (!confirm('창설국이 한국뿐입니다. 그래도 창설하시겠습니까?')) return;
              }
              createOrg(newOrg);
              setNewOrg({ name: '', fullName: '', type: 'REGIONAL', hq: '서울', desc: '', foundingMembers: [] });
              setSection('ORGS');
            }} className="btn-primary w-full text-[12px] py-2">🚀 창설 선언</button>
          </div>
        </Panel>
      )}

      {section === 'CONFLICTS' && (
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
      )}
    </>
  );
}

// ============ 언론 (매체 + 기사) ============
function MediaTab() {
  const media = useGame(s => s.state!.media);
  const articles = useGame(s => s.state!.articles);
  const [section, setSection] = useState<'OUTLETS' | 'ARTICLES'>('ARTICLES');
  const grouped: Record<string, typeof media> = {};
  for (const m of media) (grouped[m.type] ??= []).push(m);

  return (
    <>
      <div className="flex gap-1">
        {(['ARTICLES','OUTLETS'] as const).map(t => (
          <button key={t} onClick={() => setSection(t)}
            className={`text-[10px] px-2 py-1 rounded ${section === t ? 'bg-rok-blue text-white' : 'bg-slate-800 text-slate-300'}`}>
            {t === 'ARTICLES' ? '📰 기사' : '🏢 매체'}
          </button>
        ))}
      </div>

      {section === 'ARTICLES' && (
        <Panel title={`최근 보도 (${articles.length})`}>
          <div className="space-y-1.5">
            {articles.slice().reverse().map(a => {
              const outletInfo = media.find(m => m.id === a.outlet);
              return (
                <div key={a.id} className="bg-slate-950/40 border border-slate-800 rounded p-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-300 font-semibold">{outletInfo?.name ?? a.outlet}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-500">{a.date}</span>
                      <Chip>{categoryLabel(a.category)}</Chip>
                    </div>
                    <span className={`text-[9px] ${a.bias < -20 ? 'text-blue-300' : a.bias > 20 ? 'text-red-300' : 'text-slate-400'}`}>
                      {a.bias < -20 ? '진보' : a.bias > 20 ? '보수' : '중도'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100">{a.headline}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{a.lead}</div>
                  {a.body && <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">{a.body}</div>}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {section === 'OUTLETS' && (
        <Panel title={`언론 매체 (${media.length}개)`}>
          <div className="space-y-3">
            {Object.entries(grouped).map(([type, items]) => (
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
      )}
    </>
  );
}

// ============ SNS ============
function SnsTab() {
  const sns = useGame(s => s.state!.sns);
  const [section, setSection] = useState<'POSTS' | 'OVERVIEW'>('POSTS');
  const [platform, setPlatform] = useState<string | 'ALL'>('ALL');

  const filteredPosts = (platform === 'ALL'
    ? sns.recentPosts
    : sns.recentPosts.filter(p => p.platform === platform))
    .slice().reverse();

  return (
    <>
      <div className="flex gap-1">
        {(['POSTS','OVERVIEW'] as const).map(t => (
          <button key={t} onClick={() => setSection(t)}
            className={`text-[10px] px-2 py-1 rounded ${section === t ? 'bg-rok-blue text-white' : 'bg-slate-800 text-slate-300'}`}>
            {t === 'POSTS' ? '📱 게시물' : '📊 통계'}
          </button>
        ))}
      </div>

      {section === 'OVERVIEW' && (
        <>
          <Panel title="여론 모니터링">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">대통령 일일 언급량</div>
                <div className="text-2xl font-bold text-slate-100">{fmtInt(sns.presidentMentions)}만</div>
              </div>
              <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">종합 정서</div>
                <div className={`text-2xl font-bold ${sns.sentimentScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {sns.sentimentScore > 0 ? '+' : ''}{sns.sentimentScore.toFixed(0)}
                </div>
              </div>
            </div>
            <StatBar label="시위·집회 동력" value={sns.protestSentiment} valueLabel={`${sns.protestSentiment}/100`} inverted />
          </Panel>
          <Panel title={`플랫폼 (${sns.platforms.length})`}>
            <div className="space-y-1">
              {sns.platforms.map(p => (
                <div key={p.id} className="bg-slate-950/40 border border-slate-800 rounded p-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-semibold">{p.name}</span>
                    <span className="text-[10px] text-slate-500">{fmtInt(p.monthlyUsers)}만 MAU</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{p.mainAge} · {p.desc}</div>
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
        </>
      )}

      {section === 'POSTS' && (
        <Panel title={`최신 게시물 (${filteredPosts.length})`}>
          <div className="flex gap-1 flex-wrap mb-2">
            <button onClick={() => setPlatform('ALL')} className={`text-[10px] px-1.5 py-0.5 rounded ${platform === 'ALL' ? 'bg-blue-700' : 'bg-slate-800'}`}>전체</button>
            {sns.platforms.map(p => (
              <button key={p.id} onClick={() => setPlatform(p.id)}
                className={`text-[10px] px-1.5 py-0.5 rounded ${platform === p.id ? 'bg-blue-700' : 'bg-slate-800'}`}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            {filteredPosts.length === 0 && <div className="text-[11px] text-slate-500">게시물이 없습니다. 턴을 진행하면 AI가 새 게시물을 생성합니다.</div>}
            {filteredPosts.map(post => {
              const plat = sns.platforms.find(p => p.id === post.platform);
              return (
                <div key={post.id} className="bg-slate-950/40 border border-slate-800 rounded p-2 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="font-semibold text-slate-300">{plat?.name ?? post.platform}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300">{post.author}</span>
                      {post.handle && <span className="text-slate-500">{post.handle}</span>}
                    </div>
                    <span className="text-[9px] text-slate-500">{post.timestamp}</span>
                  </div>
                  <div className="text-slate-200 leading-relaxed">{post.content}</div>
                  <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                    <div className="flex gap-2">
                      <span>♥ {fmtInt(post.likes)}</span>
                      <span>↻ {fmtInt(post.reposts)}</span>
                      <span>💬 {fmtInt(post.comments)}</span>
                    </div>
                    <span className={`font-mono ${post.sentiment >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                      {post.sentiment > 0 ? '+' : ''}{post.sentiment}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </>
  );
}

// ====== 유틸 ======
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
