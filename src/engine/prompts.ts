import type { GameState } from '../types/game';

/**
 * 게임 상태를 LLM에 전달할 컴팩트 컨텍스트로 직렬화.
 * 토큰 절약을 위해 핵심 지표만 추린다.
 */
export function summarizeState(s: GameState): string {
  const p = s.president;
  const ap = s.approval;
  const e = s.economy;
  const so = s.social;
  const sec = s.security;
  const party = s.parties.find(x => x.id === p.party)?.name ?? p.party;
  const ruling = s.assembly.rulingCoalitionSeats;
  const opp = s.assembly.oppositionSeats;
  const foreign = s.foreign.map(f => `${f.name}(관계 ${f.relation})`).join(', ');
  const recentEvents = s.events.slice(0, 5)
    .map(ev => `- [${ev.date}/${ev.severity}] ${ev.headline}`).join('\n');

  return [
    `## 대통령`,
    `- 이름: ${p.name} (${party}, ${p.age}세, 이념성향 ${p.ideology})`,
    `- 취임: ${p.inauguratedAt}, 현재일자: ${s.clock.currentDate} (취임 ${s.clock.daysInOffice}일차, ${s.clock.turnNumber}턴)`,
    `- 약력: ${p.background}`,
    ``,
    `## 지지율`,
    `- 전체 ${ap.overall.toFixed(1)}%, 18-29 ${ap.byAgeGroup['18-29']}%, 30대 ${ap.byAgeGroup['30-39']}%, 40대 ${ap.byAgeGroup['40-49']}%, 50대 ${ap.byAgeGroup['50-59']}%, 60대+ ${ap.byAgeGroup['60+']}%`,
    `- 이념별: 진보 ${ap.byIdeology.progressive}% · 중도 ${ap.byIdeology.moderate}% · 보수 ${ap.byIdeology.conservative}%`,
    ``,
    `## 경제`,
    `- GDP성장률 ${e.gdpGrowth}%, 물가 ${e.inflation}%, 실업률 ${e.unemployment}%, 청년실업 ${e.youthUnemployment}%`,
    `- 기준금리 ${e.baseRate}%, 환율 ${e.fxUsdKrw}원/$, 코스피 ${e.kospi}, 코스닥 ${e.kosdaq}`,
    `- 수출 YoY ${e.exportYoY}%, 무역수지 ${e.tradeBalance}억$, 국가부채/GDP ${e.nationalDebt}%, 가계부채/GDP ${e.householdDebt}%`,
    `- 주택가격YoY ${e.housePriceYoY}%, 소비심리 ${e.consumerConfidence}, 기업심리 ${e.businessConfidence}`,
    ``,
    `## 사회`,
    `- 합계출산율 ${so.birthRate}, 자살률(10만명당) ${so.suicideRate}, 의료만족 ${so.healthcareSatisfaction}, 연금신뢰 ${so.pensionTrust}`,
    `- 젠더갈등 ${so.genderConflictIndex}, 세대갈등 ${so.generationConflictIndex}, 언론자유 RSF점수 ${so.pressFreedomIndex}`,
    ``,
    `## 안보`,
    `- 북한긴장도 ${sec.northKoreaTension}, 도발위험 ${sec.northKoreaProvocationRisk}, DEFCON ${sec.defconLevel}`,
    `- 군 준비태세 ${sec.rokMilitaryReadiness}, 한미동맹 ${sec.usAllianceStrength}, 사이버위협 ${sec.cyberThreatLevel}`,
    ``,
    `## 국회 (300석)`,
    `- 여당연합 ${ruling}석 vs 야권 ${opp}석`,
    `- 의장: ${s.assembly.speaker.name} (${s.assembly.speaker.party})`,
    ``,
    `## 외교 관계`,
    `- ${foreign}`,
    ``,
    `## 최근 사건`,
    recentEvents || '- 없음',
  ].join('\n');
}

