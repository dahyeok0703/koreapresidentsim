import type { Election } from '../types/game';

// 한국 선거 cycle:
// - 대통령선거: 5년 단임. 정상 일정 시 3월 첫째 수요일 ~ 5월 둘째 수요일 사이.
//   * 21대 2025-06-03(조기대선, 윤석열 파면 후) → 임기 2025-06-04 ~ 2030-06-03
//   * 22대 이후: 임기만료 70일 전 첫째 수요일 = 3월 말 ~ 4월 초
//   * 단순화: 매 5년마다 3월 첫째 수요일
// - 국회의원선거(총선): 4년 주기. 4월 둘째 수요일.
//   * 22대 2024-04-10 (지남) → 23대 2028-04-12 → 4년마다
// - 전국동시지방선거: 4년 주기. 6월 첫째 수요일.
//   * 8회 2022-06-01 → 9회 2026-06-03 → 4년마다

function firstWeekdayOfMonth(year: number, month: number, weekday: number): string {
  // weekday: 0=일, 3=수
  for (let d = 1; d <= 7; d++) {
    const dt = new Date(Date.UTC(year, month - 1, d));
    if (dt.getUTCDay() === weekday) {
      return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): string {
  let found = 0;
  for (let d = 1; d <= 31; d++) {
    const dt = new Date(Date.UTC(year, month - 1, d));
    if (dt.getUTCMonth() !== month - 1) break;
    if (dt.getUTCDay() === weekday) {
      found++;
      if (found === n) {
        return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
  }
  return firstWeekdayOfMonth(year, month, weekday);
}

export function buildElections(startYear = 2025, endYear = 2075): Election[] {
  const out: Election[] = [];

  // ── 대통령선거 (5년 주기, 3월 첫째 수요일) ──
  // 22대 2030년부터
  let presNum = 22;
  for (let y = 2030; y <= endYear; y += 5) {
    out.push({
      id: `pres_${y}`,
      date: firstWeekdayOfMonth(y, 3, 3),
      type: 'PRESIDENTIAL',
      name: `제${presNum}대 대통령선거`,
      desc: `5년 단임 대통령 선출. 같은 해 5월 둘째 주 신임 대통령 취임.`,
    });
    presNum++;
  }

  // ── 국회의원선거 (4년 주기, 4월 둘째 수요일) ──
  // 22대 2024-04-10 지남. 23대부터 시작.
  let assyNum = 23;
  for (let y = 2028; y <= endYear; y += 4) {
    out.push({
      id: `assy_${y}`,
      date: nthWeekdayOfMonth(y, 4, 3, 2),
      type: 'GENERAL',
      name: `제${assyNum}대 국회의원선거`,
      desc: `300석 (지역구 254 + 비례 46) 4년 임기.`,
    });
    assyNum++;
  }

  // ── 전국동시지방선거 (4년 주기, 6월 첫째 수요일) ──
  // 8회 2022 지남. 9회부터.
  let localNum = 9;
  for (let y = 2026; y <= endYear; y += 4) {
    out.push({
      id: `local_${y}`,
      date: firstWeekdayOfMonth(y, 6, 3),
      type: 'LOCAL',
      name: `제${localNum}회 전국동시지방선거`,
      desc: '광역단체장·교육감·기초단체장·광역의원·기초의원 동시 선출.',
    });
    localNum++;
  }

  // 시간순 정렬
  out.sort((a, b) => a.date.localeCompare(b.date));

  // startYear 이전은 제외 (이미 지난 선거)
  return out.filter(e => Number(e.date.slice(0, 4)) >= startYear);
}
