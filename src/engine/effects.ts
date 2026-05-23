import type { GameState, PartialEffects, ApprovalBreakdown } from '../types/game';

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

  // === 경제 자연 변동 (매일) ===
  const e = { ...s.economy };
  e.kospi = Math.max(500, Math.round(e.kospi + noise(15)));
  e.kosdaq = Math.max(300, Math.round(e.kosdaq + noise(5)));
  e.fxUsdKrw = Math.max(800, Math.min(2000, Math.round((e.fxUsdKrw + noise(3)) * 10) / 10));
  e.inflation = Math.round((e.inflation + noise(0.03)) * 100) / 100;
  e.unemployment = Math.max(0.5, Math.round((e.unemployment + noise(0.02)) * 100) / 100);
  e.consumerConfidence = clamp(e.consumerConfidence + noise(0.5), 0, 200);
  e.businessConfidence = clamp(e.businessConfidence + noise(0.5), 0, 200);
  e.vkospi = Math.max(8, e.vkospi + noise(0.4));
  e.treasury10y = Math.max(0.5, Math.round((e.treasury10y + noise(0.02)) * 100) / 100);

  // 일별 수출입 누적 (대략 일 수출 $1.8B, 수입 $1.6B 평균)
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

  // 히스토리 (주 1회 정도)
  if (cur.getDay() === 1) {
    e.history = [
      ...e.history.slice(-59),
      { date: newDate, gdp: e.gdpGrowth, cpi: e.inflation, unemp: e.unemployment, kospi: e.kospi, fxUsdKrw: e.fxUsdKrw },
    ];
  }
  s.economy = e;

  // === 지지율 회귀 + 노이즈 ===
  const drift = (s.approval.overall - 50) * -0.008;
  const newOverall = clamp(s.approval.overall + drift + noise(0.2), 0, 100);
  s.approval = {
    ...s.approval,
    overall: newOverall,
    history: cur.getDay() === 1
      ? [...s.approval.history.slice(-119), { date: newDate, value: Math.round(newOverall * 10) / 10 }]
      : s.approval.history,
  };

  // === SNS 정서 회귀 ===
  s.sns = { ...s.sns, sentimentScore: Math.round(Math.max(-100, Math.min(100, s.sns.sentimentScore * 0.985 + noise(0.4)))) };

  // === 안보 자연 변동 ===
  const sec = { ...s.security };
  sec.northKoreaTension = clamp(sec.northKoreaTension + noise(0.5));
  sec.cyberThreatLevel = clamp(sec.cyberThreatLevel + noise(0.3));
  s.security = sec;

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

  return s;
}