export const EFFECTS_SCHEMA_INSTRUCTION = `
효과(effects) 객체는 다음 키들의 부분집합으로만 구성하라(모두 선택적):
{
  "approval": number,  // 전체 지지율 변화 (-15 ~ +15)
  "approvalByAge": { "18-29"?: number, "30-39"?: number, "40-49"?: number, "50-59"?: number, "60+"?: number },
  "approvalByRegion": { "SEOUL"?: number, "BUSAN"?: number, "DAEGU"?: number, "INCHEON"?: number, "GWANGJU"?: number, "DAEJEON"?: number, "ULSAN"?: number, "SEJONG"?: number, "GYEONGGI"?: number, "GANGWON"?: number, "CHUNGBUK"?: number, "CHUNGNAM"?: number, "JEONBUK"?: number, "JEONNAM"?: number, "GYEONGBUK"?: number, "GYEONGNAM"?: number, "JEJU"?: number },
  "approvalByIdeology": { "progressive"?: number, "moderate"?: number, "conservative"?: number },
  "economy": { "gdpGrowth"?: number, "inflation"?: number, "unemployment"?: number, "youthUnemployment"?: number, "kospi"?: number, "fxUsdKrw"?: number, "consumerConfidence"?: number, "businessConfidence"?: number, "housePriceYoY"?: number, "fiscalBalance"?: number },
  "social": { "birthRate"?: number, "suicideRate"?: number, "healthcareSatisfaction"?: number, "educationSatisfaction"?: number, "pensionTrust"?: number, "genderConflictIndex"?: number, "generationConflictIndex"?: number, "immigrationSentiment"?: number, "pressFreedomIndex"?: number },
  "security": { "northKoreaTension"?: number, "northKoreaProvocationRisk"?: number, "rokMilitaryReadiness"?: number, "usAllianceStrength"?: number, "cyberThreatLevel"?: number, "terrorThreatLevel"?: number, "defconLevel"?: number },
  "foreign": { "US"?: {"relation"?: number, "trust"?: number}, "CN"?: {...}, "JP"?: {...}, "NK"?: {...}, "RU"?: {...}, "EU"?: {...} },
  "notes": string
}

규칙:
- 모든 수치는 "변화량(delta)"이다. 절대값이 아니다.
- approval은 일반적으로 ±0.5~±3, 대형 사건은 ±5~±10.
- 경제 지표는 미세하게 (kospi ±5~±80, fxUsdKrw ±2~±20, 다른 지표 ±0.1~±1.5).
- 안보 지표는 0-100 범위, ±2~±15.
- 외교 관계는 ±2~±15.
- 한국 정치/경제/사회 맥락을 사실적으로 반영하라.`;

export function buildAdvisorSystemPrompt(s: GameState): string {
  return `당신은 대한민국 대통령실의 베테랑 비서실장이자 정무수석이다.
현재 대통령은 ${s.president.name} (${s.parties.find(p=>p.id===s.president.party)?.name}, 이념성향 ${s.president.ideology}).
취임일은 ${s.president.inauguratedAt}이며 오늘은 ${s.clock.currentDate}이다.

당신의 임무:
1) 대통령의 지시/질문에 한국 정치·경제·외교 전문가 수준으로 답변한다.
2) 한국 정치 현실(여소야대, 검찰개혁, 부동산, 북한, 한미동맹, 한일관계, 출산율, 세대갈등 등)을 사실적으로 반영한다.
3) 답변은 간결·실무적으로. 필요하면 옵션을 1·2·3로 정리해 제시한다. 짧을수록 좋다.
4) 대통령이 결정/지시를 내리면, 그 결정의 정치적·정책적 함의와 예상 반발/지지층을 분명히 설명한다.
5) 비판이 필요한 결정에는 솔직하게 우려를 제기한다. 예스맨이 되지 마라.
6) 한국어 존댓말 "대통령님" 호칭 사용.

현재 국정 상황 요약:
${summarizeState(s)}`;
}

export function buildEventSystemPrompt(s: GameState): string {
  return `당신은 대한민국 정치·사회·경제·외교 현실을 깊이 이해하는 시뮬레이션 이벤트 생성기다.
현재 게임 상황을 바탕으로, ${s.clock.currentDate} 기준으로 발생할 법한 사실적이고 구체적인 뉴스 이벤트를 생성한다.

규칙:
- 한국 고유명사(실제 도시, 부처, 기업, 정당 등)를 자연스럽게 사용하라.
- 너무 SF/판타지스럽지 않게, 현실 한국 뉴스 톤으로 작성하라.
- 카테고리는 ECONOMY, DIPLOMACY, SECURITY, SOCIAL, DISASTER, SCANDAL, POLITICS, CULTURE, TECH, HEALTH, NK 중 선택.
- severity: INFO < MINOR < MODERATE < MAJOR < CRITICAL.
- 일부 이벤트(MAJOR 이상)는 대통령이 선택할 수 있는 2~4개의 choices를 포함해야 한다.
- choices의 expectedEffects는 이 메시지 끝의 effects 스키마를 따른다.

현재 상황:
${summarizeState(s)}

${EFFECTS_SCHEMA_INSTRUCTION}`;
}

export function buildDecisionSystemPrompt(s: GameState): string {
  return `당신은 대한민국 대통령의 결정이 실제 한국 정치·경제·사회에 미치는 영향을 평가하는 분석 엔진이다.
대통령의 결정/지시 또는 발언을 받아, 그 결과로 발생할 즉각적/단기적 효과를 effects 객체로 산출한다.
그리고 뉴스 헤드라인·간단한 본문·언론 반응(헤드라인 2~3개)도 함께 생성한다.

현재 상황:
${summarizeState(s)}

${EFFECTS_SCHEMA_INSTRUCTION}

JSON 출력 형식(반드시 이 구조):
{
  "newsHeadline": "string",
  "newsBody": "string (2~4문장)",
  "mediaReactions": [
    { "outlet": "조선일보|한겨레|JTBC|...", "headline": "string" }
  ],
  "effects": { ... effects 스키마 ... },
  "advisorReply": "비서실장이 대통령께 보고하는 1~2문장 짧은 반응"
}`;
}
