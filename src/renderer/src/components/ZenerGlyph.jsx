// Draws one of the five classic Zener symbols as a vector shape, so it stays
// crisp at any size. Colour follows the surrounding text colour (currentColor).
export default function ZenerGlyph({ symbol, size = 40 }) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }
  const svgProps = { width: size, height: size, viewBox: '0 0 100 100' }

  switch (symbol) {
    case 'circle':
      return (
        <svg {...svgProps}>
          <circle cx="50" cy="50" r="34" {...stroke} />
        </svg>
      )
    case 'cross':
      return (
        <svg {...svgProps}>
          <path d="M50 14 V86 M14 50 H86" {...stroke} />
        </svg>
      )
    case 'square':
      return (
        <svg {...svgProps}>
          <rect x="20" y="20" width="60" height="60" rx="3" {...stroke} />
        </svg>
      )
    case 'waves':
      return (
        <svg {...svgProps}>
          <path d="M14 32 q 9 -12 18 0 t 18 0 t 18 0 t 18 0" {...stroke} />
          <path d="M14 50 q 9 -12 18 0 t 18 0 t 18 0 t 18 0" {...stroke} />
          <path d="M14 68 q 9 -12 18 0 t 18 0 t 18 0 t 18 0" {...stroke} />
        </svg>
      )
    case 'star':
      return (
        <svg {...svgProps}>
          <path
            d="M50 8 L61.8 38.2 L94 39.5 L68.5 59.6 L77.6 90.5 L50 72.5 L22.4 90.5 L31.5 59.6 L6 39.5 L38.2 38.2 Z"
            fill="currentColor"
          />
        </svg>
      )
    default:
      return null
  }
}
