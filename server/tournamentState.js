/**
 * In-memory tournament lists. No database — single process only.
 * Player identity is display name (trimmed); duplicates blocked case-insensitively.
 */

const MAX_SLOTS = 16;

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function displayName(name) {
  return String(name || '').trim().slice(0, 48) || 'Player';
}

function createEntry(rawName) {
  const name = displayName(rawName);
  const key = normalizeName(name);
  return {
    id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    key,
    at: Date.now(),
  };
}

export function createTournamentState() {
  return {
    /** @type {Array<{id:string,name:string,key:string,at:number}>} */
    pending: [],
    /** @type {Array<{id:string,name:string,key:string,at:number}>} */
    slots: [],
    /** @type {Array<{id:string,name:string,key:string,at:number}>} */
    waitlist: [],
    /** @type {Array<{id:string,name:string,key:string,at:number}>} */
    rejected: [],
    /** Last Wednesday reset key applied (see schedule.getWednesdayResetKey) */
    lastResetKey: null,
  };
}

/**
 * @param {ReturnType<typeof createTournamentState>} state
 */
export function snapshot(state) {
  return {
    pending: state.pending.map(({ id, name, at }) => ({ id, name, at })),
    slots: state.slots.map(({ id, name, at }) => ({ id, name, at })),
    waitlist: state.waitlist.map(({ id, name, at }, i) => ({
      id,
      name,
      at,
      position: i + 1,
    })),
    rejected: state.rejected.map(({ id, name, at }) => ({ id, name, at })),
    maxSlots: MAX_SLOTS,
  };
}

function findByKey(list, key) {
  return list.findIndex((p) => p.key === key);
}

/**
 * @param {ReturnType<typeof createTournamentState>} state
 */
export function isNameTaken(state, rawName) {
  const key = normalizeName(rawName);
  if (!key) return true;
  return (
    findByKey(state.pending, key) !== -1 ||
    findByKey(state.slots, key) !== -1 ||
    findByKey(state.waitlist, key) !== -1 ||
    findByKey(state.rejected, key) !== -1
  );
}

/**
 * @param {ReturnType<typeof createTournamentState>} state
 */
export function requestSignup(state, rawName) {
  const name = displayName(rawName);
  const key = normalizeName(name);
  if (!key) return { ok: false, error: 'Please type a name so we know who you are.' };
  if (isNameTaken(state, rawName)) {
    return { ok: false, error: 'Someone is already using that name this week. Try a different spelling or add your last initial.' };
  }
  const entry = createEntry(rawName);
  state.pending.push(entry);
  return { ok: true, entry };
}

/**
 * @param {ReturnType<typeof createTournamentState>} state
 */
export function approvePlayer(state, rawName) {
  const key = normalizeName(rawName);
  const pi = findByKey(state.pending, key);
  if (pi === -1) return { ok: false, error: 'That player is not waiting for approval anymore.' };
  const [entry] = state.pending.splice(pi, 1);

  if (state.slots.length < MAX_SLOTS) {
    state.slots.push(entry);
    return { ok: true, placement: 'slot', entry };
  }
  state.waitlist.push(entry);
  return { ok: true, placement: 'waitlist', entry, position: state.waitlist.length };
}

/**
 * @param {ReturnType<typeof createTournamentState>} state
 */
export function rejectPlayer(state, rawName) {
  const key = normalizeName(rawName);
  const pi = findByKey(state.pending, key);
  if (pi !== -1) {
    const [entry] = state.pending.splice(pi, 1);
    state.rejected.push({ ...entry, at: Date.now() });
    return { ok: true, entry };
  }
  const wi = findByKey(state.waitlist, key);
  if (wi !== -1) {
    const [entry] = state.waitlist.splice(wi, 1);
    state.rejected.push({ ...entry, at: Date.now() });
    return { ok: true, entry };
  }
  return { ok: false, error: 'We could not find that person waiting for approval or on the waitlist.' };
}

/**
 * Remove from active slot and promote waitlist if any.
 * @param {ReturnType<typeof createTournamentState>} state
 */
export function removeFromSlot(state, rawName) {
  const key = normalizeName(rawName);
  const si = findByKey(state.slots, key);
  if (si === -1) return { ok: false, error: 'That player is not in one of the 16 table spots.' };
  const [removed] = state.slots.splice(si, 1);
  /** @type {ReturnType<typeof createEntry> | null} */
  let promoted = null;
  if (state.waitlist.length > 0) {
    promoted = state.waitlist.shift();
    state.slots.push(promoted);
  }
  return { ok: true, removed, promoted };
}

/**
 * @param {ReturnType<typeof createTournamentState>} state
 */
export function removeFromWaitlist(state, rawName) {
  const key = normalizeName(rawName);
  const wi = findByKey(state.waitlist, key);
  if (wi === -1) return { ok: false, error: 'That player is not on the waitlist.' };
  const [removed] = state.waitlist.splice(wi, 1);
  return { ok: true, removed };
}

/**
 * Clear all lists (weekly reset or manual).
 * @param {ReturnType<typeof createTournamentState>} state
 */
export function resetAll(state) {
  state.pending = [];
  state.slots = [];
  state.waitlist = [];
  state.rejected = [];
}

export { MAX_SLOTS };
