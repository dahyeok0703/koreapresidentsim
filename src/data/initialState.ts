import type {
  GameState, PresidentProfile, ApprovalBreakdown, EconomicState,
  SocialState, SecurityState, AssemblyState, Official, PartyId, AdminTask,
} from '../types/game';
import { PARTIES } from './parties';
import { REGIONS } from './regions';
import { MEDIA_OUTLETS } from './media';
import { COUNTRIES } from './countries';
import { INTL_ORGS } from './intlOrgs';
import { MINISTRY_NAMES, MINISTRY_LIST } from './ministries';
import { INITIAL_JUDICIARY } from './judiciary';
import { INITIAL_SNS } from './sns';
import { INITIAL_INTERNATIONAL } from './international';
import { INITIAL_BUILDINGS } from './buildings';
import { INITIAL_WEAPONS, INITIAL_BASES, INITIAL_UNITS } from './military';
import { INITIAL_ARTICLES } from './articles';
import { ADMIN_BODIES, INITIAL_ADMIN_TASKS, NOMINEE_POOL } from './adminBodies';

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

// 2025-06-04 한국 실데이터 (확장)
function buildEconomy(): EconomicState {
  return {
    gdpGrowth: 1.7,
    gdpNominalKRW: 2510,
    gdpNominalUSD: 1820,
    gdpPpp: 3140,
    gdpPerCapita: 36800,
    gniPerCapita: 36200,
    inflation: 2.1,
    coreInflation: 2.0,
    ppi: 1.4,
    groceryInflation: 5.2,
    housingInflation: -1.2,
    energyInflation: 3.1,
    servicesInflation: 2.6,
    unemployment: 2.9,
    youthUnemployment: 6.6,
    laborParticipation: 64.3,
    employmentRate: 62.8,
    femaleEmploymentRate: 54.7,
    irregularWorkerRatio: 37.0,
    baseRate: 2.50,
    cd91: 2.65,
    treasury10y: 2.85,
    treasury3y: 2.55,
    m2Growth: 6.2,
    m2Total: 4180,
    fxUsdKrw: 1378,
    kospi: 2735,
    kosdaq: 745,
    kospi200: 372,
    vkospi: 17.5,
    marketCapUSD: 1800,        // $B
    exportYoY: 3.8,
    importYoY: 1.5,
    monthlyExportUSD: 56.2,    // 5월 누적 $B → 6월은 새로 시작
    monthlyImportUSD: 50.3,
    monthlyTradeBalanceUSD: 5.9,
    ytdTradeBalanceUSD: 28.5,
    currentAccountUSD: 32.0,
    fdiInflowUSD: 18.5,
    fxReservesUSD: 4090,
    fiscalBalance: -2.6,
    primaryBalance: -1.4,
    nationalDebt: 51.7,
    governmentSpending: 656,
    treasuryBalanceKRW: 42.8,  // 조원 (예시: 국고 여유분)
    taxRevenue: 365,
    householdDebt: 91.7,
    householdDebtAbs: 1880,
    corporateDebt: 122.5,
    housePriceIndex: 99.6,
    housePriceYoY: -1.2,
    jeonseIndex: 98.5,
    jeonseYoY: -0.8,
    housingSupply: 38.5,
    unsoldHousesNationwide: 7.1,
    consumerConfidence: 101.6,
    businessConfidence: 92.0,
    economicSentimentIndex: 95.4,
    semiconductorExport: 129,
    autoExport: 76,
    shipExport: 38,
    steelExport: 32,
    petrochemicalExport: 48,
    batteryExport: 22,
    displayExport: 19,
    history: [{ date: '2025-06-04', gdp: 1.7, cpi: 2.1, unemp: 2.9, kospi: 2735, fxUsdKrw: 1378 }],
    lastMonthlyReset: '2025-06-01',
  };
}

