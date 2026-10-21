import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../dist/engine.js';
import { sanitizeProgress, recordWin, STORAGE_KEY, readProgress } from '../dist/progress.js';
import { chooseFriend, residentsFor, adopt, unlockedFurniture, placeFurniture } from '../dist/pets.js';
import { feedPet, growthOf, createFoodReward } from '../dist/care.js';
function adoptedDog() {
  const p = sanitizeProgress(null);
  for (const l of LEVELS.filter(l => residentsFor(l).includes('dog')).slice(0,5)) { recordWin(p,l.id,3,l.par); chooseFriend(p,l.id,'dog'); }
  adopt(p,'dog'); return p;
}

test('three stars earn food once per attempt, undo cannot duplicate, explicit replay can earn again', () => {
  const p = sanitizeProgress(null), run = createFoodReward();
  assert.equal(run.claim(p,2),0); assert.equal(p.food,0);
  assert.equal(run.claim(p,3),1); assert.equal(p.food,1);
  assert.equal(run.claim(p,3),0); assert.equal(p.food,1);
  assert.equal(createFoodReward().claim(p,3),1); assert.equal(p.food,2);
  assert.equal(createFoodReward().claim(p,4),0);
  assert.equal(createFoodReward().claim(p,NaN),0);
});

test('old v3 stars receive a one-time backfill without losing pets, choices, or furniture', () => {
  const p = adoptedDog(); placeFurniture(p,'cushion',4);
  delete p.careVersion; delete p.food; delete p.growth;
  const migrated = sanitizeProgress(p);
  assert.equal(migrated.food,5); assert.deepEqual(migrated.best,p.best);
  assert.deepEqual(migrated.choices,p.choices); assert.deepEqual(migrated.adopted,p.adopted); assert.deepEqual(migrated.home,p.home);
  feedPet(migrated,'dog');
  const storage = { getItem: key => key === STORAGE_KEY ? JSON.stringify(migrated) : null };
  const reload = readProgress(storage); assert.equal(reload.food,4); assert.equal(growthOf(reload,'dog').meals,1);
  assert.equal(sanitizeProgress(reload).food,4, 'reload does not reissue backfill');
});

test('feeding consumes exactly one food and only grows the chosen adopted pet', () => {
  const p = adoptedDog(); p.food=1;
  assert.equal(feedPet(p,'cat'),null); assert.equal(feedPet(p,'unknown'),null); assert.equal(p.food,1);
  const result=feedPet(p,'dog'); assert.equal(result.meals,1); assert.equal(result.leveledUp,false); assert.equal(p.food,0);
  assert.equal(feedPet(p,'dog'),null); assert.equal(growthOf(p,'dog').meals,1); assert.equal(growthOf(p,'cat').meals,0);
});

test('2/5/9 meals unlock distinct interactions and placeable gifts, persisting on reload', () => {
  let p = adoptedDog(); p.food=10;
  for (let meal=1;meal<=9;meal++) {
    const result = feedPet(p,'dog');
    assert.equal(result.leveledUp,[2,5,9].includes(meal));
    const expected=meal<2?0:meal<5?1:meal<9?2:3;
    assert.equal(growthOf(p,'dog').index,expected);
    for (const [threshold,id] of [[2,'growth-ball'],[5,'growth-flowers'],[9,'growth-photo']]) {
      assert.equal(unlockedFurniture(p).some(f=>f.id===id),meal>=threshold);
      if(meal===threshold)assert(placeFurniture(p,id,expected));
    }
    p=sanitizeProgress(JSON.parse(JSON.stringify(p)));
    assert.equal(growthOf(p,'dog').meals,meal);
  }
  assert.equal(growthOf(p,'dog').next,null); assert.equal(p.home.placements.length,3); assert.equal(p.food,1);
  assert.equal(feedPet(p,'dog').leveledUp,false); assert.equal(growthOf(p,'dog').meals,10);
});

test('corrupt growth cannot grant unadopted pets rewards or invalid stock', () => {
  const p=adoptedDog(); p.food=-10; p.growth={dog:{meals:NaN},cat:{meals:99}};
  p.home.placements=[{id:'growth-photo',slot:0}];
  const fixed=sanitizeProgress(p);
  assert.equal(fixed.food,0); assert.equal(growthOf(fixed,'dog').meals,0); assert.equal(growthOf(fixed,'cat').meals,0);
  assert.deepEqual(fixed.home.placements,[]);
  p.food=Infinity; assert.equal(sanitizeProgress(p).food,0);
  p.food=1000000; assert.equal(sanitizeProgress(p).food,99999);
});
