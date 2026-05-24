// =============================================================
// 대한민국 대통령 시뮬레이터 - 데이터 모델 (v3)
// =============================================================

export type ID = string;

// ---------------- 정당 ----------------
export type PartyId =
  | 'DPK' | 'PPP' | 'RKP' | 'PRP' | 'JP' | 'NEW_FUTURE' | 'BPK' | 'SDP' | 'IND';

export interface Party {
  id: PartyId;
  name: string;
  shortName: string;
  color: string;
  ideology: number;
  seats: number;
  supportRate: number;
  leader: string;
  founded: string;
  description: string;
}

// ---------------- 대통령 ----------------
export interface PresidentProfile {
  name: string;
  nameEng?: string;
  party: PartyId;
  birthDate: string;
  birthplace: string;
  gender: 'M' | 'F';
  height: number;
  weight: number;
  bloodType: 'A' | 'B' | 'O' | 'AB';
  mbti?: string;
  religion: '무교' | '개신교' | '천주교' | '불교' | '원불교' | '기타';
  ideology: number;
  slogan: string;
  inaugurationAddress: string;
  traits: string[];
  education: EducationEntry[];
  career: CareerEntry[];
  family: {
    spouse?: string;
    spouseJob?: string;
    children: { name: string; age: number; job?: string }[];
    parents?: string;
    siblings?: string;
  };
  assets: number;
  assetsDetail?: string;
  healthStatus: '매우 양호' | '양호' | '보통' | '주의' | '위험';
  healthNotes?: string;
  hobby: string[];
  languages: string[];
  inauguratedAt: string;
  termEndsAt: string;
  termNumber: number;
}

export interface EducationEntry {
  level: '고등학교' | '학사' | '석사' | '박사' | '명예박사' | '기타';
  school: string;
  major?: string;
  year: number;
}

export interface CareerEntry {
  period: string;
  position: string;
  org: string;
}

// ---------------- 시간 ----------------
export interface GameClock {
  currentDate: string;
  daysInOffice: number;
  turnNumber: number;
  speed: 'paused' | 'slow' | 'normal' | 'fast';
}

// ---------------- 지지율 ----------------
export interface ApprovalBreakdown {
  overall: number;
  byAgeGroup: {
    '18-29': number; '30-39': number; '40-49': number;
    '50-59': number; '60-69': number; '70+': number;
  };
  byRegion: Record<RegionId, number>;
  byGender: { male: number; female: number };
  byIdeology: { progressive: number; moderate: number; conservative: number };
  byPartyBase: Record<PartyId, number>;
  byIncome: { low: number; middleLow: number; middle: number; middleHigh: number; high: number };
  byEducation: { highschool: number; college: number; graduate: number };
  history: { date: string; value: number }[];
}

// ---------------- 지역 (행정구역) ----------------
export type RegionId =
  | 'SEOUL' | 'BUSAN' | 'DAEGU' | 'INCHEON' | 'GWANGJU' | 'DAEJEON' | 'ULSAN' | 'SEJONG'
  | 'GYEONGGI' | 'GANGWON' | 'CHUNGBUK' | 'CHUNGNAM' | 'JEONBUK' | 'JEONNAM'
  | 'GYEONGBUK' | 'GYEONGNAM' | 'JEJU';

export interface Region {
  id: RegionId;
  name: string;
  capital: string;
  population: number;            // 만 명
  area: number;                  // ㎢
  grdp: number;                  // 조 원
  perCapitaIncome: number;       // 만 원/연
  leaning: number;
  economicHealth: number;
  unemployment: number;          // %
  birthRate: number;             // 합계출산율
  agingRatio: number;            // 65세 이상 %
  governor: string;
  governorParty: PartyId;
  subdivisions: number;          // 시군구 수
  notableCities: string[];
  industries: string[];          // 주요 산업
  speciality: string[];          // 특산물
  universities: number;
  hospitals: number;
  airports: string[];
  ports: string[];
  notableInfra: string[];        // 주요 인프라/랜드마크
}

// ---------------- 경제 (대폭 확장 - 달러 단위 추가) ----------------
export interface EconomicState {
  // 성장 / GDP
  gdpGrowth: number;
  gdpNominalKRW: number;       // 조원
  gdpNominalUSD: number;       // 십억$ ($B)
  gdpPpp: number;              // 십억$ PPP
  gdpPerCapita: number;        // $
  gniPerCapita: number;        // $

