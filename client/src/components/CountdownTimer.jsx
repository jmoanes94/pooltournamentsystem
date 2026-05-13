import { useEffect, useState } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Countdown toward server-provided ISO target (registration open/close).
 */
export function CountdownTimer({ targetIso, label, helperText }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetIso]);

  const target = targetIso ? new Date(targetIso).getTime() : NaN;
  const diff = Number.isFinite(target) ? Math.max(0, target - now) : 0;
  const s = Math.floor(diff / 1000) % 60;
  const m = Math.floor(diff / 60000) % 60;
  const h = Math.floor(diff / 3600000) % 24;
  const d = Math.floor(diff / 86400000);

  const heading = label === 'open' ? 'Sign-up closes in' : 'Sign-up opens in';

  return (
    <section className="glass rounded-2xl p-4 sm:p-6 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-green/5" />
      <div className="relative flex flex-col gap-4">
        {/* Copy block — full width on mobile so nothing competes with the timer row */}
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-neon-cyan/90 mb-1">{heading}</p>
          <h2 className="text-base sm:text-xl font-semibold text-white leading-snug">{helperText}</h2>
        </div>

        {/* Fixed 4-column grid keeps D/H/M/S on one row on narrow screens (no flex-wrap jumble) */}
        <div
          className="grid grid-cols-4 gap-2 sm:gap-3 font-mono text-white w-full"
          aria-label={`${heading} ${d} days ${h} hours ${m} minutes ${s} seconds`}
        >
          <TimeBox value={d} unit="D" />
          <TimeBox value={h} unit="H" />
          <TimeBox value={m} unit="M" />
          <TimeBox value={s} unit="S" />
        </div>
      </div>
    </section>
  );
}

function TimeBox({ value, unit }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-950/80 border border-white/10 px-1 py-2.5 sm:px-2 sm:py-3 text-center shadow-inner flex flex-col items-center justify-center gap-0.5">
      <span className="text-lg sm:text-3xl tabular-nums leading-none tracking-tight">{pad(value)}</span>
      <span className="text-[9px] sm:text-[10px] font-sans font-medium text-slate-500 uppercase">{unit}</span>
    </div>
  );
}
