import { useGame } from '../store';
import { Panel } from './common';

const QUICK_ACTIONS = [
  { label: '대국민 담화', prompt: '대국민 담화를 발표한다. 핵심 메시지는 민생 회복과 국민 통합. 정중하고 단호한 어조.' },
  { label: '한미 정상통화', prompt: '미국 대통령과 정상통화를 갖고 한미동맹 강화·북핵 공조·경제안보 협력을 논의한다.' },
  { label: '한일 정상회담 제안', prompt: '일본 총리에게 셔틀외교 복원과 한일 정상회담 개최를 공식 제안한다.' },
  { label: '북한 도발 강경 대응', prompt: '북한의 최근 도발에 대해 강경한 대북 메시지를 발표하고 한미 연합훈련 확대를 지시한다.' },
  { label: '대화 제의', prompt: '북한에 조건 없는 남북 당국 대화를 공식 제안한다.' },
  { label: '민생지원금 25만원', prompt: '전 국민 1인당 25만원 민생회복지원금을 지급하기 위한 추가경정예산을 편성하라고 지시한다.' },
  { label: '부동산 규제 완화', prompt: '수도권 일부 지역의 부동산 규제를 완화하고 재건축·재개발 활성화 대책을 발표한다.' },
  { label: '부동산 규제 강화', prompt: '부동산 투기 억제를 위해 다주택자 양도세 중과와 종합부동산세 강화를 지시한다.' },
  { label: '주 4.5일제 도입', prompt: '주 4.5일제 단계적 도입을 위한 근로기준법 개정을 추진한다.' },
  { label: '최저임금 대폭 인상', prompt: '내년 최저임금을 대폭 인상(10% 이상)하도록 최저임금위원회에 권고한다.' },
  { label: '검찰개혁 강행', prompt: '검찰의 수사권을 완전 폐지하고 공수처 권한을 대폭 확대하는 법안을 추진한다.' },
  { label: '검찰 권한 강화', prompt: '검찰의 직접 수사 범위를 다시 확대하고 공수처 권한을 축소한다.' },
  { label: '원전 확대', prompt: '신규 원전 4기 건설 계획을 공식화하고 SMR 산업 육성에 5조원을 투입한다.' },
  { label: '재생에너지 전환 가속', prompt: '재생에너지 비중을 2030년까지 40%로 끌어올리는 에너지 전환 로드맵을 발표한다.' },
  { label: '의대 정원 동결', prompt: '의대 정원 증원을 동결하고 의료계와 협의체를 재구성한다.' },
  { label: '의대 정원 확대', prompt: '의대 정원을 추가로 1,000명 증원하는 방안을 강행한다.' },
  { label: '기업 규제 완화', prompt: '기업 부담을 줄이기 위해 중대재해처벌법을 일부 완화하고 법인세 인하를 추진한다.' },
  { label: '재벌 개혁', prompt: '재벌 총수 일가의 부당 내부거래를 엄단하고 공정거래법을 강화한다.' },
  { label: '청년 주거 지원', prompt: '청년 1인 가구 월세 지원을 확대하고 청년주택 10만호 공급 계획을 발표한다.' },
  { label: '저출산 종합대책', prompt: '출산 시 자녀당 1억원 지급, 신혼부부 주택 공급 확대 등 파격적 저출산 대책을 발표한다.' },
];

export default function ActionsPanel() {
  const issueDecision = useGame(s => s.issueDecision);
  const busy = useGame(s => s.busy);

  return (
    <Panel title="빠른 행동 (결정 → 즉시 효과)">
      <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto pr-1">
        {QUICK_ACTIONS.map(a => (
          <button
            key={a.label}
            disabled={!!busy}
            onClick={() => issueDecision(a.prompt, a.label)}
            className="text-left text-[11px] px-2 py-1.5 rounded border border-slate-700 bg-slate-800/60 hover:bg-slate-700 hover:border-blue-500 disabled:opacity-40"
            title={a.prompt}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="text-[10px] text-slate-500 mt-2">
        💡 각 행동은 AI가 한국 정치 맥락에서 결과를 산출하여 지표에 반영합니다.
      </div>
    </Panel>
  );
}
