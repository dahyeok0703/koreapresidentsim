import clsx from 'clsx';
import { gaugeColor } from '../utils/format';

export function StatBar({
  value, max = 100, label, valueLabel, inverted, color,
}: { value: number; max?: number; label?: string; valueLabel?: string; inverted?: boolean; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-0.5">
      {label && (
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{label}</span>
          <span className="font-mono text-slate-200">{valueLabel ?? value}</span>
        </div>
      )}
      <div className="bar-bg h-1.5">
        <div className={clsx('bar-fill', color ?? gaugeColor(pct, inverted))} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Panel({
  title, right, children, className,
}: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('panel', className)}>
      <div className="panel-title">
        <span>{title}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, sub, color }: { label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-[11px] text-slate-400">{label}</span>
      <div className="text-right">
        <span className={clsx('stat-num text-sm', color)}>{value}</span>
        {sub && <span className="text-[10px] text-slate-500 ml-1">{sub}</span>}
      </div>
    </div>
  );
}

export function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return <span className={clsx('chip', color)}>{children}</span>;
}
