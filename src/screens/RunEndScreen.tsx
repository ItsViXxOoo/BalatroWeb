import { mesasSuperadas, type GameState } from '../game/engine';
import { formatTime, sortRanking } from '../game/ranking';
import { MAX_JOKERS, ROUNDS } from '../game/rounds';
import type { RankEntry } from '../game/types';

interface RunEndScreenProps {
  state: GameState;
  ranking: RankEntry[];
  muted: boolean;
  onToggleMute: () => void;
  onHelp: () => void;
  onPlayAgain: () => void;
  onNextPlayer: () => void;
  onRanking: () => void;
  onMenu: () => void;
}

export function RunEndScreen({
  state,
  ranking,
  muted,
  onToggleMute,
  onHelp,
  onPlayAgain,
  onNextPlayer,
  onRanking,
  onMenu,
}: RunEndScreenProps) {
  const won = state.phase === 'runComplete';
  const sorted = sortRanking(ranking);
  const position = sorted.findIndex((entry) => entry.id === state.runId) + 1;
  const top = sorted.slice(0, 5);
  const mesas = mesasSuperadas(state);

  return (
    <div className="screen end-screen">
      <header className="end-top">
        <button type="button" className="button button--ghost" onClick={onMenu}>
          ← MENÚ
        </button>
        <span className="top-badge">{won ? 'RUN COMPLETA' : 'FIN DE LA RUN'}</span>
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

      <main className="end-main">
        <section className={`end-banner ${won ? 'is-win' : 'is-lose'}`}>
          <span className="end-kicker">{won ? 'LA CASA PAGA' : 'LA CASA GANA'}</span>
          <h1>{won ? '¡BÓVEDA ABIERTA!' : 'SIN MANOS'}</h1>
          <p>
            {won
              ? `Completaste las ${ROUNDS.length} mesas de Comodín.`
              : `Te quedaste sin manos en ${ROUNDS[state.roundIndex].name}. Puedes intentarlo otra vez.`}
          </p>
        </section>

        <section className="end-score">
          <span>PUNTAJE FINAL</span>
          <b>{state.runScore.toLocaleString('es')}</b>
          {position > 0 ? <em>Puesto #{position} del ranking local</em> : null}
        </section>

        <section className="end-stats">
          <div>
            <span>MESAS SUPERADAS</span>
            <b>
              {mesas}/{ROUNDS.length}
            </b>
          </div>
          <div>
            <span>MEJOR MANO</span>
            <b>{state.bestHand?.name ?? '—'}</b>
            <em>{state.bestHand ? `${state.bestHand.total.toLocaleString('es')} pts` : ''}</em>
          </div>
          <div>
            <span>TIEMPO EN MESA</span>
            <b>{formatTime(state.elapsedMs)}</b>
            <em>sin contar la tienda</em>
          </div>
          <div>
            <span>COMODINES</span>
            <b>
              {state.jokers.length}/{MAX_JOKERS}
            </b>
            <em>{state.handsPlayed} manos jugadas</em>
          </div>
        </section>

        <section className="end-ranking">
          <div className="end-ranking-head">
            <h2>MEJORES RUNS</h2>
            <button type="button" className="text-button" onClick={onRanking}>
              Ver ranking completo →
            </button>
          </div>
          {top.length === 0 ? (
            <p className="muted">Todavía no hay puntajes guardados.</p>
          ) : (
            <ol className="rank-list">
              {top.map((entry, index) => (
                <li
                  key={entry.id}
                  className={entry.id === state.runId ? 'is-current' : ''}
                >
                  <span className="rank-position">#{index + 1}</span>
                  <span className="rank-name">{entry.name}</span>
                  <span className="rank-mesas">{entry.mesas}/3 mesas</span>
                  <span className="rank-time">{formatTime(entry.timeMs)}</span>
                  <span className="rank-score">{entry.score.toLocaleString('es')}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="end-actions">
          <button type="button" className="button button--primary button--xl" onClick={onPlayAgain}>
            JUGAR OTRA RUN
          </button>
          <button type="button" className="button button--xl" onClick={onNextPlayer}>
            SIGUIENTE JUGADOR →
          </button>
        </section>

        <p className="end-note">
          Pasa el dispositivo a la siguiente persona. El ranking se guarda en este navegador.
        </p>
      </main>
    </div>
  );
}
