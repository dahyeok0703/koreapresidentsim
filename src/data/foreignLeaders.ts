// 외국 정상 임기·후임 풀. termEnd가 지나면 자동 교체.

export interface LeaderTermInfo {
  countryId: string;
  termEnd: string;              // YYYY-MM-DD
  successors: string[];          // 후보 풀 (시간 순 등장)
}

// 2025년 6월 기준 주요국 정상 임기 (실제 정치 일정 + 추정)
export const FOREIGN_LEADER_TERMS: LeaderTermInfo[] = [
  // ===== 동아시아 =====
  { countryId: 'US',  termEnd: '2029-01-20', successors: ['JD 밴스','피트 부티지지','캘리포니아 신임 주지사','공화당 신임 후보','민주당 신임 후보','중도파 무소속','경제 전문가 인사','신세대 정치인','전직 국방장관','전직 국무장관'] },
  { countryId: 'CN',  termEnd: '2027-10-22', successors: ['딩쉐샹','왕후닝','자오러지','후춘화','신임 총서기','당 원로 추대','집단지도체제 의장','경제 개혁파','강경 매파','신세대 4세대 지도자'] },
  { countryId: 'JP',  termEnd: '2025-09-30', successors: ['고이즈미 신지로','다카이치 사나에','고노 다로','하야시 요시마사','노다 세이코','입헌민주당 신임 대표','자민당 신임 총재','연립 신임 총리','신세대 자민당','경제재정 전문가'] },
  { countryId: 'NK',  termEnd: '2099-12-31', successors: ['김주애 (후계 거론)','김여정','김정철','신임 노동당 위원장','집단지도체제','군부 신임 지도자'] },
  { countryId: 'TW',  termEnd: '2028-05-20', successors: ['샤오메이친','한궈위','허우유이','커원저','국민당 신임 후보','민진당 신임 후보','민중당 신임 후보'] },
  { countryId: 'MN',  termEnd: '2027-06-09', successors: ['MAH 사이항빌렉','신임 인민당 대표','신임 민주당 대표','젊은 개혁파','경제 전문가'] },

  // ===== 동남아 =====
  { countryId: 'VN',  termEnd: '2026-05-20', successors: ['팜 민 친','쩐 타인 만','신임 당총비서','부주석 출신','경제 전문가'] },
  { countryId: 'TH',  termEnd: '2027-08-13', successors: ['아누틴 찬비라쿨','쁘라윳 짠오차','전직 군부','민주당 신임 후보','푸어타이당 신임'] },
  { countryId: 'ID',  termEnd: '2029-10-20', successors: ['기브란 라카부밍','아니에스 바스웨단','신임 PDI-P 후보','신임 골카르 후보','젊은 개혁파','경제 전문가'] },
  { countryId: 'PH',  termEnd: '2028-06-30', successors: ['사라 두테르테','레니 로브레도','마닐라 시장','부통령 출신','전직 상원의원','젊은 개혁파'] },
  { countryId: 'MY',  termEnd: '2028-11-19', successors: ['모하맛 하산','자히드 하미디','파스당 신임','UMNO 신임','젊은 PKR'] },
  { countryId: 'SG',  termEnd: '2030-05-01', successors: ['리셴양','옹예쿵','찬춘싱','신임 PAP 후보','젊은 개혁파'] },
  { countryId: 'MM',  termEnd: '2099-12-31', successors: ['소 윈','민 아웅 흘라잉 측근','군부 신임','과도 정부 수반'] },
  { countryId: 'KH',  termEnd: '2028-08-22', successors: ['훈 마니','신임 인민당','젊은 개혁파'] },

  // ===== 남아시아 =====
  { countryId: 'IN',  termEnd: '2029-06-04', successors: ['아미트 샤','라훌 간디','요기 아디트야나트','아닐 칸드라','신임 BJP 대표','신임 INC 대표','젊은 개혁파'] },
  { countryId: 'PK',  termEnd: '2029-02-29', successors: ['빌라왈 부토 자르다리','임란 칸 측근','신임 PML-N','신임 PPP','신임 PTI'] },
  { countryId: 'BD',  termEnd: '2027-12-31', successors: ['타리크 라흐만','신임 BNP','신임 아와미연맹','과도정부 수반'] },
  { countryId: 'LK',  termEnd: '2029-09-23', successors: ['사지트 프레마다사','라닐 위크라마싱하','신임 JVP','신임 SJB'] },

  // ===== 중동 =====
  { countryId: 'SA',  termEnd: '2099-12-31', successors: ['칼리드 빈 살만','신임 왕세자','집단지도체제'] },
  { countryId: 'AE',  termEnd: '2099-12-31', successors: ['칼리드 빈 무함마드','신임 아부다비 통치자'] },
  { countryId: 'IR',  termEnd: '2029-07-28', successors: ['모하마드 모카베르','신임 강경 보수파','신임 개혁파','국가지도자 측근','젊은 성직자'] },
  { countryId: 'TR',  termEnd: '2028-06-28', successors: ['에크렘 이마모을루','만수르 야와시','신임 AKP','신임 CHP','신임 IYI'] },
  { countryId: 'IL',  termEnd: '2026-10-27', successors: ['베니 간츠','야이르 라피드','나프탈리 베네트','요아브 갈란트','이츠하크 헤르초크 (대통령직)','신임 리쿠드 대표','신임 중도파'] },

  // ===== 유럽 =====
  { countryId: 'UK',  termEnd: '2029-08-28', successors: ['이베트 쿠퍼','웨스 스트리팅','리시 수낵','신임 보수당 대표','신임 자유민주당','신임 SNP','젊은 노동당'] },
  { countryId: 'DE',  termEnd: '2029-09-30', successors: ['옌스 슈판','마르쿠스 죄더','신임 SPD','신임 녹색당','신임 AfD','신임 좌파당'] },
  { countryId: 'FR',  termEnd: '2027-05-13', successors: ['에두아르 필리프','가브리엘 아탈','마린 르펜','조르당 바르델라','장뤽 멜랑숑','신임 르네상스'] },
  { countryId: 'IT',  termEnd: '2027-10-13', successors: ['마테오 살비니','엘리 슐레인','주제페 콘테','신임 PD','신임 M5S','신임 Lega'] },
  { countryId: 'ES',  termEnd: '2027-12-19', successors: ['알베르토 누녜스 페이호','이올란다 디아스','신임 PSOE','신임 PP','신임 Vox'] },
  { countryId: 'PL',  termEnd: '2027-11-13', successors: ['신임 PiS','신임 PO','신임 좌파','젊은 개혁파'] },
  { countryId: 'NL',  termEnd: '2028-06-30', successors: ['헤이르트 빌더르스','신임 VVD','신임 D66','신임 GroenLinks-PvdA'] },
  { countryId: 'BE',  termEnd: '2029-06-09', successors: ['신임 N-VA','신임 사회당','신임 자유당'] },
  { countryId: 'SE',  termEnd: '2026-09-13', successors: ['망달레나 안데르손','신임 사민당','신임 보수당','신임 SD'] },
  { countryId: 'NO',  termEnd: '2025-09-08', successors: ['에르나 솔베르그','신임 노동당','신임 보수당','신임 중앙당'] },
  { countryId: 'FI',  termEnd: '2027-04-04', successors: ['리카 푸라','산나 마린','신임 KOK','신임 SDP'] },
  { countryId: 'DK',  termEnd: '2026-10-31', successors: ['옌스 옌센','신임 사민당','신임 자유당'] },
  { countryId: 'IE',  termEnd: '2030-02-08', successors: ['신임 피어너 게일','신임 피어너 폴','신임 신페인'] },
  { countryId: 'GR',  termEnd: '2027-06-25', successors: ['스테파노스 카셀라키스','니코스 안드룰라키스','신임 ND','신임 SYRIZA'] },
  { countryId: 'CZ',  termEnd: '2025-10-04', successors: ['안드레이 바비시','신임 ANO','신임 ODS','신임 STAN'] },
  { countryId: 'HU',  termEnd: '2026-04-12', successors: ['페테르 마자르','신임 Fidesz','신임 Tisza당','신임 야권'] },
  { countryId: 'RO',  termEnd: '2028-12-09', successors: ['신임 PSD','신임 PNL','신임 USR','신임 AUR'] },
  { countryId: 'AT',  termEnd: '2029-09-29', successors: ['헤르베르트 키클','신임 ÖVP','신임 SPÖ','신임 NEOS'] },
  { countryId: 'CH',  termEnd: '2025-12-31', successors: ['연방평의회 의장 윤번 (UDC·PS·CVP·FDP·녹색당)','신임 SVP','신임 사민당','신임 자유민주당'] },
  { countryId: 'PT',  termEnd: '2029-03-10', successors: ['신임 PSD','신임 PS','신임 Chega'] },
  { countryId: 'RU',  termEnd: '2030-05-07', successors: ['미하일 미슈스틴','드미트리 메드베데프','드미트리 파트루셰프','세르게이 키리옌코','니콜라이 파트루셰프','신임 통합러시아','신임 보수파'] },
  { countryId: 'UA',  termEnd: '2024-05-20', successors: ['발레리 잘루즈니','비탈리 클리치코','페트로 포로셴코','율리아 티모셴코','신임 인민의 종','신임 우다르'] },
  { countryId: 'BY',  termEnd: '2030-09-30', successors: ['빅토르 루카셴코','신임 친러','민주 야당'] },

  // ===== 북미·중남미 =====
  { countryId: 'CA',  termEnd: '2029-10-20', successors: ['크리스티아 프릴랜드','피에르 푸알리에브','신임 자유당','신임 보수당','신임 NDP'] },
  { countryId: 'MX',  termEnd: '2030-10-01', successors: ['신임 MORENA','신임 PAN','신임 PRI','젊은 개혁파'] },
  { countryId: 'BR',  termEnd: '2027-01-01', successors: ['타르시지오 지 프레이타스','자이르 보우소나루','시몬 테베트','신임 PT','신임 PL','신임 PSD'] },
  { countryId: 'AR',  termEnd: '2027-12-10', successors: ['패트리시아 불리치','악셀 키칠로프','신임 LLA','신임 PJ','신임 PRO'] },
  { countryId: 'CL',  termEnd: '2026-03-11', successors: ['에블린 마테이','호세 안토니오 카스트','파블로 라라인','신임 보수','신임 좌파'] },
  { countryId: 'CO',  termEnd: '2026-08-07', successors: ['신임 우파 후보','신임 중도 후보','젊은 개혁파'] },
  { countryId: 'PE',  termEnd: '2026-07-28', successors: ['신임 보수','신임 좌파','신임 중도'] },
  { countryId: 'CU',  termEnd: '2031-04-19', successors: ['신임 공산당 1서기','집단지도체제'] },
  { countryId: 'VE',  termEnd: '2031-01-10', successors: ['에드문도 곤살레스','마리아 코리나 마차도','신임 PSUV','신임 야권'] },

  // ===== 오세아니아 =====
  { countryId: 'AU',  termEnd: '2028-09-30', successors: ['피터 더턴','타냐 플리버섹','짐 차머스','신임 노동당','신임 자유당','신임 녹색당'] },
  { countryId: 'NZ',  termEnd: '2026-10-31', successors: ['크리스 힙킨스','신임 국민당','신임 노동당','신임 녹색당'] },

  // ===== 아프리카 주요국 =====
  { countryId: 'EG',  termEnd: '2030-04-02', successors: ['모하메드 만수르','신임 군부','신임 무슬림형제단 후속','젊은 개혁파'] },
  { countryId: 'ZA',  termEnd: '2029-05-29', successors: ['폴 마샤틸레','존 스틴호이센','줄리어스 말레마','신임 ANC','신임 DA','신임 EFF'] },
  { countryId: 'NG',  termEnd: '2027-05-29', successors: ['아티쿠 아부바카르','피터 오비','신임 APC','신임 PDP','신임 LP'] },
  { countryId: 'KE',  termEnd: '2027-08-15', successors: ['라일라 오딩가','마사 카루아','신임 UDA','신임 ODM'] },
  { countryId: 'ET',  termEnd: '2026-06-04', successors: ['신임 PP','신임 야권','과도 정부'] },
  { countryId: 'MA',  termEnd: '2026-09-08', successors: ['신임 RNI','신임 PAM','신임 PJD'] },
];
