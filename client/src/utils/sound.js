/** Optional UI beep — browser autoplay policies may block until user gesture */
export function playSoftChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    o.start(now);
    o.stop(now + 0.22);
  } catch {
    /* ignore */
  }
}
