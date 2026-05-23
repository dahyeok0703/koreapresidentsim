import type { GameState, PartialEffects, ApprovalBreakdown, Bill, GameEvent } from '../types/game';
import type { Sector } from '../data/companies';
import { ALL_BILL_TEMPLATES, AUTONOMOUS_ACTIONS } from '../data/bills';
import { FOREIGN_LEADER_TERMS } from '../data/foreignLeaders';
import { genId } from '../utils/id';
import { buildTermEvaluation } from './evaluation';

// 섹터별 코스피 베타 (시장 대비 변동성)
const SECTOR_BETA: Record<Sector, number> = {
  '반도체':            1.35,
  '전자·디스플레이':   1.10,
  '2차전지':           1.50,
  '자동차':            1.00,
  '조선·해양':         1.25,
  '철강·소재':         1.05,
  '화학·에너지':       1.10,
  '바이오·제약':       1.45,
  '인터넷·게임':       1.30,
  '금융·증권·보험':    0.80,
  '통신':              0.55,
  '유통·소비재':       0.85,
  '식품·외식':         0.70,
  '엔터·콘텐츠':       1.35,
  '건설·인프라':       1.05,
  '항공·운송':         1.15,
  '방산·항공우주':     1.20,
  '공기업':            0.50,
  '핀테크·스타트업':   0.95,
  '미디어':            0.75,
};

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

function shiftApproval(a: ApprovalBreakdown, delta: number): ApprovalBreakdown {
  const overall = clamp(a.overall + delta);
  const sub = delta * 0.75;
  const byAgeGroup: any = { ...a.byAgeGroup };
  for (const k of Object.keys(byAgeGroup)) byAgeGroup[k] = clamp(byAgeGroup[k] + sub);
  const byRegion: any = { ...a.byRegion };
  for (const k of Object.keys(byRegion)) byRegion[k] = clamp(byRegion[k] + sub);
  const byGender = { male: clamp(a.byGender.male + sub), female: clamp(a.byGender.female + sub) };
  const byIdeology = {
    progressive: clamp(a.byIdeology.progressive + sub),
    moderate: clamp(a.byIdeology.moderate + sub),
    conservative: clamp(a.byIdeology.conservative + sub),
  };
  const byPartyBase: any = { ...a.byPartyBase };
  for (const k of Object.keys(byPartyBase)) byPartyBase[k] = clamp(byPartyBase[k] + sub);
  const byIncome: any = { ...a.byIncome };
  for (const k of Object.keys(byIncome)) byIncome[k] = clamp(byIncome[k] + sub);
  const byEducation: any = { ...a.byEducation };
  for (const k of Object.keys(byEducation)) byEducation[k] = clamp(byEducation[k] + sub);
  return { ...a, overall, byAgeGroup, byRegion, byGender, byIdeology, byPartyBase, byIncome, byEducation };
}

