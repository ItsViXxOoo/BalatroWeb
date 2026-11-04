import { useEffect, useState } from 'react';
import { formatMult } from '../../game/scoring';
import type { ScoreResult } from '../../game/types';

interface ScorePreviewProps {
  result: ScoreResult | null;
  selectedCount: number;
  played: boolean;
  pulse: number;
}

function CountUp({ value, animate }: { value: number; animate: boolean }) {
  const [display, setDisplay] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 520;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, animate]);

  return <>{display}</>;
}

export function ScorePreview({ result, selectedCount, played, pulse }: ScorePreviewProps) {
  if (!result) {
    return (
      <div className="score-preview score-preview--empty">
        <span className="score-eyebrow">TU MANO</span>
        <p className="score-placeholder">
          {selectedCount === 0
            ? 'Toca de 1 a 5 cartas para ver cuánto puntúan.'
            : 'Selecciona una mano válida.'}
        </p>
        <div className="score-empty-cards" aria-hidden="true">
          <span>♥</span>
          <span>♠</span>
          <span>♦</span>
          <span>♣</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`score-preview ${played ? 'is-played' : 'is-preview'}`} key={pulse}>
      <span className="score-eyebrow">{played ? 'MANO JUGADA' : 'VISTA PREVIA'}</span>
      <h2 className="score-hand">{result.describe}</h2>

      <div className="score-math">
        <div className="score-pill score-pill--chips">
          <span>CHIPS</span>
          <b>{result.chips}</b>
        </div>
        <span className="score-times" aria-hidden="true">
          ×
        </span>
        <div className="score-pill score-pill--mult">
          <span>MULT</span>
          <b>{formatMult(result.mult)}</b>
        </div>
        <span className="score-equals" aria-hidden="true">
          =
        </span>
        <div className="score-total" aria-label={`Total ${result.total} puntos`}>
          <CountUp value={result.total} animate={played} />
        </div>
      </div>

      <ul className="score-steps">
        {result.steps
          .filter((step) => step.kind !== 'total')
          .slice(0, 5)
          .map((step, index) => (
            <li key={`${step.label}-${index}`} className={`score-step score-step--${step.kind}`}>
              <span>{step.label}</span>
              <b>{step.detail}</b>
            </li>
          ))}
      </ul>

      {result.jokerNames.length > 0 ? (
        <p className="score-jokers">Comodines activos: {result.jokerNames.join(' · ')}</p>
      ) : null}
    </div>
  );
}
