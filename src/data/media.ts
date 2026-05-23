import type { MediaOutlet } from '../types/game';

export const MEDIA_OUTLETS: MediaOutlet[] = [
  { id: 'KBS',        name: 'KBS',        type: '지상파', bias: 0,    influence: 85, favorToPresident: 0 },
  { id: 'MBC',        name: 'MBC',        type: '지상파', bias: -25,  influence: 78, favorToPresident: 5 },
  { id: 'SBS',        name: 'SBS',        type: '지상파', bias: -5,   influence: 75, favorToPresident: 0 },
  { id: 'JTBC',       name: 'JTBC',       type: '종편',   bias: -15,  influence: 72, favorToPresident: 0 },
  { id: 'YTN',        name: 'YTN',        type: '종편',   bias: -5,   influence: 60, favorToPresident: 0 },
  { id: 'CHOSUN',     name: '조선일보',   type: '신문',   bias: 70,   influence: 80, favorToPresident: 0 },
  { id: 'JOONGANG',   name: '중앙일보',   type: '신문',   bias: 45,   influence: 70, favorToPresident: 0 },
  { id: 'DONGA',      name: '동아일보',   type: '신문',   bias: 55,   influence: 65, favorToPresident: 0 },
  { id: 'HANI',       name: '한겨레',     type: '신문',   bias: -60,  influence: 55, favorToPresident: 0 },
  { id: 'KYUNGHYANG', name: '경향신문',   type: '신문',   bias: -50,  influence: 50, favorToPresident: 0 },
  { id: 'OHMY',       name: '오마이뉴스', type: '인터넷', bias: -65,  influence: 45, favorToPresident: 0 },
];
