import { formatDate, formatTime, sortRanking } from '../game/ranking';
import type { RankEntry } from '../game/types';

interface LeaderboardScreenProps {
  ranking: RankEntry[];
  muted: boolean;
  onBack: () => void;
  onReset: () => void;
  onToggleMute: () => void;
  onHelp: () => void;
}

export function LeaderboardScreen({
  ranking,
  muted,
  onBack,
  onReset,
  onToggleMute,
  onHelp,
}: LeaderboardScreenProps) {
  const sorted = sortRanking(ranking);
  const best = sorted[0];

  const requestReset = () => {
    if (sorted.length === 0) return;
    const confirmed = window.confirm(
      '¿Borrar todos los puntajes del ranking? Esta acción no se puede deshacer.',
    );
    if (confirmed) onReset();
  };

  return (
    <div className="screen ranking-screen">
      <header className="ranking-top">
        <button type="button" className="button button--ghost" onClick={onBack}>
          ← VOLVER
        </button>
        <span className="top-badge">RANKING LOCAL</span>
        <div className="top-buttons">
          <button type="button" className="icon-button" onClick={onHelp} aria-label="Ayuda">
            ?
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={onToggleMute}
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {muted ? '♪̸' : '♪'}
          </button>
        </div>
      </header>

      <main className="ranking-main">
        <div className="ranking-heading">
          <span>MEJORES RUNS DE LA CASA</span>
          <h1>RANKING</h1>
          <p>
            Cada jugador hace una run. Gana quien consiga más puntos totales. En caso de empate,
            el tiempo de mesa más bajo.
          </p>
        </div>

        {best ? (
          <div className="ranking-best">
            <span>RÉCORD</span>
            <b>{best.score.toLocaleString('es')}</b>
            <em>{best.name}</em>
          </div>
        ) : null}

        <section className="ranking-table" aria-label="Tabla de posiciones">
          <div className="ranking-row ranking-row--head">
            <span>#</span>
            <span>JUGADOR</span>
            <span>MESAS</span>
            <span>TIEMPO</span>
            <span>FECHA</span>
            <span>PUNTOS</span>
          </div>

          {sorted.length === 0 ? (
            <div className="ranking-empty">
              <b>Todavía no hay runs.</b>
              <span>Juega la primera y estrena el ranking.</span>
            </div>
          ) : (
            sorted.map((entry, index) => (
              <div className={`ranking-row ${entry.won ? 'is-won' : ''}`} key={entry.id}>
                <span className="ranking-pos">#{index + 1}</span>
                <span className="ranking-name">
                  {entry.name}
                  {entry.won ? <i title="Run completa">★</i> : null}
                </span>
                <span>{entry.mesas}/3</span>
                <span>{formatTime(entry.timeMs)}</span>
                <span>{formatDate(entry.date)}</span>
                <span className="ranking-score">{entry.score.toLocaleString('es')}</span>
              </div>
            ))
          )}
        </section>

        <footer className="ranking-footer">
          <span>{sorted.length} runs registradas en este navegador</span>
          <button
            type="button"
            className="button button--danger button--small"
            onClick={requestReset}
            disabled={sorted.length === 0}
          >
            BORRAR RANKING
          </button>
        </footer>
      </main>
    </div>
  );
}
