import { create } from 'zustand';
import type {
  GameState, ChatMessage, PartialEffects, GameEvent, MinistryId, Official,
  Building, WeaponEntry, MilitaryBase, MilitaryUnit, RegionId, BuildingCategory,
  WarEngagement, AdminTask
} from './types/game';
import { saveCurrent, loadCurrent } from './db/storage';
import { genId, randomKoreanName, NOMINEE_POOL } from './data/initialState';
import { MINISTRY_NAMES } from './data/ministries';
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

  // AI
  sendChat: (text: string) => Promise<void>;
  issueDecision: (decision: string, label?: string) => Promise<void>;
  nextTurn: (days?: number) => Promise<void>;
  pickEventChoice: (eventId: string, choiceId: string) => Promise<void>;
  dismissEvent: (eventId: string) => void;
  applyManualEffects: (eff: PartialEffects, note: string) => void;
  selectEvent: (id: string | null) => void;

  // 인선
  appointOfficial: (ministry: MinistryId, candidateIdx: number) => void;
  appointCustom: (ministry: MinistryId, name: string, bio: string) => void;
  resignOfficial: (ministry: MinistryId) => void;

  // 토건
  addBuilding: (b: Omit<Building, 'id'>) => void;
  removeBuilding: (id: string) => void;
  updateBuildingStatus: (id: string, status: Building['status']) => void;

  // 군사
  addWeapon: (w: Omit<WeaponEntry, 'id'>) => void;
  removeWeapon: (id: string) => void;
  changeWeaponCount: (id: string, delta: number) => void;
  addUnit: (u: Omit<MilitaryUnit, 'id'>) => void;
  removeUnit: (id: string) => void;
  addBase: (b: Omit<MilitaryBase, 'id'>) => void;
  removeBase: (id: string) => void;

  // 국제기구
  joinOrg: (orgId: string) => void;
  leaveOrg: (orgId: string) => void;

  // 전쟁 개입
  beginWarEngagement: (w: Omit<WarEngagement, 'id'>) => void;
  endWarEngagement: (id: string) => void;

  // 행정 업무
  addAdminTask: (t: Omit<AdminTask, 'id' | 'startedAt' | 'status'>) => void;
  completeAdminTask: (id: string) => void;

  // 국회 법안
  vetoBill: (billId: string) => void;
  letBillProceed: (billId: string) => void;
}

