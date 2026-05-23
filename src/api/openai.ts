// Minimal OpenAI Chat Completions client (browser-side, BYOK).
// 사용자가 직접 API 키를 입력하므로 서버 없이 직접 호출한다.

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

export async function openaiJSON<T = any>(opts: OAICallOptions): Promise<T> {
  const text = await openaiChat({ ...opts, responseFormat: 'json_object' });
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // 모델이 가끔 코드펜스 포함해서 반환
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new Error('AI 응답을 JSON으로 파싱할 수 없습니다.');
  }
}