  // 물가
  inflation: number;
  coreInflation: number;
  ppi: number;
  groceryInflation: number;
  housingInflation: number;
  energyInflation: number;
  servicesInflation: number;

  // 고용
  unemployment: number;
  youthUnemployment: number;
  laborParticipation: number;
  employmentRate: number;
  femaleEmploymentRate: number;
  irregularWorkerRatio: number; // 비정규직 비율 %

  // 금리/통화
  baseRate: number;
  cd91: number;
  treasury10y: number;
  treasury3y: number;
  m2Growth: number;
  m2Total: number;             // 조원

  // 환율/시장 (달러 기준만)
  fxUsdKrw: number;
  kospi: number;
  kosdaq: number;
  kospi200: number;
  vkospi: number;
  marketCapUSD: number;        // 십억$

  // 무역 (월별 누적 + 연 누적)
  exportYoY: number;
  importYoY: number;
  monthlyExportUSD: number;    // 이번 달 누적 ($B)
  monthlyImportUSD: number;
  monthlyTradeBalanceUSD: number; // 이번 달 무역수지 ($B)
  ytdTradeBalanceUSD: number;     // 연 누적
  currentAccountUSD: number;       // 경상수지 누적 ($B)
  fdiInflowUSD: number;
  fxReservesUSD: number;          // 외환보유고 ($B)

  // 재정 / 국고
  fiscalBalance: number;
  primaryBalance: number;
  nationalDebt: number;
  governmentSpending: number;
  treasuryBalanceKRW: number;     // 국고 잔액 (조원, 누적)
  taxRevenue: number;             // 연 세수 (조원)

  // 부채
  householdDebt: number;
  householdDebtAbs: number;
  corporateDebt: number;

  // 주택
  housePriceIndex: number;
  housePriceYoY: number;
  jeonseIndex: number;
  jeonseYoY: number;
  housingSupply: number;
  unsoldHousesNationwide: number; // 만호 미분양

  // 심리
  consumerConfidence: number;
  businessConfidence: number;
  economicSentimentIndex: number;

  // 산업 (연 수출 십억$)
  semiconductorExport: number;
  autoExport: number;
  shipExport: number;
  steelExport: number;
  petrochemicalExport: number;
  batteryExport: number;
  displayExport: number;

  // 추세
  history: { date: string; gdp: number; cpi: number; unemp: number; kospi: number; fxUsdKrw: number }[];

  // 마지막 월 리셋 일자
  lastMonthlyReset: string;
}

// ---------------- 사회 ----------------
export interface SocialState {
  totalPopulation: number;
  populationGrowth: number;
  birthRate: number;
  deathRate: number;
  marriageRate: number;
  divorceRate: number;
  agingIndex: number;
  medianAge: number;
  immigrantPopulation: number;
  multiculturalFamilies: number; // 만 가구
  suicideRate: number;
  trafficDeaths: number;
  crimeIndex: number;
  violentCrimeRate: number;
  drugCrimeCount: number;
  cyberCrimeCount: number;
  healthcareSatisfaction: number;
  educationSatisfaction: number;
  pensionTrust: number;
  publicSafetySatisfaction: number;
  governmentTrust: number;
  judicialTrust: number;
  presidentialOfficeTrust: number;
  parliamentTrust: number;
  genderConflictIndex: number;
  generationConflictIndex: number;
  regionalConflictIndex: number;
  classConflictIndex: number;
  immigrationSentiment: number;
  airQualityPM25: number;
  airQualityPM10: number;
  carbonEmission: number;
  greenEnergyShare: number;
  pressFreedomIndex: number;
  corruptionPerceptionIndex: number;
  democracyIndex: number;
  giniIndex: number;
  povertyRate: number;
  collegeAdmissionRate: number;
  privateEduSpending: number;
  housingAffordability: number;
  homeOwnershipRate: number;
  internetPenetration: number;
  smartphonePenetration: number;
  energySelfSufficiency: number;
  foodSelfSufficiency: number;
}

// ---------------- 안보 ----------------
export interface SecurityState {
  northKoreaTension: number;
  northKoreaProvocationRisk: number;
  cyberThreatLevel: number;
  terrorThreatLevel: number;
  defconLevel: 1 | 2 | 3 | 4 | 5;
  watchcon: 1 | 2 | 3 | 4;
  rokMilitaryReadiness: number;
  troopsActive: number;
  troopsReserve: number;
  defenseBudget: number;
  defenseBudgetPctGdp: number;
  globalFireRank: number;
  nukesAvailable: boolean;
  usAllianceStrength: number;
  usftKorea: number;
  natoPartnership: number;
  northKoreaNukes: number;
  northKoreaMissilesYear: number;

