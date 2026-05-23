// Minimal OpenAI Chat Completions client (browser-side, BYOK).
export interface OAIMsg {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OAICallOptions {
  apiKey: string;
  model: string;
  messages: OAIMsg[];
  temperature?: number;
  responseFormat?: 'text' | 'json_object';
  signal?: AbortSignal;
  maxTokens?: number;
}

export class OpenAIError extends Error {
  status: number;
  constructor(status: number, msg: string) { super(msg); this.status = status; }
}

export async function openaiChat(opts: OAICallOptions): Promise<string> {
  if (!opts.apiKey) throw new OpenAIError(0, 'OpenAI API 키가 설정되지 않았습니다. 우상단 설정 버튼에서 키를 입력해 주세요.');
  const body: any = {
    model: opts.model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.8,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.responseFormat === 'json_object') {
    body.response_format = { type: 'json_object' };
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new OpenAIError(res.status, `OpenAI 오류 ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// JSON 복구: 잘린 응답을 최대한 살림
function repairJSON(text: string): string {
  let s = text.trim();
  // 코드펜스 제거
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  // 첫 { 부터 시작
  const first = s.indexOf('{');
  if (first > 0) s = s.slice(first);

  // 문자열 안인지 추적하면서 escape 처리
  let inStr = false;
  let escape = false;
  const stack: string[] = [];
  let lastSafeEnd = -1;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{' || ch === '[') stack.push(ch);
    else if (ch === '}') {
      if (stack[stack.length - 1] === '{') stack.pop();
      if (stack.length === 0) lastSafeEnd = i + 1;
    }
    else if (ch === ']') {
      if (stack[stack.length - 1] === '[') stack.pop();
    }
  }

  // 1) 최상위 객체가 깨끗하게 닫혔다면 그 지점까지만 사용
  if (lastSafeEnd > 0) return s.slice(0, lastSafeEnd);

  // 2) 문자열 중간이면 따옴표 닫고 trailing comma 제거 + 스택 닫기
  let repaired = s;
  if (inStr) repaired += '"';
  // 마지막 미완성 토큰(쉼표·콜론 뒤에 값 없음) 제거
  repaired = repaired.replace(/,\s*$/, '').replace(/:\s*$/, ': null');
  while (stack.length) {
    const opener = stack.pop()!;
    repaired += opener === '{' ? '}' : ']';
  }
  return repaired;
}

export async function openaiJSON<T = any>(opts: OAICallOptions): Promise<T> {
  const text = await openaiChat({ ...opts, responseFormat: 'json_object' });
  // 1차: 그대로
  try {
    return JSON.parse(text) as T;
  } catch {/* fall through */}

  // 2차: 정규식으로 가장 바깥 { } 추출
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
  } catch {/* fall through */}

  // 3차: 복구 시도
  const repaired = repairJSON(text);
  try {
    return JSON.parse(repaired) as T;
  } catch (e) {
    throw new Error(`AI 응답 JSON 파싱 실패: ${(e as Error).message}\n원문(앞부분): ${text.slice(0, 200)}...`);
  }
}
