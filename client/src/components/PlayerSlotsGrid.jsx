import { useMemo } from 'react';

function norm(name) {
  return String(name || '').trim().toLowerCase();
}

/**
 * 16-slot tournament grid — esports board style with neon accents.
 */
export function PlayerSlotsGrid({ slots, maxSlots, myName }) {
  const cells = useMemo(() => {
    const out = [];
    for (let i = 0; i < maxSlots; i++) {
      out.push(slots[i] || null);
    }
    return out;
  }, [slots, maxSlots]);

  const me = norm(myName);

  return (
    <section className="glass rounded-2xl p-5 sm:p-6 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5 items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Table spots (16 max)</h3>
          <p className="text-sm text-slate-400">Players who already got a &quot;yes&quot; from the organizer ({slots.length} of {maxSlots})</p>
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-widest">Confirmed</div>
      </div>
      {/* 4×4 on all breakpoints so all 16 slots are visible without horizontal scroll on typical phones */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {cells.map((slot, idx) => {
          const isMe = slot && norm(slot.name) === me;
          return (
            <div
              key={idx}
              className={`relative rounded-lg sm:rounded-xl border min-h-[72px] sm:min-h-[88px] flex flex-col justify-between p-2 sm:p-3 transition-all duration-300 ${
                slot
                  ? isMe
                    ? 'border-neon-green/60 bg-gradient-to-br from-neon-green/15 to-slate-900/80 shadow-neon'
                    : 'border-white/10 bg-slate-950/70'
                  : 'border-dashed border-white/10 bg-slate-950/40'
              }`}
            >
              <div className="flex items-center justify-center sm:justify-between gap-1 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 shrink-0">#{idx + 1}</span>
                {slot && (
                  <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide text-neon-green border border-neon-green/40 rounded-full px-1 py-0.5 sm:px-2 sm:py-0.5 bg-neon-green/10 truncate max-w-[50%]">
                    In
                  </span>
                )}
              </div>
              <div
                className={`mt-1 sm:mt-2 text-[11px] sm:text-sm font-medium leading-tight line-clamp-2 break-words min-h-0 text-center sm:text-left ${
                  slot ? 'text-white' : 'text-slate-600'
                }`}
                title={slot ? slot.name : undefined}
              >
                {slot ? slot.name : 'Open spot'}
              </div>
              {isMe && (
                <div className="mt-1 text-[9px] sm:text-[10px] text-neon-green animate-pulseGlow">This is you</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
