import test from 'node:test';
import assert from 'node:assert/strict';
import { createWalker, stepWalker, WAYPOINTS, furniturePosition, depthAt } from '../dist/roaming.js';

test('all walking paths stay within the floor and avoid furniture footprints even with nine items', () => {
  let seed=29; const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
  const walkers=Array.from({length:4},(_,i)=>createWalker(i));
  const starts=walkers.map(w=>[w.x,w.y]); const moved=new Set(); let naps=0;
  for(let tick=0;tick<15000;tick++) {
    for (let i=0;i<4;i++) {
      const w=walkers[i]; stepWalker(w,1/60,{random,canNap:true,reserved:walkers.filter(other=>other!==w).map(other=>other.target)});
      assert(w.x>=.06-1e-8&&w.x<=.94+1e-8&&w.y>=.06-1e-8&&w.y<=.94+1e-8);
      if(Math.hypot(w.x-starts[i][0],w.y-starts[i][1])>.1)moved.add(i);
      for(let slot=0;slot<9;slot++) { const f=furniturePosition(slot); assert(Math.abs(w.x-f.x)>.10||Math.abs(w.y-f.y)>.10,'footprint must not cross a furnished cell'); }
      if(w.mode==='nap')naps++;
    }
  }
  assert.equal(moved.size,4); assert(naps>0);
});

test('depth ordering follows feet: a pet behind furniture is drawn behind, then in front after walking past', () => {
  const furniture=furniturePosition(4);
  assert(depthAt(furniture.y-.1)<depthAt(furniture.y));
  assert(depthAt(furniture.y+.1)>depthAt(furniture.y));
  assert.equal(new Set(Array.from({length:9},(_,i)=>JSON.stringify(furniturePosition(i)))).size,9);
});

test('interaction pauses motion and large elapsed frames cannot teleport pets', () => {
  const w=createWalker(0); w.hold=2;
  stepWalker(w,.05,{random:()=>0}); assert.equal(w.x,WAYPOINTS[0].x); assert.equal(w.y,WAYPOINTS[0].y);
  const a=createWalker(0),b=createWalker(0);
  stepWalker(a,100,{random:()=>0}); stepWalker(b,.05,{random:()=>0}); assert.deepEqual(a,b);
  const before={...a}; stepWalker(a,NaN,{random:()=>0}); assert.deepEqual(a,before);
});

test('new pets do not nap until the growth milestone is unlocked', () => {
  const w=createWalker(0);
  for(let i=0;i<2000;i++){stepWalker(w,.05,{random:()=>0,canNap:false});assert.notEqual(w.mode,'nap');}
});