  // 무기 인벤토리
  weapons: WeaponEntry[];
  // 군사기지
  bases: MilitaryBase[];
  // 부대 (사단/여단/함대 등)
  units: MilitaryUnit[];

  // 전쟁 / 분쟁 개입
  warEngagements: WarEngagement[];
}

export interface WeaponEntry {
  id: ID;
  category: '전차' | '장갑차' | '자주포' | '견인포' | '다연장' | '전투기' | '공격기' | '수송기'
          | '헬기' | '구축함' | '잠수함' | '호위함' | '미사일' | '방공' | '레이더' | '드론' | '기타';
  name: string;
  count: number;
  origin: string;
  status: '계약' | '생산' | '인도' | '시험' | '운용' | '퇴역대기' | '퇴역' | '보관' | '도입중';
  notes?: string;
  procurementStartedAt?: string;   // 도입 착수일 (계약 체결일)
  expectedOperatingAt?: string;     // 전력화 예정일
  contractedCount?: number;         // 계약 총 수량 (점진적 인도)
}

export interface MilitaryBase {
  id: ID;
  name: string;
  type: '육군' | '해군' | '공군' | '해병' | '합동' | '미군' | '특수';
  region: RegionId;
  location: string;
  personnel?: number;
  desc?: string;
}

export interface MilitaryUnit {
  id: ID;
  name: string;
  echelon: '군' | '군단' | '사단' | '여단' | '함대' | '비행단' | '특임' | '예비';
  service: '육군' | '해군' | '공군' | '해병' | '예비' | '국직';
  hq: string;
  personnel?: number;
  notes?: string;
}

export interface WarEngagement {
  id: ID;
  name: string;
  parties: string[];
  koreaRole: 'NONE' | 'DIPLOMATIC' | 'HUMANITARIAN' | 'LOGISTICAL' | 'COMBAT';
  startDate: string;
  troopsDeployed: number;
  costPerMonth: number;       // 조원
  notes: string;
}

// ---------------- 외교 (200개국 풀스펙) ----------------
export type Continent = 'ASIA' | 'EUROPE' | 'AFRICA' | 'NA' | 'SA' | 'OCEANIA' | 'ME';

export type AllianceStatus = 'ALLY' | 'PARTNER' | 'NEUTRAL' | 'RIVAL' | 'HOSTILE';

export interface Country {
  id: string;                 // ISO3 or special
  name: string;
  nameLocal?: string;
  flag: string;               // emoji
  continent: Continent;
  capital: string;
  population: number;         // 만명
  area: number;               // ㎢ (천 단위)
  gdpUSD: number;             // 십억$ ($B)
  gdpPerCapita: number;       // $
  leader: string;
  leaderTitle: string;
  government: string;
  nuclear: boolean;
  unscPermanent: boolean;
  hasEmbassyInKorea: boolean;
  hasEmbassyInCountry: boolean; // 한국이 대사관 보유
  alliance: AllianceStatus;
  relation: number;           // -100 ~ 100
  trustLevel: number;         // 0-100
  tradeVolumeUSD: number;     // 억$ /연
  hasFTA: boolean;
  visaFreeKorean: boolean;
  koreanResidents: number;    // 명
  treaties: string[];
  recentEvents: string[];
  termEnd?: string;            // 정상 임기 만료 (YYYY-MM-DD)
  successorIndex?: number;     // 후임 풀에서 사용한 인덱스
}

// ---------------- 국제기구 ----------------
export interface IntlOrg {
  id: string;
  name: string;
  fullName?: string;
  type: 'UN' | 'SECURITY' | 'ECONOMIC' | 'TRADE' | 'CULTURAL' | 'HEALTH' | 'ENVIRONMENT' | 'REGIONAL' | '기타';
  founded: string;
  hq: string;
  memberCountries: string[];  // Country.id 배열
  koreaMember: boolean;
  koreaRole: '정회원' | '옵저버' | '비회원' | '의장국' | '비상임이사국' | '창설국';
  contributionUSD?: number;    // 분담금 백만$/연
  desc: string;
  benefits?: string;
  notes?: string;
}

// ---------------- 국제정세 ----------------
export interface InternationalContext {
  ongoingConflicts: Conflict[];
  globalEconomy: {
    worldGdpGrowth: number;
    chinaGrowth: number;
    usGrowth: number;
    euGrowth: number;
    oilPriceWTI: number;
    oilPriceBrent: number;
    goldPrice: number;
    dxy: number;
  };
  sp500: number;
  nasdaq: number;
  nikkei: number;
  hangseng: number;
  shanghai: number;
  bitcoin: number;
  globalIssues: string[];
}

