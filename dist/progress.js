import { LEVELS } from './engine.js';
export const STORAGE_KEY = 'borrow-space-v2';
export function sanitizeProgress(value) {
  const fresh = { current: 0, best: {}, seen: [] };
  if (!value || typeof value !== 'object') return fresh;
  fresh.current = Number.isInteger(value.current) ? Math.max(0, Math.min(LEVELS.length - 1, value.current)) : 0;
  fresh.seen = Array.isArray(value.seen) ? value.seen.filter(k => ['wide','tall','cozy'].includes(k)) : [];
  for (const level of LEVELS) {
    const record = value.best?.[level.id];
    if (!record || !Number.isInteger(record.stars) || record.stars < 1 || record.stars > 3 || !Number.isInteger(record.moves) || record.moves < 1) continue;
    fresh.best[level.id] = { stars: record.stars, moves: record.moves };
  }
  return fresh;
}
export function recordWin(progress, id, stars, moves) {
  const old = progress.best[id];
  progress.best[id] = { stars: Math.max(old?.stars || 0, stars), moves: Math.min(old?.moves ?? Infinity, moves) };
}
export function totalStars(progress) { return Object.values(progress.best).reduce((sum, entry) => sum + entry.stars, 0); }
