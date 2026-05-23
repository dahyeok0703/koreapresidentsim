import type { SnsState } from '../types/game';
import { buildInitialSnsPosts } from './snsPosts';

export function buildInitialSns(presIdeology: number): SnsState {
  // 플랫폼 성향(bias)이 대통령 이념과 반대 부호일수록 호감 ↑
  const fav = (bias: number) => Math.round(-bias * presIdeology / 100);
  return {
    platforms: [
      { id: 'KAKAO',       name: '카카오톡',      monthlyUsers: 4800, mainAge: '전 연령',  bias: 0,    presidentFavor: fav(0),    desc: '국민 메신저. 단톡방·오픈채팅으로 여론 형성.' },
      { id: 'YOUTUBE',     name: '유튜브',        monthlyUsers: 4600, mainAge: '전 연령',  bias: 10,   presidentFavor: fav(10),   desc: '정치 유튜브 채널 영향력 막강. 보수·진보 양극화.' },
      { id: 'NAVER_CAFE',  name: '네이버 카페',   monthlyUsers: 2800, mainAge: '30-50대',  bias: -5,   presidentFavor: fav(-5),   desc: '맘카페·지역카페가 여론 진앙지.' },
      { id: 'NAVER_BLOG',  name: '네이버 블로그', monthlyUsers: 2200, mainAge: '30-50대',  bias: 0,    presidentFavor: fav(0),    desc: '리뷰·정보 중심. 정치적 영향력은 낮음.' },
      { id: 'INSTAGRAM',   name: '인스타그램',    monthlyUsers: 2400, mainAge: '20-30대',  bias: -15,  presidentFavor: fav(-15),  desc: '20-30대 여성·MZ 비중 높음.' },
      { id: 'FACEBOOK',    name: '페이스북',      monthlyUsers: 1100, mainAge: '40-60대',  bias: 25,   presidentFavor: fav(25),   desc: '중장년·보수 성향 게시물 비중 높음.' },
      { id: 'X',           name: 'X (구 트위터)', monthlyUsers: 600,  mainAge: '20-30대',  bias: -20,  presidentFavor: fav(-20),  desc: '실시간 이슈 폭발. 정치인·기자 활발.' },
      { id: 'THREADS',     name: '스레드',        monthlyUsers: 320,  mainAge: '20-30대',  bias: -10,  presidentFavor: fav(-10),  desc: '메타의 X 대항마.' },
      { id: 'DCINSIDE',    name: '디시인사이드',  monthlyUsers: 750,  mainAge: '20-40대 남', bias: 30,  presidentFavor: fav(30),   desc: '남초 커뮤니티. 보수·반페미 정서.' },
      { id: 'FMKOREA',     name: '에펨코리아',    monthlyUsers: 650,  mainAge: '20-30대 남', bias: 40,  presidentFavor: fav(40),   desc: '20-30 남성 보수 커뮤니티.' },
      { id: 'CLIEN',       name: '클리앙',        monthlyUsers: 180,  mainAge: '30-40대',  bias: -50,  presidentFavor: fav(-50),  desc: 'IT/정치 진보 커뮤니티.' },
    ],
    hotKeywords: [
      { keyword: '대통령 취임',     volume: 480, sentiment: 35 },
      { keyword: '민생회복지원금',  volume: 220, sentiment: 45 },
      { keyword: '검찰개혁',        volume: 180, sentiment: 10 },
      { keyword: '부동산',          volume: 160, sentiment: -15 },
      { keyword: '의대 정원',       volume: 130, sentiment: -20 },
      { keyword: '한미관세',        volume: 110, sentiment: -10 },
      { keyword: '북한 도발',       volume: 95,  sentiment: -35 },
      { keyword: '청년 일자리',     volume: 85,  sentiment: -25 },
      { keyword: '국민연금',        volume: 70,  sentiment: -30 },
      { keyword: '주 4.5일제',      volume: 60,  sentiment: 30 },
    ],
    presidentMentions: 320,
    sentimentScore: Math.round(-presIdeology * 0.15),  // 진보 대통령이면 진보 우세 SNS에서 살짝 호의적
    recentPosts: buildInitialSnsPosts(presIdeology),
    protestSentiment: 25,
  };
}
