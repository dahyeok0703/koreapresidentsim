import type {
  GameState, PresidentProfile, ApprovalBreakdown, EconomicState,
  SocialState, SecurityState, AssemblyState, Official, PartyId, AdminTask,
} from '../types/game';
import { PARTIES } from './parties';
import { REGIONS } from './regions';
import { MEDIA_OUTLETS } from './media';
import { COUNTRIES } from './countries';
import { COMPANIES } from './companies';
import { INTL_ORGS } from './intlOrgs';
import { MINISTRY_NAMES, MINISTRY_LIST } from './ministries';
import { INITIAL_JUDICIARY } from './judiciary';
import { buildInitialSns } from './sns';
import { INITIAL_INTERNATIONAL } from './international';
import { INITIAL_BUILDINGS } from './buildings';
import { INITIAL_WEAPONS, INITIAL_BASES, INITIAL_UNITS } from './military';
import { buildInitialArticles } from './articles';
import { ADMIN_BODIES, INITIAL_ADMIN_TASKS, NOMINEE_POOL } from './adminBodies';
import { buildElections } from './elections';
import { INITIAL_CULTURAL } from './cultural';
import { KOREAN_LAWS } from './laws';
import { buildSubRegions } from './subRegions';
import { FOREIGN_LEADER_TERMS } from './foreignLeaders';

// 외국 정상 임기 데이터를 countries에 머지
function withForeignLeaderTerms<T extends { id: string; termEnd?: string; successorIndex?: number }>(countries: T[]): T[] {
  const map = new Map(FOREIGN_LEADER_TERMS.map(l => [l.countryId, l]));
  return countries.map(c => {
    const term = map.get(c.id);
    return term ? { ...c, termEnd: term.termEnd, successorIndex: 0 } : c;
  });
}
import { genId, randomKoreanName } from '../utils/id';
export { genId, randomKoreanName };

// 한국 정치 지형 반영 함수: 그룹 성향(이념점수)과 대통령 이념의 차이로 지지율 산출
// 그룹 성향: -100(극진보) ~ +100(극보수). 대통령 이념과 가까울수록 지지율 ↑.
function approvalFor(base: number, presPid: number, groupIdeo: number, amp = 0.25): number {
  // 이념 차이 0이면 base + 12, 이념 차이 100이면 base - 12 (amp=0.25 기준)
  const diff = presPid - groupIdeo;
  const delta = (50 - Math.abs(diff)) * amp; // -12.5~+12.5
  return Math.round((base + delta) * 10) / 10;
}

