import { useGame } from '../store';
import { Panel, StatBar } from './common';
import { fmtPct } from '../utils/format';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';

export default function ApprovalPanel() {
  const state = useGame(s => s.state)!;
  const a = state.approval;
  const colorByValue = (v: number) =>
    v >= 60 ? 'bg-emerald-500' : v >= 45 ? 'bg-lime-500' : v >= 30 ? 'bg-yellow-500' : v >= 20 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <Panel title="대통령 지지율" right={<span className="text-xs text-slate-500">{state.clock.currentDate}</span>}>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center bg-slate-950/50 rounded p-3 border border-slate-800">
          <div className={`text-4xl font-bold ${a.overall >= 50 ? 'text-emerald-400' : a.overall >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
            {fmtPct(a.overall, 1)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">국정 운영 긍정</div>
        </div>
        <div className="col-span-2 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={a.history}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11 }} labelStyle={{ color: '#94a3b8' }} />
              <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
        <div>
          <div className="text-[10px] text-slate-500 mb-1">연령대별</div>
          {Object.entries(a.byAgeGroup).map(([k, v]) => (
            <StatBar key={k} label={k} value={v} valueLabel={`${Math.round(v)}%`} color={colorByValue(v)} />
          ))}
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">이념별</div>
          <StatBar label="진보" value={a.byIdeology.progressive} valueLabel={`${Math.round(a.byIdeology.progressive)}%`} color={colorByValue(a.byIdeology.progressive)} />
          <StatBar label="중도" value={a.byIdeology.moderate} valueLabel={`${Math.round(a.byIdeology.moderate)}%`} color={colorByValue(a.byIdeology.moderate)} />
          <StatBar label="보수" value={a.byIdeology.conservative} valueLabel={`${Math.round(a.byIdeology.conservative)}%`} color={colorByValue(a.byIdeology.conservative)} />
          <div className="text-[10px] text-slate-500 mt-2 mb-1">성별</div>
          <StatBar label="남성" value={a.byGender.male} valueLabel={`${Math.round(a.byGender.male)}%`} color={colorByValue(a.byGender.male)} />
          <StatBar label="여성" value={a.byGender.female} valueLabel={`${Math.round(a.byGender.female)}%`} color={colorByValue(a.byGender.female)} />
        </div>
      </div>

      <details className="mt-3">
        <summary className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">소득별 / 학력별 ▾</summary>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
          <div>
            <div className="text-[10px] text-slate-500 mb-1">소득 5분위</div>
            <StatBar label="하위" value={a.byIncome.low} valueLabel={`${Math.round(a.byIncome.low)}%`} color={colorByValue(a.byIncome.low)} />
            <StatBar label="중하" value={a.byIncome.middleLow} valueLabel={`${Math.round(a.byIncome.middleLow)}%`} color={colorByValue(a.byIncome.middleLow)} />
            <StatBar label="중간" value={a.byIncome.middle} valueLabel={`${Math.round(a.byIncome.middle)}%`} color={colorByValue(a.byIncome.middle)} />
            <StatBar label="중상" value={a.byIncome.middleHigh} valueLabel={`${Math.round(a.byIncome.middleHigh)}%`} color={colorByValue(a.byIncome.middleHigh)} />
            <StatBar label="상위" value={a.byIncome.high} valueLabel={`${Math.round(a.byIncome.high)}%`} color={colorByValue(a.byIncome.high)} />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 mb-1">최종학력</div>
            <StatBar label="고졸 이하" value={a.byEducation.highschool} valueLabel={`${Math.round(a.byEducation.highschool)}%`} color={colorByValue(a.byEducation.highschool)} />
            <StatBar label="대졸"      value={a.byEducation.college}    valueLabel={`${Math.round(a.byEducation.college)}%`}    color={colorByValue(a.byEducation.college)} />
            <StatBar label="대학원"    value={a.byEducation.graduate}   valueLabel={`${Math.round(a.byEducation.graduate)}%`}   color={colorByValue(a.byEducation.graduate)} />
          </div>
        </div>
      </details>

      <details className="mt-1">
        <summary className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">지역별 지지율 ▾</summary>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
          {state.regions.map(r => {
            const v = a.byRegion[r.id] ?? 0;
            return <StatBar key={r.id} label={r.name} value={v} valueLabel={`${Math.round(v)}%`} color={colorByValue(v)} />;
          })}
        </div>
      </details>
    </Panel>
  );
}
