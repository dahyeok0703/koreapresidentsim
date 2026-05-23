import type { GameState } from '../types/game';

export function summarizeState(s: GameState): string {
  const p = s.president;
  const ap = s.approval;
  const e = s.economy;
  const so = s.social;
  const sec = s.security;
  const intl = s.international;
  const party = s.parties.find(x => x.id === p.party)?.name ?? p.party;
  const ruling = s.assembly.rulingCoalitionSeats;
  const opp = s.assembly.oppositionSeats;
  const foreign = s.foreign.slice(0, 12).map(f => `${f.name}(관계${f.relation}/신뢰${f.trustLevel})`).join(', ');
  const recentEvents = s.events.slice(0, 5).map(ev => `- [${ev.date}/${ev.severity}] ${ev.headline}`).join('\n');
  const conflicts = intl.ongoingConflicts.slice(0, 4).map(c => `${c.name}(${c.status},강도${c.intensity})`).join(', ');

  return [
    `## 대통령`,
    `- ${p.name} (${party}, ${p.age}세, ${p.gender === 'M' ? '남' : '여'}, 이념${p.ideology}, ${p.religion})`,
    `- 슬로건: "${p.slogan}"`,
    `- 출생지: ${p.birthplace}, MBTI: ${p.mbti ?? '-'}`,
    `- 학력: ${p.education.map(ed => `${ed.school}(${ed.level})`).join(', ')}`,
    `- 주요 경력: ${p.career.slice(-3).map(c => `${c.position}@${c.org}`).join(', ')}`,
    `- 취임일: ${p.inauguratedAt}, 현재: ${s.clock.currentDate} (${s.clock.daysInOffice}일차)`,
    ``,
    `## 지지율 (${ap.overall.toFixed(1)}%)`,
    `- 연령: 18-29 ${ap.byAgeGroup['18-29']}, 30 ${ap.byAgeGroup['30-39']}, 40 ${ap.byAgeGroup['40-49']}, 50 ${ap.byAgeGroup['50-59']}, 60 ${ap.byAgeGroup['60-69']}, 70+ ${ap.byAgeGroup['70+']}`,
    `- 이념: 진보 ${ap.byIdeology.progressive}, 중도 ${ap.byIdeology.moderate}, 보수 ${ap.byIdeology.conservative}`,
    `- 소득: 하 ${ap.byIncome.low}, 중하 ${ap.byIncome.middleLow}, 중 ${ap.byIncome.middle}, 중상 ${ap.byIncome.middleHigh}, 상 ${ap.byIncome.high}`,
    ``,
    `## 경제`,
    `- GDP성장 ${e.gdpGrowth}%, 물가 ${e.inflation}%(근원 ${e.coreInflation}%), 실업 ${e.unemployment}%(청년 ${e.youthUnemployment}%)`,
    `- 기준금리 ${e.baseRate}%, 환율 ${e.fxUsdKrw}원/$, 코스피 ${e.kospi}, 코스닥 ${e.kosdaq}`,
    `- 수출 YoY ${e.exportYoY}%, 무역수지 ${e.tradeBalance}억$, 경상수지 ${e.currentAccount}억$, 외환보유고 ${e.fxReserves}억$`,
    `- 국가부채/GDP ${e.nationalDebt}%, 가계부채/GDP ${e.householdDebt}%, 주택가격YoY ${e.housePriceYoY}%`,
    `- 소비심리 ${e.consumerConfidence}, 기업심리 ${e.businessConfidence}`,
    ``,
    `## 사회`,
    `- 인구 ${so.totalPopulation}만(증감 ${so.populationGrowth}%), 출산율 ${so.birthRate}, 자살률 ${so.suicideRate}/10만`,
    `- 의료만족 ${so.healthcareSatisfaction}, 연금신뢰 ${so.pensionTrust}, 정부신뢰 ${so.governmentTrust}`,
    `- 갈등: 젠더 ${so.genderConflictIndex}, 세대 ${so.generationConflictIndex}, 계층 ${so.classConflictIndex}`,
    `- 언론자유 RSF ${so.pressFreedomIndex}(낮을수록 좋음), 부패인식 ${so.corruptionPerceptionIndex}, 민주주의 ${so.democracyIndex}`,
    ``,
    `## 안보`,
    `- DEFCON ${sec.defconLevel}, WATCHCON ${sec.watchcon}, 북한긴장 ${sec.northKoreaTension}, 도발위험 ${sec.northKoreaProvocationRisk}`,
    `- 한미동맹 ${sec.usAllianceStrength}, 주한미군 ${sec.usftKorea}명, 군 준비 ${sec.rokMilitaryReadiness}, GFP ${sec.globalFireRank}위`,
    `- 북한 핵 추정 ${sec.northKoreaNukes}기, 올해 미사일 ${sec.northKoreaMissilesYear}회`,
    ``,
    `## 국회`,
    `- 여당 ${ruling}석 vs 야권 ${opp}석 (의장 ${s.assembly.speaker.name}/${s.assembly.speaker.party})`,
    ``,
    `## 사법부`,
    `- 대법원장 ${s.judiciary.supremeCourt.chiefJustice}, 헌재소장 ${s.judiciary.constitutionalCourt.chief}, 검찰총장 ${s.judiciary.prosecution.prosecutorGeneral}`,
    `- 검찰 독립성 ${s.judiciary.prosecution.independenceIndex}`,
    ``,
    `## 외교 (주요)`,
    `- ${foreign}`,
    ``,
    `## 국제정세`,
    `- 미국 대통령: ${s.foreign.find(f=>f.id==='US')?.leader}, 일본 총리: ${s.foreign.find(f=>f.id==='JP')?.leader}, 북한: ${s.foreign.find(f=>f.id==='NK')?.leader}`,
    `- 진행 분쟁: ${conflicts}`,
    `- 세계GDP ${intl.globalEconomy.worldGdpGrowth}%, WTI ${intl.globalEconomy.oilPriceWTI}$, S&P500 ${intl.sp500}`,
    ``,
    `## SNS 여론`,
    `- 종합정서 ${s.sns.sentimentScore}, 시위동력 ${s.sns.protestSentiment}, 핫이슈: ${s.sns.hotKeywords.slice(0,5).map(k => `#${k.keyword}(${k.sentiment})`).join(' ')}`,
    ``,
    `## 최근 사건`,
    recentEvents || '- 없음',
  ].join('\n');
}

