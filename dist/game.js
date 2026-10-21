import { LEVELS, createState, cloneState, targetsFor, areas, comfort, isSolved, advance, suggestPlan } from './engine.js';

const $ = id => document.getElementById(id);
const COLORS = ['#e7d7bb', '#d9e4c7', '#d3dfdc', '#eacfc1', '#dfd8e8', '#e6dfa9'];
const NAMES = ['奶茶之家', '薄荷之家', '雲朵之家', '蜜桃之家', '薰衣草之家', '布丁之家'];
const STORAGE_KEY = 'borrow-space-v1';
let level = 0, state, targets, history = [], moves = 0;
let active = null, won = false, lastFrame = 0, winTimer;
let soundOn = false, audioContext, dialogReturnFocus;
let progress = readProgress();

function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!value || typeof value !== 'object') return { current: 0, best: {} };
    const best = {};
    for (const entry of LEVELS) {
      const score = value.best?.[entry.id];
      if (Number.isInteger(score) && score > 0) best[entry.id] = score;
    }
    return { current: Number.isInteger(value.current) ? Math.max(0, Math.min(LEVELS.length - 1, value.current)) : 0, best };
  } catch { return { current: 0, best: {} }; }
}
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
  catch { $('saveStatus').textContent = '此瀏覽器無法儲存進度，仍可繼續遊玩。'; }
}
function face(happy, index) {
  return `<svg class="creature" viewBox="0 0 40 48" aria-hidden="true"><path d="M6 19 Q2 4 11 6 L17 11 Q24 8 29 12 Q39 9 36 21 L37 34 Q37 44 26 44 L13 44 Q3 44 4 34Z" fill="${['#fff9e8', '#fffdf3', '#f5f2df'][index % 3]}"/><ellipse cx="12" cy="30" rx="3" ry="2" fill="#ecc4b2"/><ellipse cx="29" cy="30" rx="3" ry="2" fill="#ecc4b2"/><circle cx="15" cy="25" r="1.4" fill="#52614c"/><circle cx="26" cy="25" r="1.4" fill="#52614c"/><path d="${happy ? 'M17 31 Q21 36 25 31' : 'M17 33 Q21 29 25 33'}" fill="none" stroke="#52614c" stroke-width="1.5" stroke-linecap="round"/></svg>`;
}
function clearHint() { document.querySelectorAll('.hinted').forEach(el => el.classList.remove('hinted')); }
function stop() {
  if (!active) return;
  const previous = active;
  active = null;
  // A quick tap is a deliberate fine adjustment, also useful with assistive input.
  if (!previous.changed && !won) advance(state, previous.room, .035);
  document.querySelectorAll('.holding').forEach(el => el.classList.remove('holding'));
  render();
}
function start(room, pointerId = null) {
  if (won || active || document.querySelector('dialog[open]')) return;
  clearHint();
  history.push({ state: cloneState(state), moves });
  if (history.length > 100) history.shift();
  moves++;
  active = { room, pointerId, changed: false };
  $('board').children[room].classList.add('holding');
  lastFrame = performance.now();
  render();
}
function load(index) {
  stop();
  clearTimeout(winTimer);
  level = index;
  state = createState(LEVELS[level]);
  targets = targetsFor(LEVELS[level]);
  won = false; moves = 0; history = [];
  progress.current = level;
  saveProgress();
  if ($('win').open) $('win').close();
  $('levelLabel').textContent = `${String(level + 1).padStart(2, '0')} / ${LEVELS[level].name}`;
  $('levelSelect').setAttribute('aria-label', `選擇關卡，目前第 ${level + 1} 關，共 ${LEVELS.length} 關`);
  $('dots').innerHTML = LEVELS.map((entry, i) => `<i class="${i === level ? 'current' : progress.best[entry.id] ? 'complete' : ''}"></i>`).join('');
  $('message').textContent = LEVELS[level].tip;
  $('board').replaceChildren();
  for (let room = 0; room < targets.length; room++) {
    const button = document.createElement('button');
    button.className = 'room';
    button.type = 'button';
    button.dataset.room = room;
    button.style.setProperty('--room', COLORS[room]);
    button.innerHTML = `<span class="room-name">${NAMES[room]}</span><div class="occupants"></div><span class="mood"></span>`;
    button.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary || active || won) return;
      event.preventDefault();
      button.focus({ preventScroll: true });
      button.setPointerCapture(event.pointerId);
      start(room, event.pointerId);
    });
    const release = event => { if (active?.pointerId === event.pointerId) stop(); };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    button.addEventListener('keydown', event => {
      if (event.code !== 'Space' && event.code !== 'Enter') return;
      event.preventDefault();
      if (!event.repeat) start(room);
    });
    button.addEventListener('keyup', event => {
      if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); stop(); }
    });
    // Screen reader activation may dispatch click without pointer/key events.
    button.addEventListener('click', event => { if (event.detail === 0 && !active && !won) { start(room); stop(); } });
    button.addEventListener('blur', stop);
    $('board').appendChild(button);
  }
  render();
}
function render() {
  if (!state) return;
  const roomAreas = areas(state), flags = comfort(state, targets);
  const boardWidth = $('board').clientWidth;
  let top = 0;
  for (let row = 0; row < state.heights.length; row++) {
    for (let side = 0; side < 2; side++) {
      const room = row * 2 + side;
      const button = $('board').children[room];
      const fraction = side ? 1 - state.widths[row] : state.widths[row];
      button.style.left = `${(side ? state.widths[row] : 0) * 100}%`;
      button.style.top = `${top * 100}%`;
      button.style.width = `${fraction * 100}%`;
      button.style.height = `${state.heights[row] * 100}%`;
      button.classList.toggle('unhappy', !flags[room]);
      const count = LEVELS[level].counts[room];
      const occupants = button.querySelector('.occupants');
      // Compact to one representative when the room is too small for a group.
      const compact = fraction * boardWidth < 110 || state.heights[row] * $('board').clientHeight < 90;
      const key = `${flags[room]}-${compact}`;
      if (occupants.dataset.key !== key) {
        occupants.dataset.key = key;
        occupants.innerHTML = compact ? `${face(flags[room], 0)}<span class="resident-count">×${count}</span>` : Array.from({ length: count }, (_, i) => face(flags[room], i)).join('');
      }
      const ratio = Math.min(100, Math.round(roomAreas[room] / targets[room] * 100));
      button.querySelector('.mood').innerHTML = `<span>${flags[room] ? '✓ 舒服' : '有點擠'}</span><span class="mood-bar"><i style="width:${ratio}%"></i></span>`;
      button.setAttribute('aria-label', `${NAMES[room]}，${count} 位住戶，${flags[room] ? '舒服了' : `有點擠，空間 ${ratio}%`}。按住或輕點借空間。`);
    }
    top += state.heights[row];
  }
  const happy = flags.filter(Boolean).length;
  const status = `${happy} / ${flags.length} 個小家舒服了`;
  if ($('happyCount').textContent !== status) $('happyCount').textContent = status;
  $('actions').textContent = `${moves} 次調整`;
  $('undo').disabled = !history.length;
  const best = progress.best[LEVELS[level].id];
  $('best').textContent = best ? `個人最佳 ${best} 次` : '每次放手算一次調整';
  if (flags.every(Boolean) && !won) finish();
}
function finish() {
  won = true;
  stop();
  const entry = LEVELS[level];
  const oldBest = progress.best[entry.id];
  progress.best[entry.id] = Math.min(oldBest ?? Infinity, moves);
  saveProgress();
  $('message').textContent = '剛剛好！每一個小家都有足夠的空間。';
  chime();
  $('winText').textContent = `你用了 ${moves} 次調整，讓 ${entry.counts.reduce((sum, count) => sum + count, 0)} 位住戶都露出微笑。`;
  $('winBest').textContent = !oldBest || moves < oldBest ? '✧ 新的個人最佳' : `個人最佳：${oldBest} 次調整`;
  $('next').textContent = level === LEVELS.length - 1 ? '完成了！回到關卡地圖 →' : '下一個小家 →';
  winTimer = setTimeout(() => openDialog($('win')), 650);
}
function frame(time) {
  if (active) {
    const changed = advance(state, active.room, Math.min((time - lastFrame) / 1000, .04));
    active.changed ||= changed;
    lastFrame = time;
    render();
  }
  requestAnimationFrame(frame);
}
function openDialog(dialog) {
  stop();
  dialogReturnFocus = document.activeElement;
  if (!dialog.open) dialog.showModal();
}
function showLevels() {
  $('levelGrid').replaceChildren();
  LEVELS.forEach((entry, index) => {
    const button = document.createElement('button');
    button.className = `level-tile ${index === level ? 'selected' : ''}`;
    button.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><b>${entry.name}</b><small>${progress.best[entry.id] ? `✓ 最佳 ${progress.best[entry.id]} 次` : '點一下開始'}</small>`;
    button.onclick = () => { $('levels').close(); load(index); $('board').children[0].focus({ preventScroll: true }); };
    $('levelGrid').appendChild(button);
  });
  openDialog($('levels'));
}
$('undo').onclick = () => {
  stop(); clearTimeout(winTimer);
  if (!history.length) return;
  const previous = history.pop();
  state = previous.state; moves = previous.moves; won = false;
  if ($('win').open) $('win').close();
  clearHint();
  $('message').textContent = '回到剛才。這次換個順序試試。';
  render();
};
$('reset').onclick = () => load(level);
$('hint').onclick = () => {
  if (won) { clearTimeout(winTimer); openDialog($('win')); return; }
  clearHint();
  const plan = suggestPlan(state, targets);
  if (!plan) { $('message').textContent = '試著先向空間較多的小家借一點；也可以復原，換個順序。'; return; }
  const room = plan.rooms[0];
  $('board').children[room].classList.add('hinted');
  $('message').textContent = `試著輕輕調整「${NAMES[room]}」。${plan.rooms.some(next => next !== room) ? '有時先借給鄰居，才能把空間傳過去。' : '留意表情，剛舒服時就可以放手。'}`;
};
$('next').onclick = () => { $('win').close(); if (level === LEVELS.length - 1) showLevels(); else load(level + 1); };
$('stay').onclick = () => { $('win').close(); $('message').textContent = '這是你安排好的小家。按「小提示」可回到過關畫面。'; $('reset').focus(); };
$('levelSelect').onclick = showLevels;
$('helpButton').onclick = () => openDialog($('help'));
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('close', () => { if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus({ preventScroll: true }); });
  dialog.querySelectorAll('[data-close]').forEach(button => { button.onclick = () => dialog.close(); });
}
$('sound').onclick = () => {
  soundOn = !soundOn;
  $('sound').textContent = soundOn ? '♫' : '♪';
  $('sound').setAttribute('aria-label', soundOn ? '關閉音效' : '開啟音效');
  $('sound').setAttribute('aria-pressed', String(soundOn));
  if (soundOn) chime();
};
function chime() {
  if (!soundOn) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume().catch(() => {});
    [523.25, 659.25, 783.99].forEach((frequency, i) => {
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      const time = audioContext.currentTime + i * .12;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(.06, time + .02);
      gain.gain.exponentialRampToValueAtTime(.001, time + .5);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(time); oscillator.stop(time + .5);
    });
  } catch { /* Sound is optional; unsupported audio never blocks gameplay. */ }
}
window.addEventListener('pointerup', event => { if (active?.pointerId === event.pointerId) stop(); });
window.addEventListener('blur', stop);
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
window.addEventListener('resize', render);
load(progress.current);
requestAnimationFrame(frame);