export function applyEffects(state: GameState, eff: PartialEffects): GameState {
  let s: GameState = { ...state };

  let approval = { ...s.approval };
  if (typeof eff.approval === 'number') approval = shiftApproval(approval, eff.approval);
  if (eff.approvalByAge) {
    const byAgeGroup: any = { ...approval.byAgeGroup };
    for (const [k, v] of Object.entries(eff.approvalByAge)) byAgeGroup[k] = clamp((byAgeGroup[k] ?? 0) + (v as number));
    approval = { ...approval, byAgeGroup };
  }
  if (eff.approvalByRegion) {
    const byRegion: any = { ...approval.byRegion };
    for (const [k, v] of Object.entries(eff.approvalByRegion)) byRegion[k] = clamp((byRegion[k] ?? 0) + (v as number));
    approval = { ...approval, byRegion };
  }
  if (eff.approvalByIdeology) {
    const byIdeology: any = { ...approval.byIdeology };
    for (const [k, v] of Object.entries(eff.approvalByIdeology)) byIdeology[k] = clamp((byIdeology[k] ?? 0) + (v as number));
    approval = { ...approval, byIdeology };
  }
  if (eff.approvalByIncome) {
    const byIncome: any = { ...approval.byIncome };
    for (const [k, v] of Object.entries(eff.approvalByIncome)) byIncome[k] = clamp((byIncome[k] ?? 0) + (v as number));
    approval = { ...approval, byIncome };
  }
  const agesAvg = Object.values(approval.byAgeGroup).reduce((a, b) => a + b, 0) / 6;
  approval.overall = clamp(Math.round((approval.overall * 0.5 + agesAvg * 0.5) * 10) / 10);
  approval.history = [...approval.history.slice(-119), { date: s.clock.currentDate, value: Math.round(approval.overall * 10) / 10 }];
  s.approval = approval;

  if (eff.economy) {
    const e = { ...s.economy };
    for (const [k, v] of Object.entries(eff.economy)) {
      (e as any)[k] = Math.round(((e as any)[k] + (v as number)) * 100) / 100;
    }
    e.kospi = Math.max(500, Math.round(e.kospi));
    e.fxUsdKrw = Math.max(800, Math.min(2000, Math.round(e.fxUsdKrw)));
    e.unemployment = Math.max(0.5, e.unemployment);
    e.youthUnemployment = Math.max(0.5, e.youthUnemployment);
    e.inflation = Math.max(-3, e.inflation);
    e.baseRate = Math.max(0, Math.min(15, e.baseRate));
    s.economy = e;
  }
  if (eff.social) {
    const so = { ...s.social } as any;
    for (const [k, v] of Object.entries(eff.social)) so[k] = Math.round((so[k] + (v as number)) * 100) / 100;
    s.social = so;
  }
  if (eff.security) {
    const se = { ...s.security } as any;
    for (const [k, v] of Object.entries(eff.security)) {
      if (k === 'defconLevel') se.defconLevel = Math.max(1, Math.min(5, Math.round(v as number)));
      else if (k === 'watchcon') se.watchcon = Math.max(1, Math.min(4, Math.round(v as number)));
      else if (typeof se[k] === 'number') se[k] = clamp(se[k] + (v as number));
    }
    s.security = se;
  }
  if (eff.foreign) {
    s.countries = s.countries.map(f => {
      const delta = (eff.foreign as any)[f.id];
      if (!delta) return f;
      return {
        ...f,
        relation: Math.max(-100, Math.min(100, f.relation + (delta.relation ?? 0))),
        trustLevel: clamp(f.trustLevel + (delta.trust ?? 0)),
      };
    });
  }
  if (eff.judiciary) {
    const j = { ...s.judiciary };
    if (eff.judiciary.supremeTrust !== undefined) j.supremeCourt = { ...j.supremeCourt, publicTrust: clamp(j.supremeCourt.publicTrust + eff.judiciary.supremeTrust) };
    if (eff.judiciary.ccTrust !== undefined) j.constitutionalCourt = { ...j.constitutionalCourt, publicTrust: clamp(j.constitutionalCourt.publicTrust + eff.judiciary.ccTrust) };
    if (eff.judiciary.prosecutionTrust !== undefined) j.prosecution = { ...j.prosecution, publicTrust: clamp(j.prosecution.publicTrust + eff.judiciary.prosecutionTrust) };
    if (eff.judiciary.prosecutionIndep !== undefined) j.prosecution = { ...j.prosecution, independenceIndex: clamp(j.prosecution.independenceIndex + eff.judiciary.prosecutionIndep) };
    s.judiciary = j;
  }
  if (eff.sns) {
    const sn = { ...s.sns };
    if (eff.sns.sentiment !== undefined) sn.sentimentScore = Math.max(-100, Math.min(100, sn.sentimentScore + eff.sns.sentiment));
    if (eff.sns.protestSentiment !== undefined) sn.protestSentiment = clamp(sn.protestSentiment + eff.sns.protestSentiment);
    if (eff.sns.mentions !== undefined) sn.presidentMentions = Math.max(0, sn.presidentMentions + eff.sns.mentions);
    s.sns = sn;
  }

  return s;
}

