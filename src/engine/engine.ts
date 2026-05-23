import { openaiChat, openaiJSON } from '../api/openai';
import type { GameState, GameEvent, ChatMessage, PartialEffects } from '../types/game';
import { genId } from '../data/initialState';
import { applyEffects, advanceClock } from './effects';
import {
  buildAdvisorSystemPrompt,
  buildEventSystemPrompt,
  buildDecisionSystemPrompt,
  summarizeState,
} from './prompts';

// ---- AI: 비서실장 대화 ----
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

// ---- AI: 대통령의 결정/발언에 대한 결과 평가 ----
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

// ---- AI: 이벤트 생성 ----
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

반환 JSON:
{
  "events": [
    {
      "category": "...",
      "severity": "INFO|MINOR|MODERATE|MAJOR|CRITICAL",
      "headline": "string (한국 뉴스 헤드라인 톤)",
      "body": "string (2~4문장)",
      "source": "KBS|MBC|연합뉴스|조선일보|...",
      "autoEffects": { ... 작은 효과, 선택적 ... },
      "choices": [  // MAJOR 이상에서 권장
        { "label": "선택지", "description": "설명", "ideology": -100~100, "expectedEffects": {...} }
      ]
    }
  ]
}` },
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

// ---- AI: 이벤트 선택지 결과 ----
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
      { role: 'user', content: `이벤트: ${event.headline}\n본문: ${event.body}\n\n대통령이 선택한 대응: "${choiceLabel}"\n사전 예상 효과: ${JSON.stringify(expected)}\n\n실제 결과를 JSON으로 산출하라. 예상 효과를 참고하되 현실적으로 가감하라.` },
    ],
  });
}

// ---- 통합: 결정을 상태에 반영 ----
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
  s = {
    ...s,
    events: [evt, ...s.events].slice(0, 100),
    newsTicker: [result.newsHeadline, ...result.mediaReactions.map(r => `[${r.outlet}] ${r.headline}`), ...s.newsTicker].slice(0, 30),
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
    s = { ...s, chat: [...s.chat, msg].slice(-200) };
  }

  return s;
}

// ---- 턴 진행: 시간 + 자동 이벤트 ----
export async function advanceTurn(state: GameState, days = 7): Promise<GameState> {
  let s = advanceClock(state, days);
  if (s.settings.autoEvents && s.settings.openaiApiKey) {
    try {
      const events = await generateEvents(s, s.settings.eventsPerTurn);
      // 자동 효과는 즉시 적용, 선택지는 대기
      for (const e of events) {
        if (e.effects) s = applyEffects(s, e.effects);
      }
      s = {
        ...s,
        events: [...events, ...s.events].slice(0, 100),
        newsTicker: [...events.map(e => `[${e.source}] ${e.headline}`), ...s.newsTicker].slice(0, 30),
      };
    } catch (err) {
      console.error('이벤트 생성 실패', err);
      const note: ChatMessage = {
        id: genId('msg'),
        role: 'system',
        speaker: '시스템',
        content: `이벤트 생성에 실패했습니다: ${(err as Error).message}`,
        timestamp: s.clock.currentDate,
        realTimestamp: new Date().toISOString(),
      };
      s = { ...s, chat: [...s.chat, note].slice(-200) };
    }
  }
  return s;
}
