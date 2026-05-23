import { useGame } from '../store';
import { Panel, Stat, StatBar } from './common';
import { fmtNum, fmtPct } from '../utils/format';

export default function SocialPanel() {
  const s = useGame(st => st.state!.social);
  return (
    <Panel title="사회 지표">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <Stat label="합계출산율" value={fmtNum(s.birthRate, 2)} color={s.birthRate >= 1.0 ? 'text-emerald-400' : 'text-red-400'} />
        <Stat label="혼인율" value={`${fmtNum(s.marriageRate, 1)}‰`} />
        <Stat label="이혼율" value={`${fmtNum(s.divorceRate, 1)}‰`} />
        <Stat label="자살률" value={`${fmtNum(s.suicideRate, 1)}/10만`} color={s.suicideRate <= 20 ? 'text-emerald-400' : 'text-red-400'} />
        <Stat label="범죄지수" value={fmtNum(s.crimeIndex, 0)} />
        <Stat label="미세먼지 PM2.5" value={`${fmtNum(s.airQualityPM25, 0)}㎍`} color={s.airQualityPM25 <= 15 ? 'text-emerald-400' : s.airQualityPM25 <= 25 ? 'text-yellow-400' : 'text-red-400'} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
        <StatBar label="의료 만족도" value={s.healthcareSatisfaction} valueLabel={fmtPct(s.healthcareSatisfaction, 0)} />
        <StatBar label="교육 만족도" value={s.educationSatisfaction} valueLabel={fmtPct(s.educationSatisfaction, 0)} />
        <StatBar label="연금 신뢰도" value={s.pensionTrust} valueLabel={fmtPct(s.pensionTrust, 0)} />
        <StatBar label="언론자유 (RSF)" value={100 - s.pressFreedomIndex} valueLabel={fmtNum(s.pressFreedomIndex, 0)} />
        <StatBar label="젠더갈등" value={100 - s.genderConflictIndex} valueLabel={fmtNum(s.genderConflictIndex, 0)} inverted />
        <StatBar label="세대갈등" value={100 - s.generationConflictIndex} valueLabel={fmtNum(s.generationConflictIndex, 0)} inverted />
      </div>

      <div className="mt-3">
        <div className="text-[10px] text-slate-500">이민 수용 정서</div>
        <div className="bar-bg h-1.5 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600" />
          <div
            className={`bar-fill ${s.immigrationSentiment >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{
              width: `${Math.abs(s.immigrationSentiment) / 2}%`,
              marginLeft: s.immigrationSentiment >= 0 ? '50%' : `${50 - Math.abs(s.immigrationSentiment) / 2}%`,
            }}
          />
        </div>
        <div className="text-[10px] text-right text-slate-500 mt-0.5 font-mono">{s.immigrationSentiment > 0 ? '+' : ''}{s.immigrationSentiment}</div>
      </div>
    </Panel>
  );
}
