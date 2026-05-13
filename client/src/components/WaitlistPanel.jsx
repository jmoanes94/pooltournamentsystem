/**
 * Ordered waitlist with visible queue position.
 */
export function WaitlistPanel({ waitlist, myName }) {
  const me = String(myName || '').trim().toLowerCase();

  if (!waitlist?.length) {
    return (
      <section className="glass rounded-2xl p-5 sm:p-6 border border-neon-gold/10">
        <h3 className="text-lg font-semibold text-white mb-1">Waitlist</h3>
        <p className="text-sm text-slate-400">No one is waiting right now — there is still room at the tables.</p>
      </section>
    );
  }

  return (
    <section className="glass rounded-2xl p-5 sm:p-6 border border-neon-gold/20">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Waitlist</h3>
          <p className="text-sm text-slate-400">When a table opens, we go from the top of this list first.</p>
        </div>
        <span className="text-xs rounded-full px-2 py-1 border border-neon-gold/40 text-neon-gold bg-neon-gold/10">
          {waitlist.length} waiting
        </span>
      </div>
      <ul className="space-y-2">
        {waitlist.map((w) => {
          const isMe = w.name.trim().toLowerCase() === me;
          return (
            <li
              key={w.id}
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                isMe
                  ? 'border-neon-gold/60 bg-neon-gold/10'
                  : 'border-white/10 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-neon-gold text-sm w-8 shrink-0">#{w.position}</span>
                <span className={`truncate text-sm ${isMe ? 'text-neon-gold font-semibold' : 'text-slate-100'}`}>
                  {w.name}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-amber-200/90 border border-amber-400/30 rounded-full px-2 py-0.5 shrink-0">
                In line
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
