// The Zener card back, themed to match the current mode:
//   dark  -> a blue/white Portuguese "azulejo" tile pattern with orange diamonds
//   light -> a soft pastel floral cottage-tile pattern
// Both share a bordered central medallion, and the tile pattern is softly faded
// out around it (radial mask) so no tile is ever chopped in half.

const PALETTE = {
  azulejo: {
    bg: '#fdfdfb',
    main: '#2f63b5',
    inner: '#2f63b5',
    center: '#e8951f',
    frame: '#2f63b5',
    frame2: '#e8951f'
  },
  floral: {
    bg: '#f8f1e1',
    main: '#cf6f8c',
    inner: '#9bb58c',
    center: '#d2a23f',
    frame: '#9bb58c',
    frame2: '#cf6f8c'
  }
}

const CX = 60
const CY = 84

const PETAL = 'M0,-6 C 4,-11 4,-15 0,-19 C -4,-15 -4,-11 0,-6 Z'
const INNER_PETAL = 'M0,-5 C 3,-8 3,-11 0,-13 C -3,-11 -3,-8 0,-5 Z'
const TILE_PETAL = 'M0,-3 C 2.6,-6 2.6,-9 0,-11 C -2.6,-9 -2.6,-6 0,-3 Z'

const outerPetals = Array.from({ length: 16 }, (_, i) => i * 22.5)
const innerPetals = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5)
const beads = Array.from({ length: 22 }, (_, i) => (i * 360) / 22)
const tilePetals = Array.from({ length: 8 }, (_, i) => i * 45)

export default function ZenerBack() {
  const theme =
    (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'dark'
  // Swapped: dark mode shows the floral back, light mode shows the azulejo back.
  const floral = theme === 'dark'
  const p = PALETTE[floral ? 'floral' : 'azulejo']

  return (
    <svg className="zener-back" viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {floral ? (
          // Floral cottage tile.
          <pattern id="zpat" width="30" height="30" patternUnits="userSpaceOnUse">
            {tilePetals.map((a, i) => (
              <path key={i} d={TILE_PETAL} fill={p.main} transform={`translate(15,15) rotate(${a})`} />
            ))}
            <circle cx="15" cy="15" r="2.8" fill={p.center} />
            <circle cx="0" cy="0" r="1.8" fill={p.inner} />
            <circle cx="30" cy="0" r="1.8" fill={p.inner} />
            <circle cx="0" cy="30" r="1.8" fill={p.inner} />
            <circle cx="30" cy="30" r="1.8" fill={p.inner} />
            <circle cx="15" cy="0" r="1.1" fill={p.center} />
            <circle cx="0" cy="15" r="1.1" fill={p.center} />
            <circle cx="30" cy="15" r="1.1" fill={p.center} />
            <circle cx="15" cy="30" r="1.1" fill={p.center} />
          </pattern>
        ) : (
          // Azulejo: blue circles at the tile corners + an orange diamond centre.
          <pattern id="zpat" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="15" fill={p.main} />
            <circle cx="30" cy="0" r="15" fill={p.main} />
            <circle cx="0" cy="30" r="15" fill={p.main} />
            <circle cx="30" cy="30" r="15" fill={p.main} />
            <path d="M15,9 L21,15 L15,21 L9,15 Z" fill={p.center} />
          </pattern>
        )}

      </defs>

      {/* Base + tile pattern across the whole card. */}
      <rect x="0" y="0" width="120" height="168" fill={p.bg} />
      <rect x="0" y="0" width="120" height="168" fill="url(#zpat)" />

      {/* Medallion: a solid border ring around a clean disc. */}
      <circle cx={CX} cy={CY} r="28.5" fill={p.main} />
      <circle cx={CX} cy={CY} r="26" fill={p.bg} />

      {/* Beaded ring. */}
      {beads.map((a, i) => {
        const rad = (a * Math.PI) / 180
        return (
          <circle
            key={`b${i}`}
            cx={CX + 23.5 * Math.cos(rad)}
            cy={CY + 23.5 * Math.sin(rad)}
            r="1.1"
            fill={p.inner}
          />
        )
      })}
      <circle cx={CX} cy={CY} r="21" fill="none" stroke={p.inner} strokeWidth="1" />

      {/* Petal rosette (two layers). */}
      {outerPetals.map((a, i) => (
        <path key={`p${i}`} d={PETAL} fill={p.main} transform={`translate(${CX},${CY}) rotate(${a})`} />
      ))}
      {innerPetals.map((a, i) => (
        <path
          key={`ip${i}`}
          d={INNER_PETAL}
          fill={p.inner}
          transform={`translate(${CX},${CY}) rotate(${a})`}
        />
      ))}

      {/* Centre boss. */}
      <circle cx={CX} cy={CY} r="6" fill={p.bg} />
      <circle cx={CX} cy={CY} r="6" fill="none" stroke={p.main} strokeWidth="1.2" />
      <circle cx={CX} cy={CY} r="3" fill={p.center} />

      {/* Double border frame. */}
      <rect x="3" y="3" width="114" height="162" rx="9" fill="none" stroke={p.frame} strokeWidth="2" />
      <rect
        x="7"
        y="7"
        width="106"
        height="154"
        rx="6"
        fill="none"
        stroke={p.frame2}
        strokeWidth="0.8"
        strokeDasharray="1 3"
      />
    </svg>
  )
}