export interface Conflict {
  id: string;
  name: string;
  parties: string[];
  startDate: string;
  status: 'ACTIVE' | 'CEASEFIRE' | 'NEGOTIATING' | 'FROZEN';
  intensity: number;
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
  impeachmentMotions: number;
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
    independenceIndex: number;
    activeMajorInvestigations: string[];
  };
  police: {
    commissioner: string;
    publicTrust: number;
  };
  rulings: { date: string; court: string; summary: string }[];
}

// ---------------- 행정부 (확장 - 부처/처/위원회/청 + 진행 업무) ----------------
export type MinistryId =
  | 'PM' | 'MOEF' | 'MOFA' | 'MOU' | 'MND' | 'MOIS' | 'MOJ' | 'MOE'
  | 'MSIT' | 'MCST' | 'MOTIE' | 'MOHW' | 'MOEL' | 'MOLIT' | 'MAFRA'
  | 'MOF' | 'ME' | 'MOGEF' | 'MPVA' | 'MOSME'
  | 'BAI' | 'NIS' | 'PPS' | 'BOK' | 'KCC' | 'FSC' | 'FTC' | 'MFDS'
  | 'KCS' | 'NTS' | 'PPS_PROC' | 'STAT' | 'PIPC' | 'ACRC' | 'HRC' | 'NEC'
  | 'KMA' | 'KFS' | 'KIPO' | 'CHA' | 'NPS' | 'KOSTAT' | 'NPA' | 'NFA' | 'KCG'
  | 'MMA' | 'DAPA' | 'KSWCC' | 'MOPAS' | 'PSC';

export interface AdminBody {
  id: MinistryId;
  name: string;
  category: '대통령실' | '국무총리실' | '부' | '처' | '청' | '위원회' | '독립기관';
  parentId?: MinistryId;       // 부처 산하 청·실
  ideologyImportance: number;  // 정치적 민감도
}

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
  confirmed: boolean;          // 청문회 통과
}

export interface AdminTask {
  id: ID;
  bodyId: MinistryId;
  title: string;
  detail: string;
  progress: number;            // 0-100
  startedAt: string;
  dueAt?: string;
  priority: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
  status: 'PROGRESS' | 'DONE' | 'BLOCKED' | 'CANCELED';
}

// ---------------- 미디어 / 기사 ----------------
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
  circulation?: number;
  viewership?: number;
  owner?: string;
}

export interface NewsArticle {
  id: ID;
  outlet: MediaId | string;
  headline: string;
  lead: string;            // 리드 문장
  body?: string;           // 본문
  date: string;
  category: EventCategory;
  bias: number;            // -100~100
}

// ---------------- SNS (포스트 강화) ----------------
export interface SnsState {
  platforms: SnsPlatform[];
  hotKeywords: { keyword: string; volume: number; sentiment: number }[];
  presidentMentions: number;
  sentimentScore: number;
  recentPosts: SnsPost[];
  protestSentiment: number;
}

export interface SnsPlatform {
  id: 'X' | 'INSTAGRAM' | 'FACEBOOK' | 'YOUTUBE' | 'KAKAO' | 'NAVER_CAFE' | 'DCINSIDE' | 'FMKOREA' | 'CLIEN' | 'THREADS' | 'NAVER_BLOG'
    | 'REDDIT' | 'PTT' | 'BAIDU' | 'YAHOO_JP' | 'X_INTL' | 'WEIBO';
  name: string;
  monthlyUsers: number;
  mainAge: string;
  bias: number;
  presidentFavor: number;
  desc: string;
}

export interface SnsPost {
  id: ID;
  platform: SnsPlatform['id'];
  author: string;
  handle?: string;
  content: string;
  likes: number;
  reposts: number;
  comments: number;
  sentiment: number;
  timestamp: string;
}

// ---------------- 토건 (인프라/건축) ----------------
export type BuildingCategory =
  | '주거' | '상업' | '공업' | '교통' | '에너지' | '수자원' | '국방' | '교육'
  | '의료' | '문화' | '연구' | '농수산' | '관광' | '해양' | '우주' | '기타';

