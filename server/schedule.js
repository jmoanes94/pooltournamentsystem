/**
 * Weekly registration window (local server time):
 * Opens Wednesday 11:00 AM, closes Wednesday 10:00 PM (same calendar day).
 * After close, data is reset and registration stays closed until the next Wednesday 11:00 AM.
 */

const WEDNESDAY = 3; // Date.getDay(): 0 = Sunday
const OPEN_HOUR = 11;
const CLOSE_HOUR = 22; // 10:00 PM — registration ends before this moment (exclusive at 22:00 for "before 10 PM" we use < 22:00 as open, reset at 22:00)

/**
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isRegistrationOpen(now = new Date()) {
  const d = new Date(now);
  if (d.getDay() !== WEDNESDAY) return false;
  const minutes = d.getHours() * 60 + d.getMinutes();
  const open = OPEN_HOUR * 60;
  const close = CLOSE_HOUR * 60;
  return minutes >= open && minutes < close;
}

/**
 * Next moment registration opens (Wednesday 11:00 AM).
 * @param {Date} [now]
 * @returns {Date}
 */
export function getNextRegistrationOpen(now = new Date()) {
  const d = new Date(now);
  const target = new Date(d);
  const dow = d.getDay();
  const minutes = d.getHours() * 60 + d.getMinutes();

  // Same Wednesday before 11 AM → open today 11 AM
  if (dow === WEDNESDAY && minutes < OPEN_HOUR * 60) {
    target.setHours(OPEN_HOUR, 0, 0, 0);
    return target;
  }

  // Otherwise: advance to next Wednesday 11 AM
  let daysUntilWed = (WEDNESDAY - dow + 7) % 7;
  if (dow === WEDNESDAY && minutes >= OPEN_HOUR * 60) {
    // After open on Wed (including after close) → next week
    daysUntilWed = 7;
  } else if (daysUntilWed === 0) {
    daysUntilWed = 7;
  }
  target.setDate(target.getDate() + daysUntilWed);
  target.setHours(OPEN_HOUR, 0, 0, 0);
  return target;
}

/**
 * When registration closes for the current open day (Wednesday 10:00 PM), or null if not an open day.
 * @param {Date} [now]
 * @returns {Date | null}
 */
export function getCurrentDayClose(now = new Date()) {
  const d = new Date(now);
  if (d.getDay() !== WEDNESDAY) return null;
  const close = new Date(d);
  close.setHours(CLOSE_HOUR, 0, 0, 0);
  return close;
}

/**
 * @param {Date} [now]
 * @returns {{ label: 'open' | 'closed'; target: Date; message: string }}
 */
export function getCountdownContext(now = new Date()) {
  const open = isRegistrationOpen(now);
  if (open) {
    const close = getCurrentDayClose(now);
    return {
      label: 'open',
      target: close || getNextRegistrationOpen(now),
      message: 'Sign-up for tonight ends at 10:00 PM — get your name in before then.',
    };
  }
  const nextOpen = getNextRegistrationOpen(now);
  return {
    label: 'closed',
    target: nextOpen,
    message: 'Sign-up opens every Wednesday at 11:00 AM. Use the timer below to see when you can join next.',
  };
}

/**
 * Whether we are on Wednesday at or after close hour (time to run reset).
 * @param {Date} [now]
 */
export function shouldRunWeeklyReset(now = new Date()) {
  const d = new Date(now);
  if (d.getDay() !== WEDNESDAY) return false;
  const minutes = d.getHours() * 60 + d.getMinutes();
  return minutes >= CLOSE_HOUR * 60;
}

/**
 * Unique key for the Wednesday calendar day (year-month-day) for idempotent reset.
 * @param {Date} [now]
 */
export function getWednesdayResetKey(now = new Date()) {
  const d = new Date(now);
  // Roll to this week's Wednesday date for the key
  const day = d.getDay();
  const diff = (day - WEDNESDAY + 7) % 7;
  const wed = new Date(d);
  wed.setDate(wed.getDate() - diff);
  return `${wed.getFullYear()}-${wed.getMonth() + 1}-${wed.getDate()}`;
}
