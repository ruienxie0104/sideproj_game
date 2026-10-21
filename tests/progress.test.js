import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeProgress, recordWin, totalStars, STORAGE_KEY } from '../dist/progress.js';
import { LEVELS } from '../dist/engine.js';

test('v2 has a separate storage key so the original playtest records remain intact', () => {
  assert.notEqual(STORAGE_KEY, 'borrow-space-v1');
});

test('corrupt or unknown progress cannot inject levels or invalid scores', () => {
  const p = sanitizeProgress({ current: 100, seen: ['wide','invalid'], best: {
    [LEVELS[0].id]: { stars: 3, moves: 2 },
    [LEVELS[1].id]: { stars: 99, moves: 1 },
    [LEVELS[2].id]: { stars: 1, moves: -4 },
    unknown: { stars: 3, moves: 1 }
  }});
  assert.equal(p.current, LEVELS.length - 1);
  assert.deepEqual(p.seen, ['wide']);
  assert.equal(Object.keys(p.best).length, 1);
  assert.equal(totalStars(p), 3);
  assert.deepEqual(sanitizeProgress(null), { current: 0, best: {}, seen: [] });
});

test('a replay preserves earned stars and records a better move count independently', () => {
  const p = sanitizeProgress(null), id = LEVELS[0].id;
  recordWin(p, id, 3, 4);
  recordWin(p, id, 1, 2);
  assert.deepEqual(p.best[id], { stars: 3, moves: 2 });
  recordWin(p, id, 2, 10);
  assert.deepEqual(p.best[id], { stars: 3, moves: 2 });
  assert.equal(totalStars(p), 3);
});
