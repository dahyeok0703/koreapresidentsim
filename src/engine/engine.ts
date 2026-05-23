import { openaiChat, openaiJSON } from '../api/openai';
import type { GameState, GameEvent, ChatMessage, PartialEffects, SnsPost, NewsArticle, WorldEvent, AIAction, Building, WeaponEntry, MilitaryUnit, MilitaryBase, Treaty } from '../types/game';
import { genId } from '../data/initialState';
import { applyEffects, advanceClock } from './effects';
import {
  buildAdvisorSystemPrompt,
  buildEventSystemPrompt,
  buildDecisionSystemPrompt,
  summarizeState,
  EFFECTS_SCHEMA_INSTRUCTION,
} from './prompts';

export async function askAdvisor(
  state: GameState,
  userInput: string,
  history: ChatMessage[],
): Promise<string> {
  const recent = history.slice(-12).map(m => ({
    role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.role === 'user' ? m.content : `[${m.speaker ?? '비서실장'}] ${m.content}`,
  }));
  return openaiChat({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 0.85,
    maxTokens: 600,
    messages: [
      { role: 'system', content: buildAdvisorSystemPrompt(state) },
      ...recent,
      { role: 'user', content: userInput },
    ],
  });
}

export interface DecisionResult {
  newsHeadline: string;
  newsBody: string;
  mediaReactions: { outlet: string; headline: string }[];
  effects: PartialEffects;
  advisorReply: string;
  actions?: AIAction[];      // 채팅 결정 → 게임 상태 직접 변경
}

export async function evaluateDecision(
  state: GameState,
  decision: string,
): Promise<DecisionResult> {
  return openaiJSON<DecisionResult>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 0.75,
    maxTokens: 3000,
    messages: [
      { role: 'system', content: buildDecisionSystemPrompt(state) },
      { role: 'user', content: `대통령의 결정/지시:\n"""${decision}"""\n\n위 결정의 결과를 JSON으로 산출하라. JSON은 반드시 완결된 형태여야 한다 (모든 괄호·따옴표 닫기).` },
    ],
  });
}

export interface GeneratedEventBatch {
  events: Array<{
    category: GameEvent['category'];
    severity: GameEvent['severity'];
    headline: string;
    body: string;
    source: string;
    choices?: Array<{
      label: string;
      description: string;
      ideology: number;
      expectedEffects: PartialEffects;
    }>;
    autoEffects?: PartialEffects;
  }>;
}

export async function generateEvents(state: GameState, count: number): Promise<GameEvent[]> {
  const data = await openaiJSON<GeneratedEventBatch>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 1.0,
    maxTokens: 2800,
    messages: [
      { role: 'system', content: buildEventSystemPrompt(state) },
      { role: 'user', content: `오늘 일자(${state.clock.currentDate}) 기준으로 ${count}개의 이벤트를 생성하라.
다양성을 위해 카테고리를 섞고, 최소 1개는 MAJOR 이상이거나 choices를 포함하면 좋다.

JSON: {"events":[{"category":"...","severity":"...","headline":"...","body":"...","source":"...","autoEffects":{...},"choices":[{"label":"...","description":"...","ideology":-100~100,"expectedEffects":{...}}]}]}` },
    ],
  });

  return (data.events ?? []).map(ev => ({
    id: genId('evt'),
    date: state.clock.currentDate,
    category: ev.category,
    severity: ev.severity,
    headline: ev.headline,
    body: ev.body,
    source: ev.source || 'AI 생성',
    choices: ev.choices?.map(c => ({
      id: genId('ch'),
      label: c.label,
      description: c.description,
      ideology: c.ideology ?? 0,
      expectedEffects: c.expectedEffects ?? {},
    })),
    effects: ev.autoEffects,
    resolved: !ev.choices || ev.choices.length === 0,
  }));
}

// ---- AI: SNS 포스트 생성 ----
export async function generateSnsPosts(state: GameState, count: number): Promise<SnsPost[]> {
  const platformIds = state.sns.platforms.map(p => p.id).join('|');
  const presIdeo = state.president.ideology;
  const presParty = state.parties.find(p => p.id === state.president.party)?.name ?? '';
  const presLabel = presIdeo < -30 ? '진보' : presIdeo > 30 ? '보수' : '중도';
  const platformBiasInfo = state.sns.platforms
    .map(p => `${p.id}: 평균성향 ${p.bias > 0 ? '+' : ''}${p.bias} (${p.bias > 20 ? '보수' : p.bias < -20 ? '진보' : '중도'}), 대통령 호감 ${p.presidentFavor > 0 ? '+' : ''}${p.presidentFavor}`)
    .join('\n');
  const data = await openaiJSON<{ posts: any[] }>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 1.0,
    maxTokens: 2500,
    messages: [
      { role: 'system', content: `당신은 한국 SNS·인터넷 커뮤니티 사용자들의 실제 게시물을 생성한다.

[현재 대통령]
${state.president.name} (${presParty}, 이념 ${presIdeo}, ${presLabel} 성향)

[플랫폼 정파 성향 — 매우 중요]
${platformBiasInfo}

[정파 반응 규칙 — 절대 준수]
- 대통령 이념과 플랫폼 평균성향이 같으면 → 지지·환영·옹호 (sentiment 양수)
- 대통령 이념과 플랫폼 평균성향이 반대면 → 비판·분노·조롱 (sentiment 음수)
- 차이가 클수록 강도가 커진다. (예: 클리앙(-50) + 보수 대통령(+55) = 강한 비판)
- 중립 플랫폼(±20 이내)은 사안별로 양분된 반응

[플랫폼별 톤 (반드시 반영)]
- X/트위터: 짧은 정치 코멘트, 해시태그 가능
- 인스타: 일상 + 짧은 메시지, 이모지·이미지 묘사 가능
- 페이스북: 중장년·보수 정서, 가족·생활 톤
- 유튜브: 영상 제목+썸네일 카피 톤
- 디시인사이드: 거친 반말, ㅋㅋ, ㅡㅡ, 짤방 묘사. 보수·반페미 정서
- 에펨코리아: 짧고 직설적, 20-30 남성 보수
- 클리앙: 존댓말·차분·논리적, IT·진보 IT 사용자 정서
- 카톡: 단톡방 짧은 메시지
- 네이버 카페: 맘카페·지역카페 정서, "~네요/~ㅠㅠ"
- 네이버 블로그: 장문 리뷰·정보 톤
- 스레드(Threads): 짧고 메타 감성

[금기] 사용자(대통령)가 실제로 입력하지 않은 발언·행동을 가정해서 게시물을 만들지 말 것.

현재 상황: ${summarizeState(state)}` },
      { role: 'user', content: `${state.clock.currentDate} 기준 시민들이 실제로 작성할 법한 게시물 ${count}개를 생성하라. 플랫폼별 정파 성향을 반드시 반영하라.

JSON: {"posts":[{"platform":"${platformIds}","author":"닉네임","handle":"@아이디|null","content":"게시물 본문","likes":숫자(0~10만),"reposts":숫자(0~1만),"comments":숫자(0~5만),"sentiment":-100~100}]}` },
    ],
  });

  return (data.posts ?? []).map(p => ({
    id: genId('post'),
    platform: p.platform,
    author: p.author,
    handle: p.handle || undefined,
    content: p.content,
    likes: Math.max(0, p.likes ?? 0),
    reposts: Math.max(0, p.reposts ?? 0),
    comments: Math.max(0, p.comments ?? 0),
    sentiment: Math.max(-100, Math.min(100, p.sentiment ?? 0)),
    timestamp: state.clock.currentDate,
  }));
}

