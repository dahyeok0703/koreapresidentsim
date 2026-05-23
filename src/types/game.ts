// =============================================================
// 대한민국 대통령 시뮬레이터 - 데이터 모델 (v2)
// 2025년 6월 4일 기준 실 데이터 / 풀스펙
// =============================================================

export type ID = string;

// ---------------- 정당 / 인물 ----------------
export type PartyId =
  | 'DPK'         // 더불어민주당
  | 'PPP'         // 국민의힘
  | 'RKP'         // 조국혁신당
  | 'PRP'         // 개혁신당
  | 'JP'          // 진보당
  | 'NEW_FUTURE'  // 새로운미래
  | 'BPK'         // 기본소득당
  | 'SDP'         // 사회민주당
  | 'IND';        // 무소속

export interface Party {
  id: PartyId;
  name: string;
  shortName: string;
  color: string;
  ideology: number;         // -100~+100
  seats: number;
  supportRate: number;      // %
  leader: string;
  founded: string;          // year
  description: string;
}

// ---------------- 대통령 / 캐릭터 (풀스펙) ----------------
export interface PresidentProfile {
  // 기본
  name: string;
  nameHanja?: string;
  nameEng?: string;
  party: PartyId;
  age: number;
  birthDate: string;        // YYYY-MM-DD
  birthplace: string;
  gender: 'M' | 'F';
  height: number;           // cm
  weight: number;           // kg
  bloodType: 'A' | 'B' | 'O' | 'AB';
  mbti?: string;
  religion: '무교' | '개신교' | '천주교' | '불교' | '원불교' | '기타';

  // 정치
  ideology: number;         // -100~+100
  slogan: string;           // 캠페인 슬로건
  inaugurationAddress: string; // 취임사 핵심 문장
  traits: string[];

  // 학력
  education: EducationEntry[];

  // 경력
  career: CareerEntry[];

  // 가족
  family: {
    spouse?: string;
    spouseJob?: string;
    children: { name: string; age: number; job?: string }[];
    parents?: string;
    siblings?: string;
  };

  // 자산/건강
  assets: number;            // 억원
  assetsDetail?: string;
  healthStatus: '매우 양호' | '양호' | '보통' | '주의' | '위험';
  healthNotes?: string;
  hobby: string[];
  languages: string[];

  // 임기
  inauguratedAt: string;     // 2025-06-04
  termEndsAt: string;        // 2030-06-03
  termNumber: number;        // 21 (제21대)
}

export interface EducationEntry {
  level: '고등학교' | '학사' | '석사' | '박사' | '명예박사' | '기타';
  school: string;
  major?: string;
  year: number;              // 졸업연도
}

export interface CareerEntry {
  period: string;            // "2016~2020"
  position: string;          // "제20대 국회의원"
  org: string;               // "국회 / 인천 계양을"
}

// ---------------- 시간 / 게임 진행 ----------------
export interface GameClock {
  currentDate: string;        // ISO
  daysInOffice: number;
  turnNumber: number;
  speed: 'paused' | 'slow' | 'normal' | 'fast';
}

// ---------------- 지지율 ----------------
export interface ApprovalBreakdown {
  overall: number;
  byAgeGroup: {
    '18-29': number;
    '30-39': number;
    '40-49': number;
    '50-59': number;
    '60-69': number;
    '70+': number;
  };
  byRegion: Record<RegionId, number>;
  byGender: { male: number; female: number };
  byIdeology: { progressive: number; moderate: number; conservative: number };
  byPartyBase: Record<PartyId, number>;
  byIncome: { low: number; middleLow: number; middle: number; middleHigh: number; high: number };
  byEducation: { highschool: number; college: number; graduate: number };
  history: { date: string; value: number }[];
}

// ---------------- 지역 ----------------
export type RegionId =
  | 'SEOUL' | 'BUSAN' | 'DAEGU' | 'INCHEON' | 'GWANGJU' | 'DAEJEON' | 'ULSAN' | 'SEJONG'
  | 'GYEONGGI' | 'GANGWON' | 'CHUNGBUK' | 'CHUNGNAM' | 'JEONBUK' | 'JEONNAM'
  | 'GYEONGBUK' | 'GYEONGNAM' | 'JEJU';