// === 시간 진행: 일 단위 자연 변동 + 월말 정산 ===
export function advanceClock(state: GameState, days: number): GameState {
  let s: GameState = { ...state };
  for (let i = 0; i < days; i++) {
    s = advanceOneDay(s);
  }
  return s;
}

function advanceOneDay(state: GameState): GameState {
  const cur = new Date(state.clock.currentDate);
  cur.setDate(cur.getDate() + 1);
  const newDate = cur.toISOString().slice(0, 10);
  const newMonth = newDate.slice(0, 7);
  const lastMonth = state.economy.lastMonthlyReset.slice(0, 7);
  const isNewMonth = newMonth !== lastMonth;

  let s: GameState = {
    ...state,
    clock: {
      ...state.clock,
      currentDate: newDate,
      daysInOffice: state.clock.daysInOffice + 1,
    },
  };

  const noise = (range: number) => (Math.random() - 0.5) * range;
  const newDays = state.clock.daysInOffice + 1;
  // 수치 변동은 최소 4일 주기 (지지율·코스피·환율·심리·기업시총 등)
  const isFluctuationDay = newDays % 4 === 0;
  // 4일치 변동량을 한 번에 적용
  const FLUC = isFluctuationDay ? 4 : 0;

  // === 경제 자연 변동 (4일마다) ===
  const e = { ...s.economy };
  if (isFluctuationDay) {
    e.kospi = Math.max(500, Math.round(e.kospi + noise(15 * FLUC)));
    e.kosdaq = Math.max(300, Math.round(e.kosdaq + noise(5 * FLUC)));
    e.fxUsdKrw = Math.max(800, Math.min(2000, Math.round((e.fxUsdKrw + noise(3 * FLUC)) * 10) / 10));
    e.inflation = Math.round((e.inflation + noise(0.03 * FLUC)) * 100) / 100;
    e.unemployment = Math.max(0.5, Math.round((e.unemployment + noise(0.02 * FLUC)) * 100) / 100);
    e.consumerConfidence = clamp(e.consumerConfidence + noise(0.5 * FLUC), 0, 200);
    e.businessConfidence = clamp(e.businessConfidence + noise(0.5 * FLUC), 0, 200);
    e.vkospi = Math.max(8, e.vkospi + noise(0.4 * FLUC));
    e.treasury10y = Math.max(0.5, Math.round((e.treasury10y + noise(0.02 * FLUC)) * 100) / 100);
  }

  // 일별 수출입 누적 (실제 경제활동이므로 매일 반영)
  const dailyExport = 1.7 + noise(0.4);
  const dailyImport = 1.55 + noise(0.4);
  e.monthlyExportUSD = Math.round((e.monthlyExportUSD + dailyExport) * 10) / 10;
  e.monthlyImportUSD = Math.round((e.monthlyImportUSD + dailyImport) * 10) / 10;
  e.monthlyTradeBalanceUSD = Math.round((e.monthlyExportUSD - e.monthlyImportUSD) * 10) / 10;

  // === 월말 정산: 무역수지 → 외환보유고/국고 반영 후 리셋 ===
  if (isNewMonth) {
    const tradeBalance = e.monthlyTradeBalanceUSD; // $B
    // 무역흑자/적자 → 외환보유고 (10% 반영)
    e.fxReservesUSD = Math.max(100, Math.round((e.fxReservesUSD / 10 + tradeBalance * 0.1) * 10) / 10);
    e.fxReservesUSD = e.fxReservesUSD * 10; // 보정
    // 무역수지 → 국고에도 부분 반영 (세수효과, 흑자 시 +0.05조 / B$)
    const treasuryImpact = tradeBalance * 0.05; // 조원
    e.treasuryBalanceKRW = Math.round((e.treasuryBalanceKRW + treasuryImpact) * 100) / 100;
    e.ytdTradeBalanceUSD = Math.round((e.ytdTradeBalanceUSD + tradeBalance) * 10) / 10;
    e.currentAccountUSD = Math.round((e.currentAccountUSD + tradeBalance * 0.85) * 10) / 10;

    // 월별 누적 리셋
    e.monthlyExportUSD = 0;
    e.monthlyImportUSD = 0;
    e.monthlyTradeBalanceUSD = 0;
    e.lastMonthlyReset = newDate.slice(0, 8) + '01';

    // 1월 1일이면 연 누적도 리셋
    if (newDate.endsWith('-01-01')) {
      e.ytdTradeBalanceUSD = 0;
      e.currentAccountUSD = 0;
    }
  }

  // 히스토리 (4일 변동 사이클에 맞춰)
  if (isFluctuationDay) {
    e.history = [
      ...e.history.slice(-59),
      { date: newDate, gdp: e.gdpGrowth, cpi: e.inflation, unemp: e.unemployment, kospi: e.kospi, fxUsdKrw: e.fxUsdKrw },
    ];
  }
  // === 기업 시가총액 변동 (4일마다, 코스피와 동기화) ===
  if (isFluctuationDay) {
    const kospiBefore = state.economy.kospi;
    const kospiDelta = (e.kospi - kospiBefore) / kospiBefore;
    let updatedCompanies = s.companies.map(c => {
      const beta = SECTOR_BETA[c.sector] ?? 1.0;
      const idiosyncratic = (Math.random() - 0.5) * 0.025;
      const pct = kospiDelta * beta + idiosyncratic;
      const newCap = Math.max(0.1, c.marketCapKRW * (1 + pct));
      return { ...c, marketCapKRW: Math.round(newCap * 100) / 100 };
    });
    updatedCompanies.sort((a, b) => b.marketCapKRW - a.marketCapKRW);
    updatedCompanies = updatedCompanies.map((c, i) => ({ ...c, rank: i + 1 }));
    s.companies = updatedCompanies;
  }

  s.economy = e;

  // === 지지율 회귀 + 노이즈 (4일마다) ===
  if (isFluctuationDay) {
    const drift = (s.approval.overall - 50) * -0.008 * FLUC;
    const newOverall = clamp(s.approval.overall + drift + noise(0.2 * FLUC), 0, 100);
    s.approval = {
      ...s.approval,
      overall: newOverall,
      history: [...s.approval.history.slice(-119), { date: newDate, value: Math.round(newOverall * 10) / 10 }],
    };
  }

  // === SNS 정서 회귀 (4일마다) ===
  if (isFluctuationDay) {
    s.sns = { ...s.sns, sentimentScore: Math.round(Math.max(-100, Math.min(100, s.sns.sentimentScore * 0.94 + noise(1.5)))) };
  }

  // === 안보 자연 변동 (4일마다) ===
  if (isFluctuationDay) {
    const sec = { ...s.security };
    sec.northKoreaTension = clamp(sec.northKoreaTension + noise(2));
    sec.cyberThreatLevel = clamp(sec.cyberThreatLevel + noise(1.2));
    s.security = sec;
  }

  // === 전쟁 개입 비용 차감 ===
  if (s.security.warEngagements.length > 0) {
    let costTotal = 0;
    for (const w of s.security.warEngagements) {
      costTotal += w.costPerMonth / 30; // 일별 비용
    }
    s.economy = { ...s.economy, treasuryBalanceKRW: Math.round((s.economy.treasuryBalanceKRW - costTotal) * 100) / 100 };
  }

  // === 행정 업무 진척 (매일 작은 진척) ===
  s.adminTasks = s.adminTasks.map(t => {
    if (t.status !== 'PROGRESS') return t;
    const inc = t.priority === 'CRITICAL' ? 0.4 : t.priority === 'HIGH' ? 0.5 : t.priority === 'MED' ? 0.6 : 0.7;
    const next = Math.min(100, t.progress + inc + Math.random() * 0.3);
    return { ...t, progress: Math.round(next * 10) / 10, status: next >= 100 ? 'DONE' : 'PROGRESS' };
  });

  // === 국회 자동 법안 발의 + 자동 표결 ===
  s = processAssembly(s, newDate);

  // === 자율 행정 (며칠마다 한 번씩 부처/지자체 자체 조치) ===
  s = processAutonomousActions(s, newDate);

  // === 선거 발생 처리 ===
  s = processElections(s, newDate);

  // === 임기 종료 감지 → 평가표 생성 ===
  s = processTermEnd(s, newDate);

  // === 외국 정상 임기 자동 교체 ===
  s = processForeignLeaderRotation(s, newDate);

  // === 건축물 자동 완공 처리 ===
  s = processBuildingCompletion(s, newDate);

  return s;
}

