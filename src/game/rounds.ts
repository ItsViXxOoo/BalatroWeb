export interface RoundConfig {
  id: number;
  name: string;
  subtitle: string;
  target: number;
  hands: number;
  discards: number;
  reward: number;
}

export const ROUNDS: RoundConfig[] = [
  {
    id: 1,
    name: 'LA CANTINA',
    subtitle: 'Donde empieza la suerte',
    target: 200,
    hands: 3,
    discards: 2,
    reward: 4,
  },
  {
    id: 2,
    name: 'EL CLUB',
    subtitle: 'Aquí ya no hay principiantes',
    target: 700,
    hands: 3,
    discards: 2,
    reward: 4,
  },
  {
    id: 3,
    name: 'LA BÓVEDA',
    subtitle: 'Todo o nada',
    target: 1800,
    hands: 4,
    discards: 2,
    reward: 0,
  },
];

export const START_MONEY = 6;
export const MAX_JOKERS = 5;
export const REWARD_PER_HAND = 2;
export const HAND_SIZE_LIMIT = 5;
export const TUTORIAL_STORAGE_KEY = 'comodin.seenTutorial.v1';
export const RANKING_STORAGE_KEY = 'comodin.ranking.v1';
export const MUTED_STORAGE_KEY = 'comodin.muted.v1';
