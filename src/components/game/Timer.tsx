import { formatTime } from '../../game/ranking';

interface TimerProps {
  ms: number;
}

export function Timer({ ms }: TimerProps) {
  const tone = ms >= 8 * 60 * 1000 ? 'is-late' : ms >= 6 * 60 * 1000 ? 'is-warn' : '';

  return (
    <div className={`game-timer ${tone}`.trim()} title="Tiempo de juego (se pausa en la tienda)">
      <span className="timer-icon" aria-hidden="true">
        ◷
      </span>
      <span>{formatTime(ms)}</span>
    </div>
  );
}
