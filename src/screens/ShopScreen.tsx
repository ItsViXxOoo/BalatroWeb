import { useEffect, type Dispatch } from 'react';
import type { GameAction, GameState } from '../game/engine';
import { getJoker } from '../game/jokers';
import { MAX_JOKERS, ROUNDS } from '../game/rounds';
import type { PlaySound } from '../hooks/useSound';
import { JokerCard } from '../components/ui/JokerCard';

interface ShopScreenProps {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  playSound: PlaySound;
  muted: boolean;
  onToggleMute: () => void;
  onHelp: () => void;
}

export function ShopScreen({
  state,
  dispatch,
  playSound,
  muted,
  onToggleMute,
  onHelp,
}: ShopScreenProps) {
  const nextRound = ROUNDS[state.roundIndex + 1];
  const slotsFull = state.jokers.length >= MAX_JOKERS;

  useEffect(() => {
    if (!state.message) return;
    const timeout = window.setTimeout(() => {
      dispatch({ type: 'CLEAR_MESSAGE', messageId: state.messageId });
    }, 2400);
    return () => window.clearTimeout(timeout);
  }, [dispatch, state.message, state.messageId]);

  const buy = (offerId: string, cost: number) => {
    if (state.money < cost || slotsFull) {
      playSound('click');
      dispatch({ type: 'BUY_JOKER', offerId });
      return;
    }
    playSound('buy');
    dispatch({ type: 'BUY_JOKER', offerId });
  };

  const sell = (jokerId: string) => {
    playSound('coin');
    dispatch({ type: 'SELL_JOKER', jokerId });
  };

  const next = () => {
    playSound('click');
    dispatch({ type: 'NEXT_ROUND' });
  };

  return (
    <div className="screen shop-screen">
      <header className="shop-top">
        <div className="shop-heading">
          <span className="top-badge">ENTRE MESAS · MESA {state.roundIndex + 1} SUPERADA</span>
          <h1>LA TRASTIENDA</h1>
        </div>
        <div className="shop-top-right">
          <span className="money-chip money-chip--big" title="Dinero disponible">
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

      <main className="shop-main">
        <div className="shop-lead">
          <p>
            Compra comodines para la siguiente mesa. Se aplican <b>de izquierda a derecha</b> y
            puedes tener hasta <b>{MAX_JOKERS}</b>.
          </p>
          <span className={slotsFull ? 'shop-slots is-full' : 'shop-slots'}>
            {state.jokers.length}/{MAX_JOKERS} ranuras ocupadas
          </span>
        </div>

        <section className="shop-offers" aria-label="Comodines en venta">
          {state.shopOffers.length === 0 ? (
            <p className="shop-empty">No quedan comodines disponibles. ¡Suerte en la mesa!</p>
          ) : (
            state.shopOffers.map((offer) => {
              const joker = getJoker(offer.jokerId);
              const sold = offer.sold;
              const tooExpensive = state.money < joker.cost;
              const disabled = sold || tooExpensive || slotsFull;

              return (
                <div className={`shop-offer ${sold ? 'is-sold' : ''}`} key={offer.id}>
                  <JokerCard
                    joker={joker}
                    showCost
                    dimmed={sold || tooExpensive || slotsFull}
                    action={
                      <button
                        type="button"
                        className="button button--buy"
                        onClick={() => buy(offer.id, joker.cost)}
                        disabled={disabled}
                      >
                        {sold
                          ? 'VENDIDO'
                          : slotsFull
                            ? 'SIN RANURA'
                            : tooExpensive
                              ? 'FALTA DINERO'
                              : `COMPRAR $${joker.cost}`}
                      </button>
                    }
                  />
                  {sold ? <span className="sold-stamp">VENDIDO</span> : null}
                </div>
              );
            })
          )}
        </section>

        <section className="shop-owned" aria-label="Tus comodines">
          <div className="shop-owned-head">
            <h2>TUS COMODINES</h2>
            <span>
              {state.jokers.length}/{MAX_JOKERS}
            </span>
          </div>

          <div className="shop-owned-grid">
            {state.jokers.map((joker) => (
              <JokerCard
                key={joker.id}
                joker={joker}
                action={
                  <button
                    type="button"
                    className="button button--ghost button--small"
                    onClick={() => sell(joker.id)}
                  >
                    VENDER +${Math.max(1, Math.floor(joker.cost / 2))}
                  </button>
                }
              />
            ))}
            {Array.from({ length: Math.max(0, MAX_JOKERS - state.jokers.length) }, (_, index) => (
              <div className="shop-empty-slot" key={`slot-${index}`}>
                <span>+</span>
                <small>RANURA LIBRE</small>
              </div>
            ))}
          </div>
        </section>

        <footer className="shop-footer">
          <div className="shop-next">
            <span>SIGUIENTE MESA</span>
            <b>
              {state.roundIndex + 2}/3 · {nextRound.name}
            </b>
            <em>
              Objetivo {nextRound.target.toLocaleString('es')} · {nextRound.hands} manos
            </em>
          </div>
          <button type="button" className="button button--primary button--xl" onClick={next}>
            SIGUIENTE MESA →
          </button>
        </footer>
      </main>

      {state.message ? (
        <div className="toast" role="status" key={state.messageId}>
          {state.message}
        </div>
      ) : null}
    </div>
  );
}
