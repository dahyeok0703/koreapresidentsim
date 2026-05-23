import type {
  GameState, PresidentProfile, ApprovalBreakdown, EconomicState,
  SocialState, SecurityState, AssemblyState, Official, PartyId,
} from '../types/game';
import { PARTIES } from './parties';
import { REGIONS } from './regions';
import { MEDIA_OUTLETS } from './media';
import { FOREIGN_RELATIONS } from './foreign';
import { MINISTRY_LIST, MINISTRY_NAMES } from './ministries';
import { INITIAL_JUDICIARY } from './judiciary';
import { INITIAL_SNS } from './sns';
import { INITIAL_INTERNATIONAL } from './international';

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
    const alignment = 1 - Math.abs(r.leaning - (-partyIdeology)) / 200;
    byRegion[r.id] = Math.round(base + (alignment - 0.5) * 30);
  }
  const byPartyBase: Record<string, number> = {};
  for (const p of PARTIES) {
    const ideoDist = Math.abs(p.ideology - partyIdeology) / 200;
    byPartyBase[p.id] = Math.round(Math.max(5, base + (1 - ideoDist) * 50 - 25));
  }
  byPartyBase[presidentParty] = Math.min(95, base + 35);
  const progressive = partyIdeology < 0;
  return {
    overall: base,
    byAgeGroup: {
      '18-29': base + (progressive ? 5 : -3),
      '30-39': base + (progressive ? 9 : -7),
      '40-49': base + (progressive ? 12 : -9),
      '50-59': base + (progressive ? 2 : 3),
      '60-69': base + (progressive ? -10 : 10),
      '70+':   base + (progressive ? -16 : 15),
    },
    byRegion: byRegion as ApprovalBreakdown['byRegion'],
    byGender: { male: base - 2, female: base + 2 },
    byIdeology: {
      progressive: base + (progressive ? 22 : -28),
      moderate: base,
      conservative: base + (progressive ? -28 : 22),
    },
    byPartyBase: byPartyBase as ApprovalBreakdown['byPartyBase'],
    byIncome: {
      low: base + (progressive ? 8 : -5),
      middleLow: base + (progressive ? 5 : -3),
      middle: base,
      middleHigh: base + (progressive ? -3 : 4),
      high: base + (progressive ? -10 : 10),
    },
    byEducation: {
      highschool: base + (progressive ? -5 : 3),
      college: base + (progressive ? 4 : 0),
      graduate: base + (progressive ? 8 : -2),
    },
    history: [{ date: '2025-06-04', value: base }],
  };
}

// 2025-06-04 기준 한국 실데이터
function buildEconomy(): EconomicState {
  return {
    gdpGrowth: 1.7,             // 2025 한은 전망치
    gdpNominal: 2510,           // 조원
    gdpPerCapita: 36800,        // $
    gniPerCapita: 36200,
    inflation: 2.1,             // 2025-05 CPI YoY
    coreInflation: 2.0,
    ppi: 1.4,
    groceryInflation: 5.2,
    unemployment: 2.9,
    youthUnemployment: 6.6,
    laborParticipation: 64.3,
    employmentRate: 62.8,
    baseRate: 2.50,             // 2025-05 한은 인하 후
    cd91: 2.65,
    treasury10y: 2.85,
    m2Growth: 6.2,
    fxUsdKrw: 1378,             // 2025-06 초
    fxJpyKrw: 9.5,              // 100엔당
    fxCnyKrw: 191.5,
    fxEurKrw: 1556,
    kospi: 2735,                // 2025-06 초
    kosdaq: 745,
    kospi200: 372,
    vkospi: 17.5,
    marketCap: 2480,            // 조원 (코스피)
    exportYoY: 3.8,
    importYoY: 1.5,
    tradeBalance: 470,          // 억$ (YTD)
    currentAccount: 380,
    fdiInflow: 280,
    fiscalBalance: -2.6,
    primaryBalance: -1.4,
    nationalDebt: 51.7,
    governmentSpending: 656,    // 2025 본예산
    householdDebt: 91.7,
    householdDebtAbs: 1880,
    corporateDebt: 122.5,
    housePriceIndex: 99.6,
    housePriceYoY: -1.2,
    jeonseIndex: 98.5,
    jeonseYoY: -0.8,
    housingSupply: 38.5,
    consumerConfidence: 101.6,
    businessConfidence: 92.0,
    economicSentimentIndex: 95.4,
    semiconductorExport: 1290,  // 억$/연
    autoExport: 760,
    shipExport: 380,
    steelExport: 320,
    fxReserves: 4090,           // 억$
    history: [{ date: '2025-06-04', gdp: 1.7, cpi: 2.1, unemp: 2.9, kospi: 2735, fxUsdKrw: 1378 }],
  };
}