// ---------------- 건축물 자동 완공 ----------------
function processBuildingCompletion(state: GameState, today: string): GameState {
  const completed: GameEvent[] = [];
  const updated = state.buildings.map(b => {
    if (b.status !== 'CONSTRUCTING') return b;
    if (!b.expectedCompletion) return b;
    if (today < b.expectedCompletion) return b;
    completed.push({
      id: genId('evt'),
      date: today,
      category: 'INFRA' as const,
      severity: 'MINOR' as const,
      headline: `[완공] ${b.name} 준공`,
      body: `${b.location}에 위치한 ${b.name}이(가) 예정대로 ${today} 완공돼 정식 가동에 들어갔다.`,
      source: '국토교통부',
      resolved: true,
    });
    return {
      ...b,
      status: 'OPERATING' as const,
      builtYear: new Date(today).getFullYear(),
    };
  });
  if (completed.length === 0) return state;
  return {
    ...state,
    buildings: updated,
    events: [...completed, ...state.events].slice(0, 200),
  };
}

// ---------------- 외국 정상 자동 교체 ----------------
function processForeignLeaderRotation(state: GameState, today: string): GameState {
  let s = state;
  const termPool = new Map(FOREIGN_LEADER_TERMS.map(l => [l.countryId, l]));
  let rotated = 0;
  const rotationEvents: GameEvent[] = [];
  s = {
    ...s,
    countries: s.countries.map(c => {
      if (!c.termEnd || c.termEnd > today) return c;
      const pool = termPool.get(c.id);
      if (!pool) return c;
      const idx = (c.successorIndex ?? 0);
      const newLeader = pool.successors[idx] ?? `신임 ${c.leader.split(' ')[0]} 후계자`;
      // 다음 임기 만료일 = 임기 시작일 + 통상 임기 (대선 5년, 총리 4년, 종신 100년)
      const termYears =
        c.leaderTitle.includes('국왕') || c.leaderTitle.includes('아미르') || c.leaderTitle.includes('술탄') ? 30 :
        c.leaderTitle.includes('주석') || c.leaderTitle.includes('총서기') || c.leaderTitle.includes('국무위원장') ? 5 :
        c.leaderTitle.includes('총리') || c.leaderTitle.includes('수상') ? 4 : 5;
      const nextEnd = new Date(today);
      nextEnd.setFullYear(nextEnd.getFullYear() + termYears);
      const nextEndStr = nextEnd.toISOString().slice(0, 10);
      rotated++;
      rotationEvents.push({
        id: genId('evt'),
        date: today,
        category: 'DIPLOMACY' as const,
        severity: 'MAJOR' as const,
        headline: `[정상 교체] ${c.name} 새 ${c.leaderTitle}: ${newLeader}`,
        body: `${c.name}에서 임기를 마친 ${c.leader} ${c.leaderTitle}의 후임으로 ${newLeader}이(가) 취임했다. ${c.name}의 정치 노선 변화 가능성에 주목.`,
        source: '외교부 / 국제부',
        resolved: true,
      });
      return {
        ...c,
        leader: newLeader,
        termEnd: nextEndStr,
        successorIndex: idx + 1,
        recentEvents: [`${c.leader} 임기 만료, 후임 ${newLeader}`, ...c.recentEvents].slice(0, 5),
      };
    }),
  };
  if (rotated > 0) {
    s = { ...s, events: [...rotationEvents, ...s.events].slice(0, 200) };
  }
  return s;
}

