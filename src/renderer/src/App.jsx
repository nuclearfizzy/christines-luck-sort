import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SUITS, TOTAL_CARDS, createDeck, shuffle, seededShuffle, scorePiles } from './game/deck'
import Card from './components/Card'

// localStorage keys — where we remember things between sessions.
const BEST_KEY = 'cls-best-score'
const STREAK_KEY = 'cls-current-streak'
const BEST_STREAK_KEY = 'cls-best-streak'
const HISTORY_KEY = 'cls-history'
const THEME_KEY = 'cls-theme'
const DAILY_KEY = 'cls-daily'

const WIN_THRESHOLD = 14 // beating the ~13 average counts as a "win"
const HISTORY_MAX = 12 // how many recent games to remember
const PILE_LIMIT = TOTAL_CARDS / SUITS.length // 13 — a full suit; piles can't exceed it

// Look up a suit's metadata (symbol / colour) by its key.
const suitMeta = Object.fromEntries(SUITS.map((s) => [s.key, s]))

// --- Date helpers (used by the Daily Challenge) ------------------------------
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Start every suit pile as an empty list.
function emptyPiles() {
  return SUITS.reduce((acc, suit) => ({ ...acc, [suit.key]: [] }), {})
}

// Read a saved number (falls back to 0).
function readNumber(key) {
  return Number(localStorage.getItem(key)) || 0
}