// ---- AI: 국제 정세 이벤트 생성 (한국 외 국가들의 능동 행동) ----
export async function generateWorldEvents(state: GameState, count: number): Promise<WorldEvent[]> {
  const recentWorld = state.worldEvents.slice(0, 6).map(w => `- [${w.date}] ${w.headline}`).join('\n');
  const data = await openaiJSON<{ events: any[] }>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 1.05,
    maxTokens: 2000,
    messages: [
      { role: 'system', content: `당신은 국제정세 시뮬레이터다. 대한민국 외 다른 국가·국제기구·다국적 기업·전쟁 당사자의 능동적 행동을 묘사한다.

[규칙]
- 대한민국 대통령(${state.president.name})의 발언·행동은 절대 만들지 말 것. 한국은 수동적 관찰자로만.
- 다른 국가들이 자유롭게 능동적으로 움직인다. 트럼프의 새 정책, 시진핑의 발언, 푸틴의 군사행동, 이시바·이스라엘·이란·EU·NATO·OPEC+ 등.
- 진행 중 분쟁(러시아-우크라전, 가자, 대만해협, 미중통상, 북한도발)의 새로운 진전 묘사.
- 각 이벤트는 사실적·구체적. 인물명 정확히 사용.
- 한국에 직접 영향 없는 이벤트도 다수 포함 (브라질 대선·아프리카 쿠데타·러브라브 분쟁 등).

[기존 국제 이벤트 (중복 회피)]
${recentWorld || '(없음)'}

[현재 진행 분쟁]
${state.international.ongoingConflicts.map(c => `- ${c.name} (${c.status}, 강도 ${c.intensity})`).join('\n')}

[주요국 정상]
${state.countries.slice(0, 30).map(c => `${c.name}: ${c.leader}`).join(', ')}` },
      { role: 'user', content: `${state.clock.currentDate} 기준, 새로운 국제 정세 이벤트 ${count}개 생성.

JSON: {"events":[{"category":"DIPLOMACY|WAR|ECONOMY|DOMESTIC|TECH|DISASTER|LEADERSHIP|TREATY","headline":"한국 신문 국제면 헤드라인","body":"2~3문장 본문","involvedCountries":["US","CN","..."],"koreaImpact":"NONE|LOW|MED|HIGH"}]}` },
    ],
  });
  return (data.events ?? []).map(e => ({
    id: genId('we'),
    date: state.clock.currentDate,
    category: (e.category ?? 'DIPLOMACY') as any,
    headline: String(e.headline ?? ''),
    body: String(e.body ?? ''),
    involvedCountries: Array.isArray(e.involvedCountries) ? e.involvedCountries : [],
    koreaImpact: (e.koreaImpact ?? 'LOW') as any,
  }));
}

// ---- AI: 전쟁 / 군사작전 일일 보고 ----
export async function generateWarReport(state: GameState): Promise<{
  event: GameEvent;
  effects: PartialEffects;
} | null> {
  const mode = state.flags.gameMode;
  if (mode !== 'WAR' && mode !== 'OPERATION') return null;
  const isWar = mode === 'WAR';
  const wars = state.security.warEngagements;
  const warSummary = wars.length > 0
    ? wars.map(w => `- ${w.name} (${w.koreaRole}, 병력 ${w.troopsDeployed}, 월비용 ${w.costPerMonth}조)`).join('\n')
    : '(현재 등록된 분쟁 없음)';
  const opName = state.flags.opName as string | undefined;
  const opStartedAt = state.flags.opStartedAt as string | undefined;
  const dayN = opStartedAt
    ? Math.floor((new Date(state.clock.currentDate).getTime() - new Date(opStartedAt).getTime()) / 86400000) + 1
    : 1;

  const sys = `당신은 대한민국 합동참모본부 작전상황보고관이다. ${isWar ? '전쟁' : '특수 군사작전'} 상황의 오늘 일일 보고를 작성한다.

[현재 상황]
- 게임 모드: ${mode}
- 오늘 ${state.clock.currentDate}
${isWar ? `- 진행 중 분쟁:\n${warSummary}` : `- 작전명: ${opName} (${dayN}일차)`}

[규칙]
- 사실적·드라마틱한 작전 보고 톤 (간결, 시각·시간·지명 명시)
- 실제 발생할 법한 군사·외교·경제 충격을 효과로 산출
- 너무 격렬하지 않게 (매일 발생할 수 있는 수준)
- 한국군 피해·적 피해·민간 피해·국제 반응 균형

${EFFECTS_SCHEMA_INSTRUCTION}

JSON 출력:
{
  "headline": "오늘의 ${isWar ? '전쟁' : '작전'} 보고 헤드라인 (예: '동해 함대 1진 출항·北 잠수함 1척 격침')",
  "body": "3~5문장 작전 보고 (시간·장소·전과·피해·다음 작전)",
  "severity": "MINOR|MODERATE|MAJOR|CRITICAL",
  "effects": { ... }
}`;

  try {
    const data = await openaiJSON<any>({
      apiKey: state.settings.openaiApiKey,
      model: state.settings.model,
      temperature: 0.85,
      maxTokens: 1500,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `${state.clock.currentDate} 오늘의 ${isWar ? '전쟁' : '작전'} 일일 보고를 작성하라. JSON 완결.` },
      ],
    });
    return {
      event: {
        id: genId('evt'),
        date: state.clock.currentDate,
        category: isWar ? 'WAR' as const : 'SECURITY' as const,
        severity: (data.severity ?? 'MODERATE') as any,
        headline: `[${isWar ? '전쟁' : '작전'} ${dayN}일차] ${data.headline ?? ''}`,
        body: String(data.body ?? ''),
        source: '합동참모본부 작전본부',
        resolved: true,
        effects: data.effects,
      } as GameEvent,
      effects: data.effects ?? {},
    };
  } catch (err) {
    console.warn('전쟁/작전 보고 생성 실패', err);
    return null;
  }
}

