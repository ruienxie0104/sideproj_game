/** Pure simulation. All dimensions are fractions of one fixed-size house. */
export const RULES = Object.freeze({ minWidth: 0.20, maxWidth: 0.80, minHeight: 0.16, maxHeight: 0.70, speed: 0.19, heightRate: 0.52, tolerance: 0.002 });

// targetH/targetW describe a known valid layout; comfort needs 91% of its area.
// These are authored levels, not evidence of an optimal difficulty curve.
export const LEVELS = [
  { id: 'first-room', name: '先借一點點', heights: [1], widths: [.25], targetH: [1], targetW: [.57], counts: [3, 1], tip: '按住左邊的小家，讓它借到足夠的空間。', concept: '按住變大，放手就停。' },
  { id: 'give-back', name: '多了也能分一點', heights: [1], widths: [.76], targetH: [1], targetW: [.43], counts: [2, 3], tip: '右邊好擠。按住它，左邊就會分出一點位置。', concept: '舒服的小家，也能把多的空間分出去。' },
  { id: 'two-floors', name: '樓上樓下', heights: [.28, .72], widths: [.70, .30], targetH: [.55, .45], targetW: [.48, .55], counts: [2, 2, 2, 1], tip: '現在多了一層樓。按住時，同層與相鄰樓層都會分享空間。', concept: '一間房變大，整層樓也會跟著長高。' },
  { id: 'room-to-share', name: '有借有還', heights: [.68, .32], widths: [.28, .74], targetH: [.44, .56], targetW: [.59, .42], counts: [3, 1, 1, 3], tip: '看看哪一間餘裕最大，再照顧擁擠的小家。', concept: '小口小口借，更容易剛剛好。' },
  { id: 'three-floors', name: '第三位鄰居', heights: [.20, .53, .27], widths: [.75, .25, .72], targetH: [.35, .30, .35], targetW: [.52, .57, .43], counts: [2, 2, 2, 1, 2, 3], tip: '空間只從相鄰樓層借來。中間的小家，是大家的橋梁。', concept: '試著把空間，一層一層傳過去。' },
  { id: 'tiny-adjustments', name: '一點就夠了', heights: [.43, .22, .35], widths: [.32, .73, .29], targetH: [.30, .38, .32], targetW: [.55, .47, .58], counts: [1, 2, 3, 2, 2, 1], tip: '快舒服時可以輕點微調，不一定要一直按著。', concept: '借太多也沒關係，還可以借回來。' },
  { id: 'passing-space', name: '把餘裕傳下去', heights: [.54, .25, .21], widths: [.72, .30, .68], targetH: [.31, .32, .37], targetW: [.46, .56, .48], counts: [2, 1, 2, 3, 3, 2], tip: '先讓最下層有地方伸展，再調整左右。', concept: '同時觀察房間寬度和樓層高度。' },
  { id: 'everyone-home', name: '每個人都有位置', heights: [.24, .25, .51], widths: [.28, .74, .28], targetH: [.36, .34, .30], targetW: [.55, .44, .56], counts: [3, 2, 2, 3, 2, 1], tip: '最後一個小家了。慢慢調整，找出你的安排。', concept: '沒有倒數，讓每一個表情都變成微笑。' }
];

export function createState(level) { return { heights: [...level.heights], widths: [...level.widths] }; }
export function cloneState(state) { return { heights: [...state.heights], widths: [...state.widths] }; }
export function targetsFor(level) { return level.targetH.flatMap((h, r) => [h * level.targetW[r] * .91, h * (1 - level.targetW[r]) * .91]); }
export function areas(state) { return state.heights.flatMap((h, r) => [h * state.widths[r], h * (1 - state.widths[r])]); }
export function comfort(state, targets) { return areas(state).map((area, i) => area >= targets[i] - RULES.tolerance); }
export function isSolved(state, targets) { return comfort(state, targets).every(Boolean); }
export function deficitScore(state, targets) { return areas(state).reduce((sum, area, i) => sum + Math.max(0, targets[i] - RULES.tolerance - area) ** 2, 0); }

/** Mutates state. At most 40ms per integration step prevents a background-tab jump. */
export function advance(state, room, seconds) {
  if (!Number.isInteger(room) || room < 0 || room >= state.heights.length * 2 || !Number.isFinite(seconds) || seconds <= 0) return false;
  const row = Math.floor(room / 2);
  const speed = RULES.speed * Math.min(seconds, .04);
  const previous = state.widths[row];
  state.widths[row] = Math.max(RULES.minWidth, Math.min(RULES.maxWidth, previous + speed * (room % 2 === 0 ? 1 : -1)));
  let grew = 0;
  if (state.heights.length > 1) {
    const neighbors = [row - 1, row + 1].filter(r => r >= 0 && r < state.heights.length);
    const available = neighbors.reduce((sum, r) => sum + Math.max(0, state.heights[r] - RULES.minHeight), 0);
    grew = Math.min(speed * RULES.heightRate, available, Math.max(0, RULES.maxHeight - state.heights[row]));
    if (grew > 0) {
      for (const r of neighbors) state.heights[r] -= grew * Math.max(0, state.heights[r] - RULES.minHeight) / available;
      state.heights[row] += grew;
    }
  }
  return Math.abs(state.widths[row] - previous) + grew > 1e-12;
}

/** Small look-ahead used by the hint and offline solvability check.
 * It may temporarily lend to a comfortable room to improve the whole house.
 * Returns a finite suggestion, not a global optimum or an automatic win.
 */
export function suggestPlan(state, targets) {
  if (isSolved(state, targets)) return null;
  for (const dt of [.016, .004, .001, .00025]) {
    let best = null, bestScore = deficitScore(state, targets);
    const maxDepth = dt === .016 ? 3 : 4;
    function search(current, path) {
      if (path.length === maxDepth) return;
      for (let room = 0; room < targets.length; room++) {
        const trial = cloneState(current);
        advance(trial, room, dt);
        const next = [...path, room];
        const score = deficitScore(trial, targets);
        if (score < bestScore - 1e-16) { bestScore = score; best = next; }
        search(trial, next);
      }
    }
    search(state, []);
    if (best) return { rooms: best, dt };
  }
  return null;
}
