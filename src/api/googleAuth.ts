// Google Identity Services (GIS) — 클라이언트 사이드 Google 로그인.
// 사용자가 Google Client ID를 설정에 입력하면 활성화됨.

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;        // Google 사용자 ID
  signedInAt: string; // ISO timestamp
}

declare global {
  interface Window {
    google?: any;
  }
}

const LS_USER_KEY = 'kps-google-user';

let scriptLoadPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    return Promise.resolve();
  }
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Identity Services 스크립트 로드 실패'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

function parseJwt(token: string): any {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
  return JSON.parse(jsonPayload);
}

export async function signInWithGoogle(clientId: string): Promise<GoogleUser> {
  if (!clientId || !clientId.endsWith('.apps.googleusercontent.com')) {
    throw new Error('Google Client ID가 설정되지 않았습니다.\n\n설정 → Google 로그인 → Client ID 입력 필요.\nGoogle Cloud Console에서 OAuth 2.0 Client ID 발급:\nhttps://console.cloud.google.com/apis/credentials');
  }
  await loadGisScript();
  return new Promise((resolve, reject) => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          try {
            const payload = parseJwt(response.credential);
            const user: GoogleUser = {
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              sub: payload.sub,
              signedInAt: new Date().toISOString(),
            };
            localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
            resolve(user);
          } catch (e) {
            reject(e);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          // Fall back to popup button. 사용자가 명시적으로 버튼을 눌러야 함.
          // 여기서는 reject로 끝내고 호출자가 renderSignInButton을 쓰도록 안내.
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export async function renderGoogleSignInButton(
  clientId: string,
  container: HTMLElement,
  onSuccess: (user: GoogleUser) => void,
  onError: (err: Error) => void,
): Promise<void> {
  if (!clientId || !clientId.endsWith('.apps.googleusercontent.com')) {
    onError(new Error('Google Client ID 필요'));
    return;
  }
  try {
    await loadGisScript();
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        try {
          const payload = parseJwt(response.credential);
          const user: GoogleUser = {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            sub: payload.sub,
            signedInAt: new Date().toISOString(),
          };
          localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
          onSuccess(user);
        } catch (e) {
          onError(e as Error);
        }
      },
    });
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 280,
    });
  } catch (e: any) {
    onError(e);
  }
}

export function signOutGoogle(): void {
  try {
    localStorage.removeItem(LS_USER_KEY);
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  } catch {/* ignore */}
}

export function loadStoredUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