// ---- AI: 외국 능동 보복 생성 ----
// 관계 악화·약점 분석 → 적대국이 한국에 가하는 능동 보복을 AI가 동적으로 생성
export async function generateRetaliations(state: GameState): Promise<{
  events: GameEvent[]; effectsAll: PartialEffects[];
}> {
  // 관계 -10 이하 적대·경쟁국 + 북한긴장 50+
  const hostile = state.countries.filter(c => c.relation < -10).slice(0, 10);
  const nkHigh = state.security.northKoreaTension > 50;
  if (hostile.length === 0 && !nkHigh) return { events: [], effectsAll: [] };

  // 한국 약점 분석
  const weaknesses: string[] = [];
  if (state.security.rokMilitaryReadiness < 70) weaknesses.push(`군 준비태세 ${state.security.rokMilitaryReadiness} (저하)`);
  if (state.security.northKoreaTension > 65) weaknesses.push(`북한긴장 ${state.security.northKoreaTension} (높음)`);
  if (state.security.usAllianceStrength < 70) weaknesses.push(`한미동맹 ${state.security.usAllianceStrength} (약화)`);
  if (state.economy.fxReservesUSD < 3500) weaknesses.push(`외환보유고 $${state.economy.fxReservesUSD}B (감소)`);
  if (state.economy.treasuryBalanceKRW < 20) weaknesses.push(`국고 ₩${state.economy.treasuryBalanceKRW}조 (부족)`);
  if (state.economy.kospi < 2500) weaknesses.push(`코스피 ${state.economy.kospi} (침체)`);
  if (state.approval.overall < 35) weaknesses.push(`지지율 ${state.approval.overall}% (낮음)`);

  const hostileInfo = hostile.map(c =>
    `- ${c.id} ${c.name}: 관계 ${c.relation}, 신뢰 ${c.trustLevel}, 정상 ${c.leader}, ${c.alliance}, 교역 $${c.tradeVolumeUSD}억`,
  ).join('\n');

  const sys = `당신은 국제정세 시뮬레이터다. 대한민국과 관계가 악화된 국가들이 한국의 약점을 노려
가하는 능동적·현실적 보복 행동을 1~3개 생성한다.

[규칙]
- 사용자(한국 대통령)가 한 행동을 가정하지 말 것. 외국이 일방적으로 가하는 행동만.
- 한국의 약점(군사 약체·외교 고립·경제 침체)을 명시적으로 노리는 행동.
- 사실적인 한국 외교·안보 패턴 반영:
  · 중국: 갈륨·게르마늄·요소수 통제, 한한령, 어선 나포, 단체관광 비자 중단
  · 일본: 후쿠시마 추가 방류, 반도체 소재 수출규제, 독도 영해 침범, 강제동원 부정
  · 미국: 자동차/철강/반도체 관세, 방위비 인상 압박, IRA 보조금 차별
  · 북한: ICBM 발사, 오물풍선, 무인기 침투, NLL 도발, 사이버 공격
  · 러시아: 사이버 공격, 북한에 무기·기술 이전, 비우호국 제재
  · 이란: 호르무즈 봉쇄, 한국 선박 억류
- 각 보복은 분명한 효과(effects)를 가져야 함.
- 보복 규모는 관계 악화도에 비례. 단 너무 과도하지 않게.

[현재 한국 약점]
${weaknesses.length ? weaknesses.join('\n') : '특별한 약점 없음 (보복 규모 작게)'}

[적대·경쟁국 현황]
${hostileInfo}
${nkHigh ? `\n[북한] 긴장도 ${state.security.northKoreaTension}, 핵 추정 ${state.security.northKoreaNukes}기` : ''}

[현재 상황 요약]
${summarizeState(state)}

${EFFECTS_SCHEMA_INSTRUCTION}

JSON 출력:
{
  "retaliations": [
    {
      "sourceCountryId": "CN|JP|US|NK|RU|IR|...",
      "category": "ECONOMY|DIPLOMACY|SECURITY|NK|MEDIA|TECH",
      "severity": "MINOR|MODERATE|MAJOR|CRITICAL",
      "headline": "한국 신문 헤드라인 톤",
      "body": "2~3문장 본문 (왜 지금 시점에 보복하는지 약점 명시)",
      "effects": { ... effects 스키마 ... }
    }
  ]
}`;

  try {
    const data = await openaiJSON<{ retaliations: any[] }>({
      apiKey: state.settings.openaiApiKey,
      model: state.settings.model,
      temperature: 0.95,
      maxTokens: 2200,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `${state.clock.currentDate} 기준, 위 적대국들이 한국에 가할 법한 보복 1~3개를 생성하라. JSON은 반드시 완결.` },
      ],
    });
    const list = data.retaliations ?? [];
    const events: GameEvent[] = list.map(r => {
      const sourceCountry = state.countries.find(c => c.id === r.sourceCountryId);
      const sourceName = sourceCountry?.name ?? r.sourceCountryId ?? '?';
      return {
        id: genId('evt'),
        date: state.clock.currentDate,
        category: (r.category ?? 'DIPLOMACY') as any,
        severity: (r.severity ?? 'MAJOR') as any,
        headline: `[${sourceName}의 보복] ${r.headline ?? ''}`,
        body: String(r.body ?? ''),
        source: r.sourceCountryId === 'NK' ? '합동참모본부 / 국정원' : '청와대 국가안보실 / 외교부',
        resolved: true,
        effects: r.effects,
      };
    });
    const effectsAll = list.map(r => r.effects).filter(Boolean) as PartialEffects[];
    return { events, effectsAll };
  } catch (err) {
    console.warn('보복 생성 실패', err);
    return { events: [], effectsAll: [] };
  }
}

// ---- AI: 뉴스 기사 생성 ----
export async function generateArticles(state: GameState, count: number): Promise<NewsArticle[]> {
  const mediaIds = state.media.map(m => m.id).join('|');
  const presIdeo = state.president.ideology;
  const presParty = state.parties.find(p => p.id === state.president.party)?.name ?? '';
  const presLabel = presIdeo < -30 ? '진보' : presIdeo > 30 ? '보수' : '중도';
  const mediaBiasInfo = state.media
    .map(m => `${m.id}(${m.name}): bias ${m.bias > 0 ? '+' : ''}${m.bias} (${m.bias > 30 ? '보수' : m.bias < -30 ? '진보' : '중도'}), 대통령 호의 ${m.favorToPresident > 0 ? '+' : ''}${m.favorToPresident}`)
    .join('\n');
  const data = await openaiJSON<{ articles: any[] }>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 0.9,
    maxTokens: 2500,
    messages: [
      { role: 'system', content: `당신은 한국 주요 언론사 기자다. 각 매체의 정치 성향에 따라 같은 사안도 다르게 프레임하라.

[현재 대통령]
${state.president.name} (${presParty}, 이념 ${presIdeo}, ${presLabel})

[매체 정파 성향 — 매우 중요]
${mediaBiasInfo}

[프레이밍 규칙 — 절대 준수]
- 매체 성향이 대통령 이념과 같으면 → 우호적·옹호 톤 (정책의 명분·성과 강조)
- 매체 성향이 대통령 이념과 반대면 → 비판적·견제 톤 (우려·부작용·반발 강조)
- 차이가 클수록 톤 강도 ↑ (예: 조선일보(+75) + 진보 대통령(-35) = 강한 비판)
- 중도 매체(±20)는 균형 보도
- 통신사(연합/뉴시스/뉴스1)는 가장 중립

[매체별 톤 가이드]
- 조선/동아/TV조선/채널A: 보수. 안보·법치·시장 강조, 진보 정권엔 "포퓰리즘·법치 흔들기" 우려
- 중앙/MK: 보수 기울인 중도. 경제·기업 시각
- 한겨레/경향/오마이뉴스: 진보. 개혁·노동·인권 강조, 보수 정권엔 "역행·후퇴" 비판
- JTBC: 약진보 종편, 심층 보도
- KBS/SBS/YTN: 중도 사실 보도
- MBC: 약진보, 정부 비판적
- 매경/이데일리: 경제 보수, 시장 친화
- 연합/뉴시스/뉴스1: 통신 중립

[금기] 사용자(대통령)가 실제로 입력하지 않은 발언·행동을 기사화하지 말 것.
       게임 상태(events·정책)에 없는 정책 발표를 기정 사실로 만들지 말 것.

현재: ${summarizeState(state)}` },
      { role: 'user', content: `${state.clock.currentDate} 기준 ${count}개 기사를 작성하라. 매체별 정파 톤을 강하게 반영하라.

JSON: {"articles":[{"outlet":"${mediaIds}","headline":"헤드라인","lead":"리드 1줄","body":"본문 2~3문장","category":"ECONOMY|DIPLOMACY|SECURITY|SOCIAL|DISASTER|SCANDAL|POLITICS|CULTURE|TECH|HEALTH|NK|LEGAL|INTERNATIONAL|MEDIA","bias":-100~100}]}` },
    ],
  });

  return (data.articles ?? []).map(a => ({
    id: genId('art'),
    outlet: a.outlet,
    headline: a.headline,
    lead: a.lead,
    body: a.body,
    date: state.clock.currentDate,
    category: a.category ?? 'POLITICS',
    bias: a.bias ?? 0,
  }));
}

