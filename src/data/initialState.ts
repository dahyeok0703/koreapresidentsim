import type {
  GameState, PresidentProfile, ApprovalBreakdown, EconomicState,
  SocialState, SecurityState, AssemblyState, Official, PartyId,
} from '../types/game';
import { PARTIES } from './parties';
import { REGIONS } from './regions';
import { MEDIA_OUTLETS } from './media';
import { FOREIGN_RELATIONS } from './foreign';
import { MINISTRY_LIST, MINISTRY_NAMES } from './ministries';

const KOREAN_SURNAMES = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','류','전','홍','고','문','양','손','배','백','허','유','남','심','노','하','곽','성','차','주','우','구','민','진','지','엄','채'];
const KOREAN_GIVEN = ['민준','서연','지호','수빈','예린','지훈','유나','현우','지원','서윤','도윤','은서','시우','지유','준서','채원','정환','다은','승현','예진','태현','윤아','상현','보경','재민','선영','우진','지민','동현','수진','성호','혜진','재현','미경','경수','은영','병철','정희','광호','순자','종현','영숙','진우','미숙'];

let _idCounter = 1;
export function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${(_idCounter++).toString(36)}`;
}

export function randomKoreanName(): string {
  const s = KOREAN_SURNAMES[Math.floor(Math.random() * KOREAN_SURNAMES.length)];
  const g = KOREAN_GIVEN[Math.floor(Math.random() * KOREAN_GIVEN.length)];
  return s + g;
}

function buildApproval(presidentParty: PartyId, base: number): ApprovalBreakdown {
  const byRegion: Record<string, number> = {};
  const partyIdeology = PARTIES.find(p => p.id === presidentParty)?.ideology ?? 0;
  for (const r of REGIONS) {
    // 지역 성향이 대통령과 가까울수록 지지율 ↑
    const alignment = 1 - Math.abs(r.leaning - (-partyIdeology)) / 200; // -100~100 -> 0~1
    byRegion[r.id] = Math.round(base + (alignment - 0.5) * 30);
  }
  const byPartyBase: Record<string, number> = {};
  for (const p of PARTIES) {
    const ideoDist = Math.abs(p.ideology - partyIdeology) / 200;
    byPartyBase[p.id] = Math.round(Math.max(5, base + (1 - ideoDist) * 50 - 25));
  }
  byPartyBase[presidentParty] = Math.min(95, base + 35);
  return {
    overall: base,
    byAgeGroup: {
      '18-29': base + (partyIdeology < 0 ? 6 : -4),
      '30-39': base + (partyIdeology < 0 ? 8 : -6),
      '40-49': base + (partyIdeology < 0 ? 10 : -8),
      '50-59': base + (partyIdeology < 0 ? -2 : 4),
      '60+':   base + (partyIdeology < 0 ? -12 : 12),
    },
    byRegion: byRegion as ApprovalBreakdown['byRegion'],
    byGender: { male: base - 2, female: base + 2 },
    byIdeology: {
      progressive: base + (partyIdeology < 0 ? 20 : -25),
      moderate: base,
      conservative: base + (partyIdeology < 0 ? -25 : 20),
    },
    byPartyBase: byPartyBase as ApprovalBreakdown['byPartyBase'],
    history: [{ date: '2025-06-04', value: base }],
  };
}

function buildEconomy(): EconomicState {
  return {
    gdpGrowth: 1.8,
    gdpNominal: 2400,
    inflation: 2.4,
    unemployment: 3.2,
    youthUnemployment: 6.5,
    baseRate: 2.75,
    fxUsdKrw: 1380,
    kospi: 2680,
    kosdaq: 760,
    exportYoY: 4.2,
    importYoY: 2.1,
    tradeBalance: 480,
    fiscalBalance: -2.8,
    nationalDebt: 51.5,
    householdDebt: 92.0,
    housePriceIndex: 100.0,
    housePriceYoY: -1.5,
    jeonseIndex: 98.5,
    consumerConfidence: 98,
    businessConfidence: 92,
    history: [{ date: '2025-06-04', gdp: 1.8, cpi: 2.4, unemp: 3.2, kospi: 2680 }],
  };
}

function buildSocial(): SocialState {
  return {
    birthRate: 0.75,
    marriageRate: 3.8,
    divorceRate: 1.8,
    suicideRate: 25.2,
    crimeIndex: 100,
    trafficDeaths: 0,
    healthcareSatisfaction: 60,
    educationSatisfaction: 45,
    pensionTrust: 38,
    genderConflictIndex: 62,
    generationConflictIndex: 58,
    immigrationSentiment: -5,
    airQualityPM25: 22,
    pressFreedomIndex: 28,
  };
}

function buildSecurity(): SecurityState {
  return {
    northKoreaTension: 55,
    northKoreaProvocationRisk: 35,
    rokMilitaryReadiness: 78,
    usAllianceStrength: 80,
    defconLevel: 4,
    cyberThreatLevel: 55,
    terrorThreatLevel: 20,
    defenseBudgetPctGdp: 2.6,
  };
}

function buildAssembly(presidentParty: PartyId): AssemblyState {
  const bySeat: Record<string, number> = {};
  for (const p of PARTIES) bySeat[p.id] = p.seats;
  const ruling = bySeat[presidentParty] ?? 0;
  return {
    totalSeats: 300,
    bySeat: bySeat as AssemblyState['bySeat'],
    speaker: { name: '우원식', party: 'DPK' },
    rulingCoalitionSeats: ruling,
    oppositionSeats: 300 - ruling,
    pendingBills: [],
    passedBills: [],
    vetoedBills: [],
  };
}

function buildCabinet(presidentParty: PartyId, date: string): Official[] {
  return MINISTRY_LIST.map(m => ({
    id: genId('off'),
    name: randomKoreanName(),
    ministry: m,
    ministryName: MINISTRY_NAMES[m],
    party: ['NIS','BAI','PPS','BOK'].includes(m) ? 'IND' : presidentParty,
    loyalty: 60 + Math.floor(Math.random() * 30),
    competence: 50 + Math.floor(Math.random() * 40),
    publicFavor: 40 + Math.floor(Math.random() * 30),
    scandalRisk: Math.floor(Math.random() * 25),
    appointedAt: date,
    bio: '청문회를 통과한 인사. 경력 검증 완료.',
  }));
}

export function createInitialState(opts: {
  presidentName: string;
  party: PartyId;
  ideology?: number;
  background?: string;
  age?: number;
}): GameState {
  const date = '2025-06-04';
  const partyDef = PARTIES.find(p => p.id === opts.party)!;
  const president: PresidentProfile = {
    name: opts.presidentName,
    party: opts.party,
    age: opts.age ?? 60,
    background: opts.background ?? '정치인 출신. 다선 의원 경력.',
    ideology: opts.ideology ?? partyDef.ideology,
    traits: ['결단력', '실용주의'],
    inauguratedAt: date,
    termEndsAt: '2030-06-03',
  };
  // 신임 대통령은 보통 허니문 효과로 50-60% 지지율
  const baseApproval = 55;
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    president,
    clock: {
      currentDate: date,
      daysInOffice: 0,
      turnNumber: 1,
      speed: 'paused',
    },
    approval: buildApproval(opts.party, baseApproval),
    regions: REGIONS,
    economy: buildEconomy(),
    social: buildSocial(),
    security: buildSecurity(),
    foreign: FOREIGN_RELATIONS.map(f => ({ ...f })),
    assembly: buildAssembly(opts.party),
    cabinet: buildCabinet(opts.party, date),
    media: MEDIA_OUTLETS.map(m => ({ ...m })),
    events: [{
      id: genId('evt'),
      date,
      category: 'POLITICS',
      severity: 'MAJOR',
      headline: `${president.name} 제21대 대통령 취임`,
      body: `${president.name} 신임 대통령이 ${date} 국회의사당 앞 광장에서 취임식을 갖고 5년 임기를 시작했다. 취임사에서 통합과 민생 회복을 강조했다.`,
      source: 'KBS',
      resolved: true,
    }],
    newsTicker: [
      `${president.name} 대통령 취임 — "국민 통합" 강조`,
      '한미 정상, 조속한 회담 추진 합의',
      '코스피, 신정부 출범에 강보합 마감',
      '北 "남측 새 정부 행보 예의주시"',
    ],
    chat: [{
      id: genId('msg'),
      role: 'advisor',
      speaker: '비서실장',
      content: `대통령님, 취임을 진심으로 축하드립니다. 첫 주 일정과 핵심 현안을 보고드리겠습니다. 지금 대통령께서 어떤 방향으로 국정을 운영하실지, 채팅창에 지시를 내려주시거나 우측 패널의 행동을 선택해 주십시오.`,
      timestamp: date,
      realTimestamp: new Date().toISOString(),
      contextType: 'BRIEFING',
    }],
    policies: [],
    parties: PARTIES,
    settings: {
      openaiApiKey: '',
      model: 'gpt-4o-mini',
      difficulty: 'NORMAL',
      realismLevel: 'BALANCED',
      autoEvents: true,
      eventsPerTurn: 2,
      language: 'ko',
    },
    flags: {},
  };
}
