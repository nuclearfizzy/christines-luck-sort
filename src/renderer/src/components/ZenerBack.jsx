// A classic blue playing-card back for the Zener cards: an all-over
// four-point-star lattice on white, a central petal-rosette medallion with a
// solid border, and a double border frame.
//
// To avoid the medallion chopping background stars in half, the lattice is
// softly faded out (via a radial mask) in the area around the medallion, so
// stars gently disappear rather than being hard-clipped.

const BLUE = '#2f63b5'
const CX = 60
const CY = 84

const STAR = 'M10,2 L11.98,8.02 L18,10 L11.98,11.98 L10,18 L8.02,11.98 L2,10 L8.02,8.02 Z'
const PETAL = 'M0,-6 C 4,-11 4,-15 0,-19 C -4,-15 -4,-11 0,-6 Z'
const INNER_PETAL = 'M0,-5 C 3,-8 3,-11 0,-13 C -3,-11 -3,-8 0,-5 Z'

const outerPetals = Array.from({ length: 16 }, (_, i) => i * 22.5)
const innerPetals = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5)
const beads = Array.from({ length: 22 }, (_, i) => (i * 360) / 22)

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

        {/* Fades the lattice out near the medallion so no star is hard-clipped. */}
        <radialGradient id="zfade" cx={CX} cy={CY} r="46" gradientUnits="userSpaceOnUse">
          <stop offset="0.62" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </radialGradient>
        <mask id="zlatmask">
          <rect x="0" y="0" width="120" height="168" fill="#fff" />
          <rect x="0" y="0" width="120" height="168" fill="url(#zfade)" />
        </mask>
      </defs>

      {/* White base + lattice, faded out around the centre. */}
      <rect x="0" y="0" width="120" height="168" fill="#fdfdfb" />
      <rect x="0" y="0" width="120" height="168" fill="url(#zlattice)" mask="url(#zlatmask)" />

      {/* Medallion: a solid blue border ring around a clean disc. */}
      <circle cx={CX} cy={CY} r="28.5" fill={BLUE} />
      <circle cx={CX} cy={CY} r="26" fill="#fdfdfb" />

      {/* Beaded ring. */}
      {beads.map((a, i) => {
        const rad = (a * Math.PI) / 180
        return (
          <circle
            key={`b${i}`}
            cx={CX + 23.5 * Math.cos(rad)}
            cy={CY + 23.5 * Math.sin(rad)}
            r="1"
            fill={BLUE}
          />
        )
      })}
      <circle cx={CX} cy={CY} r="21" fill="none" stroke={BLUE} strokeWidth="1" />

      {/* Petal rosette (two layers). */}
      {outerPetals.map((a, i) => (
        <path key={`p${i}`} d={PETAL} fill={BLUE} transform={`translate(${CX},${CY}) rotate(${a})`} />
      ))}
      {innerPetals.map((a, i) => (
        <path
          key={`ip${i}`}
          d={INNER_PETAL}
          fill={BLUE}
          transform={`translate(${CX},${CY}) rotate(${a})`}
        />
      ))}

      {/* Centre boss. */}
      <circle cx={CX} cy={CY} r="6" fill="#fdfdfb" />
      <circle cx={CX} cy={CY} r="6" fill="none" stroke={BLUE} strokeWidth="1.4" />
      <circle cx={CX} cy={CY} r="2.4" fill={BLUE} />

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
