import { useEffect } from 'react';

/**
 * Full-screen confirmation before wiping all tournament lists (organizer reset).
 * Escape and backdrop click close without confirming.
 */
export function ResetWeekModal({ open, onClose, onConfirm }) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop: no tab stop so focus goes to the dialog */}
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
        aria-labelledby="reset-week-modal-title"
        aria-describedby="reset-week-modal-desc"
        className="relative z-[1] w-full max-w-md rounded-2xl border border-red-500/40 bg-slate-900 shadow-2xl shadow-red-900/20 p-5 sm:p-6 animate-slideIn"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-lg mb-4">
          ⚠
        </div>
        <h2 id="reset-week-modal-title" className="text-lg font-semibold text-white">
          Start a completely clean week?
        </h2>
        <p id="reset-week-modal-desc" className="mt-2 text-sm text-slate-400 leading-relaxed">
          This removes every name from the tables, waitlist, waiting list, and anyone marked &quot;no&quot; for this
          week. Players also lose saved bell notifications on their devices. This cannot be undone from here.
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
            className="rounded-xl px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white border border-red-400/50"
          >
            Yes, reset everything
          </button>
        </div>
      </div>
    </div>
  );
}
