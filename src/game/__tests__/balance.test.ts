import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  gameReducer,
  mesasSuperadas,
  type GameState,
} from '../engine';
import { getJoker } from '../jokers';
import { scoreHand } from '../scoring';
import type { Card } from '../types';

const PRIORITY = ['dado', 'gafas', 'bailarin', 'coleccionista', 'cuatrero', 'pareja_feliz', 'reliquia', 'farolero'];

function combinations<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  const walk = (start: number, current: T[]) => {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let index = start; index < items.length; index += 1) {
      current.push(items[index]);
      walk(index + 1, current);
      current.pop();
    }
  };
  walk(0, []);
  return result;
}

function bestPlay(hand: Card[], jokers: GameState['jokers']): Card[] {
  let best: Card[] = [hand[0]];
  let bestScore = -1;
  for (let size = 1; size <= 5; size += 1) {
    for (const cards of combinations(hand, size)) {
      const score = scoreHand(cards, jokers).total;
      if (score > bestScore) {
        best = cards;
        bestScore = score;
      }
    }
  }
  return best;
}

function buyBest(state: GameState): GameState {
  let next = state;
  const offers = [...next.shopOffers]
    .filter((offer) => !offer.sold)
    .sort((a, b) => {
      const ja = getJoker(a.jokerId);
      const jb = getJoker(b.jokerId);
      return PRIORITY.indexOf(ja.id) - PRIORITY.indexOf(jb.id);
    });

  for (const offer of offers) {
    const joker = getJoker(offer.jokerId);
    if (next.jokers.length >= 5 || next.money < joker.cost) continue;
    next = gameReducer(next, { type: 'BUY_JOKER', offerId: offer.id });
  }
  return next;
}

function simulate(seed: number): GameState {
  let state = gameReducer(createInitialState(), { type: 'START_RUN', player: 'BOT', seed });
  let guard = 0;

  while (guard < 300) {
    guard += 1;
    if (state.phase === 'roundIntro') {
      state = gameReducer(state, { type: 'BEGIN_ROUND' });
    } else if (state.phase === 'playing') {
      const play = bestPlay(state.hand, state.jokers);
      for (const card of play) {
        state = gameReducer(state, { type: 'TOGGLE_CARD', cardId: card.id });
      }
      state = gameReducer(state, { type: 'PLAY_HAND' });
    } else if (state.phase === 'roundWon') {
      state = gameReducer(state, { type: 'GO_SHOP' });
    } else if (state.phase === 'shop') {
      state = buyBest(state);
      state = gameReducer(state, { type: 'NEXT_ROUND' });
    } else {
      break;
    }
  }

  return state;
}

describe('balance de la run', () => {
  it('una política codiciosa completa una parte razonable de las runs', () => {
    const runs = 200;
    let wins = 0;
    let mesas = 0;
    let best = 0;

    for (let index = 0; index < runs; index += 1) {
      const final = simulate(index * 7919 + 13);
      if (final.phase === 'runComplete') wins += 1;
      mesas += mesasSuperadas(final);
      best = Math.max(best, final.runScore);
    }

    const winRate = wins / runs;
    console.log(
      `[balance] runs=${runs} winRate=${(winRate * 100).toFixed(1)}% mesasPromedio=${(
        mesas / runs
      ).toFixed(2)} mejorPuntaje=${best}`,
    );

    expect(winRate).toBeGreaterThan(0.25);
    expect(winRate).toBeLessThan(0.95);
  });
});