export const useGame = create<UIState>((set, get) => ({
  state: null,
  loading: false,
  busy: null,
  error: null,
  selectedEventId: null,

  init(state) { set({ state }); saveCurrent(state); },

  hydrate() {
    const s = loadCurrent();
    if (s && (s.version ?? 0) >= 7) set({ state: s });
    else if (s) { localStorage.removeItem('kps-current'); }
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
      }].slice(-300),
    }));
  },

  async sendChat(text) {
    const s = get().state;
    if (!s) return;
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

      // 전쟁/분쟁 개입 키워드 자동 감지 → 개입 상태 추가
      const txt = decision.toLowerCase();
      const warKeywords = [
        { rx: /우크라/, name: '러시아-우크라이나 전쟁', parties: ['러시아','우크라이나'] },
        { rx: /가자|이스라엘|하마스/, name: '가자 분쟁', parties: ['이스라엘','하마스'] },
        { rx: /대만/, name: '대만해협 위기', parties: ['중국','대만','미국'] },
        { rx: /북한.*개입|북한.*공격/, name: '한반도 전선 격상', parties: ['북한','한국'] },
      ];
      let role: WarEngagement['koreaRole'] = 'NONE';
      if (/파병|전투병/.test(txt)) role = 'COMBAT';
      else if (/군수|보급|무기.?지원/.test(txt)) role = 'LOGISTICAL';
      else if (/인도적|의료|난민/.test(txt)) role = 'HUMANITARIAN';
      else if (/외교|중재|규탄/.test(txt)) role = 'DIPLOMATIC';
      if (role !== 'NONE') {
        for (const wk of warKeywords) {
          if (wk.rx.test(decision)) {
            const exist = get().state!.security.warEngagements.find(x => x.name === wk.name);
            if (!exist) {
              get().beginWarEngagement({
                name: wk.name,
                parties: wk.parties,
                koreaRole: role,
                startDate: get().state!.clock.currentDate,
                troopsDeployed: role === 'COMBAT' ? 500 : role === 'LOGISTICAL' ? 100 : 0,
                costPerMonth: role === 'COMBAT' ? 2.5 : role === 'LOGISTICAL' ? 0.8 : role === 'HUMANITARIAN' ? 0.3 : 0.05,
                notes: `${role} 단계 개입 시작`,
              });
            }
            break;
          }
        }
      }
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
            ? { ...e, resolved: true, resolution: choice.label } : e),
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

  // ---------- 인선 ----------
  appointOfficial(ministry, candidateIdx) {
    get().patch(s => {
      const pool = (NOMINEE_POOL as any)[ministry] ?? [];
      const cand = pool[candidateIdx];
      if (!cand) return s;
      const next: Official = {
        id: genId('off'),
        name: cand.name,
        ministry,
        ministryName: MINISTRY_NAMES[ministry],
        party: s.president.party,
        loyalty: cand.loyalty,
        competence: cand.competence,
        publicFavor: 55 + Math.floor(Math.random() * 15) - cand.risk / 5,
        scandalRisk: cand.risk,
        appointedAt: s.clock.currentDate,
        bio: cand.bio,
        age: 55 + Math.floor(Math.random() * 12),
        education: '서울대학교 졸업',
        confirmed: true,
      };
      const cabinet = s.cabinet.map(o => o.ministry === ministry ? next : o);
      // 첫 인선 완료 플래그
      const flags = { ...s.flags };
      if (cabinet.filter(o => o.confirmed).length >= 10) flags.cabinetSetupComplete = true;
      // 신규 이벤트
      const evt: GameEvent = {
        id: genId('evt'),
        date: s.clock.currentDate,
        category: 'POLITICS',
        severity: 'MINOR',
        headline: `${cand.name} ${MINISTRY_NAMES[ministry]} 지명`,
        body: `대통령이 ${cand.name}을(를) ${MINISTRY_NAMES[ministry]}으로 지명했다. ${cand.bio}`,
        source: '청와대 인사수석실',
        resolved: true,
      };
      return { ...s, cabinet, flags, events: [evt, ...s.events].slice(0, 200) };
    });
  },

  appointCustom(ministry, name, bio) {
    get().patch(s => {
      const next: Official = {
        id: genId('off'), name, ministry, ministryName: MINISTRY_NAMES[ministry],
        party: s.president.party,
        loyalty: 60, competence: 65, publicFavor: 50, scandalRisk: 25,
        appointedAt: s.clock.currentDate, bio, age: 58, education: '-',
        confirmed: true,
      };
      const cabinet = s.cabinet.map(o => o.ministry === ministry ? next : o);
      const evt: GameEvent = {
        id: genId('evt'), date: s.clock.currentDate, category: 'POLITICS', severity: 'MINOR',
        headline: `${name} ${MINISTRY_NAMES[ministry]} 지명`,
        body: `대통령이 ${name}을(를) ${MINISTRY_NAMES[ministry]}으로 지명했다. ${bio}`,
        source: '청와대 인사수석실', resolved: true,
      };
      return { ...s, cabinet, events: [evt, ...s.events].slice(0, 200) };
    });
  },

  resignOfficial(ministry) {
    get().patch(s => {
      const cabinet = s.cabinet.map(o => o.ministry === ministry ? {
        ...o, name: '공석 (지명 대기)', confirmed: false,
        loyalty: 0, competence: 0, publicFavor: 0, scandalRisk: 0,
        bio: '인선 이벤트에서 지명 필요',
      } : o);
      return { ...s, cabinet };
    });
  },

  // ---------- 토건 ----------
  addBuilding(b) {
    get().patch(s => ({ ...s, buildings: [{ id: genId('bld'), ...b }, ...s.buildings] }));
  },
  removeBuilding(id) {
    get().patch(s => ({ ...s, buildings: s.buildings.filter(b => b.id !== id) }));
  },
  updateBuildingStatus(id, status) {
    get().patch(s => ({ ...s, buildings: s.buildings.map(b => b.id === id ? { ...b, status } : b) }));
  },

  // ---------- 군사 ----------
  addWeapon(w) {
    get().patch(s => ({ ...s, security: { ...s.security, weapons: [{ id: genId('wpn'), ...w }, ...s.security.weapons] } }));
  },
  removeWeapon(id) {
    get().patch(s => ({ ...s, security: { ...s.security, weapons: s.security.weapons.filter(w => w.id !== id) } }));
  },
  changeWeaponCount(id, delta) {
    get().patch(s => ({ ...s, security: { ...s.security, weapons: s.security.weapons.map(w => w.id === id ? { ...w, count: Math.max(0, w.count + delta) } : w) } }));
  },
  addUnit(u) {
    get().patch(s => ({ ...s, security: { ...s.security, units: [{ id: genId('unit'), ...u }, ...s.security.units] } }));
  },
  removeUnit(id) {
    get().patch(s => ({ ...s, security: { ...s.security, units: s.security.units.filter(u => u.id !== id) } }));
  },
  addBase(b) {
    get().patch(s => ({ ...s, security: { ...s.security, bases: [{ id: genId('base'), ...b }, ...s.security.bases] } }));
  },
  removeBase(id) {
    get().patch(s => ({ ...s, security: { ...s.security, bases: s.security.bases.filter(b => b.id !== id) } }));
  },

  // ---------- 국제기구 ----------
  joinOrg(orgId) {
    get().patch(s => ({
      ...s,
      intlOrgs: s.intlOrgs.map(o => o.id === orgId ? { ...o, koreaMember: true, koreaRole: '정회원' as const, memberCountries: o.memberCountries.includes('KR') ? o.memberCountries : [...o.memberCountries, 'KR'] } : o),
    }));
  },
  leaveOrg(orgId) {
    get().patch(s => ({
      ...s,
      intlOrgs: s.intlOrgs.map(o => o.id === orgId ? { ...o, koreaMember: false, koreaRole: '비회원' as const, memberCountries: o.memberCountries.filter(c => c !== 'KR') } : o),
    }));
  },

  // ---------- 전쟁 개입 ----------
  beginWarEngagement(w) {
    get().patch(s => ({
      ...s,
      security: { ...s.security, warEngagements: [{ id: genId('war'), ...w }, ...s.security.warEngagements] },
      events: [{
        id: genId('evt'), date: s.clock.currentDate,
        category: 'WAR' as const, severity: 'CRITICAL' as const,
        headline: `대한민국, ${w.name}에 ${w.koreaRole} 단계 개입 결정`,
        body: `${w.notes}. 월 비용 약 ${w.costPerMonth}조원, 인원 ${w.troopsDeployed}명 규모.`,
        source: '국방부 / 외교부', resolved: true,
      } as GameEvent, ...s.events].slice(0, 200),
    }));
  },
  endWarEngagement(id) {
    get().patch(s => ({
      ...s,
      security: { ...s.security, warEngagements: s.security.warEngagements.filter(w => w.id !== id) },
    }));
  },

  // ---------- 행정 업무 ----------
  addAdminTask(t) {
    get().patch(s => ({
      ...s,
      adminTasks: [{ id: genId('task'), startedAt: s.clock.currentDate, status: 'PROGRESS' as const, ...t }, ...s.adminTasks],
    }));
  },
  completeAdminTask(id) {
    get().patch(s => ({
      ...s,
      adminTasks: s.adminTasks.map(t => t.id === id ? { ...t, progress: 100, status: 'DONE' as const } : t),
    }));
  },

  // ---------- 국회 법안 ----------
  vetoBill(billId) {
    get().patch(s => {
      const b = s.assembly.pendingBills.find(x => x.id === billId);
      if (!b) return s;
      const vetoed = { ...b, status: 'VETOED' as const };
      // 거부권 행사 → 야권 분노, 여당 지지층 안도
      const oppositionRising = s.assembly.rulingCoalitionSeats < 151;
      const eff: PartialEffects = {
        approval: oppositionRising ? -1.5 : 0.5,
        approvalByIdeology: b.ideologyShift < 0
          ? { progressive: -3, conservative: 2 }
          : { progressive: 2, conservative: -3 },
      };
      const next = applyEffects(s, eff);
      return {
        ...next,
        assembly: {
          ...next.assembly,
          pendingBills: next.assembly.pendingBills.filter(x => x.id !== billId),
          vetoedBills: [vetoed, ...next.assembly.vetoedBills].slice(0, 30),
        },
        events: [{
          id: genId('evt'),
          date: s.clock.currentDate,
          category: 'POLITICS' as const,
          severity: 'MAJOR' as const,
          headline: `[거부권] ${b.title}`,
          body: `대통령이 ${b.title}에 대해 거부권을 행사했다. 야권의 강한 반발이 예상된다.`,
          source: '청와대',
          resolved: true,
        } as GameEvent, ...next.events].slice(0, 200),
      };
    });
  },

  letBillProceed(billId) {
    // 명시적 "통과 동의" — 즉시 효과 적용 + 통과 처리 (대기 없이)
    get().patch(s => {
      const b = s.assembly.pendingBills.find(x => x.id === billId);
      if (!b) return s;
      let next = applyEffects(s, b.expectedEffects);
      const passed = { ...b, status: 'PASSED' as const };
      next = {
        ...next,
        assembly: {
          ...next.assembly,
          pendingBills: next.assembly.pendingBills.filter(x => x.id !== billId),
          passedBills: [passed, ...next.assembly.passedBills].slice(0, 50),
        },
        events: [{
          id: genId('evt'),
          date: s.clock.currentDate,
          category: 'POLITICS' as const,
          severity: 'MODERATE' as const,
          headline: `[법안 통과] ${b.title}`,
          body: `${b.title}이(가) 본회의를 통과했다. 정책 효과가 즉시 반영된다.`,
          source: '국회 본회의',
          resolved: true,
        } as GameEvent, ...next.events].slice(0, 200),
      };
      return next;
    });
  },
}));
