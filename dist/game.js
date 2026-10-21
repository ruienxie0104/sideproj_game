import { LEVELS, CHAPTERS, KINDS, createState, cloneState, goalsFor, roomStatus, advance, suggestPlan, awardStars, chapterComplete } from './engine.js';
import { icon, resident, animalArt, roomDecor } from './art.js';
import { STORAGE_KEY, sanitizeProgress, readProgress, recordWin, totalStars } from './progress.js';
import { PETS, animalAt, journeyIndex } from './pets.js';
import { setupJourney } from './journey.js';
import { createFoodReward } from './care.js';
import { createAudio } from './audio.js';

const $ = id => document.getElementById(id);
let progress;
try { progress = readProgress(localStorage); }
catch { progress = sanitizeProgress(null); }
let level = progress.current, state, goals, history = [], moves = 0, usedHint = false;
let active = null, won = false, lastFrame = 0, winTimer, foodReward = createFoodReward();
let lastHappy = [], reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const dialogFocus = new WeakMap();
const audio = createAudio(progress.audio, () => { $('audioStatus').textContent = '目前無法播放聲音，可再點開關重試。'; });
const colors = ['#f4d6ad','#c8dfc0','#bddbd7','#e9c4bd','#d0c8e5','#e9d695'];

for (const el of document.querySelectorAll('[data-icon]')) el.innerHTML = icon(el.dataset.icon);
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
  catch { $('saveStatus').textContent = '無法儲存進度，仍可繼續遊玩。'; }
}
function starsHTML(count, cls = '') { return [1,2,3].map(n => `<span class="star ${n <= count ? 'earned' : ''} ${cls}">${icon('star')}</span>`).join(''); }
function clearHint() { document.querySelectorAll('.hinted').forEach(el => el.classList.remove('hinted')); }
function setMessage(text) { $('message').textContent = text; }
function openDialog(dialog) {
  clearTimeout(winTimer); stop(false);
  for (const other of document.querySelectorAll('dialog[open]')) if (other !== dialog) other.close();
  dialogFocus.set(dialog, document.activeElement);
  if (!dialog.open) dialog.showModal();
}
function updateProgressUI() {
  $('totalStars').textContent = totalStars(progress);
  $('collectionCount').textContent = `收藏 ${CHAPTERS.filter((_, c) => chapterComplete(progress.best, c)).length}/${CHAPTERS.length}`;
  $('levelStars').innerHTML = starsHTML(progress.best[LEVELS[level].id]?.stars || 0);
  $('levelStars').setAttribute('aria-label', `本關已獲得 ${progress.best[LEVELS[level].id]?.stars || 0} 顆星`);
}
function start(room, pointerId = null) {
  if ($('gameView').hidden || won || active || document.querySelector('dialog[open]')) return;
  clearHint();
  history.push({ state: cloneState(state), moves });
  if (history.length > 100) history.shift();
  moves++;
  active = { room, pointerId, changed: false };
  $('board').children[room].classList.add('holding');
  lastFrame = performance.now();
  render();
}
function stop(tap = true) {
  if (!active) return;
  const previous = active;
  active = null;
  if (!previous.changed && !won) {
    if (tap) advance(state, previous.room, .035);
    else { const before = history.pop(); if (before) { state = before.state; moves = before.moves; } }
  }
  document.querySelectorAll('.holding').forEach(el => el.classList.remove('holding'));
  render();
}
function load(index) {
  journey.showGame();
  stop(false); clearTimeout(winTimer);
  for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
  level = index;
  const entry = LEVELS[level], chapter = CHAPTERS[entry.chapter];
  state = createState(entry); goals = goalsFor(entry); foodReward = createFoodReward();
  moves = 0; history = []; usedHint = false; won = false; lastHappy = [];
  progress.current = level; save();
  document.body.dataset.theme = chapter.theme;
  $('chapterNumber').textContent = `CHAPTER 0${entry.chapter + 1}`;
  $('chapterName').textContent = chapter.name;
  $('chapterSubtitle').textContent = chapter.subtitle;
  $('chapterArt').innerHTML = icon(chapter.icon);
  $('levelNumber').textContent = String(level + 1).padStart(2, '0');
  $('levelName').textContent = entry.name;
  $('houseAddress').textContent = `NO. ${String(level + 1).padStart(2, '0')}`;
  setMessage(entry.tip);
  $('goalSummary').innerHTML = `<span>★ 完成小家</span><span>★ ${entry.par} 次內</span><span id="hintGoal">★ 不用提示</span>`;
  const next = LEVELS[level + 1];
  $('nextTeaser').innerHTML = next ? `<span class="teaser-icon">${icon(next.reveal ? KINDS[next.reveal].icon : CHAPTERS[next.chapter].icon)}</span><span><small>下一扇門後面</small><b>${next.name}</b></span><span class="teaser-arrow">→</span>` : `<span class="teaser-icon">${icon('gift')}</span><span><small>你的小小街區</small><b>看看還沒收集的星星</b></span><span class="teaser-arrow">→</span>`;
  $('nextTeaser').setAttribute('aria-label', '打開街區地圖，看看接下來的小家');
  $('board').replaceChildren();
  for (let room = 0; room < goals.length; room++) {
    const kind = entry.kinds[room], button = document.createElement('button');
    button.className = `room kind-${kind}`; button.type = 'button'; button.dataset.room = room;
    button.style.setProperty('--room', colors[room]);
    button.innerHTML = `<span class="room-pattern"></span>${roomDecor(kind)}<span class="room-wish">${icon(KINDS[kind].icon)}<span>${KINDS[kind].short}</span></span><span class="resident-wrap"></span><span class="room-result"><span class="room-reason"></span><span class="need-track"><i></i></span></span><span class="happy-badge">✓</span>`;
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary || active || won) return;
      event.preventDefault(); button.focus({ preventScroll: true }); button.setPointerCapture(event.pointerId); start(room, event.pointerId);
    });
    button.addEventListener('pointerup', event => { if (active?.pointerId === event.pointerId) stop(); });
    for (const type of ['pointercancel','lostpointercapture']) button.addEventListener(type, event => { if (active?.pointerId === event.pointerId) stop(false); });
    button.addEventListener('keydown', event => { if (['Space','Enter'].includes(event.code)) { event.preventDefault(); if (!event.repeat) start(room); } });
    button.addEventListener('keyup', event => { if (['Space','Enter'].includes(event.code)) { event.preventDefault(); stop(); } });
    button.addEventListener('click', event => { if (event.detail === 0 && !active && !won) { start(room); stop(); } });
    button.addEventListener('blur', () => stop(false));
    $('board').appendChild(button);
  }
  updateProgressUI(); render();
  if (entry.reveal && !progress.seen.includes(entry.reveal)) {
    const info = KINDS[entry.reveal];
    $('discoveryArt').innerHTML = resident(entry.reveal, true) + icon(info.icon);
    $('discoveryTitle').textContent = info.label;
    $('discoveryText').textContent = info.intro;
    openDialog($('discovery'));
  }
}
function sparkle(room) {
  if (reducedMotion) return;
  const button = $('board').children[room];
  for (let i = 0; i < 5; i++) {
    const dot = document.createElement('i'); dot.className = 'spark';
    dot.style.left = `${button.offsetLeft + button.offsetWidth / 2}px`;
    dot.style.top = `${button.offsetTop + button.offsetHeight / 2}px`;
    dot.style.setProperty('--dx', `${Math.cos(i * 1.25) * 45}px`);
    dot.style.setProperty('--dy', `${Math.sin(i * 1.25) * 45 - 20}px`);
    $('board').appendChild(dot); setTimeout(() => dot.remove(), 750);
  }
}
function render() {
  if (!state) return;
  const statuses = roomStatus(state, goals), entry = LEVELS[level];
  const boardWidth = $('board').clientWidth, boardHeight = $('board').clientHeight;
  let top = 0, newlyHappy = 0;
  for (let row = 0; row < state.heights.length; row++) {
    for (let side = 0; side < 2; side++) {
      const room = row * 2 + side, button = $('board').children[room], status = statuses[room], kind = entry.kinds[room];
      const fraction = side ? 1 - state.widths[row] : state.widths[row];
      Object.assign(button.style, { left: `${(side ? state.widths[row] : 0) * 100}%`, top: `${top * 100}%`, width: `${fraction * 100}%`, height: `${state.heights[row] * 100}%` });
      button.classList.toggle('unhappy', !status.happy); button.classList.toggle('too-big', status.tooWideOpen);
      const compact = fraction * boardWidth < 105 || state.heights[row] * boardHeight < 105;
      button.classList.toggle('compact', compact);
      const holder = button.querySelector('.resident-wrap');
      const key = `${status.happy}-${compact}`;
      if (holder.dataset.key !== key) {
        holder.dataset.key = key;
        holder.innerHTML = animalArt(animalAt(entry, room), status.happy) + (kind === 'space' ? `<small>×${entry.counts[room]}</small>` : '');
      }
      button.querySelector('.room-reason').textContent = status.reason;
      button.querySelector('.need-track i').style.width = `${status.fill * 100}%`;
      button.setAttribute('aria-label', `${PETS[animalAt(entry, room)].name}（${PETS[animalAt(entry, room)].species}），${KINDS[kind].label}，${status.reason}。按住或輕點借空間。`);
      if (lastHappy.length && !lastHappy[room] && status.happy) { newlyHappy++; sparkle(room); }
    }
    top += state.heights[row];
  }
  lastHappy = statuses.map(s => s.happy);
  const happy = statuses.filter(s => s.happy).length;
  const label = `${happy === statuses.length ? '♥' : '♡'} ${happy}/${statuses.length} 個願望完成`;
  if ($('happyCount').textContent !== label) $('happyCount').textContent = label;
  $('comfortProgress').style.width = `${happy / statuses.length * 100}%`;
  $('moveGoal').textContent = `${moves} 次調整 / 目標 ${entry.par}`;
  $('moveGoal').classList.toggle('over-par', moves > entry.par);
  $('hintGoal').classList.toggle('missed', usedHint);
  $('undo').disabled = !history.length;
  if (newlyHappy) playTone(newlyHappy > 1 ? [587,740] : [659]);
  if (newlyHappy > 1 && happy < statuses.length) setMessage(`太棒了！一次讓 ${newlyHappy} 個小家舒服了。`);
  if (happy === statuses.length && !won) finish();
}
function finish() {
  won = true; stop(false);
  const entry = LEVELS[level], wasComplete = chapterComplete(progress.best, entry.chapter);
  const earned = awardStars({ moves, par: entry.par, usedHint });
  const foodEarned = foodReward.claim(progress, earned);
  $('foodRewardNotice').textContent = foodEarned ? '◡ 三星完成！獲得 1 份飼料，帶回家陪朋友吃飯吧。' : earned < 3 ? '挑戰三星可得 1 份飼料；重玩三星也能獲得。' : '這一局的飼料已領取；重新開始一關可以再挑戰。';
  recordWin(progress, entry.id, earned, moves); save(); updateProgressUI();
  journey.renderSummary(); journey.renderChoice($('winFriends'), entry);
  setMessage('每個願望都完成了！這就是剛剛好的小家。');
  playTone([523,659,784]);
  $('winStars').innerHTML = starsHTML(earned);
  $('winStars').setAttribute('aria-label', `本次獲得 ${earned} 顆星`);
  $('winTitle').textContent = earned === 3 ? '剛剛好，三顆星！' : '小願望，都實現了！';
  $('winText').textContent = `${entry.name} · 用了 ${moves} 次調整`;
  $('starChecklist').innerHTML = [[true,'所有住戶都舒服'],[moves <= entry.par,`${entry.par} 次內完成`],[!usedHint,'沒有使用提示']].map(([ok, text]) => `<span class="${ok ? 'done' : ''}"><b>${ok ? '★' : '☆'}</b>${text}</span>`).join('');
  const unlocked = !wasComplete && chapterComplete(progress.best, entry.chapter), chapter = CHAPTERS[entry.chapter];
  $('rewardNotice').hidden = !unlocked;
  $('rewardNotice').innerHTML = unlocked ? `${icon(chapter.rewardIcon)}<span><small>收到鄰居的新禮物</small><b>${chapter.reward}</b></span>` : '';
  const next = LEVELS[level + 1];
  $('nextPreview').innerHTML = next ? `<small>接下來的小願望</small><b>${next.name}</b><span>${next.reveal ? KINDS[next.reveal].intro : CHAPTERS[next.chapter].subtitle}</span>` : '<b>整條街都亮起來了。</b><span>回到地圖，看看你收集的小小幸福。</span>';
  $('next').textContent = next ? '去拜訪下一位鄰居 →' : '回到我的街區 →';
  $('retry').textContent = earned < 3 ? '再試一次，挑戰三顆星' : '再玩一次';
  winTimer = setTimeout(() => openDialog($('win')), 850);
}
function showMap() {
  clearTimeout(winTimer);
  $('mapContent').replaceChildren();
  CHAPTERS.forEach((chapter, c) => {
    const section = document.createElement('section'); section.className = `map-chapter ${chapter.theme}`;
    section.innerHTML = `<div class="map-chapter-title">${icon(chapter.icon)}<div><h3>${chapter.name}</h3><small>${chapter.subtitle}</small></div></div><div class="level-grid"></div>`;
    LEVELS.forEach((entry, index) => {
      if (entry.chapter !== c) return;
      const button = document.createElement('button'), best = progress.best[entry.id];
      button.className = `level-tile ${index === level ? 'selected' : ''}`;
      button.innerHTML = `<span class="tile-number">${String(index + 1).padStart(2,'0')}</span><span class="tile-name">${entry.name}</span><span class="tiny-stars">${starsHTML(best?.stars || 0)}</span>${entry.reveal ? `<small>新願望 · ${KINDS[entry.reveal].short}</small>` : '<small>點一下開始</small>'}`;
      button.onclick = () => load(index);
      section.querySelector('.level-grid').appendChild(button);
    });
    $('mapContent').appendChild(section);
  });
  openDialog($('map'));
}
function showCollection() {
  clearTimeout(winTimer);
  $('collectionContent').innerHTML = CHAPTERS.map((chapter, c) => {
    const completed = LEVELS.filter(l => l.chapter === c && progress.best[l.id]).length;
    const unlocked = chapterComplete(progress.best, c);
    return `<div class="collection-item ${unlocked ? 'unlocked' : ''}">${icon(chapter.rewardIcon)}<div><small>${chapter.name} · ${completed}/4 個小家</small><h3>${chapter.reward}</h3><p>${unlocked ? '鄰居的小心意，已經收到 ♥' : '完成這個街區，就能收到禮物。'}</p></div></div>`;
  }).join('');
  openDialog($('collection'));
}
function frame(time) {
  if (active) {
    active.changed = advance(state, active.room, Math.min((time - lastFrame) / 1000, .04)) || active.changed;
    lastFrame = time; render();
  }
  requestAnimationFrame(frame);
}
$('undo').onclick = () => {
  stop(false); clearTimeout(winTimer);
  if (!history.length) return;
  const previous = history.pop(); state = previous.state; moves = previous.moves; won = false;
  clearHint(); lastHappy = []; setMessage('回到剛才。這次，試一個不同的順序。'); render();
};
$('reset').onclick = () => load(level);
$('hint').onclick = () => {
  if (won) { clearTimeout(winTimer); openDialog($('win')); return; }
  clearHint(); usedHint = true;
  const plan = suggestPlan(state, goals);
  if (!plan) { setMessage('可以先復原，換個順序試試。太空的貓窩要把空間分給鄰居。'); render(); return; }
  const room = plan.rooms[0], row = Math.floor(room / 2), floor = row === 0 ? '最上層' : row === state.heights.length - 1 ? '最下層' : '中間層';
  $('board').children[room].classList.add('hinted');
  setMessage(`試著微調發光的房間（${state.heights.length === 1 ? '' : floor}${room % 2 ? '右邊' : '左邊'}）。留意其他鄰居的願望。`);
  render();
};
$('next').onclick = () => { if (level + 1 < LEVELS.length) load(level + 1); else showMap(); };
$('retry').onclick = () => load(level);
$('stay').onclick = () => { $('win').close(); setMessage('這是你安排好的小家。可以到地圖拜訪其他鄰居。'); };
$('mapButton').onclick = showMap; $('nextTeaser').onclick = showMap;
$('collectionButton').onclick = showCollection;
$('helpButton').onclick = () => { clearTimeout(winTimer); openDialog($('help')); };
$('discoveryGo').onclick = () => { const kind = LEVELS[level].reveal; if (kind && !progress.seen.includes(kind)) { progress.seen.push(kind); save(); } $('discovery').close(); };
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('close', () => {
    if (document.querySelector('dialog[open]')) return;
    const el = dialogFocus.get(dialog);
    const target = el?.isConnected && el.getClientRects().length ? el : document.querySelector('.bottom-nav [aria-current=page]');
    target?.focus({ preventScroll: true });
  });
  dialog.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => dialog.close(); });
}
function playTone(frequencies) { audio.effect(frequencies); }
window.addEventListener('pointerup', event => { if (active?.pointerId === event.pointerId) stop(); });
window.addEventListener('blur', () => stop(false));
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(false); });
window.addEventListener('resize', render);
const journey = setupJourney({
  progress, save, openDialog, audio,
  stopGame: () => { stop(false); clearTimeout(winTimer); },
  continueIndex: () => state && !won ? level : journeyIndex(progress),
  continueGame: () => {
    if (state && !won) { journey.showGame(); document.body.dataset.theme = CHAPTERS[LEVELS[level].chapter].theme; render(); }
    else load(journeyIndex(progress));
  }
});
updateProgressUI(); requestAnimationFrame(frame);
