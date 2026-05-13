export function EightBallLogo({ className = 'h-10 w-10' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" className="fill-slate-950 stroke-white/20" strokeWidth="2" />
      <circle cx="32" cy="32" r="26" className="fill-slate-900" />
      <circle cx="32" cy="32" r="14" className="fill-white" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        className="fill-slate-950 font-bold"
        style={{ fontSize: '16px', fontFamily: 'system-ui' }}
      >
        8
      </text>
      <ellipse cx="22" cy="22" rx="8" ry="4" className="fill-white/25" transform="rotate(-35 22 22)" />
    </svg>
  );
}
