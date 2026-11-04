import { cardChips as cardChipValue, describeHand, evaluateHand } from './poker';
import type { Card, JokerDef, ScoreResult, ScoreStep } from './types';

/**
 * Puntuación: (chips base de la mano + chips de TODAS las cartas jugadas + chips de comodines)
 * × (mult base + mult de comodines, con multiplicadores aplicados en orden).
 */
export function scoreHand(cards: Card[], jokers: JokerDef[]): ScoreResult {
  const hand = evaluateHand(cards);
  const describe = describeHand(cards, hand);
  const cardChips = cards.reduce((total, card) => total + cardChipValue(card), 0);

  let chips = hand.baseChips + cardChips;
  let mult = hand.baseMult;
  const steps: ScoreStep[] = [
    {
      label: hand.name,
      detail: `+${hand.baseChips} Chips · ×${hand.baseMult} Mult`,
      kind: 'base',
    },
    {
      label: `${cards.length} ${cards.length === 1 ? 'carta' : 'cartas'}`,
      detail: `+${cardChips} Chips`,
      kind: 'chips',
    },
  ];

  const jokerNames: string[] = [];

  for (const joker of jokers) {
    const effect = joker.effect({ handType: hand.type, cards, jokers });
    if (!effect) continue;

    jokerNames.push(joker.name);

    if (effect.chips) {
      chips += effect.chips;
      steps.push({ label: joker.name, detail: effect.label, kind: 'chips' });
    }
    if (effect.mult) {
      mult += effect.mult;
      steps.push({ label: joker.name, detail: effect.label, kind: 'mult' });
    }
    if (effect.xmult) {
      mult *= effect.xmult;
      steps.push({ label: joker.name, detail: effect.label, kind: 'xmult' });
    }
  }

  const total = Math.round(chips * mult);
  steps.push({
    label: 'Total',
    detail: `${Math.round(chips)} × ${formatMult(mult)} = ${total}`,
    kind: 'total',
  });

  return {
    handType: hand.type,
    handName: hand.name,
    describe,
    baseChips: hand.baseChips,
    cardChips,
    chips: Math.round(chips),
    baseMult: hand.baseMult,
    mult,
    total,
    steps,
    jokerNames,
  };
}

export function formatMult(mult: number): string {
  return Number.isInteger(mult) ? String(mult) : mult.toFixed(1);
}
