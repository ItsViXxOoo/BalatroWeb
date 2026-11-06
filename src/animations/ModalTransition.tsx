import { useEffect, useRef, useState } from 'react';
import type { ModalTransitionConfig, ModalTransitionProps } from './types';

const EASING_PRESETS: Record<string, string> = {
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
};

interface ModalTransitionInnerProps extends Omit<ModalTransitionProps, 'config'> {
  config: Required<ModalTransitionConfig>;
}

function ModalTransitionInner({
  open,
  onClose,
  title,
  children,
  config,
  className = '',
  closeLabel = 'Cerrar',
}: ModalTransitionInnerProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isExiting, setIsExiting] = useState(false);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      setIsExiting(false);
    } else if (isMounted && !prefersReducedMotion.current) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsMounted(false);
        onClose();
      }, config.duration);
      return () => clearTimeout(timer);
    } else if (!open) {
      setIsMounted(false);
      onClose();
    }
  }, [open, config.duration, onClose]);

  if (!isMounted) return null;

  const easing = EASING_PRESETS[config.easing] || config.easing || EASING_PRESETS.spring;

  const getAnimationClass = () => {
    if (prefersReducedMotion.current) return '';
    if (isExiting) return `animate-modal-out`;
    switch (config.type) {
      case 'grain':
        return 'animate-modal-grain-in';
      case 'scale':
        return 'animate-modal-scale-in';
      case 'slide':
        return 'animate-modal-slide-in';
      case 'fade':
      default:
        return 'animate-modal-fade-in';
    }
  };

  const backdropClass = prefersReducedMotion.current
    ? ''
    : isExiting
      ? 'animate-backdrop-out'
      : 'animate-backdrop-in';

  return (
    <div
      className={`modal-transition-backdrop ${backdropClass}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isExiting) onClose();
      }}
      aria-hidden={isExiting}
    >
      <div
        className={`modal-transition ${className} ${getAnimationClass()}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        style={{ animationDuration: `${config.duration}ms`, animationTimingFunction: easing }}
      >
        {title && <h2 id="modal-title" className="modal-transition-title">{title}</h2>}
        <button
          type="button"
          className="modal-transition-close"
          onClick={isExiting ? () => {} : onClose}
          aria-label={closeLabel}
          disabled={isExiting}
        >
          ✕
        </button>
        <div className="modal-transition-body">{children}</div>
      </div>
    </div>
  );
}

export function ModalTransition(props: ModalTransitionProps) {
  const config: Required<ModalTransitionConfig> = {
    type: props.config?.type || 'fade',
    duration: props.config?.duration || 300,
    easing: props.config?.easing || 'spring',
  };

  return <ModalTransitionInner {...props} config={config} />;
}