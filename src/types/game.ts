// =============================================================
// 대한민국 대통령 시뮬레이터 - 데이터 모델
// =============================================================

export type ID = string;

// ---------------- 정당 / 인물 ----------------
export type PartyId =
  | 'DPK'        // 더불어민주당
  | 'PPP'        // 국민의힘
  | 'RKP'        // 조국혁신당
  | 'PRP'        // 개혁신당
  | 'JP'         // 진보당
  | 'NEW_FUTURE' // 새로운미래
  | 'BPK'        // 기본소득당
  | 'IND';       // 무소속

export interface Party {
  id: PartyId;
  name: string;
  shortName: string;
  color: string;       // hex
  ideology: number;    // -100(극좌) ~ +100(극우)
  seats: number;       // 22대 국회 기준
  supportRate: number; // %
  description: string;
}

// ---------------- 대통령 / 캐릭터 ----------------
export interface PresidentProfile {
  name: string;
  party: PartyId;
  age: number;
  background: string;        // 짧은 약력
  ideology: number;          // -100 ~ +100
  traits: string[];          // 성향 태그
  inauguratedAt: string;     // ISO date (default 2025-06-04)
  termEndsAt: string;        // 2030-06-03
}

// ---------------- 시간 / 게임 진행 ----------------
export interface GameClock {
  currentDate: string;        // ISO date
  daysInOffice: number;
  turnNumber: number;         // 1턴 = 1주
  speed: 'paused' | 'slow' | 'normal' | 'fast';
}

// ---------------- 지지율 (다층) ----------------
export interface ApprovalBreakdown {
  overall: number;            // %
  byAgeGroup: {
    '18-29': number;
    '30-39': number;
    '40-49': number;
    '50-59': number;
    '60+': number;
  };
  byRegion: Record<RegionId, number>;
  byGender: { male: number; female: number };
  byIdeology: { progressive: number; moderate: number; conservative: number };
  byPartyBase: Record<PartyId, number>;
  history: { date: string; value: number }[]; // 추세
}

// ---------------- 지역 ----------------
export type RegionId =
  | 'SEOUL' | 'BUSAN' | 'DAEGU' | 'INCHEON' | 'GWANGJU' | 'DAEJEON' | 'ULSAN' | 'SEJONG'
  | 'GYEONGGI' | 'GANGWON' | 'CHUNGBUK' | 'CHUNGNAM' | 'JEONBUK' | 'JEONNAM'
  | 'GYEONGBUK' | 'GYEONGNAM' | 'JEJU';

export interface Region {
  id: RegionId;
  name: string;
  population: number;     // 만 명
  leaning: number;        // -100(보수) ~ +100(진보), 전통적 성향
  economicHealth: number; // 0-100
  unemployment: number;   // %
}

// ---------------- 경제 지표 ----------------
export interface EconomicState {
  gdpGrowth: number;        // 전년대비 %
  gdpNominal: number;       // 조 원
  inflation: number;        // CPI %
  unemployment: number;     // %
  youthUnemployment: number;// % (15-29)
  baseRate: number;         // 한은 기준금리 %
  fxUsdKrw: number;         // 원/달러
  kospi: number;            // 지수
  kosdaq: number;
  exportYoY: number;        // 수출 전년대비 %
  importYoY: number;
  tradeBalance: number;     // 억 달러
  fiscalBalance: number;    // GDP 대비 %
  nationalDebt: number;     // GDP 대비 %
  householdDebt: number;    // GDP 대비 %
  housePriceIndex: number;  // 100 기준
  housePriceYoY: number;    // %
  jeonseIndex: number;
  consumerConfidence: number; // 0-200
  businessConfidence: number; // 0-200
  history: { date: string; gdp: number; cpi: number; unemp: number; kospi: number }[];
}

