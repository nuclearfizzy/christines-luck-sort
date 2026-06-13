import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SUITS,
  TOTAL_CARDS,
  createDeck,
  shuffle,
  seededShuffle,
  scorePiles,
  ZENER_SYMBOLS,
  createZenerDeck
} from './game/deck'
import Card from './components/Card'
import ZenerGlyph from './components/ZenerGlyph'

// localStorage keys — where we remember things between sessions.
const BEST_KEY = 'cls-best-score'
const STREAK_KEY = 'cls-current-streak'
const BEST_STREAK_KEY = 'cls-best-streak'
const HISTORY_KEY = 'cls-history'
const THEME_KEY = 'cls-theme'
const DAILY_KEY = 'cls-daily'
const ZENER_BEST_KEY = 'cls-zener-best'

const WIN_THRESHOLD = 14 // beating the ~13 average counts as a "win" (Classic)
const HISTORY_MAX = 12 // how many recent games to remember

// Look up a suit's metadata (symbol / colour) by its key.
const suitMeta = Object.fromEntries(SUITS.map((s) => [s.key, s]))

// Per-mode configuration: which categories (piles) the deck uses, how many
// cards total, and the per-pile cap. Everything else is shared.
function configFor(mode) {
  if (mode === 'zener') {
    return { kind: 'zener', categories: ZENER_SYMBOLS, total: 25, perCategory: 5 }
  }
  return {
    kind: 'standard',
    categories: SUITS,
    total: TOTAL_CARDS,
    perCategory: TOTAL_CARDS / SUITS.length
  }
}