export interface Region {
  id: RegionId;
  name: string;
  capital: string;
  population: number;        // 만 명
  area: number;              // ㎢
  grdp: number;              // 조 원, 지역내총생산
  leaning: number;           // -100~+100
  economicHealth: number;
  unemployment: number;
  governor: string;
  governorParty: PartyId;
}

// ---------------- 경제 지표 (대폭 확장) ----------------
export interface EconomicState {
  // 성장
  gdpGrowth: number;          // YoY %
  gdpNominal: number;         // 조원
  gdpPerCapita: number;       // 달러
  gniPerCapita: number;       // 달러

  // 물가
  inflation: number;          // CPI YoY %
  coreInflation: number;
  ppi: number;                // 생산자물가 YoY
  groceryInflation: number;   // 신선식품 YoY

  // 고용
  unemployment: number;
  youthUnemployment: number;
  laborParticipation: number;
  employmentRate: number;

  // 통화/금융
  baseRate: number;           // 한은 기준금리
  cd91: number;               // CD 91일물
  treasury10y: number;        // 국고채 10년
  m2Growth: number;           // 광의통화 증가율

  // 환율/시장
  fxUsdKrw: number;
  fxJpyKrw: number;           // 100엔 기준
  fxCnyKrw: number;
  fxEurKrw: number;
  kospi: number;
  kosdaq: number;
  kospi200: number;
  vkospi: number;             // 변동성지수
  marketCap: number;          // 시총 조원

  // 무역
  exportYoY: number;
  importYoY: number;
  tradeBalance: number;       // 억$
  currentAccount: number;     // 억$ (경상수지)
  fdiInflow: number;          // 외국인직접투자, 억$

  // 재정
  fiscalBalance: number;      // GDP대비 %
  primaryBalance: number;
  nationalDebt: number;       // GDP대비 %
  governmentSpending: number; // 조원 (총지출)

  // 부채/주택
  householdDebt: number;      // GDP대비 %
  householdDebtAbs: number;   // 조원 절대값
  corporateDebt: number;      // GDP대비 %
  housePriceIndex: number;
  housePriceYoY: number;
  jeonseIndex: number;
  jeonseYoY: number;
  housingSupply: number;      // 만호/연

  // 심리
  consumerConfidence: number; // CCSI, 100 기준
  businessConfidence: number; // BSI
  economicSentimentIndex: number; // ESI

  // 산업
  semiconductorExport: number;  // 억$, 핵심산업
  autoExport: number;
  shipExport: number;
  steelExport: number;

  // 외환보유고
  fxReserves: number;         // 억$

  // 추세
  history: { date: string; gdp: number; cpi: number; unemp: number; kospi: number; fxUsdKrw: number }[];
}

// ---------------- 사회 지표 (확장) ----------------
export interface SocialState {
  // 인구
  totalPopulation: number;    // 만명
  populationGrowth: number;   // YoY %
  birthRate: number;          // 합계출산율
  deathRate: number;          // 인구1천명당
  marriageRate: number;
  divorceRate: number;
  agingIndex: number;         // 노령화지수
  medianAge: number;
  immigrantPopulation: number; // 만명

  // 건강/안전
  suicideRate: number;
  trafficDeaths: number;
  crimeIndex: number;
  violentCrimeRate: number;   // 10만명당
  drugCrimeCount: number;     // 연 누계

  // 만족도
  healthcareSatisfaction: number;
  educationSatisfaction: number;
  pensionTrust: number;
  publicSafetySatisfaction: number;
  governmentTrust: number;

  // 갈등 지표
  genderConflictIndex: number;
  generationConflictIndex: number;
  regionalConflictIndex: number;
  classConflictIndex: number;
  immigrationSentiment: number;

  // 환경
  airQualityPM25: number;
  carbonEmission: number;     // 백만톤 CO2/연
  greenEnergyShare: number;   // %

  // 언론/자유
  pressFreedomIndex: number;  // RSF 점수
  corruptionPerceptionIndex: number; // CPI (100점 만점)
  democracyIndex: number;     // EIU 0-10
  giniIndex: number;          // 지니계수 0-1
  povertyRate: number;        // 상대빈곤율 %

