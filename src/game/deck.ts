import type { Card, Rank, Suit } from './types';

const SUIT_ORDER: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANK_ORDER: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export const HAND_SIZE = 8;

/** Generador pseudoaleatorio con semilla. El estado vive en el objeto, no en globals. */
export class Rng {
  state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(maxExclusive: number): number {
    return Math.floor(this.next() * maxExclusive);
  }
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUIT_ORDER) {
    for (const rank of RANK_ORDER) {
      deck.push({ id: `${suit}-${rank}`, rank, suit });
    }
  }
  return deck;
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = rng.int(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function hasPair(cards: Card[]): boolean {
  const seen = new Set<Rank>();
  for (const card of cards) {
    if (seen.has(card.rank)) return true;
    seen.add(card.rank);
  }
  return false;
}

export interface OpeningDeal {
  hand: Card[];
  deck: Card[];
}

/**
 * Reparte 8 cartas con una garantía pedagógica: si no hay ninguna pareja,
 * se vuelve a barajar. Evita la primera mano frustrante en la demo.
 */
export function dealOpeningHand(rng: Rng, count = HAND_SIZE): OpeningDeal {
  let hand: Card[] = [];
  let deck: Card[] = [];

  for (let attempt = 0; attempt < 40; attempt += 1) {
    deck = shuffle(createDeck(), rng);
    hand = deck.slice(0, count);
    if (hasPair(hand)) break;
  }

  return { hand, deck: deck.slice(hand.length) };
}

export interface DrawResult {
  drawn: Card[];
  rest: Card[];
}

export function drawCards(deck: Card[], count: number): DrawResult {
  const safeCount = Math.max(0, Math.min(count, deck.length));
  return {
    drawn: deck.slice(0, safeCount),
    rest: deck.slice(safeCount),
  };
}

export function sortHand(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    if (a.suit !== b.suit) return SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
    return a.rank - b.rank;
  });
}
