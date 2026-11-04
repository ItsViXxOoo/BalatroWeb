interface JokerIconProps {
  id: string;
  className?: string;
}

export function JokerIcon({ id, className = '' }: JokerIconProps) {
  const shared = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg
      className={`joker-icon ${className}`.trim()}
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
    >
      {id === 'cuatrero' && (
        <g {...shared}>
          <path d="M7 18c9-6 25-6 34 0l-4 11c-9 4-17 4-26 0Z" />
          <circle cx="18" cy="22" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="30" cy="22" r="2.2" fill="currentColor" stroke="none" />
          <path d="M20 28c2.5 1.6 5.5 1.6 8 0" />
        </g>
      )}
      {id === 'gafas' && (
        <g {...shared}>
          <circle cx="15" cy="24" r="7.5" />
          <circle cx="33" cy="24" r="7.5" />
          <path d="M22.5 24h3M7.5 22 4 20M40.5 22 44 20M17 17l3 2M31 19l3-2" />
        </g>
      )}
      {id === 'dado' && (
        <g {...shared}>
          <rect x="10" y="10" width="28" height="28" rx="5" />
          <circle cx="18" cy="18" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="24" cy="24" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="30" cy="30" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="30" cy="18" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="18" cy="30" r="1.6" fill="currentColor" stroke="none" />
        </g>
      )}
      {id === 'farolero' && (
        <g {...shared}>
          <rect x="16" y="15" width="16" height="22" rx="3" />
          <path d="M20 15v-3a4 4 0 0 1 8 0v3M17 22h14M17 30h14" />
          <path d="M24 8V5M14 17l-3-2M34 17l3-2" />
        </g>
      )}
      {id === 'bailarin' && (
        <g {...shared}>
          <circle cx="27" cy="10" r="3" />
          <path d="M26 15 20 24l7 3 4-7M20 24l-4 8M27 27l2 8M20 18l-6-2M28 17l6-3" />
        </g>
      )}
      {id === 'pareja_feliz' && (
        <g {...shared}>
          <path d="M14 35c-5-4-7-8-7-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4-3 8-11 12Z" />
          <path d="M32 30c-4-3-6-6-6-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 3-2 6-8 9Z" />
        </g>
      )}
      {id === 'coleccionista' && (
        <g {...shared}>
          <circle cx="24" cy="24" r="15" />
          <path d="M18 32l6-18 6 18M20.5 26h7" />
          <path d="M24 6v3M24 39v3M6 24h3M39 24h3" />
        </g>
      )}
      {id === 'reliquia' && (
        <g {...shared}>
          <path d="M24 7 39 19 24 41 9 19Z" />
          <path d="M9 19h30M24 7l-7 12 7 22 7-22-7-12" />
        </g>
      )}
    </svg>
  );
}
