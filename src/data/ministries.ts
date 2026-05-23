import type { MinistryId } from '../types/game';

export const MINISTRY_NAMES: Record<MinistryId, string> = {
  PM:    '국무총리',
  MOEF:  '기획재정부 장관 (부총리)',
  MOFA:  '외교부 장관',
  MOU:   '통일부 장관',
  MND:   '국방부 장관',
  MOIS:  '행정안전부 장관',
  MOJ:   '법무부 장관',
  MOE:   '교육부 장관 (부총리)',
  MSIT:  '과학기술정보통신부 장관',
  MCST:  '문화체육관광부 장관',
  MOTIE: '산업통상자원부 장관',
  MOHW:  '보건복지부 장관',
  MOEL:  '고용노동부 장관',
  MOLIT: '국토교통부 장관',
  MAFRA: '농림축산식품부 장관',
  MOF:   '해양수산부 장관',
  ME:    '환경부 장관',
  MOGEF: '여성가족부 장관',
  MPVA:  '국가보훈부 장관',
  MOSPA: '인사혁신처장',
  MOSME: '중소벤처기업부 장관',
  NIS:   '국가정보원장',
  BAI:   '감사원장',
  PPS:   '검찰총장',
  BOK:   '한국은행 총재',
  KCC:   '방송통신위원회 위원장',
  FSC:   '금융위원회 위원장',
  FTC:   '공정거래위원회 위원장',
};

export const MINISTRY_LIST: MinistryId[] = Object.keys(MINISTRY_NAMES) as MinistryId[];

export const MINISTRY_CATEGORY: Record<MinistryId, string> = {
  PM: '총괄', MOEF: '경제', MOFA: '외교', MOU: '안보·외교', MND: '안보·국방',
  MOIS: '행정', MOJ: '법무', MOE: '사회·교육', MSIT: '과학·산업', MCST: '문화',
  MOTIE: '경제·산업', MOHW: '사회·복지', MOEL: '사회·노동', MOLIT: '경제·국토',
  MAFRA: '경제·1차산업', MOF: '경제·해양', ME: '환경', MOGEF: '사회·여성',
  MPVA: '보훈', MOSPA: '행정', MOSME: '경제·중소기업',
  NIS: '안보·정보', BAI: '독립기관', PPS: '독립기관', BOK: '경제·통화',
  KCC: '방송', FSC: '경제·금융', FTC: '경제·공정',
};
