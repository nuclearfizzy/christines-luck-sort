// A classic blue playing-card back for the Zener cards, inspired by the
// traditional ornate design: an all-over four-point-star lattice on white,
// a double border frame, and a central petal-rosette medallion.

const BLUE = '#2f63b5'
const CX = 60
const CY = 84

// One lattice "sparkle" (a 4-point star) drawn in a 20x20 tile.
const STAR = 'M10,2 L11.98,8.02 L18,10 L11.98,11.98 L10,18 L8.02,11.98 L2,10 L8.02,8.02 Z'
// A medallion petal, pointing up from the centre.
const PETAL = 'M0,-6 C 4,-11 4,-15 0,-19 C -4,-15 -4,-11 0,-6 Z'
const INNER_PETAL = 'M0,-5 C 3,-8 3,-11 0,-13 C -3,-11 -3,-8 0,-5 Z'

const outerPetals = Array.from({ length: 16 }, (_, i) => i * 22.5)
const innerPetals = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5)
const beads = Array.from({ length: 24 }, (_, i) => (i * 360) / 24)

export default function ZenerBack() {
  return (
    <svg className="zener-back" viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* Tile is 15 (the star path is authored at 20, so it's scaled to 0.75)
            — a denser lattice than a full-size tile. */}
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

      {/* White base + all-over lattice. */}
      <rect x="0" y="0" width="120" height="168" fill="#fdfdfb" />
      <rect x="0" y="0" width="120" height="168" fill="url(#zlattice)" />

      {/* Medallion plaque: a clean framed disc with a white margin, so it
          reads as its own element rather than covering the lattice. */}
      <circle cx={CX} cy={CY} r="31" fill="#fdfdfb" />
      <circle cx={CX} cy={CY} r="31" fill="none" stroke={BLUE} strokeWidth="1.1" />
      <circle cx={CX} cy={CY} r="29" fill="none" stroke={BLUE} strokeWidth="2.2" />

      {/* Beaded ring. */}
      {beads.map((a, i) => {
        const rad = (a * Math.PI) / 180
        return (
          <circle
            key={`b${i}`}
            cx={CX + 26 * Math.cos(rad)}
            cy={CY + 26 * Math.sin(rad)}
            r="1.1"
            fill={BLUE}
          />
        )
      })}
      <circle cx={CX} cy={CY} r="22.5" fill="none" stroke={BLUE} strokeWidth="1" />

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
