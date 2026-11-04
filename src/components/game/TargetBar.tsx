import type { RoundConfig } from '../../game/rounds';

interface TargetBarProps {
  score: number;
  target: number;
  handsLeft: number;
  discardsLeft: number;
  round: RoundConfig;
}

function Pips({ total, filled, tone }: { total: number; filled: number; tone: 'hands' | 'discards' }) {
  return (
    <span className={`pips pips--${tone}`} aria-label={`${filled} de ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <i key={index} className={index < filled ? 'is-filled' : ''} />
      ))}
    </span>
  );
}

export function TargetBar({ score, target, handsLeft, discardsLeft, round }: TargetBarProps) {
  const progress = Math.min(100, Math.max(0, (score / target) * 100));
  const remaining = Math.max(0, target - score);

  return (
    <section className="target-panel" aria-label="Objetivo de la mesa">
      <div className="target-head">
        <div>
          <span className="score-eyebrow">OBJETIVO DE LA MESA</span>
          <strong className="target-values">
            {score.toLocaleString('es')} <span>/ {target.toLocaleString('es')}</span>
          </strong>
        </div>
        <div className={`target-remaining ${remaining === 0 ? 'is-cleared' : ''}`}>
          {remaining === 0 ? '¡MESA SUPERADA!' : `FALTAN ${remaining.toLocaleString('es')}`}
        </div>
      </div>

      <div
        className="target-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(score, target)}
      >
        <div className="target-fill" style={{ width: `${progress}%` }}>
          <span className="target-glint" />
        </div>
        <span className="target-tick" style={{ left: '33%' }} />
        <span className="target-tick" style={{ left: '66%' }} />
      </div>

      <div className="round-counters">
        <div className="counter">
          <span>MANOS</span>
          <Pips total={round.hands} filled={handsLeft} tone="hands" />
          <b>{handsLeft}</b>
        </div>
        <div className="counter">
          <span>DESCARTES</span>
          <Pips total={round.discards} filled={discardsLeft} tone="discards" />
          <b>{discardsLeft}</b>
        </div>
      </div>
    </section>
  );
}