// ---------------- 선거 이벤트 발생 ----------------
function processElections(state: GameState, today: string): GameState {
  const newlyOccurred = state.elections.filter(e => !e.occurred && e.date <= today);
  if (newlyOccurred.length === 0) return state;
  const updated = state.elections.map(e =>
    !e.occurred && e.date <= today ? { ...e, occurred: true } : e);
  const newEvents: GameEvent[] = newlyOccurred.map(e => ({
    id: genId('evt'),
    date: today,
    category: 'POLITICS' as const,
    severity: e.type === 'PRESIDENTIAL' ? 'CRITICAL' : 'MAJOR' as const,
    headline: `[선거] ${e.name} 실시`,
    body: `${e.date} ${e.name}이(가) 전국 동시에 실시됐다. ${e.desc}`,
    source: '중앙선거관리위원회',
    resolved: true,
  }));
  return { ...state, elections: updated, events: [...newEvents, ...state.events].slice(0, 200) };
}

// ---------------- 임기 종료 감지 ----------------
function processTermEnd(state: GameState, today: string): GameState {
  if (state.flags.termEnded) return state;
  const end = state.president.termEndsAt;
  if (!end || today < end) return state;
  // 평가표 생성
  const evalReport = buildTermEvaluation(state, {
    approval: Number(state.flags.initApproval) || 55,
    kospi: Number(state.flags.initKospi) || 2735,
    fxUsdKrw: Number(state.flags.initFxKrw) || 1378,
    treasuryKRW: Number(state.flags.initTreasury) || 42.8,
    birthRate: Number(state.flags.initBirthRate) || 0.75,
    suicideRate: Number(state.flags.initSuicide) || 25.2,
    nkTension: Number(state.flags.initNkTension) || 62,
    usAlliance: Number(state.flags.initUsAlliance) || 80,
    judiciaryTrust: Number(state.flags.initJudiciaryTrust) || 48,
  });
  const endEvent: GameEvent = {
    id: genId('evt'),
    date: today,
    category: 'POLITICS',
    severity: 'CRITICAL',
    headline: `[임기 종료] ${state.president.name} 대통령 5년 임기 만료`,
    body: `${state.president.inauguratedAt}에 취임한 ${state.president.name} 대통령의 5년 임기가 ${today}로 만료됐다. 국정운영 평가표가 공개됐다.`,
    source: '청와대',
    resolved: true,
  };
  return {
    ...state,
    flags: { ...state.flags, termEnded: true, lastEvalGrade: evalReport.grade },
    pastTerms: [...state.pastTerms, evalReport],
    events: [endEvent, ...state.events].slice(0, 200),
  };
}

