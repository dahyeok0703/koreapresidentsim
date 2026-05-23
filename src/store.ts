import { create } from 'zustand';
import type { GameState, ChatMessage, PartialEffects, GameEvent } from './types/game';
import { saveCurrent, loadCurrent } from './db/storage';
import { genId } from './data/initialState';
import {
  advanceTurn, askAdvisor, evaluateDecision, applyDecisionResult, resolveEventChoice,
} from './engine/engine';
import { applyEffects } from './engine/effects';

interface UIState {
  state: GameState | null;
  loading: boolean;
  busy: string | null;
  error: string | null;
  selectedEventId: string | null;
  init: (state: GameState) => void;
  hydrate: () => void;
  reset: () => void;
  patch: (updater: (s: GameState) => GameState) => void;
  setSettings: (partial: Partial<GameState['settings']>) => void;
  pushChat: (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'realTimestamp'>) => void;

  // AI actions
  sendChat: (text: string) => Promise<void>;
  issueDecision: (decision: string, label?: string) => Promise<void>;
  nextTurn: (days?: number) => Promise<void>;
  pickEventChoice: (eventId: string, choiceId: string) => Promise<void>;
  dismissEvent: (eventId: string) => void;
  applyManualEffects: (eff: PartialEffects, note: string) => void;
  selectEvent: (id: string | null) => void;
}

export const useGame = create<UIState>((set, get) => ({
  state: null,
  loading: false,
  busy: null,
  error: null,
  selectedEventId: null,

  init(state) {
    set({ state });
    saveCurrent(state);
  },

  hydrate() {
    const s = loadCurrent();
    if (s && (s.version ?? 0) >= 2) set({ state: s });
    else if (s) {
      // 구버전 저장 — 무시하고 setup 으로
      localStorage.removeItem('kps-current');
    }
  },

  reset() {
    localStorage.removeItem('kps-current');
    set({ state: null, selectedEventId: null, error: null });
  },

  patch(updater) {
    const s = get().state;
    if (!s) return;
    const next = updater(s);
    set({ state: next });
    saveCurrent(next);
  },

  setSettings(partial) {
    get().patch(s => ({ ...s, settings: { ...s.settings, ...partial } }));
  },

  pushChat(msg) {
    get().patch(s => ({
      ...s,
      chat: [...s.chat, {
        ...msg,
        id: genId('msg'),
        timestamp: s.clock.currentDate,
        realTimestamp: new Date().toISOString(),
      }].slice(-200),
    }));
  },

  async sendChat(text) {
    const s = get().state;
    if (!s) return;
    // append user message
    get().pushChat({ role: 'user', speaker: s.president.name, content: text });
    set({ busy: '비서실장과 협의 중…', error: null });
    try {
      const reply = await askAdvisor(get().state!, text, get().state!.chat);
      get().pushChat({ role: 'advisor', speaker: '비서실장', content: reply, contextType: 'BRIEFING' });
    } catch (e: any) {
      set({ error: e.message ?? String(e) });
      get().pushChat({ role: 'system', speaker: '시스템', content: `AI 호출 실패: ${e.message}` });
    } finally {
      set({ busy: null });
    }
  },

  async issueDecision(decision, label) {
    const s = get().state;
    if (!s) return;
    get().pushChat({ role: 'user', speaker: s.president.name, content: `[지시] ${decision}` });
    set({ busy: '결정의 파급효과 산정 중…', error: null });
    try {
      const result = await evaluateDecision(get().state!, decision);
      get().patch(prev => applyDecisionResult(prev, result, label));
    } catch (e: any) {
      set({ error: e.message ?? String(e) });
      get().pushChat({ role: 'system', speaker: '시스템', content: `결정 평가 실패: ${e.message}` });
    } finally {
      set({ busy: null });
    }
  },

  async nextTurn(days = 7) {
    const s = get().state;
    if (!s) return;
    set({ busy: `${days}일 진행 중…`, error: null });
    try {
      const next = await advanceTurn(s, days);
      set({ state: next });
      saveCurrent(next);
    } catch (e: any) {
      set({ error: e.message ?? String(e) });
    } finally {
      set({ busy: null });
    }
  },

  async pickEventChoice(eventId, choiceId) {
    const s = get().state;
    if (!s) return;
    const ev = s.events.find(e => e.id === eventId);
    const choice = ev?.choices?.find(c => c.id === choiceId);
    if (!ev || !choice) return;
    set({ busy: '대응 결과 산정 중…', error: null });
    try {
      const result = await resolveEventChoice(get().state!, ev, choice.label, choice.expectedEffects);
      get().patch(prev => {
        let next = applyDecisionResult(prev, result, ev.headline);
        next = {
          ...next,
          events: next.events.map(e => e.id === eventId
            ? { ...e, resolved: true, resolution: choice.label }
            : e),
        };
        return next;
      });
      set({ selectedEventId: null });
    } catch (e: any) {
      set({ error: e.message ?? String(e) });
    } finally {
      set({ busy: null });
    }
  },

  dismissEvent(eventId) {
    get().patch(s => ({
      ...s,
      events: s.events.map(e => e.id === eventId ? { ...e, resolved: true } : e),
    }));
  },

  applyManualEffects(eff, note) {
    get().patch(s => {
      let next = applyEffects(s, eff);
      const evt: GameEvent = {
        id: genId('evt'),
        date: s.clock.currentDate,
        category: 'POLITICS',
        severity: 'INFO',
        headline: note,
        body: `대통령실 자체 조치: ${note}`,
        source: '청와대',
        resolved: true,
        effects: eff,
      };
      next = { ...next, events: [evt, ...next.events].slice(0, 100) };
      return next;
    });
  },

  selectEvent(id) { set({ selectedEventId: id }); },
}));
