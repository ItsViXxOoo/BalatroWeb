import { dealOpeningHand, drawCards, Rng, shuffle } from './deck';
import { getJoker, JOKERS } from './jokers';
import {
  HAND_SIZE_LIMIT,
  MAX_JOKERS,
  REWARD_PER_HAND,
  ROUNDS,
  START_MONEY,
} from './rounds';
import { scoreHand } from './scoring';
import type { Card, JokerDef, ScoreResult } from './types';

export type Phase = 'roundIntro' | 'playing' | 'roundWon' | 'shop' | 'runLost' | 'runComplete';

export interface ShopOffer {
  id: string;
  jokerId: string;
  sold: boolean;
}

export interface BestHand {
  name: string;
  total: number;
}

export interface GameState {
  phase: Phase;
  runId: string;
  player: string;
  seed: number;
  rngState: number;
  roundIndex: number;
  target: number;
  handsLeft: number;
  discardsLeft: number;
  money: number;
  deck: Card[];
  hand: Card[];
  selected: string[];
  jokers: JokerDef[];
  roundScore: number;
  runScore: number;
  elapsedMs: number;
  pendingReward: number;
  shopOffers: ShopOffer[];
  lastResult: ScoreResult | null;
  scorePulse: number;
  message: string | null;
  messageId: number;
  bestHand: BestHand | null;
  handsPlayed: number;
}

export type GameAction =
  | { type: 'START_RUN'; player: string; seed?: number }
  | { type: 'BEGIN_ROUND' }
  | { type: 'TOGGLE_CARD'; cardId: string }
  | { type: 'PLAY_HAND' }
  | { type: 'DISCARD' }
  | { type: 'GO_SHOP' }
  | { type: 'BUY_JOKER'; offerId: string }
  | { type: 'SELL_JOKER'; jokerId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'TICK'; delta: number }
  | { type: 'CLEAR_MESSAGE'; messageId: number };

export function shuffleSeed(): number {
  return (Date.now() ^ Math.imul(Math.floor(Math.random() * 0xffffffff), 2654435761)) >>> 0;
}

export function createInitialState(): GameState {
  return {
    phase: 'roundIntro',
    runId: 'sin-run',
    player: '',
    seed: 0,
    rngState: 0,
    roundIndex: 0,
    target: ROUNDS[0].target,
    handsLeft: ROUNDS[0].hands,
    discardsLeft: ROUNDS[0].discards,
    money: START_MONEY,
    deck: [],
    hand: [],
    selected: [],
    jokers: [],
    roundScore: 0,
    runScore: 0,
    elapsedMs: 0,
    pendingReward: 0,
    shopOffers: [],
    lastResult: null,
    scorePulse: 0,
    message: null,
    messageId: 0,
    bestHand: null,
    handsPlayed: 0,
  };
}

function message(state: GameState, text: string): GameState {
  return { ...state, message: text, messageId: state.messageId + 1 };
}

function selectedCards(state: GameState): Card[] {
  return state.hand.filter((card) => state.selected.includes(card.id));
}

function currentRound(state: GameState) {
  return ROUNDS[state.roundIndex];
}

function startRun(state: GameState, action: Extract<GameAction, { type: 'START_RUN' }>): GameState {
  const seed = (action.seed ?? shuffleSeed()) >>> 0;
  const rng = new Rng(seed);
  const round = ROUNDS[0];
  const { hand, deck } = dealOpeningHand(rng);

  return {
    ...createInitialState(),
    phase: 'roundIntro',
    runId: `run-${seed}-${state.messageId}-${action.player}`,
    player: action.player,
    seed,
    rngState: rng.state,
    roundIndex: 0,
    target: round.target,
    handsLeft: round.hands,
    discardsLeft: round.discards,
    deck,
    hand,
  };
}

function playHand(state: GameState): GameState {
  if (state.phase !== 'playing') return state;

  const cards = selectedCards(state);
  if (cards.length === 0) return message(state, 'Elige al menos una carta.');
  if (cards.length > HAND_SIZE_LIMIT) return message(state, 'Puedes jugar hasta 5 cartas.');

  const result = scoreHand(cards, state.jokers);
  const remaining = state.hand.filter((card) => !state.selected.includes(card.id));
  const { drawn, rest } = drawCards(state.deck, cards.length);
  const handsLeft = state.handsLeft - 1;
  const roundScore = state.roundScore + result.total;
  const runScore = state.runScore + result.total;
  const bestHand =
    !state.bestHand || result.total > state.bestHand.total
      ? { name: result.describe, total: result.total }
      : state.bestHand;

  const next: GameState = {
    ...state,
    hand: [...remaining, ...drawn],
    deck: rest,
    selected: [],
    roundScore,
    runScore,
    handsLeft,
    lastResult: result,
    scorePulse: state.scorePulse + 1,
    bestHand,
    handsPlayed: state.handsPlayed + 1,
    message: null,
  };

  if (roundScore >= state.target) {
    if (state.roundIndex >= ROUNDS.length - 1) {
      return { ...next, phase: 'runComplete' };
    }
    const reward = currentRound(state).reward + REWARD_PER_HAND * handsLeft;
    return { ...next, phase: 'roundWon', pendingReward: reward };
  }

  if (handsLeft <= 0) {
    return { ...next, phase: 'runLost' };
  }

  return next;
}

