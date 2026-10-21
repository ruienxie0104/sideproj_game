/** Foot positions use floor-local fractions. Aisles sit between the 3x3 furniture cells. */
const AXIS = [.06, 1 / 3, 2 / 3, .94];
export const WAYPOINTS = AXIS.flatMap(y => AXIS.map(x => ({ x, y })));
export function createWalker(index) {
  const node = [0, 15, 3, 12][index % 4];
  return { ...WAYPOINTS[node], node, target: node, pause: index * .35, mode: 'idle', facing: index % 2 ? -1 : 1, hold: 0 };
}
export function stepWalker(walker, seconds, { random = Math.random, reserved = [], canNap = false } = {}) {
  const dt = Math.max(0, Math.min(Number.isFinite(seconds) ? seconds : 0, .05));
  if (walker.hold > 0) { walker.hold = Math.max(0, walker.hold - dt); walker.mode = 'idle'; return walker; }
  if (walker.pause > 0) { walker.pause = Math.max(0, walker.pause - dt); return walker; }
  if (walker.node === walker.target) {
    const row = Math.floor(walker.node / 4), col = walker.node % 4;
    const options = [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]
      .filter(([r,c]) => r >= 0 && r < 4 && c >= 0 && c < 4)
      .map(([r,c]) => r * 4 + c).filter(n => !reserved.includes(n));
    if (!options.length) { walker.mode = 'idle'; walker.pause = .5; return walker; }
    walker.target = options[Math.min(options.length - 1, Math.floor(random() * options.length))];
  }
  const goal = WAYPOINTS[walker.target], dx = goal.x - walker.x, dy = goal.y - walker.y, distance = Math.hypot(dx,dy);
  const step = .10 * dt;
  walker.mode = 'walk'; if (Math.abs(dx) > .001) walker.facing = dx < 0 ? -1 : 1;
  if (distance <= step) {
    walker.x = goal.x; walker.y = goal.y; walker.node = walker.target;
    walker.mode = canNap && random() < .25 ? 'nap' : 'idle';
    walker.pause = walker.mode === 'nap' ? 4 + random() * 3 : .8 + random() * 1.8;
  } else { walker.x += dx / distance * step; walker.y += dy / distance * step; }
  return walker;
}
export function furniturePosition(slot) { return { x: ((slot % 3) + .5) / 3, y: (Math.floor(slot / 3) + .5) / 3 }; }
export function depthAt(y) { return 10 + Math.round(y * 500); }
