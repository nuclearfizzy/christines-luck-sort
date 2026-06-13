import { SUITS } from '../game/deck'

// Quick lookup so we can find a suit's symbol/color from its key.
const suitMeta = Object.fromEntries(SUITS.map((suit) => [suit.key, suit]))

// A single playing card. It has a back and a front; CSS flips between them.
// Props:
//   card    -> { rank, suit } (or null for an empty placeholder)
//   faceUp  -> show the front (true) or the back (false)
//   correct -> true/false to tint it green/red after the reveal, null otherwise
//   small   -> render a compact version (used in the result piles)
export default function Card({ card, faceUp = false, correct = null, small = false }) {
  const meta = card ? suitMeta[card.suit] : null

  const classes = [
    'card',
    small ? 'card--small' : '',
    correct === true ? 'card--correct' : '',
    correct === false ? 'card--wrong' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className={`card__inner ${faceUp ? 'is-faceup' : ''}`}>
        <div className="card__face card__back">
          <div className="card__back-pattern" />
        </div>
        <div className={`card__face card__front ${meta ? `is-${meta.color}` : ''}`}>
          {card && (
            <>
              <span className="card__corner card__corner--tl">
                <span className="card__rank">{card.rank}</span>
                <span className="card__suit">{meta.symbol}</span>
              </span>
              <span className="card__center">{meta.symbol}</span>
              <span className="card__corner card__corner--br">
                <span className="card__rank">{card.rank}</span>
                <span className="card__suit">{meta.symbol}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
