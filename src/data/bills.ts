// 국회 자동 법안 풀 + 자율 행정 액션 풀

import type { PartyId, EventCategory, PartialEffects } from '../types/game';

export interface BillTemplate {
  title: string;
  summary: string;
  proposer: 'RULING' | 'OPPOSITION';      // 발의 측
  category: string;
  ideologyShift: number;                  // -100~+100 (음수 진보)
  expectedEffects: PartialEffects;
  partyHint?: PartyId;                    // 발의 정당 힌트
}

// ── 진보 발의 ──
export const PROGRESSIVE_BILLS: BillTemplate[] = [
  { title: '검찰개혁법 (수사·기소 분리) 개정안', summary: '검찰의 직접 수사권을 폐지하고 공수처 권한을 확대', proposer: 'RULING', category: 'LEGAL', ideologyShift: -65, partyHint: 'DPK',
    expectedEffects: { judiciary: { prosecutionTrust: -5, prosecutionIndep: -8 }, approvalByIdeology: { progressive: 4, conservative: -5 }, approval: -1 } },
  { title: '주 4.5일제 단계적 도입 근로기준법 개정안', summary: '주 35시간 표준 + 시범사업 5천 사업장', proposer: 'RULING', category: 'SOCIAL', ideologyShift: -45,
    expectedEffects: { social: { governmentTrust: 2 }, approvalByAge: { '30-39': 3, '40-49': 4 }, economy: { businessConfidence: -3 }, approval: 2 } },
  { title: '최저임금 두 자릿수 인상 권고안', summary: '내년 최저임금 11% 인상 권고', proposer: 'RULING', category: 'SOCIAL', ideologyShift: -55,
    expectedEffects: { approvalByIncome: { low: 5, middleLow: 3, high: -3 }, economy: { inflation: 0.15, unemployment: 0.1 }, approval: 1 } },
  { title: '전국민 25만원 민생회복지원금 추경안', summary: '15조원 규모 추가경정예산', proposer: 'RULING', category: 'ECONOMY', ideologyShift: -40,
    expectedEffects: { economy: { treasuryBalanceKRW: -15, consumerConfidence: 4, fiscalBalance: -0.3 }, approval: 3, approvalByIncome: { low: 6, middleLow: 4 } } },
  { title: '국민연금 보험료율 인상·소득대체율 동시 인상안', summary: '보험료 9→13%, 소득대체율 40→44%', proposer: 'RULING', category: 'SOCIAL', ideologyShift: -30,
    expectedEffects: { social: { pensionTrust: 6 }, approvalByAge: { '60-69': 5, '70+': 8, '30-39': -4, '18-29': -3 }, approval: -1 } },
  { title: '부동산 다주택자 양도세 중과 강화안', summary: '3주택 이상 양도세 최고 75%', proposer: 'RULING', category: 'ECONOMY', ideologyShift: -50,
    expectedEffects: { economy: { housePriceYoY: -1.5 }, approvalByIncome: { low: 3, high: -6 }, approvalByRegion: { SEOUL: -2, GWANGJU: 2 }, approval: -0.5 } },
  { title: '재생에너지 비중 2030년 40% 상향 에너지전환법', summary: '석탄발전 단계적 폐쇄·태양광 확대', proposer: 'RULING', category: 'ENVIRONMENT' as any, ideologyShift: -40,
    expectedEffects: { social: { greenEnergyShare: 3, carbonEmission: -8 }, economy: { businessConfidence: -2 }, approvalByAge: { '18-29': 3, '70+': -3 } } },
  { title: '의료민영화 금지법', summary: '영리병원·원격의료 산업화 차단', proposer: 'RULING', category: 'HEALTH', ideologyShift: -35,
    expectedEffects: { social: { healthcareSatisfaction: 3 }, approvalByIdeology: { progressive: 4, conservative: -4 } } },
  { title: '5·18 진상규명 특별법 강화안', summary: '왜곡 처벌 강화·자료공개 확대', proposer: 'RULING', category: 'POLITICS', ideologyShift: -55,
    expectedEffects: { approvalByRegion: { GWANGJU: 6, JEONNAM: 4, JEONBUK: 4, DAEGU: -4, GYEONGBUK: -4 }, approval: 0 } },
  { title: '차별금지법(평등법) 제정안', summary: '성별·성정체성·종교 등 차별 금지', proposer: 'RULING', category: 'SOCIAL', ideologyShift: -60,
    expectedEffects: { approvalByIdeology: { progressive: 5, conservative: -7 }, social: { genderConflictIndex: 4 } } },
];