// Read the saved score history array.
function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Read today's daily record (resets automatically when the date changes).
function readDaily() {
  try {
    const d = JSON.parse(localStorage.getItem(DAILY_KEY))
    if (d && d.date === todayKey()) return d
  } catch {
    /* ignore */
  }
  return { date: todayKey(), best: 0, plays: 0 }
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

// Build a deck for the chosen mode (daily uses the date-seeded shuffle).
function makeDeck(mode) {
  if (mode === 'daily') return seededShuffle(createDeck(), `daily-${todayKey()}`)
  return shuffle(createDeck())
}

const MODES = [
  {
    key: 'classic',
    icon: '🍀',
    name: 'Classic',
    desc: 'Pure luck. Sort the deck blind and chase your best streak.'
  },
  {
    key: 'hint',
    icon: '👁️',
    name: 'Hint Mode',
    desc: "See each card's colour before you place it. Practice — doesn't affect your streak."
  },
  {
    key: 'daily',
    icon: '📅',
    name: 'Daily Challenge',
    desc: 'Everyone gets the same deck today. Beat it and share your score!'
  }
]

export default function App() {
  const [view, setView] = useState('menu') // 'menu' | 'placing' | 'revealed'
  const [mode, setMode] = useState('classic')
  const [deck, setDeck] = useState([])
  const [piles, setPiles] = useState(emptyPiles())
  const [lastResult, setLastResult] = useState(null)

  // Persisted Classic stats.
  const [bestScore, setBestScore] = useState(() => readNumber(BEST_KEY))
  const [currentStreak, setCurrentStreak] = useState(() => readNumber(STREAK_KEY))
  const [bestStreak, setBestStreak] = useState(() => readNumber(BEST_STREAK_KEY))
  const [history, setHistory] = useState(() => readHistory())

  // Persisted Daily Challenge record for today.
  const [daily, setDaily] = useState(() => readDaily())

  // Theme ('dark' | 'light'), remembered between sessions.
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // Start a fresh game in the given mode.
  const startGame = useCallback((nextMode) => {
    setMode(nextMode)
    setDeck(makeDeck(nextMode))
    setPiles(emptyPiles())
    setLastResult(null)
    setView('placing')
  }, [])

  // Re-deal the current mode (same deck for daily, fresh for the others).
  const playAgain = useCallback(() => startGame(mode), [startGame, mode])

  const backToMenu = useCallback(() => {
    setView('menu')
    setDaily(readDaily()) // refresh in case the date rolled over
  }, [])

  const placed = TOTAL_CARDS - deck.length
  const currentCard = deck[0] ?? null
  const allPlaced = deck.length === 0 && view === 'placing'
  const currentColor = currentCard ? suitMeta[currentCard.suit].color : null

  // Place the top (face-down) card onto the chosen suit pile.
  // A pile holds at most 13 cards (one full suit) — once full, it's locked.
  const placeOn = useCallback(
    (suitKey) => {
      if (view !== 'placing') return
      if (deck.length === 0) return
      if (piles[suitKey].length >= PILE_LIMIT) return // pile is full
      const [top, ...rest] = deck
      setPiles((prev) => ({ ...prev, [suitKey]: [...prev[suitKey], top] }))
      setDeck(rest)
    },
    [view, deck, piles]
  )

  // Reveal & record the round (everything computed once, here in the handler).
  const reveal = useCallback(() => {
    const score = scorePiles(piles)
    const won = score >= WIN_THRESHOLD
    const result = { score, mode, won }

    if (mode === 'classic') {
      const nextStreak = won ? currentStreak + 1 : 0
      const nextBestStreak = Math.max(bestStreak, nextStreak)
      const nextBest = Math.max(bestScore, score)
      const nextHistory = [...history, { score, won }].slice(-HISTORY_MAX)

      setBestScore(nextBest)
      setCurrentStreak(nextStreak)
      setBestStreak(nextBestStreak)
      setHistory(nextHistory)
      localStorage.setItem(BEST_KEY, String(nextBest))
      localStorage.setItem(STREAK_KEY, String(nextStreak))
      localStorage.setItem(BEST_STREAK_KEY, String(nextBestStreak))
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory))

      result.isClassicBest = score >= bestScore && score > 0
      result.streak = nextStreak
      result.bestStreak = nextBestStreak
      result.history = nextHistory
    } else if (mode === 'daily') {
      result.isDailyBest = daily.plays === 0 || score > daily.best
      const nextDaily = { date: todayKey(), best: Math.max(daily.best, score), plays: daily.plays + 1 }
      setDaily(nextDaily)
      localStorage.setItem(DAILY_KEY, JSON.stringify(nextDaily))
      result.dailyBest = nextDaily.best
      result.dateKey = todayKey()
    }
    // Hint mode is practice: nothing is persisted.

    setLastResult(result)
    setView('revealed')
  }, [piles, mode, bestScore, currentStreak, bestStreak, history, daily])

  // Keyboard shortcuts: 1–4 place cards, Enter reveals / plays again.
  useEffect(() => {
    function onKey(e) {
      if (view === 'placing') {
        const index = ['1', '2', '3', '4'].indexOf(e.key)
        if (index !== -1) placeOn(SUITS[index].key)
        if (e.key === 'Enter' && allPlaced) reveal()
      } else if (view === 'revealed' && e.key === 'Enter') {
        playAgain()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, allPlaced, placeOn, reveal, playAgain])

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand brand--button" onClick={backToMenu} title="Back to menu">
          <span className="brand__leaf">🍀</span>
          <h1 className="brand__title">Christine&rsquo;s Luck Sort</h1>
        </button>
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
          {view !== 'menu' && (
            <button className="btn btn--ghost" onClick={backToMenu}>
              ☰ Menu
            </button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'menu' && (
          <motion.main
            key="menu"
            className="stage stage--menu"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="menu__title">Choose a mode</h2>
            <div className="menu__modes">
              {MODES.map((m) => (
                <motion.button
                  key={m.key}
                  className="mode-card"
                  onClick={() => startGame(m.key)}
                  whileHover={{ scale: 1.04, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mode-card__icon">{m.icon}</span>
                  <span className="mode-card__name">{m.name}</span>
                  <span className="mode-card__desc">{m.desc}</span>
                  {m.key === 'daily' && (
                    <span className="mode-card__tag">
                      {daily.plays > 0 ? `Today's best: ${daily.best}/52` : 'Not played today'}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.main>
        )}

        {view === 'placing' && (
          <motion.main
            key="placing"
            className="stage"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <ModeBanner mode={mode} />
            <p className="hint">
              {mode === 'hint'
                ? "You can see each card's colour — use it! Place all 52 cards, then reveal."
                : 'No peeking! Guess each card’s suit and place it on a pile. Beat the average (14+) to build a streak. 🔥'}
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
                <div className="deck-area">
                  {mode === 'hint' && currentCard && (
                    <motion.div
                      key={currentCard.id}
                      className={`hint-chip hint-chip--${currentColor}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      This card is{' '}
                      <strong>{currentColor === 'red' ? 'RED ♥ ♦' : 'BLACK ♠ ♣'}</strong>
                    </motion.div>
                  )}
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
        )}

        {view === 'revealed' && (
          <motion.main
            key="revealed"
            className="stage stage--results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <Results result={lastResult} piles={piles} onPlayAgain={playAgain} onMenu={backToMenu} />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}

// A small banner naming the current mode (and date, for the daily).
function ModeBanner({ mode }) {
  const info = MODES.find((m) => m.key === mode)
  if (!info) return null
  return (
    <div className={`mode-banner mode-banner--${mode}`}>
      <span>{info.icon}</span>
      <span>{info.name}</span>
      {mode === 'daily' && <span className="mode-banner__date">· {todayLabel()}</span>}
    </div>
  )
}

// The reveal screen: score, verdict, mode-specific panel, and the flipped piles.
function Results({ result, piles, onPlayAgain, onMenu }) {
  const [copied, setCopied] = useState(false)
  if (!result) return null

  const { score, mode } = result
  const { emoji, text } = verdict(score)

  const shareText = `🍀 Christine's Luck Sort — Daily ${result.dateKey}: ${score}/${TOTAL_CARDS} correct!`
  function copyResult() {
    if (window.api?.copyToClipboard) window.api.copyToClipboard(shareText)
    else if (navigator.clipboard) navigator.clipboard.writeText(shareText)
    setCopied(true)
  }

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
          {result.isClassicBest && <span className="scoreboard__badge">New best score! 🎉</span>}
          {mode === 'classic' && result.won && (
            <span className="scoreboard__badge scoreboard__badge--streak">
              🔥 {result.streak} win streak
            </span>
          )}
          {result.isDailyBest && <span className="scoreboard__badge">New daily best! 📅</span>}
          {mode === 'hint' && <span className="scoreboard__badge scoreboard__badge--muted">Practice round</span>}
        </div>
        <p className="scoreboard__verdict">{text}</p>
      </motion.div>

      {mode === 'classic' && (
        <StatsPanel
          currentStreak={result.streak}
          bestStreak={result.bestStreak}
          history={result.history || []}
        />
      )}

      {mode === 'daily' && (
        <div className="daily-panel">
          <div className="daily-panel__row">
            <span>📅 Daily Challenge · {todayLabel()}</span>
            <span className="daily-panel__best">Today&rsquo;s best: {result.dailyBest}/{TOTAL_CARDS}</span>
          </div>
          <button className="btn btn--ghost" onClick={copyResult}>
            {copied ? 'Copied! 📋' : 'Copy result to share'}
          </button>
        </div>
      )}

      {mode === 'hint' && (
        <p className="practice-note">
          👁️ Hint Mode is just for practice — your streak and best score weren&rsquo;t affected.
        </p>
      )}

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

      <div className="result-actions">
        <motion.button
          className="btn btn--primary btn--big"
          onClick={onPlayAgain}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          {mode === 'daily' ? 'Try again 🔄' : 'Play again 🔄'}
        </motion.button>
        <button className="btn btn--ghost" onClick={onMenu}>
          ☰ Menu
        </button>
      </div>
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