export const EFFECTS_SCHEMA_INSTRUCTION = `
effects 객체는 다음 키의 부분집합(모두 선택적, 모든 수치는 변화량 delta):
{
  "approval": number,                        // -15 ~ +15
  "approvalByAge": { "18-29"?: n, "30-39"?: n, "40-49"?: n, "50-59"?: n, "60-69"?: n, "70+"?: n },
  "approvalByRegion": { "SEOUL"?: n, "BUSAN"?: n, "DAEGU"?: n, "INCHEON"?: n, "GWANGJU"?: n, "DAEJEON"?: n, "ULSAN"?: n, "SEJONG"?: n, "GYEONGGI"?: n, "GANGWON"?: n, "CHUNGBUK"?: n, "CHUNGNAM"?: n, "JEONBUK"?: n, "JEONNAM"?: n, "GYEONGBUK"?: n, "GYEONGNAM"?: n, "JEJU"?: n },
  "approvalByIdeology": { "progressive"?: n, "moderate"?: n, "conservative"?: n },
  "approvalByIncome": { "low"?: n, "middleLow"?: n, "middle"?: n, "middleHigh"?: n, "high"?: n },
  "economy": { "gdpGrowth"?: n, "inflation"?: n, "coreInflation"?: n, "unemployment"?: n, "youthUnemployment"?: n,
               "kospi"?: n, "kosdaq"?: n, "fxUsdKrw"?: n, "consumerConfidence"?: n, "businessConfidence"?: n,
               "housePriceYoY"?: n, "jeonseYoY"?: n, "fiscalBalance"?: n, "baseRate"?: n,
               "currentAccount"?: n, "fxReserves"?: n, "tradeBalance"?: n, "exportYoY"?: n },
  "social": { "birthRate"?: n, "suicideRate"?: n, "healthcareSatisfaction"?: n, "educationSatisfaction"?: n,
              "pensionTrust"?: n, "governmentTrust"?: n, "genderConflictIndex"?: n, "generationConflictIndex"?: n,
              "classConflictIndex"?: n, "immigrationSentiment"?: n, "pressFreedomIndex"?: n,
              "corruptionPerceptionIndex"?: n, "democracyIndex"?: n, "carbonEmission"?: n, "greenEnergyShare"?: n },
  "security": { "northKoreaTension"?: n, "northKoreaProvocationRisk"?: n, "rokMilitaryReadiness"?: n,
                "usAllianceStrength"?: n, "cyberThreatLevel"?: n, "terrorThreatLevel"?: n, "defconLevel"?: n, "watchcon"?: n },
  "foreign": { "US"?:{"relation"?:n,"trust"?:n}, "CN"?:{...}, "JP"?:{...}, "NK"?:{...}, "RU"?:{...}, "EU"?:{...}, "UK"?:{...}, "DE"?:{...}, "FR"?:{...}, "IN"?:{...}, "VN"?:{...}, "AU"?:{...}, "TW"?:{...}, "CA"?:{...}, "SA"?:{...}, "IL"?:{...}, "UA"?:{...}, "UN"?:{...}, "NATO"?:{...}, "ASEAN"?:{...} },
  "judiciary": { "supremeTrust"?: n, "ccTrust"?: n, "prosecutionTrust"?: n, "prosecutionIndep"?: n },
  "sns": { "sentiment"?: n (-100~100), "protestSentiment"?: n, "mentions"?: n (만건) },
  "notes": "string"
}

규칙:
- 모든 값은 delta(변화량). approval은 보통 ±0.5~±3, 대형 사건 ±5~±10.
- 코스피 ±5~±80, 환율 ±2~±20, 기타 지표 ±0.1~±1.5.
- 안보·갈등 지표는 ±2~±15, 외교 관계는 ±2~±15.
- 한국 정치·경제·사회 맥락을 사실적으로 반영.`;

