/**
 * Derive UI status for the locally remembered player name against server snapshot.
 */
export function derivePlayerStatus(tournament, rawName) {
  const key = String(rawName || '').trim().toLowerCase();
  if (!tournament || !key) return null;

  const pending = tournament.pending?.find((p) => p.name.trim().toLowerCase() === key);
  if (pending) {
    return {
      kind: 'pending',
      label: 'Waiting on the organizer',
      detail: 'Your name is in line. You will get a bell alert when they say yes or no.',
      tone: 'yellow',
    };
  }
  const slot = tournament.slots?.find((p) => p.name.trim().toLowerCase() === key);
  if (slot) {
    const idx = tournament.slots.findIndex((p) => p.name.trim().toLowerCase() === key);
    return {
      kind: 'slot',
      label: 'You have a table spot',
      detail: `You are player ${idx + 1} of ${tournament.slots.length} at the tables right now.`,
      tone: 'green',
    };
  }
  const wl = tournament.waitlist?.find((p) => p.name.trim().toLowerCase() === key);
  if (wl) {
    return {
      kind: 'waitlist',
      label: 'You are on the waitlist',
      detail: `You are number ${wl.position} in line if a table opens up.`,
      tone: 'yellow',
    };
  }
  const rej = tournament.rejected?.find((p) => p.name.trim().toLowerCase() === key);
  if (rej) {
    return {
      kind: 'rejected',
      label: 'This signup was not approved',
      detail: 'After the weekly reset you can try again with a new request.',
      tone: 'red',
    };
  }
  return null;
}
