/**
 * COMODÍN / BALATRO WEB — Animation Types
 * Definiciones de tipos TypeScript para el sistema de animaciones aislado
 */

export interface CardPosition {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface CardAnimationState {
  index: number;
  position: CardPosition;
  opacity: number;
  hasReachedCenter: boolean;
}

export interface CardPlayAnimationConfig {
  duration: number;           // Duración total en ms (objetivo: 500ms)
  staggerDelay: number;       // Delay entre cartas en ms (80ms recomendado)
  centerPosition: { x: number; y: number };
  arcHeight: number;          // Altura del arco parabólico
  onCardReachCenter?: (index: number, card: unknown) => void;
  onComplete?: () => void;
  reducedMotion?: boolean;
}

export type RequiredCardPlayAnimationConfig = Required<CardPlayAnimationConfig>;

export interface CardPlayResult {
  finalScores: number[];
  totalScore: number;
}

export interface ModalTransitionConfig {
  type: 'grain' | 'scale' | 'slide' | 'fade';
  duration: number;
  easing?: string;
}

export interface ModalTransitionProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  config?: ModalTransitionConfig;
  className?: string;
  closeLabel?: string;
}

export interface ChipCounterConfig {
  value: number;
  targetValue?: number;
  duration?: number;
  easing?: string;
  format?: (value: number) => string;
  onComplete?: () => void;
}

export interface IncrementalChipCounterConfig {
  targetValue: number;
  currentValue: number;
  step: number;
  stepDelay: number;
  duration?: number;
  easing?: string;
  onStep?: (value: number) => void;
  onComplete?: () => void;
}

export interface ScoreBreakdownConfig {
  baseChips: number;
  cardChips: number;
  chips: number;
  baseMult: number;
  mult: number;
  total: number;
  steps?: Array<{ label: string; detail: string; kind: 'chips' | 'mult' | 'xmult' | 'joker' | 'total' }>;
  jokerNames?: string[];
  staggerDelay?: number;
  duration?: number;
  onComplete?: () => void;
}

export type ChipVariant = 'chips' | 'mult' | 'total' | 'money';
export type ChipSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ChipCounterProps {
  value: number;
  variant?: ChipVariant;
  size?: ChipSize;
  animate?: boolean;
  duration?: number;
  className?: string;
  'aria-label'?: string;
}

export interface IncrementalChipCounterProps {
  targetValue: number;
  currentValue: number;
  step?: number;
  stepDelay?: number;
  variant?: ChipVariant;
  size?: ChipSize;
  className?: string;
  'aria-label'?: string;
}

export interface ScoreBreakdownProps {
  baseChips: number;
  cardChips: number;
  chips: number;
  baseMult: number;
  mult: number;
  total: number;
  steps?: Array<{ label: string; detail: string; kind: 'chips' | 'mult' | 'xmult' | 'joker' | 'total' }>;
  jokerNames?: string[];
  staggerDelay?: number;
  duration?: number;
  animate?: boolean;
  className?: string;
}

export interface GrainTransitionConfig {
  duration: number;
  intensity: number;      // 0-1, intensidad del ruido
  mode: 'overlay' | 'wipe' | 'dissolve' | 'crt';
  seed?: number;
  color?: string;         // Color del ruido (hex)
}

export interface GrainTransitionOverlayProps {
  isActive: boolean;
  config: GrainTransitionConfig;
  onComplete?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export interface GrainTransitionWrapperProps {
  open: boolean;
  enterConfig: GrainTransitionConfig;
  exitConfig: GrainTransitionConfig;
  mode: 'overlay' | 'wipe' | 'dissolve' | 'crt';
  onEnterComplete?: () => void;
  onExitComplete?: () => void;
  children: React.ReactNode;
  className?: string;
}