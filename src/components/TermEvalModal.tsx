import { useState } from 'react';
import { useGame } from '../store';
import NextPresidentSetup from './NextPresidentSetup';

export default function TermEvalModal() {
  const state = useGame(s => s.state);
  const dismiss = useGame(s => s.dismissTermEvaluation);
  const [showSetup, setShowSetup] = useState(false);
  if (!state) return null;
  if (!state.flags.termEnded) return null;
  if (showSetup) return <NextPresidentSetup onClose={() => setShowSetup(false)} />;

  const evalReport = state.pastTerms[state.pastTerms.length - 1];
  if (!evalReport) return null;

  const m = evalReport.metrics;
  const gradeColor: Record<string, string> = {
    S: 'text-yellow-300 border-yellow-600 bg-yellow-950/40',
    A: 'text-emerald-300 border-emerald-600 bg-emerald-950/40',
    B: 'text-lime-300 border-lime-600 bg-lime-950/40',
    C: 'text-blue-300 border-blue-600 bg-blue-950/40',
    D: 'text-orange-300 border-orange-700 bg-orange-950/40',
    F: 'text-red-300 border-red-700 bg-red-950/40',
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full p-5 my-8">
        <div className="text-center mb-4">
          <div className="text-xs tracking-[0.3em] text-rok-red mb-1">REPUBLIC OF KOREA · 국정운영 평가표</div>
          <h2 className="text-2xl font-bold">{evalReport.president.name} 제{evalReport.termNumber}대 대통령</h2>
          <div className="text-[11px] text-slate-400">{evalReport.startDate} ~ {evalReport.endDate} · {evalReport.president.party} · 이념 {evalReport.president.ideology}</div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className={`border-2 rounded-lg p-4 text-center ${gradeColor[evalReport.grade]} col-span-1`}>
            <div className="text-[10px] tracking-widest">최종 등급</div>
            <div className="text-7xl font-bold leading-none my-2">{evalReport.grade}</div>
            <div className="text-xs font-mono">{evalReport.totalScore.toFixed(1)} / 100</div>
          </div>
          <div className="col-span-2 bg-slate-950/60 border border-slate-800 rounded p-3">
            <div className="text-[10px] text-slate-500 mb-1">총평</div>
            <div className="text-sm text-slate-100 leading-relaxed">{evalReport.finalNote}</div>
            <div className="mt-3 grid grid-cols-2 gap-1 text-[11px]">
              <Stat label="최종 지지율" v={`${m.finalApproval}%`} />
              <Stat label="평균 지지율" v={`${m.avgApproval}%`} />
              <Stat label="최고 지지율" v={`${m.peakApproval}%`} good />
              <Stat label="최저 지지율" v={`${m.troughApproval}%`} bad />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Section title="💰 경제">
            <Stat label="평균 GDP 성장률" v={`${m.gdpGrowthAvg}%`} good={m.gdpGrowthAvg >= 2} bad={m.gdpGrowthAvg < 1} />
            <Stat label="코스피 변화"     v={`${m.kospiChange >= 0 ? '+' : ''}${m.kospiChange}%`} good={m.kospiChange >= 10} bad={m.kospiChange <= -10} />
            <Stat label="환율 변화"       v={`${m.fxKrwChange >= 0 ? '+' : ''}${m.fxKrwChange}원`} />
            <Stat label="국고 변화"       v={`${m.treasuryChange >= 0 ? '+' : ''}${m.treasuryChange}조원`} good={m.treasuryChange >= 5} bad={m.treasuryChange <= -10} />
          </Section>
          <Section title="👥 사회">
            <Stat label="출산율 변화"     v={`${m.birthRateChange >= 0 ? '+' : ''}${m.birthRateChange}`} good={m.birthRateChange > 0.02} bad={m.birthRateChange < -0.05} />
            <Stat label="자살률 변화"     v={`${m.suicideRateChange >= 0 ? '+' : ''}${m.suicideRateChange}`} good={m.suicideRateChange < -1} bad={m.suicideRateChange > 1} />
            <Stat label="SNS 종합정서"    v={`${m.snsSentimentAvg > 0 ? '+' : ''}${m.snsSentimentAvg}`} good={m.snsSentimentAvg > 0} bad={m.snsSentimentAvg < 0} />
            <Stat label="사법부 신뢰 변화" v={`${m.judiciaryTrustChange >= 0 ? '+' : ''}${m.judiciaryTrustChange}`} good={m.judiciaryTrustChange > 0} />
          </Section>
          <Section title="🛡️ 안보·외교">
            <Stat label="평균 북한 긴장도" v={`${m.nkTensionAvg}`} good={m.nkTensionAvg < 50} bad={m.nkTensionAvg > 70} />
            <Stat label="한미동맹 변화"   v={`${m.usAllianceChange >= 0 ? '+' : ''}${m.usAllianceChange}`} good={m.usAllianceChange > 0} bad={m.usAllianceChange < -5} />
          </Section>
          <Section title="🏛️ 국정운영">
            <Stat label="법안 통과"       v={`${m.billsPassed}건`} good={m.billsPassed >= 20} />
            <Stat label="거부권 행사"     v={`${m.billsVetoed}건`} bad={m.billsVetoed >= 10} />
            <Stat label="탄핵 소추"       v={`${m.impeachmentMotions}건`} bad={m.impeachmentMotions >= 3} />
          </Section>
        </div>

        {evalReport.highlights.length > 0 && (
          <div className="bg-emerald-950/30 border border-emerald-800 rounded p-3 mb-2">
            <div className="text-[10px] text-emerald-400 tracking-widest mb-1">✨ 주요 성과</div>
            <ul className="text-xs text-emerald-100 space-y-0.5">
              {evalReport.highlights.map((h, i) => <li key={i}>· {h}</li>)}
            </ul>
          </div>
        )}
        {evalReport.failures.length > 0 && (
          <div className="bg-red-950/30 border border-red-800 rounded p-3 mb-3">
            <div className="text-[10px] text-red-400 tracking-widest mb-1">⚠ 아쉬운 점</div>
            <ul className="text-xs text-red-100 space-y-0.5">
              {evalReport.failures.map((h, i) => <li key={i}>· {h}</li>)}
            </ul>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={() => setShowSetup(true)} className="btn-primary flex-1 py-3 text-sm">
            🗳️ 다음 대통령 선거 — 새 캐릭터로 이어서 시작
          </button>
          <button onClick={dismiss} className="btn text-sm">평가표 닫기 (게임 종료)</button>
        </div>
        <div className="text-[10px] text-slate-500 text-center mt-2">
          ※ 다음 임기는 같은 한국에서 계속됩니다. 경제·사회·외교·인프라·국제기구·기업 등 장기 누적 상태는 그대로 인수됩니다.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-950/40 border border-slate-800 rounded p-2">
      <div className="text-[10px] text-slate-400 mb-1.5 tracking-widest">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Stat({ label, v, good, bad }: { label: string; v: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="flex items-baseline justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono ${good ? 'text-emerald-300' : bad ? 'text-red-300' : 'text-slate-200'}`}>{v}</span>
    </div>
  );
}
