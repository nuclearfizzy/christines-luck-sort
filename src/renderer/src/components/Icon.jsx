// A small set of inline SVG icons, used in place of emojis throughout the UI.
// Every icon draws in the current text colour and scales to the `size` prop.
export default function Icon({ name, size = 20, className = '' }) {
  const base = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    className: `icon ${className}`.trim(),
    'aria-hidden': true,
    focusable: false
  }
  const line = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }

  switch (name) {
    case 'clover': {
      const leaf =
        'M0,0 C 1.5,-3 4,-4.5 6,-6.5 C 8,-8.5 7.5,-12 4.5,-12 C 2.5,-12 1,-10 0,-8 ' +
        'C -1,-10 -2.5,-12 -4.5,-12 C -7.5,-12 -8,-8.5 -6,-6.5 C -4,-4.5 -1.5,-3 0,0 Z'
      return (
        <svg {...base} fill="currentColor">
          {[45, 135, 225, 315].map((a) => (
            <path key={a} d={leaf} transform={`translate(12,12) rotate(${a}) scale(0.7)`} />
          ))}
        </svg>
      )
    }
    case 'fire':
      return (
        <svg {...base} fill="currentColor">
          <path d="M12 2 C9 6 7 8 7 13 a5 5 0 0 0 10 0 c0-2-1-3.5-2-5 -1 2-2.5 2-3 0 -0.5-2 0.5-4 0-6 Z" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...base} fill="currentColor">
          <path d="M21 12.8 A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8 Z" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...base} {...line}>
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      )
    case 'eye':
      return (
        <svg {...base} {...line}>
          <path d="M2 12 C5 6 19 6 22 12 C19 18 5 18 2 12 Z" />
          <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...base} {...line}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        </svg>
      )
    case 'crystal':
      return (
        <svg {...base} {...line}>
          <circle cx="12" cy="9.5" r="6.5" />
          <path d="M7 16 H17 L19 21 H5 Z" />
          <path d="M9.5 7.5a3 3 0 0 1 3-1.6" strokeWidth="1.4" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg {...base} fill="currentColor">
          <path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z" />
          <path d="M19 3 L19.6 5.4 L22 6 L19.6 6.6 L19 9 L18.4 6.6 L16 6 L18.4 5.4 Z" />
        </svg>
      )
    case 'star':
      return (
        <svg {...base} fill="currentColor">
          <path d="M12 2 l2.95 6.6 7.05 .7 -5.3 4.7 1.55 6.95 -6.25 -3.7 -6.25 3.7 1.55 -6.95 -5.3 -4.7 7.05 -.7 Z" />
        </svg>
      )
    case 'burst':
      return (
        <svg {...base} fill="currentColor">
          <path d="M12 1 L13.5 8.3 L19.2 4.2 L15.7 9.8 L22.8 11 L15.7 12.2 L19.2 17.8 L13.5 13.7 L12 21 L10.5 13.7 L4.8 17.8 L8.3 12.2 L1.2 11 L8.3 9.8 L4.8 4.2 L10.5 8.3 Z" />
        </svg>
      )
    case 'trophy':
      return (
        <svg {...base} {...line}>
          <path d="M7 4h10v4a5 5 0 0 1-10 0z" fill="currentColor" stroke="none" />
          <path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3" />
          <path d="M12 13v4M9 20h6M10.5 17h3" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...base} {...line}>
          <path d="M20 11a8 8 0 1 0-2 6" />
          <path d="M20 4v5h-5" />
        </svg>
      )
    case 'clipboard':
      return (
        <svg {...base} {...line}>
          <rect x="6" y="4" width="12" height="16" rx="2" />
          <rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...base} {...line}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      )
    case 'smile':
      return (
        <svg {...base} {...line}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 14a4 4 0 0 0 7 0" />
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'dice':
      return (
        <svg {...base} {...line}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <g fill="currentColor" stroke="none">
            <circle cx="8.5" cy="8.5" r="1.3" />
            <circle cx="15.5" cy="8.5" r="1.3" />
            <circle cx="12" cy="12" r="1.3" />
            <circle cx="8.5" cy="15.5" r="1.3" />
            <circle cx="15.5" cy="15.5" r="1.3" />
          </g>
        </svg>
      )
    case 'frown':
      return (
        <svg {...base} {...line}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 15.5a4 4 0 0 1 7 0" />
          <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    default:
      return null
  }
}
