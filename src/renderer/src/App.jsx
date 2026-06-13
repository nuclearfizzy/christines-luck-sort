import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SUITS, TOTAL_CARDS, createDeck, shuffle, scorePiles } from './game/deck'
import Card from './components/Card'

// localStorage keys — where we remember things between sessions.
const BEST_KEY = 'cls-best-score'
const STREAK_KEY = 'cls-current-streak'
const BEST_STREAK_KEY = 'cls-best-streak'
const HISTORY_KEY = 'cls-history'
const THEME_KEY = 'cls-theme'

const WIN_THRESHOLD = 14 // beating the ~13 average counts as a "win"
const HISTORY_MAX = 12 // how many recent games to remember
const PILE_LIMIT = TOTAL_CARDS / SUITS.length // 13 — a full suit; piles can't exceed it

// Start every suit pile as an empty list.
function emptyPiles() {
  return SUITS.reduce((acc, suit) => ({ ...acc, [suit.key]: [] }), {})
}

// Safely read a saved number (falls back to 0).
function readNumber(key) {
  return Number(localStorage.getItem(key)) || 0
}

// Safely read the saved history array.
function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// A little encouraging message based on how lucky you were.
function verdict(score) {
  if (score === TOTAL_CARDS) return { emoji: '🤯', text: 'A FLAWLESS deck?! That should be statistically impossible. Are you a wizard?' }
  if (score >= 30) return { emoji: '🌟', text: 'Astonishing luck — the cards adore you!' }
  if (score >= 20) return { emoji: '🍀', text: 'Wonderfully lucky — well above average!' }
  if (score >= WIN_THRESHOLD) return { emoji: '✨', text: 'A touch better than average. Nicely done!' }
  if (score >= 11) return { emoji: '🙂', text: 'Right around the expected average of 13. The math holds!' }
  if (score >= 6) return { emoji: '🎲', text: 'A little unlucky this round — give it another shuffle!' }
  return { emoji: '😅', text: 'Ouch! The deck was not on your side. Try again!' }
}

