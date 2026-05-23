import type { SnsState } from '../types/game';

export const INITIAL_SNS: SnsState = {
  platforms: [
    { id: 'KAKAO',       name: '카카오톡',      monthlyUsers: 4800, mainAge: '전 연령',  bias: 0,    presidentFavor: 0, desc: '국민 메신저. 단톡방·오픈채팅으로 여론 형성.' },
    { id: 'YOUTUBE',     name: '유튜브',        monthlyUsers: 4600, mainAge: '전 연령',  bias: 10,   presidentFavor: 0, desc: '정치 유튜브 채널 영향력 막강. 보수·진보 양극화.' },
    { id: 'NAVER_CAFE',  name: '네이버 카페',   monthlyUsers: 2800, mainAge: '30-50대',  bias: -5,   presidentFavor: 0, desc: '맘카페·지역카페가 여론 진앙지.' },
    { id: 'INSTAGRAM',   name: '인스타그램',    monthlyUsers: 2400, mainAge: '20-30대',  bias: -15,  presidentFavor: 0, desc: '20-30대 여성·MZ 비중 높음.' },
    { id: 'FACEBOOK',    name: '페이스북',      monthlyUsers: 1100, mainAge: '40-60대',  bias: 25,   presidentFavor: 0, desc: '중장년·보수 성향 게시물 비중 높음.' },
    { id: 'X',           name: 'X (구 트위터)', monthlyUsers: 600,  mainAge: '20-30대',  bias: -20,  presidentFavor: 0, desc: '실시간 이슈 폭발. 정치인·기자 활발.' },
    { id: 'DCINSIDE',    name: '디시인사이드',  monthlyUsers: 750,  mainAge: '20-40대 남', bias: 30,  presidentFavor: 0, desc: '남초 커뮤니티. 보수·반페미 정서.' },
    { id: 'FMKOREA',     name: '에펨코리아',    monthlyUsers: 650,  mainAge: '20-30대 남', bias: 40,  presidentFavor: 0, desc: '20-30 남성 보수 커뮤니티.' },
    { id: 'CLIEN',       name: '클리앙',        monthlyUsers: 180,  mainAge: '30-40대',  bias: -50,  presidentFavor: 0, desc: 'IT/정치 진보 커뮤니티.' },
  ],
  hotKeywords: [
    { keyword: '대통령 취임', volume: 480, sentiment: 35 },
    { keyword: '민생회복', volume: 220, sentiment: 45 },
    { keyword: '검찰개혁', volume: 180, sentiment: 10 },
    { keyword: '부동산', volume: 160, sentiment: -15 },
    { keyword: '의대 정원', volume: 130, sentiment: -20 },
    { keyword: '한미관세', volume: 110, sentiment: -10 },
    { keyword: '북한 도발', volume: 95, sentiment: -35 },
    { keyword: '청년 일자리', volume: 85, sentiment: -25 },
  ],
  presidentMentions: 320, // 만건/일
  sentimentScore: 18,
  recentPosts: [],
  protestSentiment: 25,
};
