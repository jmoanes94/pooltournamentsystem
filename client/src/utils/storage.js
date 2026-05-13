/**
 * LocalStorage helpers for notifications and remembered player name.
 * Notifications persist across refresh; cleared on weekly/manual server reset.
 */

const KEY_NOTIFS = 'pts_v1_notifications';
const KEY_PLAYER = 'pts_v1_player_name';
const KEY_SOUND = 'pts_v1_sound_enabled';

const MAX_ITEMS = 80;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** @typedef {{ id: string; at: number; read: boolean; role: 'player' | 'admin'; type: string; title: string; body: string }} StoredNotification */

/**
 * Load notifications kept in the bell. Legacy entries marked read are dropped once (we now remove on dismiss).
 * @returns {StoredNotification[]}
 */
export function loadNotifications() {
  const raw = readJson(KEY_NOTIFS, []);
  const active = raw.filter((n) => !n.read);
  if (active.length !== raw.length) {
    saveNotifications(active);
  }
  return active;
}

/** @param {StoredNotification[]} items */
export function saveNotifications(items) {
  const trimmed = items.slice(-MAX_ITEMS);
  writeJson(KEY_NOTIFS, trimmed);
}

/** @param {Omit<StoredNotification, 'read'> & { read?: boolean }} n */
export function appendNotification(n) {
  const list = loadNotifications();
  if (list.some((x) => x.id === n.id)) return list;
  const item = { read: false, ...n };
  saveNotifications([...list, item]);
  return [...list, item];
}

/** Remove one notification after the user opens it (treated as confirmed / dismissed). */
export function dismissNotificationById(id) {
  const list = loadNotifications().filter((n) => n.id !== id);
  saveNotifications(list);
  return list;
}

/** Remove every notification for a role (e.g. clear player or organizer list). */
export function dismissNotificationsForRole(role) {
  const list = loadNotifications().filter((n) => n.role !== role);
  saveNotifications(list);
  return list;
}

const KEY_ORG_SESSION = 'pts_v1_organizer_session';

/**
 * Remember organizer password for this browser tab only (survives refresh, clears when tab closes).
 * Suitable for trusted local / LAN use only — not a secure vault.
 */
export function getOrganizerSessionPassword() {
  try {
    return sessionStorage.getItem(KEY_ORG_SESSION) || '';
  } catch {
    return '';
  }
}

export function setOrganizerSessionPassword(password) {
  try {
    if (!password) sessionStorage.removeItem(KEY_ORG_SESSION);
    else sessionStorage.setItem(KEY_ORG_SESSION, password);
  } catch {
    /* private / blocked storage */
  }
}

export function clearOrganizerSession() {
  try {
    sessionStorage.removeItem(KEY_ORG_SESSION);
  } catch {
    /* */
  }
}

export function clearNotifications() {
  localStorage.removeItem(KEY_NOTIFS);
}

export function getPlayerName() {
  return localStorage.getItem(KEY_PLAYER) || '';
}

/** @param {string} name */
export function setPlayerName(name) {
  if (!name.trim()) localStorage.removeItem(KEY_PLAYER);
  else localStorage.setItem(KEY_PLAYER, name.trim());
}

export function getSoundEnabled() {
  return readJson(KEY_SOUND, false);
}

/** @param {boolean} on */
export function setSoundEnabled(on) {
  writeJson(KEY_SOUND, !!on);
}

export function unreadCount(role) {
  return loadNotifications().filter((n) => !n.read && (role === 'any' || n.role === role)).length;
}