export interface Building {
  id: ID;
  name: string;
  category: BuildingCategory;
  region: RegionId | 'OFFSHORE' | 'OVERSEAS';
  location: string;
  builtYear?: number;
  size?: string;          // "10층" or "30만㎡"
  capacity?: number;
  status: 'OPERATING' | 'CONSTRUCTING' | 'PLANNED' | 'DECOMMISSIONED';
  cost?: number;          // 억원
  desc?: string;
  isLandmark?: boolean;
  startedAt?: string;          // 착공일 (YYYY-MM-DD)
  expectedCompletion?: string; // 예정 완공일 (YYYY-MM-DD), 이 시점 지나면 자동 OPERATING
}

// ---------------- 이벤트 ----------------
export type EventCategory =
  | 'ECONOMY' | 'DIPLOMACY' | 'SECURITY' | 'SOCIAL' | 'DISASTER'
  | 'SCANDAL' | 'POLITICS' | 'CULTURE' | 'TECH' | 'HEALTH' | 'NK'
  | 'LEGAL' | 'INTERNATIONAL' | 'SNS' | 'MEDIA' | 'WAR' | 'INFRA';

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
  mandatory?: boolean;       // 필수 처리
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  expectedEffects: PartialEffects;
  ideology: number;
}

// ---------------- 효과 ----------------
export interface PartialEffects {
  approval?: number;
  approvalByAge?: Partial<ApprovalBreakdown['byAgeGroup']>;
  approvalByRegion?: Partial<Record<RegionId, number>>;
  approvalByIdeology?: Partial<ApprovalBreakdown['byIdeology']>;
  approvalByIncome?: Partial<ApprovalBreakdown['byIncome']>;
  economy?: Partial<Pick<EconomicState,
    'gdpGrowth' | 'inflation' | 'coreInflation' | 'unemployment' | 'youthUnemployment' |
    'kospi' | 'kosdaq' | 'fxUsdKrw' | 'consumerConfidence' | 'businessConfidence' |
    'housePriceYoY' | 'jeonseYoY' | 'fiscalBalance' | 'baseRate' |
    'currentAccountUSD' | 'fxReservesUSD' | 'monthlyTradeBalanceUSD' | 'exportYoY' |
    'treasuryBalanceKRW' | 'taxRevenue'>>;
  social?: Partial<SocialState>;
  security?: Partial<Omit<SecurityState, 'weapons' | 'bases' | 'units' | 'warEngagements'>>;
  foreign?: Record<string, { relation?: number; trust?: number }>;
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
  googleClientId?: string;     // Google OAuth Client ID (선택)
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
  countries: Country[];
  companies: import('../data/companies').Company[];
  intlOrgs: IntlOrg[];
  international: InternationalContext;
  assembly: AssemblyState;
  judiciary: JudiciaryState;
  adminBodies: AdminBody[];
  cabinet: Official[];
  adminTasks: AdminTask[];
  buildings: Building[];
  media: MediaOutlet[];
  articles: NewsArticle[];
  sns: SnsState;
  events: GameEvent[];
  chat: ChatMessage[];
  policies: Policy[];
  parties: Party[];
  settings: Settings;
  flags: Record<string, boolean | number | string>;
  elections: Election[];
  cultural: CulturalState;
  pastTerms: TermEvaluation[];
  worldEvents: WorldEvent[];
  treaties: Treaty[];
  laws: import('../data/laws').Law[];
  subRegions: import('../data/subRegions').SubRegion[];
}

// ---------------- 국제 뉴스 피드 (한국 외 국가들의 능동 행동) ----------------
export interface WorldEvent {
  id: string;
  date: string;
  category: 'DIPLOMACY' | 'WAR' | 'ECONOMY' | 'DOMESTIC' | 'TECH' | 'DISASTER' | 'LEADERSHIP' | 'TREATY';
  headline: string;
  body: string;
  involvedCountries: string[];
  koreaImpact: 'NONE' | 'LOW' | 'MED' | 'HIGH';
  effects?: PartialEffects;
  countryRelationChanges?: {
    countries: [string, string];
    delta: number;
  }[];
}

// ---------------- 조약 ----------------
export interface Treaty {
  id: string;
  signedAt: string;
  warId?: string;
  name: string;
  parties: string[];
  victor: 'KOREA' | 'OPPONENT' | 'COALITION' | 'STALEMATE';
  terms: TreatyTerms;
  summary: string;
}

