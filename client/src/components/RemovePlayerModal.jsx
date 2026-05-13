import { useEffect } from 'react';

const copy = {
  table: {
    title: 'Remove this player from the table?',
    body: (name) =>
      `${name} will lose their table spot. If anyone is on the waitlist, the next person in line may move up automatically.`,
    confirm: 'Yes, remove from table',
  },
  waitlist: {
    title: 'Remove this player from the waitlist?',
    body: (name) =>
      `${name} will lose their place in line. They will not get a "not approved" message unless you use "Say no" instead.`,
    confirm: 'Yes, remove from line',
  },
  reject: {
    title: 'Turn down this player?',
    body: (name) =>
      `${name} will be marked as not approved and will get a bell notification. You can still change lists later if that was a mistake.`,
    confirm: 'Yes, turn down',
  },
};

/**
 * Confirm before organizer removes someone from the table, waitlist, or rejects them.
 */
export function RemovePlayerModal({ open, variant, playerName, onClose, onConfirm }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !variant || !playerName) return null;

  const cfg = copy[variant];
  if (!cfg) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm border-0 p-0 cursor-default"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-player-modal-title"
        aria-describedby="remove-player-modal-desc"
        className="relative z-[1] w-full max-w-md rounded-2xl border border-amber-500/35 bg-slate-900 shadow-2xl shadow-amber-900/15 p-5 sm:p-6 animate-slideIn"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-200 text-lg mb-4">
          ?
        </div>
        <h2 id="remove-player-modal-title" className="text-lg font-semibold text-white">
          {cfg.title}
        </h2>
        <p id="remove-player-modal-desc" className="mt-2 text-sm text-slate-400 leading-relaxed">
          {cfg.body(playerName)}
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium border border-white/15 text-slate-200 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/40"
          >
            {cfg.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
