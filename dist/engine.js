/** Pure game simulation; coordinates are fractions of a fixed-size house. */
export const RULES = Object.freeze({ minWidth: .20, maxWidth: .80, minHeight: .16, maxHeight: .70, speed: .18, heightRate: .52, tolerance: .002 });

export const CHAPTERS = [
  { name: '暖陽小巷', subtitle: '從一點善意開始', theme: 'sunny', icon: 'sun', reward: '窗邊的小盆栽', rewardIcon: 'plant' },
  { name: '森林公寓', subtitle: '每個願望，形狀都不同', theme: 'forest', icon: 'leaf', reward: '週末的閱讀沙發', rewardIcon: 'sofa' },
  { name: '星光屋頂', subtitle: '一起住進剛剛好的夜晚', theme: 'night', icon: 'moon', reward: '晚安的星星抱枕', rewardIcon: 'moon' }
];

// Every authored goal has a known feasible layout. New mechanics appear separately,
// then combine. Stars are optional replay goals; failing one never blocks progress.
export const LEVELS = [
  { id: 'hello-v2', name: '新鄰居來了', chapter: 0, heights: [1], widths: [.28], targetH: [1], targetW: [.57], kinds: ['space','space'], counts: [3,1], par: 2, tip: '按住左邊的小家。讓每一張臉都笑起來！' },
  { id: 'share-v2', name: '借你半個午後', chapter: 0, heights: [1], widths: [.76], targetH: [1], targetW: [.43], kinds: ['space','space'], counts: [2,3], par: 2, tip: '右邊有點擠。多出來的空間，分一點給鄰居。' },
  { id: 'upstairs-v2', name: '樓上的敲門聲', chapter: 0, heights: [.28,.72], widths: [.70,.30], targetH: [.55,.45], targetW: [.48,.55], kinds: ['space','space','space','space'], counts: [2,2,2,1], par: 7, tip: '按住房間時，整層也會向相鄰樓層借高度。' },
  { id: 'first-sofa', name: '沙發搬不進去', chapter: 0, heights: [.46,.54], widths: [.28,.62], targetH: [.48,.52], targetW: [.64,.48], kinds: ['wide','space','space','space'], counts: [1,2,2,1], par: 7, reveal: 'wide', tip: '兔兔帶了長沙發：空間夠大，還要夠寬。' },
  { id: 'first-tree', name: '向上長的小樹', chapter: 1, heights: [.26,.74], widths: [.52,.48], targetH: [.58,.42], targetW: [.50,.50], kinds: ['tall','space','space','space'], counts: [1,1,2,1], par: 7, reveal: 'tall', tip: '小熊的植物碰到天花板了，幫這層樓長高一點。' },
  { id: 'sofa-tree', name: '橫著躺，直著長', chapter: 1, heights: [.68,.32], widths: [.28,.74], targetH: [.44,.56], targetW: [.59,.42], kinds: ['wide','space','tall','space'], counts: [1,2,1,2], par: 10, tip: '沙發想要寬，植物想要高。先滿足誰比較順？' },
  { id: 'forest-bridge', name: '空間接力賽', chapter: 1, heights: [.20,.53,.27], widths: [.75,.25,.72], targetH: [.35,.30,.35], targetW: [.52,.57,.43], kinds: ['space','wide','space','space','tall','space'], counts: [2,1,2,1,1,2], par: 13, tip: '空間只從相鄰樓層借來。中間樓層是接力的橋梁。' },
  { id: 'forest-party', name: '森林的喬遷派對', chapter: 1, heights: [.43,.22,.35], widths: [.32,.73,.29], targetH: [.30,.38,.32], targetW: [.55,.47,.58], kinds: ['wide','space','tall','space','wide','space'], counts: [1,2,1,2,1,1], par: 14, tip: '每間房都有自己的願望。一起準備派對吧！' },
  { id: 'first-nook', name: '小貓只想窩著', chapter: 2, heights: [1], widths: [.70], targetH: [1], targetW: [.39], kinds: ['cozy','space'], counts: [1,3], par: 3, reveal: 'cozy', tip: '小貓喜歡剛剛好的窩。太擠不行，太空也睡不著。' },
  { id: 'night-neighbors', name: '輕輕的晚安', chapter: 2, heights: [.67,.33], widths: [.66,.30], targetH: [.46,.54], targetW: [.44,.58], kinds: ['cozy','space','wide','tall'], counts: [1,2,1,1], par: 11, tip: '把多的空間借出去，讓小貓安心睡，鄰居也舒服。' },
  { id: 'night-garden', name: '月光空中花園', chapter: 2, heights: [.54,.25,.21], widths: [.72,.30,.68], targetH: [.31,.32,.37], targetW: [.46,.56,.48], kinds: ['cozy','space','wide','space','tall','space'], counts: [1,2,1,2,1,2], par: 15, tip: '每一層都牽著下一層。讓月光照進剛剛好的小家。' },
  { id: 'all-together', name: '今晚，整條街都亮了', chapter: 2, heights: [.24,.25,.51], widths: [.28,.74,.28], targetH: [.36,.34,.30], targetW: [.55,.44,.56], kinds: ['wide','cozy','tall','space','cozy','wide'], counts: [1,1,1,2,1,1], par: 18, tip: '最後一場喬遷派對。把所有願望一起安排好！' }
];

