import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../dist/audio.js';

test('music requires activation, uses one scheduler, pauses in background, and effects stay independent', async () => {
  const saved = Object.fromEntries(['window','document','setInterval','clearInterval'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis,k)]));
  const listeners = {}, timers = new Map(), oscillators = [], gains = [], contexts = [];
  let timerId = 0;
  class Context {
    constructor() { this.currentTime = 0; this.state = 'suspended'; this.destination = {}; contexts.push(this); }
    resume() { this.state = 'running'; return Promise.resolve(); }
    suspend() { this.state = 'suspended'; return Promise.resolve(); }
    createGain() { const node = { connect() {}, disconnect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime(value) { node.lastValue = value; } } }; gains.push(node); return node; }
    createOscillator() { const node = { frequency: {}, connect() {}, disconnect() {}, start(t) { node.startTime = t; }, stop(t) { node.stopTime = t; } }; oscillators.push(node); return node; }
  }
  try {
    globalThis.document = { hidden: false, addEventListener(name, fn) { listeners[name] = fn; } };
    globalThis.window = { AudioContext: Context, addEventListener(name, fn) { listeners[name] = fn; } };
    globalThis.setInterval = fn => { const id = ++timerId; timers.set(id, fn); return id; };
    globalThis.clearInterval = id => timers.delete(id);
    const settings = { music: true, effects: false, volume: .5 }, audio = createAudio(settings);
    assert.equal(contexts.length, 0, 'no autoplay context until a gesture activates it');
    await audio.activate(); assert.equal(timers.size, 1); assert.equal(contexts.length,1);
    const before = oscillators.length;
    await audio.activate(); audio.sync();
    assert.equal(timers.size, 1); assert.equal(oscillators.length, before, 'navigation does not insert another beat');
    audio.effect([523]); assert.equal(oscillators.length,before);
    contexts[0].currentTime = 30; [...timers.values()][0]();
    assert(oscillators.length - before <= 2, 'a delayed timer skips missed beats instead of bursting');
    const resumedCount = oscillators.length;
    settings.volume = 0; audio.sync(); assert.equal(gains[0].lastValue, 0);
    settings.music = false; settings.effects = true; await audio.activate();
    assert.equal(timers.size,0); assert.equal(gains[1].lastValue,0,'music fades independently');
    audio.effect([523,659]); assert.equal(oscillators.length,resumedCount+2);
    settings.music = true; await audio.activate(); assert.equal(timers.size,1);
    document.hidden = true; listeners.visibilitychange();
    assert.equal(timers.size,0); assert.equal(contexts[0].state,'suspended');
    const hiddenCount = oscillators.length; audio.effect([523]); assert.equal(oscillators.length,hiddenCount);
    document.hidden = false; listeners.visibilitychange(); await Promise.resolve();
    assert.equal(timers.size,1); assert.equal(contexts[0].state,'running');
    listeners.pagehide(); assert.equal(timers.size,0);
    listeners.pageshow({persisted:true}); await Promise.resolve(); assert.equal(timers.size,1);
    for (const note of oscillators) { assert(note.frequency.value > 0); assert(note.stopTime > note.startTime); }
    settings.music = false; settings.effects = false; audio.sync();
    assert.equal(timers.size,0); assert.equal(contexts[0].state,'suspended');
  } finally {
    for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis,key,descriptor); else delete globalThis[key]; }
  }
});

test('unavailable Web Audio reports a non-blocking error', async () => {
  const oldWindow = globalThis.window, oldDocument = globalThis.document;
  let errors = 0;
  try {
    globalThis.window = { addEventListener() {} }; globalThis.document = { addEventListener() {}, hidden: false };
    const audio = createAudio({ music: true, effects: true, volume: .5 }, () => errors++);
    await audio.activate(); audio.effect([440]); audio.sync();
    assert.equal(errors,1);
  } finally { if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow; if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument; }
});
