// 외국이 한국에 가하는 능동적 보복 액션 풀.
// 관계 악화 + 한국 약점에 따라 트리거.

import type { PartialEffects, GameEvent } from '../types/game';

export interface RetaliationTemplate {
  countryId: string;
  headline: string;
  body: string;
  category: GameEvent['category'];
  severity: GameEvent['severity'];
  effects: PartialEffects;
  trigger?: {
    relationBelow?: number;            // 관계가 이 값 미만일 때만
    nkTensionAbove?: number;
    militaryReadinessBelow?: number;
    treasuryBelow?: number;            // 한국 국고 약할 때만
  };
}

export const RETALIATIONS: RetaliationTemplate[] = [
  // ─── 미국 ───
  { countryId: 'US', trigger: { relationBelow: -10 },
    headline: '美 USTR, 한국산 철강 25% 추가 관세 부과',
    body: '트럼프 행정부가 한국산 철강·알루미늄에 추가 관세를 부과했다. 포스코·현대제철 직접 타격.',
    category: 'ECONOMY', severity: 'MAJOR',
    effects: { economy: { kospi: -30, exportYoY: -0.8, steelExport: -8 } as any, foreign: { US: { relation: -3 } }, approval: -1 } },
  { countryId: 'US', trigger: { relationBelow: 0 },
    headline: '美 자동차 25% 관세 — 현대차·기아 직격',
    body: '트럼프 행정부가 한국산 자동차에 25% 관세 부과. 현대차·기아 미국 매출 급감 우려.',
    category: 'ECONOMY', severity: 'CRITICAL',
    effects: { economy: { kospi: -80, autoExport: -15 } as any, foreign: { US: { relation: -5 } }, approval: -2.5,
               approvalByRegion: { ULSAN: -5, GWANGJU: -3 } } },
  { countryId: 'US', trigger: { relationBelow: 20 },
    headline: '美, 주한미군 방위비 분담금 2배 인상 요구',
    body: '백악관이 한국에 방위비 분담금을 현행 2배 인상을 요구. 거부 시 주한미군 감축 시사.',
    category: 'SECURITY', severity: 'MAJOR',
    effects: { security: { usAllianceStrength: -5 }, foreign: { US: { relation: -2 } }, approval: -1.5 } },

  // ─── 중국 ───
  { countryId: 'CN', trigger: { relationBelow: 0 },
    headline: '中, 갈륨·게르마늄·요소수 원료 한국 수출 통제',
    body: '중국이 반도체·이차전지 핵심소재인 갈륨·게르마늄과 요소수 원료의 대 한국 수출을 통제했다. SK하이닉스·삼성·이차전지 업계 비상.',
    category: 'ECONOMY', severity: 'MAJOR',
    effects: { economy: { kospi: -60, semiconductorExport: -10, batteryExport: -4 } as any, foreign: { CN: { relation: -3 } }, approval: -1.5,
               sns: { sentiment: -3 } } },
  { countryId: 'CN', trigger: { relationBelow: -10 },
    headline: '中, 한국행 단체관광 비자 발급 중단',
    body: '중국 정부가 한국행 단체관광 비자 발급을 잠정 중단. 면세점·호텔 직격탄.',
    category: 'ECONOMY', severity: 'MODERATE',
    effects: { economy: { consumerConfidence: -3, businessConfidence: -2 }, foreign: { CN: { relation: -2 } } } },
  { countryId: 'CN', trigger: { relationBelow: -20 },
    headline: '中 해경, 서해 한국 어선 5척 나포',
    body: 'NLL 인근에서 중국 해경이 한국 어선 5척을 나포했다. 외교 갈등 심화.',
    category: 'SECURITY', severity: 'MAJOR',
    effects: { security: { northKoreaTension: 2 }, foreign: { CN: { relation: -4 } }, approval: -1,
               sns: { sentiment: -8, protestSentiment: 5 } } },
  { countryId: 'CN', trigger: { relationBelow: -5 },
    headline: '中, 한한령 강화 — K-콘텐츠 OTT 전면 차단',
    body: '중국이 한국 드라마·영화·예능의 자국 OTT 공급을 전면 차단. K-콘텐츠 업계 타격.',
    category: 'CULTURE', severity: 'MODERATE',
    effects: { economy: { businessConfidence: -2 }, foreign: { CN: { relation: -2 } } } },

  // ─── 일본 ───
  { countryId: 'JP', trigger: { relationBelow: -10 },
    headline: '日, 불화수소·포토레지스트 한국 수출 규제 부활',
    body: '일본이 2019년 수출규제 카드를 재발동. 한국 반도체 산업 직격탄.',
    category: 'ECONOMY', severity: 'MAJOR',
    effects: { economy: { kospi: -50, semiconductorExport: -8 } as any, foreign: { JP: { relation: -4 } }, approval: -1.5 } },
  { countryId: 'JP', trigger: { relationBelow: 0 },
    headline: '日, 후쿠시마 오염수 추가 방류 전격 발표',
    body: '일본 정부가 한국 사전 통보 없이 후쿠시마 오염수 추가 방류 결정. 한국 수산업계·시민사회 강한 반발.',
    category: 'DIPLOMACY', severity: 'MAJOR',
    effects: { social: { governmentTrust: -2 }, foreign: { JP: { relation: -3 } }, approval: -1.2,
               sns: { sentiment: -10, protestSentiment: 8 } } },
  { countryId: 'JP', trigger: { relationBelow: -15 },
    headline: '日 자위대, 독도 인근 영해 침범 — 대치 30분',
    body: '일본 자위대 함정이 독도 인근 영해에 진입. 한국 해군 출동 대치.',
    category: 'SECURITY', severity: 'MAJOR',
    effects: { security: { rokMilitaryReadiness: 2 }, foreign: { JP: { relation: -8 } }, approval: 1,
               approvalByRegion: { GYEONGBUK: 4 }, sns: { sentiment: -15, protestSentiment: 12 } } },

  // ─── 북한 ───
  { countryId: 'NK', trigger: { nkTensionAbove: 50 },
    headline: '北 ICBM 발사 — 워싱턴 사거리 시험',
    body: '북한이 평안북도에서 ICBM을 동해상으로 발사. 사거리 1만4천km 추정. 미 본토 위협.',
    category: 'NK', severity: 'CRITICAL',
    effects: { security: { northKoreaTension: 8, northKoreaProvocationRisk: 10, northKoreaMissilesYear: 1 } as any,
               foreign: { NK: { relation: -3 } }, approval: -0.5,
               sns: { sentiment: -8 } } },
  { countryId: 'NK', trigger: { nkTensionAbove: 60 },
    headline: '北, 서해 NLL서 해안포 사격',
    body: '북한 황해도 해안포가 서해 NLL 인근으로 사격. 백령도·연평도 주민 대피.',
    category: 'NK', severity: 'MAJOR',
    effects: { security: { northKoreaTension: 5, northKoreaProvocationRisk: 8 },
               approvalByRegion: { INCHEON: -3 }, approval: -1 } },
  { countryId: 'NK', trigger: { nkTensionAbove: 55 },
    headline: '北, 오물풍선 1000개 수도권에 살포',
    body: '북한이 오물풍선 1000여 개를 살포. 수도권 곳곳에 낙하. 수거 작업 진행.',
    category: 'NK', severity: 'MODERATE',
    effects: { security: { northKoreaTension: 3 }, approval: -0.6,
               sns: { sentiment: -5, protestSentiment: 3 } } },
  { countryId: 'NK', trigger: { nkTensionAbove: 65, militaryReadinessBelow: 75 },
    headline: '北 무인기, 청와대 상공 침투 시도',
    body: '북한 무인기가 군사분계선을 넘어 수도권 상공에 침투. 합참 비상.',
    category: 'NK', severity: 'CRITICAL',
    effects: { security: { northKoreaTension: 10, rokMilitaryReadiness: -3, cyberThreatLevel: 5 },
               approval: -2.5, foreign: { NK: { relation: -5 } },
               sns: { sentiment: -15, protestSentiment: 10 } } },

  // ─── 러시아 ───
  { countryId: 'RU', trigger: { relationBelow: -30 },
    headline: '러, 한국 기업·정부 사이버 공격 — 행정망 일부 마비',
    body: '러시아 정부 추정 해킹 그룹이 한국 행정망·금융망을 대규모 공격. 일부 서비스 마비.',
    category: 'SECURITY', severity: 'MAJOR',
    effects: { security: { cyberThreatLevel: 12 }, foreign: { RU: { relation: -3 } }, approval: -1.5,
               social: { cyberCrimeCount: 200 } as any } },
  { countryId: 'RU', trigger: { relationBelow: -20 },
    headline: '러, 북한에 ICBM 기술·핵추진 잠수함 부품 지원',
    body: '러시아가 북한에 ICBM 재진입체 기술과 핵추진 잠수함 부품을 제공한 정황. 한반도 안보 지형 격변.',
    category: 'SECURITY', severity: 'CRITICAL',
    effects: { security: { northKoreaTension: 10, northKoreaNukes: 2 } as any, foreign: { RU: { relation: -5 }, NK: { relation: -3 } },
               approval: -2 } },
  { countryId: 'RU', trigger: { relationBelow: -25 },
    headline: '러, 한국 비우호국 추가 지정 — 가스·원유 공급 차단',
    body: '러시아가 한국을 비우호국 명단에 추가, 천연가스·원유 수출 추가 제한.',
    category: 'ECONOMY', severity: 'MODERATE',
    effects: { economy: { kospi: -20, inflation: 0.1 } as any, foreign: { RU: { relation: -2 } } } },

  // ─── 이란 ───
  { countryId: 'IR', trigger: { relationBelow: -10 },
    headline: '이란, 호르무즈 해협 봉쇄 시사 — 원유 운송 위기',
    body: '이란이 미국 동조국 단속을 명분으로 호르무즈 해협 봉쇄 가능성 시사. 한국 원유 수입 80% 위협.',
    category: 'ECONOMY', severity: 'MAJOR',
    effects: { economy: { kospi: -40, fxUsdKrw: 10, inflation: 0.3 }, foreign: { IR: { relation: -3 } }, approval: -1 } },

  // ─── 미국 추가 (북핵 약화 시) ───
  { countryId: 'US', trigger: { relationBelow: 30, militaryReadinessBelow: 70 },
    headline: '美, 전술핵 재배치 거부 — 한국 안보 자력 확대 압박',
    body: '백악관이 한국의 전술핵 재배치 요구를 거부. 동시에 한국의 국방비 GDP 3% 인상 요구.',
    category: 'SECURITY', severity: 'MODERATE',
    effects: { security: { usAllianceStrength: -3 }, foreign: { US: { relation: -2 } } } },
];

// 보복 트리거 조건 충족 여부
export function isTriggered(r: RetaliationTemplate, ctx: {
  relation: number;
  nkTension: number;
  militaryReadiness: number;
  treasury: number;
}): boolean {
  const t = r.trigger;
  if (!t) return true;
  if (t.relationBelow !== undefined && ctx.relation > t.relationBelow) return false;
  if (t.nkTensionAbove !== undefined && ctx.nkTension < t.nkTensionAbove) return false;
  if (t.militaryReadinessBelow !== undefined && ctx.militaryReadiness > t.militaryReadinessBelow) return false;
  if (t.treasuryBelow !== undefined && ctx.treasury > t.treasuryBelow) return false;
  return true;
}
