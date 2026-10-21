import { LEVELS } from './engine.js';
import { PETS, affection, ADOPTION_GOAL, residentsFor, unlockedFurniture } from './pets.js';
export const STORAGE_KEY = 'borrow-space-v3';
export const LEGACY_KEY = 'borrow-space-v2';
export function sanitizeProgress(value) {
  const fresh = { current: 0, best: {}, seen: [], choices: {}, adopted: [], activePet: null,
    home: { palette: 'sage', placements: [] }, audio: { music: false, effects: false, volume: .5 } };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fresh;
  fresh.current = Number.isInteger(value.current) ? Math.max(0, Math.min(LEVELS.length - 1, value.current)) : 0;
  fresh.seen = Array.isArray(value.seen) ? [...new Set(value.seen.filter(k => ['wide','tall','cozy'].includes(k)))] : [];
  for (const level of LEVELS) {
    const record = value.best?.[level.id];
    if (!record || !Number.isInteger(record.stars) || record.stars < 1 || record.stars > 3 || !Number.isInteger(record.moves) || record.moves < 1) continue;
    fresh.best[level.id] = { stars: record.stars, moves: record.moves };
    if (residentsFor(level).includes(value.choices?.[level.id]) && affection(fresh, value.choices[level.id]) < ADOPTION_GOAL) fresh.choices[level.id] = value.choices[level.id];
  }
  fresh.adopted = Object.keys(PETS).filter(id => Array.isArray(value.adopted) && value.adopted.includes(id) && affection(fresh, id) >= ADOPTION_GOAL);
  fresh.activePet = fresh.adopted.includes(value.activePet) ? value.activePet : fresh.adopted[0] || null;
  if (['sage','peach','lavender'].includes(value.home?.palette)) fresh.home.palette = value.home.palette;
  const unlocked = unlockedFurniture(fresh).map(f => f.id);
  if (fresh.adopted.length && Array.isArray(value.home?.placements)) {
    for (const p of value.home.placements) {
      if (!p || !unlocked.includes(p.id) || !Number.isInteger(p.slot) || p.slot < 0 || p.slot > 8 || fresh.home.placements.some(old => old.id === p.id || old.slot === p.slot)) continue;
      fresh.home.placements.push({ id: p.id, slot: p.slot });
    }
  }
  fresh.audio.music = value.audio?.music === true;
  fresh.audio.effects = value.audio?.effects === true;
  if (Number.isFinite(value.audio?.volume)) fresh.audio.volume = Math.max(0, Math.min(1, value.audio.volume));
  return fresh;
}
export function readProgress(storage) {
  // A malformed v3 record must not hide the untouched v2 backup.
  for (const key of [STORAGE_KEY, LEGACY_KEY]) {
    try { const raw = JSON.parse(storage.getItem(key)); if (raw && typeof raw === 'object' && !Array.isArray(raw)) return sanitizeProgress(raw); } catch { /* Try older save. */ }
  }
  return sanitizeProgress(null);
}
export function recordWin(progress, id, stars, moves) {
  if (!LEVELS.some(l => l.id === id) || !Number.isInteger(stars) || stars < 1 || stars > 3 || !Number.isInteger(moves) || moves < 1) return;
  const old = progress.best[id];
  progress.best[id] = { stars: Math.max(old?.stars || 0, stars), moves: Math.min(old?.moves ?? Infinity, moves) };
}
export function totalStars(progress) { return Object.values(progress.best).reduce((sum, entry) => sum + entry.stars, 0); }
