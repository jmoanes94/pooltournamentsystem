import { useState } from 'react';
import { useTournamentSocket } from '../context/SocketContext.jsx';

export function SignupForm() {
  const { signup, schedule } = useTournamentSocket();
  const [name, setName] = useState('');
  const open = schedule?.registrationOpen;

  function onSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    signup(trimmed);
  }

  return (
    <section className="glass rounded-2xl p-5 sm:p-6 border border-neon-cyan/15 text-center sm:text-left">
      <div className="mb-4 min-w-0 w-full flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">Join this week&apos;s tournament</h3>
          <p
            className="text-sm text-slate-400 mt-1 line-clamp-1 overflow-hidden"
            title="Your known name only. No password — an organizer confirms you for a table."
          >
            Your known name only. No password — an organizer confirms you for a table.
          </p>
        </div>
      </div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row gap-3 items-center sm:items-stretch justify-center sm:justify-start"
      >
        <input
          type="text"
          autoComplete="off"
          maxLength={48}
          placeholder="e.g. Alex or Team Captain"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!open}
          className="flex-1 w-full max-w-md sm:max-w-none rounded-xl bg-slate-950/80 border border-white/10 px-4 py-3 text-sm text-white text-center sm:text-left placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!open || !name.trim()}
          className="w-full max-w-xs sm:max-w-none sm:w-auto rounded-xl px-6 py-3 text-sm font-semibold bg-gradient-to-r from-neon-cyan/90 to-neon-green/90 text-slate-950 shadow-neon-cyan hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40 disabled:pointer-events-none"
        >
          Send my request
        </button>
      </form>
      {!open && (
        <p className="mt-3 text-xs text-amber-200/90">
          The sign-up button is turned off outside Wednesday hours (11:00 AM – 10:00 PM, local time). Come back during
          the next window.
        </p>
      )}
    </section>
  );
}
