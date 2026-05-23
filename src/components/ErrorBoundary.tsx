import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error; info?: ErrorInfo }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error:', error, info);
    this.setState({ info });
  }

  reset = () => {
    try { localStorage.removeItem('kps-current'); } catch {}
    this.setState({ hasError: false, error: undefined, info: undefined });
    location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen p-6 bg-slate-950 text-slate-100 overflow-auto">
        <div className="max-w-3xl mx-auto bg-slate-900 border border-red-700 rounded-lg p-5 space-y-3">
          <h1 className="text-xl font-bold text-red-400">⚠ 화면 렌더링 오류</h1>
          <p className="text-sm text-slate-300">
            게임 화면을 그리는 중 오류가 발생했습니다. 저장된 게임 상태를 초기화하고 다시 시작하면 대부분 해결됩니다.
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-red-300 overflow-x-auto">
            {this.state.error?.message ?? String(this.state.error)}
          </div>
          {this.state.error?.stack && (
            <details className="text-[10px] text-slate-500">
              <summary className="cursor-pointer">스택 추적 ▾</summary>
              <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
            </details>
          )}
          <div className="flex gap-2">
            <button onClick={this.reset} className="btn-danger">저장 상태 초기화 + 새로고침</button>
            <button onClick={() => location.reload()} className="btn">새로고침만</button>
          </div>
        </div>
      </div>
    );
  }
}
