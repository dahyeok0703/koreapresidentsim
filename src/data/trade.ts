// 주요국과의 무역 구성 (2024 실데이터 기반, 백만$).
// Country.tradeVolumeUSD (억$/연) 와 별도로 품목별 세부 데이터.

export interface TradeItem {
  category: string;     // 품목 카테고리
  valueUSD: number;     // 백만$ (연간)
  share?: number;       // 그 나라 대상 한국 수출/수입 중 점유율 %
}

export interface TradeProfile {
  countryId: string;
  totalExportUSD: number;     // 한국→그 나라 (백만$/연)
  totalImportUSD: number;     // 한국←그 나라 (백만$/연)
  exportItems: TradeItem[];
  importItems: TradeItem[];
  notes?: string;
  riskLevel: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';   // 의존도 리스크
}

// (단위: 백만 USD / 연)
export const TRADE_PROFILES: TradeProfile[] = [
  {
    countryId: 'US', totalExportUSD: 127800, totalImportUSD: 60100, riskLevel: 'CRITICAL',
    notes: '한국 최대 흑자국. 트럼프 2기 관세 협상 변수.',
    exportItems: [
      { category: '자동차·자동차부품', valueUSD: 41700, share: 33 },
      { category: '반도체',           valueUSD: 11200, share: 9 },
      { category: '기계·전기제품',    valueUSD: 14800, share: 12 },
      { category: '석유제품',         valueUSD: 8500,  share: 7 },
      { category: '이차전지',         valueUSD: 6700,  share: 5 },
      { category: '디스플레이',       valueUSD: 4200,  share: 3 },
      { category: '철강',             valueUSD: 3900,  share: 3 },
    ],
    importItems: [
      { category: '반도체 장비·소재',     valueUSD: 12500, share: 21 },
      { category: '원유·LNG',             valueUSD: 9200,  share: 15 },
      { category: '항공기·부품',           valueUSD: 7100,  share: 12 },
      { category: '의약품·바이오',         valueUSD: 4300,  share: 7 },
      { category: '농축산물 (육류·곡물)', valueUSD: 5900,  share: 10 },
      { category: '자동차·자동차부품',     valueUSD: 4800,  share: 8 },
    ],
  },
  {
    countryId: 'CN', totalExportUSD: 133000, totalImportUSD: 135000, riskLevel: 'CRITICAL',
    notes: '최대 교역국이지만 무역수지 적자 전환. 공급망 의존도 매우 높음.',
    exportItems: [
      { category: '반도체 (메모리·시스템)', valueUSD: 41000, share: 31 },
      { category: '디스플레이·OLED',       valueUSD: 12700, share: 10 },
      { category: '석유화학',               valueUSD: 14800, share: 11 },
      { category: '합성수지·플라스틱',      valueUSD: 6500,  share: 5 },
      { category: '기계·정밀기계',           valueUSD: 9300,  share: 7 },
      { category: '철강',                   valueUSD: 4900,  share: 4 },
    ],
    importItems: [
      { category: '반도체 (저가 메모리·IC)', valueUSD: 19500, share: 14 },
      { category: '컴퓨터·통신기기',          valueUSD: 14200, share: 11 },
      { category: '희토류·갈륨·게르마늄',    valueUSD: 3800,  share: 3 },
      { category: '요소·요소수 원료',         valueUSD: 1200,  share: 1 },
      { category: '의류·섬유',                valueUSD: 8400,  share: 6 },
      { category: '농수산물',                  valueUSD: 6800,  share: 5 },
      { category: '이차전지 소재 (양극재 등)', valueUSD: 11700, share: 9 },
    ],
  },
  {
    countryId: 'JP', totalExportUSD: 29400, totalImportUSD: 48300, riskLevel: 'HIGH',
    notes: '구조적 적자국. 핵심 소재·부품·장비 의존도 높음.',
    exportItems: [
      { category: '석유제품',         valueUSD: 6700,  share: 23 },
      { category: '반도체',           valueUSD: 4300,  share: 15 },
      { category: '철강',             valueUSD: 3200,  share: 11 },
      { category: '석유화학',         valueUSD: 3100,  share: 11 },
      { category: '기계',             valueUSD: 2800,  share: 10 },
    ],
    importItems: [
      { category: '반도체 장비·소재 (포토레지스트·불화수소)', valueUSD: 12200, share: 25 },
      { category: '정밀화학·소재',         valueUSD: 5800,  share: 12 },
      { category: '기계·로봇',             valueUSD: 6400,  share: 13 },
      { category: '자동차부품',            valueUSD: 4900,  share: 10 },
      { category: '철강·압연·합금',        valueUSD: 3800,  share: 8 },
    ],
  },
  {
    countryId: 'VN', totalExportUSD: 53400, totalImportUSD: 33100, riskLevel: 'MED',
    notes: '한국 4위 교역국. 삼성·LG 생산기지. 흑자.',
    exportItems: [
      { category: '반도체',          valueUSD: 11200, share: 21 },
      { category: '디스플레이·부품', valueUSD: 9800,  share: 18 },
      { category: '기계·자동화 장비', valueUSD: 6700,  share: 13 },
      { category: '석유화학',        valueUSD: 5400,  share: 10 },
      { category: '철강',            valueUSD: 2900,  share: 5 },
    ],
    importItems: [
      { category: '의류·신발',       valueUSD: 7800,  share: 24 },
      { category: '컴퓨터·통신기기', valueUSD: 5200,  share: 16 },
      { category: '수산물·농산물',   valueUSD: 1800,  share: 5 },
      { category: '목재·가구',       valueUSD: 1200,  share: 4 },
    ],
  },
  {
    countryId: 'TW', totalExportUSD: 30100, totalImportUSD: 23800, riskLevel: 'MED',
    notes: '반도체 산업 경쟁국 + 협력국. TSMC와 삼성 경쟁.',
    exportItems: [
      { category: '반도체 (메모리)', valueUSD: 17800, share: 59 },
      { category: '석유화학',        valueUSD: 3400,  share: 11 },
      { category: '기계',            valueUSD: 2100,  share: 7 },
    ],
    importItems: [
      { category: '반도체 (시스템·파운드리)', valueUSD: 16500, share: 69 },
      { category: '전자부품·PCB',              valueUSD: 2900,  share: 12 },
    ],
  },
  {
    countryId: 'IN', totalExportUSD: 17900, totalImportUSD: 7800, riskLevel: 'LOW',
    notes: '신흥 거점. 현대차·삼성·LG 진출 확대.',
    exportItems: [
      { category: '석유제품',         valueUSD: 4100,  share: 23 },
      { category: '반도체',           valueUSD: 2300,  share: 13 },
      { category: '철강',             valueUSD: 2100,  share: 12 },
      { category: '자동차부품',       valueUSD: 1900,  share: 11 },
      { category: '기계',             valueUSD: 1700,  share: 9 },
    ],
    importItems: [
      { category: '농수산물·향신료', valueUSD: 1800,  share: 23 },
      { category: '석유화학',         valueUSD: 1500,  share: 19 },
      { category: '의류·섬유',        valueUSD: 900,   share: 12 },
    ],
  },
  {
    countryId: 'AU', totalExportUSD: 9700, totalImportUSD: 31200, riskLevel: 'HIGH',
    notes: '광물·에너지 핵심 공급원. 흑자 적자 큼.',
    exportItems: [
      { category: '자동차',           valueUSD: 2900,  share: 30 },
      { category: '석유제품',         valueUSD: 1500,  share: 15 },
      { category: '철강·금속',        valueUSD: 1100,  share: 11 },
      { category: '기계',             valueUSD: 900,   share: 9 },
    ],
    importItems: [
      { category: '철광석',           valueUSD: 8200,  share: 26 },
      { category: '석탄 (유연탄·역청탄)', valueUSD: 6700, share: 21 },
      { category: 'LNG·천연가스',     valueUSD: 7100,  share: 23 },
      { category: '쇠고기·곡물',      valueUSD: 2300,  share: 7 },
      { category: '리튬·니켈',        valueUSD: 1800,  share: 6 },
    ],
  },
  {
    countryId: 'SA', totalExportUSD: 4900, totalImportUSD: 33500, riskLevel: 'CRITICAL',
    notes: '최대 원유 공급국. 네옴시티·원전 수출 협력 진행.',
    exportItems: [
      { category: '자동차',           valueUSD: 1700,  share: 35 },
      { category: '기계·플랜트',      valueUSD: 1200,  share: 24 },
      { category: '철강',             valueUSD: 600,   share: 12 },
    ],
    importItems: [
      { category: '원유',             valueUSD: 26800, share: 80 },
      { category: '석유화학 원료',     valueUSD: 4200,  share: 13 },
      { category: '천연가스',         valueUSD: 1500,  share: 4 },
    ],
  },
  {
    countryId: 'AE', totalExportUSD: 4200, totalImportUSD: 17800, riskLevel: 'HIGH',
    notes: '원전 수출 1호국. CEPA 발효.',
    exportItems: [
      { category: '자동차',           valueUSD: 1500,  share: 36 },
      { category: '기계·원전 장비',   valueUSD: 1100,  share: 26 },
      { category: '철강',             valueUSD: 400,   share: 10 },
    ],
    importItems: [
      { category: '원유',             valueUSD: 14200, share: 80 },
      { category: '천연가스·LPG',      valueUSD: 2800,  share: 16 },
    ],
  },
  {
    countryId: 'DE', totalExportUSD: 10200, totalImportUSD: 22800, riskLevel: 'MED',
    notes: '유럽 최대 적자국. 자동차·정밀기계 수입.',
    exportItems: [
      { category: '반도체',           valueUSD: 2400,  share: 24 },
      { category: '자동차부품',       valueUSD: 1900,  share: 19 },
      { category: '이차전지',         valueUSD: 1500,  share: 15 },
      { category: '기계',             valueUSD: 1200,  share: 12 },
    ],
    importItems: [
      { category: '자동차 (벤츠·BMW·아우디·폭스바겐)', valueUSD: 9800, share: 43 },
      { category: '정밀기계·공작기계',                  valueUSD: 4200, share: 18 },
      { category: '의약품·바이오',                       valueUSD: 2900, share: 13 },
      { category: '화학·소재',                            valueUSD: 2100, share: 9 },
    ],
  },
  {
    countryId: 'UK', totalExportUSD: 7500, totalImportUSD: 5800, riskLevel: 'LOW',
    notes: 'FTA 체결국. 자동차·반도체 중심.',
    exportItems: [
      { category: '자동차',         valueUSD: 2300,  share: 31 },
      { category: '반도체',         valueUSD: 1100,  share: 15 },
      { category: '석유제품',       valueUSD: 900,   share: 12 },
    ],
    importItems: [
      { category: '원유·석유제품',   valueUSD: 1800,  share: 31 },
      { category: '의약품',          valueUSD: 1100,  share: 19 },
      { category: '자동차 (재규어·롤스로이스)', valueUSD: 900, share: 16 },
    ],
  },
  {
    countryId: 'FR', totalExportUSD: 5000, totalImportUSD: 8000, riskLevel: 'LOW',
    exportItems: [
      { category: '자동차',         valueUSD: 1100,  share: 22 },
      { category: '반도체',         valueUSD: 800,   share: 16 },
      { category: '석유제품',       valueUSD: 600,   share: 12 },
    ],
    importItems: [
      { category: '의약품·화장품',  valueUSD: 2400,  share: 30 },
      { category: '항공기·부품',     valueUSD: 1800,  share: 22 },
      { category: '와인·식품',       valueUSD: 700,   share: 9 },
    ],
  },
  {
    countryId: 'IT', totalExportUSD: 5400, totalImportUSD: 4600, riskLevel: 'LOW',
    exportItems: [
      { category: '자동차',         valueUSD: 1300,  share: 24 },
      { category: '석유제품',       valueUSD: 900,   share: 17 },
      { category: '반도체',         valueUSD: 700,   share: 13 },
    ],
    importItems: [
      { category: '의류·명품·패션', valueUSD: 1500,  share: 33 },
      { category: '기계',           valueUSD: 1100,  share: 24 },
    ],
  },
  {
    countryId: 'RU', totalExportUSD: 4100, totalImportUSD: 9200, riskLevel: 'HIGH',
    notes: '제재 대상국. 교역 급감. 비우호국 지정.',
    exportItems: [
      { category: '자동차부품',     valueUSD: 1100,  share: 27 },
      { category: '석유제품',       valueUSD: 600,   share: 15 },
    ],
    importItems: [
      { category: '원유',           valueUSD: 4800,  share: 52 },
      { category: '천연가스',       valueUSD: 1900,  share: 21 },
      { category: '석탄·광물',      valueUSD: 1500,  share: 16 },
    ],
  },
  {
    countryId: 'NK', totalExportUSD: 0, totalImportUSD: 0, riskLevel: 'CRITICAL',
    notes: '5·24 조치 이후 사실상 교역 중단. 인도적 지원만.',
    exportItems: [], importItems: [],
  },
  {
    countryId: 'BR', totalExportUSD: 5500, totalImportUSD: 5200, riskLevel: 'LOW',
    exportItems: [
      { category: '자동차부품',     valueUSD: 1400,  share: 25 },
      { category: '기계',           valueUSD: 1100,  share: 20 },
      { category: '석유화학',       valueUSD: 800,   share: 15 },
    ],
    importItems: [
      { category: '철광석',         valueUSD: 1800,  share: 35 },
      { category: '대두·곡물',      valueUSD: 1100,  share: 21 },
      { category: '쇠고기',         valueUSD: 700,   share: 13 },
    ],
  },
  {
    countryId: 'MX', totalExportUSD: 11200, totalImportUSD: 6300, riskLevel: 'MED',
    notes: 'USMCA 우회 거점. 자동차·전자 생산기지.',
    exportItems: [
      { category: '자동차부품',     valueUSD: 3600,  share: 32 },
      { category: '반도체',         valueUSD: 2200,  share: 20 },
      { category: '디스플레이',     valueUSD: 1800,  share: 16 },
    ],
    importItems: [
      { category: '원유',           valueUSD: 2400,  share: 38 },
      { category: '자동차 (현지생산 역수입)', valueUSD: 1500, share: 24 },
    ],
  },
  {
    countryId: 'CA', totalExportUSD: 8000, totalImportUSD: 4000, riskLevel: 'LOW',
    exportItems: [
      { category: '자동차',         valueUSD: 3700,  share: 46 },
      { category: '반도체',         valueUSD: 800,   share: 10 },
    ],
    importItems: [
      { category: '곡물·농산물',    valueUSD: 1100,  share: 28 },
      { category: '석탄·광물',      valueUSD: 900,   share: 23 },
    ],
  },
  {
    countryId: 'TH', totalExportUSD: 9700, totalImportUSD: 6800, riskLevel: 'LOW',
    exportItems: [
      { category: '철강',           valueUSD: 1600,  share: 16 },
      { category: '석유화학',       valueUSD: 1400,  share: 14 },
      { category: '자동차부품',     valueUSD: 1200,  share: 12 },
    ],
    importItems: [
      { category: '천연가스',       valueUSD: 1500,  share: 22 },
      { category: '쌀·농산물',      valueUSD: 900,   share: 13 },
    ],
  },
  {
    countryId: 'MY', totalExportUSD: 11200, totalImportUSD: 11700, riskLevel: 'LOW',
    exportItems: [
      { category: '반도체',         valueUSD: 3800,  share: 34 },
      { category: '석유제품',       valueUSD: 1800,  share: 16 },
    ],
    importItems: [
      { category: 'LNG',            valueUSD: 4300,  share: 37 },
      { category: '반도체',         valueUSD: 2900,  share: 25 },
    ],
  },
  {
    countryId: 'ID', totalExportUSD: 10200, totalImportUSD: 14100, riskLevel: 'MED',
    notes: '한-인도네시아 CEPA. 니켈·석탄 자원국.',
    exportItems: [
      { category: '석유제품·석유화학', valueUSD: 2900, share: 28 },
      { category: '철강·기계',        valueUSD: 1800,  share: 18 },
      { category: '자동차 (현대차 진출)', valueUSD: 1500, share: 15 },
    ],
    importItems: [
      { category: '석탄·니켈',      valueUSD: 5800,  share: 41 },
      { category: 'LNG',            valueUSD: 2200,  share: 16 },
      { category: '팜유',           valueUSD: 1100,  share: 8 },
    ],
  },
  {
    countryId: 'PH', totalExportUSD: 11800, totalImportUSD: 5500, riskLevel: 'LOW',
    exportItems: [
      { category: '반도체',         valueUSD: 4200,  share: 36 },
      { category: '석유제품',       valueUSD: 1800,  share: 15 },
    ],
    importItems: [
      { category: '바나나·농산물',   valueUSD: 1100,  share: 20 },
      { category: '반도체',         valueUSD: 1400,  share: 25 },
    ],
  },
  {
    countryId: 'SG', totalExportUSD: 18900, totalImportUSD: 7400, riskLevel: 'LOW',
    notes: '환적 허브. 실수요는 다른 지역 포함.',
    exportItems: [
      { category: '반도체',         valueUSD: 5800,  share: 31 },
      { category: '석유제품',       valueUSD: 3700,  share: 20 },
    ],
    importItems: [
      { category: '반도체 장비',    valueUSD: 2100,  share: 28 },
      { category: '석유화학',       valueUSD: 1500,  share: 20 },
    ],
  },
  {
    countryId: 'TR', totalExportUSD: 7000, totalImportUSD: 1900, riskLevel: 'LOW',
    exportItems: [
      { category: '자동차·부품',    valueUSD: 1900,  share: 27 },
      { category: '석유화학',       valueUSD: 1500,  share: 21 },
    ],
    importItems: [
      { category: '농수산물·견과류', valueUSD: 600,   share: 32 },
    ],
  },
  {
    countryId: 'IL', totalExportUSD: 1600, totalImportUSD: 1200, riskLevel: 'LOW',
    exportItems: [{ category: '자동차',       valueUSD: 600,   share: 38 }],
    importItems: [{ category: '반도체 장비·기술', valueUSD: 500, share: 42 }],
  },
  {
    countryId: 'PL', totalExportUSD: 7900, totalImportUSD: 1600, riskLevel: 'LOW',
    notes: 'K방산 최대 수출국. K2·K9·천무·FA-50.',
    exportItems: [
      { category: '이차전지·배터리', valueUSD: 3200, share: 41 },
      { category: '방산 (K2·K9·천무·FA-50)', valueUSD: 2100, share: 27 },
      { category: '자동차부품',      valueUSD: 800,   share: 10 },
    ],
    importItems: [{ category: '농산물',       valueUSD: 400,   share: 25 }],
  },
];

// Country.id로 빠른 조회
export const TRADE_BY_COUNTRY: Record<string, TradeProfile> = Object.fromEntries(
  TRADE_PROFILES.map(p => [p.countryId, p])
);
