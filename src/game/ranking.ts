import type { RankEntry } from './types';

export function sortRanking(entries: RankEntry[]): RankEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
    return a.date - b.date;
  });
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(timestamp));
}
