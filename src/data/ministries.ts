import type { MinistryId } from '../types/game';

export const MINISTRY_NAMES: Record<MinistryId, string> = {
  PM:    '국무총리',
  MOEF:  '기획재정부 장관',
  MOFA:  '외교부 장관',
  MOU:   '통일부 장관',
  MND:   '국방부 장관',
  MOIS:  '행정안전부 장관',
  MOJ:   '법무부 장관',
  MOE:   '교육부 장관',
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
  NIS:   '국가정보원장',
  BAI:   '감사원장',
  PPS:   '검찰총장',
  BOK:   '한국은행 총재',
};

export const MINISTRY_LIST: MinistryId[] = Object.keys(MINISTRY_NAMES) as MinistryId[];