function buildSocial(): SocialState {
  return {
    totalPopulation: 5121,      // 만명, 2025
    populationGrowth: -0.12,
    birthRate: 0.75,            // 2024 0.74, 2025 소폭 반등
    deathRate: 7.2,
    marriageRate: 3.8,
    divorceRate: 1.8,
    agingIndex: 173.2,
    medianAge: 46.1,
    immigrantPopulation: 252,
    suicideRate: 25.2,
    trafficDeaths: 0,
    crimeIndex: 100,
    violentCrimeRate: 64.5,
    drugCrimeCount: 0,
    healthcareSatisfaction: 58,
    educationSatisfaction: 44,
    pensionTrust: 35,
    publicSafetySatisfaction: 56,
    governmentTrust: 38,
    genderConflictIndex: 64,
    generationConflictIndex: 60,
    regionalConflictIndex: 52,
    classConflictIndex: 71,
    immigrationSentiment: -8,
    airQualityPM25: 22,
    carbonEmission: 624,
    greenEnergyShare: 9.8,
    pressFreedomIndex: 30.5,    // 2024 RSF (낮을수록 좋음, 47위)
    corruptionPerceptionIndex: 64, // CPI 2024 (32위)
    democracyIndex: 8.06,       // EIU 2024
    giniIndex: 0.323,
    povertyRate: 14.9,
    collegeAdmissionRate: 73.5,
    privateEduSpending: 27.1,   // 조원
    housingAffordability: 68,
  };
}

function buildSecurity(): SecurityState {
  return {
    northKoreaTension: 62,
    northKoreaProvocationRisk: 45,
    cyberThreatLevel: 58,
    terrorThreatLevel: 22,
    defconLevel: 4,
    watchcon: 3,
    rokMilitaryReadiness: 78,
    troopsActive: 50,           // 만명 (50만)
    troopsReserve: 310,         // 만명
    defenseBudget: 61.2,        // 조원 2025
    defenseBudgetPctGdp: 2.6,
    globalFireRank: 5,          // GFP 2025
    tanks: 2236,
    aircraft: 1576,
    warships: 234,
    submarines: 22,
    missilesBallistic: 800,
    nukesAvailable: false,
    usAllianceStrength: 80,
    usftKorea: 28500,
    natoPartnership: 65,
    northKoreaNukes: 50,        // 추정
    northKoreaMissilesYear: 12,
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
    deputySpeakers: [
      { name: '이학영', party: 'DPK' },
      { name: '주호영', party: 'PPP' },
    ],
    rulingCoalitionSeats: ruling,
    oppositionSeats: 300 - ruling,
    committees: [
      { name: '운영위원회',        chair: '박찬대',   chairParty: 'DPK', membersCount: 28 },
      { name: '법제사법위원회',    chair: '정청래',   chairParty: 'DPK', membersCount: 18 },
      { name: '정무위원회',        chair: '윤한홍',   chairParty: 'PPP', membersCount: 24 },
      { name: '기획재정위원회',    chair: '송언석',   chairParty: 'PPP', membersCount: 26 },
      { name: '국방위원회',        chair: '성일종',   chairParty: 'PPP', membersCount: 17 },
      { name: '외교통일위원회',    chair: '김석기',   chairParty: 'PPP', membersCount: 22 },
      { name: '교육위원회',        chair: '김영호',   chairParty: 'DPK', membersCount: 16 },
      { name: '과학기술정보방송통신위', chair: '최민희', chairParty: 'DPK', membersCount: 22 },
      { name: '행정안전위원회',    chair: '신정훈',   chairParty: 'DPK', membersCount: 20 },
      { name: '문화체육관광위원회', chair: '전재수', chairParty: 'DPK', membersCount: 17 },
      { name: '농림축산식품해양수산위', chair: '어기구', chairParty: 'DPK', membersCount: 19 },
      { name: '산업통상자원중소벤처기업위', chair: '이철규', chairParty: 'PPP', membersCount: 30 },
      { name: '보건복지위원회',    chair: '박주민',   chairParty: 'DPK', membersCount: 24 },
      { name: '환경노동위원회',    chair: '안호영',   chairParty: 'DPK', membersCount: 16 },
      { name: '국토교통위원회',    chair: '맹성규',   chairParty: 'DPK', membersCount: 30 },
      { name: '정보위원회',        chair: '신성범',   chairParty: 'PPP', membersCount: 12 },
      { name: '여성가족위원회',    chair: '이인선',   chairParty: 'PPP', membersCount: 17 },
      { name: '예산결산특별위원회', chair: '박정',    chairParty: 'DPK', membersCount: 50 },
    ],
    pendingBills: [],
    passedBills: [],
    vetoedBills: [],
    impeachmentMotions: 4,
    filibusterDays: 0,
  };
}

