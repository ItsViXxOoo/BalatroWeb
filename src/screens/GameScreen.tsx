import { useEffect, type Dispatch } from 'react';
import type { GameAction, GameState } from '../game/engine';
import { formatMult, scoreHand } from '../game/scoring';
import { REWARD_PER_HAND, ROUNDS } from '../game/rounds';
import type { PlaySound } from '../hooks/useSound';
import { CardView } from '../components/game/CardView';
import { ScorePreview } from '../components/game/ScorePreview';
import { TargetBar } from '../components/game/TargetBar';
import { Timer } from '../components/game/Timer';
import { JokerCard } from '../components/ui/JokerCard';
import { Modal } from '../components/ui/Modal';

const ROUND_TIPS = [
  'Empieza formando parejas y tríos. No necesitas la mano perfecta para pasar La Cantina.',
  'Con 700 puntos necesitas comodines. Compra en la trastienda y aprovecha los descartes.',
  'La Bóveda pide 1.800. Juega 5 cartas si tienes comodines que premian manos grandes.',
];

interface GameScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  playSound: PlaySound;
  muted: boolean;
  onToggleMute: () => void;
  onHelp: () => void;
}

export function GameScreen({
  state,
  dispatch,
  playSound,
  muted,
  onToggleMute,
  onHelp,
}: GameScreenProps) {
  const round = ROUNDS[state.roundIndex];
  const selectedCards = state.hand.filter((card) => state.selected.includes(card.id));
  const preview =
    selectedCards.length > 0 ? scoreHand(selectedCards, state.jokers) : state.lastResult;
  const showingPlayed = selectedCards.length === 0 && state.lastResult !== null;
  const canAct = state.phase === 'playing';
  const canPlay = canAct && selectedCards.length >= 1 && selectedCards.length <= 5;
  const canDiscard = canPlay && state.discardsLeft > 0;
  const coachVisible = canAct && state.handsPlayed === 0 && state.selected.length === 0;

  useEffect(() => {
    if (!state.message) return;
    const timeout = window.setTimeout(() => {
      dispatch({ type: 'CLEAR_MESSAGE', messageId: state.messageId });
    }, 2400);
    return () => window.clearTimeout(timeout);
  }, [dispatch, state.message, state.messageId]);

  const toggleCard = (cardId: string) => {
    playSound('card');
    dispatch({ type: 'TOGGLE_CARD', cardId });
  };

  const clearSelection = () => {
    playSound('click');
    state.selected.forEach((cardId) => dispatch({ type: 'TOGGLE_CARD', cardId }));
  };

  const playHand = () => {
    if (!canPlay) return;
    playSound('score');
    dispatch({ type: 'PLAY_HAND' });
  };

  const discard = () => {
    if (!canDiscard) return;
    playSound('click');
    dispatch({ type: 'DISCARD' });
  };

  const beginRound = () => {
    playSound('click');
    dispatch({ type: 'BEGIN_ROUND' });
  };

  const goShop = () => {
    playSound('coin');
    dispatch({ type: 'GO_SHOP' });
  };

  const progress = Math.min(100, (state.roundScore / state.target) * 100);
  const rewardExtra = state.handsLeft * REWARD_PER_HAND;

  return (
    <div className="game-shell">
      <header className="game-topbar">
        <div className="round-marker">
          <span>MESA {state.roundIndex + 1}/3</span>
          <b>{round.name}</b>
        </div>

        <div className="top-progress">
          <div className="top-progress-head">
            <span>OBJETIVO</span>
            <b>
              {state.roundScore.toLocaleString('es')} / {state.target.toLocaleString('es')}
            </b>
          </div>
          <div className="top-progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="game-top-actions">
          <Timer ms={state.elapsedMs} />
          <span className="money-chip" title="Dinero para la tienda">
            <i>$</i>
            {state.money}
          </span>
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

      <main className="game-table">
        <section className="jokers-zone" aria-label="Comodines equipados">
          <div className="zone-label">
            <span>COMODINES</span>
            <b>{state.jokers.length}/5</b>
          </div>
          <div className="joker-slots">
            {Array.from({ length: 5 }, (_, index) => {
              const joker = state.jokers[index];
              return joker ? (
                <JokerCard key={joker.id} joker={joker} size="sm" />
              ) : (
                <div className="joker-slot-empty" key={`empty-${index}`} aria-label="Ranura vacía">
                  <span>+</span>
                  <small>VACÍA</small>
                </div>
              );
            })}
          </div>
        </section>

        <div className="board-grid">
          <ScorePreview
            result={preview}
            selectedCount={state.selected.length}
            played={showingPlayed}
            pulse={state.scorePulse}
          />
          <TargetBar
            score={state.roundScore}
            target={state.target}
            handsLeft={state.handsLeft}
            discardsLeft={state.discardsLeft}
            round={round}
          />
        </div>

        <section className="hand-zone" aria-label="Tu mano">
          <div className="hand-meta">
            <span>
              TU MANO · <b>{state.selected.length}/5</b> seleccionadas
            </span>
            {state.selected.length > 0 ? (
              <button type="button" className="text-button" onClick={clearSelection}>
                Limpiar
              </button>
            ) : null}
          </div>

          <div className="hand-row">
            {state.hand.map((card, index) => (
              <CardView
                key={card.id}
                card={card}
                index={index}
                selected={state.selected.includes(card.id)}
                disabled={!canAct}
                onClick={() => toggleCard(card.id)}
              />
            ))}
          </div>

          {coachVisible ? (
            <div className="coach-hint">
              <b>1.</b> Toca de 1 a 5 cartas <b>2.</b> Mira la vista previa <b>3.</b> Pulsa JUGAR
              MANO
            </div>
          ) : null}
        </section>

        <div className="action-bar">
          <button
            type="button"
            className="button button--discard"
            onClick={discard}
            disabled={!canDiscard}
          >
            DESCARTAR
            <span className="button-badge">{state.discardsLeft}</span>
          </button>

          <div className="action-center" aria-live="polite">
            {preview ? (
              <>
                <b>{preview.describe}</b>
                <span>
                  {preview.chips} Chips × {formatMult(preview.mult)} Mult ·{' '}
                  {preview.total.toLocaleString('es')} puntos
                </span>
              </>
            ) : (
              <>
                <b>Elige tu mano</b>
                <span>La vista previa te dice cuánto puntuaría.</span>
              </>
            )}
          </div>

          <button
            type="button"
            className="button button--play"
            onClick={playHand}
            disabled={!canPlay}
          >
            JUGAR MANO
            <span className="button-badge">{state.selected.length}/5</span>
          </button>
        </div>
      </main>

      <Modal
        open={state.phase === 'roundIntro'}
        onClose={beginRound}
        title={`MESA ${state.roundIndex + 1} · ${round.name}`}
        className="round-modal"
        closeLabel="Empezar mesa"
        footer={
          <button type="button" className="button button--primary button--xl" onClick={beginRound}>
            EMPEZAR MESA →
          </button>
        }
      >
        <p className="round-sub">{round.subtitle}</p>
        <div className="round-target">
          <span>OBJETIVO</span>
          <b>{round.target.toLocaleString('es')}</b>
        </div>
        <div className="round-facts">
          <div>
            <b>{round.hands}</b>
            <span>manos</span>
          </div>
          <div>
            <b>{round.discards}</b>
            <span>descartes</span>
          </div>
          <div>
            <b>${state.money}</b>
            <span>en caja</span>
          </div>
        </div>
        <p className="round-tip">{ROUND_TIPS[state.roundIndex]}</p>
      </Modal>

      <Modal
        open={state.phase === 'roundWon'}
        onClose={goShop}
        title="¡MESA SUPERADA!"
        className="round-modal round-modal--win"
        closeLabel="Ir a la tienda"
        footer={
          <button type="button" className="button button--primary button--xl" onClick={goShop}>
            A LA TRASTIENDA →
          </button>
        }
      >
        <p className="round-sub">
          {state.roundScore.toLocaleString('es')} puntos de {state.target.toLocaleString('es')}
        </p>
        <div className="reward-lines">
          <div>
            <span>Recompensa base</span>
            <b>${round.reward}</b>
          </div>
          <div>
            <span>
              Manos sin usar ({state.handsLeft} × ${REWARD_PER_HAND})
            </span>
            <b>+${rewardExtra}</b>
          </div>
          <div className="is-total">
            <span>Te llevas</span>
            <b>${state.pendingReward}</b>
          </div>
        </div>
        <p className="round-tip">
          En La Trastienda puedes comprar comodines. Se aplican de izquierda a derecha.
        </p>
      </Modal>

      {state.message ? (
        <div className="toast" role="status" key={state.messageId}>
          {state.message}
        </div>
      ) : null}
    </div>
  );
}