  // 교육
  collegeAdmissionRate: number;
  privateEduSpending: number; // 조원/연

  // 부동산 체감
  housingAffordability: number; // 0-100 (높을수록 취약)
}

// ---------------- 안보 / 군사 (확장) ----------------
export interface SecurityState {
  // 위협도
  northKoreaTension: number;
  northKoreaProvocationRisk: number;
  cyberThreatLevel: number;
  terrorThreatLevel: number;
  defconLevel: 1 | 2 | 3 | 4 | 5;
  watchcon: 1 | 2 | 3 | 4;    // 대북정보감시태세

  // 군사력
  rokMilitaryReadiness: number;
  troopsActive: number;       // 만명 (현역)
  troopsReserve: number;      // 만명 (예비역)
  defenseBudget: number;      // 조원
  defenseBudgetPctGdp: number;
  globalFireRank: number;     // GFP 순위

  // 보유 무기
  tanks: number;
  aircraft: number;
  warships: number;
  submarines: number;
  missilesBallistic: number;
  nukesAvailable: boolean;    // 핵 (한국 미보유 = false)

  // 동맹
  usAllianceStrength: number;
  usftKorea: number;          // 주한미군 명
  natoPartnership: number;

  // 북한
  northKoreaNukes: number;    // 추정 보유 수
  northKoreaMissilesYear: number; // 올해 발사 횟수
}

// ---------------- 외교 (대폭 확장) ----------------
export type CountryId =
  | 'US' | 'CN' | 'JP' | 'NK' | 'RU' | 'EU' | 'UK' | 'DE' | 'FR' | 'IN'
  | 'VN' | 'AU' | 'TW' | 'PH' | 'ID' | 'TH' | 'SG' | 'CA' | 'BR' | 'MX'
  | 'SA' | 'IL' | 'IR' | 'TR' | 'PL' | 'UA' | 'UN' | 'NATO' | 'ASEAN';

export interface ForeignRelation {
  id: CountryId;
  name: string;
  nameLocal?: string;
  leader: string;
  leaderTitle: string;
  capital: string;
  population: number;         // 만명
  gdp: number;                // 조달러 (명목)
  militaryRank?: number;      // GFP
  nuclear: boolean;
  unscPermanent: boolean;
  alliance: 'ALLY' | 'PARTNER' | 'NEUTRAL' | 'RIVAL' | 'HOSTILE';

  // 양자관계
  relation: number;           // -100 ~ +100
  trustLevel: number;         // 0-100
  tradeVolume: number;        // 억$/연 (양자)
  exportTo: number;           // 한국 수출
  importFrom: number;         // 한국 수입
  koreanResidents: number;    // 한인 (만명)

  // 비자/협정
  hasFTA: boolean;
  visaFreeKorean: boolean;
  treaties: string[];

  recentEvents: string[];
  flag?: string;              // 이모지
}

// ---------------- 국제 정세 ----------------
export interface InternationalContext {
  ongoingConflicts: Conflict[];
  globalEconomy: {
    worldGdpGrowth: number;
    chinaGrowth: number;
    usGrowth: number;
    euGrowth: number;
    oilPriceWTI: number;      // $/배럴
    oilPriceBrent: number;
    goldPrice: number;        // $/온스
    dxy: number;              // 달러인덱스
  };
  sp500: number;
  nasdaq: number;
  nikkei: number;
  hangseng: number;
  shanghai: number;
  bitcoin: number;            // USD
  globalIssues: string[];     // 현재 주요 이슈
}

export interface Conflict {
  id: string;
  name: string;
  parties: string[];
  startDate: string;
  status: 'ACTIVE' | 'CEASEFIRE' | 'NEGOTIATING' | 'FROZEN';
  intensity: number;          // 0-100
  description: string;
  koreaInvolvement: 'NONE' | 'DIPLOMATIC' | 'HUMANITARIAN' | 'MILITARY';
}