function buildCabinet(presidentParty: PartyId, date: string): Official[] {
  return MINISTRY_LIST.map(m => ({
    id: genId('off'),
    name: randomKoreanName(),
    ministry: m,
    ministryName: MINISTRY_NAMES[m],
    party: ['NIS','BAI','PPS','BOK','KCC','FSC','FTC'].includes(m) ? 'IND' : presidentParty,
    loyalty: 60 + Math.floor(Math.random() * 30),
    competence: 50 + Math.floor(Math.random() * 40),
    publicFavor: 40 + Math.floor(Math.random() * 30),
    scandalRisk: Math.floor(Math.random() * 25),
    appointedAt: date,
    bio: '인사청문회를 통과한 후보. 분야 전문성 인정.',
    age: 50 + Math.floor(Math.random() * 18),
    education: '서울대학교 졸업',
  }));
}

export function createInitialState(p: PresidentProfile, apiKey = '', model = 'gpt-4o-mini'): GameState {
  const date = '2025-06-04';
  const baseApproval = 55;
  return {
    version: 2,
    createdAt: new Date().toISOString(),
    president: p,
    clock: { currentDate: date, daysInOffice: 0, turnNumber: 1, speed: 'paused' },
    approval: buildApproval(p.party, baseApproval),
    regions: REGIONS,
    economy: buildEconomy(),
    social: buildSocial(),
    security: buildSecurity(),
    foreign: FOREIGN_RELATIONS.map(f => ({ ...f })),
    international: { ...INITIAL_INTERNATIONAL },
    assembly: buildAssembly(p.party),
    judiciary: { ...INITIAL_JUDICIARY },
    cabinet: buildCabinet(p.party, date),
    media: MEDIA_OUTLETS.map(m => ({ ...m })),
    sns: { ...INITIAL_SNS },
    events: [{
      id: genId('evt'),
      date,
      category: 'POLITICS',
      severity: 'MAJOR',
      headline: `${p.name} 제21대 대통령 취임… "${p.slogan}"`,
      body: `${p.name} 신임 대통령이 ${date} 국회의사당 앞 광장에서 취임식을 갖고 5년 임기를 공식 시작했다. 취임사에서 "${p.inaugurationAddress}"라고 밝히며 핵심 국정 운영 방향을 제시했다. 윤석열 전 대통령 파면 후 60일 만에 치러진 21대 대선의 결과다.`,
      source: 'KBS',
      resolved: true,
    }],
    newsTicker: [
      `${p.name} 대통령 취임 — "${p.slogan}"`,
      '취임사 핵심: 국민 통합·민생 회복·정치 정상화',
      '한미 정상, 조속한 회담 추진 합의',
      '코스피, 신정부 출범에 강보합 마감',
      '北 "남측 새 정부 행보 예의주시"',
      '트럼프 행정부, 한국산 관세 협상 재개 시사',
      '日 이시바 총리, 셔틀외교 복원 환영',
    ],
    chat: [{
      id: genId('msg'),
      role: 'advisor',
      speaker: '비서실장',
      content: `대통령님, 취임을 진심으로 축하드립니다. 오늘부터 5년 임기가 시작됩니다.\n\n첫 주 핵심 현안을 보고드립니다.\n1) 한미 정상회담 일정 조율 (트럼프 행정부 관세 협상 연계)\n2) 인수위 없는 즉시 출범 — 내각 청문회 일정\n3) 비상계엄 후 갈라진 국론 통합 메시지\n4) 한은 추가 금리 인하 여부 (6월 FOMC 직후)\n\n채팅창에 자유롭게 지시·질문을 내려주십시오. "대화" 모드는 협의용이며, "결정" 모드는 즉시 정책으로 집행됩니다.`,
      timestamp: date,
      realTimestamp: new Date().toISOString(),
      contextType: 'BRIEFING',
    }],
    policies: [],
    parties: PARTIES,
    settings: {
      openaiApiKey: apiKey,
      model,
      difficulty: 'NORMAL',
      realismLevel: 'BALANCED',
      autoEvents: true,
      eventsPerTurn: 3,
      language: 'ko',
    },
    flags: {},
  };
}
