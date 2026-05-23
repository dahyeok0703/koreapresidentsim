import type { GameState, TermEvaluation } from '../types/game';

// 5년 임기 종료 시 국정운영 평가표 산출
export function buildTermEvaluation(s: GameState, initial: {
  approval: number;
  kospi: number;
  fxUsdKrw: number;
  treasuryKRW: number;
  birthRate: number;
  suicideRate: number;
  nkTension: number;
  usAlliance: number;
  judiciaryTrust: number;
}): TermEvaluation {
  const history = s.approval.history;
  const finalApproval = s.approval.overall;
  const avgApproval = history.length
    ? history.reduce((a, h) => a + h.value, 0) / history.length
    : finalApproval;
  const peakApproval = history.length ? Math.max(...history.map(h => h.value)) : finalApproval;
  const troughApproval = history.length ? Math.min(...history.map(h => h.value)) : finalApproval;

  const econHist = s.economy.history;
  const gdpAvg = econHist.length
    ? econHist.reduce((a, h) => a + h.gdp, 0) / econHist.length
    : s.economy.gdpGrowth;

  const kospiChange = ((s.economy.kospi - initial.kospi) / initial.kospi) * 100;
  const fxKrwChange = s.economy.fxUsdKrw - initial.fxUsdKrw;
  const treasuryChange = s.economy.treasuryBalanceKRW - initial.treasuryKRW;
  const birthRateChange = s.social.birthRate - initial.birthRate;
  const suicideRateChange = s.social.suicideRate - initial.suicideRate;
  const usAllianceChange = s.security.usAllianceStrength - initial.usAlliance;
  const judiciaryTrustChange = s.judiciary.supremeCourt.publicTrust - initial.judiciaryTrust;

  const billsPassed = s.assembly.passedBills.length;
  const billsVetoed = s.assembly.vetoedBills.length;
  const impeachmentMotions = s.assembly.impeachmentMotions;
  const snsSentimentAvg = s.sns.sentimentScore;

  // 점수 산출 (0~100)
  let score = 0;
  const factors: { label: string; pts: number; max: number }[] = [];

  // 지지율 (40점)
  const aprPts = Math.max(0, Math.min(40, (avgApproval - 20) * 1.0));
  factors.push({ label: '평균 지지율', pts: aprPts, max: 40 });
  score += aprPts;

  // 경제 (25점)
  let econPts = 12.5;
  econPts += Math.max(-6, Math.min(6, gdpAvg * 2));        // 성장률 ±6
  econPts += Math.max(-4, Math.min(4, kospiChange / 10));  // 코스피 ±4
  econPts += Math.max(-3, Math.min(3, treasuryChange / 5));// 국고 ±3
  econPts = Math.max(0, Math.min(25, econPts));
  factors.push({ label: '경제', pts: econPts, max: 25 });
  score += econPts;

  // 사회 (15점)
  let socPts = 7.5;
  socPts += Math.max(-3, Math.min(3, birthRateChange * 20));      // 출산율 ±3
  socPts -= Math.max(-3, Math.min(3, suicideRateChange * 0.5));   // 자살률 ↓ 좋음
  socPts += (s.social.governmentTrust - 38) * 0.05;
  socPts = Math.max(0, Math.min(15, socPts));
  factors.push({ label: '사회', pts: socPts, max: 15 });
  score += socPts;

  // 안보·외교 (10점)
  let secPts = 5;
  secPts += Math.max(-3, Math.min(3, (initial.nkTension - s.security.northKoreaTension) * 0.1)); // 긴장도 ↓ 좋음
  secPts += Math.max(-2, Math.min(2, usAllianceChange * 0.05));
  secPts = Math.max(0, Math.min(10, secPts));
  factors.push({ label: '안보·외교', pts: secPts, max: 10 });
  score += secPts;

  // 국정운영 (10점)
  let govPts = 5;
  govPts += Math.min(3, billsPassed * 0.3);
  govPts -= Math.min(3, impeachmentMotions * 0.5);
  govPts += Math.max(-2, Math.min(2, judiciaryTrustChange * 0.1));
  govPts = Math.max(0, Math.min(10, govPts));
  factors.push({ label: '국정운영', pts: govPts, max: 10 });
  score += govPts;

  const finalScore = Math.round(score * 10) / 10;

  const grade: TermEvaluation['grade'] =
    finalScore >= 90 ? 'S' :
    finalScore >= 80 ? 'A' :
    finalScore >= 65 ? 'B' :
    finalScore >= 50 ? 'C' :
    finalScore >= 35 ? 'D' : 'F';

  // 하이라이트·실패
  const highlights: string[] = [];
  const failures: string[] = [];
  if (peakApproval >= 70) highlights.push(`최고 지지율 ${peakApproval.toFixed(1)}% 달성`);
  if (gdpAvg >= 2.5) highlights.push(`평균 GDP 성장률 ${gdpAvg.toFixed(2)}% — 견조한 성장`);
  if (kospiChange >= 30) highlights.push(`코스피 ${kospiChange.toFixed(0)}% 상승 — 자본시장 호황`);
  if (treasuryChange >= 10) highlights.push(`국고 ${treasuryChange.toFixed(1)}조원 증가 — 재정 안정`);
  if (birthRateChange >= 0.05) highlights.push(`출산율 회복(+${birthRateChange.toFixed(2)})`);
  if (s.security.northKoreaTension < initial.nkTension - 10) highlights.push(`북한 긴장도 ${(initial.nkTension - s.security.northKoreaTension).toFixed(0)}p 완화`);
  if (billsPassed >= 20) highlights.push(`주요 입법 ${billsPassed}건 통과`);
  if (s.intlOrgs.some(o => o.id.startsWith('CUSTOM_') && o.koreaMember)) {
    highlights.push('한국 주도 다자기구 창설');
  }

  if (troughApproval <= 20) failures.push(`최저 지지율 ${troughApproval.toFixed(1)}% — 임기 중 위기`);
  if (gdpAvg < 1.0) failures.push(`평균 성장률 ${gdpAvg.toFixed(2)}% — 저성장`);
  if (kospiChange <= -15) failures.push(`코스피 ${kospiChange.toFixed(0)}% — 자본시장 침체`);
  if (treasuryChange <= -20) failures.push(`국고 ${treasuryChange.toFixed(1)}조원 감소`);
  if (birthRateChange < -0.05) failures.push(`출산율 ${birthRateChange.toFixed(2)} — 추가 하락`);
  if (impeachmentMotions >= 5) failures.push(`탄핵 소추 ${impeachmentMotions}건 — 국정 마비`);
  if (billsVetoed >= 10) failures.push(`거부권 ${billsVetoed}건 행사 — 여야 극한 대립`);

  const finalNote = (
    grade === 'S' ? '역대급 명재상으로 기록될 임기였다.' :
    grade === 'A' ? '성공적인 임기로 평가받는다.' :
    grade === 'B' ? '평균 이상의 성적표를 받는다.' :
    grade === 'C' ? '논쟁적이지만 평이한 임기였다.' :
    grade === 'D' ? '아쉬운 임기로 평가된다.' :
    '실패한 정부로 역사에 기록된다.'
  );

  return {
    president: {
      name: s.president.name,
      party: s.parties.find(p => p.id === s.president.party)?.name ?? s.president.party,
      ideology: s.president.ideology,
    },
    termNumber: s.president.termNumber,
    startDate: s.president.inauguratedAt,
    endDate: s.clock.currentDate,
    metrics: {
      finalApproval: Math.round(finalApproval * 10) / 10,
      avgApproval: Math.round(avgApproval * 10) / 10,
      peakApproval: Math.round(peakApproval * 10) / 10,
      troughApproval: Math.round(troughApproval * 10) / 10,
      gdpGrowthAvg: Math.round(gdpAvg * 100) / 100,
      kospiChange: Math.round(kospiChange * 10) / 10,
      fxKrwChange: Math.round(fxKrwChange),
      treasuryChange: Math.round(treasuryChange * 10) / 10,
      birthRateChange: Math.round(birthRateChange * 100) / 100,
      suicideRateChange: Math.round(suicideRateChange * 10) / 10,
      nkTensionAvg: s.security.northKoreaTension,
      usAllianceChange: Math.round(usAllianceChange),
      billsPassed,
      billsVetoed,
      impeachmentMotions,
      judiciaryTrustChange: Math.round(judiciaryTrustChange),
      snsSentimentAvg: Math.round(snsSentimentAvg),
    },
    grade,
    totalScore: finalScore,
    highlights,
    failures,
    finalNote,
  };
}
