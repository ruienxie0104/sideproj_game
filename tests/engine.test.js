import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, RULES, createState, cloneState, goalsFor, areas, comfort, isSolved, advance, suggestPlan, roomStatus, awardStars, chapterComplete } from '../dist/engine.js';

for (const level of LEVELS) {
  test(`${level.id}: has a valid target and a playable route from its start`, () => {
    const state = createState(level), targets = goalsFor(level);
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
  const state = createState(LEVELS[6]);
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
  const state = createState(LEVELS[6]);
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
  const a = createState(LEVELS[5]), b = cloneState(a);
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
  const level = LEVELS[6], state = { heights: [...level.targetH], widths: [...level.targetW] };
  assert(comfort(state, goalsFor(level)).every(Boolean));
  assert.equal(suggestPlan(state, goalsFor(level)), null);
});

test('a sofa needs width even when its area is large enough', () => {
  const level = LEVELS.find(l => l.id === 'first-sofa');
  const state = { heights: [.7,.3], widths: [.5,.5] };
  const status = roomStatus(state, goalsFor(level))[0];
  assert.equal(status.crowded, false);
  assert.equal(status.narrow, true);
  assert.equal(status.happy, false);
});

test('a plant needs height even when a wide room supplies enough area', () => {
  const level = LEVELS.find(l => l.id === 'first-tree');
  const state = { heights: [.4,.6], widths: [.75,.5] };
  const status = roomStatus(state, goalsFor(level))[0];
  assert.equal(status.crowded, false);
  assert.equal(status.short, true);
  assert.equal(status.happy, false);
});

test('a cozy cat dislikes both oversized and undersized rooms', () => {
  const level = LEVELS.find(l => l.id === 'first-nook'), goals = goalsFor(level);
  const initial = createState(level);
  assert.equal(roomStatus(initial, goals)[0].tooWideOpen, true);
  const cramped = { heights: [1], widths: [.2] };
  assert.equal(roomStatus(cramped, goals)[0].crowded, true);
  const home = { heights: [1], widths: [.39] };
  assert.equal(roomStatus(home, goals)[0].happy, true);
});

test('stars reward optional goals without invalidating a completed level', () => {
  assert.equal(awardStars({ moves: 2, par: 3, usedHint: false }), 3);
  assert.equal(awardStars({ moves: 4, par: 3, usedHint: false }), 2);
  assert.equal(awardStars({ moves: 2, par: 3, usedHint: true }), 2);
  assert.equal(awardStars({ moves: 4, par: 3, usedHint: true }), 1);
});

test('a chapter gift requires all four different homes, not replay farming', () => {
  const best = { [LEVELS[0].id]: { stars: 3, moves: 1 } };
  assert.equal(chapterComplete(best, 0), false);
  for (const l of LEVELS.filter(l => l.chapter === 0)) best[l.id] = { stars: 1, moves: 20 };
  assert.equal(chapterComplete(best, 0), true);
  assert.equal(chapterComplete(best, 1), false);
});
