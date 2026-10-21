import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, createState, goalsFor, advance, isSolved } from '../dist/engine.js';
const routes = JSON.parse(readFileSync(new URL('./fixtures/three-star-routes.json', import.meta.url), 'utf8'));

for (const level of LEVELS) {
  test(`${level.id}: optional move goal is attainable at 30/60/120Hz`, () => {
    const route = routes[level.id];
    assert(route.length <= level.par, 'the star goal has an actual within-budget route');
    for (const hz of [30,60,120]) {
      const state = createState(level), goals = goalsFor(level);
      for (const { room, duration } of route) {
        let remaining = duration;
        while (remaining > 1e-9 && !isSolved(state, goals)) {
          const dt = Math.min(1 / hz, remaining);
          advance(state, room, dt); remaining -= dt;
        }
        if (isSolved(state, goals)) break;
      }
      assert(isSolved(state, goals), `recorded route completes at ${hz}Hz`);
    }
  });
}