// ---------------- 국회 자동 법안 ----------------
function processAssembly(state: GameState, today: string): GameState {
  let s = state;
  const dayNum = state.clock.daysInOffice;

  // 3-5일마다 새 법안 발의 (확률 기반)
  if (dayNum > 0 && Math.random() < 0.3) {
    const tpl = ALL_BILL_TEMPLATES[Math.floor(Math.random() * ALL_BILL_TEMPLATES.length)];
    const bill: Bill = {
      id: genId('bill'),
      title: tpl.title,
      summary: tpl.summary,
      proposer: tpl.proposer,
      category: tpl.category,
      ideologyShift: tpl.ideologyShift,
      expectedEffects: tpl.expectedEffects,
      status: 'PENDING',
      introducedAt: today,
    };
    s = {
      ...s,
      assembly: { ...s.assembly, pendingBills: [bill, ...s.assembly.pendingBills].slice(0, 30) },
      events: [{
        id: genId('evt'),
        date: today,
        category: 'POLITICS' as const,
        severity: 'MINOR' as const,
        headline: `[국회 발의] ${tpl.title}`,
        body: `${tpl.proposer === 'RULING' ? '여당' : '야권'} 측이 ${tpl.title}을(를) 발의했다. ${tpl.summary}. 7일 내 본회의 표결 예정. 거부권 행사 가능.`,
        source: '국회 의사국',
        resolved: true,
      } as GameEvent, ...s.events].slice(0, 200),
    };
  }

  // 7일 이상 경과한 PENDING 법안 → 자동 표결
  const pendingNow = s.assembly.pendingBills;
  const stillPending: Bill[] = [];
  const newlyPassed: Bill[] = [];
  const newlyRejected: Bill[] = [];
  const events: GameEvent[] = [];

  for (const b of pendingNow) {
    const introducedDate = new Date(b.introducedAt);
    const daysSince = Math.floor((new Date(today).getTime() - introducedDate.getTime()) / 86400000);
    if (daysSince < 7) {
      stillPending.push(b);
      continue;
    }
    // 표결: 발의 측이 여당이고 여당이 과반이면 거의 통과
    // 발의 측이 야권이고 야권이 과반이면 통과 가능 (대통령 거부권 가능)
    const ruling = s.assembly.rulingCoalitionSeats;
    const isRulingProposed = b.proposer === 'RULING';
    let passProb: number;
    if (isRulingProposed) {
      passProb = ruling >= 151 ? 0.92 : 0.4;
    } else {
      // 야권 발의
      passProb = ruling < 151 ? 0.85 : 0.25;
    }
    if (Math.random() < passProb) {
      // 통과 → 효과 적용
      s = applyEffects(s, b.expectedEffects);
      const passed: Bill = { ...b, status: 'PASSED' };
      newlyPassed.push(passed);
      events.push({
        id: genId('evt'),
        date: today,
        category: 'POLITICS',
        severity: 'MODERATE',
        headline: `[국회 통과] ${b.title}`,
        body: `본회의에서 ${b.title}이(가) 가결됐다. ${b.summary}. 정책 효과가 즉시 반영된다.`,
        source: '국회 본회의',
        resolved: true,
      });
    } else {
      newlyRejected.push({ ...b, status: 'REJECTED' });
      events.push({
        id: genId('evt'),
        date: today,
        category: 'POLITICS',
        severity: 'MINOR',
        headline: `[국회 부결] ${b.title}`,
        body: `${b.title}이(가) 본회의에서 부결됐다.`,
        source: '국회 본회의',
        resolved: true,
      });
    }
  }

  if (newlyPassed.length || newlyRejected.length) {
    s = {
      ...s,
      assembly: {
        ...s.assembly,
        pendingBills: stillPending,
        passedBills: [...newlyPassed, ...s.assembly.passedBills].slice(0, 50),
      },
      events: [...events, ...s.events].slice(0, 200),
    };
  } else if (stillPending.length !== pendingNow.length) {
    s = { ...s, assembly: { ...s.assembly, pendingBills: stillPending } };
  }

  return s;
}

// ---------------- 자율 행정 액션 ----------------
function processAutonomousActions(state: GameState, today: string): GameState {
  // 매일 30% 확률로 1개의 자율 행정 액션 발생
  if (Math.random() > 0.3) return state;
  const act = AUTONOMOUS_ACTIONS[Math.floor(Math.random() * AUTONOMOUS_ACTIONS.length)];
  let s = state;
  if (act.effects) s = applyEffects(s, act.effects);
  const evt: GameEvent = {
    id: genId('evt'),
    date: today,
    category: act.category,
    severity: 'INFO',
    headline: `[자율 행정] ${act.headline}`,
    body: `${act.detail} 대통령 결재 없이 부처/지자체 자체 권한으로 처리됨.`,
    source: act.ministryHint ?? '관할 부처',
    resolved: true,
  };
  return { ...s, events: [evt, ...s.events].slice(0, 200) };
}