// ---------------- 사회 지표 ----------------
export interface SocialState {
  birthRate: number;          // 합계출산율
  marriageRate: number;       // 인구 1천명당
  divorceRate: number;
  suicideRate: number;        // 10만명당
  crimeIndex: number;         // 100 기준
  trafficDeaths: number;      // 연간 누적 (게임용)
  healthcareSatisfaction: number; // 0-100
  educationSatisfaction: number;
  pensionTrust: number;
  genderConflictIndex: number;    // 0-100
  generationConflictIndex: number;
  immigrationSentiment: number;   // -100 ~ 100
  airQualityPM25: number;         // 평균 ㎍/㎥
  pressFreedomIndex: number;      // RSF 점수 (낮을수록 좋음, 0-100)
}

// ---------------- 안보 / 군사 ----------------
export interface SecurityState {
  northKoreaTension: number;     // 0-100 (높을수록 긴장)
  northKoreaProvocationRisk: number; // 0-100
  rokMilitaryReadiness: number;  // 0-100
  usAllianceStrength: number;    // 0-100
  defconLevel: 1 | 2 | 3 | 4 | 5; // 5=평시, 1=전쟁임박
  cyberThreatLevel: number;      // 0-100
  terrorThreatLevel: number;     // 0-100
  defenseBudgetPctGdp: number;   // %
}

// ---------------- 외교 ----------------
export type CountryId =
  | 'US' | 'CN' | 'JP' | 'NK' | 'RU' | 'EU' | 'UK' | 'IN' | 'VN' | 'AU' | 'TW' | 'UN';

export interface ForeignRelation {
  id: CountryId;
  name: string;
  relation: number;          // -100(적대) ~ +100(동맹)
  trustLevel: number;        // 0-100
  tradeVolume: number;       // 억 달러 / 연
  recentEvents: string[];    // 최근 외교 이벤트 (5개 유지)
  leader: string;
}

// ---------------- 국회 ----------------
export interface AssemblyState {
  totalSeats: number;             // 300
  bySeat: Record<PartyId, number>;
  speaker: { name: string; party: PartyId };
  rulingCoalitionSeats: number;
  oppositionSeats: number;
  pendingBills: Bill[];
  passedBills: Bill[];
  vetoedBills: Bill[];
}

export interface Bill {
  id: ID;
  title: string;
  summary: string;
  proposer: 'PRESIDENT' | 'RULING' | 'OPPOSITION';
  category: string;
  ideologyShift: number;       // -100 ~ +100, 법안의 정치적 방향
  expectedEffects: PartialEffects;
  status: 'PENDING' | 'PASSED' | 'VETOED' | 'REJECTED';
  introducedAt: string;
}

// ---------------- 내각 / 인사 ----------------
export type MinistryId =
  | 'PM'           // 국무총리
  | 'MOEF'         // 기획재정부
  | 'MOFA'         // 외교부
  | 'MOU'          // 통일부
  | 'MND'          // 국방부
  | 'MOIS'         // 행정안전부
  | 'MOJ'          // 법무부
  | 'MOE'          // 교육부
  | 'MSIT'         // 과학기술정보통신부
  | 'MCST'         // 문화체육관광부
  | 'MOTIE'        // 산업통상자원부
  | 'MOHW'         // 보건복지부
  | 'MOEL'         // 고용노동부
  | 'MOLIT'        // 국토교통부
  | 'MAFRA'        // 농림축산식품부
  | 'MOF'          // 해양수산부
  | 'ME'           // 환경부
  | 'MOGEF'        // 여성가족부
  | 'MPVA'         // 국가보훈부
  | 'NIS'          // 국가정보원
  | 'BAI'          // 감사원
  | 'PPS'          // 검찰총장
  | 'BOK';         // 한국은행 총재

export interface Official {
  id: ID;
  name: string;
  ministry: MinistryId;
  ministryName: string;
  party: PartyId;
  loyalty: number;       // 0-100
  competence: number;    // 0-100
  publicFavor: number;   // 0-100
  scandalRisk: number;   // 0-100
  appointedAt: string;
  bio: string;
}

