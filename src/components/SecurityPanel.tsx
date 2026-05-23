import { useGame } from '../store';
import { Panel, StatBar, Stat } from './common';
import { fmtPct } from '../utils/format';

export default function SecurityPanel() {
  const s = useGame(st => st.state!.security);
  const defconColor = s.defconLevel <= 2 ? 'text-red-400' : s.defconLevel <= 3 ? 'text-orange-400' : 'text-emerald-400';
  return (
    <Panel title="안보 / 군사">
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-slate-950/60 rounded p-2 border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400">DEFCON</div>
          <div className={`text-2xl font-bold ${defconColor}`}>{s.defconLevel}</div>
          <div className="text-[10px] text-slate-500">
            {s.defconLevel === 5 ? '평시' : s.defconLevel === 4 ? '주의' : s.defconLevel === 3 ? '경계' : s.defconLevel === 2 ? '준전시' : '전쟁임박'}
          </div>
        </div>
        <Stat label="국방예산/GDP" value={fmtPct(s.defenseBudgetPctGdp, 1)} />
        <Stat label="한미동맹" value={`${s.usAllianceStrength}`} color="text-blue-300" />
      </div>
      <StatBar label="군 준비태세" value={s.rokMilitaryReadiness} valueLabel={fmtPct(s.rokMilitaryReadiness, 0)} />
      <StatBar label="북한 긴장도" value={s.northKoreaTension} valueLabel={fmtPct(s.northKoreaTension, 0)} inverted />
      <StatBar label="북한 도발 위험" value={s.northKoreaProvocationRisk} valueLabel={fmtPct(s.northKoreaProvocationRisk, 0)} inverted />
      <StatBar label="사이버 위협" value={s.cyberThreatLevel} valueLabel={fmtPct(s.cyberThreatLevel, 0)} inverted />
      <StatBar label="테러 위협" value={s.terrorThreatLevel} valueLabel={fmtPct(s.terrorThreatLevel, 0)} inverted />
    </Panel>
  );
}
