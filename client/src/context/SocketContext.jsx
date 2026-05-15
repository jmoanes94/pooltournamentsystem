import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  appendNotification,
  clearNotifications,
  dismissNotificationById,
  dismissNotificationsForRole,
  getPlayerName,
  getSoundEnabled,
  loadNotifications,
  setPlayerName as persistPlayerName,
  setSoundEnabled,
} from '../utils/storage.js';
import { playSoftChime } from '../utils/sound.js';
import { getSocketBaseUrl, isRealtimeConfigured } from '../config/realtime.js';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [tournament, setTournament] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [notifications, setNotifications] = useState(() => loadNotifications());
  const [soundEnabled, setSoundOn] = useState(() => getSoundEnabled());
  const [playerName, setPlayerNameState] = useState(() => getPlayerName());
  const connectErrorToastShown = useRef(false);

  const [socket] = useState(() => {
    const base = getSocketBaseUrl();
    const shouldConnect = import.meta.env.DEV || Boolean(base);
    // Production build without VITE_SOCKET_URL: do not connect to localhost (wrong on phones).
    return io(base || 'http://127.0.0.1:9', {
      transports: ['polling', 'websocket'],
      autoConnect: shouldConnect,
      reconnection: shouldConnect,
    });
  });

  const refreshNotifs = useCallback(() => {
    setNotifications(loadNotifications());
  }, []);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  /** One toast if the API URL is wrong, blocked (CORS), or offline — common on Vercel until env is set. */
  useEffect(() => {
    if (!isRealtimeConfigured()) return;
    function onConnectError(err) {
      if (connectErrorToastShown.current) return;
      connectErrorToastShown.current = true;
      const base = getSocketBaseUrl();
      toast.error(
        `Cannot reach the live server (${base}). Set VITE_SOCKET_URL to your public API (https) on Vercel, redeploy, and allow this site on the API (CLIENT_ORIGIN or CORS_ALLOW_VERCEL_PREVIEW).`,
        { duration: 10_000 },
      );
      console.warn('[socket] connect_error', err?.message || err);
    }
    socket.on('connect_error', onConnectError);
    return () => socket.off('connect_error', onConnectError);
  }, [socket]);

  /** Re-join player room when name known (for realtime player alerts). */
  useEffect(() => {
    if (!isRealtimeConfigured() || !playerName.trim()) return;
    socket.emit('player:join', playerName);
  }, [socket, playerName]);

  useEffect(() => {
    function onState(payload) {
      setTournament(payload.tournament);
      setSchedule(payload.schedule);
    }
    function onPlayerError({ message }) {
      toast.error(message);
    }
    function onPlayerSuccess({ message }) {
      toast.success(message);
    }
    function onAdminNotif(n) {
      const stored = appendNotification({
        id: n.id,
        at: n.at,
        role: 'admin',
        type: n.type,
        title: n.title,
        body: n.body,
      });
      setNotifications(stored);
      toast(
        <div className="text-left max-w-[280px]">
          <p className="font-semibold text-sm">{n.title}</p>
          {n.body ? <p className="text-xs text-slate-300 mt-1 leading-snug">{n.body}</p> : null}
        </div>,
        { icon: '🔔', duration: 5000 },
      );
      if (getSoundEnabled()) playSoftChime();
    }
    function onPlayerNotif(n) {
      const stored = appendNotification({
        id: n.id,
        at: n.at,
        role: 'player',
        type: n.type,
        title: n.title,
        body: n.body,
      });
      setNotifications(stored);
      toast.success(
        <div className="text-left max-w-[280px]">
          <p className="font-semibold text-sm">{n.title}</p>
          {n.body ? <p className="text-xs text-slate-300 mt-1 leading-snug">{n.body}</p> : null}
        </div>,
        { duration: 5000 },
      );
      if (getSoundEnabled()) playSoftChime();
    }
    function onReset() {
      clearNotifications();
      setNotifications([]);
      toast('The player list was cleared for a fresh week. Old alerts were removed too.', { icon: '🎱', duration: 5000 });
    }
    socket.on('tournament:state', onState);
    socket.on('player:error', onPlayerError);
    socket.on('player:success', onPlayerSuccess);
    socket.on('notify:admin', onAdminNotif);
    socket.on('notify:player', onPlayerNotif);
    socket.on('tournament:reset', onReset);
    return () => {
      socket.off('tournament:state', onState);
      socket.off('player:error', onPlayerError);
      socket.off('player:success', onPlayerSuccess);
      socket.off('notify:admin', onAdminNotif);
      socket.off('notify:player', onPlayerNotif);
      socket.off('tournament:reset', onReset);
    };
  }, [socket]);

  const signup = useCallback(
    (name) => {
      if (!isRealtimeConfigured()) {
        toast.error(
          'This site is not wired to a live server. Set VITE_SOCKET_URL in Vercel (or your host), rebuild, then try again.',
        );
        return;
      }
      socket.emit('player:signup', name);
      persistPlayerName(name);
      setPlayerNameState(name.trim());
      socket.emit('player:join', name.trim());
    },
    [socket],
  );

  const adminLogin = useCallback(
    (password) =>
      new Promise((resolve) => {
        if (!isRealtimeConfigured()) {
          resolve({ ok: false, misconfigured: true });
          return;
        }
        const reqId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        const ACK_MS = 30000;
        let settled = false;
        const finish = (res) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          socket.off('admin:login_ack', onAck);
          if (res?.timeout) resolve({ ok: false, timeout: true });
          else resolve({ ok: res?.ok === true });
        };
        const timer = setTimeout(() => finish({ ok: false, timeout: true }), ACK_MS);
        function onAck(res) {
          if (!res || res.reqId !== reqId) return;
          finish(res);
        }
        socket.on('admin:login_ack', onAck);
        // Payload carries reqId so parallel or retried logins cannot match the wrong ack.
        socket.emit('admin:login', { password, reqId });
      }),
    [socket],
  );

  const adminApprove = useCallback(
    (name) => {
      socket.emit('admin:approve', name);
    },
    [socket],
  );

  const adminReject = useCallback(
    (name) => {
      socket.emit('admin:reject', name);
    },
    [socket],
  );

  const adminRemoveSlot = useCallback(
    (name) => {
      socket.emit('admin:remove_slot', name);
    },
    [socket],
  );

  const adminRemoveWaitlist = useCallback(
    (name) => {
      socket.emit('admin:remove_waitlist', name);
    },
    [socket],
  );

  const adminResetAll = useCallback(() => {
    socket.emit('admin:reset_all');
  }, [socket]);

  const markNotifRead = useCallback((id) => {
    const list = dismissNotificationById(id);
    setNotifications(list);
  }, []);

  const markAllReadRole = useCallback((role) => {
    const list = dismissNotificationsForRole(role);
    setNotifications(list);
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundOn(next);
    setSoundEnabled(next);
  }, [soundEnabled]);

  const value = useMemo(
    () => ({
      socket,
      connected,
      tournament,
      schedule,
      notifications,
      refreshNotifs,
      signup,
      adminLogin,
      adminApprove,
      adminReject,
      adminRemoveSlot,
      adminRemoveWaitlist,
      adminResetAll,
      markNotifRead,
      markAllReadRole,
      playerName,
      setPlayerNameState,
      soundEnabled,
      toggleSound,
      realtimeConfigured: isRealtimeConfigured(),
    }),
    [
      socket,
      connected,
      tournament,
      schedule,
      notifications,
      refreshNotifs,
      signup,
      adminLogin,
      adminApprove,
      adminReject,
      adminRemoveSlot,
      adminRemoveWaitlist,
      adminResetAll,
      markNotifRead,
      markAllReadRole,
      playerName,
      soundEnabled,
      toggleSound,
    ],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useTournamentSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useTournamentSocket must be used within SocketProvider');
  return ctx;
}