export async function resolveEventChoice(
  state: GameState,
  event: GameEvent,
  choiceLabel: string,
  expected: PartialEffects,
): Promise<DecisionResult> {
  return openaiJSON<DecisionResult>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 0.7,
    maxTokens: 1500,
    messages: [
      { role: 'system', content: buildDecisionSystemPrompt(state) },
      { role: 'user', content: `이벤트: ${event.headline}\n본문: ${event.body}\n\n대통령이 선택한 대응: "${choiceLabel}"\n사전 예상 효과: ${JSON.stringify(expected)}\n\n실제 결과를 JSON으로 산출하라.` },
    ],
  });
}

// ---- AI 액션 처리기 ----
export function applyAIActions(state: GameState, actions: AIAction[] | undefined): { state: GameState; log: string[] } {
  if (!actions || actions.length === 0) return { state, log: [] };
  let s = state;
  const log: string[] = [];

  const VALID_REGIONS = new Set(['SEOUL','BUSAN','DAEGU','INCHEON','GWANGJU','DAEJEON','ULSAN','SEJONG','GYEONGGI','GANGWON','CHUNGBUK','CHUNGNAM','JEONBUK','JEONNAM','GYEONGBUK','GYEONGNAM','JEJU','OFFSHORE','OVERSEAS']);

  for (const act of actions) {
    try {
      switch (act.type) {
        case 'ADD_BUILDING': {
          const p = act.params || {};
          const region = (p.region && VALID_REGIONS.has(p.region)) ? p.region : 'SEOUL';
          const today = s.clock.currentDate;
          // 카테고리별 기본 공기 (일)
          const DEFAULT_DAYS: Record<string, number> = {
            '주거': 1095,    // 3년
            '상업': 730,     // 2년
            '공업': 540,     // 1.5년
            '교통': 1825,    // 5년
            '에너지': 2920,  // 8년
            '수자원': 2555,  // 7년
            '국방': 730,     // 2년
            '교육': 365,     // 1년
            '의료': 730,     // 2년
            '문화': 730,     // 2년
            '연구': 1095,    // 3년
            '농수산': 365,
            '관광': 730,
            '해양': 1095,
            '우주': 2190,    // 6년
            '기타': 365,
          };
          const category = (p.category || '기타') as any;
          const daysToBuild = Number(p.constructionDays) > 0
            ? Number(p.constructionDays)
            : (DEFAULT_DAYS[category] ?? 365);
          // p.expectedCompletion 우선
          let expectedCompletion: string;
          if (p.expectedCompletion && /^\d{4}-\d{2}-\d{2}$/.test(String(p.expectedCompletion))) {
            expectedCompletion = String(p.expectedCompletion);
          } else {
            const d = new Date(today);
            d.setDate(d.getDate() + daysToBuild);
            expectedCompletion = d.toISOString().slice(0, 10);
          }
          const b: Building = {
            id: genId('bld'),
            name: String(p.name || '신규 건축물'),
            category,
            region,
            location: String(p.location || ''),
            builtYear: undefined,         // 완공 시 설정
            size: p.size,
            capacity: p.capacity,
            status: 'CONSTRUCTING',
            desc: p.desc,
            isLandmark: !!p.isLandmark,
            startedAt: today,
            expectedCompletion,
          };
          s = { ...s, buildings: [b, ...s.buildings] };
          log.push(`🏗️ 건축 착공: ${b.name} — 완공 예정 ${expectedCompletion} (${daysToBuild}일)`);
          break;
        }
        case 'REMOVE_BUILDING': {
          const m = String(act.params?.nameMatch || '');
          if (!m) break;
          const before = s.buildings.length;
          s = { ...s, buildings: s.buildings.filter(b => !b.name.includes(m)) };
          log.push(`🗑️ 건축물 ${before - s.buildings.length}개 삭제: "${m}" 매칭`);
          break;
        }
        case 'DECOMMISSION_BUILDING': {
          const m = String(act.params?.nameMatch || '');
          if (!m) break;
          let n = 0;
          s = { ...s, buildings: s.buildings.map(b => {
            if (b.name.includes(m) && b.status === 'OPERATING') { n++; return { ...b, status: 'DECOMMISSIONED' as const }; }
            return b;
          }) };
          log.push(`⚠️ 건축물 ${n}개 해체 처리: "${m}" 매칭`);
          break;
        }
        case 'ADD_WEAPON': {
          const p = act.params || {};
          // 무기 도입은 단계별로 시간이 걸린다. 카테고리별 기본 도입 공기 (일)
          const WEAPON_DAYS: Record<string, number> = {
            '전차': 900, '장갑차': 720, '자주포': 720, '견인포': 365, '다연장': 540,
            '전투기': 1825, '공격기': 1095, '수송기': 1095, '헬기': 730,
            '구축함': 2920, '잠수함': 3650, '호위함': 2190,
            '미사일': 540, '방공': 1095, '레이더': 730, '드론': 365, '기타': 365,
          };
          const cat = (p.category || '기타') as any;
          const today = s.clock.currentDate;
          const totalDays = Number(p.totalDays) > 0
            ? Number(p.totalDays)
            : (WEAPON_DAYS[cat] ?? 730);
          const expectedAt = (() => {
            const d = new Date(today);
            d.setDate(d.getDate() + totalDays);
            return d.toISOString().slice(0, 10);
          })();
          const w: WeaponEntry = {
            id: genId('wpn'),
            category: cat,
            name: String(p.name || '신규 무기'),
            count: 0,                                  // 인도 단계부터 점진적 증가
            contractedCount: Math.max(1, Number(p.count) || 1),
            origin: String(p.origin || '국산'),
            status: '계약',
            procurementStartedAt: today,
            expectedOperatingAt: expectedAt,
            notes: p.notes,
          };
          s = { ...s, security: { ...s.security, weapons: [w, ...s.security.weapons] } };
          log.push(`📋 무기 계약 체결: ${w.name} ${w.contractedCount}기 — 전력화 ${expectedAt} (${totalDays}일 후)`);
          break;
        }
        case 'REMOVE_WEAPON': {
          const m = String(act.params?.nameMatch || '');
          if (!m) break;
          const before = s.security.weapons.length;
          s = { ...s, security: { ...s.security, weapons: s.security.weapons.filter(w => !w.name.includes(m)) } };
          log.push(`🗑️ 무기 ${before - s.security.weapons.length}종 폐기: "${m}"`);
          break;
        }
        case 'ADJUST_WEAPON_COUNT': {
          const m = String(act.params?.nameMatch || '');
          const delta = Number(act.params?.delta) || 0;
          if (!m || !delta) break;
          let n = 0;
          s = { ...s, security: { ...s.security, weapons: s.security.weapons.map(w => {
            if (w.name.includes(m)) { n++; return { ...w, count: Math.max(0, w.count + delta) }; }
            return w;
          }) } };
          log.push(`📊 무기 수량 ${delta > 0 ? '+' : ''}${delta}: "${m}" ${n}종`);
          break;
        }
        case 'ADD_UNIT': {
          const p = act.params || {};
          const u: MilitaryUnit = {
            id: genId('unit'),
            name: String(p.name || '신규 부대'),
            echelon: (p.echelon || '여단') as any,
            service: (p.service || '육군') as any,
            hq: String(p.hq || ''),
            personnel: Number(p.personnel) || 1000,
            notes: p.notes,
          };
          s = { ...s, security: { ...s.security, units: [u, ...s.security.units] } };
          log.push(`✅ 부대 창설: ${u.name}`);
          break;
        }
        case 'REMOVE_UNIT': {
          const m = String(act.params?.nameMatch || '');
          if (!m) break;
          const before = s.security.units.length;
          s = { ...s, security: { ...s.security, units: s.security.units.filter(u => !u.name.includes(m)) } };
          log.push(`🗑️ 부대 ${before - s.security.units.length}개 해체: "${m}"`);
          break;
        }
        case 'ADD_BASE': {
          const p = act.params || {};
          const region = (p.region && VALID_REGIONS.has(p.region)) ? p.region : 'SEOUL';
          const b: MilitaryBase = {
            id: genId('base'),
            name: String(p.name || '신규 기지'),
            type: (p.type || '합동') as any,
            region,
            location: String(p.location || ''),
            personnel: Number(p.personnel) || 1000,
            desc: p.desc,
          };
          s = { ...s, security: { ...s.security, bases: [b, ...s.security.bases] } };
          log.push(`✅ 군사기지 신설: ${b.name}`);
          break;
        }
        case 'REMOVE_BASE': {
          const m = String(act.params?.nameMatch || '');
          if (!m) break;
          const before = s.security.bases.length;
          s = { ...s, security: { ...s.security, bases: s.security.bases.filter(b => !b.name.includes(m)) } };
          log.push(`🗑️ 군사기지 ${before - s.security.bases.length}개 폐쇄: "${m}"`);
          break;
        }
        case 'SIGN_TREATY': {
          const p = act.params || {};
          const t: Treaty = {
            id: genId('treaty'),
            signedAt: s.clock.currentDate,
            warId: p.warId,
            name: String(p.name || '평화조약'),
            parties: Array.isArray(p.parties) ? p.parties : [],
            victor: (p.victor || 'STALEMATE') as any,
            summary: String(p.summary || ''),
            terms: {
              ceasefire: p.ceasefire !== false,
              reparationsKRW: Number(p.reparationsKRW) || 0,
              territorialCession: Array.isArray(p.territorialCession) ? p.territorialCession : undefined,
              newCountries: Array.isArray(p.newCountries) ? p.newCountries : undefined,
              annexations: Array.isArray(p.annexations) ? p.annexations : undefined,
              alliances: p.alliances,
              sanctionsLifted: p.sanctionsLifted,
              notes: p.notes,
            },
          };
          // 배상금 → 한국 국고
          let next = s;
          if (t.terms.reparationsKRW && t.terms.reparationsKRW !== 0) {
            next = { ...next, economy: { ...next.economy, treasuryBalanceKRW: Math.round((next.economy.treasuryBalanceKRW + t.terms.reparationsKRW) * 100) / 100 } };
            log.push(`💰 배상금 ${t.terms.reparationsKRW > 0 ? '수령' : '지불'} ${Math.abs(t.terms.reparationsKRW)}조원`);
          }
          // 영토 할양: 해당국 면적·인구·GDP 일부 이전
          if (t.terms.territorialCession) {
            for (const c of t.terms.territorialCession) {
              next = {
                ...next,
                countries: next.countries.map(cn => {
                  if (cn.id === c.fromCountryId) {
                    const factor = 1 - c.sizePercent / 100;
                    return {
                      ...cn,
                      area: Math.round(cn.area * factor),
                      population: Math.round(cn.population * factor),
                      gdpUSD: Math.round(cn.gdpUSD * factor * 10) / 10,
                      recentEvents: [`${c.description} 할양`, ...cn.recentEvents].slice(0, 5),
                    };
                  }
                  if (cn.id === c.toCountryId) {
                    const factor = 1 + c.sizePercent / 100 * 0.3;
                    return {
                      ...cn,
                      area: Math.round(cn.area * factor),
                      recentEvents: [`${c.description} 편입`, ...cn.recentEvents].slice(0, 5),
                    };
                  }
                  return cn;
                }),
              };
              log.push(`🗺️ 영토 할양: ${c.fromCountryId} → ${c.toCountryId} (${c.description}, ${c.sizePercent}%)`);
            }
          }
          // 신규 독립국 추가
          if (t.terms.newCountries) {
            for (const nc of t.terms.newCountries) {
              const parent = next.countries.find(c => c.id === nc.fromCountryId);
              const newC = {
                id: 'NEW_' + genId('co').slice(-6).toUpperCase(),
                name: nc.name, flag: '🏳️',
                continent: parent?.continent ?? 'ASIA' as const,
                capital: nc.capital,
                population: nc.population,
                area: parent ? Math.round(parent.area * 0.1) : 100,
                gdpUSD: parent ? Math.round(parent.gdpUSD * 0.1 * 10) / 10 : 10,
                gdpPerCapita: 5000,
                leader: '과도 정부 수반', leaderTitle: '대통령', government: '신생 공화국',
                nuclear: false, unscPermanent: false,
                hasEmbassyInKorea: false, hasEmbassyInCountry: false,
                alliance: 'NEUTRAL' as const,
                relation: nc.initialRelationKorea, trustLevel: 50,
                tradeVolumeUSD: 0, hasFTA: false, visaFreeKorean: false, koreanResidents: 0,
                treaties: ['신생국 독립 선언'], recentEvents: [`${nc.fromCountryId}로부터 분리독립`],
              };
              next = {
                ...next,
                countries: [
                  newC,
                  ...next.countries.map(c => c.id === nc.fromCountryId
                    ? { ...c, area: Math.round(c.area * 0.9), population: Math.round(c.population * 0.85) }
                    : c),
                ],
              };
              log.push(`🆕 신생 독립국: ${nc.name} (${nc.fromCountryId}으로부터)`);
            }
          }
          // 완전 합병
          if (t.terms.annexations) {
            for (const a of t.terms.annexations) {
              const absorbed = next.countries.find(c => c.id === a.absorbedId);
              if (absorbed) {
                next = {
                  ...next,
                  countries: next.countries
                    .filter(c => c.id !== a.absorbedId)
                    .map(c => c.id === a.absorberId ? {
                      ...c,
                      population: c.population + absorbed.population,
                      area: c.area + absorbed.area,
                      gdpUSD: Math.round((c.gdpUSD + absorbed.gdpUSD) * 10) / 10,
                      recentEvents: [`${absorbed.name} 합병`, ...c.recentEvents].slice(0, 5),
                    } : c),
                };
                log.push(`🏴 완전 합병: ${a.absorberId} ← ${a.absorbedId}`);
              }
            }
          }
          // 동맹 체결
          if (t.terms.alliances) {
            next = {
              ...next,
              countries: next.countries.map(c =>
                t.terms.alliances!.includes(c.id)
                  ? { ...c, alliance: 'ALLY' as const, relation: Math.min(100, c.relation + 15), trustLevel: Math.min(100, c.trustLevel + 10) }
                  : c),
            };
            log.push(`🤝 신규 동맹: ${t.terms.alliances.join(', ')}`);
          }
          // 전쟁 종결 처리
          if (t.warId) {
            next = {
              ...next,
              security: {
                ...next.security,
                warEngagements: next.security.warEngagements.filter(w => w.id !== t.warId),
              },
            };
          }
          next = { ...next, treaties: [t, ...next.treaties] };
          s = next;
          log.push(`📜 조약 체결: ${t.name}`);
          break;
        }
        case 'BEGIN_WAR': {
          const p = act.params || {};
          const warName = String(p.name || '신규 분쟁');
          const role = (p.koreaRole || 'DIPLOMATIC') as any;
          // 전면 군사 개입(COMBAT)이면 게임 모드를 WAR로 전환
          const enterWarMode = role === 'COMBAT' || /전면전|전쟁|침공/.test(warName);
          s = {
            ...s,
            security: {
              ...s.security,
              warEngagements: [{
                id: genId('war'),
                name: warName,
                parties: p.parties || [],
                koreaRole: role,
                startDate: s.clock.currentDate,
                troopsDeployed: Number(p.troops) || 0,
                costPerMonth: Number(p.costPerMonth) || 0.5,
                notes: String(p.notes || ''),
              }, ...s.security.warEngagements],
            },
            flags: enterWarMode
              ? { ...s.flags, gameMode: 'WAR', warName, warStartedAt: s.clock.currentDate }
              : s.flags,
          };
          log.push(`⚔️ 전쟁/분쟁 개시: ${warName}${enterWarMode ? ' (전쟁 모드 진입 — 하루씩만 진행 가능)' : ''}`);
          break;
        }
        case 'END_WAR': {
          const id = String(act.params?.warId || '');
          if (!id) break;
          s = { ...s, security: { ...s.security, warEngagements: s.security.warEngagements.filter(w => w.id !== id) } };
          log.push(`🕊️ 분쟁 종결: ${id}`);
          break;
        }
        case 'CHANGE_LEADER': {
          const p = act.params || {};
          s = {
            ...s,
            countries: s.countries.map(c => c.id === p.countryId
              ? { ...c, leader: String(p.newLeader || c.leader), recentEvents: [`지도자 교체: ${p.newLeader}`, ...c.recentEvents].slice(0, 5) }
              : c),
          };
          log.push(`👤 지도자 교체: ${p.countryId} → ${p.newLeader}`);
          break;
        }
        case 'ADD_TREATY': {
          // 평시 외교 조약/협정 등록 (전쟁 X)
          const p = act.params || {};
          const cid = String(p.countryId || '');
          const name = String(p.name || '');
          if (!cid || !name) break;
          s = {
            ...s,
            countries: s.countries.map(c => c.id === cid
              ? { ...c, treaties: [name, ...c.treaties].slice(0, 12), recentEvents: [`${name} 체결`, ...c.recentEvents].slice(0, 5) }
              : c),
          };
          log.push(`📜 조약/협정 등록: ${cid} — ${name}`);
          break;
        }
        case 'BEGIN_SPECIAL_OP': {
          const p = act.params || {};
          const opName = String(p.name || '특수작전');
          const target = String(p.target || '미상');
          const opType = String(p.opType || '정밀타격');
          const targetCountry = String(p.targetCountryId || '');
          if (targetCountry) {
            s = {
              ...s,
              countries: s.countries.map(c => c.id === targetCountry
                ? { ...c, relation: Math.max(-100, c.relation - 8), recentEvents: [`${opName} 피격`, ...c.recentEvents].slice(0, 5) }
                : c),
            };
          }
          s = {
            ...s,
            // OPERATION 모드 진입 (30일 후 자동 종료)
            flags: { ...s.flags, gameMode: 'OPERATION', opName, opStartedAt: s.clock.currentDate },
            events: [{
              id: genId('evt'),
              date: s.clock.currentDate,
              category: 'SECURITY' as const,
              severity: 'MAJOR' as const,
              headline: `[군사작전 개시] ${opName} — ${target} 타격`,
              body: `${opType} 형식으로 ${target}에 대한 ${opName}이 실행됐다. ${p.notes ?? ''} 작전 종결 시까지 게임은 1일 단위 진행만 허용된다.`,
              source: '국방부 / 합참',
              resolved: true,
            } as GameEvent, ...s.events].slice(0, 200),
          };
          log.push(`💥 군사작전 개시: ${opName} (작전 모드 진입 — 하루씩만 진행)`);
          break;
        }
        case 'CREATE_GOV_BODY': {
          const p = act.params || {};
          const id = String(p.id || ('CUSTOM_' + genId('gb').slice(-6).toUpperCase()));
          if (s.adminBodies.find(b => b.id === id)) break;
          s = {
            ...s,
            adminBodies: [
              ...s.adminBodies,
              {
                id: id as any,
                name: String(p.name || '신규 기관'),
                category: (p.category || '청') as any,
                parentId: p.parentId,
                ideologyImportance: Number(p.ideologyImportance) || 30,
              },
            ],
          };
          log.push(`🏢 정부기관 신설: ${p.name}`);
          break;
        }
        case 'DISSOLVE_GOV_BODY': {
          const p = act.params || {};
          const id = String(p.id || '');
          const nameMatch = String(p.nameMatch || '');
          let removed = 0;
          s = {
            ...s,
            adminBodies: s.adminBodies.filter(b => {
              const hit = (id && b.id === id) || (nameMatch && b.name.includes(nameMatch));
              if (hit) removed++;
              return !hit;
            }),
            cabinet: s.cabinet.filter(o => {
              const hit = (id && o.ministry === id) || (nameMatch && o.ministryName.includes(nameMatch));
              return !hit;
            }),
          };
          log.push(`🗑️ 정부기관 해체: ${removed}개`);
          break;
        }
        case 'ADD_LAW': {
          const p = act.params || {};
          const newLaw = {
            id: 'law_custom_' + genId('l').slice(-6),
            name: String(p.name || '신규 법률'),
            abbrev: p.abbrev,
            category: (p.category || '기타') as any,
            enacted: Number(p.enacted) || new Date(s.clock.currentDate).getFullYear(),
            lastAmended: Number(p.lastAmended) || new Date(s.clock.currentDate).getFullYear(),
            desc: String(p.desc || ''),
            status: 'ACTIVE' as const,
            controversyLevel: Number(p.controversyLevel) || 40,
          };
          s = { ...s, laws: [newLaw, ...s.laws] };
          log.push(`📘 법률 신규 제정: ${newLaw.name}`);
          break;
        }
        case 'REMOVE_LAW': {
          const nameMatch = String(act.params?.nameMatch || '');
          if (!nameMatch) break;
          const before = s.laws.length;
          s = { ...s, laws: s.laws.map(l => l.name.includes(nameMatch)
            ? { ...l, status: 'REPEALED' as const, lastAmended: new Date(s.clock.currentDate).getFullYear() }
            : l) };
          log.push(`📕 법률 폐지: "${nameMatch}" 매칭`);
          break;
        }
        case 'ADD_SUBREGION': {
          const p = act.params || {};
          const region = String(p.parentRegion || 'SEOUL');
          const sr: any = {
            id: genId('sub'),
            name: String(p.name || '신규 시군구'),
            parentRegion: region,
            type: (p.type || '시') as any,
            population: Number(p.population) || 5,
            area: Number(p.area) || 100,
            mayor: String(p.mayor || '신임 단체장'),
            mayorParty: (p.mayorParty || 'IND') as any,
            industries: Array.isArray(p.industries) ? p.industries : [],
            speciality: p.speciality,
            notable: p.notable,
          };
          s = { ...s, subRegions: [sr, ...s.subRegions] };
          log.push(`🆕 시군구 신설: ${sr.name} (${region})`);
          break;
        }
        case 'REMOVE_SUBREGION': {
          const nameMatch = String(act.params?.nameMatch || '');
          if (!nameMatch) break;
          const before = s.subRegions.length;
          s = { ...s, subRegions: s.subRegions.filter(r => !r.name.includes(nameMatch)) };
          log.push(`🗑️ 시군구 ${before - s.subRegions.length}개 폐지: "${nameMatch}"`);
          break;
        }
        case 'SPLIT_SUBREGION': {
          const p = act.params || {};
          const sourceMatch = String(p.sourceMatch || '');
          const newName1 = String(p.newName1 || '');
          const newName2 = String(p.newName2 || '');
          const ratio = Math.max(0.1, Math.min(0.9, Number(p.splitRatio) || 0.5));
          if (!sourceMatch || !newName1 || !newName2) break;
          const source = s.subRegions.find(r => r.name.includes(sourceMatch));
          if (!source) { log.push(`⚠️ 분할 대상 시군구를 찾지 못함: ${sourceMatch}`); break; }
          const part1: any = { ...source, id: genId('sub'), name: newName1,
            population: Math.round(source.population * ratio * 10) / 10,
            area: Math.round(source.area * ratio) };
          const part2: any = { ...source, id: genId('sub'), name: newName2,
            population: Math.round(source.population * (1 - ratio) * 10) / 10,
            area: Math.round(source.area * (1 - ratio)) };
          s = { ...s, subRegions: [part1, part2, ...s.subRegions.filter(r => r.id !== source.id)] };
          log.push(`✂️ 시군구 분할: ${source.name} → ${newName1} + ${newName2}`);
          break;
        }
        case 'MERGE_SUBREGION': {
          const p = act.params || {};
          const nameMatches: string[] = Array.isArray(p.nameMatches) ? p.nameMatches : [];
          const newName = String(p.newName || '');
          if (nameMatches.length < 2 || !newName) break;
          const targets = s.subRegions.filter(r => nameMatches.some(m => r.name.includes(m)));
          if (targets.length < 2) { log.push(`⚠️ 통합 대상이 부족함: ${nameMatches.join(', ')}`); break; }
          const merged: any = {
            ...targets[0], id: genId('sub'), name: newName,
            population: targets.reduce((a, t) => a + t.population, 0),
            area: targets.reduce((a, t) => a + t.area, 0),
            industries: Array.from(new Set(targets.flatMap(t => t.industries))),
          };
          s = { ...s, subRegions: [merged, ...s.subRegions.filter(r => !targets.includes(r))] };
          log.push(`🔗 시군구 통합: ${targets.map(t => t.name).join(' + ')} → ${newName}`);
          break;
        }
        case 'AMEND_LAW': {
          const p = act.params || {};
          const nameMatch = String(p.nameMatch || '');
          if (!nameMatch) break;
          let n = 0;
          s = { ...s, laws: s.laws.map(l => {
            if (l.name.includes(nameMatch)) {
              n++;
              return {
                ...l,
                status: 'AMENDED' as const,
                lastAmended: new Date(s.clock.currentDate).getFullYear(),
                desc: p.newDesc ? String(p.newDesc) : l.desc,
                controversyLevel: p.newControversy !== undefined ? Number(p.newControversy) : l.controversyLevel,
              };
            }
            return l;
          }) };
          log.push(`📝 법률 개정: ${n}건 "${nameMatch}"`);
          break;
        }
      }
    } catch (err) {
      log.push(`⚠️ 액션 실행 실패 (${act.type}): ${(err as Error).message}`);
    }
  }
  return { state: s, log };
}

