import { SUITS } from '../game/deck'
import ZenerGlyph from './ZenerGlyph'
import ZenerBack from './ZenerBack'

// Quick lookup so we can find a suit's symbol/color from its key.
const suitMeta = Object.fromEntries(SUITS.map((suit) => [suit.key, suit]))

// A single card. It has a back and a front; CSS flips between them.
// The front is either a playing card (rank + suit) or a Zener symbol,
// depending on the card's shape.
// Props:
//   card    -> { rank, suit } OR { symbol } (or null for an empty placeholder)
//   faceUp  -> show the front (true) or the back (false)
//   correct -> true/false to tint it green/red after the reveal, null otherwise
//   small   -> render a compact version (used in the result piles)
export default function Card({ card, faceUp = false, correct = null, small = false, theme = 'dark' }) {
  const isZener = !!(card && card.symbol)
  const meta = card && !isZener ? suitMeta[card.suit] : null

  const classes = [
    'card',
    small ? 'card--small' : '',
    correct === true ? 'card--correct' : '',
    correct === false ? 'card--wrong' : ''
  ]
    .filter(Boolean)
    .join(' ')

  const frontClass = `card__face card__front ${isZener ? 'is-zener' : meta ? `is-${meta.color}` : ''}`

  return (
    <div className={classes}>
      <div className={`card__inner ${faceUp ? 'is-faceup' : ''}`}>
        <div className={`card__face card__back ${isZener ? 'card__back--zener' : ''}`}>
          {isZener ? <ZenerBack theme={theme} /> : <div className="card__back-pattern" />}
        </div>
        <div className={frontClass}>
          {isZener ? (
            <span className="card__zener">
              <ZenerGlyph symbol={card.symbol} size={small ? 34 : 92} />
            </span>
          ) : (
            card && (
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
            )
          )}
        </div>
      </div>
    </div>
  )
}
