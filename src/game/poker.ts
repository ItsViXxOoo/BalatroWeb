import { HAND_INFO, RANK_LABELS, SUITS } from './types';
import type { Card, HandInfo, HandType, Rank } from './types';

export function cardChips(card: Card): number {
  if (card.rank === 14) return 11;
  if (card.rank >= 11) return 10;
  return card.rank;
}

export function cardLabel(card: Card): string {
  return RANK_LABELS[card.rank];
}

function isStraight(ranks: Rank[]): boolean {
  if (ranks.length !== 5) return false;
  const unique = [...new Set(ranks)].sort((a, b) => b - a);
  if (unique.length !== 5) return false;
  const wheel = unique[0] === 14 && unique[1] === 5 && unique[2] === 4 && unique[3] === 3 && unique[4] === 2;
  if (wheel) return true;
  return unique.every((rank, index) => index === 0 || unique[index - 1] - rank === 1);
}

export interface EvaluatedHand extends HandInfo {
  groups: Array<{ rank: Rank; count: number }>;
  isFlush: boolean;
  isStraight: boolean;
}

export function evaluateHand(cards: Card[]): EvaluatedHand {
  if (cards.length === 0) {
    throw new Error('No se puede evaluar una mano vacía.');
  }

  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }
  const groups = [...counts.entries()]
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  const ranks = cards.map((card) => card.rank);
  const flush = cards.length === 5 && cards.every((card) => card.suit === cards[0].suit);
  const straight = isStraight(ranks);

  let type: HandType;
  if (flush && straight) type = 'straight_flush';
  else if (groups[0].count === 4) type = 'four_kind';
  else if (groups[0].count === 3 && groups[1]?.count === 2) type = 'full_house';
  else if (flush) type = 'flush';
  else if (straight) type = 'straight';
  else if (groups[0].count === 3) type = 'three_kind';
  else if (groups[0].count === 2 && groups[1]?.count === 2) type = 'two_pair';
  else if (groups[0].count === 2) type = 'pair';
  else type = 'high_card';

  return {
    ...HAND_INFO[type],
    groups,
    isFlush: flush,
    isStraight: straight,
  };
}

export function describeHand(cards: Card[], hand: EvaluatedHand): string {
  const label = (rank: Rank) => RANK_LABELS[rank];
  const primary = hand.groups[0]?.rank;

  switch (hand.type) {
    case 'pair':
      return `Pareja de ${label(primary)}`;
    case 'two_pair':
      return `Doble pareja de ${label(primary)} y ${label(hand.groups[1].rank)}`;
    case 'three_kind':
      return `Trío de ${label(primary)}`;
    case 'four_kind':
      return `Póker de ${label(primary)}`;
    case 'full_house':
      return `Full de ${label(primary)} con ${label(hand.groups[1].rank)}`;
    case 'flush':
      return `Color de ${SUITS[cards[0].suit].name}`;
    case 'straight': {
      const unique = [...new Set(cards.map((card) => card.rank))].sort((a, b) => b - a);
      const wheel = unique[0] === 14 && unique[1] === 5;
      return `Escalera al ${label(wheel ? 5 : unique[0])}`;
    }
    case 'straight_flush':
      return `Escalera de color de ${SUITS[cards[0].suit].name}`;
    default: {
      const high = [...cards].sort((a, b) => b.rank - a.rank)[0];
      return `Carta alta: ${label(high.rank)} de ${SUITS[high.suit].name}`;
    }
  }
}