export function buildAdvisorSystemPrompt(s: GameState): string {
  return `당신은 대한민국 대통령실의 베테랑 비서실장이자 정무수석이다.
대통령은 ${s.president.name} (${s.parties.find(p=>p.id===s.president.party)?.name}, 이념 ${s.president.ideology}).
취임일 ${s.president.inauguratedAt}, 오늘 ${s.clock.currentDate}.

임무:
1) 대통령의 지시/질문에 한국 정치·경제·외교 전문가 수준으로 답변.
2) 한국 현실(여소야대, 검찰개혁, 부동산, 북한, 한미동맹, 한일관계, 출산율, 세대갈등, 의료대란, 트럼프 2기 통상)을 사실적으로 반영.
3) 답변은 간결·실무적. 옵션을 1·2·3으로 정리.
4) 결정의 정치적·정책적 함의와 예상 반발/지지층을 분명히.
5) 솔직한 우려 제기. 예스맨 금지.
6) 한국어 존댓말, "대통령님" 호칭.

현재 국정 상황:
${summarizeState(s)}`;
}

export function buildEventSystemPrompt(s: GameState): string {
  return `당신은 대한민국 정치·사회·경제·외교 현실을 깊이 이해하는 시뮬레이션 이벤트 생성기다.
${s.clock.currentDate} 기준 발생할 법한 사실적·구체적 뉴스 이벤트를 생성하라.

규칙:
- 실제 한국 고유명사(도시·부처·기업·정당·인물) 활용.
- SF/판타지 금지, 현실 한국 뉴스 톤.
- 카테고리: ECONOMY, DIPLOMACY, SECURITY, SOCIAL, DISASTER, SCANDAL, POLITICS, CULTURE, TECH, HEALTH, NK, LEGAL, INTERNATIONAL, SNS, MEDIA.
- severity: INFO < MINOR < MODERATE < MAJOR < CRITICAL.
- MAJOR/CRITICAL은 가능하면 2~4개의 choices를 포함.

현재 상황:
${summarizeState(s)}

${EFFECTS_SCHEMA_INSTRUCTION}`;
}

export function buildDecisionSystemPrompt(s: GameState): string {
  return `당신은 대한민국 대통령의 결정이 정치·경제·사회에 미치는 영향을 평가하는 분석 엔진이다.
대통령의 결정·지시·발언을 받아 즉각/단기 효과를 effects로 산출하고, 뉴스 헤드라인·본문·언론 반응·비서실장 코멘트를 함께 만들어라.

현재 상황:
${summarizeState(s)}

${EFFECTS_SCHEMA_INSTRUCTION}

JSON 출력 형식(반드시 이 구조):
{
  "newsHeadline": "string",
  "newsBody": "string (2~4문장)",
  "mediaReactions": [
    { "outlet": "조선일보|한겨레|JTBC|KBS|YTN|중앙일보|동아일보|경향신문|매일경제|연합뉴스|...", "headline": "string" }
  ],
  "effects": { ... effects 스키마 ... },
  "advisorReply": "비서실장이 대통령께 보고하는 1~2문장 짧은 반응"
}`;
}
