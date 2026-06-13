// Generates the app icon: four cards (one per suit) fanned like a hand on a
// black background. Run with `npm run icon`.
//
// We draw everything as vector shapes (suits are paths, ranks are Arial text)
// so it renders crisply at any size, then rasterize to a multi-resolution .ico.
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const buildDir = join(root, 'build')

// --- Suit shapes (drawn in a 0..100 box, centered near 50,50) ---------------
const SUIT_PATHS = {
  spades:
    'M50,6 C50,6 16,38 16,60 C16,74 30,79 41,72 C39,82 34,89 27,93 L73,93 C66,89 61,82 59,72 C70,79 84,74 84,60 C84,38 50,6 50,6 Z',
  hearts:
    'M50,90 C50,90 12,58 12,33 C12,17 26,11 38,20 C44,24 48,32 50,38 C52,32 56,24 62,20 C74,11 88,17 88,33 C88,58 50,90 50,90 Z',
  diamonds: 'M50,6 L86,50 L50,94 L14,50 Z',
  clubs:
    'M50,8 C40,8 32,16 32,26 C32,33 36,39 42,42 C33,39 23,42 23,54 C23,65 33,71 43,67 C41,78 35,88 28,93 L72,93 C65,88 59,78 57,67 C67,71 77,65 77,54 C77,42 67,39 58,42 C64,39 68,33 68,26 C68,16 60,8 50,8 Z'
}

// A "random" card for each suit (fixed so the icon is stable).
const CARDS = [
  { rank: 'A', suit: 'spades', color: '#1a1a1a', angle: -30 },
  { rank: 'K', suit: 'hearts', color: '#d6243b', angle: -10 },
  { rank: '7', suit: 'clubs', color: '#1a1a1a', angle: 10 },
  { rank: 'Q', suit: 'diamonds', color: '#d6243b', angle: 30 }
]

// One corner index (rank + small suit), anchored top-left of the card.
function corner(rank, color, suitPath) {
  return `
    <text x="46" y="64" font-family="Arial, Helvetica, sans-serif" font-weight="700"
          font-size="58" fill="${color}" text-anchor="middle">${rank}</text>
    <g transform="translate(46,100) scale(0.42) translate(-50,-50)">
      <path d="${suitPath}" fill="${color}" />
    </g>`
}

// One full card, positioned by the fan transform (all cards pivot from a point
// near the bottom center, so they spread like a hand).
function card({ rank, suit, color, angle }) {
  const suitPath = SUIT_PATHS[suit]
  const c = corner(rank, color, suitPath)
  return `
  <g transform="translate(512,900) rotate(${angle}) translate(-160,-470)">
    <rect x="0" y="0" width="320" height="470" rx="28" ry="28"
          fill="#fbfbf7" stroke="#cfcfc8" stroke-width="3" />
    <g transform="translate(160,235) scale(1.85) translate(-50,-50)">
      <path d="${suitPath}" fill="${color}" />
    </g>
    ${c}
    <g transform="rotate(180 160 235)">${c}</g>
  </g>`
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#000000" />
  <g filter="url(#shadow)">
    ${CARDS.map(card).join('\n')}
  </g>
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.55" />
    </filter>
  </defs>
</svg>`

// --- Rasterize -> PNGs -> .ico ----------------------------------------------
const sizes = [16, 24, 32, 48, 64, 128, 256]

mkdirSync(buildDir, { recursive: true })
writeFileSync(join(buildDir, 'icon.svg'), svg)

const buffers = await Promise.all(
  sizes.map((size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer())
)

// 256px PNG (handy for the dev window/taskbar icon).
writeFileSync(join(buildDir, 'icon.png'), buffers[buffers.length - 1])

// Bundle every size into a single Windows .ico.
const ico = await pngToIco(buffers)
writeFileSync(join(buildDir, 'icon.ico'), ico)

console.log('✓ Wrote build/icon.ico, build/icon.png, build/icon.svg')
