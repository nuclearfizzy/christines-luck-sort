// A classic blue playing-card back for the Zener cards, inspired by the
// traditional ornate design: an all-over four-point-star lattice on white,
// a double border frame, and a central petal-rosette medallion.

const BLUE = '#2f63b5'
const CX = 60
const CY = 84

// One lattice "sparkle" (a 4-point star) drawn in a 20x20 tile.
const STAR = 'M10,2 L11.98,8.02 L18,10 L11.98,11.98 L10,18 L8.02,11.98 L2,10 L8.02,8.02 Z'
// A medallion petal, pointing up from the centre.
const PETAL = 'M0,-6 C 4,-11 4,-16 0,-20 C -4,-16 -4,-11 0,-6 Z'
const INNER_PETAL = 'M0,-5 C 3,-8 3,-11 0,-13 C -3,-11 -3,-8 0,-5 Z'

const outerPetals = Array.from({ length: 16 }, (_, i) => i * 22.5)
const innerPetals = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5)
const beads = Array.from({ length: 28 }, (_, i) => (i * 360) / 28)

export default function ZenerBack() {
  return (
    <svg className="zener-back" viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="zlattice" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d={STAR} fill={BLUE} />
          <circle cx="0" cy="0" r="1.3" fill={BLUE} />
          <circle cx="20" cy="0" r="1.3" fill={BLUE} />
          <circle cx="0" cy="20" r="1.3" fill={BLUE} />
          <circle cx="20" cy="20" r="1.3" fill={BLUE} />
        </pattern>
      </defs>

      {/* White base + all-over lattice. */}
      <rect x="0" y="0" width="120" height="168" fill="#fdfdfb" />
      <rect x="0" y="0" width="120" height="168" fill="url(#zlattice)" />

      {/* Clear halo so the medallion reads against the busy field. */}
      <circle cx={CX} cy={CY} r="30" fill="#fdfdfb" />

      {/* Beaded outer ring. */}
      {beads.map((a, i) => {
        const rad = (a * Math.PI) / 180
        return (
          <circle
            key={`b${i}`}
            cx={CX + 27 * Math.cos(rad)}
            cy={CY + 27 * Math.sin(rad)}
            r="1.1"
            fill={BLUE}
          />
        )
      })}
      <circle cx={CX} cy={CY} r="24" fill="none" stroke={BLUE} strokeWidth="1.2" />

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