function discard(state: GameState): GameState {
  if (state.phase !== 'playing') return state;
  if (state.discardsLeft <= 0) return message(state, 'No te quedan descartes.');

  const cards = selectedCards(state);
  if (cards.length === 0) return message(state, 'Elige al menos una carta para descartar.');
  if (cards.length > HAND_SIZE_LIMIT) return message(state, 'Puedes descartar hasta 5 cartas.');

  const remaining = state.hand.filter((card) => !state.selected.includes(card.id));
  const { drawn, rest } = drawCards(state.deck, cards.length);

  return {
    ...state,
    hand: [...remaining, ...drawn],
    deck: rest,
    selected: [],
    discardsLeft: state.discardsLeft - 1,
    lastResult: null,
    message: `Descartaste ${cards.length} ${cards.length === 1 ? 'carta' : 'cartas'}.`,
    messageId: state.messageId + 1,
  };
}

function buyJoker(state: GameState, offerId: string): GameState {
  if (state.phase !== 'shop') return state;

  const offer = state.shopOffers.find((item) => item.id === offerId);
  if (!offer || offer.sold) return state;

  if (state.jokers.length >= MAX_JOKERS) {
    return message(state, `Ya tienes ${MAX_JOKERS} comodines. Vende uno primero.`);
  }

  const joker = getJoker(offer.jokerId);
  if (state.money < joker.cost) return message(state, 'No te alcanza el dinero.');

  return {
    ...state,
    money: state.money - joker.cost,
    jokers: [...state.jokers, joker],
    shopOffers: state.shopOffers.map((item) =>
      item.id === offerId ? { ...item, sold: true } : item,
    ),
    message: `Compraste ${joker.name}.`,
    messageId: state.messageId + 1,
  };
}

function sellJoker(state: GameState, jokerId: string): GameState {
  if (state.phase !== 'shop') return state;

  const joker = state.jokers.find((item) => item.id === jokerId);
  if (!joker) return state;

  const refund = Math.max(1, Math.floor(joker.cost / 2));

  return {
    ...state,
    jokers: state.jokers.filter((item) => item.id !== jokerId),
    money: state.money + refund,
    message: `Vendiste ${joker.name} por $${refund}.`,
    messageId: state.messageId + 1,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_RUN':
      return startRun(state, action);

    case 'BEGIN_ROUND':
      return state.phase === 'roundIntro' ? { ...state, phase: 'playing', message: null } : state;

    case 'TOGGLE_CARD': {
      if (state.phase !== 'playing') return state;
      if (state.selected.includes(action.cardId)) {
        return { ...state, selected: state.selected.filter((id) => id !== action.cardId) };
      }
      if (state.selected.length >= HAND_SIZE_LIMIT) {
        return message(state, 'Máximo 5 cartas por mano.');
      }
      return { ...state, selected: [...state.selected, action.cardId], message: null };
    }

    case 'PLAY_HAND':
      return playHand(state);

    case 'DISCARD':
      return discard(state);

    case 'GO_SHOP': {
      if (state.phase !== 'roundWon') return state;
      const rng = new Rng(state.rngState);
      const owned = new Set(state.jokers.map((joker) => joker.id));
      const pool = shuffle(
        JOKERS.filter((joker) => !owned.has(joker.id)),
        rng,
      );
      const offers: ShopOffer[] = pool.slice(0, 3).map((joker, index) => ({
        id: `${state.runId}-oferta-${state.roundIndex}-${index}`,
        jokerId: joker.id,
        sold: false,
      }));

      return {
        ...state,
        phase: 'shop',
        money: state.money + state.pendingReward,
        pendingReward: 0,
        shopOffers: offers,
        rngState: rng.state,
        message: null,
      };
    }

    case 'BUY_JOKER':
      return buyJoker(state, action.offerId);

    case 'SELL_JOKER':
      return sellJoker(state, action.jokerId);

    case 'NEXT_ROUND': {
      if (state.phase !== 'shop') return state;
      const nextIndex = state.roundIndex + 1;
      if (nextIndex >= ROUNDS.length) return state;

      const round = ROUNDS[nextIndex];
      const rng = new Rng(state.rngState);
      const { hand, deck } = dealOpeningHand(rng);

      return {
        ...state,
        phase: 'roundIntro',
        roundIndex: nextIndex,
        target: round.target,
        handsLeft: round.hands,
        discardsLeft: round.discards,
        roundScore: 0,
        hand,
        deck,
        selected: [],
        shopOffers: [],
        pendingReward: 0,
        lastResult: null,
        rngState: rng.state,
        message: null,
      };
    }

    case 'TICK': {
      if (state.phase !== 'playing') return state;
      const delta = Math.min(Math.max(0, action.delta), 5000);
      return { ...state, elapsedMs: state.elapsedMs + delta };
    }

    case 'CLEAR_MESSAGE':
      return state.messageId === action.messageId ? { ...state, message: null } : state;

    default:
      return state;
  }
}

export function mesasSuperadas(state: GameState): number {
  return state.phase === 'runComplete' ? ROUNDS.length : state.roundIndex;
}
