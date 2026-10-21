import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, CHAPTERS } from '../dist/engine.js';
import { sanitizeProgress, recordWin, readProgress, STORAGE_KEY, LEGACY_KEY } from '../dist/progress.js';
import { PETS, ADOPTION_GOAL, residentsFor, affection, pendingChoices, chooseFriend, adopt, unlockedFurniture, placeFurniture, removeFurniture, journeyIndex } from '../dist/pets.js';
const win = (p, level) => recordWin(p, level.id, 2, level.par);
function befriend(p, pet, count = 5) {
  for (const l of LEVELS.filter(l => residentsFor(l).includes(pet)).slice(0, count)) { win(p, l); assert(chooseFriend(p, l.id, pet)); }
}

test('v2 saves migrate stars, current level and discoveries without overwriting their source', () => {
  const legacy = { current: 8, best: { [LEVELS[0].id]: { stars: 3, moves: 1 } }, seen: ['wide','cozy'] };
  const values = new Map([[LEGACY_KEY, JSON.stringify(legacy)]]);
  const p = readProgress({ getItem: key => values.get(key) || null });
  assert.equal(p.current, 8); assert.deepEqual(p.best, legacy.best); assert.deepEqual(p.seen, legacy.seen);
  assert.deepEqual(pendingChoices(p).map(l => l.id), [LEVELS[0].id]);
  assert.equal(values.size, 1); assert(!values.has(STORAGE_KEY));
  values.set(STORAGE_KEY, '{broken');
  assert.deepEqual(readProgress({ getItem: key => values.get(key) || null }), p);
  values.set(STORAGE_KEY, '[]');
  assert.deepEqual(readProgress({ getItem: key => values.get(key) || null }), p);
});

test('a genuine first clear creates a recoverable choice; replay or reload cannot duplicate it', () => {
  let p = sanitizeProgress(null); const l = LEVELS[0], pet = residentsFor(l)[0];
  assert.equal(chooseFriend(p, l.id, pet), false);
  win(p, l); p = sanitizeProgress(JSON.parse(JSON.stringify(p)));
  assert.equal(pendingChoices(p).length, 1);
  assert(chooseFriend(p, l.id, pet)); win(p, l);
  assert.equal(chooseFriend(p, l.id, pet), false);
  assert.equal(chooseFriend(p, l.id, residentsFor(l)[1]), false);
  p = sanitizeProgress(JSON.parse(JSON.stringify(p)));
  assert.equal(affection(p, pet), 1); assert.equal(pendingChoices(p).length, 0);
});

test('only the actual residents of a cleared level can receive its affection', () => {
  const p = sanitizeProgress(null), l = LEVELS[0]; win(p, l);
  const absent = Object.keys(PETS).find(id => !residentsFor(l).includes(id));
  assert.equal(chooseFriend(p, l.id, absent), false);
  assert.equal(chooseFriend(p, 'fake-level', 'dog'), false);
  assert.equal(chooseFriend(p, l.id, 'dragon'), false);
});

test('every species can be adopted after exactly five different choices and only once', () => {
  for (const pet of Object.keys(PETS)) {
    const p = sanitizeProgress(null); befriend(p, pet, 4);
    assert.equal(adopt(p, pet), false);
    const fifth = LEVELS.filter(l => residentsFor(l).includes(pet))[4]; win(p, fifth); chooseFriend(p, fifth.id, pet);
    assert(adopt(p, pet)); assert.equal(adopt(p, pet), false); assert.equal(p.activePet, pet);
    const sixth = LEVELS.filter(l => residentsFor(l).includes(pet))[5]; win(p, sixth);
    assert.equal(chooseFriend(p, sixth.id, pet), false, 'full hearts do not consume another level reward');
    assert.equal(affection(p, pet), ADOPTION_GOAL);
    assert.deepEqual(sanitizeProgress(JSON.parse(JSON.stringify(p))).adopted, [pet]);
  }
});

test('all sequential capped choices can reach all four adoptions within 24 levels', () => {
  // Exhaustive over reachable affection counts, not merely a lucky scripted allocation.
  const ids = Object.keys(PETS); let states = new Set(['0,0,0,0']);
  for (const level of LEVELS) {
    const next = new Set();
    for (const key of states) {
      const counts = key.split(',').map(Number);
      const available = residentsFor(level).filter(id => counts[ids.indexOf(id)] < ADOPTION_GOAL);
      if (!available.length) next.add(key);
      for (const id of available) { const trial = [...counts]; trial[ids.indexOf(id)]++; next.add(trial.join(',')); }
    }
    states = next;
  }
  assert.deepEqual([...states], ['5,5,5,5']);
});

