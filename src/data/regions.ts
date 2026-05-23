import type { Region } from '../types/game';

// 2024 기준 통계 + 2022 지방선거 단체장 (2025-06 기준)
export const REGIONS: Region[] = [
  { id: 'SEOUL',     name: '서울특별시',         capital: '-',     population: 938,  area: 605,    grdp: 486, leaning: 5,   economicHealth: 78, unemployment: 3.0, governor: '오세훈', governorParty: 'PPP' },
  { id: 'BUSAN',     name: '부산광역시',         capital: '-',     population: 327,  area: 770,    grdp: 102, leaning: -25, economicHealth: 62, unemployment: 3.4, governor: '박형준', governorParty: 'PPP' },
  { id: 'DAEGU',     name: '대구광역시',         capital: '-',     population: 238,  area: 1499,   grdp: 64,  leaning: -60, economicHealth: 58, unemployment: 3.2, governor: '홍준표', governorParty: 'PPP' },
  { id: 'INCHEON',   name: '인천광역시',         capital: '-',     population: 300,  area: 1066,   grdp: 110, leaning: 10,  economicHealth: 71, unemployment: 3.3, governor: '유정복', governorParty: 'PPP' },
  { id: 'GWANGJU',   name: '광주광역시',         capital: '-',     population: 142,  area: 501,    grdp: 47,  leaning: 75,  economicHealth: 65, unemployment: 3.5, governor: '강기정', governorParty: 'DPK' },
  { id: 'DAEJEON',   name: '대전광역시',         capital: '-',     population: 144,  area: 540,    grdp: 50,  leaning: 5,   economicHealth: 72, unemployment: 3.2, governor: '이장우', governorParty: 'PPP' },
  { id: 'ULSAN',     name: '울산광역시',         capital: '-',     population: 110,  area: 1062,   grdp: 80,  leaning: -25, economicHealth: 74, unemployment: 3.0, governor: '김두겸', governorParty: 'PPP' },
  { id: 'SEJONG',    name: '세종특별자치시',     capital: '-',     population: 39,   area: 465,    grdp: 14,  leaning: 25,  economicHealth: 76, unemployment: 2.8, governor: '최민호', governorParty: 'PPP' },
  { id: 'GYEONGGI',  name: '경기도',             capital: '수원',  population: 1364, area: 10185,  grdp: 540, leaning: 15,  economicHealth: 75, unemployment: 3.0, governor: '김동연', governorParty: 'DPK' },
  { id: 'GANGWON',   name: '강원특별자치도',     capital: '춘천',  population: 152,  area: 16830,  grdp: 53,  leaning: -20, economicHealth: 58, unemployment: 3.5, governor: '김진태', governorParty: 'PPP' },
  { id: 'CHUNGBUK',  name: '충청북도',           capital: '청주',  population: 158,  area: 7407,   grdp: 78,  leaning: -5,  economicHealth: 65, unemployment: 3.3, governor: '김영환', governorParty: 'PPP' },
  { id: 'CHUNGNAM',  name: '충청남도',           capital: '홍성',  population: 212,  area: 8246,   grdp: 130, leaning: -10, economicHealth: 68, unemployment: 3.2, governor: '김태흠', governorParty: 'PPP' },
  { id: 'JEONBUK',   name: '전북특별자치도',     capital: '전주',  population: 174,  area: 8069,   grdp: 56,  leaning: 70,  economicHealth: 55, unemployment: 3.6, governor: '김관영', governorParty: 'DPK' },
  { id: 'JEONNAM',   name: '전라남도',           capital: '무안',  population: 180,  area: 12348,  grdp: 88,  leaning: 75,  economicHealth: 56, unemployment: 3.5, governor: '김영록', governorParty: 'DPK' },
  { id: 'GYEONGBUK', name: '경상북도',           capital: '안동',  population: 255,  area: 19036,  grdp: 117, leaning: -65, economicHealth: 60, unemployment: 3.4, governor: '이철우', governorParty: 'PPP' },
  { id: 'GYEONGNAM', name: '경상남도',           capital: '창원',  population: 324,  area: 10541,  grdp: 132, leaning: -35, economicHealth: 65, unemployment: 3.3, governor: '박완수', governorParty: 'PPP' },
  { id: 'JEJU',      name: '제주특별자치도',     capital: '제주',  population: 67,   area: 1850,   grdp: 22,  leaning: 20,  economicHealth: 64, unemployment: 3.0, governor: '오영훈', governorParty: 'DPK' },
];
