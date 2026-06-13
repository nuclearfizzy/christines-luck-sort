# 🍀 Christine's Luck Sort

A cozy desktop card game built with **Electron** + **React**.

Sort a freshly shuffled 52-card deck into four suit piles — **without ever peeking at the cards**. Every placement is a pure guess. When all 52 are placed, flip them over and see how lucky you were!

> Fun fact: thanks to probability, the *average* player gets about **13 cards right**. Beating that means luck was on your side. 🎲

## How to play

1. A card sits face-down on top of the deck.
2. Click one of the four suit piles — ♠ ♥ ♦ ♣ — to place it there (no peeking!).
3. Repeat until all 52 cards are placed.
4. Hit **Reveal** to flip everything and score how many landed on the correct suit.
5. Try to beat your best score!

You can also use your keyboard: **1** = Spades, **2** = Hearts, **3** = Diamonds, **4** = Clubs.

## Game modes

- **🍀 Classic** — pure luck. Sort the deck blind and build your win streak.
- **👁️ Hint Mode** — see each card's colour (red/black) before placing it, for a 50/50 guess with real strategy. Practice only, so it doesn't affect your streak.
- **📅 Daily Challenge** — everyone gets the *same* shuffled deck each day (it's seeded by the date), so you can compare scores with friends. Copy your result to share it!
- **🔮 Zener ESP Test** — the classic parapsychology experiment. Guess the symbol (circle, cross, waves, square, star) on each of 25 cards. Pure chance averages 5/25 — beat it and spook your friends.

## Running it on your computer

You'll need [Node.js](https://nodejs.org) installed.

```bash
# 1. Install the building blocks (only needed once)
npm install

# 2. Launch the game in development mode
npm run dev
```

## How the project is organized

```
src/
├── main/        # Electron — creates the desktop window
├── preload/     # A small, secure bridge between window and system
└── renderer/    # The game itself (React)
    └── src/
        ├── game/        # Pure game logic (deck, shuffle, scoring)
        ├── components/  # Reusable visual pieces (a Card, etc.)
        ├── App.jsx      # The main game screen
        └── styles.css   # The look & feel
```

## Built with

- [Electron](https://www.electronjs.org/) — desktop app shell
- [React](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) + [electron-vite](https://electron-vite.org/) — fast tooling
- [Framer Motion](https://www.framer.com/motion/) — smooth card animations

---

Made with 💛 by [nuclearfizzy](https://github.com/nuclearfizzy)
