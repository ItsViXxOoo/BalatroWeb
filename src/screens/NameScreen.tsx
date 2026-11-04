import { useState, type FormEvent } from 'react';

interface NameScreenProps {
  lastPlayer?: string;
  bestScore?: number;
  onStart: (name: string) => void;
  onBack: () => void;
}

export function NameScreen({ lastPlayer = '', bestScore = 0, onStart, onBack }: NameScreenProps) {
  const [name, setName] = useState(lastPlayer);
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const clean = name.trim().toUpperCase().slice(0, 12) || 'JUGADOR';
    onStart(clean);
  };

  return (
    <div className="screen name-screen">
      <header className="name-top">
        <button type="button" className="button button--ghost" onClick={onBack}>
          ← VOLVER
        </button>
        <span className="top-badge">NUEVO JUGADOR</span>
        <span className="name-top-spacer" />
      </header>

      <main className="name-main">
        <div className="name-card">
          <span className="name-kicker">TURNO EN LA MESA</span>
          <h1>¿Quién juega?</h1>
          <p>
            Escribe tu nombre o apodo. Vas a jugar una run completa de 3 mesas. Al terminar, tu
            puntaje entra al ranking y pasas el dispositivo.
          </p>

          <form onSubmit={handleSubmit} className="name-form">
            <label htmlFor="player-name">TU NOMBRE</label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value.toUpperCase())}
              maxLength={12}
              placeholder="JUGADOR"
              autoFocus
              autoComplete="off"
              spellCheck={false}
              onFocus={(event) => event.currentTarget.select()}
            />
            <button type="submit" className="button button--primary button--xl">
              EMPEZAR RUN →
            </button>
          </form>

          <div className="name-facts">
            <div>
              <b>5–8 min</b>
              <span>dura tu run</span>
            </div>
            <div>
              <b>3</b>
              <span>mesas</span>
            </div>
            <div>
              <b>{bestScore > 0 ? bestScore.toLocaleString('es') : '—'}</b>
              <span>mejor puntaje</span>
            </div>
          </div>

          <p className="name-note">
            El cronómetro se pausa en la tienda y en los menús. No hay penalización por tardar.
          </p>
        </div>
      </main>
    </div>
  );
}
