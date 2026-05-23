import type { MediaOutlet } from '../types/game';

// 2024-2025 한국 언론 매체. bias: -100(진보)~+100(보수)
export const MEDIA_OUTLETS: MediaOutlet[] = [
  // 지상파
  { id: 'KBS',        name: 'KBS',           type: '지상파', bias: 5,    influence: 88, favorToPresident: 0, viewership: 28.4, owner: '공영(KBS)' },
  { id: 'MBC',        name: 'MBC',           type: '지상파', bias: -30,  influence: 78, favorToPresident: 0, viewership: 18.2, owner: '방문진' },
  { id: 'SBS',        name: 'SBS',           type: '지상파', bias: -5,   influence: 75, favorToPresident: 0, viewership: 16.5, owner: '태영그룹' },
  // 종편
  { id: 'JTBC',       name: 'JTBC',          type: '종편',   bias: -15,  influence: 73, favorToPresident: 0, viewership: 9.8,  owner: '중앙홀딩스' },
  { id: 'TVCHOSUN',   name: 'TV조선',        type: '종편',   bias: 70,   influence: 70, favorToPresident: 0, viewership: 8.2,  owner: '조선일보' },
  { id: 'CHANNELA',   name: '채널A',         type: '종편',   bias: 55,   influence: 62, favorToPresident: 0, viewership: 6.1,  owner: '동아일보' },
  { id: 'MBN',        name: 'MBN',           type: '종편',   bias: 40,   influence: 60, favorToPresident: 0, viewership: 5.4,  owner: '매일경제' },
  { id: 'YTN',        name: 'YTN',           type: '종편',   bias: 25,   influence: 58, favorToPresident: 0, viewership: 4.2,  owner: '유진그룹' },
  // 통신사
  { id: 'YONHAP',     name: '연합뉴스',      type: '통신사', bias: 0,    influence: 80, favorToPresident: 0, owner: '뉴스통신진흥회' },
  { id: 'NEWSIS',     name: '뉴시스',        type: '통신사', bias: 5,    influence: 55, favorToPresident: 0, owner: '서울신문' },
  { id: 'NEWS1',      name: '뉴스1',         type: '통신사', bias: 10,   influence: 50, favorToPresident: 0, owner: '뉴스1' },
  // 신문
  { id: 'CHOSUN',     name: '조선일보',      type: '신문',   bias: 75,   influence: 82, favorToPresident: 0, circulation: 120, owner: '방상훈' },
  { id: 'JOONGANG',   name: '중앙일보',      type: '신문',   bias: 50,   influence: 72, favorToPresident: 0, circulation: 95,  owner: '홍석현' },
  { id: 'DONGA',      name: '동아일보',      type: '신문',   bias: 55,   influence: 65, favorToPresident: 0, circulation: 73,  owner: '김재호' },
  { id: 'HANI',       name: '한겨레',        type: '신문',   bias: -65,  influence: 58, favorToPresident: 0, circulation: 22,  owner: '한겨레신문(주)' },
  { id: 'KYUNGHYANG', name: '경향신문',      type: '신문',   bias: -55,  influence: 52, favorToPresident: 0, circulation: 18,  owner: '재단법인 정수재단' },
  { id: 'OHMY',       name: '오마이뉴스',    type: '인터넷', bias: -70,  influence: 48, favorToPresident: 0, owner: '오연호' },
  // 경제지
  { id: 'MK',         name: '매일경제',      type: '경제지', bias: 35,   influence: 65, favorToPresident: 0, circulation: 90,  owner: '장대환' },
  { id: 'EDAILY',     name: '이데일리',      type: '경제지', bias: 20,   influence: 50, favorToPresident: 0, owner: 'KG그룹' },
];