// --- Date helpers (used by the Daily Challenge) ------------------------------
function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Start every category pile as an empty list.
function emptyPiles(categories) {
  return categories.reduce((acc, cat) => ({ ...acc, [cat.key]: [] }), {})
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

// An encouraging message based on how you did, relative to pure chance.
function verdict(score, total, avg) {
  if (score === total) return { emoji: '🤯', text: 'A FLAWLESS run?! That should be statistically impossible. Are you a wizard?' }
  if (score >= avg * 2.2) return { emoji: '🌟', text: 'Astonishing — far beyond chance. The cards adore you!' }
  if (score >= avg * 1.5) return { emoji: '🍀', text: 'Well above average — seriously lucky!' }
  if (score > avg) return { emoji: '✨', text: 'A touch above average. Nicely done!' }
  if (score >= Math.ceil(avg * 0.8)) return { emoji: '🙂', text: `Right around chance (${avg}). The math holds!` }
  if (score >= Math.ceil(avg * 0.4)) return { emoji: '🎲', text: 'A little below chance this round — try again!' }
  return { emoji: '😅', text: 'Below chance — the cards weren’t with you. Another go?' }
}

// Build a deck for the chosen mode.
function makeDeck(mode) {
  if (mode === 'zener') return shuffle(createZenerDeck())
  if (mode === 'daily') return seededShuffle(createDeck(), `daily-${todayKey()}`)
  return shuffle(createDeck())
}

const MODES = [
  {
    key: 'classic',
    icon: '🍀',
    name: 'Classic',
    desc: 'Pure luck. Sort the 52-card deck blind and chase your best streak.'
  },
  {
    key: 'hint',
    icon: '👁️',
    name: 'Hint Mode',
    desc: "See each card's colour before placing — it can only go on a matching pile. Practice only."
  },
  {
    key: 'daily',
    icon: '📅',
    name: 'Daily Challenge',
    desc: 'Everyone gets the same deck today. Beat it and share your score!'
  },
  {
    key: 'zener',
    icon: '🔮',
    name: 'Zener ESP Test',
    desc: 'The classic ESP experiment: guess the symbol on 25 cards. Chance is 5/25 — can you beat it?'
  }
]

export default function App() {
  const [view, setView] = useState('menu') // 'menu' | 'placing' | 'revealed'
  const [mode, setMode] = useState('classic')
  const [deck, setDeck] = useState([])
  const [piles, setPiles] = useState({})
  const [lastResult, setLastResult] = useState(null)

  // Persisted Classic stats.
  const [bestScore, setBestScore] = useState(() => readNumber(BEST_KEY))
  const [currentStreak, setCurrentStreak] = useState(() => readNumber(STREAK_KEY))
  const [bestStreak, setBestStreak] = useState(() => readNumber(BEST_STREAK_KEY))
  const [history, setHistory] = useState(() => readHistory())

  // Persisted Daily + Zener records.
  const [daily, setDaily] = useState(() => readDaily())
  const [zenerBest, setZenerBest] = useState(() => readNumber(ZENER_BEST_KEY))

  // Theme ('dark' | 'light'), remembered between sessions.
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')

  const config = useMemo(() => configFor(mode), [mode])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // Start a fresh game in the given mode.
  const startGame = useCallback((nextMode) => {
    const cfg = configFor(nextMode)
    setMode(nextMode)
    setDeck(makeDeck(nextMode))
    setPiles(emptyPiles(cfg.categories))
    setLastResult(null)
    setView('placing')
  }, [])

  // Re-deal the current mode (same deck for daily, fresh for the others).
  const playAgain = useCallback(() => startGame(mode), [startGame, mode])

  const backToMenu = useCallback(() => {
    setView('menu')
    setDaily(readDaily()) // refresh in case the date rolled over
  }, [])

  const placed = config.total - deck.length
  const currentCard = deck[0] ?? null
  const allPlaced = deck.length === 0 && view === 'placing'
  const currentColor = currentCard && currentCard.suit ? suitMeta[currentCard.suit].color : null

  // Place the top (face-down) card onto the chosen category pile.
  // A pile holds at most `perCategory` cards — once full, it's locked.
  const placeOn = useCallback(
    (catKey) => {
      if (view !== 'placing') return
      if (deck.length === 0) return
      if ((piles[catKey]?.length ?? 0) >= config.perCategory) return // pile is full
      // In Hint Mode the colour is known, so a card can only go on a pile of
      // its own colour (red -> ♥/♦, black -> ♠/♣).
      if (mode === 'hint' && suitMeta[deck[0].suit].color !== suitMeta[catKey].color) return
      const [top, ...rest] = deck
      setPiles((prev) => ({ ...prev, [catKey]: [...prev[catKey], top] }))
      setDeck(rest)
    },
    [view, deck, piles, mode, config]
  )

  // Reveal & record the round (everything computed once, here in the handler).
  const reveal = useCallback(() => {
    const score = scorePiles(piles, config.categories)
    const avg = config.total / config.categories.length
    const won = score >= WIN_THRESHOLD
    const result = { score, mode, total: config.total, avg }

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
      result.won = won
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
    } else if (mode === 'zener') {
      result.isZenerBest = score > zenerBest
      const nextBest = Math.max(zenerBest, score)
      setZenerBest(nextBest)
      localStorage.setItem(ZENER_BEST_KEY, String(nextBest))
      result.zenerBest = nextBest
    }
    // Hint mode is practice: nothing is persisted.

    setLastResult(result)
    setView('revealed')
  }, [piles, mode, config, bestScore, currentStreak, bestStreak, history, daily, zenerBest])

  // Keyboard shortcuts: number keys place cards, Enter reveals / plays again.
  useEffect(() => {
    function onKey(e) {
      if (view === 'placing') {
        if (/^[1-9]$/.test(e.key)) {
          const idx = Number(e.key) - 1
          if (idx < config.categories.length) placeOn(config.categories[idx].key)
        }
        if (e.key === 'Enter' && allPlaced) reveal()
      } else if (view === 'revealed' && e.key === 'Enter') {
        playAgain()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, allPlaced, placeOn, reveal, playAgain, config])

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
                  {m.key === 'zener' && zenerBest > 0 && (
                    <span className="mode-card__tag">Your best: {zenerBest}/25</span>
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
            <p className="hint">{hintText(mode)}</p>

            <div className="progress">
              <div className="progress__bar">
                <motion.div
                  className="progress__fill"
                  animate={{ width: `${(placed / config.total) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="progress__label">
                {placed} / {config.total} placed
              </span>
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
                  <p>All {config.total} cards are placed!</p>
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

            <section
              className="piles"
              style={{ gridTemplateColumns: `repeat(${config.categories.length}, 1fr)` }}
            >
              {config.categories.map((cat, i) => {
                const count = piles[cat.key]?.length ?? 0
                const full = count >= config.perCategory
                const colorBlocked = mode === 'hint' && currentColor && cat.color !== currentColor
                const locked = allPlaced || full || colorBlocked
                return (
                  <motion.button
                    key={cat.key}
                    className={`pile pile--${cat.color || 'zener'} ${full ? 'pile--full' : ''} ${
                      colorBlocked ? 'pile--blocked' : ''
                    }`}
                    onClick={() => placeOn(cat.key)}
                    disabled={locked}
                    whileHover={locked ? {} : { scale: 1.03, y: -4 }}
                    whileTap={locked ? {} : { scale: 0.98 }}
                  >
                    <span className="pile__symbol">
                      {config.kind === 'zener' ? <ZenerGlyph symbol={cat.key} size={38} /> : cat.symbol}
                    </span>
                    <span className="pile__label">{cat.label}</span>
                    <span className="pile__count">
                      {count}/{config.perCategory}
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

// Instructions for the current mode.
function hintText(mode) {
  if (mode === 'hint')
    return 'You can see each card’s colour — so it can only go on a matching-colour pile. Pick which of the two suits is right!'
  if (mode === 'zener')
    return 'Focus… then guess the symbol on each face-down card and place it. Pure chance is 5 out of 25.'
  return 'No peeking! Guess each card’s suit and place it on a pile. Beat the average (14+) to build a streak. 🔥'
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

  const { score, mode, total, avg } = result
  const config = configFor(mode)
  const { emoji, text } = verdict(score, total, avg)

  const shareText = `🍀 Christine's Luck Sort — Daily ${result.dateKey}: ${score}/${total} correct!`
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
          <span className="scoreboard__total">/ {total} correct</span>
        </div>
        <div className="scoreboard__badges">
          {result.isClassicBest && <span className="scoreboard__badge">New best score! 🎉</span>}
          {mode === 'classic' && result.won && (
            <span className="scoreboard__badge scoreboard__badge--streak">
              🔥 {result.streak} win streak
            </span>
          )}
          {result.isDailyBest && <span className="scoreboard__badge">New daily best! 📅</span>}
          {result.isZenerBest && <span className="scoreboard__badge">New ESP best! 🔮</span>}
          {mode === 'hint' && (
            <span className="scoreboard__badge scoreboard__badge--muted">Practice round</span>
          )}
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
            <span className="daily-panel__best">
              Today&rsquo;s best: {result.dailyBest}/{total}
            </span>
          </div>
          <button className="btn btn--ghost" onClick={copyResult}>
            {copied ? 'Copied! 📋' : 'Copy result to share'}
          </button>
        </div>
      )}

      {mode === 'zener' && (
        <div className="daily-panel">
          <div className="daily-panel__row">
            <span>🔮 ESP Test · pure chance averages {avg}/{total}</span>
            <span className="daily-panel__best">
              Your best: {result.zenerBest}/{total}
            </span>
          </div>
        </div>
      )}

      {mode === 'hint' && (
        <p className="practice-note">
          👁️ Hint Mode is just for practice — your streak and best score weren&rsquo;t affected.
        </p>
      )}

      <div
        className="result-piles"
        style={{ gridTemplateColumns: `repeat(${config.categories.length}, 1fr)` }}
      >
        {config.categories.map((cat) => {
          const cards = piles[cat.key] || []
          const correct = cards.filter((c) => c.group === cat.key).length
          return (
            <div key={cat.key} className={`result-pile result-pile--${cat.color || 'zener'}`}>
              <header className="result-pile__head">
                <span className="result-pile__symbol">
                  {config.kind === 'zener' ? <ZenerGlyph symbol={cat.key} size={22} /> : cat.symbol}
                </span>
                <span className="result-pile__label">{cat.label}</span>
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
                    <Card card={card} faceUp correct={card.group === cat.key} small />
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
