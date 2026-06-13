// Pure game logic — no React, no UI. Just cards and rules.

// The four suits, with everything the UI needs to draw them.
export const SUITS = [
  { key: 'spades', symbol: '♠', color: 'black', label: 'Spades' },
  { key: 'hearts', symbol: '♥', color: 'red', label: 'Hearts' },
  { key: 'diamonds', symbol: '♦', color: 'red', label: 'Diamonds' },
  { key: 'clubs', symbol: '♣', color: 'black', label: 'Clubs' }
]

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const TOTAL_CARDS = SUITS.length * RANKS.length // 52

// Build a fresh, ordered 52-card deck.
export function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}-${suit.key}`, rank, suit: suit.key, group: suit.key })
    }
  }
  return deck
}

// Fisher–Yates shuffle — the correct, unbiased way to shuffle a deck.
// Accepts an optional random function so we can produce a repeatable shuffle.
export function shuffle(deck, rng = Math.random) {
  const cards = [...deck]
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

// A tiny seedable random generator (mulberry32). Same seed -> same sequence.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Turn any string (e.g. today's date) into a 32-bit number to seed the generator.
function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// A shuffle that is IDENTICAL for a given seed string — powers the Daily
// Challenge, so every player gets the same deck on the same day.
export function seededShuffle(deck, seedString) {
  return shuffle(deck, mulberry32(hashString(seedString)))
}

// --- Zener (ESP) cards -------------------------------------------------------
// The classic parapsychology deck: 5 symbols, 5 of each = 25 cards.
// Guessing blind, pure chance averages 5 correct out of 25.
export const ZENER_SYMBOLS = [
  { key: 'circle', label: 'Circle' },
  { key: 'cross', label: 'Cross' },
  { key: 'waves', label: 'Waves' },
  { key: 'square', label: 'Square' },
  { key: 'star', label: 'Star' }
]
export const ZENER_PER_SYMBOL = 5
export const ZENER_TOTAL = ZENER_SYMBOLS.length * ZENER_PER_SYMBOL // 25

export function createZenerDeck() {
  const deck = []
  for (const sym of ZENER_SYMBOLS) {
    for (let i = 0; i < ZENER_PER_SYMBOL; i++) {
      deck.push({ id: `${sym.key}-${i}`, symbol: sym.key, group: sym.key })
    }
  }
  return deck
}

// Count how many cards landed on the pile matching their own category.
// Each card carries a `group` key; each pile is keyed by a category key.
// Works for both playing-card suits and Zener symbols.
export function scorePiles(piles, categories = SUITS) {
  return categories.reduce((total, cat) => {
    const correctHere = piles[cat.key].filter((card) => card.group === cat.key).length
    return total + correctHere
  }, 0)
}
