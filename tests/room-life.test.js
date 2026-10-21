import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomLife } from '../dist/room-life.js';
import { depthAt, furniturePosition } from '../dist/roaming.js';

test('room controller renders all adopted pets, shares furniture depth, hides pets for editing and pauses offscreen', () => {
  // Offline DOM surface stub: checks controller wiring, not browser rendering or touch.
  const globals=['document','window','matchMedia','requestAnimationFrame','cancelAnimationFrame','setTimeout'];
  const saved=Object.fromEntries(globals.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  const events={},frames=new Map(); let sequence=0,modal=false,selected=null;
  const media={matches:false,addEventListener(name,fn){events.motion=fn;}};
  class Element {
    constructor(){this.children=[];this.style={};this.dataset={};this.attributes={};this.hidden=false;}
    append(el){this.children.push(el);} replaceChildren(){this.children=[];}
    setAttribute(k,v){this.attributes[k]=v;}
    focus(){document.activeElement=this;}
  }
  const p={adopted:['dog','cat'],activePet:'dog',growth:{dog:{meals:9},cat:{meals:0}},home:{placements:[{id:'gift-0',slot:4}]}};
  try {
    globalThis.document={activeElement:null,hidden:false,createElement:()=>new Element(),querySelector:()=>modal?{}:null,addEventListener(name,fn){events[name]=fn;}};
    globalThis.window={addEventListener(name,fn){events[name]=fn;}};
    globalThis.matchMedia=()=>media;
    globalThis.requestAnimationFrame=fn=>{const id=++sequence;frames.set(id,fn);return id;};
    globalThis.cancelAnimationFrame=id=>frames.delete(id);globalThis.setTimeout=()=>0;
    const container=new Element(),life=createRoomLife(container,id=>{selected=id;});
    life.sync(p,false);
    assert.equal(container.children.length,3);
    const [plant,dog,cat]=container.children;
    assert.equal(plant.style.zIndex,depthAt(furniturePosition(4).y));
    assert.equal(dog.dataset.pet,'dog');assert.equal(cat.dataset.pet,'cat');assert(dog.innerHTML.includes('pet-crown'));assert(!cat.innerHTML.includes('pet-crown'));
    cat.onclick();assert.equal(selected,'cat');
    life.setActive(true);assert.equal(frames.size,1);
    const pump=time=>{const [id,fn]=frames.entries().next().value;frames.delete(id);fn(time);};
    pump(100);pump(150);const position=dog.style.top;
    modal=true;pump(200);assert.equal(dog.style.top,position);modal=false;
    life.sync(p,true);life.setActive(false);assert.equal(frames.size,0);
    assert(container.children.filter(el=>el.dataset.pet).every(el=>el.hidden));
    assert.equal(container.children[0].hidden,false);
    life.sync(p,false);life.setActive(true);
    document.hidden=true;events.visibilitychange();assert.equal(frames.size,0);
    document.hidden=false;events.visibilitychange();assert.equal(frames.size,1);
    media.matches=true;events.motion();assert.equal(frames.size,0);
    media.matches=false;events.motion();assert.equal(frames.size,1);
    events.pagehide();assert.equal(frames.size,0);
    events.pageshow();assert.equal(frames.size,1);
    life.setActive(false);assert.equal(frames.size,0);
  } finally {for(const [key,descriptor] of Object.entries(saved)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