// ---------------- 미디어 / 언론 ----------------
export type MediaId = 'KBS' | 'MBC' | 'SBS' | 'JTBC' | 'YTN' | 'CHOSUN' | 'JOONGANG' | 'DONGA' | 'HANI' | 'KYUNGHYANG' | 'OHMY';

export interface MediaOutlet {
  id: MediaId;
  name: string;
  type: '지상파' | '종편' | '신문' | '인터넷';
  bias: number;          // -100(진보) ~ +100(보수)
  influence: number;     // 0-100
  favorToPresident: number; // -100 ~ +100
}

// ---------------- 이벤트 / 뉴스 ----------------
export type EventCategory =
  | 'ECONOMY' | 'DIPLOMACY' | 'SECURITY' | 'SOCIAL' | 'DISASTER'
  | 'SCANDAL' | 'POLITICS' | 'CULTURE' | 'TECH' | 'HEALTH' | 'NK';

export type EventSeverity = 'INFO' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

export interface GameEvent {
  id: ID;
  date: string;
  category: EventCategory;
  severity: EventSeverity;
  headline: string;
  body: string;
  source: string;         // "AI 생성" or 언론사
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
  ideology: number; // -100 ~ +100
}

// ---------------- 효과 시스템 ----------------
export interface PartialEffects {
  approval?: number;                  // 전체 지지율 ±
  approvalByAge?: Partial<ApprovalBreakdown['byAgeGroup']>;
  approvalByRegion?: Partial<Record<RegionId, number>>;
  approvalByIdeology?: Partial<ApprovalBreakdown['byIdeology']>;
  economy?: Partial<Pick<EconomicState,
    'gdpGrowth' | 'inflation' | 'unemployment' | 'youthUnemployment' |
    'kospi' | 'fxUsdKrw' | 'consumerConfidence' | 'businessConfidence' |
    'housePriceYoY' | 'fiscalBalance'>>;
  social?: Partial<SocialState>;
  security?: Partial<SecurityState>;
  foreign?: Partial<Record<CountryId, { relation?: number; trust?: number }>>;
  notes?: string;
}

// ---------------- 채팅 ----------------
export type ChatRole = 'system' | 'user' | 'assistant' | 'advisor' | 'press' | 'foreign';

export interface ChatMessage {
  id: ID;
  role: ChatRole;
  speaker?: string;       // "비서실장 OOO" 등
  content: string;
  timestamp: string;      // game date
  realTimestamp: string;  // real time
  contextType?: 'BRIEFING' | 'CABINET' | 'PRESS' | 'CALL' | 'DECISION' | 'GENERAL';
  attachedEffects?: PartialEffects;
}

// ---------------- 정책 / 행정명령 ----------------
export interface Policy {
  id: ID;
  title: string;
  category: EventCategory;
  description: string;
  enactedAt: string;
  cost: number;              // 조 원
  ongoingEffects: PartialEffects;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
}

// ---------------- 설정 ----------------
export interface Settings {
  openaiApiKey: string;
  model: string;             // e.g. 'gpt-4o-mini', 'gpt-4o'
  difficulty: 'EASY' | 'NORMAL' | 'HARD' | 'NIGHTMARE';
  realismLevel: 'ARCADE' | 'BALANCED' | 'REALISTIC';
  autoEvents: boolean;       // 턴 진행 시 AI 이벤트 자동 생성
  eventsPerTurn: number;     // 1-5
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
  assembly: AssemblyState;
  cabinet: Official[];
  media: MediaOutlet[];
  events: GameEvent[];           // 최근 100개
  newsTicker: string[];           // 최근 헤드라인 30개
  chat: ChatMessage[];            // 최근 200개
  policies: Policy[];
  parties: Party[];
  settings: Settings;
  flags: Record<string, boolean | number | string>;
}
