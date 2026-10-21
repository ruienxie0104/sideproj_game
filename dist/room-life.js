import { PETS, FURNITURE } from './pets.js';
import { growthOf } from './care.js';
import { animalArt, icon } from './art.js';
import { createWalker, stepWalker, furniturePosition, depthAt } from './roaming.js';

export function createRoomLife(container, onSelect) {
  const walkers = new Map(), actors = new Map();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let progress, active = false, frame = null, last = 0;
  function paint(id) {
    const w = walkers.get(id), button = actors.get(id);
    if (!button) return;
    button.style.left = `${w.x * 100}%`; button.style.top = `${w.y * 100}%`;
    button.style.zIndex = depthAt(w.y); button.dataset.facing = w.facing;
    button.dataset.mode = w.reaction && performance.now() < w.reactionUntil ? w.reaction : w.mode;
  }
  function tick(time) {
    frame = null;
    if (!active || document.hidden || motion.matches) return;
    const dt = last ? (time - last) / 1000 : 0; last = time;
    if (!document.querySelector('dialog[open]')) {
      for (const [id, walker] of walkers) {
        if (document.activeElement === actors.get(id)) { walker.mode = 'idle'; paint(id); continue; }
        stepWalker(walker, dt, { reserved: [...walkers].filter(([other]) => other !== id).map(([, w]) => w.target), canNap: growthOf(progress,id).index >= 2 });
        paint(id);
      }
    }
    frame = requestAnimationFrame(tick);
  }
  function setActive(value) {
    active = value; last = 0;
    if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    if (active && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
  }
  function sync(next, editing) {
    progress = next;
    const focused = document.activeElement?.dataset?.pet;
    container.replaceChildren(); actors.clear();
    for (const id of walkers.keys()) if (!progress.adopted.includes(id)) walkers.delete(id);
    for (const placement of progress.home.placements) {
      const item = FURNITURE.find(f => f.id === placement.id), pos = furniturePosition(placement.slot);
      const el = document.createElement('div'); el.className = 'living-furniture';
      el.innerHTML = icon(item.icon); el.style.left = `${pos.x * 100}%`; el.style.top = `${pos.y * 100}%`; el.style.zIndex = depthAt(pos.y);
      el.setAttribute('role','img'); el.setAttribute('aria-label',item.name); container.append(el);
    }
    progress.adopted.forEach((id, index) => {
      if (!walkers.has(id)) walkers.set(id,createWalker(index));
      const button = document.createElement('button'); button.className = 'roaming-pet'; button.dataset.pet = id;
      button.hidden = editing; button.setAttribute('aria-label', `選擇${PETS[id].name}，${growthOf(progress,id).stage.name}`);
      button.setAttribute('aria-pressed', String(progress.activePet === id));
      button.innerHTML = `<span class="actor-body">${animalArt(id)}${growthOf(progress,id).index >= 3 ? `<span class="pet-crown">${icon('crown')}</span>` : ''}</span><span class="actor-name">${PETS[id].name}</span><span class="pet-emote" aria-hidden="true"></span>`;
      button.onclick = () => onSelect(id); actors.set(id,button); container.append(button); paint(id);
    });
    if (focused && !editing) actors.get(focused)?.focus({ preventScroll:true });
  }
  function react(id, action) {
    const w = walkers.get(id); if (!w) return;
    w.hold = 2.8; w.mode = 'idle'; w.reaction = action; w.reactionUntil = performance.now() + 2800;
    paint(id);
    setTimeout(() => { if (performance.now() >= w.reactionUntil) { w.reaction = null; paint(id); } }, 2850);
  }
  document.addEventListener('visibilitychange', () => setActive(active));
  window.addEventListener('pagehide', () => { if (frame !== null) cancelAnimationFrame(frame); frame = null; last = 0; });
  window.addEventListener('pageshow', () => setActive(active));
  motion.addEventListener('change', () => setActive(active));
  return { sync, setActive, react };
}
