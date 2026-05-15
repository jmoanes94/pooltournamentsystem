import { useTournamentSocket } from '../context/SocketContext.jsx';
import { CountdownTimer } from '../components/CountdownTimer.jsx';
import { SignupForm } from '../components/SignupForm.jsx';
import { PlayerSlotsGrid } from '../components/PlayerSlotsGrid.jsx';
import { WaitlistPanel } from '../components/WaitlistPanel.jsx';
import { derivePlayerStatus } from '../utils/playerStatus.js';

/**
 * Public tournament dashboard: signup, board, waitlist, countdown, player status.
 */
export function HomePage() {
  const { tournament, schedule, playerName } = useTournamentSocket();

  const filled = tournament?.slots?.length ?? 0;
  const max = schedule?.maxSlots ?? 16;
  const status = derivePlayerStatus(tournament, playerName);

  const toneStyles =
    status?.tone === 'green'
      ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
      : status?.tone === 'yellow'
        ? 'border-neon-gold/40 bg-neon-gold/10 text-neon-gold'
        : status?.tone === 'red'
          ? 'border-red-500/40 bg-red-500/10 text-red-300'
          : 'border-white/10 bg-slate-900/60 text-slate-200';

  return (
    <div className="space-y-8 animate-slideIn">
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-stretch">
        <div className="flex-1 w-full max-w-xl lg:max-w-none">
          <SignupForm />
        </div>
        <div className="w-full max-w-xl lg:max-w-none lg:w-[380px] shrink-0">
          {schedule?.countdown && (
            <CountdownTimer
              targetIso={schedule.countdown.target}
              label={schedule.countdown.label}
              helperText={schedule.countdown.message}
            />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/80 to-slate-950/80 px-4 py-3 flex flex-col sm:flex-row items-center sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-slate-200">
          <span className="font-semibold text-white">{filled}</span>
          <span className="text-slate-400"> of {max} spots taken</span>
        </p>
        <p className="text-xs text-slate-500">
          When all {max} spots are full, new approved players join a numbered waitlist.
        </p>
      </div>

      {status && (
        <div className={`rounded-2xl border px-4 py-3 flex flex-col sm:flex-row items-center sm:items-center sm:justify-between gap-2 ${toneStyles}`}>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">How you are doing</p>
            <p className="text-sm font-semibold">{status.label}</p>
            <p className="text-xs opacity-90 mt-0.5">{status.detail}</p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{playerName}</span>
        </div>
      )}

      <PlayerSlotsGrid slots={tournament?.slots ?? []} maxSlots={max} myName={playerName} />
      <WaitlistPanel waitlist={tournament?.waitlist ?? []} myName={playerName} />

      <section className="glass rounded-2xl p-5 border border-white/5 text-center sm:text-left">
        <h3 className="text-sm font-semibold text-white mb-2">Waiting for a yes from the organizer</h3>
        <p className="text-xs text-slate-400 mb-3">
          {tournament?.pending?.length ?? 0} name{tournament?.pending?.length === 1 ? '' : 's'} still need a decision.
        </p>
        <ul className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {(tournament?.pending ?? []).map((p) => (
            <li
              key={p.id}
              className="text-xs rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-100 px-3 py-1"
            >
              {p.name}
              <span className="ml-1 text-[10px] uppercase text-amber-200/80">waiting</span>
            </li>
          ))}
          {!(tournament?.pending ?? []).length && (
            <li className="text-xs text-slate-600">No one is waiting right now.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