// ── 보수 발의 ──
export const CONSERVATIVE_BILLS: BillTemplate[] = [
  { title: '검찰청 직접 수사권 회복법', summary: '6대 범죄 직접 수사 복원', proposer: 'OPPOSITION', category: 'LEGAL', ideologyShift: 60, partyHint: 'PPP',
    expectedEffects: { judiciary: { prosecutionIndep: 4, prosecutionTrust: 3 }, approvalByIdeology: { conservative: 4, progressive: -5 } } },
  { title: '법인세율 인하 (24→22%)', summary: '대기업 투자 활성화', proposer: 'OPPOSITION', category: 'ECONOMY', ideologyShift: 55,
    expectedEffects: { economy: { businessConfidence: 4, kospi: 20, fiscalBalance: -0.4 }, approvalByIncome: { high: 5, low: -3 } } },
  { title: '중대재해처벌법 완화안', summary: '50인 이상 사업장 처벌요건 강화', proposer: 'OPPOSITION', category: 'SOCIAL', ideologyShift: 50,
    expectedEffects: { economy: { businessConfidence: 3 }, approvalByIncome: { high: 3, low: -4 } } },
  { title: '부동산 재건축·재개발 규제 완화안', summary: '안전진단 완화·용적률 상향', proposer: 'OPPOSITION', category: 'ECONOMY', ideologyShift: 40,
    expectedEffects: { economy: { housePriceYoY: 1.2, consumerConfidence: 2 }, approvalByRegion: { SEOUL: 3, GYEONGGI: 2 }, approvalByIncome: { high: 4 } } },
  { title: '신규 원전 2기 건설 확정 (천지·대진)', summary: '에너지 안정·수출 확대', proposer: 'OPPOSITION', category: 'ECONOMY', ideologyShift: 45,
    expectedEffects: { social: { greenEnergyShare: -1, energySelfSufficiency: 3 }, approvalByRegion: { GYEONGBUK: 2, ULSAN: 2 }, approvalByIdeology: { conservative: 3, progressive: -3 } } },
  { title: '국가보안법 강화안', summary: '간첩죄 형량 상향', proposer: 'OPPOSITION', category: 'SECURITY', ideologyShift: 55,
    expectedEffects: { social: { democracyIndex: -0.05 }, approvalByIdeology: { conservative: 4, progressive: -5 } } },
  { title: '교과서 자율발행제 회귀안', summary: '국정·검정 비중 재조정', proposer: 'OPPOSITION', category: 'POLITICS', ideologyShift: 40,
    expectedEffects: { social: { educationSatisfaction: -1 }, approvalByIdeology: { conservative: 2, progressive: -3 } } },
  { title: '병역 형평성 강화법 (사회복무·대체복무 축소)', summary: '병역 의무 강화', proposer: 'OPPOSITION', category: 'SECURITY', ideologyShift: 45,
    expectedEffects: { security: { rokMilitaryReadiness: 2 }, approvalByAge: { '70+': 3, '18-29': -3 } } },
  { title: '강성노조 단체협약 적용 제한법', summary: '노동조합법 일부 개정', proposer: 'OPPOSITION', category: 'SOCIAL', ideologyShift: 55,
    expectedEffects: { economy: { businessConfidence: 3 }, approvalByIdeology: { conservative: 3, progressive: -4 } } },
];