export interface TreatyTerms {
  ceasefire: boolean;
  reparationsKRW?: number;
  territorialCession?: {
    fromCountryId: string;
    toCountryId: string;
    description: string;
    sizePercent: number;
  }[];
  newCountries?: {
    name: string;
    fromCountryId: string;
    population: number;
    capital: string;
    initialRelationKorea: number;
  }[];
  annexations?: { absorberId: string; absorbedId: string }[];
  alliances?: string[];
  sanctionsLifted?: string[];
  notes?: string;
}

// ---------------- AI 액션 (채팅 결정으로 인한 게임 상태 변경) ----------------
export type AIActionType =
  | 'ADD_BUILDING' | 'REMOVE_BUILDING' | 'DECOMMISSION_BUILDING'
  | 'ADD_WEAPON'   | 'REMOVE_WEAPON'   | 'ADJUST_WEAPON_COUNT'
  | 'ADD_UNIT'     | 'REMOVE_UNIT'
  | 'ADD_BASE'     | 'REMOVE_BASE'
  | 'SIGN_TREATY'  | 'BEGIN_WAR'      | 'END_WAR'
  | 'CREATE_COUNTRY' | 'ANNEX_COUNTRY' | 'CHANGE_LEADER'
  | 'ADD_TREATY'   | 'BEGIN_SPECIAL_OP'
  | 'CREATE_GOV_BODY' | 'DISSOLVE_GOV_BODY'
  | 'ADD_LAW'      | 'REMOVE_LAW'      | 'AMEND_LAW'
  | 'ADD_SUBREGION' | 'REMOVE_SUBREGION' | 'SPLIT_SUBREGION' | 'MERGE_SUBREGION';

export interface AIAction {
  type: AIActionType;
  params: any;
}

// ---------------- 선거 ----------------
export type ElectionType = 'PRESIDENTIAL' | 'GENERAL' | 'LOCAL' | 'BY' | 'REFERENDUM';

export interface Election {
  id: string;
  date: string;
  type: ElectionType;
  name: string;
  desc: string;
  occurred?: boolean;
  result?: string;
}

// ---------------- 문화 지표 ----------------
export interface CulturalState {
  hallyu: {
    overallIndex: number;
    musicExportUSD: number;
    contentExportUSD: number;
    foreignKoreanLearners: number;
    overseasKoreanCenters: number;
    netflixKoreanShare: number;
  };
  unesco: {
    worldHeritageCount: number;
    intangibleHeritageCount: number;
    memoryOfWorldCount: number;
    recentRegistrations: string[];
  };
  domesticContent: {
    movieAnnualAudience: number;
    boxOfficeBillionKRW: number;
    netflixSubscribers: number;
    tvingSubscribers: number;
    wavveSubscribers: number;
    koreanMovieShare: number;
  };
  music: {
    domesticAnnualSalesBillionKRW: number;
    topGroups: { name: string; agency: string; debut: string }[];
    melonMauMillion: number;
  };
  publishing: {
    annualReadingRate: number;
    booksPublishedAnnually: number;
    librariesNationwide: number;
  };
  sports: {
    olympicGoldRecord: number;
    olympicSilverRecord: number;
    olympicBronzeRecord: number;
    kboAttendanceMillions: number;
    kleagueAttendanceMillions: number;
    fifaRanking: number;
    nationalSports: string;
  };
  games: {
    industryRevenueBillionUSD: number;
    globalEsportsRanking: number;
    topPublishers: string[];
    webtoonRevenueBillionKRW: number;
  };
  religion: {
    none: number;
    protestant: number;
    catholic: number;
    buddhist: number;
    other: number;
  };
  language: {
    standardName: string;
    activeDialects: number;
    hangulDay: string;
  };
  museums: number;
  libraries: number;
  performanceVenues: number;
  culturalBudgetKRW: number;
  notableArtists: string[];
  notableDirectors: string[];
}

// ---------------- 임기 평가 ----------------
export interface TermEvaluation {
  president: { name: string; party: string; ideology: number };
  termNumber: number;
  startDate: string;
  endDate: string;
  metrics: {
    finalApproval: number;
    avgApproval: number;
    peakApproval: number;
    troughApproval: number;
    gdpGrowthAvg: number;
    kospiChange: number;
    fxKrwChange: number;
    treasuryChange: number;
    birthRateChange: number;
    suicideRateChange: number;
    nkTensionAvg: number;
    usAllianceChange: number;
    billsPassed: number;
    billsVetoed: number;
    impeachmentMotions: number;
    judiciaryTrustChange: number;
    snsSentimentAvg: number;
  };
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  totalScore: number;
  highlights: string[];
  failures: string[];
  finalNote: string;
}
