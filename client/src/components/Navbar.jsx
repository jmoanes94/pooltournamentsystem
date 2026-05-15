import { Link, NavLink } from 'react-router-dom';
import { EightBallLogo } from './EightBallLogo.jsx';
import { NotificationBell } from './NotificationBell.jsx';
import { useTournamentSocket } from '../context/SocketContext.jsx';

export function Navbar() {
  const { connected, schedule } = useTournamentSocket();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-3 py-3 sm:py-0 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Link
          to="/"
          className="flex items-center gap-3 min-w-0 group justify-center sm:justify-start w-full sm:w-auto"
        >
          <div className="relative shrink-0 transition-transform group-hover:scale-105">
            <EightBallLogo className="h-9 w-9 sm:h-10 sm:w-10 shadow-neon" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-neon-green shadow-neon ring-2 ring-slate-950 animate-pulseGlow" />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-sm sm:text-base font-semibold tracking-tight text-white sm:truncate">
              Wednesday <span className="text-gradient">8-Ball</span> Open
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 sm:truncate">
              Sign-up runs Wednesdays, 11:00 AM – 10:00 PM (local time)
            </p>
          </div>
        </Link>

        <nav className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 border ${
                connected
                  ? 'border-neon-green/40 text-neon-green bg-neon-green/10'
                  : 'border-amber-500/30 text-amber-300 bg-amber-500/10'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-neon-green animate-pulse' : 'bg-amber-400'}`}
              />
              {connected ? 'Connected' : 'Trying to reconnect…'}
            </span>
            {schedule && (
              <span className="text-slate-500">
                {schedule.filled}/{schedule.maxSlots} spots filled
              </span>
            )}
          </div>

          <NotificationBell />

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `text-xs sm:text-sm font-medium rounded-lg px-3 py-2 border transition-colors ${
                isActive
                  ? 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10'
                  : 'border-white/10 text-slate-200 hover:border-neon-cyan/40 hover:text-neon-cyan'
              }`
            }
          >
            Organizer
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