function buildSocial(): SocialState {
  return {
    totalPopulation: 5121,
    populationGrowth: -0.12,
    birthRate: 0.75,
    deathRate: 7.2,
    marriageRate: 3.8,
    divorceRate: 1.8,
    agingIndex: 173.2,
    medianAge: 46.1,
    immigrantPopulation: 252,
    multiculturalFamilies: 41.2,
    suicideRate: 25.2,
    trafficDeaths: 0,
    crimeIndex: 100,
    violentCrimeRate: 64.5,
    drugCrimeCount: 0,
    cyberCrimeCount: 0,
    healthcareSatisfaction: 58,
    educationSatisfaction: 44,
    pensionTrust: 35,
    publicSafetySatisfaction: 56,
    governmentTrust: 38,
    judicialTrust: 42,
    presidentialOfficeTrust: 53,
    parliamentTrust: 24,
    genderConflictIndex: 64,
    generationConflictIndex: 60,
    regionalConflictIndex: 52,
    classConflictIndex: 71,
    immigrationSentiment: -8,
    airQualityPM25: 22,
    airQualityPM10: 38,
    carbonEmission: 624,
    greenEnergyShare: 9.8,
    pressFreedomIndex: 30.5,
    corruptionPerceptionIndex: 64,
    democracyIndex: 8.06,
    giniIndex: 0.323,
    povertyRate: 14.9,
    collegeAdmissionRate: 73.5,
    privateEduSpending: 27.1,
    housingAffordability: 68,
    homeOwnershipRate: 56.2,
    internetPenetration: 97.4,
    smartphonePenetration: 95.9,
    energySelfSufficiency: 17.7,
    foodSelfSufficiency: 45.8,
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
    troopsActive: 50,
    troopsReserve: 310,
    defenseBudget: 61.2,
    defenseBudgetPctGdp: 2.6,
    globalFireRank: 5,
    nukesAvailable: false,
    usAllianceStrength: 80,
    usftKorea: 28500,
    natoPartnership: 65,
    northKoreaNukes: 50,
    northKoreaMissilesYear: 12,
    weapons: INITIAL_WEAPONS,
    bases: INITIAL_BASES,
    units: INITIAL_UNITS,
    warEngagements: [],
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
      { name: '운영위원회',                   chair: '박찬대', chairParty: 'DPK', membersCount: 28 },
      { name: '법제사법위원회',                chair: '정청래', chairParty: 'DPK', membersCount: 18 },
      { name: '정무위원회',                    chair: '윤한홍', chairParty: 'PPP', membersCount: 24 },
      { name: '기획재정위원회',                chair: '송언석', chairParty: 'PPP', membersCount: 26 },
      { name: '국방위원회',                    chair: '성일종', chairParty: 'PPP', membersCount: 17 },
      { name: '외교통일위원회',                chair: '김석기', chairParty: 'PPP', membersCount: 22 },
      { name: '교육위원회',                    chair: '김영호', chairParty: 'DPK', membersCount: 16 },
      { name: '과학기술정보방송통신위원회',   chair: '최민희', chairParty: 'DPK', membersCount: 22 },
      { name: '행정안전위원회',                chair: '신정훈', chairParty: 'DPK', membersCount: 20 },
      { name: '문화체육관광위원회',            chair: '전재수', chairParty: 'DPK', membersCount: 17 },
      { name: '농림축산식품해양수산위원회',   chair: '어기구', chairParty: 'DPK', membersCount: 19 },
      { name: '산업통상자원중소벤처기업위원회',chair: '이철규', chairParty: 'PPP', membersCount: 30 },
      { name: '보건복지위원회',                chair: '박주민', chairParty: 'DPK', membersCount: 24 },
      { name: '환경노동위원회',                chair: '안호영', chairParty: 'DPK', membersCount: 16 },
      { name: '국토교통위원회',                chair: '맹성규', chairParty: 'DPK', membersCount: 30 },
      { name: '정보위원회',                    chair: '신성범', chairParty: 'PPP', membersCount: 12 },
      { name: '여성가족위원회',                chair: '이인선', chairParty: 'PPP', membersCount: 17 },
      { name: '예산결산특별위원회',            chair: '박정',   chairParty: 'DPK', membersCount: 50 },
    ],
    pendingBills: [],
    passedBills: [],
    vetoedBills: [],
    impeachmentMotions: 4,
    filibusterDays: 0,
  };
}

function buildEmptyCabinet(date: string): Official[] {
  // 신임 대통령은 청문회 통과 전이므로 핵심 자리만 권한대행 / 나머진 공석
  // 게임 시작 시 인선 이벤트가 발생
  return MINISTRY_LIST.map(m => {
    const stayingOver = ['NIS','BAI','PPS','BOK','KCC','FSC','FTC','NEC','HRC'].includes(m);
    const fillNow = stayingOver || ['PM','MOEF','MOFA','MND','MOIS'].includes(m); // 핵심 직무대행
    if (!fillNow) {
      return {
        id: genId('off'),
        name: '공석 (지명 대기)',
        ministry: m,
        ministryName: MINISTRY_NAMES[m],
        party: 'IND' as PartyId,
        loyalty: 0, competence: 0, publicFavor: 0, scandalRisk: 0,
        appointedAt: '', bio: '인선 이벤트에서 지명 필요', age: 0, education: '-',
        confirmed: false,
      };
    }
    return {
      id: genId('off'),
      name: randomKoreanName(),
      ministry: m,
      ministryName: MINISTRY_NAMES[m],
      party: stayingOver ? 'IND' : 'IND',
      loyalty: 50 + Math.floor(Math.random() * 20),
      competence: 55 + Math.floor(Math.random() * 30),
      publicFavor: 40 + Math.floor(Math.random() * 20),
      scandalRisk: Math.floor(Math.random() * 20),
      appointedAt: date,
      bio: stayingOver ? '전 정권 임명, 임기 보장 직위' : '직무대행 (정식 인선 필요)',
      age: 55 + Math.floor(Math.random() * 12),
      education: '서울대학교 졸업',
      confirmed: stayingOver,
    };
  });
}

