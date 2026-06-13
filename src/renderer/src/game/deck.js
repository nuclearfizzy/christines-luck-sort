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
      deck.push({ id: `${rank}-${suit.key}`, rank, suit: suit.key })
    }
  }
  return deck
}

// Fisher–Yates shuffle — the correct, unbiased way to shuffle a deck.
export function shuffle(deck) {
  const cards = [...deck]
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards
}

// Count how many cards landed on the pile matching their true suit.
export function scorePiles(piles) {
  return SUITS.reduce((total, suit) => {
    const correctHere = piles[suit.key].filter((card) => card.suit === suit.key).length
    return total + correctHere
  }, 0)
}
