import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import {
  createTournamentState,
  snapshot,
  requestSignup,
  isNameTaken,
  approvePlayer,
  rejectPlayer,
  removeFromSlot,
  removeFromWaitlist,
  resetAll,
  MAX_SLOTS,
} from './tournamentState.js';
import {
  isRegistrationOpen,
  getCountdownContext,
  shouldRunWeeklyReset,
  getWednesdayResetKey,
} from './schedule.js';

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
});

/** @type {ReturnType<typeof createTournamentState>} */
const tournament = createTournamentState();

function publicSchedulePayload() {
  const now = new Date();
  const ctx = getCountdownContext(now);
  return {
    registrationOpen: isRegistrationOpen(now),
    countdown: {
      label: ctx.label,
      message: ctx.message,
      target: ctx.target.toISOString(),
    },
    maxSlots: MAX_SLOTS,
    filled: tournament.slots.length,
    waitlistCount: tournament.waitlist.length,
    pendingCount: tournament.pending.length,
  };
}

function broadcastState() {
  const payload = {
    tournament: snapshot(tournament),
    schedule: publicSchedulePayload(),
  };
  io.emit('tournament:state', payload);
}

/**
 * Push notification to admin room and optionally persist on clients via event.
 * @param {{ type: string; title: string; body: string; meta?: Record<string, unknown> }} n
 */
function notifyAdmins(n) {
  io.to('admins').emit('notify:admin', {
    id: `adm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    read: false,
    ...n,
  });
}

/**
 * @param {string} playerKey normalized name key
 * @param {{ type: string; title: string; body: string; meta?: Record<string, unknown> }} n
 */
function notifyPlayerRoom(playerKey, n) {
  const room = `player:${playerKey}`;
  io.to(room).emit('notify:player', {
    id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    read: false,
    ...n,
  });
}

// --- Weekly auto reset (Wednesday at or after 10:00 PM local) ---
setInterval(() => {
  const now = new Date();
  if (!shouldRunWeeklyReset(now)) return;
  const key = getWednesdayResetKey(now);
  if (tournament.lastResetKey === key) return;
  tournament.lastResetKey = key;
  resetAll(tournament);
  io.emit('tournament:reset', { reason: 'weekly', resetKey: key });
  broadcastState();
}, 15_000);

app.get('/health', (_req, res) => {
  res.json({ ok: true, ...publicSchedulePayload() });
});

io.on('connection', (socket) => {
  // Initial sync for this socket
  socket.emit('tournament:state', {
    tournament: snapshot(tournament),
    schedule: publicSchedulePayload(),
  });

  /** Player joins their notification room (normalized server-side in handlers) */
  socket.on('player:join', (rawName) => {
    const key = String(rawName || '')
      .trim()
      .toLowerCase();
    if (!key) return;
    socket.join(`player:${key}`);
  });

  socket.on('player:signup', (rawName) => {
    if (!isRegistrationOpen()) {
      socket.emit('player:error', {
        message:
          'Sign-up is closed right now. It opens every Wednesday from 11:00 AM to 10:00 PM (your local time).',
      });
      return;
    }
    const result = requestSignup(tournament, rawName);
    if (!result.ok) {
      socket.emit('player:error', { message: result.error });
      return;
    }
    const key = result.entry.key;
    socket.join(`player:${key}`);
    socket.emit('player:success', {
      message: 'Nice — you are on the list! An organizer will review your name soon.',
    });
    notifyAdmins({
      type: 'signup',
      title: 'Someone wants to play',
      body: `${result.entry.name} just asked for a spot. Tap the bell or open the organizer page to approve them.`,
      meta: { name: result.entry.name, key },
    });
    broadcastState();
  });

  socket.on('admin:login', (payload) => {
    // Accept { password, reqId } (preferred) or legacy plain string from older clients.
    const password =
      payload != null && typeof payload === 'object' && 'password' in payload ? payload.password : payload;
    const reqId =
      payload != null && typeof payload === 'object' && payload.reqId != null ? String(payload.reqId) : null;
    const pw = String(password ?? '').trim();
    const expected = String(ADMIN_PASSWORD ?? '').trim();
    const ok = pw === expected;
    if (ok) {
      socket.join('admins');
    }
    const ack = reqId ? { ok, reqId } : { ok };
    // Event-based ack: more reliable on mobile than Socket.io callback packets alone.
    socket.emit('admin:login_ack', ack);
  });

  socket.on('admin:approve', (rawName) => {
    if (!socket.rooms.has('admins')) return; // joined via admin:login
    const result = approvePlayer(tournament, rawName);
    if (!result.ok) return;
    const key = result.entry.key;
    if (result.placement === 'slot') {
      notifyPlayerRoom(key, {
        type: 'approved_slot',
        title: 'You are in!',
        body: `You have one of the 16 table spots (${tournament.slots.length} of ${MAX_SLOTS} filled). See you at the tournament.`,
        meta: { name: result.entry.name },
      });
    } else {
      notifyPlayerRoom(key, {
        type: 'approved_waitlist',
        title: 'You are on the waitlist',
        body: `All tables are full, but you are approved at spot ${result.position}. If someone drops out, you will move up automatically.`,
        meta: { name: result.entry.name, position: result.position },
      });
    }
    broadcastState();
  });

  socket.on('admin:reject', (rawName) => {
    if (!socket.rooms.has('admins')) return;
    const result = rejectPlayer(tournament, rawName);
    if (!result.ok) return;
    notifyPlayerRoom(result.entry.key, {
      type: 'rejected',
      title: 'Signup not approved',
      body: 'An organizer chose not to add this signup. If you think that was a mistake, you can reach out to them in person.',
      meta: { name: result.entry.name },
    });
    broadcastState();
  });

  socket.on('admin:remove_slot', (rawName) => {
    if (!socket.rooms.has('admins')) return;
    const result = removeFromSlot(tournament, rawName);
    if (!result.ok) return;
    if (result.promoted) {
      notifyPlayerRoom(result.promoted.key, {
        type: 'promoted',
        title: 'A spot opened for you!',
        body: 'You moved from the waitlist onto the active player list. Check the board to see your table.',
        meta: { name: result.promoted.name },
      });
    }
    broadcastState();
  });

  socket.on('admin:remove_waitlist', (rawName) => {
    if (!socket.rooms.has('admins')) return;
    const result = removeFromWaitlist(tournament, rawName);
    if (!result.ok) return;
    broadcastState();
  });

  socket.on('admin:reset_all', () => {
    if (!socket.rooms.has('admins')) return;
    resetAll(tournament);
    io.emit('tournament:reset', { reason: 'manual' });
    broadcastState();
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Pool tournament server on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`CORS origin: ${CLIENT_ORIGIN} | Admin password env: ADMIN_PASSWORD (default demo: ${ADMIN_PASSWORD})`);
});
