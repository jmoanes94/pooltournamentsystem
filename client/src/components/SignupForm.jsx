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
    <section className="glass rounded-2xl p-5 sm:p-6 border border-neon-cyan/15">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Join this week&apos;s tournament</h3>
          <p className="text-sm text-slate-400 mt-1">
            Type the name everyone knows you by. No password — an organizer will confirm you before you get a table.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          autoComplete="off"
          maxLength={48}
          placeholder="e.g. Alex or Team Captain"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!open}
          className="flex-1 rounded-xl bg-slate-950/80 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!open || !name.trim()}
          className="rounded-xl px-6 py-3 text-sm font-semibold bg-gradient-to-r from-neon-cyan/90 to-neon-green/90 text-slate-950 shadow-neon-cyan hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40 disabled:pointer-events-none"
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
