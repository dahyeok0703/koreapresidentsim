import { useGame } from '../store';
import { Panel } from './common';

export default function MediaPanel() {
  const media = useGame(s => s.state!.media);
  return (
    <Panel title="언론 호의도">
      <div className="space-y-1">
        {media.map(m => (
          <div key={m.id} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-slate-300 text-[11px]">{m.name}</span>
            <span className="text-[9px] text-slate-500 w-10">{m.type}</span>
            <span className={`text-[9px] w-12 ${m.bias < -20 ? 'text-blue-300' : m.bias > 20 ? 'text-red-300' : 'text-slate-400'}`}>
              {m.bias < -20 ? '진보' : m.bias > 20 ? '보수' : '중도'}
            </span>
            <div className="flex-1 bar-bg h-1.5 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-500" />
              <div
                className={`bar-fill ${m.favorToPresident >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{
                  width: `${Math.abs(m.favorToPresident) / 2}%`,
                  marginLeft: m.favorToPresident >= 0 ? '50%' : `${50 - Math.abs(m.favorToPresident) / 2}%`,
                }}
              />
            </div>
            <span className="font-mono w-8 text-right text-[10px]">{m.favorToPresident > 0 ? '+' : ''}{m.favorToPresident}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
