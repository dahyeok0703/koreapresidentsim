import type { ForeignRelation } from '../types/game';

export const FOREIGN_RELATIONS: ForeignRelation[] = [
  { id: 'US', name: '미국',     relation: 75,  trustLevel: 80, tradeVolume: 1900, recentEvents: [], leader: '도널드 트럼프' },
  { id: 'CN', name: '중국',     relation: 5,   trustLevel: 30, tradeVolume: 3000, recentEvents: [], leader: '시진핑' },
  { id: 'JP', name: '일본',     relation: 35,  trustLevel: 45, tradeVolume: 800,  recentEvents: [], leader: '이시바 시게루' },
  { id: 'NK', name: '북한',     relation: -70, trustLevel: 5,  tradeVolume: 0,    recentEvents: [], leader: '김정은' },
  { id: 'RU', name: '러시아',   relation: -30, trustLevel: 15, tradeVolume: 150,  recentEvents: [], leader: '블라디미르 푸틴' },
  { id: 'EU', name: 'EU',       relation: 60,  trustLevel: 70, tradeVolume: 1300, recentEvents: [], leader: '우르줄라 폰데어라이엔' },
  { id: 'UK', name: '영국',     relation: 65,  trustLevel: 72, tradeVolume: 130,  recentEvents: [], leader: '키어 스타머' },
  { id: 'IN', name: '인도',     relation: 55,  trustLevel: 60, tradeVolume: 270,  recentEvents: [], leader: '나렌드라 모디' },
  { id: 'VN', name: '베트남',   relation: 70,  trustLevel: 70, tradeVolume: 870,  recentEvents: [], leader: '또 럼' },
  { id: 'AU', name: '호주',     relation: 70,  trustLevel: 75, tradeVolume: 410,  recentEvents: [], leader: '앤서니 앨버니지' },
  { id: 'TW', name: '대만',     relation: 50,  trustLevel: 55, tradeVolume: 530,  recentEvents: [], leader: '라이칭더' },
  { id: 'UN', name: '국제연합', relation: 60,  trustLevel: 65, tradeVolume: 0,    recentEvents: [], leader: '안토니우 구테흐스' },
];
