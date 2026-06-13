// A classic blue playing-card back for the Zener cards: an all-over
// four-point-star lattice on white inside a double border frame.

const BLUE = '#2f63b5'

// One lattice "sparkle" (a 4-point star) authored in a 20x20 box.
const STAR = 'M10,2 L11.98,8.02 L18,10 L11.98,11.98 L10,18 L8.02,11.98 L2,10 L8.02,8.02 Z'

export default function ZenerBack() {
  return (
    <svg className="zener-back" viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* Tile is 15 (star scaled to 0.75) for a dense lattice. */}
        <pattern id="zlattice" width="15" height="15" patternUnits="userSpaceOnUse">
          <g transform="scale(0.75)">
            <path d={STAR} fill={BLUE} />
          </g>
          <circle cx="0" cy="0" r="1" fill={BLUE} />
          <circle cx="15" cy="0" r="1" fill={BLUE} />
          <circle cx="0" cy="15" r="1" fill={BLUE} />
          <circle cx="15" cy="15" r="1" fill={BLUE} />
        </pattern>
      </defs>

      {/* White base + uniform all-over lattice (nothing covering it). */}
      <rect x="0" y="0" width="120" height="168" fill="#fdfdfb" />
      <rect x="0" y="0" width="120" height="168" fill="url(#zlattice)" />

      {/* Double border frame (solid + beaded). */}
      <rect x="3" y="3" width="114" height="162" rx="9" fill="none" stroke={BLUE} strokeWidth="2" />
      <rect
        x="7"
        y="7"
        width="106"
        height="154"
        rx="6"
        fill="none"
        stroke={BLUE}
        strokeWidth="0.8"
        strokeDasharray="1 3"
      />
    </svg>
  )
}