test('completed residents are not an endless pending-reward badge', () => {
  const p = sanitizeProgress(null);
  // Claim dog on other levels, preserving this particular level as unclaimed.
  const level = LEVELS[0];
  for (const pet of residentsFor(level)) {
    for (const l of LEVELS.filter(l => l !== level && residentsFor(l).includes(pet) && !p.choices[l.id]).slice(0,5)) { win(p,l); chooseFriend(p,l.id,pet); }
  }
  win(p,level); assert(!pendingChoices(p).some(l => l.id === level.id));
});

test('chapter furniture unlocks on four distinct clears and placement moves rather than duplicates', () => {
  const p = sanitizeProgress(null);
  assert.deepEqual(unlockedFurniture(p).map(f => f.id), ['cushion']);
  assert.equal(placeFurniture(p, 'cushion', 0), false, 'first adopt a pet');
  befriend(p, 'dog'); adopt(p, 'dog');
  for (const l of LEVELS.filter(l => l.chapter === 0)) win(p, l);
  assert(unlockedFurniture(p).some(f => f.id === 'gift-0'));
  assert.equal(placeFurniture(p, 'gift-5', 1), false);
  assert.equal(placeFurniture(p, 'gift-0', 99), false);
  assert(placeFurniture(p, 'cushion', 0)); assert(placeFurniture(p, 'gift-0', 1));
  assert(placeFurniture(p, 'cushion', 1));
  assert.deepEqual(p.home.placements, [{ id: 'cushion', slot: 1 }]);
  p.home.palette = 'lavender';
  const saved = sanitizeProgress(JSON.parse(JSON.stringify(p)));
  assert.deepEqual(saved.home, p.home);
  removeFurniture(p, 1); assert.deepEqual(p.home.placements, []);
  for (const l of LEVELS) win(p, l);
  assert.equal(unlockedFurniture(p).length, CHAPTERS.length + 1);
});

test('corrupt pet and home data cannot fabricate adoption, furniture or duplicate tiles', () => {
  const p = sanitizeProgress({ adopted: ['dog','dragon'], activePet: 'dragon', choices: { [LEVELS[0].id]: 'dog' }, home: { palette: 'red', placements: [{ id: 'gift-5', slot: 0 }] }, audio: { music: 'yes', volume: 20 } });
  assert.deepEqual(p.adopted, []); assert.deepEqual(p.choices, {}); assert.equal(p.activePet, null);
  assert.equal(p.home.palette, 'sage'); assert.deepEqual(p.home.placements, []);
  assert.equal(p.audio.music, false); assert.equal(p.audio.volume, 1);
  befriend(p, 'dog'); adopt(p, 'dog');
  p.home.placements = [{ id: 'cushion', slot: 3 }, { id: 'cushion', slot: 4 }, null, { id: 'gift-5', slot: 0 }, { id: 'cushion', slot: -1 }];
  assert.deepEqual(sanitizeProgress(p).home.placements, [{ id: 'cushion', slot: 3 }]);
  assert.equal(readProgress({ getItem() { throw Error('disabled'); } }).current, 0);
});

test('continue journey finds the earliest unfinished level, including after out-of-order play', () => {
  const p = sanitizeProgress(null); p.current = 20; win(p,LEVELS[20]);
  assert.equal(journeyIndex(p),0); win(p, LEVELS[0]); assert.equal(journeyIndex(p),1);
  for (const l of LEVELS) win(p,l); assert.equal(journeyIndex(p),20);
});

test('free level ordering cannot exhaust a species adoption opportunities', () => {
  // Other pets can occupy at most 15 distinct reward slots. Each pet has >=20.
  const otherCapacity = (Object.keys(PETS).length - 1) * ADOPTION_GOAL;
  for (const pet of Object.keys(PETS)) {
    assert(LEVELS.filter(l => residentsFor(l).includes(pet)).length >= otherCapacity + ADOPTION_GOAL);
  }
});
