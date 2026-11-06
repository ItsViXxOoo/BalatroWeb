import { useEffect, useRef, useState } from 'react';
import type { ScoreBreakdownConfig, ScoreBreakdownProps } from './types';

type StepKind = 'chips' | 'mult' | 'xmult' | 'joker' | 'total';

interface ScoreBreakdownStep {
  label: string;
  value: string;
  kind: StepKind;
}

type ScoreStep = { label: string; detail: string; kind: StepKind };

export function ScoreBreakdown({
  baseChips,
  cardChips,
  chips,
  baseMult,
  mult,
  total,
  steps = [],
  jokerNames = [],
  staggerDelay = 80,
  duration = 500,
  animate = true,
  className = '',
}: ScoreBreakdownProps) {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [showTotal, setShowTotal] = useState(false);
  const [showJokers, setShowJokers] = useState(false);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const allSteps: ScoreBreakdownStep[] = [
    { label: 'Chips base', value: baseChips.toString(), kind: 'chips' as StepKind },
    ...(cardChips > 0 ? [{ label: 'Chips de cartas', value: `+${cardChips}`, kind: 'chips' as StepKind }] : []),
    { label: 'Total Chips', value: chips.toString(), kind: 'chips' as StepKind },
    { label: 'Mult base', value: baseMult.toString(), kind: 'mult' as StepKind },
    { label: 'Mult final', value: mult.toString(), kind: 'mult' as StepKind },
    ...steps
      .filter((s): s is ScoreStep => s.kind !== 'total')
      .map((s) => ({ label: s.label, value: s.detail, kind: s.kind as StepKind })),
  ];

  useEffect(() => {
    if (!animate || prefersReducedMotion.current) {
      setVisibleSteps(new Set(allSteps.map((_, i) => i)));
      setShowTotal(true);
      setShowJokers(true);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    allSteps.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleSteps((prev) => new Set([...prev, index]));
      }, index * staggerDelay);
      timeouts.push(timeout);
    });

    const totalTimeout = setTimeout(() => {
      setShowTotal(true);
    }, allSteps.length * staggerDelay + 150);
    timeouts.push(totalTimeout);

    if (jokerNames.length > 0) {
      const jokerTimeout = setTimeout(() => {
        setShowJokers(true);
      }, allSteps.length * staggerDelay + 300);
      timeouts.push(jokerTimeout);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [animate, allSteps.length, staggerDelay, jokerNames.length]);

  return (
    <div className={`score-breakdown ${className}`.trim()}>
      <div className="score-breakdown-steps" role="list" aria-label="Desglose de puntuación">
        {allSteps.map((step, index) => {
          const isVisible = visibleSteps.has(index);
          return (
            <div
              key={`${step.kind}-${index}`}
              className={`score-breakdown-step score-breakdown-step--${step.kind} ${isVisible ? 'is-visible' : ''}`}
              role="listitem"
              style={{
                animationDelay: `${index * staggerDelay}ms`,
                animationDuration: `${duration}ms`,
              }}
            >
              <span className="score-breakdown-label">{step.label}</span>
              <span className="score-breakdown-value">{step.value}</span>
            </div>
          );
        })}
      </div>

      <div
        className={`score-breakdown-total ${showTotal ? 'is-visible' : ''}`}
        role="status"
        aria-live="polite"
        style={{
          animationDelay: `${allSteps.length * staggerDelay + 150}ms`,
        }}
      >
        <span className="score-breakdown-total-label">TOTAL</span>
        <span className="score-breakdown-total-value">{total.toLocaleString('es')}</span>
      </div>

      {jokerNames.length > 0 && (
        <div
          className={`score-breakdown-jokers ${showJokers ? 'is-visible' : ''}`}
          role="list"
          aria-label="Comodines activos"
          style={{
            animationDelay: `${allSteps.length * staggerDelay + 300}ms`,
          }}
        >
          <span className="score-breakdown-jokers-label">COMODINES</span>
          <ul className="score-breakdown-jokers-list">
            {jokerNames.map((name, index) => (
              <li key={name} className="score-breakdown-joker" style={{ animationDelay: `${index * 60}ms` }}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ScoreBreakdownAnimated({
  baseChips,
  cardChips,
  chips,
  baseMult,
  mult,
  total,
  steps = [],
  jokerNames = [],
  staggerDelay = 80,
  duration = 500,
  onComplete,
  className = '',
}: ScoreBreakdownConfig & { className?: string }) {
  const [phase, setPhase] = useState<'idle' | 'steps' | 'total' | 'jokers' | 'done'>('idle');
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const allSteps: ScoreBreakdownStep[] = [
    { label: 'Chips base', value: baseChips.toString(), kind: 'chips' as StepKind },
    ...(cardChips > 0 ? [{ label: 'Chips de cartas', value: `+${cardChips}`, kind: 'chips' as StepKind }] : []),
    { label: 'Total Chips', value: chips.toString(), kind: 'chips' as StepKind },
    { label: 'Mult base', value: baseMult.toString(), kind: 'mult' as StepKind },
    { label: 'Mult final', value: mult.toString(), kind: 'mult' as StepKind },
    ...steps
      .filter((s): s is ScoreStep => s.kind !== 'total')
      .map((s) => ({ label: s.label, value: s.detail, kind: s.kind as StepKind })),
  ];

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setPhase('done');
      setVisibleSteps(new Set(allSteps.map((_, i) => i)));
      onComplete?.();
      return;
    }

    setPhase('steps');
    setVisibleSteps(new Set());
    setCurrentStepIndex(0);

    const animateStep = () => {
      if (currentStepIndex >= allSteps.length) {
        setPhase('total');
        const totalTimer = setTimeout(() => {
          setPhase(jokerNames.length > 0 ? 'jokers' : 'done');
          if (jokerNames.length === 0) onComplete?.();
        }, 150);
        return () => clearTimeout(totalTimer);
      }

      setVisibleSteps((prev) => new Set([...prev, currentStepIndex]));
      setCurrentStepIndex((prev) => prev + 1);

      const timer = setTimeout(animateStep, staggerDelay);
      return () => clearTimeout(timer);
    };

    const timer = setTimeout(animateStep, staggerDelay);
    return () => clearTimeout(timer);
  }, [allSteps.length, staggerDelay, jokerNames.length, onComplete]);

  useEffect(() => {
    if (phase === 'total') {
      const timer = setTimeout(() => {
        if (jokerNames.length > 0) setPhase('jokers');
        else {
          setPhase('done');
          onComplete?.();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [phase, jokerNames.length, onComplete]);

  useEffect(() => {
    if (phase === 'jokers') {
      const timer = setTimeout(() => {
        setPhase('done');
        onComplete?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <div className={`score-breakdown score-breakdown--animated ${phase} ${className}`.trim()}>
      <div className="score-breakdown-steps" role="list" aria-label="Desglose de puntuación">
        {allSteps.map((step, index) => (
          <div
            key={`${step.kind}-${index}`}
            className={`score-breakdown-step score-breakdown-step--${step.kind} ${visibleSteps.has(index) ? 'is-visible' : ''}`}
            role="listitem"
            style={{
              animationDelay: `${index * staggerDelay}ms`,
              animationDuration: `${duration}ms`,
            }}
          >
            <span className="score-breakdown-label">{step.label}</span>
            <span className="score-breakdown-value">{step.value}</span>
          </div>
        ))}
      </div>

      <div
        className={`score-breakdown-total ${phase === 'total' || phase === 'jokers' || phase === 'done' ? 'is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        <span className="score-breakdown-total-label">TOTAL</span>
        <span className="score-breakdown-total-value">{total.toLocaleString('es')}</span>
      </div>

      {jokerNames.length > 0 && (
        <div
          className={`score-breakdown-jokers ${phase === 'jokers' || phase === 'done' ? 'is-visible' : ''}`}
          role="list"
          aria-label="Comodines activos"
        >
          <span className="score-breakdown-jokers-label">COMODINES</span>
          <ul className="score-breakdown-jokers-list">
            {jokerNames.map((name, index) => (
              <li key={name} className="score-breakdown-joker" style={{ animationDelay: `${index * 60}ms` }}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}