import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  action?: ReactNode;
  className?: string;
}

export interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onClose: (id: string) => void;
  className?: string;
}

const TOAST_STYLES = {
  info: {
    bg: 'rgba(8, 15, 12, 0.98)',
    border: 'var(--c-border-gold)',
    icon: 'ℹ',
    color: 'var(--c-text-bright)',
  },
  success: {
    bg: 'rgba(8, 15, 12, 0.98)',
    border: 'var(--c-border-chips)',
    icon: '✓',
    color: 'var(--c-chips-text)',
  },
  warning: {
    bg: 'rgba(8, 15, 12, 0.98)',
    border: 'var(--c-border-gold)',
    icon: '⚠',
    color: 'var(--c-primary)',
  },
  error: {
    bg: 'rgba(8, 15, 12, 0.98)',
    border: 'var(--c-danger)',
    icon: '✕',
    color: 'var(--c-danger)',
  },
};

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  action,
  className = '',
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const style = TOAST_STYLES[type];

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (prefersReducedMotion.current) {
        setIsVisible(false);
        onClose?.();
      } else {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, 200);
      }
    }, duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`toast toast--${type} ${isExiting ? 'toast--exiting' : ''} ${className}`.trim()}
      role="alert"
      aria-live="polite"
      style={{
        background: style.bg,
        borderColor: style.border,
        color: style.color,
        animation: prefersReducedMotion.current
          ? 'none'
          : isExiting
            ? 'toast-out var(--dur-fast) var(--ease-in) forwards'
            : 'toast-in var(--dur-base) var(--ease-out) forwards',
      }}
    >
      <span className="toast-icon" aria-hidden="true">{style.icon}</span>
      <span className="toast-message">{message}</span>
      {action && <span className="toast-action">{action}</span>}
      <button
        type="button"
        className="toast-close"
        onClick={() => {
          if (prefersReducedMotion.current) {
            setIsVisible(false);
            onClose?.();
          } else {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose?.();
            }, 200);
          }
        }}
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
  className = '',
}: ToastContainerProps) {
  return (
    <div className={`toast-container ${className}`.trim()} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          action={toast.action}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (toast: ToastProps) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return { toasts, addToast, removeToast, clearToasts };
}

export function ConfettiBurst({
  isActive,
  onComplete,
  count = 50,
  colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#eab308', '#c48a1e', '#4ade80', '#22c55e', '#60a5fa', '#f87171'],
  className = '',
}: {
  isActive: boolean;
  onComplete?: () => void;
  count?: number;
  colors?: string[];
  className?: string;
}) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; color: string; rotation: number; scale: number; tx: number; ty: number; tr: number }>>([]);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!isActive) return;

    if (prefersReducedMotion.current) {
      onComplete?.();
      return;
    }

    const newParticles = Array.from({ length: count }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
      y: window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      tx: (Math.random() - 0.5) * window.innerWidth * 0.8,
      ty: window.innerHeight * 0.5 + Math.random() * window.innerHeight * 0.5,
      tr: (Math.random() - 0.5) * 720,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 2800);

    return () => clearTimeout(timer);
  }, [isActive, count, colors, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={`confetti-burst ${className}`.trim()} aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map((particle, index) => (
        <div
          key={index}
          className="confetti-particle"
          style={{
            position: 'absolute',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: '8px',
            height: '8px',
            background: particle.color,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale}) translate(${particle.tx}px, ${particle.ty}px) rotate(${particle.tr}deg)`,
            borderRadius: '2px',
            animation: `confetti-fall 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function GoldBurst({
  isActive,
  onComplete,
  count = 30,
  className = '',
}: {
  isActive: boolean;
  onComplete?: () => void;
  count?: number;
  className?: string;
}) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; tx: number; ty: number; tr: number }>>([]);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!isActive) return;

    if (prefersReducedMotion.current) {
      onComplete?.();
      return;
    }

    const newParticles = Array.from({ length: count }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.4,
      tx: (Math.random() - 0.5) * 400,
      ty: (Math.random() - 0.5) * 400 + 200,
      tr: (Math.random() - 0.5) * 360,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 1200);

    return () => clearTimeout(timer);
  }, [isActive, count, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={`gold-burst ${className}`.trim()} aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map((particle, index) => (
        <div
          key={index}
          className="gold-particle"
          style={{
            position: 'absolute',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: '12px',
            height: '12px',
            background: 'radial-gradient(circle, #fde047 0%, #f59e0b 50%, #c48a1e 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 8px #f59e0b, 0 0 16px #c48a1e',
            transform: `scale(1) translate(${particle.tx}px, ${particle.ty}px) rotate(${particle.tr}deg)`,
            animation: `gold-burst 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function ScreenShake({
  isActive,
  duration = 450,
  children,
  className = '',
}: {
  isActive: boolean;
  duration?: number;
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const style: React.CSSProperties = {
    animation: isActive && !prefersReducedMotion.current
      ? `screen-shake ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
      : 'none',
  };

  return (
    <div
      className={`screen-shake ${isActive && !prefersReducedMotion.current ? 'is-shaking' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

export function WinFlash({
  isActive,
  onComplete,
  className = '',
}: {
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}) {
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!isActive) return;
    if (prefersReducedMotion.current) {
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => {
      onComplete?.();
    }, 250);
    return () => clearTimeout(timer);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div
      className={`win-flash ${className}`.trim()}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'white',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        animation: prefersReducedMotion.current ? 'none' : 'win-flash 250ms ease-out',
      }}
    />
  );
}

export function BannerWin({
  isActive,
  children,
  className = '',
}: {
  isActive: boolean;
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  return (
    <div
      className={`banner-win ${isActive ? 'is-visible' : ''} ${className}`.trim()}
      role="alert"
      aria-live="assertive"
      style={{
        animation: isActive && !prefersReducedMotion.current ? 'banner-win-in 350ms var(--ease-spring)' : 'none',
      }}
    >
      {isActive && children}
    </div>
  );
}