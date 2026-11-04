import { useEffect, useState } from 'react';
import { sortRanking } from '../game/ranking';
import type { RankEntry } from '../game/types';

const TIPS = [
  'Las figuras valen 10 chips y el As vale 11. Cada carta jugada suma.',
  'Jugar 5 cartas no siempre es mejor: importa la mano de póker que formas.',
  'Los comodines se aplican de izquierda a derecha. El orden importa.',
  'Si una mano no sirve, descarta: tienes 2 descartes por mesa.',
  'Puedes jugar de 1 a 5 cartas. La vista previa te dice cuánto puntúan.',
  'El cronómetro se pausa en la tienda: solo cuenta tu tiempo en la mesa.',
];

interface StartScreenProps {
  ranking: RankEntry[];
  muted: boolean;
  onPlay: () => void;
  onTutorial: () => void;
  onRanking: () => void;
  onPrint: () => void;
  onToggleMute: () => void;
  onHelp: () => void;
}

export function StartScreen({
  ranking,
  muted,
  onPlay,
  onTutorial,
  onRanking,
  onPrint,
  onToggleMute,
  onHelp,
}: StartScreenProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const top = sortRanking(ranking).slice(0, 3);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((index) => (index + 1) % TIPS.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="screen start-screen">
      <div className="ambient-suits" aria-hidden="true">
        <span className="ambient-suit suit-hearts">♥</span>
        <span className="ambient-suit suit-spades">♠</span>
        <span className="ambient-suit suit-diamonds">♦</span>
        <span className="ambient-suit suit-clubs">♣</span>
      </div>

      <header className="start-top">
        <span className="top-badge">CASINO RETRO · 1 JUGADOR POR TURNO</span>
        <div className="top-buttons">
          <button type="button" className="icon-button" onClick={onHelp} aria-label="Cómo se juega">
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

      <main className="start-main">
        <div className="logo-wrap">
          <div className="logo-marquee" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <i key={index} style={{ animationDelay: `${index * 0.12}s` }} />
            ))}
          </div>
          <h1 className="game-title" data-text="COMODÍN">
            COMODÍN
          </h1>
          <p className="game-subtitle">PÓKER DE CASINO RETRO</p>
        </div>

        <p className="game-pitch">
          Tres mesas. Cinco minutos.
          <br />
          <span>Una sola oportunidad.</span>
        </p>

        <div className="start-actions">
          <button type="button" className="button button--primary button--xl" onClick={onPlay}>
            JUGAR
          </button>
          <div className="start-actions-row">
            <button type="button" className="button" onClick={onTutorial}>
              CÓMO JUGAR
            </button>
            <button type="button" className="button" onClick={onRanking}>
              RANKING
            </button>
            <button type="button" className="button" onClick={onPrint}>
              GUÍA IMPRIMIBLE
            </button>
          </div>
        </div>

        <div className="tip-rotator" aria-live="polite">
          <span className="tip-label">CONSEJO</span>
          <p key={tipIndex}>{TIPS[tipIndex]}</p>
        </div>

        {top.length > 0 ? (
          <div className="mini-ranking">
            <span className="mini-ranking-title">MEJORES RUNS</span>
            <ol>
              {top.map((entry, index) => (
                <li key={entry.id}>
                  <span className="mini-rank">#{index + 1}</span>
                  <span className="mini-name">{entry.name}</span>
                  <span className="mini-score">{entry.score.toLocaleString('es')}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </main>

      <footer className="start-footer">
        <span>3 MESAS</span>
        <i />
        <span>5–8 MINUTOS</span>
        <i />
        <span>HASTA 5 COMODINES</span>
        <i />
        <span>SIN CONEXIÓN</span>
      </footer>
    </div>
  );
}
