/** Pure game simulation; coordinates are fractions of a fixed-size house. */
export const RULES = Object.freeze({ minWidth: .20, maxWidth: .80, minHeight: .16, maxHeight: .70, speed: .18, heightRate: .52, tolerance: .002 });

export const CHAPTERS = [
  { name: '暖陽小巷', subtitle: '從一點善意開始', theme: 'sunny', icon: 'sun', reward: '窗邊的小盆栽', rewardIcon: 'plant' },
  { name: '森林公寓', subtitle: '每個願望，形狀都不同', theme: 'forest', icon: 'leaf', reward: '週末的閱讀沙發', rewardIcon: 'sofa' },
  { name: '星光屋頂', subtitle: '一起住進剛剛好的夜晚', theme: 'night', icon: 'moon', reward: '晚安的星星抱枕', rewardIcon: 'moon' },
  { name: '海風花園', subtitle: '把陽光和海風帶回家', theme: 'coast', icon: 'shell', reward: '海風編織地毯', rewardIcon: 'rug' },
  { name: '奶油小鎮', subtitle: '留一個位子，等你回來', theme: 'bakery', icon: 'tea', reward: '午後點心小桌', rewardIcon: 'tea' },
  { name: '雲上小屋', subtitle: '我們一起生活的地方', theme: 'cloud', icon: 'cloud', reward: '雲朵午睡床', rewardIcon: 'bed' }
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
  { id: 'all-together', name: '今晚，整條街都亮了', chapter: 2, heights: [.24,.25,.51], widths: [.28,.74,.28], targetH: [.36,.34,.30], targetW: [.55,.44,.56], kinds: ['wide','cozy','tall','space','cozy','wide'], counts: [1,1,1,2,1,1], par: 18, tip: '最後一場喬遷派對。把所有願望一起安排好！' },
  { id: 'sea-breeze', name: '海風第一扇窗', chapter: 3, heights: [.32,.68], widths: [.72,.32], targetH: [.48,.52], targetW: [.54,.46], kinds: ['wide','space','cozy','space'], counts: [1,2,1,1], par: 9, tip: '小貓想窩著看海，兔兔想伸直腳。先借給需要的鄰居。' },
  { id: 'shell-shelf', name: '貝殼收藏架', chapter: 3, heights: [.62,.38], widths: [.32,.70], targetH: [.43,.57], targetW: [.46,.56], kinds: ['space','cozy','tall','wide'], counts: [2,1,1,1], par: 11, tip: '先替樓下留出高度，再調整兩邊的寬度。' },
  { id: 'tidal-balcony', name: '潮汐陽台', chapter: 3, heights: [.22,.48,.30], widths: [.72,.32,.70], targetH: [.34,.35,.31], targetW: [.50,.56,.45], kinds: ['tall','space','wide','cozy','space','space'], counts: [1,2,1,1,2,1], par: 14, tip: '空間像潮水，在相鄰樓層之間流動。' },
  { id: 'sea-picnic', name: '海邊的野餐約定', chapter: 3, heights: [.40,.20,.40], widths: [.28,.70,.33], targetH: [.32,.36,.32], targetW: [.56,.46,.54], kinds: ['wide','cozy','tall','space','wide','space'], counts: [1,1,1,2,1,2], par: 15, tip: '完成整個街區，編織地毯就能帶回你的家。' },
  { id: 'morning-bread', name: '麵包出爐了', chapter: 4, heights: [.64,.36], widths: [.68,.30], targetH: [.48,.52], targetW: [.45,.57], kinds: ['cozy','wide','space','tall'], counts: [1,1,2,1], par: 11, tip: '留一個小小角落，等一份溫熱的早餐。' },
  { id: 'tea-for-four', name: '四位的下午茶', chapter: 4, heights: [.30,.70], widths: [.30,.70], targetH: [.53,.47], targetW: [.57,.44], kinds: ['wide','tall','cozy','space'], counts: [1,1,1,2], par: 12, tip: '樓上要長高，樓下要縮小，剛好可以互相幫忙。' },
  { id: 'cookie-stairs', name: '餅乾香的樓梯間', chapter: 4, heights: [.48,.30,.22], widths: [.70,.30,.70], targetH: [.30,.34,.36], targetW: [.45,.55,.48], kinds: ['cozy','space','wide','space','tall','cozy'], counts: [1,2,1,2,1,1], par: 15, tip: '先留意最下層的植物，再照顧兩間小貓窩。' },
  { id: 'bakery-party', name: '小鎮茶會', chapter: 4, heights: [.22,.25,.53], widths: [.30,.72,.30], targetH: [.36,.32,.32], targetW: [.54,.46,.57], kinds: ['wide','cozy','tall','space','cozy','wide'], counts: [1,1,1,2,1,1], par: 17, tip: '茶會準備好了。把每位朋友都安頓舒服吧。' },
  { id: 'cloud-window', name: '雲停在窗邊', chapter: 5, heights: [.35,.65], widths: [.72,.28], targetH: [.52,.48], targetW: [.46,.56], kinds: ['cozy','tall','wide','space'], counts: [1,1,1,2], par: 12, tip: '窗外很寬，屋裡剛好。讓每個人都有自己的角落。' },
  { id: 'pillow-fort', name: '抱枕小堡壘', chapter: 5, heights: [.62,.38], widths: [.72,.28], targetH: [.44,.56], targetW: [.44,.58], kinds: ['cozy','wide','tall','cozy'], counts: [1,1,1,1], par: 13, tip: '兩個小窩都要剛剛好。輕點會比長按更容易微調。' },
  { id: 'sky-bridge', name: '天空的鄰居們', chapter: 5, heights: [.25,.51,.24], widths: [.72,.28,.72], targetH: [.35,.30,.35], targetW: [.46,.56,.45], kinds: ['tall','cozy','wide','space','space','wide'], counts: [1,1,1,2,2,1], par: 16, tip: '中間樓層連接每個願望。慢慢調整，不必趕時間。' },
  { id: 'welcome-home', name: '歡迎回家', chapter: 5, heights: [.48,.22,.30], widths: [.28,.72,.28], targetH: [.32,.36,.32], targetW: [.56,.44,.56], kinds: ['wide','cozy','tall','space','cozy','wide'], counts: [1,1,1,2,1,1], par: 18, tip: '最後一扇窗亮起來後，回家陪陪等你的朋友。' }

];

export const KINDS = {
  space: { label: '想要空間', short: '空間', icon: 'friends', resident: '小狗', intro: '按住讓房間變大，全部舒服就過關。' },
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
