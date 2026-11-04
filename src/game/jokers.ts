import type { JokerDef } from './types';

export const JOKERS: JokerDef[] = [
  {
    id: 'cuatrero',
    name: 'Cuatrero',
    description: '+4 Mult siempre.',
    cost: 5,
    effect: () => ({ mult: 4, label: '+4 Mult' }),
  },
  {
    id: 'gafas',
    name: 'Gafas Rotas',
    description: '+12 Chips por cada carta jugada.',
    cost: 6,
    effect: ({ cards }) => ({ chips: 12 * cards.length, label: `+${12 * cards.length} Chips` }),
  },
  {
    id: 'dado',
    name: 'Dado de la Suerte',
    description: '×1.5 Mult si juegas exactamente 5 cartas.',
    cost: 5,
    effect: ({ cards }) => (cards.length === 5 ? { xmult: 1.5, label: '×1.5 Mult' } : null),
  },
  {
    id: 'farolero',
    name: 'El Farolero',
    description: '+10 Mult si juegas una sola carta.',
    cost: 4,
    effect: ({ cards }) => (cards.length === 1 ? { mult: 10, label: '+10 Mult' } : null),
  },
  {
    id: 'bailarin',
    name: 'Bailarín',
    description: '×2 Mult si la mano es escalera.',
    cost: 6,
    effect: ({ handType }) =>
      handType === 'straight' || handType === 'straight_flush'
        ? { xmult: 2, label: '×2 Mult' }
        : null,
  },
  {
    id: 'pareja_feliz',
    name: 'Pareja Feliz',
    description: '+8 Mult si la mano es pareja o doble pareja.',
    cost: 4,
    effect: ({ handType }) =>
      handType === 'pair' || handType === 'two_pair' ? { mult: 8, label: '+8 Mult' } : null,
  },
  {
    id: 'coleccionista',
    name: 'Coleccionista',
    description: '+30 Chips por cada As jugado.',
    cost: 5,
    effect: ({ cards }) => {
      const aces = cards.filter((card) => card.rank === 14).length;
      return aces > 0 ? { chips: 30 * aces, label: `+${30 * aces} Chips` } : null;
    },
  },
  {
    id: 'reliquia',
    name: 'Reliquia',
    description: '+2 Mult por cada comodín equipado.',
    cost: 5,
    effect: ({ jokers }) => ({ mult: 2 * jokers.length, label: `+${2 * jokers.length} Mult` }),
  },
];

export const JOKER_BY_ID: Record<string, JokerDef> = Object.fromEntries(
  JOKERS.map((joker) => [joker.id, joker]),
);

export function getJoker(id: string): JokerDef {
  const joker = JOKER_BY_ID[id];
  if (!joker) throw new Error(`Comodín desconocido: ${id}`);
  return joker;
}
