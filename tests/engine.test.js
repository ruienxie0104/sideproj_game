import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, RULES, createState, cloneState, targetsFor, areas, comfort, isSolved, advance, suggestPlan } from '../dist/engine.js';

for (const level of LEVELS) {
  test(`${level.id}: has a valid target and a playable route from its start`, () => {
    const state = createState(level), targets = targetsFor(level);
    assert.equal(new Set(LEVELS.map(l => l.id)).size, LEVELS.length);
    assert.equal(level.counts.length, state.heights.length * 2);
    assert(!isSolved(state, targets), 'the level must not start solved');
    const witness = { heights: level.targetH, widths: level.targetW };
    assert(isSolved(witness, targets), 'authored target layout satisfies every resident');
    let steps = 0;
    while (!isSolved(state, targets) && steps++ < 1000) {
      const plan = suggestPlan(state, targets);
      assert(plan, 'a hint route must reach comfort from the authored start');
      for (const room of plan.rooms) advance(state, room, plan.dt);
    }
    assert(isSolved(state, targets), 'a route reaches a win using actual game controls');
    assert(Math.abs(areas(state).reduce((a, b) => a + b, 0) - 1) < 1e-9);
  });
}

test('holding a room grows its area, taking space only from shared / adjacent neighbors', () => {
  const state = createState(LEVELS[4]);
  const original = cloneState(state), before = areas(state);
  advance(state, 0, .04);
  assert(areas(state)[0] > before[0]);
  assert(state.widths[0] > original.widths[0]);
  assert(state.heights[0] > original.heights[0]);
  assert(state.heights[1] < original.heights[1]);
  assert.equal(state.heights[2], original.heights[2]);
  assert.equal(state.widths[1], original.widths[1]);
});

test('long / repeated holds preserve total space and minimum touchable dimensions', () => {
  const state = createState(LEVELS[4]);
  let random = 1287;
  for (let i = 0; i < 20000; i++) {
    random = (random * 1664525 + 1013904223) >>> 0;
    advance(state, random % 6, .04);
    assert(Math.abs(state.heights.reduce((a, b) => a + b, 0) - 1) < 1e-9);
    assert(state.heights.every(h => h >= RULES.minHeight - 1e-9 && h <= RULES.maxHeight + 1e-9));
    assert(state.widths.every(w => w >= RULES.minWidth && w <= RULES.maxWidth));
  }
});

test('a resumed background frame cannot leap across the board', () => {
  const a = createState(LEVELS[3]), b = cloneState(a);
  advance(a, 0, 20); advance(b, 0, .04);
  assert.deepEqual(a, b);
});

test('undo snapshots are independent of subsequent simulation', () => {
  const state = createState(LEVELS[2]), snapshot = cloneState(state);
  advance(state, 0, .04);
  assert.notDeepEqual(state, snapshot);
  assert.deepEqual(snapshot, createState(LEVELS[2]));
});

test('bad input never changes the game', () => {
  const state = createState(LEVELS[1]), snapshot = cloneState(state);
  for (const [room, dt] of [[-1, .02], [99, .02], [.5, .02], [0, -1], [0, NaN], [0, Infinity]]) advance(state, room, dt);
  assert.deepEqual(state, snapshot);
});

test('already solved layouts do not need a hint', () => {
  const level = LEVELS[4], state = { heights: [...level.targetH], widths: [...level.targetW] };
  assert(comfort(state, targetsFor(level)).every(Boolean));
  assert.equal(suggestPlan(state, targetsFor(level)), null);
});
