// An ornate Moroccan/Spanish "zellige" tile back, used only for Zener cards.
// It mixes a tessellated 8-pointed-star tile pattern with the framed border and
// central medallion of a classic playing-card back.

// An 8-pointed star (khatim), drawn in a 40x40 tile centred at (20,20).
const STAR =
  'M20,3 L23.06,12.61 L32.02,7.98 L27.39,16.94 L37,20 L27.39,23.06 ' +
  'L32.02,32.02 L23.06,27.39 L20,37 L16.94,27.39 L7.98,32.02 L12.61,23.06 ' +
  'L3,20 L12.61,16.94 L7.98,7.98 L16.94,12.61 Z'

export default function ZenerBack() {
  return (
    <svg className="zener-back" viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* One repeating tile: a gold star on deep teal, with terracotta
            diamonds at the corners that join up across neighbouring tiles. */}
        <pattern id="zellige" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#15394d" />
          <path d={STAR} fill="#e0b352" stroke="#f3e7c6" strokeWidth="0.8" />
          <path d="M0,-5 L5,0 L0,5 L-5,0 Z" fill="#c2562f" />
          <path d="M40,-5 L45,0 L40,5 L35,0 Z" fill="#c2562f" />
          <path d="M0,35 L5,40 L0,45 L-5,40 Z" fill="#c2562f" />
          <path d="M40,35 L45,40 L40,45 L35,40 Z" fill="#c2562f" />
        </pattern>
      </defs>

      {/* Base + all-over tile pattern. */}
      <rect x="0" y="0" width="120" height="168" fill="#15394d" />
      <rect x="6" y="6" width="108" height="156" rx="6" fill="url(#zellige)" />

      {/* Central medallion — the focal point of a playing-card back. */}
      <circle cx="60" cy="84" r="23" fill="#15394d" stroke="#e7c66b" strokeWidth="1.5" />
      <path
        d={STAR}
        transform="translate(60,84) scale(1.25) translate(-20,-20)"
        fill="#e0b352"
        stroke="#f3e7c6"
        strokeWidth="0.8"
      />

      {/* Ornate double border frame. */}
      <rect x="3.5" y="3.5" width="113" height="161" rx="10" fill="none" stroke="#e7c66b" strokeWidth="2" />
      <rect x="7.5" y="7.5" width="105" height="153" rx="7" fill="none" stroke="#c2562f" strokeWidth="1" />
    </svg>
  )
}
