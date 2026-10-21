import { LEVELS, CHAPTERS } from './engine.js';
import { icon, animalArt } from './art.js';
import { PETS, ADOPTION_GOAL, FURNITURE, residentsFor, affection, pendingChoices, chooseFriend, adopt, unlockedFurniture, placeFurniture, removeFurniture } from './pets.js';
const $ = id => document.getElementById(id);

export function setupJourney({ progress, save, continueGame, continueIndex, openDialog, stopGame, audio }) {
  let editing = false, selected = 'cushion', removing = false, careTimer;
  const friendLabel = id => `${PETS[id].name}・${PETS[id].species}`;
  function showView(name) {
    stopGame();
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    for (const view of ['home','game','pet']) $(`${view}View`).hidden = view !== name;
    for (const [id, view] of [['navHome','home'],['navJourney','game'],['navPetHome','pet']]) {
      if (view === name) $(id).setAttribute('aria-current', 'page'); else $(id).removeAttribute('aria-current');
    }
    if (name !== 'game') document.body.dataset.theme = 'sunny';
    audio.activate();
    window.scrollTo({ top: 0, behavior: 'auto' });
    // Move focus out of the hidden view, including when leaving a dialog.
    requestAnimationFrame(() => $(name === 'home' ? 'navHome' : name === 'game' ? 'navJourney' : 'navPetHome').focus({ preventScroll: true }));
  }
  function renderSummary() {
    const pending = pendingChoices(progress), index = continueIndex(), entry = LEVELS[index];
    $('completedCount').textContent = Object.keys(progress.best).length;
    $('adoptedCount').textContent = progress.adopted.length;
    $('furnitureCount').textContent = unlockedFurniture(progress).length;
    $('continueChapter').textContent = `${CHAPTERS[entry.chapter].name} · 第 ${index + 1} 關`;
    $('continueTitle').textContent = Object.keys(progress.best).length === LEVELS.length ? '再訪鄰居，收集星星' : `繼續旅程 · ${entry.name}`;
    $('pendingFriends').hidden = !pending.length;
    $('pendingFriends').textContent = `♡ 還有 ${pending.length} 份通關心意，等你選位朋友 →`;
    $('homeStory').textContent = progress.activePet ? `${PETS[progress.activePet].name}正在家裡等你，今天想一起做什麼？` : '有些緣分，從隔壁的一聲你好開始。';
    $('albumInbox').hidden = !pending.length;
    $('albumInbox').textContent = `補選 ${pending.length} 份通關心意 →`;
    $('heroAnimals').innerHTML = ['rabbit','dog','cat','bear'].map(id => `<span>${animalArt(id)}</span>`).join('');
    syncAudioUI();
  }
  function showHome() { showView('home'); renderSummary(); }
  function adoptFriend(id, container, entry) {
    if (!adopt(progress, id)) return;
    save(); audio.effect([523,659,784,1046]); renderSummary();
    if (entry) renderChoice(container, entry); else renderFriends();
  }
  function renderFriends() {
    $('friendCards').replaceChildren();
    Object.entries(PETS).forEach(([id, pet]) => {
      const count = affection(progress, id), adopted = progress.adopted.includes(id), ready = count >= ADOPTION_GOAL;
      const card = document.createElement('article'); card.className = 'friend-card'; card.style.setProperty('--pet-color', pet.color);
      card.innerHTML = `<div class="friend-portrait">${animalArt(id)}</div><div class="friend-details"><h3>${friendLabel(id)}</h3><p>${pet.note}</p><div class="friend-hearts" aria-label="${count} 次好感">${Array.from({ length: ADOPTION_GOAL }, (_, n) => `<span class="${n < count ? 'filled' : ''}">♥</span>`).join('')}</div><small>${adopted ? '已經是一家人了' : `${Math.min(count, ADOPTION_GOAL)} / ${ADOPTION_GOAL} 次好感${ready ? ' · 可以領養囉！' : ''}`}</small></div>`;
      if (ready || adopted) {
        const action = document.createElement('button'); action.className = 'primary'; action.textContent = adopted ? `回家陪${pet.name} →` : `邀請${pet.name}回家 ♡`;
        action.onclick = () => { if (!adopted) adoptFriend(id); progress.activePet = id; save(); showPetHome(); };
        card.append(action);
      }
      $('friendCards').append(card);
    });
  }
  function showFriends() { renderFriends(); renderSummary(); openDialog($('friends')); }
  function renderChoice(container, entry) {
    const chosen = progress.choices[entry.id];
    const allFull = residentsFor(entry).every(id => affection(progress, id) >= ADOPTION_GOAL);
    if (container.id === 'pendingChoiceContent') {
      $('nextPending').disabled = !chosen && !allFull;
      $('nextPending').textContent = !chosen && !allFull ? '先選一位喜歡的朋友' : pendingChoices(progress).length ? '下一份心意 →' : '回到動物手帳 →';
    }
    container.replaceChildren();
    const heading = document.createElement('h3'); heading.textContent = !chosen && allFull ? '住戶們都和你很親近了' : chosen ? '今天，又靠近了一點' : '想和哪位住戶更熟一點？'; container.append(heading);
    const description = document.createElement('p');
    description.textContent = !chosen && allFull ? '這一關的住戶都已集滿好感，到動物手帳邀請牠們回家吧。' : chosen ? `${PETS[chosen].name}收到你的心意了。這一關的好感已領取。` : `${entry.name} · 選一位，好感 +1。每關限一次，可稍後從首頁補選。`;
    container.append(description);
    const choices = document.createElement('div'); choices.className = 'animal-choices';
    (chosen ? [chosen] : residentsFor(entry)).forEach(id => {
      const count = affection(progress, id), button = document.createElement('button'); button.className = 'animal-choice'; button.disabled = !!chosen || count >= ADOPTION_GOAL;
      button.innerHTML = `${animalArt(id)}<b>${PETS[id].name}</b><small>${count >= ADOPTION_GOAL ? '好感已滿' : PETS[id].species} · ${Math.min(count, ADOPTION_GOAL)}/${ADOPTION_GOAL} ♡</small>`;
      button.setAttribute('aria-label', `${chosen ? '已選擇' : '選擇'}${friendLabel(id)}，好感 ${count} 次`);
      button.onclick = () => { if (chooseFriend(progress, entry.id, id)) { save(); audio.effect([659,784]); renderSummary(); renderChoice(container, entry); } };
      choices.append(button);
    });
    container.append(choices);
    if (!chosen && allFull) {
      const button = document.createElement('button'); button.className = 'secondary'; button.textContent = '翻開動物手帳 →'; button.onclick = showFriends; container.append(button);
    }
    if (chosen && affection(progress, chosen) >= ADOPTION_GOAL) {
      const button = document.createElement('button'); button.className = 'primary';
      button.textContent = progress.adopted.includes(chosen) ? `回家看看${PETS[chosen].name} →` : `集滿 5 次！領養${PETS[chosen].name} ♡`;
      button.onclick = () => { if (!progress.adopted.includes(chosen)) adoptFriend(chosen, container, entry); progress.activePet = chosen; save(); showPetHome(); };
      container.append(button);
    }
  }
  function showPending() {
    const entry = pendingChoices(progress)[0];
    if (!entry) { showFriends(); return; }
    renderChoice($('pendingChoiceContent'), entry);
    openDialog($('friendChoice'));
  }
  function showPetHome() { showView('pet'); renderPetHome(); }
  function renderPetHome() {
    const hasPet = !!progress.activePet;
    $('homeLocked').hidden = hasPet; $('homeUnlocked').hidden = !hasPet;
    $('petHomeSubtitle').textContent = hasPet ? `${PETS[progress.activePet].name}的小家 · 佈置與陪伴，都照你的步調。` : '替未來的家人，留一點溫柔的空間。';
    if (!hasPet) return;
    $('petTabs').replaceChildren();
    progress.adopted.forEach(id => {
      const button = document.createElement('button'); button.innerHTML = `${animalArt(id)}<span>${PETS[id].name}</span>`;
      button.setAttribute('aria-pressed', String(id === progress.activePet));
      button.onclick = () => { progress.activePet = id; save(); renderPetHome(); care('pet'); };
      $('petTabs').append(button);
    });
    $('homePet').innerHTML = animalArt(progress.activePet);
    $('homePet').setAttribute('aria-label', `摸摸${PETS[progress.activePet].name}`);
    $('petRoom').dataset.palette = progress.home.palette;
    $('petRoom').classList.toggle('editing', editing);
    $('editRoom').textContent = editing ? '完成布置 ✓' : '開始布置';
    $('editRoom').setAttribute('aria-pressed', String(editing));
    $('removeItem').hidden = !editing;
    document.querySelectorAll('[data-care]').forEach(button => { button.disabled = editing; });
    $('homePet').disabled = editing;
    $('removeItem').setAttribute('aria-pressed', String(removing));
    $('decorHint').textContent = !editing ? '家具與配色會自動儲存。先點「開始布置」試試。' : removing ? '點地板上的家具，就能收回架上。' : `已選：${FURNITURE.find(f => f.id === selected)?.name || '柔軟坐墊'}。點一格擺放；同一件可換位置。`;
    $('floorGrid').replaceChildren();
    for (let slot = 0; slot < 9; slot++) {
      const placement = progress.home.placements.find(p => p.slot === slot), item = placement && FURNITURE.find(f => f.id === placement.id);
      const tile = document.createElement('button'); tile.className = 'floor-tile'; tile.disabled = !editing;
      tile.innerHTML = item ? icon(item.icon) : '<span>＋</span>';
      tile.setAttribute('aria-label', `第 ${Math.floor(slot / 3) + 1} 列第 ${slot % 3 + 1} 格，${item ? item.name : '空位'}${editing ? removing ? '，點擊收回' : '，點擊擺放' : ''}`);
      tile.onclick = () => { if (removing) removeFurniture(progress, slot); else placeFurniture(progress, selected, slot); save(); renderPetHome(); audio.effect([523]); };
      $('floorGrid').append(tile);
    }
    $('furnitureShelf').replaceChildren();
    const unlocked = unlockedFurniture(progress);
    FURNITURE.forEach(item => {
      const available = unlocked.some(f => f.id === item.id), button = document.createElement('button');
      button.className = 'shelf-item'; button.disabled = !available;
      button.innerHTML = `${icon(item.icon)}<span>${item.name}</span><small>${available ? progress.home.placements.some(p => p.id === item.id) ? '已擺放 · 可移動' : '可以擺放' : `完成${CHAPTERS[item.chapter].name}`}</small>`;
      button.setAttribute('aria-pressed', String(editing && !removing && selected === item.id));
      button.onclick = () => { selected = item.id; removing = false; editing = true; renderPetHome(); };
      $('furnitureShelf').append(button);
    });
    document.querySelectorAll('[data-palette]').forEach(button => { if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.palette === progress.home.palette)); });
  }
  function care(action) {
    if (!progress.activePet || editing) return;
    const name = PETS[progress.activePet].name;
    $('petBubble').textContent = { pet: `${name}靠過來蹭蹭你的手。♡`, feed: `${name}吃了一口點心，心滿意足。`, play: `${name}跳起來接住了小球！` }[action];
    $('petRoom').dataset.care = action; clearTimeout(careTimer);
    audio.effect(action === 'play' ? [523,784,659] : [523,659]);
    careTimer = setTimeout(() => { delete $('petRoom').dataset.care; $('petBubble').textContent = '今天，也很高興見到你。'; }, 2800);
  }
  function syncAudioUI() {
    $('musicToggle').checked = progress.audio.music; $('effectsToggle').checked = progress.audio.effects;
    $('volume').value = progress.audio.volume * 100; $('volumeLabel').textContent = `${Math.round(progress.audio.volume * 100)}%`;
    $('homeMusic').textContent = progress.audio.music ? '♫ 輕音樂已開啟 · 點此暫停' : '♪ 開啟輕音樂，坐一會兒';
    $('sound').textContent = progress.audio.music || progress.audio.effects ? '♫' : '♪';
  }
  function audioChanged() { save(); syncAudioUI(); audio.activate(); }
  $('continueJourney').onclick = continueGame;
  $('navHome').onclick = showHome;
  $('navJourney').onclick = continueGame;
  $('navFriends').onclick = $('homeFriends').onclick = $('meetFriends').onclick = showFriends;
  $('navPetHome').onclick = $('homeDecor').onclick = showPetHome;
  $('pendingFriends').onclick = $('albumInbox').onclick = $('nextPending').onclick = showPending;
  $('homePet').onclick = () => care('pet');
  document.querySelectorAll('[data-care]').forEach(button => { button.onclick = () => care(button.dataset.care); });
  $('editRoom').onclick = () => { editing = !editing; removing = false; renderPetHome(); };
  $('removeItem').onclick = () => { removing = !removing; renderPetHome(); };
  document.querySelectorAll('button[data-palette]').forEach(button => { button.onclick = () => { progress.home.palette = button.dataset.palette; save(); renderPetHome(); }; });
  $('sound').onclick = () => { syncAudioUI(); openDialog($('audioSettings')); };
  $('musicToggle').onchange = () => { progress.audio.music = $('musicToggle').checked; audioChanged(); };
  $('effectsToggle').onchange = () => { progress.audio.effects = $('effectsToggle').checked; audioChanged(); audio.effect([523,659]); };
  $('volume').oninput = () => { progress.audio.volume = Number($('volume').value) / 100; save(); syncAudioUI(); audio.sync(); };
  $('homeMusic').onclick = () => { progress.audio.music = !progress.audio.music; audioChanged(); };
  renderSummary();
  return { showHome, showGame: () => showView('game'), showPetHome, renderSummary, renderChoice };
}
