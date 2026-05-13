import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTournamentSocket } from '../context/SocketContext.jsx';

/**
 * Bell dropdown: merges player + admin alerts; persists via LocalStorage in SocketContext handlers.
 */
export function NotificationBell() {
  const { notifications, markNotifRead, markAllReadRole } = useTournamentSocket();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  const totalUnread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const playerItems = notifications.filter((n) => n.role === 'player');
  const adminItems = notifications.filter((n) => n.role === 'admin');
  const showAdminSection = location.pathname.startsWith('/admin') || adminItems.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-white/10 p-2 text-slate-200 hover:border-neon-cyan/40 hover:text-white transition"
        aria-label="Open notifications"
      >
        <BellIcon className="h-5 w-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-neon-magenta text-[10px] font-bold text-white flex items-center justify-center border border-slate-950 shadow">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-neon-cyan/20 backdrop-blur-xl z-50 animate-slideIn overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 py-2 border-b border-white/10">
            <div>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Notifications</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Tap an alert to clear it from this list.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                className="text-[10px] text-neon-cyan hover:underline"
                onClick={() => markAllReadRole('player')}
              >
                Clear my alerts
              </button>
              {showAdminSection && (
                <button
                  type="button"
                  className="text-[10px] text-neon-magenta hover:underline"
                  onClick={() => markAllReadRole('admin')}
                >
                  Clear organizer alerts
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <NotifSection title="For you" items={playerItems} onRead={markNotifRead} empty="Nothing new here yet." />
            {showAdminSection && (
              <NotifSection
                title="For organizers"
                items={adminItems}
                onRead={markNotifRead}
                empty="No organizer messages yet."
                accent="magenta"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifSection({ title, items, onRead, empty, accent = 'cyan' }) {
  const border = accent === 'magenta' ? 'border-neon-magenta/20' : 'border-neon-cyan/15';
  return (
    <div className={`px-3 py-2 border-b border-white/5 last:border-b-0 ${border}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">{title}</p>
      {!items.length && <p className="text-xs text-slate-600 py-2">{empty}</p>}
      <ul className="space-y-1.5 pb-1">
        {items
          .slice()
          .reverse()
          .map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onRead(n.id)}
                className={`w-full text-left rounded-lg px-2 py-2 text-xs border transition ${
                  accent === 'magenta'
                    ? 'border-neon-magenta/30 bg-neon-magenta/5 text-slate-100'
                    : 'border-neon-cyan/25 bg-neon-cyan/5 text-slate-100'
                }`}
              >
                <div className="font-semibold">{n.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{n.body}</div>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}

function BellIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5L4 18h16l-2-2z" />
    </svg>
  );
}