// ── 중립·실용 발의 ──
export const NEUTRAL_BILLS: BillTemplate[] = [
  { title: 'AI 기본법 시행령 정비안', summary: 'AI 위험등급·규제·진흥 균형', proposer: 'RULING', category: 'TECH', ideologyShift: 0,
    expectedEffects: { economy: { businessConfidence: 1 }, social: { governmentTrust: 1 } } },
  { title: '청년 1인가구 주거안정 지원법', summary: '월세 보증금·전세대출 한도 확대', proposer: 'RULING', category: 'SOCIAL', ideologyShift: -15,
    expectedEffects: { approvalByAge: { '18-29': 4, '30-39': 3 }, economy: { treasuryBalanceKRW: -2 } } },
  { title: '저출생 종합대책 패키지', summary: '출산·육아 지원 확대 + 결혼축하금', proposer: 'RULING', category: 'SOCIAL', ideologyShift: -10,
    expectedEffects: { social: { birthRate: 0.02 }, economy: { treasuryBalanceKRW: -3 }, approval: 2 } },
  { title: '한국형 신재생에너지+원자력 균형 패키지', summary: 'RE100·SMR 동시 추진', proposer: 'RULING', category: 'ECONOMY', ideologyShift: 5,
    expectedEffects: { social: { greenEnergyShare: 2 }, approval: 1 } },
  { title: '농산물 가격안정 기금 확충', summary: '쌀·채소값 변동 완충', proposer: 'RULING', category: 'ECONOMY', ideologyShift: -20,
    expectedEffects: { economy: { inflation: -0.1 }, approvalByRegion: { JEONNAM: 2, JEONBUK: 2, CHUNGNAM: 2 } } },
  { title: '디지털 성범죄 처벌강화 특별법', summary: 'N번방 후속 입법 강화', proposer: 'RULING', category: 'LEGAL', ideologyShift: -25,
    expectedEffects: { social: { genderConflictIndex: -3, judicialTrust: 2 }, approvalByAge: { '18-29': 2 } } },
  { title: '딥페이크·AI 영상 처벌 신설법', summary: '딥페이크 제작·유포 엄벌', proposer: 'RULING', category: 'TECH', ideologyShift: -5,
    expectedEffects: { social: { cyberCrimeCount: -5 }, approval: 1 } },
  { title: '자영업자 카드수수료 인하법', summary: '영세 가맹점 수수료 0% 확대', proposer: 'RULING', category: 'ECONOMY', ideologyShift: -10,
    expectedEffects: { economy: { consumerConfidence: 2 }, approvalByIncome: { middleLow: 2, low: 2 } } },
  { title: '지방 균형발전 특별교부세 확대', summary: '지방소멸 대응 재원 강화', proposer: 'OPPOSITION', category: 'SOCIAL', ideologyShift: 5,
    expectedEffects: { approvalByRegion: { JEONBUK: 2, GANGWON: 2, GYEONGBUK: 2 } } },
];

export const ALL_BILL_TEMPLATES = [...PROGRESSIVE_BILLS, ...CONSERVATIVE_BILLS, ...NEUTRAL_BILLS];

// =============================================================
// 자율 행정 액션 풀 (대통령 결재 없이 부처/지자체가 자체 처리)
// =============================================================
export interface AutonomousAction {
  category: EventCategory;
  ministryHint?: string;
  headline: string;
  detail: string;
  effects?: PartialEffects;
}

