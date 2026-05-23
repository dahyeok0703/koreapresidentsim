import { useGame } from '../store';
import { Panel, Stat, StatBar } from './common';
import { fmtNum, fmtPct, fmtInt } from '../utils/format';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts';

export default function EconomyPanel() {
  const e = useGame(s => s.state!.economy);
  return (
    <Panel title="경제 지표">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <Stat label="GDP 성장률" value={fmtPct(e.gdpGrowth)} color={e.gdpGrowth >= 2 ? 'text-emerald-400' : e.gdpGrowth >= 0 ? 'text-yellow-400' : 'text-red-400'} />
        <Stat label="GDP (명목)" value={`${fmtInt(e.gdpNominal)}조원`} />
        <Stat label="물가상승률 (CPI)" value={fmtPct(e.inflation)} color={Math.abs(e.inflation - 2) < 0.5 ? 'text-emerald-400' : 'text-yellow-400'} />
        <Stat label="기준금리" value={fmtPct(e.baseRate, 2)} />
        <Stat label="실업률" value={fmtPct(e.unemployment)} color={e.unemployment <= 3.5 ? 'text-emerald-400' : 'text-yellow-400'} />
        <Stat label="청년실업률" value={fmtPct(e.youthUnemployment)} color={e.youthUnemployment <= 7 ? 'text-emerald-400' : 'text-orange-400'} />
        <Stat label="환율 (USD/KRW)" value={fmtInt(e.fxUsdKrw)} sub="원/$" />
        <Stat label="무역수지" value={`${fmtInt(e.tradeBalance)}억$`} color={e.tradeBalance >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        <Stat label="코스피" value={fmtInt(e.kospi)} />
        <Stat label="코스닥" value={fmtInt(e.kosdaq)} />
        <Stat label="수출 (YoY)" value={fmtPct(e.exportYoY)} color={e.exportYoY >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        <Stat label="수입 (YoY)" value={fmtPct(e.importYoY)} />
        <Stat label="재정수지/GDP" value={fmtPct(e.fiscalBalance)} color={e.fiscalBalance >= -3 ? 'text-emerald-400' : 'text-red-400'} />
        <Stat label="국가채무/GDP" value={fmtPct(e.nationalDebt)} color={e.nationalDebt <= 55 ? 'text-emerald-400' : 'text-orange-400'} />
        <Stat label="가계부채/GDP" value={fmtPct(e.householdDebt)} color={e.householdDebt <= 90 ? 'text-emerald-400' : 'text-red-400'} />
        <Stat label="주택가격 YoY" value={fmtPct(e.housePriceYoY)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-slate-500">소비심리 (CCSI)</div>
          <StatBar value={e.consumerConfidence} max={200} valueLabel={fmtNum(e.consumerConfidence, 0)} />
        </div>
        <div>
          <div className="text-[10px] text-slate-500">기업심리 (BSI)</div>
          <StatBar value={e.businessConfidence} max={200} valueLabel={fmtNum(e.businessConfidence, 0)} />
        </div>
      </div>

      <div className="mt-3 h-20">
        <div className="text-[10px] text-slate-500 mb-0.5">코스피 추세</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={e.history}>
            <XAxis dataKey="date" hide />
            <YAxis domain={['dataMin - 50', 'dataMax + 50']} hide />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line type="monotone" dataKey="kospi" stroke="#fbbf24" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