export const KINDS = {
  space: { label: '想要空間', short: '空間', icon: 'friends', resident: '小糰子', intro: '按住讓房間變大，全部舒服就過關。' },
  wide: { label: '沙發要夠寬', short: '夠寬', icon: 'sofa', resident: '兔兔', intro: '兔兔的長沙發需要寬度。房間很大但太窄，還是放不下。' },
  tall: { label: '植物要夠高', short: '夠高', icon: 'plant', resident: '小熊', intro: '小熊的植物想向上長。按住房間，向相鄰樓層借一點高度。' },
  cozy: { label: '小窩別太大', short: '剛好', icon: 'moon', resident: '小貓', intro: '小貓喜歡有包覆感的小窩。留在舒適範圍，太大也要分給鄰居。' }
};

export function createState(level) { return { heights: [...level.heights], widths: [...level.widths] }; }
export function cloneState(state) { return { heights: [...state.heights], widths: [...state.widths] }; }
export function areas(state) { return state.heights.flatMap((h, r) => [h * state.widths[r], h * (1 - state.widths[r])]); }
export function goalsFor(level) {
  return level.kinds.map((kind, i) => {
    const row = Math.floor(i / 2), width = i % 2 ? 1 - level.targetW[row] : level.targetW[row];
    const area = level.targetH[row] * width;
    return { kind, minArea: area * .86, maxArea: kind === 'cozy' ? area * 1.14 : Infinity, minWidth: kind === 'wide' ? width * .92 : 0, minHeight: kind === 'tall' ? level.targetH[row] * .92 : 0 };
  });
}
export function roomStatus(state, goals) {
  const sizes = areas(state);
  return goals.map((goal, i) => {
    const row = Math.floor(i / 2), width = i % 2 ? 1 - state.widths[row] : state.widths[row], area = sizes[i];
    const crowded = area < goal.minArea - RULES.tolerance;
    const tooWideOpen = area > goal.maxArea + RULES.tolerance;
    const narrow = width < goal.minWidth - RULES.tolerance;
    const short = state.heights[row] < goal.minHeight - RULES.tolerance;
    const happy = !crowded && !tooWideOpen && !narrow && !short;
    const reason = tooWideOpen ? '太空了' : narrow ? '還要寬一點' : short ? '還要高一點' : crowded ? '還有點擠' : '剛剛好';
    const fill = tooWideOpen ? goal.maxArea / area : Math.min(area / goal.minArea, goal.minWidth ? width / goal.minWidth : 1, goal.minHeight ? state.heights[row] / goal.minHeight : 1);
    return { happy, reason, fill: happy ? 1 : Math.min(1, fill), crowded, tooWideOpen, narrow, short };
  });
}
export function comfort(state, goals) { return roomStatus(state, goals).map(status => status.happy); }
export function isSolved(state, goals) { return comfort(state, goals).every(Boolean); }
export function deficitScore(state, goals) {
  const sizes = areas(state), t = RULES.tolerance;
  return goals.reduce((sum, g, i) => {
    const row = Math.floor(i / 2), width = i % 2 ? 1 - state.widths[row] : state.widths[row];
    return sum + Math.max(0, g.minArea - t - sizes[i]) ** 2 + Math.max(0, sizes[i] - g.maxArea - t) ** 2 + .5 * Math.max(0, g.minWidth - t - width) ** 2 + .5 * Math.max(0, g.minHeight - t - state.heights[row]) ** 2;
  }, 0);
}

/** Fixed total space. Only same-floor and immediately adjacent floors can donate. */
export function advance(state, room, seconds) {
  if (!Number.isInteger(room) || room < 0 || room >= state.heights.length * 2 || !Number.isFinite(seconds) || seconds <= 0) return false;
  const row = Math.floor(room / 2), speed = RULES.speed * Math.min(seconds, .04), previous = state.widths[row];
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

export function suggestPlan(state, goals) {
  if (isSolved(state, goals)) return null;
  for (const dt of [.016, .004, .001, .00025]) {
    let best = null, bestScore = deficitScore(state, goals);
    const maxDepth = dt === .016 ? 3 : 4;
    function search(current, path) {
      if (path.length === maxDepth) return;
      for (let room = 0; room < goals.length; room++) {
        const trial = cloneState(current); advance(trial, room, dt);
        const next = [...path, room], score = deficitScore(trial, goals);
        if (score < bestScore - 1e-16) { bestScore = score; best = next; }
        search(trial, next);
      }
    }
    search(state, []);
    if (best) return { rooms: best, dt };
  }
  return null;
}

export function awardStars({ moves, par, usedHint }) {
  return 1 + Number(moves <= par) + Number(!usedHint);
}
export function chapterComplete(best, chapter) { return LEVELS.filter(l => l.chapter === chapter).every(l => best[l.id]?.stars >= 1); }