export const AUTONOMOUS_ACTIONS: AutonomousAction[] = [
  { category: 'SOCIAL', ministryHint: 'NPA', headline: '경찰청, 여름철 음주운전 특별단속 시행',
    detail: '6~8월 전국 일제 단속. 시군구 협력.', effects: { social: { violentCrimeRate: -0.3 } } },
  { category: 'SOCIAL', ministryHint: 'NFA', headline: '소방청, 폭염 대비 응급의료 핫라인 가동',
    detail: '권역응급의료센터 24시간 운영.', effects: { social: { publicSafetySatisfaction: 0.5 } } },
  { category: 'SOCIAL', ministryHint: 'KCG', headline: '해양경찰, 서해 중국어선 단속 22척 나포',
    detail: 'NLL 인근 어업 보호.', effects: { social: { governmentTrust: 0.3 } } },
  { category: 'ECONOMY', ministryHint: 'KCS', headline: '관세청, 명품 직구 허위신고 조사 착수',
    detail: '서울세관 중심 정밀 점검.', effects: { economy: { taxRevenue: 0.05 } } },
  { category: 'ECONOMY', ministryHint: 'NTS', headline: '국세청, 부동산 고가 거래 변칙증여 정밀조사',
    detail: '강남 4구 중심 표적 추징.', effects: { economy: { taxRevenue: 0.1 }, approvalByIncome: { high: -1, low: 1 } } },
  { category: 'TECH', ministryHint: 'KIPO', headline: '특허청, 반도체 핵심특허 보호 전담반 신설',
    detail: '국내 기업 해외 분쟁 지원.', effects: { economy: { businessConfidence: 0.4 } } },
  { category: 'HEALTH', ministryHint: 'MFDS', headline: '식약처, 여름 식중독 위험식품 일제 회수',
    detail: '편의점·휴게소 도시락 점검.', effects: { social: { healthcareSatisfaction: 0.3 } } },
  { category: 'ECONOMY', ministryHint: 'KFS', headline: '산림청, 산불 진화헬기 13기 추가 배치',
    detail: '강원·경북 산불 취약지역.', effects: { social: { publicSafetySatisfaction: 0.4 } } },
  { category: 'CULTURE', ministryHint: 'CHA', headline: '국가유산청, 경복궁 야간개장 확대',
    detail: '6~9월 매일 운영.', effects: { social: { educationSatisfaction: 0.2 } } },
  { category: 'TECH', ministryHint: 'KMA', headline: '기상청, 슈퍼컴 정밀 단기예보 시스템 가동',
    detail: '국지성 호우 1시간 단위 예측.', effects: { social: { governmentTrust: 0.4 } } },
  { category: 'SOCIAL', headline: '서울시, 청년 월세 지원 신청자 8만 명 돌파',
    detail: '서울 청년몽땅정보통 접수.', effects: { approvalByRegion: { SEOUL: 0.8 }, approvalByAge: { '18-29': 1, '30-39': 0.5 } } },
  { category: 'SOCIAL', headline: '경기도, 청년기본소득 1분기 지급 완료',
    detail: '도내 만 24세 17만 명 대상.', effects: { approvalByRegion: { GYEONGGI: 0.7 }, approvalByAge: { '18-29': 0.5 } } },
  { category: 'SOCIAL', headline: '전라남도, 저출생 첫만남이용권 추가 100만원',
    detail: '도내 신생아 가구.', effects: { approvalByRegion: { JEONNAM: 0.8 }, social: { birthRate: 0.005 } } },
  { category: 'ECONOMY', headline: '부산광역시, 북항재개발 1단계 마무리',
    detail: '오페라하우스·국제여객터미널.', effects: { approvalByRegion: { BUSAN: 1 }, social: { governmentTrust: 0.3 } } },
  { category: 'SOCIAL', headline: '대구시, 도심형 스마트팜 시범사업 착수',
    detail: '청년농업인 30명 입주.', effects: { approvalByRegion: { DAEGU: 0.5 } } },
  { category: 'INFRA', ministryHint: 'MOLIT', headline: '국토교통부, GTX-A 운정~서울역 구간 안정 운행',
    detail: '하루 8만 명 이용. 정시율 98%.', effects: { approvalByRegion: { GYEONGGI: 0.6 } } },
  { category: 'SOCIAL', ministryHint: 'MOHW', headline: '보건복지부, 응급실 뺑뺑이 신고 모니터링 강화',
    detail: '시도별 응급의료센터 가동률 공개.', effects: { social: { healthcareSatisfaction: 0.4 } } },
  { category: 'DIPLOMACY', ministryHint: 'MOFA', headline: '외교부, 재외국민 보호 전담영사 신설',
    detail: '동남아 6개국.', effects: { social: { governmentTrust: 0.2 } } },
  { category: 'CULTURE', ministryHint: 'MCST', headline: '문화체육관광부, K-콘텐츠 펀드 추가 출자',
    detail: '드라마·웹툰 제작사 50개사.', effects: { economy: { businessConfidence: 0.3 } } },
  { category: 'TECH', ministryHint: 'MSIT', headline: '과기정통부, 6G 시범망 대전·세종 구축',
    detail: '2030 상용화 로드맵.', effects: { economy: { businessConfidence: 0.5 } } },
  { category: 'SOCIAL', headline: '경상북도, 독도 입도 관리시스템 정비 완료',
    detail: '울릉도→독도 정기여객 운영.', effects: { approvalByRegion: { GYEONGBUK: 0.5 }, foreign: { JP: { relation: -1 } } } },
  { category: 'SOCIAL', headline: '강원특별자치도, DMZ 평화관광 코스 재개',
    detail: '철원·고성·양구.', effects: { approvalByRegion: { GANGWON: 0.6 } } },
  { category: 'CULTURE', headline: '제주특별자치도, 한라산 탐방 예약제 안정화',
    detail: '환경 보호.', effects: { approvalByRegion: { JEJU: 0.4 } } },
];