export function applyDecisionResult(
  state: GameState,
  result: DecisionResult,
  contextLabel?: string,
): GameState {
  let s = applyEffects(state, result.effects);

  // AI 액션 실행
  const { state: afterActions, log: actionLog } = applyAIActions(s, result.actions);
  s = afterActions;

  const evt: GameEvent = {
    id: genId('evt'),
    date: s.clock.currentDate,
    category: 'POLITICS',
    severity: 'MODERATE',
    headline: result.newsHeadline,
    body: result.newsBody,
    source: '청와대 출입기자단',
    resolved: true,
    effects: result.effects,
  };

  // 언론 반응을 기사로 추가
  const newArticles: NewsArticle[] = (result.mediaReactions ?? []).map(r => ({
    id: genId('art'),
    outlet: r.outlet,
    headline: r.headline,
    lead: `${r.outlet} 보도 - ${result.newsHeadline} 관련`,
    date: s.clock.currentDate,
    category: 'POLITICS' as const,
    bias: 0,
  }));

  s = {
    ...s,
    events: [evt, ...s.events].slice(0, 200),
    articles: [...newArticles, ...s.articles].slice(0, 150),
  };

  if (result.advisorReply) {
    const msg: ChatMessage = {
      id: genId('msg'),
      role: 'advisor',
      speaker: contextLabel ? `비서실장 (${contextLabel})` : '비서실장',
      content: result.advisorReply,
      timestamp: s.clock.currentDate,
      realTimestamp: new Date().toISOString(),
      contextType: 'BRIEFING',
    };
    s = { ...s, chat: [...s.chat, msg].slice(-300) };
  }

  // 효과 변화 요약 + 액션 로그를 시스템 메시지로 표시
  const summaryParts: string[] = [];
  const eff = result.effects ?? {};
  if (typeof eff.approval === 'number' && eff.approval !== 0) summaryParts.push(`지지율 ${eff.approval > 0 ? '+' : ''}${eff.approval}p`);
  if (eff.economy?.kospi !== undefined) summaryParts.push(`코스피 ${eff.economy.kospi > 0 ? '+' : ''}${eff.economy.kospi}`);
  if (eff.economy?.fxUsdKrw !== undefined) summaryParts.push(`환율 ${eff.economy.fxUsdKrw > 0 ? '+' : ''}${eff.economy.fxUsdKrw}원`);
  if (eff.economy?.treasuryBalanceKRW !== undefined) summaryParts.push(`국고 ${eff.economy.treasuryBalanceKRW > 0 ? '+' : ''}${eff.economy.treasuryBalanceKRW}조`);
  if (eff.security?.northKoreaTension !== undefined) summaryParts.push(`北긴장 ${eff.security.northKoreaTension > 0 ? '+' : ''}${eff.security.northKoreaTension}`);
  if (eff.foreign) {
    for (const [k, v] of Object.entries(eff.foreign)) {
      const rel = (v as any)?.relation;
      if (rel !== undefined && rel !== 0) summaryParts.push(`${k}관계 ${rel > 0 ? '+' : ''}${rel}`);
    }
  }
  if (eff.sns?.sentiment !== undefined && eff.sns.sentiment !== 0) summaryParts.push(`SNS ${eff.sns.sentiment > 0 ? '+' : ''}${eff.sns.sentiment}`);

  const allLogs = [...summaryParts, ...actionLog];
  if (allLogs.length > 0) {
    const summary: ChatMessage = {
      id: genId('msg'),
      role: 'system',
      speaker: '게임 엔진',
      content: `📊 적용된 변화\n${allLogs.map(x => '· ' + x).join('\n')}`,
      timestamp: s.clock.currentDate,
      realTimestamp: new Date().toISOString(),
    };
    s = { ...s, chat: [...s.chat, summary].slice(-300) };
  }

  return s;
}

