export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/** 11 = J, 12 = Q, 13 = K, 14 = A */
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export type HandType =
  | 'high_card'
  | 'pair'
  | 'two_pair'
  | 'three_kind'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'four_kind'
  | 'straight_flush';

export interface HandInfo {
  type: HandType;
  name: string;
  baseChips: number;
  baseMult: number;
  example: string;
}

export const HAND_TABLE: HandInfo[] = [
  { type: 'straight_flush', name: 'Escalera de color', baseChips: 100, baseMult: 8, example: '5♥ 6♥ 7♥ 8♥ 9♥' },
  { type: 'four_kind', name: 'Póker', baseChips: 60, baseMult: 7, example: '9♥ 9♦ 9♣ 9♠' },
  { type: 'full_house', name: 'Full', baseChips: 40, baseMult: 4, example: '8♥ 8♦ 8♣ 4♠ 4♥' },
  { type: 'flush', name: 'Color', baseChips: 35, baseMult: 4, example: '2♠ 6♠ 9♠ J♠ K♠' },
  { type: 'straight', name: 'Escalera', baseChips: 30, baseMult: 4, example: '4♥ 5♣ 6♦ 7♠ 8♥' },
  { type: 'three_kind', name: 'Trío', baseChips: 30, baseMult: 3, example: 'Q♥ Q♦ Q♣' },
  { type: 'two_pair', name: 'Doble pareja', baseChips: 20, baseMult: 2, example: '10♥ 10♦ 6♣ 6♠' },
  { type: 'pair', name: 'Pareja', baseChips: 10, baseMult: 2, example: '7♥ 7♦' },
  { type: 'high_card', name: 'Carta alta', baseChips: 5, baseMult: 1, example: 'A♠' },
];

export const HAND_INFO: Record<HandType, HandInfo> = Object.fromEntries(
  HAND_TABLE.map((hand) => [hand.type, hand]),
) as Record<HandType, HandInfo>;

export const SUITS: Record<Suit, { symbol: string; name: string; red: boolean }> = {
  hearts: { symbol: '♥', name: 'Corazones', red: true },
  diamonds: { symbol: '♦', name: 'Diamantes', red: true },
  clubs: { symbol: '♣', name: 'Tréboles', red: false },
  spades: { symbol: '♠', name: 'Picas', red: false },
};

export const RANK_LABELS: Record<Rank, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

export interface ScoreStep {
  label: string;
  detail: string;
  kind: 'base' | 'chips' | 'mult' | 'xmult' | 'total';
}

export interface ScoreResult {
  handType: HandType;
  handName: string;
  describe: string;
  baseChips: number;
  cardChips: number;
  chips: number;
  baseMult: number;
  mult: number;
  total: number;
  steps: ScoreStep[];
  jokerNames: string[];
}

export interface JokerContext {
  handType: HandType;
  cards: Card[];
  jokers: JokerDef[];

  /** Cartas en mano (no jugadas) - para efectos "held in hand" */
  hand?: Card[];
  /** Cartas descartadas esta ronda */
  discarded?: Card[];
  /** Dinero actual del jugador */
  money?: number;
  /** Descartes restantes */
  discardsLeft?: number;
  /** Manos restantes */
  handsLeft?: number;
  /** Número de manos jugadas en la run */
  handsPlayed?: number;
  /** Índice de la ronda actual (0-based) */
  roundIndex?: number;
  /** Mazo completo (para Blue Joker, Erosion) */
  deck?: Card[];
  /** Tamaño inicial del mazo (52) */
  startingDeckSize?: number;
  /** Cartas vendidas en la run (para Campfire) */
  cardsSold?: number;
  /** Cartas jugadas esta ronda (para Loyalty Card) */
  cardsPlayedThisRound?: number;
  /** Si es la última mano de la ronda */
  isFinalHand?: boolean;
}

export interface JokerEffect {
  chips?: number;
  mult?: number;
  xmult?: number;
  /** Dinero ganado (para efectos de economía) */
  money?: number;
  label: string;
}

export interface JokerDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: (ctx: JokerContext) => JokerEffect | null;
}

export interface RankEntry {
  id: string;
  name: string;
  score: number;
  mesas: number;
  timeMs: number;
  date: number;
  won: boolean;
  bestHand: string;
}
