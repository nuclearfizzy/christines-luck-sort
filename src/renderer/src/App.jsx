import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SUITS, TOTAL_CARDS, createDeck, shuffle, scorePiles } from './game/deck'
import Card from './components/Card'

const BEST_KEY = 'cls-best-score' // where we remember your best score

// Start every suit pile as an empty list.
function emptyPiles() {
  return SUITS.reduce((acc, suit) => ({ ...acc, [suit.key]: [] }), {})
}

// A little encouraging message based on how lucky you were.
function verdict(score) {
  if (score === TOTAL_CARDS) return { emoji: '🤯', text: 'A FLAWLESS deck?! That should be statistically impossible. Are you a wizard?' }
  if (score >= 30) return { emoji: '🌟', text: 'Astonishing luck — the cards adore you!' }
  if (score >= 20) return { emoji: '🍀', text: 'Wonderfully lucky — well above average!' }
  if (score >= 14) return { emoji: '✨', text: 'A touch better than average. Nicely done!' }
  if (score >= 11) return { emoji: '🙂', text: 'Right around the expected average of 13. The math holds!' }
  if (score >= 6) return { emoji: '🎲', text: 'A little unlucky this round — give it another shuffle!' }
  return { emoji: '😅', text: 'Ouch! The deck was not on your side. Try again!' }
}

export default function App() {
  const [deck, setDeck] = useState([])
  const [piles, setPiles] = useState(emptyPiles())
  const [phase, setPhase] = useState('placing') // 'placing' | 'revealed'
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_KEY)) || 0)

  // Deal a brand-new shuffled deck.
  const newGame = useCallback(() => {
    setDeck(shuffle(createDeck()))
    setPiles(emptyPiles())
    setPhase('placing')
  }, [])

  useEffect(() => {
    newGame()
  }, [newGame])

  const placed = TOTAL_CARDS - deck.length
  const currentCard = deck[0] ?? null
  const allPlaced = deck.length === 0

  // Place the top (face-down) card onto the chosen suit pile.
  const placeOn = useCallback(
    (suitKey) => {
      if (phase !== 'placing') return
      setDeck((prevDeck) => {
        if (prevDeck.length === 0) return prevDeck
        const [top, ...rest] = prevDeck
        setPiles((prevPiles) => ({ ...prevPiles, [suitKey]: [...prevPiles[suitKey], top] }))
        return rest
      })
    },
    [phase]
  )

  const score = useMemo(() => scorePiles(piles), [piles])

  const reveal = useCallback(() => {
    setPhase('revealed')
    setBestScore((prevBest) => {
      const next = Math.max(prevBest, score)
      localStorage.setItem(BEST_KEY, String(next))
      return next
    })
  }, [score])

  // Keyboard shortcuts: 1–4 place cards, Enter reveals / plays again.
  useEffect(() => {
    function onKey(e) {
      if (phase === 'placing') {
        const index = ['1', '2', '3', '4'].indexOf(e.key)
        if (index !== -1) placeOn(SUITS[index].key)
        if (e.key === 'Enter' && allPlaced) reveal()
      } else if (e.key === 'Enter') {
        newGame()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, allPlaced, placeOn, reveal, newGame])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__leaf">🍀</span>
          <h1 className="brand__title">Christine&rsquo;s Luck Sort</h1>
        </div>
        <div className="topbar__right">
          <div className="best">
            <span className="best__label">Best</span>
            <span className="best__value">{bestScore}</span>
          </div>
          <button className="btn btn--ghost" onClick={newGame}>
            New Deck
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {phase === 'placing' ? (
          <motion.main
            key="placing"
            className="stage"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <p className="hint">
              No peeking! Guess each card&rsquo;s suit and place it on a pile.
            </p>

            <div className="progress">
              <div className="progress__bar">
                <motion.div
                  className="progress__fill"
                  animate={{ width: `${(placed / TOTAL_CARDS) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="progress__label">{placed} / {TOTAL_CARDS} placed</span>
            </div>

            <section className="deck-zone">
              {!allPlaced ? (
                <div className="deck-stack" aria-label={`${deck.length} cards remaining`}>
                  {/* A few stacked backs for depth, plus the live top card. */}
                  <div className="deck-stack__shadow deck-stack__shadow--3" />
                  <div className="deck-stack__shadow deck-stack__shadow--2" />
                  <div className="deck-stack__shadow deck-stack__shadow--1" />
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentCard?.id}
                      className="deck-stack__top"
                      initial={{ scale: 0.92, opacity: 0, y: 8 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Card card={currentCard} faceUp={false} />
                    </motion.div>
                  </AnimatePresence>
                  <span className="deck-stack__count">{deck.length} left</span>
                </div>
              ) : (
                <motion.div
                  className="reveal-prompt"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <p>All 52 cards are placed!</p>
                  <motion.button
                    className="btn btn--primary btn--big"
                    onClick={reveal}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Reveal the cards ✨
                  </motion.button>
                </motion.div>
              )}
            </section>

            <section className="piles">
              {SUITS.map((suit, i) => (
                <motion.button
                  key={suit.key}
                  className={`pile pile--${suit.color}`}
                  onClick={() => placeOn(suit.key)}
                  disabled={allPlaced}
                  whileHover={allPlaced ? {} : { scale: 1.03, y: -4 }}
                  whileTap={allPlaced ? {} : { scale: 0.98 }}
                >
                  <span className="pile__symbol">{suit.symbol}</span>
                  <span className="pile__label">{suit.label}</span>
                  <span className="pile__count">{piles[suit.key].length}</span>
                  <span className="pile__key">{i + 1}</span>
                </motion.button>
              ))}
            </section>
          </motion.main>
        ) : (
          <motion.main
            key="revealed"
            className="stage stage--results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Results piles={piles} score={score} bestScore={bestScore} onPlayAgain={newGame} />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

// The reveal screen: your score, a verdict, and every pile flipped face-up.
function Results({ piles, score, bestScore, onPlayAgain }) {
  const { emoji, text } = verdict(score)
  const isBest = score >= bestScore && score > 0

  return (
    <>
      <motion.div
        className="scoreboard"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14 }}
      >
        <span className="scoreboard__emoji">{emoji}</span>
        <div className="scoreboard__score">
          <span className="scoreboard__big">{score}</span>
          <span className="scoreboard__total">/ {TOTAL_CARDS} correct</span>
        </div>
        {isBest && <span className="scoreboard__badge">New best! 🎉</span>}
        <p className="scoreboard__verdict">{text}</p>
      </motion.div>

      <div className="result-piles">
        {SUITS.map((suit) => {
          const cards = piles[suit.key]
          const correct = cards.filter((c) => c.suit === suit.key).length
          return (
            <div key={suit.key} className={`result-pile result-pile--${suit.color}`}>
              <header className="result-pile__head">
                <span className="result-pile__symbol">{suit.symbol}</span>
                <span className="result-pile__label">{suit.label}</span>
                <span className="result-pile__score">
                  {correct}/{cards.length} correct
                </span>
              </header>
              <div className="result-pile__cards">
                {cards.map((card, idx) => (
                  <motion.div
                    key={card.id}
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.012, duration: 0.25 }}
                    style={{ zIndex: idx }}
                  >
                    <Card card={card} faceUp correct={card.suit === suit.key} small />
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <motion.button
        className="btn btn--primary btn--big"
        onClick={onPlayAgain}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        Play again 🔄
      </motion.button>
    </>
  )
}
