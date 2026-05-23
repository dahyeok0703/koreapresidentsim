import type { CulturalState } from '../types/game';

// 2025-06-04 기준 한국 문화 지표 (대략값)
export const INITIAL_CULTURAL: CulturalState = {
  hallyu: {
    overallIndex: 78,                // 한류 종합지수 0-100 (KOFICE 기준 추정)
    musicExportUSD: 320,             // K-POP 음반·음원 수출 (백만$)
    contentExportUSD: 14000,         // 방송·영화·게임·웹툰 합 (백만$)
    foreignKoreanLearners: 200,      // 해외 한국어 학습자 (만명, 2024)
    overseasKoreanCenters: 256,      // 세종학당 248개 + 한국문화원 약 35개 (중복 제외 대략)
    netflixKoreanShare: 12,          // 글로벌 Netflix 한국 콘텐츠 시청 점유율 추정
  },
  unesco: {
    worldHeritageCount: 16,          // 2024년까지 등재 (석굴암·종묘·창덕궁·수원화성·경주역사유적 등)
    intangibleHeritageCount: 22,     // 종묘제례악·판소리·강릉단오제·아리랑·김장문화 등
    memoryOfWorldCount: 18,          // 훈민정음·조선왕조실록·승정원일기 등
    recentRegistrations: [
      '한국의 탈춤(2022, 인류무형)',
      '4·19혁명 기록물(2023, 세계기록)',
      '동학농민혁명 기록물(2023, 세계기록)',
    ],
  },
  domesticContent: {
    movieAnnualAudience: 11200,      // 만명 (2024)
    boxOfficeBillionKRW: 1170,       // 10억원 (2024 약 1.17조)
    netflixSubscribers: 510,         // 만명 (국내, 2024)
    tvingSubscribers: 480,
    wavveSubscribers: 290,
    koreanMovieShare: 52,            // %
  },
  music: {
    domesticAnnualSalesBillionKRW: 1280, // 10억원 (음반·음원·공연)
    topGroups: [
      { name: 'BTS',          agency: '빅히트뮤직(HYBE)', debut: '2013' },
      { name: 'BLACKPINK',    agency: 'YG엔터테인먼트',    debut: '2016' },
      { name: 'NewJeans',     agency: 'ADOR(HYBE)',         debut: '2022' },
      { name: '세븐틴',       agency: '플레디스(HYBE)',     debut: '2015' },
      { name: 'TWICE',        agency: 'JYP엔터테인먼트',    debut: '2015' },
      { name: '에스파',       agency: 'SM엔터테인먼트',     debut: '2020' },
      { name: 'IVE',          agency: '스타쉽엔터테인먼트', debut: '2021' },
      { name: '르세라핌',     agency: '쏘스뮤직(HYBE)',     debut: '2022' },
      { name: '스트레이키즈', agency: 'JYP엔터테인먼트',    debut: '2018' },
      { name: 'ENHYPEN',      agency: '빌리프랩(HYBE)',     debut: '2020' },
    ],
    melonMauMillion: 13.2,
  },
  publishing: {
    annualReadingRate: 43,           // 연 1권 이상 독서 인구 %
    booksPublishedAnnually: 6.5,     // 만권
    librariesNationwide: 1255,
  },
  sports: {
    olympicGoldRecord: 96,           // 1948~2024 누적 (계산상 대략)
    olympicSilverRecord: 92,
    olympicBronzeRecord: 100,
    kboAttendanceMillions: 10.9,     // 2024 KBO 첫 천만 관중 돌파
    kleagueAttendanceMillions: 2.5,
    fifaRanking: 23,
    nationalSports: '태권도',
  },
  games: {
    industryRevenueBillionUSD: 19.5, // 게임산업 매출 $B (2024 약 22조원)
    globalEsportsRanking: 1,         // LoL Worlds 등 최강
    topPublishers: ['크래프톤', '넥슨', '엔씨소프트', '카카오게임즈', '넷마블', '펄어비스', '컴투스'],
    webtoonRevenueBillionKRW: 2400,  // 10억원 (2조 4천억)
  },
  religion: {
    none: 56.1,
    protestant: 19.7,
    catholic: 7.9,
    buddhist: 15.5,
    other: 0.8,
  },
  language: {
    standardName: '한국어 (표준어 기반 서울말)',
    activeDialects: 7,               // 동남·서남·중부·제주·동북·서북·강원
    hangulDay: '10월 9일',
  },
  museums: 1102,                     // 국공립·사립 박물관·미술관
  libraries: 1255,
  performanceVenues: 1280,
  culturalBudgetKRW: 7.4,            // 문체부 예산 (조원, 2025)
  notableArtists: [
    'BTS', 'BLACKPINK', 'NewJeans', '봉준호', '박찬욱',
    '김기덕(故)', '이정재', '송강호', '윤여정', '이병헌',
  ],
  notableDirectors: [
    '봉준호 (기생충, 미키17)',
    '박찬욱 (헤어질 결심, 올드보이)',
    '김지운 (장화홍련, 거미집)',
    '나홍진 (곡성, 추격자)',
    '연상호 (부산행, 지옥)',
    '이창동 (버닝, 시)',
    '홍상수 (옥희의 영화)',
    '황동혁 (오징어 게임)',
  ],
};
