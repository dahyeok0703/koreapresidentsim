import { useState, useEffect, useRef } from 'react';
import { useGame } from '../store';
import { renderGoogleSignInButton } from '../api/googleAuth';

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const user = useGame(s => s.user);
  const setUser = useGame(s => s.setUser);
  const signOut = useGame(s => s.signOut);
  const state = useGame(s => s.state);
  const settings = state?.settings;
  const setSettings = useGame(s => s.setSettings);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState(settings?.googleClientId ?? '');
  const [err, setErr] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // 클라이언트 ID 변경 시 즉시 저장
  useEffect(() => {
    if (settings && clientId !== settings.googleClientId) {
      setSettings({ googleClientId: clientId });
    }
  }, [clientId]);

  // 버튼 렌더링
  useEffect(() => {
    if (!user && buttonRef.current && clientId.endsWith('.apps.googleusercontent.com')) {
      buttonRef.current.innerHTML = '';
      renderGoogleSignInButton(
        clientId,
        buttonRef.current,
        (u) => { setUser(u); setErr(null); },
        (e) => setErr(e.message),
      );
    }
  }, [user, clientId]);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">🔐 사용자 계정</h2>
          <button onClick={onClose} className="text-slate-400 text-lg leading-none">×</button>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="bg-slate-950/60 border border-emerald-700 rounded p-3 flex items-center gap-3">
              {user.picture && <img src={user.picture} alt="" className="w-12 h-12 rounded-full border border-slate-700" referrerPolicy="no-referrer" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-100 truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                <div className="text-[10px] text-emerald-300 mt-0.5">✓ Google 로그인됨</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed bg-blue-950/30 border border-blue-800 rounded p-2">
              <strong className="text-blue-300">로그인 효과</strong>
              <ul className="mt-1 space-y-0.5 text-slate-300">
                <li>· 저장 슬롯에 사용자 이름·아바타가 기록됩니다.</li>
                <li>· 게임 상태(현재·슬롯)는 이 브라우저의 IndexedDB·localStorage에 영구 저장됩니다.</li>
                <li>· 새로고침·브라우저 종료·재실행 후에도 자동으로 불러옵니다.</li>
                <li>· 다른 기기로 옮기려면 저장/불러오기 화면의 <b className="text-amber-300">📦 JSON 내보내기</b> 사용.</li>
              </ul>
            </div>
            <button onClick={() => { signOut(); }} className="btn-danger w-full text-sm">로그아웃</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Google OAuth Client ID</label>
              <input className="input w-full text-xs" placeholder="xxxxxxxxxxxx.apps.googleusercontent.com"
                value={clientId} onChange={e => setClientId(e.target.value.trim())} />
              <div className="text-[10px] text-slate-500 mt-1">
                Client ID는 settings.json과 localStorage에만 저장. 외부로 전송되지 않음.
                <button onClick={() => setShowHelp(!showHelp)} className="text-blue-300 ml-2">{showHelp ? '닫기 ▾' : '발급 방법 보기 ▾'}</button>
              </div>
              {showHelp && (
                <div className="mt-2 text-[10px] text-slate-300 bg-slate-950/60 border border-slate-700 rounded p-2 leading-relaxed">
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Google Cloud Console 접속:<br />
                      <span className="text-blue-300 break-all">https://console.cloud.google.com/apis/credentials</span></li>
                    <li>새 프로젝트 생성 (또는 기존 프로젝트 선택)</li>
                    <li>"OAuth 클라이언트 ID 만들기" → 유형: <b>웹 애플리케이션</b></li>
                    <li>승인된 JavaScript 원본에 현재 URL 추가 (예: <span className="text-amber-300">https://stackblitz.com</span> 또는 <span className="text-amber-300">https://localhost:5173</span>)</li>
                    <li>발급된 Client ID(...apps.googleusercontent.com) 위에 붙여넣기</li>
                  </ol>
                  <div className="mt-1 text-[10px] text-slate-500">※ 처음에 OAuth 동의 화면 설정도 필요할 수 있습니다 (앱 이름·이메일 입력).</div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-3">
              <div className="text-xs text-slate-300 mb-2">아래 버튼으로 로그인:</div>
              {clientId.endsWith('.apps.googleusercontent.com') ? (
                <div ref={buttonRef} className="flex justify-center" />
              ) : (
                <div className="text-[11px] text-slate-500 text-center py-3 bg-slate-950/40 border border-dashed border-slate-700 rounded">
                  Client ID를 먼저 입력해 주세요.
                </div>
              )}
              {err && <div className="text-[10px] text-red-300 mt-2">{err}</div>}
            </div>

            <div className="text-[10px] text-slate-500 bg-slate-950/40 border border-slate-800 rounded p-2 leading-relaxed">
              <b className="text-slate-300">💡 로그인 없이도 게임 저장은 작동</b><br />
              IndexedDB·localStorage 기반 자동 저장은 로그인 여부와 무관하게 항상 활성화됩니다.
              로그인은 슬롯에 사용자 이름·아바타를 기록하기 위함입니다.
              다른 기기로 옮기려면 JSON 내보내기 사용.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
