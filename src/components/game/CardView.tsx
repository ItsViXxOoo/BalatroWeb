import type { CSSProperties } from 'react';
import { RANK_LABELS, SUITS } from '../../game/types';
import type { Card } from '../../game/types';

interface CardViewProps {
  card: Card;
  index: number;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  style?: CSSProperties;
}

export function CardView({ card, index, selected, disabled = false, onClick, style }: CardViewProps) {
  const suit = SUITS[card.suit];
  const label = RANK_LABELS[card.rank];

  return (
    <button
      type="button"
      className={`playing-card ${suit.red ? 'is-red' : ''} ${selected ? 'is-selected' : ''}`}
      style={{ '--i': index, ...style } as CSSProperties}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${label} de ${suit.name}${selected ? ', seleccionada' : ''}`}
    >
      <span className="card-corner card-corner--tl">
        <b>{label}</b>
        <i>{suit.symbol}</i>
      </span>
      <span className="card-pip" aria-hidden="true">
        {suit.symbol}
      </span>
      <span className="card-corner card-corner--br" aria-hidden="true">
        <b>{label}</b>
        <i>{suit.symbol}</i>
      </span>
      <span className="card-select-mark" aria-hidden="true">
        ✓
      </span>
    </button>
  );
}
