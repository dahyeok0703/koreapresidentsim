import type { GameState, PartialEffects, ApprovalBreakdown } from '../types/game';
import { REGIONS } from '../data/regions';

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

function shiftApproval(a: ApprovalBreakdown, delta: number): ApprovalBreakdown {
  const overall = clamp(a.overall + delta);
  // 모든 하위 그룹을 비례적으로 이동 (75% 비율)
  const sub = delta * 0.75;
  const byAgeGroup: any = { ...a.byAgeGroup };
  for (const k of Object.keys(byAgeGroup)) byAgeGroup[k] = clamp(byAgeGroup[k] + sub);
  const byRegion: any = { ...a.byRegion };
  for (const k of Object.keys(byRegion)) byRegion[k] = clamp(byRegion[k] + sub);
  const byGender = {
    male: clamp(a.byGender.male + sub),
    female: clamp(a.byGender.female + sub),
  };
  const byIdeology = {
    progressive: clamp(a.byIdeology.progressive + sub),
    moderate: clamp(a.byIdeology.moderate + sub),
    conservative: clamp(a.byIdeology.conservative + sub),
  };
  const byPartyBase: any = { ...a.byPartyBase };
  for (const k of Object.keys(byPartyBase)) byPartyBase[k] = clamp(byPartyBase[k] + sub);
  return { ...a, overall, byAgeGroup, byRegion, byGender, byIdeology, byPartyBase };
}

export function applyEffects(state: GameState, eff: PartialEffects): GameState {
  let s: GameState = { ...state };

  // ----- 지지율 -----
  let approval = { ...s.approval };
  if (typeof eff.approval === 'number') {
    approval = shiftApproval(approval, eff.approval);
  }
  if (eff.approvalByAge) {
    const byAgeGroup: any = { ...approval.byAgeGroup };
    for (const [k, v] of Object.entries(eff.approvalByAge)) {
      byAgeGroup[k] = clamp((byAgeGroup[k] ?? 0) + (v as number));
    }
    approval = { ...approval, byAgeGroup };
  }
  if (eff.approvalByRegion) {
    const byRegion: any = { ...approval.byRegion };
    for (const [k, v] of Object.entries(eff.approvalByRegion)) {
      byRegion[k] = clamp((byRegion[k] ?? 0) + (v as number));
    }
    approval = { ...approval, byRegion };
  }
  if (eff.approvalByIdeology) {
    const byIdeology: any = { ...approval.byIdeology };
    for (const [k, v] of Object.entries(eff.approvalByIdeology)) {
      byIdeology[k] = clamp((byIdeology[k] ?? 0) + (v as number));
    }
    approval = { ...approval, byIdeology };
  }
  // 재계산: 하위 그룹 가중평균으로 overall 보정
  const agesAvg = Object.values(approval.byAgeGroup).reduce((a, b) => a + b, 0) / 5;
  approval.overall = clamp(Math.round((approval.overall * 0.5 + agesAvg * 0.5) * 10) / 10);
  // 히스토리 push
  approval.history = [
    ...approval.history.slice(-119),
    { date: s.clock.currentDate, value: Math.round(approval.overall * 10) / 10 },
  ];
  s.approval = approval;

  // ----- 경제 -----
  if (eff.economy) {
    const e = { ...s.economy };
    for (const [k, v] of Object.entries(eff.economy)) {
      (e as any)[k] = Math.round(((e as any)[k] + (v as number)) * 100) / 100;
    }
    // 보정
    e.kospi = Math.max(500, Math.round(e.kospi));
    e.fxUsdKrw = Math.max(800, Math.min(2000, Math.round(e.fxUsdKrw)));
    e.unemployment = Math.max(0.5, e.unemployment);
    e.youthUnemployment = Math.max(0.5, e.youthUnemployment);
    e.inflation = Math.max(-3, e.inflation);
    s.economy = e;
  }
  // ----- 사회 -----
  if (eff.social) {
    const so = { ...s.social } as any;
    for (const [k, v] of Object.entries(eff.social)) {
      so[k] = Math.round((so[k] + (v as number)) * 100) / 100;
    }
    s.social = so;
  }
  // ----- 안보 -----
  if (eff.security) {
    const se = { ...s.security } as any;
    for (const [k, v] of Object.entries(eff.security)) {
      if (k === 'defconLevel') {
        se.defconLevel = Math.max(1, Math.min(5, Math.round(v as number)));
      } else {
        se[k] = clamp(se[k] + (v as number));
      }
    }
    s.security = se;
  }
  // ----- 외교 -----
  if (eff.foreign) {
    s.foreign = s.foreign.map(f => {
      const delta = (eff.foreign as any)[f.id];
      if (!delta) return f;
      return {
        ...f,
        relation: Math.max(-100, Math.min(100, f.relation + (delta.relation ?? 0))),
        trustLevel: clamp(f.trustLevel + (delta.trust ?? 0)),
      };
    });
  }

  return s;
}

// ----- 자연 시간 경과 효과 (한 턴 = 7일) -----
export function advanceClock(state: GameState, days: number): GameState {
  const cur = new Date(state.clock.currentDate);
  cur.setDate(cur.getDate() + days);
  const newDate = cur.toISOString().slice(0, 10);

  let s: GameState = {
    ...state,
    clock: {
      ...state.clock,
      currentDate: newDate,
      daysInOffice: state.clock.daysInOffice + days,
      turnNumber: state.clock.turnNumber + 1,
    },
  };

  // 자연스러운 변동 (러닝 노이즈)
  const noise = (range: number) => (Math.random() - 0.5) * range;
  const e = { ...s.economy };
  e.kospi = Math.max(500, Math.round(e.kospi + noise(60)));
  e.kosdaq = Math.max(300, Math.round(e.kosdaq + noise(20)));
  e.fxUsdKrw = Math.max(800, Math.min(2000, Math.round(e.fxUsdKrw + noise(8))));
  e.inflation = Math.round((e.inflation + noise(0.15)) * 100) / 100;
  e.unemployment = Math.max(0.5, Math.round((e.unemployment + noise(0.1)) * 100) / 100);
  e.consumerConfidence = clamp(e.consumerConfidence + noise(3), 0, 200);
  e.businessConfidence = clamp(e.businessConfidence + noise(3), 0, 200);
  e.history = [
    ...e.history.slice(-59),
    { date: newDate, gdp: e.gdpGrowth, cpi: e.inflation, unemp: e.unemployment, kospi: e.kospi },
  ];
  s.economy = e;

  // 지지율 회귀 (극값에서 평균으로 약하게 수렴)
  const drift = (s.approval.overall - 50) * -0.03;
  s.approval = {
    ...s.approval,
    overall: clamp(s.approval.overall + drift + noise(0.6), 0, 100),
    history: [
      ...s.approval.history.slice(-119),
      { date: newDate, value: Math.round((s.approval.overall + drift) * 10) / 10 },
    ],
  };

  return s;
}
