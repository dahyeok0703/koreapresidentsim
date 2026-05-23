import type { JudiciaryState } from '../types/game';

// 2025-06-04 기준 사법부 구성
export const INITIAL_JUDICIARY: JudiciaryState = {
  supremeCourt: {
    chiefJustice: '조희대',
    justices: [
      { name: '오경미', appointedBy: '문재인',  ideology: -30 },
      { name: '김상환', appointedBy: '문재인',  ideology: -25 },
      { name: '노태악', appointedBy: '문재인',  ideology: -15 },
      { name: '이흥구', appointedBy: '문재인',  ideology: -35 },
      { name: '천대엽', appointedBy: '문재인',  ideology: -10 },
      { name: '오석준', appointedBy: '윤석열',  ideology: 35 },
      { name: '서경환', appointedBy: '윤석열',  ideology: 30 },
      { name: '권영준', appointedBy: '윤석열',  ideology: 25 },
      { name: '엄상필', appointedBy: '윤석열',  ideology: 30 },
      { name: '신숙희', appointedBy: '윤석열',  ideology: 20 },
      { name: '노경필', appointedBy: '윤석열',  ideology: 30 },
      { name: '박영재', appointedBy: '윤석열',  ideology: 25 },
      { name: '이숙연', appointedBy: '윤석열',  ideology: 20 },
    ],
    pendingMajorCases: [
      '이재명 공직선거법 위반 사건',
      '김명수 전 대법원장 사법행정권 남용 상고심',
      '주가조작 의혹 검찰 무혐의 처분 재정신청',
    ],
    publicTrust: 48,
  },
  constitutionalCourt: {
    chief: '문형배 (권한대행)',
    justices: [
      { name: '문형배', appointedBy: '문재인',  ideology: -35 },
      { name: '이미선', appointedBy: '문재인',  ideology: -30 },
      { name: '김형두', appointedBy: '김명수 지명', ideology: -10 },
      { name: '정정미', appointedBy: '윤석열',  ideology: 15 },
      { name: '정형식', appointedBy: '윤석열',  ideology: 30 },
      { name: '김복형', appointedBy: '조희대 지명', ideology: 20 },
      { name: '조한창', appointedBy: '국회 추천', ideology: 10 },
      { name: '정계선', appointedBy: '국회 추천', ideology: -30 },
    ],
    pendingCases: [
      '윤석열 전 대통령 탄핵 사건 (선고 완료, 파면 인용)',
      '검사 탄핵 사건',
      '계엄법 위헌 심판',
    ],
    publicTrust: 52,
  },
  prosecution: {
    prosecutorGeneral: '심우정',
    publicTrust: 32,
    independenceIndex: 45,
    activeMajorInvestigations: [
      '12·3 비상계엄 관련 내란 수사',
      '김건희 여사 의혹 (도이치모터스, 명품백 등)',
      '대장동·백현동 개발 비리',
      '서울중앙지검 특수통 인사 의혹',
    ],
  },
  police: {
    commissioner: '조지호',
    publicTrust: 45,
  },
  rulings: [
    { date: '2025-04-04', court: '헌법재판소', summary: '윤석열 대통령 탄핵심판 인용 - 8:0 만장일치 파면' },
    { date: '2025-03-15', court: '대법원',     summary: '이재명 대선후보 공직선거법 위반 사건 파기환송' },
    { date: '2025-02-28', court: '서울고법',   summary: '국정농단 잔여 사건 상고심 확정' },
  ],
};
