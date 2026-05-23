export const fmtNum = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtInt = (n: number) => Math.round(n).toLocaleString('ko-KR');

export const fmtPct = (n: number, d = 1) => `${fmtNum(n, d)}%`;

export const fmtSigned = (n: number, d = 1) => `${n > 0 ? '+' : ''}${fmtNum(n, d)}`;

export function severityColor(sev: string): string {
  switch (sev) {
    case 'CRITICAL': return 'text-red-300 bg-red-900/40 border-red-700';
    case 'MAJOR':    return 'text-orange-300 bg-orange-900/30 border-orange-700';
    case 'MODERATE': return 'text-yellow-300 bg-yellow-900/30 border-yellow-700';
    case 'MINOR':    return 'text-sky-300 bg-sky-900/30 border-sky-700';
    default:         return 'text-slate-300 bg-slate-800 border-slate-700';
  }
}

export function categoryLabel(c: string): string {
  return ({
    ECONOMY: '경제', DIPLOMACY: '외교', SECURITY: '안보', SOCIAL: '사회',
    DISASTER: '재난', SCANDAL: '스캔들', POLITICS: '정치', CULTURE: '문화',
    TECH: '과학기술', HEALTH: '보건', NK: '북한',
  } as Record<string, string>)[c] ?? c;
}

export function gaugeColor(value: number, inverted = false): string {
  const v = inverted ? 100 - value : value;
  if (v >= 70) return 'bg-emerald-500';
  if (v >= 50) return 'bg-lime-500';
  if (v >= 30) return 'bg-yellow-500';
  if (v >= 15) return 'bg-orange-500';
  return 'bg-red-500';
}

export function trendIcon(delta: number): string {
  if (delta > 0.1) return '▲';
  if (delta < -0.1) return '▼';
  return '▬';
}
