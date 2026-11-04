import type { ReactNode } from 'react';
import type { JokerDef } from '../../game/types';
import { JokerIcon } from './JokerIcon';

interface JokerCardProps {
  joker: JokerDef;
  size?: 'sm' | 'md';
  showCost?: boolean;
  dimmed?: boolean;
  action?: ReactNode;
  className?: string;
}

export function JokerCard({
  joker,
  size = 'md',
  showCost = false,
  dimmed = false,
  action,
  className = '',
}: JokerCardProps) {
  return (
    <article
      className={`joker-card joker-card--${size} ${dimmed ? 'is-dimmed' : ''} ${className}`.trim()}
      title={joker.description}
    >
      <div className="joker-frame">
        <span className="joker-art">
          <JokerIcon id={joker.id} />
        </span>
        <h3 className="joker-title">{joker.name}</h3>
        {showCost ? <span className="joker-cost">${joker.cost}</span> : null}
      </div>
      <p className="joker-text">{joker.description}</p>
      {action ? <div className="joker-action">{action}</div> : null}
    </article>
  );
}
