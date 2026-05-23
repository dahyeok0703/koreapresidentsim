import type { IntlOrg } from '../types/game';

// 한국이 가입한 주요 국제기구 + 미가입(가입가능) 기구
export const INTL_ORGS: IntlOrg[] = [
  {
    id: 'UN', name: 'UN', fullName: '국제연합', type: 'UN', founded: '1945',
    hq: '뉴욕', koreaMember: true, koreaRole: '비상임이사국',
    contributionUSD: 2700, desc: '국제평화·안보, 인권, 개발의 중심 다자기구. 193개 회원국.',
    benefits: '국제 의제 형성권, PKO 참여, 분담금 지위',
    memberCountries: ['US','CN','JP','RU','UK','DE','FR','IN','BR','KR','UA','PL','TR','ID','VN','MX','SA','EG','ZA','NG','CA','AU','NZ','IT','ES','PT','NL','BE','CH','AT','NO','SE','FI','DK','IE','PL','GR','CZ','SK','HU','RO','BG','HR','SI','EE','LV','LT','MD','AL','BA','ME','RS','MK','CY','MT','VN','TH','MY','PH','SG','ID','MM','KH','LA','BN','TL','BD','PK','NP','BT','LK','MV','MN','AF','IR','IQ','SY','LB','IL','PS','JO','SA','AE','QA','KW','BH','OM','YE','TR','EG','LY','TN','DZ','MA','SD','SS','ET','SO','KE','TZ','UG','RW','BI','DJ','ER','NG','GH','SN','CI','ML','BF','NE','TD','CM','CF','CG','CD','GA','ZA','ZW','ZM','MW','MZ','AO','NA','BW','LS','SZ','MG','MU','SC','KM','CV','ST','GW','GN','SL','LR','GM','MR','MX','CU','GT','HN','SV','NI','CR','PA','BZ','DO','HT','JM','BS','BB','TT','BR','AR','CL','CO','PE','EC','VE','BO','PY','UY','GY','SR','AU','NZ','PG','FJ','SB','VU','SM_OC','TO','KI','TV','NR','PW','MH','FM']
  },
  {
    id: 'UNSC', name: 'UN 안전보장이사회', fullName: 'UN Security Council', type: 'UN', founded: '1945',
    hq: '뉴욕', koreaMember: true, koreaRole: '비상임이사국',
    desc: '국제평화·안보 유지 1차 책임 기구. 상임 5 + 비상임 10.',
    memberCountries: ['US','UK','FR','CN','RU','KR','GY','SL','SI','ALG','PK','SO','DK','PA','GR']
  },
  {
    id: 'WTO', name: 'WTO', fullName: '세계무역기구', type: 'TRADE', founded: '1995',
    hq: '제네바', koreaMember: true, koreaRole: '창설국', contributionUSD: 80,
    desc: '다자간 자유무역 관리. 분쟁해결 기구.',
    benefits: '관세·비관세장벽 협상, 분쟁해결 절차 활용',
    memberCountries: ['US','CN','JP','KR','UK','DE','FR','IT','ES','NL','BE','CH','AT','SE','FI','DK','NO','IE','PT','GR','PL','CZ','SK','HU','RO','BG','HR','SI','EE','LV','LT','MT','CY','IN','PK','BD','LK','VN','TH','MY','PH','SG','ID','KH','LA','BN','MN','SA','AE','QA','KW','BH','OM','IL','JO','EG','TN','DZ','MA','TR','RU','UA','BY','GE','MD','RS','ME','AL','AU','NZ','CA','MX','BR','AR','CL','CO','PE','EC','VE','BO','PY','UY','GY','SR','PA','CR','SV','GT','HN','NI','BZ','DO','HT','JM','TT','CU','ZA','ZM','ZW','KE','TZ','UG','RW','BI','DJ','ET','GH','NG','SN','CI','ML','BF','NE','CM','CF','CG','CD','GA','MG','MU','SC','MZ','AO','NA','BW','LS','SZ','MW','SL','LR','GM','MR','GW','GN','CV','ST']
  },
  {
    id: 'IMF', name: 'IMF', fullName: '국제통화기금', type: 'ECONOMIC', founded: '1944',
    hq: '워싱턴 D.C.', koreaMember: true, koreaRole: '창설국', contributionUSD: 1880,
    desc: '국제수지 위기 지원·환율 안정·금융 안정 도모. 190개 회원국.',
    benefits: '위기 시 구제금융 액세스, 글로벌 경제 의제 참여',
    memberCountries: ['US','CN','JP','KR','UK','DE','FR','IT','ES','CA','AU','RU','IN','BR','MX','ID','SA','TR','NL','CH','SE','BE','AR','TH','EG','NG','ZA','PL','KE','VN','PH','CL','PE','CO']
  },
  {
    id: 'IBRD', name: '세계은행 (IBRD)', fullName: 'World Bank', type: 'ECONOMIC', founded: '1944',
    hq: '워싱턴 D.C.', koreaMember: true, koreaRole: '정회원',
    desc: '개도국 개발 금융. IDA·IFC·MIGA 등 그룹사 포함.',
    memberCountries: ['US','CN','JP','KR','UK','DE','FR','IT','ES','CA','AU','RU','IN','BR']
  },
  {
    id: 'OECD', name: 'OECD', fullName: '경제협력개발기구', type: 'ECONOMIC', founded: '1961',
    hq: '파리', koreaMember: true, koreaRole: '정회원', contributionUSD: 75,
    desc: '선진경제 정책 공조. 38개 회원국.',
    memberCountries: ['US','CA','MX','UK','DE','FR','IT','ES','PT','IE','NL','BE','LU','CH','AT','SE','NO','FI','DK','IS','PL','CZ','SK','HU','SI','EE','LV','LT','GR','TR','IL','JP','KR','AU','NZ','CL','CO','CR']
  },
  {
    id: 'G20', name: 'G20', fullName: 'Group of Twenty', type: 'ECONOMIC', founded: '1999',
    hq: '-', koreaMember: true, koreaRole: '창설국',
    desc: '세계 GDP 85% 차지하는 주요 20개 경제권 정상회의.',
    memberCountries: ['US','CN','JP','DE','UK','FR','IT','CA','RU','KR','BR','IN','AU','MX','ID','SA','TR','AR','ZA','EU']
  },
  {
    id: 'G7', name: 'G7', fullName: 'Group of Seven', type: 'ECONOMIC', founded: '1975',
    hq: '-', koreaMember: false, koreaRole: '비회원',
    desc: '주요 7개 선진국 정상회의. 한국은 미가입.',
    notes: '확대 G7+ 참여 검토 의제',
    memberCountries: ['US','UK','DE','FR','IT','JP','CA']
  },
  {
    id: 'APEC', name: 'APEC', fullName: '아시아·태평양경제협력체', type: 'ECONOMIC', founded: '1989',
    hq: '싱가포르', koreaMember: true, koreaRole: '창설국',
    desc: '아·태 21개 경제권. 무역·투자 자유화.',
    memberCountries: ['US','CN','JP','KR','RU','CA','MX','PE','CL','AU','NZ','SG','MY','TH','PH','ID','VN','BN','PG','TW','HK']
  },
  {
    id: 'ASEM', name: 'ASEM', fullName: '아시아·유럽 정상회의', type: 'REGIONAL', founded: '1996',
    hq: '-', koreaMember: true, koreaRole: '창설국',
    desc: '아시아·유럽 51개국 다자 협력.',
    memberCountries: ['KR','CN','JP','IN','TH','VN','SG','MY','PH','ID','MM','LA','KH','BN','PK','BD','MN','UK','DE','FR','IT','ES','PT','NL','BE','LU','CH','AT','SE','NO','FI','DK','IE','GR','PL','CZ','SK','HU','RO','BG','HR','SI','EE','LV','LT','MT','CY','RU','KZ']
  },
  {
    id: 'KASI', name: '한-ASEAN 연대구상', fullName: 'KASI', type: 'REGIONAL', founded: '2022',
    hq: '-', koreaMember: true, koreaRole: '창설국',
    desc: '한국의 對아세안 협력 청사진. 11개 핵심 과제.',
    memberCountries: ['KR','ID','MY','PH','TH','VN','SG','BN','KH','LA','MM']
  },
  {
    id: 'IAEA', name: 'IAEA', fullName: '국제원자력기구', type: 'SECURITY', founded: '1957',
    hq: '비엔나', koreaMember: true, koreaRole: '정회원', contributionUSD: 35,
    desc: '원자력 평화적 이용·핵 비확산 감시.',
    memberCountries: []
  },
  {
    id: 'CTBTO', name: 'CTBTO', fullName: '포괄적핵실험금지조약기구', type: 'SECURITY', founded: '1996',
    hq: '비엔나', koreaMember: true, koreaRole: '정회원',
    desc: '핵실험 감시 글로벌 네트워크.',
    memberCountries: []
  },
  {
    id: 'OPCW', name: 'OPCW', fullName: '화학무기금지기구', type: 'SECURITY', founded: '1997',
    hq: '헤이그', koreaMember: true, koreaRole: '정회원',
    desc: '화학무기 폐기·감시.',
    memberCountries: []
  },
  {
    id: 'INTERPOL', name: '인터폴', fullName: '국제형사경찰기구', type: 'SECURITY', founded: '1923',
    hq: '리옹', koreaMember: true, koreaRole: '정회원',
    desc: '국제 범죄자 추적·공조. 195개 회원국.',
    memberCountries: []
  },
  {
    id: 'WHO', name: 'WHO', fullName: '세계보건기구', type: 'HEALTH', founded: '1948',
    hq: '제네바', koreaMember: true, koreaRole: '정회원',
    desc: 'UN 산하 보건 전문기구.',
    memberCountries: []
  },
  {
    id: 'UNESCO', name: 'UNESCO', fullName: 'UN 교육과학문화기구', type: 'CULTURAL', founded: '1945',
    hq: '파리', koreaMember: true, koreaRole: '정회원',
    desc: '교육·과학·문화 협력. 세계유산 등재.',
    memberCountries: []
  },
  {
    id: 'UNHCR', name: 'UNHCR', fullName: 'UN 난민기구', type: 'UN', founded: '1950',
    hq: '제네바', koreaMember: true, koreaRole: '정회원',
    desc: '난민 보호·재정착 지원.',
    memberCountries: []
  },
  {
    id: 'WFP', name: 'WFP', fullName: 'UN 세계식량계획', type: 'UN', founded: '1961',
    hq: '로마', koreaMember: true, koreaRole: '정회원',
    desc: '기아 종식·식량 인도주의 지원.',
    memberCountries: []
  },
  {
    id: 'UNICEF', name: 'UNICEF', fullName: 'UN 아동기금', type: 'UN', founded: '1946',
    hq: '뉴욕', koreaMember: true, koreaRole: '정회원',
    desc: '아동 인권·복지 옹호.',
    memberCountries: []
  },
  {
    id: 'UNDP', name: 'UNDP', fullName: 'UN 개발계획', type: 'UN', founded: '1965',
    hq: '뉴욕', koreaMember: true, koreaRole: '정회원',
    desc: '개도국 개발 지원·SDG 추진.',
    memberCountries: []
  },
  {
    id: 'FAO', name: 'FAO', fullName: 'UN 식량농업기구', type: 'UN', founded: '1945',
    hq: '로마', koreaMember: true, koreaRole: '정회원',
    desc: '농업·식량 안보 글로벌 정책.',
    memberCountries: []
  },
  {
    id: 'ILO', name: 'ILO', fullName: '국제노동기구', type: 'UN', founded: '1919',
    hq: '제네바', koreaMember: true, koreaRole: '정회원',
    desc: '노동 기준·사회 보호 국제 규범.',
    memberCountries: []
  },
  {
    id: 'UNEP', name: 'UNEP', fullName: 'UN 환경계획', type: 'ENVIRONMENT', founded: '1972',
    hq: '나이로비', koreaMember: true, koreaRole: '정회원',
    desc: '환경·기후 글로벌 정책.',
    memberCountries: []
  },
  {
    id: 'UNFCCC', name: 'UNFCCC', fullName: 'UN 기후변화협약', type: 'ENVIRONMENT', founded: '1992',
    hq: '본', koreaMember: true, koreaRole: '정회원',
    desc: '기후위기 대응 글로벌 협약. 파리협정 기반.',
    memberCountries: []
  },
  {
    id: 'NATO_IP4', name: 'NATO IP4', fullName: 'NATO 인도태평양 파트너 4', type: 'SECURITY', founded: '2022',
    hq: '브뤼셀', koreaMember: true, koreaRole: '정회원',
    desc: 'NATO와 인태 4개국(한·일·호·뉴) 협력 협의체.',
    memberCountries: ['KR','JP','AU','NZ']
  },
  {
    id: 'NATO', name: 'NATO', fullName: '북대서양조약기구', type: 'SECURITY', founded: '1949',
    hq: '브뤼셀', koreaMember: false, koreaRole: '비회원',
    desc: '32개국 군사동맹. 한국은 IP4 파트너.',
    notes: '회원국이 아니며 가입은 사실상 불가(지리적 제약)',
    memberCountries: ['US','UK','FR','DE','IT','ES','PT','NL','BE','LU','CA','NO','DK','IS','TR','GR','PL','CZ','SK','HU','RO','BG','SI','HR','EE','LV','LT','AL','ME','MK','FI','SE']
  },
  {
    id: 'BRICS', name: 'BRICS+', fullName: 'BRICS+', type: 'ECONOMIC', founded: '2009',
    hq: '-', koreaMember: false, koreaRole: '비회원',
    desc: '브라질·러시아·인도·중국·남아공 + 확장 5개국.',
    notes: '한국은 미가입. 가입 시 미국 동맹과의 마찰 우려',
    memberCountries: ['BR','RU','IN','CN','ZA','IR','EG','AE','ET']
  },
  {
    id: 'SCO', name: 'SCO', fullName: '상하이협력기구', type: 'SECURITY', founded: '2001',
    hq: '베이징', koreaMember: false, koreaRole: '비회원',
    desc: '중·러 주도 안보·경제 협의체. 한국 미가입.',
    memberCountries: ['CN','RU','IN','PK','KZ','KG','TJ','UZ','BY','IR']
  },
  {
    id: 'CPTPP', name: 'CPTPP', fullName: '포괄적·점진적 환태평양경제동반자협정', type: 'TRADE', founded: '2018',
    hq: '-', koreaMember: false, koreaRole: '비회원',
    desc: '11개국 메가 FTA. 한국은 가입 검토 중.',
    notes: '농축산물 시장 개방 부담',
    memberCountries: ['JP','CA','AU','NZ','VN','MY','SG','BN','MX','PE','CL','UK']
  },
  {
    id: 'RCEP', name: 'RCEP', fullName: '역내포괄적경제동반자협정', type: 'TRADE', founded: '2022',
    hq: '-', koreaMember: true, koreaRole: '창설국',
    desc: '아·태 15개국 메가 FTA. 세계 GDP 30%.',
    memberCountries: ['KR','CN','JP','AU','NZ','VN','TH','MY','SG','PH','ID','MM','KH','LA','BN']
  },
  {
    id: 'EAS', name: 'EAS', fullName: '동아시아 정상회의', type: 'REGIONAL', founded: '2005',
    hq: '-', koreaMember: true, koreaRole: '창설국',
    desc: 'ASEAN+8 정상회의.',
    memberCountries: ['KR','CN','JP','US','RU','IN','AU','NZ','VN','TH','MY','SG','PH','ID','MM','KH','LA','BN']
  },
  {
    id: 'ARF', name: 'ARF', fullName: '아세안 지역안보포럼', type: 'SECURITY', founded: '1994',
    hq: '-', koreaMember: true, koreaRole: '창설국',
    desc: '아·태 안보 다자 대화의 거의 유일한 틀.',
    memberCountries: ['KR','US','CN','JP','RU','IN','AU','EU','NZ','VN','TH','MY','SG','PH','ID','MM','KH','LA','BN','BD','LK','MN','TL','PG','NK','PK','CA']
  },
  {
    id: 'AIIB', name: 'AIIB', fullName: '아시아인프라투자은행', type: 'ECONOMIC', founded: '2016',
    hq: '베이징', koreaMember: true, koreaRole: '창설국',
    desc: '중국 주도 다자 개발은행.',
    memberCountries: []
  },
  {
    id: 'IPEF', name: 'IPEF', fullName: '인도태평양경제프레임워크', type: 'ECONOMIC', founded: '2022',
    hq: '-', koreaMember: true, koreaRole: '창설국',
    desc: '미국 주도 14개국 신경제틀.',
    memberCountries: ['US','KR','JP','AU','NZ','IN','VN','TH','MY','SG','PH','ID','BN','FJ']
  },
  {
    id: 'COP', name: 'COP (UNFCCC 당사국총회)', fullName: 'Conference of Parties', type: 'ENVIRONMENT', founded: '1995',
    hq: '-', koreaMember: true, koreaRole: '정회원',
    desc: '기후변화 협상 연례 회의.',
    memberCountries: []
  },
  {
    id: 'OIF', name: 'OIF', fullName: '프랑코포니 국제기구', type: 'CULTURAL', founded: '1970',
    hq: '파리', koreaMember: false, koreaRole: '옵저버',
    desc: '프랑스어권 88개국 협력체.',
    memberCountries: ['FR','CA','BE','CH','LU','MC','RO','BG','VN','LB','LA','KH','MA','TN','DZ','SN','CI','ML','BF','NE','CG','CD','GA','RW','BI','MG','MU','SC','KM','CV','GW','GN','SL','TD','CM','CF','BJ','TG','DJ','HT','VU']
  },
  {
    id: 'COMM', name: '영연방', fullName: 'Commonwealth of Nations', type: 'CULTURAL', founded: '1949',
    hq: '런던', koreaMember: false, koreaRole: '비회원',
    desc: '영국 식민지 출신 56개국.',
    memberCountries: ['UK','CA','AU','NZ','IN','PK','BD','LK','MY','SG','BN','ZA','NG','GH','KE','TZ','UG','RW','MZ','BW','NA','LS','SZ','MW','ZM','ZW','SC','MU','CM','GM','SL','JM','BS','BB','TT','BZ','DM','GD','LC','VC','AG','PG','FJ','SB','SM_OC','TO','KI','TV','NR','VU','CY','MT']
  },
];
