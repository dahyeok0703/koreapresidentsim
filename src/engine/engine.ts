import { openaiChat, openaiJSON } from '../api/openai';
import type { GameState, GameEvent, ChatMessage, PartialEffects, SnsPost, NewsArticle } from '../types/game';
import { genId } from '../data/initialState';
import { applyEffects, advanceClock } from './effects';
import {
  buildAdvisorSystemPrompt,
  buildEventSystemPrompt,
  buildDecisionSystemPrompt,
  summarizeState,
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
}

export async function evaluateDecision(
  state: GameState,
  decision: string,
): Promise<DecisionResult> {
  return openaiJSON<DecisionResult>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 0.75,
    maxTokens: 900,
    messages: [
      { role: 'system', content: buildDecisionSystemPrompt(state) },
      { role: 'user', content: `대통령의 결정/지시:\n"""${decision}"""\n\n위 결정의 결과를 JSON으로 산출하라.` },
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
    maxTokens: 1800,
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
  const data = await openaiJSON<{ posts: any[] }>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 1.0,
    maxTokens: 1500,
    messages: [
      { role: 'system', content: `당신은 한국 SNS·인터넷 커뮤니티 사용자들의 실제 게시물을 생성한다. 플랫폼별 톤·문체를 반영하라.
- X/트위터: 짧은 정치 코멘트
- 인스타: 일상 + 짧은 메시지
- 페이스북: 중장년 보수 또는 가족 이야기
- 유튜브: 영상 제목+요약
- 디시/펨코: 거친 반말, 보수·반정부
- 클리앙: 차분한 진보 IT 톤
- 카톡: 단톡방 분위기
- 네이버 카페: 맘카페·지역 정서

현재 상황: ${summarizeState(state)}` },
      { role: 'user', content: `${state.clock.currentDate} 기준 시민들이 실제로 작성할 법한 게시물 ${count}개를 생성하라.

JSON: {"posts":[{"platform":"${platformIds}","author":"닉네임","handle":"@아이디|null","content":"게시물 본문 (한국어, 플랫폼 톤 반영)","likes":숫자(0~10만),"reposts":숫자(0~1만),"comments":숫자(0~5만),"sentiment":-100~100}]}` },
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

// ---- AI: 뉴스 기사 생성 ----
export async function generateArticles(state: GameState, count: number): Promise<NewsArticle[]> {
  const mediaIds = state.media.map(m => m.id).join('|');
  const data = await openaiJSON<{ articles: any[] }>({
    apiKey: state.settings.openaiApiKey,
    model: state.settings.model,
    temperature: 0.9,
    maxTokens: 1400,
    messages: [
      { role: 'system', content: `당신은 한국 주요 언론사 기자다. 각 매체의 정치 성향과 톤을 정확히 반영하라.
- 조선/중앙/동아: 보수, 정부 견제·정책 비판
- 한겨레/경향/오마이뉴스: 진보, 개혁 의제 옹호
- KBS/MBC/SBS: 중도, 사실 보도
- JTBC: 진보 성향 종편
- TV조선/채널A: 보수 종편
- 매일경제/이데일리: 경제 보수
- 연합뉴스/뉴시스/뉴스1: 중립 통신

현재: ${summarizeState(state)}` },
      { role: 'user', content: `${state.clock.currentDate} 기준 ${count}개 기사를 작성하라.

JSON: {"articles":[{"outlet":"${mediaIds}","headline":"기사 헤드라인 (간결)","lead":"리드 문장 1줄","body":"본문 2~3문장","category":"ECONOMY|DIPLOMACY|SECURITY|SOCIAL|DISASTER|SCANDAL|POLITICS|CULTURE|TECH|HEALTH|NK|LEGAL|INTERNATIONAL|MEDIA","bias":-100~100}]}` },
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
    maxTokens: 700,
    messages: [
      { role: 'system', content: buildDecisionSystemPrompt(state) },
      { role: 'user', content: `이벤트: ${event.headline}\n본문: ${event.body}\n\n대통령이 선택한 대응: "${choiceLabel}"\n사전 예상 효과: ${JSON.stringify(expected)}\n\n실제 결과를 JSON으로 산출하라.` },
    ],
  });
}

export function applyDecisionResult(
  state: GameState,
  result: DecisionResult,
  contextLabel?: string,
): GameState {
  let s = applyEffects(state, result.effects);

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

  return s;
}

// ---- 턴 진행 ----
export async function advanceTurn(state: GameState, days = 7): Promise<GameState> {
  let s = advanceClock(state, days);

  if (s.settings.autoEvents && s.settings.openaiApiKey) {
    // 병렬로 이벤트·SNS·기사 생성
    try {
      const [events, posts, articles] = await Promise.allSettled([
        generateEvents(s, s.settings.eventsPerTurn),
        generateSnsPosts(s, Math.min(8, days + 2)),
        generateArticles(s, Math.min(6, days + 1)),
      ]);

      if (events.status === 'fulfilled') {
        const evs = events.value;
        for (const e of evs) {
          if (e.effects) s = applyEffects(s, e.effects);
        }
        s = { ...s, events: [...evs, ...s.events].slice(0, 200) };
      }
      if (posts.status === 'fulfilled') {
        s = { ...s, sns: { ...s.sns, recentPosts: [...posts.value, ...s.sns.recentPosts].slice(0, 80) } };
      }
      if (articles.status === 'fulfilled') {
        s = { ...s, articles: [...articles.value, ...s.articles].slice(0, 150) };
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