function buildAdminTasks(date: string): AdminTask[] {
  return INITIAL_ADMIN_TASKS.map(t => ({
    id: genId('task'),
    bodyId: t.bodyId,
    title: t.title,
    detail: t.detail,
    progress: t.progress,
    startedAt: date,
    priority: t.priority,
    status: 'PROGRESS',
  }));
}

export function createInitialState(p: PresidentProfile, apiKey = '', model = 'gpt-4o-mini'): GameState {
  const date = '2025-06-04';
  const baseApproval = 55;

  // 초기 인선 이벤트 생성
  const inaugurationEvent: any = {
    id: genId('evt'),
    date,
    category: 'POLITICS',
    severity: 'MAJOR',
    headline: `${p.name} 제21대 대통령 취임… "${p.slogan}"`,
    body: `${p.name} 신임 대통령이 ${date} 국회의사당 앞 광장에서 취임식을 갖고 5년 임기를 공식 시작했다. 취임사에서 "${p.inaugurationAddress}"라고 밝히며 핵심 국정 운영 방향을 제시했다.`,
    source: 'KBS',
    resolved: true,
  };

  const cabinetEvent: any = {
    id: genId('evt'),
    date,
    category: 'POLITICS',
    severity: 'CRITICAL',
    headline: '초대 내각 인선 — 국무총리·경제부총리 등 핵심 직위 지명 필요',
    body: '신임 대통령의 핵심 국정 운영을 위한 초대 내각 인선이 시급합니다. 국무총리, 기획재정부 장관(경제부총리), 외교부 장관, 국방부 장관, 행정안전부 장관 등 핵심 직위에 대한 지명을 진행해야 합니다. 인선 결과는 즉시 정치 지형과 지지율에 영향을 미칩니다.',
    source: '청와대 인사수석실',
    mandatory: true,
    choices: [
      {
        id: genId('ch'),
        label: '👤 인선 화면 열기',
        description: '행정부 탭에서 부처별로 인선 진행',
        ideology: 0,
        expectedEffects: { notes: '행정부 탭 → "인선" 버튼 클릭' },
      },
    ],
  };

  return {
    version: 3,
    createdAt: new Date().toISOString(),
    president: p,
    clock: { currentDate: date, daysInOffice: 0, turnNumber: 1, speed: 'paused' },
    approval: buildApproval(p.party, baseApproval),
    regions: REGIONS,
    economy: buildEconomy(),
    social: buildSocial(),
    security: buildSecurity(),
    countries: COUNTRIES,
    intlOrgs: INTL_ORGS,
    international: { ...INITIAL_INTERNATIONAL },
    assembly: buildAssembly(p.party),
    judiciary: { ...INITIAL_JUDICIARY },
    adminBodies: ADMIN_BODIES,
    cabinet: buildEmptyCabinet(date),
    adminTasks: buildAdminTasks(date),
    buildings: INITIAL_BUILDINGS,
    media: MEDIA_OUTLETS.map(m => ({ ...m })),
    articles: INITIAL_ARTICLES,
    sns: { ...INITIAL_SNS },
    events: [inaugurationEvent, cabinetEvent],
    chat: [{
      id: genId('msg'),
      role: 'advisor',
      speaker: '비서실장',
      content: `대통령님, 취임을 진심으로 축하드립니다. 오늘부터 5년 임기가 공식 시작됩니다.\n\n[가장 시급한 사안 — 초대 내각 인선]\n인수위 없는 즉시 출범 상황입니다. 우측 "행정부" 탭에서 부처별 후보를 지명해 주십시오. 청문회는 이후 진행됩니다.\n\n[주요 현안]\n1) 한미 정상회담 일정 조율 (트럼프 행정부 관세 협상 연계)\n2) 12·3 비상계엄 후속 수사·국론 통합\n3) 의대 정원 갈등 — 응급실 마비 지속\n4) 한은 7월 추가 금리 인하 여부\n5) 북한 ICBM 발사 임박 정황\n\n채팅창에 자유롭게 지시·질문해 주십시오. "대화" 모드는 협의용, "결정" 모드는 즉시 정책으로 집행됩니다.`,
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
    flags: { cabinetSetupComplete: false },
  };
}

export { NOMINEE_POOL };