function buildApproval(presidentParty: PartyId, base: number): ApprovalBreakdown {
  const partyIdeology = PARTIES.find(p => p.id === presidentParty)?.ideology ?? 0;
  // ── 지역별: REGIONS의 leaning (호남 +75, 영남 -60~-25, 강원 -20, 제주 +20, 수도권 ±5~15)
  const byRegion: Record<string, number> = {};
  for (const r of REGIONS) {
    // r.leaning: -100(보수) ~ +100(진보) → 그룹 이념점수로 변환: 부호 반전
    const groupIdeo = -r.leaning;
    byRegion[r.id] = approvalFor(base, partyIdeology, groupIdeo, 0.35);
  }
  // ── 정당 지지층별
  const byPartyBase: Record<string, number> = {};
  for (const p of PARTIES) {
    byPartyBase[p.id] = approvalFor(base, partyIdeology, p.ideology, 0.6);
  }
  byPartyBase[presidentParty] = Math.min(95, base + 35);

  // ── 세대별: 2030/6070=보수, 4050=진보 (2024-2025 한국 신패턴)
  const ageIdeo = {
    '18-29': 25,   // 보수
    '30-39': 20,   // 약보수
    '40-49': -30,  // 진보
    '50-59': -25,  // 진보
    '60-69': 40,   // 보수
    '70+':   55,   // 강보수
  } as const;
  const byAgeGroup = {
    '18-29': approvalFor(base, partyIdeology, ageIdeo['18-29'], 0.35),
    '30-39': approvalFor(base, partyIdeology, ageIdeo['30-39'], 0.35),
    '40-49': approvalFor(base, partyIdeology, ageIdeo['40-49'], 0.35),
    '50-59': approvalFor(base, partyIdeology, ageIdeo['50-59'], 0.35),
    '60-69': approvalFor(base, partyIdeology, ageIdeo['60-69'], 0.35),
    '70+':   approvalFor(base, partyIdeology, ageIdeo['70+'], 0.4),
  };

  // ── 성별: 남자=보수, 여자=진보
  const byGender = {
    male:   approvalFor(base, partyIdeology, 25,  0.3),   // 보수
    female: approvalFor(base, partyIdeology, -25, 0.3),   // 진보
  };

  // ── 이념별
  const byIdeology = {
    progressive: approvalFor(base, partyIdeology, -70, 0.6),
    moderate:    approvalFor(base, partyIdeology, 0,   0.4),
    conservative: approvalFor(base, partyIdeology, 70, 0.6),
  };

  // ── 소득별 (저소득=진보 성향, 고소득=보수 성향)
  const byIncome = {
    low:        approvalFor(base, partyIdeology, -20, 0.3),
    middleLow:  approvalFor(base, partyIdeology, -10, 0.3),
    middle:     approvalFor(base, partyIdeology, 0,   0.3),
    middleHigh: approvalFor(base, partyIdeology, 10,  0.3),
    high:       approvalFor(base, partyIdeology, 30,  0.3),
  };

  // ── 학력별 (고졸=보수, 대졸=중도, 대학원=진보 - 한국 패턴)
  const byEducation = {
    highschool: approvalFor(base, partyIdeology, 15,  0.25),
    college:    approvalFor(base, partyIdeology, -5,  0.25),
    graduate:   approvalFor(base, partyIdeology, -25, 0.25),
  };

  return {
    overall: base,
    byAgeGroup,
    byRegion: byRegion as ApprovalBreakdown['byRegion'],
    byGender,
    byIdeology,
    byPartyBase: byPartyBase as ApprovalBreakdown['byPartyBase'],
    byIncome,
    byEducation,
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

  // 임기 만료일 계산: 취임일 + 5년 - 1일
  const inaug = new Date(p.inauguratedAt);
  const termEnd = new Date(inaug);
  termEnd.setFullYear(termEnd.getFullYear() + 5);
  termEnd.setDate(termEnd.getDate() - 1);
  const termEndStr = termEnd.toISOString().slice(0, 10);

  const econ = buildEconomy();
  const sec = buildSecurity();
  const soc = buildSocial();
  const jud = INITIAL_JUDICIARY;

  return {
    version: 13,
    createdAt: new Date().toISOString(),
    president: { ...p, termEndsAt: termEndStr },
    clock: { currentDate: date, daysInOffice: 0, turnNumber: 1, speed: 'paused' },
    approval: buildApproval(p.party, baseApproval),
    regions: REGIONS,
    economy: econ,
    social: soc,
    security: sec,
    countries: withForeignLeaderTerms(COUNTRIES),
    companies: COMPANIES,
    intlOrgs: INTL_ORGS,
    international: { ...INITIAL_INTERNATIONAL },
    assembly: buildAssembly(p.party),
    judiciary: { ...jud },
    adminBodies: ADMIN_BODIES,
    cabinet: buildEmptyCabinet(date),
    adminTasks: buildAdminTasks(date),
    buildings: INITIAL_BUILDINGS,
    media: MEDIA_OUTLETS.map(m => ({
      ...m,
      // 매체 성향(bias)이 대통령 이념과 가까울수록 호의도 ↑
      // bias × pres.ideology > 0이면 같은 방향 → 비호의 (음수와 음수 → 양수)
      // 실제론 반대 부호 매칭이 호의 → -m.bias × p.ideology / 100
      favorToPresident: Math.round(-m.bias * p.ideology / 100),
    })),
    articles: buildInitialArticles(p.ideology),
    sns: buildInitialSns(p.ideology),
    events: [inaugurationEvent, cabinetEvent],
    chat: [{
      id: genId('msg'),
      role: 'advisor',
      speaker: '비서실장',
      content: `대통령님. ${date}. 국회의사당 광장. 첫 번째 결재가 올라옵니다.\n\n인수위는 없습니다. 60일 만의 조기 대선이었습니다.\n행정부의 절반이 공석입니다. 시간은 우리 편이 아닙니다.\n\n오늘의 좌표를 보고드리겠습니다.\n\n1. 워싱턴 — 트럼프는 관세를 협상 카드로 꺼냈습니다. 통화는 곧 잡힐 것입니다.\n2. 평양 — 동창리에서 신호가 잡혔습니다. ICBM 발사가 임박했습니다.\n3. 여의도 — 응급실은 닫혔습니다. 의대 정원, 5개월째 답이 없습니다.\n4. 광화문 — 12·3의 그림자가 여전히 길게 누워 있습니다.\n5. 한국은행 — 7월 금통위. 금리 인하 vs 동결.\n\n선택은 대통령님의 몫입니다.\n채팅에 자유롭게 말씀하십시오. "대화"는 협의, "결정"은 집행입니다.\n행정부 인선부터 시작하시길 권합니다.`,
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
    flags: {
      cabinetSetupComplete: false,
      // 임기 시작 시점 지표 (평가 산출용)
      initApproval: baseApproval,
      initKospi: econ.kospi,
      initFxKrw: econ.fxUsdKrw,
      initTreasury: econ.treasuryBalanceKRW,
      initBirthRate: soc.birthRate,
      initSuicide: soc.suicideRate,
      initNkTension: sec.northKoreaTension,
      initUsAlliance: sec.usAllianceStrength,
      initJudiciaryTrust: jud.supremeCourt.publicTrust,
      termStartDate: date,
    },
    elections: buildElections(2025, 2075),
    cultural: INITIAL_CULTURAL,
    pastTerms: [],
    worldEvents: [
      {
        id: genId('we'), date: '2025-06-02',
        category: 'DIPLOMACY' as const,
        headline: '트럼프, 한국·일본·EU에 추가 관세 카드 시사',
        body: '미국 트럼프 대통령이 "동맹국이라도 무역 흑자국엔 관세를 부과할 수 있다"고 발언. 한국 자동차·반도체 직접 타격 우려.',
        involvedCountries: ['US','KR','JP','EU'], koreaImpact: 'HIGH' as const,
      },
      {
        id: genId('we'), date: '2025-06-01',
        category: 'WAR' as const,
        headline: '러시아-우크라이나 휴전 협상 답보',
        body: '트럼프가 중재한 휴전 협상이 영토 인정 문제로 답보. 러시아는 동부 4개 주 점유 확정을, 우크라이나는 2022년 이전 국경 회복을 요구.',
        involvedCountries: ['RU','UA','US'], koreaImpact: 'LOW' as const,
      },
      {
        id: genId('we'), date: '2025-05-30',
        category: 'TECH' as const,
        headline: 'EU, AI 규제법(AI Act) 시행 본격화',
        body: '유럽 27개국에서 고위험 AI 시스템 규제 의무 발효. 한국 IT 기업 EU 진출 시 컴플라이언스 부담.',
        involvedCountries: ['EU'], koreaImpact: 'MED' as const,
      },
      {
        id: genId('we'), date: '2025-05-28',
        category: 'DIPLOMACY' as const,
        headline: '중국, 대만해협서 군사훈련 — 항모 산둥함 출항',
        body: '중국 인민해방군 동부전구가 대만 주변 해역에서 대규모 군사훈련. 대만은 비상경계.',
        involvedCountries: ['CN','TW','US','JP'], koreaImpact: 'MED' as const,
      },
      {
        id: genId('we'), date: '2025-05-25',
        category: 'DOMESTIC' as const,
        headline: '일본, 자위대 예산 GDP 2% 달성 — 안보 정책 전환',
        body: '이시바 내각이 자위대 예산을 GDP 2%로 끌어올림. 반격능력 보유 본격화.',
        involvedCountries: ['JP'], koreaImpact: 'MED' as const,
      },
    ],
    treaties: [],
    laws: KOREAN_LAWS,
    subRegions: buildSubRegions(),
  };
}

export { NOMINEE_POOL };

// =============================================================
// 차기 임기 시작 (5년 임기 종료 후 새 캐릭터로 이어감)
// 장기 누적 상태(경제·사회·외교·인프라·기업·국제기구 등)는 유지하고
// 대통령 개인 관련 상태(인선·채팅·행정업무·지지율·이벤트 등)만 리셋.
// =============================================================
export function buildNewTermState(
  prev: GameState,
  newProfile: PresidentProfile,
): GameState {
  // 새 임기 시작일 = 이전 임기 만료일 + 1일
  const startDate = (() => {
    const d = new Date(prev.president.termEndsAt);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();
  // 새 임기 만료일 = 시작일 + 5년 - 1일
  const endDate = (() => {
    const d = new Date(startDate);
    d.setFullYear(d.getFullYear() + 5);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const newPresident: PresidentProfile = {
    ...newProfile,
    inauguratedAt: startDate,
    termEndsAt: endDate,
    termNumber: (prev.president.termNumber ?? 21) + 1,
  };
  const baseApproval = 55;

  // 임기 만료 시 이전 자체적인 변화를 반영하기 위해 일부 사회·경제 지표는 유지하되,
  // 새 정부 효과로 일부 회복 (소비심리·기업심리·SNS 정서 약간)
  const econ = { ...prev.economy };
  econ.consumerConfidence = Math.min(200, econ.consumerConfidence + 4);
  econ.businessConfidence = Math.min(200, econ.businessConfidence + 4);
  econ.history = econ.history.slice(-10); // 최근만 유지
  econ.lastMonthlyReset = startDate.slice(0, 8) + '01';
  econ.monthlyExportUSD = 0;
  econ.monthlyImportUSD = 0;
  econ.monthlyTradeBalanceUSD = 0;

  // 사회 지표는 그대로 유지 (출산율·자살률·갈등 등은 누적)
  const soc = { ...prev.social };

  // 안보: 유지 (북한·동맹 관계는 누적)
  const sec = {
    ...prev.security,
    warEngagements: prev.security.warEngagements, // 진행중 분쟁은 그대로
  };

  // 국회·사법부: 유지 (탄핵 누계는 새 임기에서 리셋하는 게 합리적)
  const assembly = {
    ...prev.assembly,
    impeachmentMotions: 0,
    filibusterDays: 0,
    pendingBills: [], // 신임 대통령 출범 → 모든 계류 법안 폐기
  };

  const jud = { ...prev.judiciary };

  const inaugEvent = {
    id: genId('evt'),
    date: startDate,
    category: 'POLITICS' as const,
    severity: 'CRITICAL' as const,
    headline: `제${newPresident.termNumber}대 ${newPresident.name} 대통령 취임… "${newPresident.slogan}"`,
    body: `이전 대통령 ${prev.president.name}의 임기 만료에 따라 ${newPresident.name} 신임 대통령이 ${startDate} 정식 취임했다. 5년 임기를 시작한다.`,
    source: 'KBS',
    resolved: true,
  };

  return {
    ...prev,
    version: 13,
    president: newPresident,
    clock: { currentDate: startDate, daysInOffice: 0, turnNumber: 1, speed: 'paused' },
    approval: buildApproval(newProfile.party, baseApproval),
    economy: econ,
    social: soc,
    security: sec,
    assembly,
    judiciary: jud,
    cabinet: buildEmptyCabinet(startDate),
    adminTasks: buildAdminTasks(startDate),
    media: prev.media.map(m => ({
      ...m,
      favorToPresident: Math.round(-m.bias * newProfile.ideology / 100),
    })),
    articles: [],
    sns: { ...prev.sns, recentPosts: [], sentimentScore: Math.round(-newProfile.ideology * 0.1) },
    events: [inaugEvent],
    chat: [{
      id: genId('msg'),
      role: 'advisor' as const,
      speaker: '비서실장',
      content: `대통령님. 새로운 시작입니다.\n전임 ${prev.president.name} 대통령의 임기가 어제 만료됐습니다.\n\n오늘 ${startDate}, ${newPresident.name} 제${newPresident.termNumber}대 대통령으로서 새 5년이 시작됩니다.\n\n전임이 남긴 자산과 부담을 그대로 인수합니다. 첫 결재가 곧 올라옵니다.`,
      timestamp: startDate,
      realTimestamp: new Date().toISOString(),
      contextType: 'BRIEFING' as const,
    }],
    policies: [],
    flags: {
      cabinetSetupComplete: false,
      termEnded: false,
      initApproval: baseApproval,
      initKospi: econ.kospi,
      initFxKrw: econ.fxUsdKrw,
      initTreasury: econ.treasuryBalanceKRW,
      initBirthRate: soc.birthRate,
      initSuicide: soc.suicideRate,
      initNkTension: sec.northKoreaTension,
      initUsAlliance: sec.usAllianceStrength,
      initJudiciaryTrust: jud.supremeCourt.publicTrust,
      termStartDate: startDate,
    },
    worldEvents: prev.worldEvents.slice(0, 10),  // 최근 10개 인수
    treaties: prev.treaties,
    laws: prev.laws,
    subRegions: prev.subRegions,
    // 유지: countries, companies, intlOrgs, international, adminBodies, buildings, parties, regions, elections, cultural, pastTerms, settings
  };
}
