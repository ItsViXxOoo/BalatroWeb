import { useState } from 'react';
import { JOKERS } from '../game/jokers';
import { JokerCard } from '../components/ui/JokerCard';

interface TutorialScreenProps {
  nextLabel: string;
  onDone: () => void;
  onBack: () => void;
}

function MiniCard({
  rank,
  suit,
  red = false,
  selected = false,
}: {
  rank: string;
  suit: string;
  red?: boolean;
  selected?: boolean;
}) {
  return (
    <span className={`mini-card ${red ? 'is-red' : ''} ${selected ? 'is-selected' : ''}`}>
      <b>{rank}</b>
      <i>{suit}</i>
    </span>
  );
}

export function TutorialScreen({ nextLabel, onDone, onBack }: TutorialScreenProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      kicker: 'PASO 1',
      title: 'Alcanza el objetivo',
      text: 'Cada mesa tiene un objetivo de puntos. Tienes varias manos para llegar antes de quedarte sin intentos. Supera las 3 mesas y la run es tuya.',
      note: 'Mesa 1: 200 puntos · Mesa 2: 700 · Mesa 3: 1.800',
      visual: (
        <div className="tut-target">
          <span className="tut-label">OBJETIVO DE LA MESA</span>
          <b>640 / 700</b>
          <div className="tut-target-track">
            <div style={{ width: '91%' }} />
          </div>
          <span className="tut-faltan">FALTAN 60</span>
        </div>
      ),
    },
    {
      kicker: 'PASO 2',
      title: 'Forma una mano de póker',
      text: 'Tienes 8 cartas. Toca entre 1 y 5 para formar una mano. La vista previa te dice qué mano es y cuánto puntuaría antes de jugarla.',
      note: 'Pareja, trío, escalera, color, full… las manos clásicas de póker.',
      visual: (
        <div className="tut-hand">
          <MiniCard rank="10" suit="♥" red selected />
          <MiniCard rank="10" suit="♠" selected />
          <MiniCard rank="7" suit="♦" red />
          <MiniCard rank="K" suit="♣" />
          <MiniCard rank="3" suit="♠" />
          <span className="tut-hand-label">PAREJA DE 10</span>
        </div>
      ),
    },
    {
      kicker: 'PASO 3',
      title: 'Multiplica Chips × Mult',
      text: 'Cada mano da Chips y Mult. Las cartas y los comodines suman chips o mult. Al final, se multiplican: ese es el daño que haces al objetivo.',
      note: 'Ejemplo: 30 Chips × 2 Mult = 60 puntos.',
      visual: (
        <div className="tut-math">
          <span className="score-pill score-pill--chips">
            <span>CHIPS</span>
            <b>30</b>
          </span>
          <em>×</em>
          <span className="score-pill score-pill--mult">
            <span>MULT</span>
            <b>2</b>
          </span>
          <em>=</em>
          <strong className="tut-total">60</strong>
        </div>
      ),
    },
    {
      kicker: 'PASO 4',
      title: 'Compra comodines',
      text: 'Entre mesas entra a La Trastienda. Compra hasta 5 comodines con el dinero que ganes. Se aplican de izquierda a derecha y cambian por completo tus manos.',
      note: 'Los comodines se compran y se venden. El orden de la fila importa.',
      visual: (
        <div className="tut-shop">
          <JokerCard joker={JOKERS[0]} showCost size="md" />
          <JokerCard joker={JOKERS[2]} showCost size="md" />
        </div>
      ),
    },
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="screen tutorial-screen">
      <header className="tutorial-top">
        <button type="button" className="button button--ghost" onClick={onBack}>
          ← VOLVER
        </button>
        <span className="top-badge">CÓMO JUGAR</span>
        <button
          type="button"
          className="button button--ghost"
          onClick={onDone}
          aria-label={`Saltar tutorial y ${nextLabel.toLowerCase()}`}
        >
          SALTAR
        </button>
      </header>

      <main className="tutorial-main">
        <div className="tutorial-card">
          <div className="tutorial-visual">{current.visual}</div>
          <div className="tutorial-copy">
            <span className="tutorial-kicker">{current.kicker}</span>
            <h1>{current.title}</h1>
            <p>{current.text}</p>
            <p className="tutorial-note">{current.note}</p>
          </div>
        </div>

        <div className="tutorial-nav">
          <button
            type="button"
            className="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
          >
            ← ANTERIOR
          </button>

          <div className="tutorial-dots" aria-label={`Paso ${step + 1} de ${steps.length}`}>
            {steps.map((_, index) => (
              <i key={index} className={index === step ? 'is-active' : ''} />
            ))}
          </div>

          {last ? (
            <button type="button" className="button button--primary" onClick={onDone}>
              {nextLabel} →
            </button>
          ) : (
            <button
              type="button"
              className="button button--primary"
              onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}
            >
              SIGUIENTE →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