// ---------------- 국회 ----------------
export interface AssemblyState {
  totalSeats: number;
  bySeat: Record<PartyId, number>;
  speaker: { name: string; party: PartyId };
  deputySpeakers: { name: string; party: PartyId }[];
  rulingCoalitionSeats: number;
  oppositionSeats: number;
  committees: Committee[];
  pendingBills: Bill[];
  passedBills: Bill[];
  vetoedBills: Bill[];
  impeachmentMotions: number; // 누적
  filibusterDays: number;
}

export interface Committee {
  name: string;
  chair: string;
  chairParty: PartyId;
  membersCount: number;
}

export interface Bill {
  id: ID;
  title: string;
  summary: string;
  proposer: 'PRESIDENT' | 'RULING' | 'OPPOSITION';
  category: string;
  ideologyShift: number;
  expectedEffects: PartialEffects;
  status: 'PENDING' | 'PASSED' | 'VETOED' | 'REJECTED' | 'REPASSED';
  introducedAt: string;
  yesVotes?: number;
  noVotes?: number;
}

// ---------------- 사법부 ----------------
export interface JudiciaryState {
  supremeCourt: {
    chiefJustice: string;
    justices: { name: string; appointedBy: string; ideology: number }[];
    pendingMajorCases: string[];
    publicTrust: number;
  };
  constitutionalCourt: {
    chief: string;
    justices: { name: string; appointedBy: string; ideology: number }[];
    pendingCases: string[];
    publicTrust: number;
  };
  prosecution: {
    prosecutorGeneral: string;
    publicTrust: number;
    independenceIndex: number; // 0-100, 정치 독립성
    activeMajorInvestigations: string[];
  };
  police: {
    commissioner: string;
    publicTrust: number;
  };
  rulings: { date: string; court: string; summary: string }[];
}

// ---------------- 내각 / 인사 ----------------
export type MinistryId =
  | 'PM' | 'MOEF' | 'MOFA' | 'MOU' | 'MND' | 'MOIS' | 'MOJ' | 'MOE'
  | 'MSIT' | 'MCST' | 'MOTIE' | 'MOHW' | 'MOEL' | 'MOLIT' | 'MAFRA'
  | 'MOF' | 'ME' | 'MOGEF' | 'MPVA' | 'MOSPA' | 'MOSME'
  | 'NIS' | 'BAI' | 'PPS' | 'BOK' | 'KCC' | 'FSC' | 'FTC';

export interface Official {
  id: ID;
  name: string;
  ministry: MinistryId;
  ministryName: string;
  party: PartyId;
  loyalty: number;
  competence: number;
  publicFavor: number;
  scandalRisk: number;
  appointedAt: string;
  bio: string;
  age: number;
  education: string;
}

// ---------------- 미디어 ----------------
export type MediaId =
  | 'KBS' | 'MBC' | 'SBS' | 'JTBC' | 'YTN' | 'TVCHOSUN' | 'CHANNELA' | 'MBN'
  | 'CHOSUN' | 'JOONGANG' | 'DONGA' | 'HANI' | 'KYUNGHYANG' | 'OHMY'
  | 'YONHAP' | 'NEWSIS' | 'NEWS1' | 'EDAILY' | 'MK';

export interface MediaOutlet {
  id: MediaId;
  name: string;
  type: '지상파' | '종편' | '신문' | '인터넷' | '통신사' | '경제지';
  bias: number;
  influence: number;
  favorToPresident: number;
  circulation?: number;       // 만부 (신문)
  viewership?: number;        // % (방송)
  owner?: string;
}

// ---------------- SNS / 여론 ----------------
export interface SnsState {
  platforms: SnsPlatform[];
  hotKeywords: { keyword: string; volume: number; sentiment: number }[]; // sentiment -100~100
  presidentMentions: number;  // 일일 언급량 (만건)
  sentimentScore: number;     // -100~100
  recentPosts: SnsPost[];
  protestSentiment: number;   // 0-100, 시위 동력
}

export interface SnsPlatform {
  id: 'X' | 'INSTAGRAM' | 'FACEBOOK' | 'YOUTUBE' | 'KAKAO' | 'NAVER_CAFE' | 'DCINSIDE' | 'FMKOREA' | 'CLIEN';
  name: string;
  monthlyUsers: number;       // 만명
  mainAge: string;
  bias: number;               // -100~100 평균 성향
  presidentFavor: number;     // -100~100
  desc: string;
}

