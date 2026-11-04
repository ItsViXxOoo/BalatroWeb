import { describe, expect, it } from 'vitest';
import { cardChips, describeHand, evaluateHand } from '../poker';
import type { Card, Rank, Suit } from '../types';

const c = (rank: Rank, suit: Suit): Card => ({ id: `${suit}-${rank}`, rank, suit });

describe('evaluación de manos', () => {
  it('detecta carta alta', () => {
    const hand = evaluateHand([c(14, 'spades'), c(9, 'hearts'), c(7, 'clubs')]);
    expect(hand.type).toBe('high_card');
  });

  it('detecta pareja, doble pareja, trío, full y póker', () => {
    expect(evaluateHand([c(10, 'hearts'), c(10, 'spades'), c(4, 'clubs')]).type).toBe('pair');
    expect(
      evaluateHand([c(10, 'hearts'), c(10, 'spades'), c(4, 'clubs'), c(4, 'diamonds')]).type,
    ).toBe('two_pair');
    expect(
      evaluateHand([c(12, 'hearts'), c(12, 'spades'), c(12, 'clubs'), c(3, 'diamonds')]).type,
    ).toBe('three_kind');
    expect(
      evaluateHand([
        c(8, 'hearts'),
        c(8, 'spades'),
        c(8, 'clubs'),
        c(4, 'diamonds'),
        c(4, 'hearts'),
      ]).type,
    ).toBe('full_house');
    expect(
      evaluateHand([
        c(9, 'hearts'),
        c(9, 'spades'),
        c(9, 'clubs'),
        c(9, 'diamonds'),
        c(2, 'hearts'),
      ]).type,
    ).toBe('four_kind');
  });

  it('detecta color y escalera, incluida la escalera al 5', () => {
    expect(
      evaluateHand([
        c(2, 'spades'),
        c(6, 'spades'),
        c(9, 'spades'),
        c(11, 'spades'),
        c(13, 'spades'),
      ]).type,
    ).toBe('flush');
    expect(
      evaluateHand([c(4, 'hearts'), c(5, 'clubs'), c(6, 'diamonds'), c(7, 'spades'), c(8, 'hearts')])
        .type,
    ).toBe('straight');
    expect(
      evaluateHand([c(14, 'hearts'), c(2, 'clubs'), c(3, 'diamonds'), c(4, 'spades'), c(5, 'hearts')])
        .type,
    ).toBe('straight');
  });

  it('detecta escalera de color y prioriza full sobre color', () => {
    expect(
      evaluateHand([c(5, 'hearts'), c(6, 'hearts'), c(7, 'hearts'), c(8, 'hearts'), c(9, 'hearts')])
        .type,
    ).toBe('straight_flush');
    expect(
      evaluateHand([
        c(8, 'hearts'),
        c(8, 'hearts'),
        c(8, 'hearts'),
        c(4, 'hearts'),
        c(4, 'hearts'),
      ]).type,
    ).toBe('full_house');
  });

  it('calcula chips de carta con As = 11 y figuras = 10', () => {
    expect(cardChips(c(14, 'spades'))).toBe(11);
    expect(cardChips(c(13, 'hearts'))).toBe(10);
    expect(cardChips(c(7, 'clubs'))).toBe(7);
  });

  it('describe las manos en español', () => {
    const cards = [c(10, 'hearts'), c(10, 'spades')];
    expect(describeHand(cards, evaluateHand(cards))).toBe('Pareja de 10');
    const full = [c(8, 'hearts'), c(8, 'spades'), c(8, 'clubs'), c(4, 'diamonds'), c(4, 'hearts')];
    expect(describeHand(full, evaluateHand(full))).toBe('Full de 8 con 4');
  });
});
