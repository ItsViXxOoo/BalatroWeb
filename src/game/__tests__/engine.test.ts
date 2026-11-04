import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  gameReducer,
  mesasSuperadas,
  type GameAction,
  type GameState,
} from '../engine';
import { hasPair } from '../deck';
import { ROUNDS } from '../rounds';

const run = (state: GameState, ...actions: GameAction[]): GameState =>
  actions.reduce((current, action) => gameReducer(current, action), state);

function started(seed = 42): GameState {
  return run(createInitialState(), { type: 'START_RUN', player: 'ANA', seed }, { type: 'BEGIN_ROUND' });
}

describe('motor de la run', () => {
  it('inicia con 8 cartas, pareja garantizada y dinero inicial', () => {
    const state = run(createInitialState(), { type: 'START_RUN', player: 'ANA', seed: 7 });
    expect(state.phase).toBe('roundIntro');
    expect(state.hand).toHaveLength(8);
    expect(hasPair(state.hand)).toBe(true);
    expect(state.money).toBe(6);
    expect(state.target).toBe(200);
    expect(state.handsLeft).toBe(3);
    expect(state.discardsLeft).toBe(2);
  });

  it('jugar una mano descuenta manos, suma puntos y repone cartas', () => {
    const state = started();
    const cardId = state.hand[0].id;
    const after = run(state, { type: 'TOGGLE_CARD', cardId }, { type: 'PLAY_HAND' });
    expect(after.handsLeft).toBe(2);
    expect(after.runScore).toBeGreaterThan(0);
    expect(after.selected).toHaveLength(0);
    expect(after.hand).toHaveLength(8);
    expect(after.lastResult).not.toBeNull();
  });

  it('impide seleccionar más de 5 cartas', () => {
    const state = started();
    const after = state.hand
      .slice(0, 6)
      .reduce((current, card) => gameReducer(current, { type: 'TOGGLE_CARD', cardId: card.id }), state);
    expect(after.selected).toHaveLength(5);
    expect(after.message).toMatch(/Máximo 5/);
  });

  it('no permite jugar sin cartas seleccionadas', () => {
    const state = started();
    const after = gameReducer(state, { type: 'PLAY_HAND' });
    expect(after.handsLeft).toBe(3);
    expect(after.message).toMatch(/al menos una/);
  });

  it('gana la mesa al alcanzar el objetivo y abre la tienda con recompensa', () => {
    const base = started();
    const cardId = base.hand[0].id;
    const won = gameReducer(
      { ...base, roundScore: base.target - 1, selected: [cardId] },
      { type: 'PLAY_HAND' },
    );
    expect(won.phase).toBe('roundWon');
    expect(won.pendingReward).toBeGreaterThan(0);

    const shop = gameReducer(won, { type: 'GO_SHOP' });
    expect(shop.phase).toBe('shop');
    expect(shop.money).toBe(6 + won.pendingReward);
    expect(shop.shopOffers.length).toBeGreaterThan(0);
    expect(shop.shopOffers.length).toBeLessThanOrEqual(3);
  });

  it('compra un comodín y descuenta el dinero', () => {
    const base = started();
    const cardId = base.hand[0].id;
    const won = gameReducer(
      { ...base, roundScore: base.target - 1, selected: [cardId] },
      { type: 'PLAY_HAND' },
    );
    let shop = gameReducer(won, { type: 'GO_SHOP' });
    const offer = shop.shopOffers.find((item) => !item.sold);
    expect(offer).toBeTruthy();
    if (!offer) return;

    const before = shop.money;
    shop = gameReducer(shop, { type: 'BUY_JOKER', offerId: offer.id });
    expect(shop.jokers).toHaveLength(1);
    expect(shop.money).toBeLessThan(before);
    expect(shop.shopOffers.find((item) => item.id === offer.id)?.sold).toBe(true);
  });

  it('pierde la run al quedarse sin manos por debajo del objetivo', () => {
    const state = started();
    const cardId = state.hand[0].id;
    const lost = gameReducer(
      { ...state, handsLeft: 1, roundScore: 0, selected: [cardId] },
      { type: 'PLAY_HAND' },
    );
    expect(lost.phase).toBe('runLost');
    expect(mesasSuperadas(lost)).toBe(0);
  });

  it('avanza a la siguiente mesa con objetivo y manos nuevas', () => {
    const base = started();
    const cardId = base.hand[0].id;
    const won = gameReducer(
      { ...base, roundScore: base.target - 1, selected: [cardId] },
      { type: 'PLAY_HAND' },
    );
    const shop = gameReducer(won, { type: 'GO_SHOP' });
    const next = gameReducer(shop, { type: 'NEXT_ROUND' });
    expect(next.phase).toBe('roundIntro');
    expect(next.roundIndex).toBe(1);
    expect(next.target).toBe(ROUNDS[1].target);
    expect(next.handsLeft).toBe(ROUNDS[1].hands);
    expect(next.roundScore).toBe(0);
    expect(next.hand).toHaveLength(8);
    expect(next.jokers).toHaveLength(shop.jokers.length);
  });

  it('completa la run al ganar la última mesa', () => {
    const base = started();
    const cardId = base.hand[0].id;
    const final = gameReducer(
      {
        ...base,
        roundIndex: ROUNDS.length - 1,
        target: ROUNDS[ROUNDS.length - 1].target,
        roundScore: ROUNDS[ROUNDS.length - 1].target - 1,
        selected: [cardId],
      },
      { type: 'PLAY_HAND' },
    );
    expect(final.phase).toBe('runComplete');
    expect(mesasSuperadas(final)).toBe(3);
  });

  it('el cronómetro solo avanza mientras se juega', () => {
    const intro = run(createInitialState(), { type: 'START_RUN', player: 'ANA', seed: 3 });
    expect(gameReducer(intro, { type: 'TICK', delta: 1000 }).elapsedMs).toBe(0);
    const playing = gameReducer(intro, { type: 'BEGIN_ROUND' });
    expect(gameReducer(playing, { type: 'TICK', delta: 1000 }).elapsedMs).toBe(1000);
  });
});
