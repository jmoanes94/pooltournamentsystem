import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ResetWeekModal } from '../components/ResetWeekModal.jsx';
import { RemovePlayerModal } from '../components/RemovePlayerModal.jsx';
import { useTournamentSocket } from '../context/SocketContext.jsx';
import {
  clearOrganizerSession,
  getOrganizerSessionPassword,
  setOrganizerSessionPassword,
} from '../utils/storage.js';

/**
 * Organizer console: login, approvals, waitlist control, hard reset, optional chime toggle.
 */
export function AdminPage() {
  const {
    connected,
    tournament,
    adminLogin,
    adminApprove,
    adminReject,
    adminRemoveSlot,
    adminRemoveWaitlist,
    adminResetAll,
    soundEnabled,
    toggleSound,
  } = useTournamentSocket();

  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  /** Pending remove/reject confirmation: which list and which player name. */
  const [playerModal, setPlayerModal] = useState(null);
  const passwordRef = useRef('');

  // Put saved organizer password into the ref so the socket effect can rejoin the admins room after refresh.
  useEffect(() => {
    const saved = getOrganizerSessionPassword();
    if (saved) passwordRef.current = saved;
  }, []);

  // On connect / reconnect, silently re-authenticate when this tab has a saved organizer password.
  useEffect(() => {
    if (!connected) return;
    const pw = passwordRef.current;
    if (!pw) return;
    let cancelled = false;
    adminLogin(pw).then((res) => {
      if (cancelled) return;
      if (res?.ok) {
        setLoggedIn(true);
      } else {
        clearOrganizerSession();
        passwordRef.current = '';
        setLoggedIn(false);
        toast.error('Your organizer session ended. Please sign in again.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [connected, adminLogin]);

  async function onLogin(e) {
    e.preventDefault();
    const res = await adminLogin(password);
    if (res?.ok) {
      passwordRef.current = password;
      setOrganizerSessionPassword(password);
      setLoggedIn(true);
      toast.success('You are signed in as an organizer.');
    } else {
      toast.error('That password did not work. Try again or check with whoever runs the league.');
    }
  }

  function signOutOrganizer() {
    clearOrganizerSession();
    passwordRef.current = '';
    setLoggedIn(false);
    setPassword('');
    setPlayerModal(null);
    setResetModalOpen(false);
    toast('You left organizer mode on this tab.', { icon: '👋' });
  }

  return (
    <>
      <ResetWeekModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={() => {
          adminResetAll();
        }}
      />
      <RemovePlayerModal
        open={playerModal !== null}
        variant={playerModal?.variant}
        playerName={playerModal?.name ?? ''}
        onClose={() => setPlayerModal(null)}
        onConfirm={() => {
          if (!playerModal) return;
          const { variant, name } = playerModal;
          if (variant === 'table') adminRemoveSlot(name);
          else if (variant === 'waitlist') adminRemoveWaitlist(name);
          else adminReject(name);
        }}
      />
      <div className="space-y-6 max-w-4xl mx-auto animate-slideIn text-center sm:text-left">
      <div className="rounded-2xl border border-neon-magenta/25 bg-slate-900/60 p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-white">Organizer tools</h1>
        <p className="text-sm text-slate-400 mt-1">
          Say yes or no to new names, move people off the list if plans change, and start a clean week when you need to.
          Players see updates right away — no refresh needed.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <form onSubmit={onLogin} className="flex flex-wrap gap-2 items-center">
            <input
              type="password"
              placeholder="Organizer password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg bg-slate-950 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-magenta/40"
            />
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-semibold bg-neon-magenta/90 text-slate-950 hover:brightness-110"
            >
              {loggedIn ? 'Sign in again' : 'Sign in'}
            </button>
          </form>
          <button
            type="button"
            onClick={toggleSound}
            className={`text-xs rounded-lg border px-3 py-2 ${
              soundEnabled
                ? 'border-neon-green/40 text-neon-green'
                : 'border-white/10 text-slate-400'
            }`}
          >
            {soundEnabled ? 'Chime on' : 'Chime off'}
          </button>
          <span className="text-xs text-slate-500">
            {connected ? 'Online — changes sync to every phone and computer.' : 'Offline — we will reconnect for you.'}{' '}
            (Default password is in the README if you have not changed it. Refreshing the page keeps you signed in on
            this tab.)
          </span>
          {loggedIn && (
            <button
              type="button"
              onClick={signOutOrganizer}
              className="text-xs rounded-lg border border-white/15 px-3 py-2 text-slate-300 hover:bg-white/5"
            >
              Leave organizer mode
            </button>
          )}
        </div>
      </div>

      {!loggedIn && !getOrganizerSessionPassword() && (
        <p className="text-sm text-amber-200/90 border border-amber-500/20 rounded-xl px-4 py-3 bg-amber-500/5">
          Sign in above to move players between lists. Until then, buttons stay hidden so nothing happens by accident.
        </p>
      )}

      {loggedIn && (
        <div className="space-y-6">
          <AdminTable
            title="Needs your decision"
            empty="No new names are waiting."
            rows={tournament?.pending ?? []}
            actions={(row) => (
              <div className="flex gap-2 justify-center sm:justify-end flex-wrap w-full sm:w-auto">
                <button
                  type="button"
                  className="text-xs rounded-lg px-2 py-1 border border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                  onClick={() => adminApprove(row.name)}
                >
                  Say yes
                </button>
                <button
                  type="button"
                  className="text-xs rounded-lg px-2 py-1 border border-red-400/40 text-red-200 hover:bg-red-500/10"
                  onClick={() => setPlayerModal({ variant: 'reject', name: row.name })}
                >
                  Say no
                </button>
              </div>
            )}
          />

          <AdminTable
            title="Players at the tables"
            empty="No one has a confirmed table spot yet."
            rows={tournament?.slots ?? []}
            badge="Confirmed"
            badgeClass="text-neon-green border-neon-green/40 bg-neon-green/10"
            actions={(row) => (
              <div className="flex justify-center sm:justify-end w-full sm:w-auto">
                <button
                  type="button"
                  className="text-xs rounded-lg px-2 py-1 border border-white/15 text-slate-200 hover:bg-white/5"
                  onClick={() => setPlayerModal({ variant: 'table', name: row.name })}
                >
                  Remove from table
                </button>
              </div>
            )}
          />

          <AdminTable
            title="Waitlist"
            empty="The waitlist is empty."
            rows={tournament?.waitlist ?? []}
            badge={(row) => `#${row.position}`}
            badgeClass="text-neon-gold border-neon-gold/40 bg-neon-gold/10"
            actions={(row) => (
              <div className="flex gap-2 justify-center sm:justify-end flex-wrap w-full sm:w-auto">
                <button
                  type="button"
                  className="text-xs rounded-lg px-2 py-1 border border-red-400/40 text-red-200 hover:bg-red-500/10"
                  onClick={() => setPlayerModal({ variant: 'reject', name: row.name })}
                >
                  Say no
                </button>
                <button
                  type="button"
                  className="text-xs rounded-lg px-2 py-1 border border-white/15 text-slate-200 hover:bg-white/5"
                  onClick={() => setPlayerModal({ variant: 'waitlist', name: row.name })}
                >
                  Remove from line
                </button>
              </div>
            )}
          />

          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex flex-col sm:flex-row items-center sm:items-center sm:justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-sm font-semibold text-red-200">Careful — reset everything</p>
              <p className="text-xs text-slate-400 mt-1">
                This wipes all table spots, the waitlist, names waiting on you, and anyone marked &quot;no&quot; for
                this week. Everyone&apos;s saved bell messages on their phone or laptop are cleared too. Only use this
                when you really mean to start over.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white"
            >
              Start a clean week
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function AdminTable({ title, empty, rows, actions, badge, badgeClass }) {
  return (
    <section className="glass rounded-2xl p-4 sm:p-5 border border-white/10 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <span className="text-[10px] uppercase tracking-widest text-slate-500">{rows.length} people</span>
      </div>
      {!rows.length && <p className="text-xs text-slate-600 py-4">{empty}</p>}
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2"
          >
            <div className="flex items-center gap-2 min-w-0 justify-center sm:justify-start flex-wrap">
              <span className="text-sm font-medium text-white truncate">{row.name}</span>
              {badge && (
                <span
                  className={`text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 border ${badgeClass}`}
                >
                  {typeof badge === 'function' ? badge(row) : badge}
                </span>
              )}
            </div>
            {actions(row)}
          </div>
        ))}
      </div>
    </section>
  );
}
