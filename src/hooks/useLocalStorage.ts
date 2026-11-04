import { useCallback, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((previous: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  const setValue = useCallback(
    (value: T | ((previous: T) => T)) => {
      setStored((previous) => {
        const next =
          typeof value === 'function' ? (value as (current: T) => T)(previous) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // El juego sigue funcionando aunque el navegador bloquee el almacenamiento.
        }
        return next;
      });
    },
    [key],
  );

  return [stored, setValue];
}