// ---- 턴 진행 ----
export async function advanceTurn(state: GameState, days = 7): Promise<GameState> {
  // 전쟁/작전 모드면 강제로 1일만 진행
  const mode = state.flags.gameMode as string | undefined;
  if (mode === 'WAR' || mode === 'OPERATION') days = 1;

  let s = advanceClock(state, days);

  // 전쟁 모드 매일 자동 피해 (AI 보고 외에 기본 피해)
  if (mode === 'WAR') {
    const e = { ...s.economy };
    e.kospi = Math.max(500, Math.round(e.kospi - 30 - Math.random() * 50));
    e.fxUsdKrw = Math.min(2000, Math.round(e.fxUsdKrw + 5 + Math.random() * 15));
    e.consumerConfidence = Math.max(0, e.consumerConfidence - 2);
    e.businessConfidence = Math.max(0, e.businessConfidence - 3);
    e.treasuryBalanceKRW = Math.max(0, Math.round((e.treasuryBalanceKRW - 0.5) * 100) / 100);
    s.economy = e;
    const sec = { ...s.security };
    sec.rokMilitaryReadiness = Math.max(0, sec.rokMilitaryReadiness - 0.5);
    s.security = sec;
  }

  if (s.settings.autoEvents && s.settings.openaiApiKey) {
    // 병렬로 이벤트·SNS·기사 생성
    try {
      // 적대국 존재 시에만 보복 생성 (토큰 절약)
      const hasHostile = s.countries.some(c => c.relation < -10) || s.security.northKoreaTension > 50;
      const inSpecialMode = mode === 'WAR' || mode === 'OPERATION';
      const tasks: Promise<any>[] = [
        generateEvents(s, inSpecialMode ? 1 : s.settings.eventsPerTurn),
        generateSnsPosts(s, Math.min(8, days + 2)),
        generateArticles(s, Math.min(6, days + 1)),
        generateWorldEvents(s, Math.min(4, Math.ceil(days / 2))),
      ];
      if (hasHostile) tasks.push(generateRetaliations(s));
      if (inSpecialMode) tasks.push(generateWarReport(s));

      const results = await Promise.allSettled(tasks);
      const [events, posts, articles, worldEvents, ...rest] = results;
      const retaliations = hasHostile ? rest.shift() : undefined;
      const warReport = inSpecialMode ? rest.shift() : undefined;

      if (events.status === 'fulfilled') {
        const evs = events.value as GameEvent[];
        for (const e of evs) {
          if (e.effects) s = applyEffects(s, e.effects);
        }
        s = { ...s, events: [...evs, ...s.events].slice(0, 200) };
      }
      if (posts.status === 'fulfilled') {
        s = { ...s, sns: { ...s.sns, recentPosts: [...(posts.value as SnsPost[]), ...s.sns.recentPosts].slice(0, 80) } };
      }
      if (articles.status === 'fulfilled') {
        s = { ...s, articles: [...(articles.value as NewsArticle[]), ...s.articles].slice(0, 150) };
      }
      if (worldEvents.status === 'fulfilled') {
        s = { ...s, worldEvents: [...(worldEvents.value as WorldEvent[]), ...s.worldEvents].slice(0, 60) };
      }
      if (retaliations && retaliations.status === 'fulfilled') {
        const ret = retaliations.value as { events: GameEvent[]; effectsAll: PartialEffects[] };
        for (const eff of ret.effectsAll) s = applyEffects(s, eff);
        if (ret.events.length > 0) {
          s = { ...s, events: [...ret.events, ...s.events].slice(0, 200) };
        }
      }
      if (warReport && warReport.status === 'fulfilled' && warReport.value) {
        const wr = warReport.value as { event: GameEvent; effects: PartialEffects };
        s = applyEffects(s, wr.effects);
        s = { ...s, events: [wr.event, ...s.events].slice(0, 200) };
      }
    } catch (err) {
      console.error('자동 생성 실패', err);
      const note: ChatMessage = {
        id: genId('msg'),
        role: 'system',
        speaker: '시스템',
        content: `자동 생성 실패: ${(err as Error).message}`,
        timestamp: s.clock.currentDate,
        realTimestamp: new Date().toISOString(),
      };
      s = { ...s, chat: [...s.chat, note].slice(-300) };
    }
  }
  return s;
}