export default function App() {
  const [deck, setDeck] = useState([])
  const [piles, setPiles] = useState(emptyPiles())
  const [phase, setPhase] = useState('placing') // 'placing' | 'revealed'

  // Persisted stats.
  const [bestScore, setBestScore] = useState(() => readNumber(BEST_KEY))
  const [currentStreak, setCurrentStreak] = useState(() => readNumber(STREAK_KEY))
  const [bestStreak, setBestStreak] = useState(() => readNumber(BEST_STREAK_KEY))
  const [history, setHistory] = useState(() => readHistory())

  // Theme ('dark' | 'light'), remembered between sessions.
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')

  // Apply the theme to <html> so the whole app re-skins, and save the choice.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

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
  // A pile holds at most 13 cards (one full suit) — once full, it's locked.
  const placeOn = useCallback(
    (suitKey) => {
      if (phase !== 'placing') return
      if (deck.length === 0) return
      if (piles[suitKey].length >= PILE_LIMIT) return // pile is full
      const [top, ...rest] = deck
      setPiles((prev) => ({ ...prev, [suitKey]: [...prev[suitKey], top] }))
      setDeck(rest)
    },
    [phase, deck, piles]
  )

  const score = useMemo(() => scorePiles(piles), [piles])
  const justWon = score >= WIN_THRESHOLD

  // Reveal & record the round. Everything is computed once here (an event
  // handler runs a single time), so streak/history can't double-count.
  const reveal = useCallback(() => {
    const won = score >= WIN_THRESHOLD
    const nextStreak = won ? currentStreak + 1 : 0
    const nextBestStreak = Math.max(bestStreak, nextStreak)
    const nextBest = Math.max(bestScore, score)
    const nextHistory = [...history, { score, won }].slice(-HISTORY_MAX)

    setBestScore(nextBest)
    setCurrentStreak(nextStreak)
    setBestStreak(nextBestStreak)
    setHistory(nextHistory)
    setPhase('revealed')

    localStorage.setItem(BEST_KEY, String(nextBest))
    localStorage.setItem(STREAK_KEY, String(nextStreak))
    localStorage.setItem(BEST_STREAK_KEY, String(nextBestStreak))
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory))
  }, [score, currentStreak, bestStreak, bestScore, history])

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
          <div className="stat">
            <span className="stat__label">Streak</span>
            <span className="stat__value">{currentStreak > 0 ? `🔥 ${currentStreak}` : '—'}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Best</span>
            <span className="stat__value">{bestScore}</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <span className="theme-toggle__track">
              <span>🌙</span>
              <span>☀️</span>
            </span>
            <span className="theme-toggle__thumb" />
          </button>
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
              No peeking! Guess each card&rsquo;s suit and place it on a pile. Beat
              the average (14+) to build a streak. 🔥
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
              {SUITS.map((suit, i) => {
                const count = piles[suit.key].length
                const full = count >= PILE_LIMIT
                const locked = allPlaced || full
                return (
                  <motion.button
                    key={suit.key}
                    className={`pile pile--${suit.color} ${full ? 'pile--full' : ''}`}
                    onClick={() => placeOn(suit.key)}
                    disabled={locked}
                    whileHover={locked ? {} : { scale: 1.03, y: -4 }}
                    whileTap={locked ? {} : { scale: 0.98 }}
                  >
                    <span className="pile__symbol">{suit.symbol}</span>
                    <span className="pile__label">{suit.label}</span>
                    <span className="pile__count">
                      {count}/{PILE_LIMIT}
                    </span>
                    {full ? (
                      <span className="pile__full">Full ✓</span>
                    ) : (
                      <span className="pile__key">{i + 1}</span>
                    )}
                  </motion.button>
                )
              })}
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
            <Results
              piles={piles}
              score={score}
              bestScore={bestScore}
              won={justWon}
              currentStreak={currentStreak}
              bestStreak={bestStreak}
              history={history}
              onPlayAgain={newGame}
            />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

// The reveal screen: score, verdict, streak stats, history, and flipped piles.
function Results({ piles, score, bestScore, won, currentStreak, bestStreak, history, onPlayAgain }) {
  const { emoji, text } = verdict(score)
  const isBestScore = score >= bestScore && score > 0

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
        <div className="scoreboard__badges">
          {isBestScore && <span className="scoreboard__badge">New best score! 🎉</span>}
          {won && (
            <span className="scoreboard__badge scoreboard__badge--streak">
              🔥 {currentStreak} win streak
            </span>
          )}
        </div>
        <p className="scoreboard__verdict">{text}</p>
      </motion.div>

      <StatsPanel currentStreak={currentStreak} bestStreak={bestStreak} history={history} />

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

// Streak counters plus a little bar chart of your recent scores.
function StatsPanel({ currentStreak, bestStreak, history }) {
  return (
    <div className="stats-panel">
      <div className="stats-panel__row">
        <div className="streak-card">
          <span className="streak-card__value">🔥 {currentStreak}</span>
          <span className="streak-card__label">Current streak</span>
        </div>
        <div className="streak-card">
          <span className="streak-card__value">🏆 {bestStreak}</span>
          <span className="streak-card__label">Best streak</span>
        </div>
      </div>

      <div className="history">
        <span className="history__title">Recent games</span>
        {history.length === 0 ? (
          <span className="history__empty">No games yet — this is your first!</span>
        ) : (
          <div className="history__chart">
            {history.map((entry, idx) => (
              <div className="history__bar-wrap" key={idx} title={`${entry.score} correct`}>
                <motion.div
                  className={`history__bar ${entry.won ? 'is-win' : ''}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((entry.score / TOTAL_CARDS) * 100, 6)}%` }}
                  transition={{ delay: idx * 0.03, type: 'spring', stiffness: 120, damping: 16 }}
                />
                <span className="history__bar-score">{entry.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
