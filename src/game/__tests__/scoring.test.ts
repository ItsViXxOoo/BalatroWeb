import { describe, expect, it } from 'vitest';
import { JOKERS } from '../jokers';
import { scoreHand } from '../scoring';
import type { Card, JokerDef, Rank, Suit } from '../types';

const c = (rank: Rank, suit: Suit): Card => ({ id: `${suit}-${rank}`, rank, suit });
const joker = (id: string): JokerDef => {
  const found = JOKERS.find((item) => item.id === id);
  if (!found) throw new Error(id);
  return found;
};

describe('puntuación chips × mult', () => {
  it('suma chips base + cartas y multiplica por el mult de la mano', () => {
    const result = scoreHand([c(10, 'hearts'), c(10, 'spades')], []);
    expect(result.baseChips).toBe(10);
    expect(result.cardChips).toBe(20);
    expect(result.chips).toBe(30);
    expect(result.mult).toBe(2);
    expect(result.total).toBe(60);
  });

  it('aplica chips planos de comodines', () => {
    const cards = [c(2, 'hearts'), c(3, 'clubs'), c(4, 'diamonds'), c(5, 'spades'), c(7, 'hearts')];
    const result = scoreHand(cards, [joker('gafas')]);
    expect(result.cardChips).toBe(21);
    expect(result.chips).toBe(5 + 21 + 60);
    expect(result.total).toBe(86);
  });

  it('aplica multiplicadores en orden', () => {
    const cards = [c(10, 'hearts'), c(10, 'spades'), c(2, 'clubs'), c(3, 'diamonds'), c(4, 'spades')];
    const result = scoreHand(cards, [joker('cuatrero'), joker('dado')]);
    expect(result.mult).toBeCloseTo((2 + 4) * 1.5);
    expect(result.total).toBe(Math.round(result.chips * 9));
  });

  it('Reliquia cuenta todos los comodines equipados, incluida ella', () => {
    const result = scoreHand([c(9, 'hearts'), c(9, 'spades')], [
      joker('cuatrero'),
      joker('reliquia'),
    ]);
    expect(result.mult).toBe(2 + 4 + 4);
    expect(result.jokerNames).toContain('Reliquia');
  });

  it('Bailarín dobla el mult en escalera', () => {
    const cards = [c(4, 'hearts'), c(5, 'clubs'), c(6, 'diamonds'), c(7, 'spades'), c(8, 'hearts')];
    const result = scoreHand(cards, [joker('bailarin')]);
    expect(result.mult).toBe(8);
    expect(result.total).toBe(Math.round(result.chips * 8));
  });

  it('los comodines sin condición no se activan', () => {
    const result = scoreHand([c(2, 'hearts'), c(3, 'clubs')], [joker('dado'), joker('farolero')]);
    expect(result.jokerNames).toHaveLength(0);
    expect(result.total).toBe(10);
  });
});