export interface SnsPost {
  id: string;
  platform: SnsPlatform['id'];
  author: string;
  content: string;
  likes: number;
  reposts: number;
  sentiment: number;
  timestamp: string;
}

// ---------------- 이벤트 ----------------
export type EventCategory =
  | 'ECONOMY' | 'DIPLOMACY' | 'SECURITY' | 'SOCIAL' | 'DISASTER'
  | 'SCANDAL' | 'POLITICS' | 'CULTURE' | 'TECH' | 'HEALTH' | 'NK'
  | 'LEGAL' | 'INTERNATIONAL' | 'SNS' | 'MEDIA';

export type EventSeverity = 'INFO' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

export interface GameEvent {
  id: ID;
  date: string;
  category: EventCategory;
  severity: EventSeverity;
  headline: string;
  body: string;
  source: string;
  choices?: EventChoice[];
  resolved?: boolean;
  resolution?: string;
  effects?: PartialEffects;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  expectedEffects: PartialEffects;
  ideology: number;
}

// ---------------- 효과 시스템 ----------------
export interface PartialEffects {
  approval?: number;
  approvalByAge?: Partial<ApprovalBreakdown['byAgeGroup']>;
  approvalByRegion?: Partial<Record<RegionId, number>>;
  approvalByIdeology?: Partial<ApprovalBreakdown['byIdeology']>;
  approvalByIncome?: Partial<ApprovalBreakdown['byIncome']>;
  economy?: Partial<Pick<EconomicState,
    'gdpGrowth' | 'inflation' | 'coreInflation' | 'unemployment' | 'youthUnemployment' |
    'kospi' | 'kosdaq' | 'fxUsdKrw' | 'consumerConfidence' | 'businessConfidence' |
    'housePriceYoY' | 'jeonseYoY' | 'fiscalBalance' | 'baseRate' | 'currentAccount' |
    'fxReserves' | 'tradeBalance' | 'exportYoY'>>;
  social?: Partial<SocialState>;
  security?: Partial<SecurityState>;
  foreign?: Partial<Record<CountryId, { relation?: number; trust?: number }>>;
  judiciary?: { supremeTrust?: number; ccTrust?: number; prosecutionTrust?: number; prosecutionIndep?: number };
  sns?: { sentiment?: number; protestSentiment?: number; mentions?: number };
  notes?: string;
}

// ---------------- 채팅 ----------------
export type ChatRole = 'system' | 'user' | 'assistant' | 'advisor' | 'press' | 'foreign';

export interface ChatMessage {
  id: ID;
  role: ChatRole;
  speaker?: string;
  content: string;
  timestamp: string;
  realTimestamp: string;
  contextType?: 'BRIEFING' | 'CABINET' | 'PRESS' | 'CALL' | 'DECISION' | 'GENERAL';
  attachedEffects?: PartialEffects;
  isDecision?: boolean;
}

// ---------------- 정책 ----------------
export interface Policy {
  id: ID;
  title: string;
  category: EventCategory;
  description: string;
  enactedAt: string;
  cost: number;
  ongoingEffects: PartialEffects;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
}

// ---------------- 설정 ----------------
export interface Settings {
  openaiApiKey: string;
  model: string;
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'NIGHTMARE';
  realismLevel: 'ARCADE' | 'BALANCED' | 'REALISTIC';
  autoEvents: boolean;
  eventsPerTurn: number;
  language: 'ko';
}

// ---------------- 전체 상태 ----------------
export interface GameState {
  version: number;
  createdAt: string;
  president: PresidentProfile;
  clock: GameClock;
  approval: ApprovalBreakdown;
  regions: Region[];
  economy: EconomicState;
  social: SocialState;
  security: SecurityState;
  foreign: ForeignRelation[];
  international: InternationalContext;
  assembly: AssemblyState;
  judiciary: JudiciaryState;
  cabinet: Official[];
  media: MediaOutlet[];
  sns: SnsState;
  events: GameEvent[];
  newsTicker: string[];
  chat: ChatMessage[];
  policies: Policy[];
  parties: Party[];
  settings: Settings;
  flags: Record<string, boolean | number | string>;
}
