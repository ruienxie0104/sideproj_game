/** Original procedural score: a gentle 16-bar music-box waltz. */
export function createAudio(settings, onError = () => {}) {
  let context, master, musicBus, effectsBus, timer, nextBeat = 0, beat = 0, activated = false;
  const melody = [76,79,83,81,79,76,74,76,79,76,74,71,72,76,79,81,79,76,74,71,69,71,74,76,79,83,86,83,81,79,76,74,72,76,79,76,74,72,71,74,78,81,78,74,71,74,76,0];
  const roots = [48,48,45,45,41,41,43,43,48,48,45,45,41,43,43,48];
  function note(midi, time, length, strength, type = 'sine', bus = musicBus) {
    if (!midi) return;
    const oscillator = context.createOscillator(), envelope = context.createGain();
    oscillator.type = type; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0, time); envelope.gain.linearRampToValueAtTime(strength, time + .025);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + length);
    oscillator.connect(envelope); envelope.connect(bus); oscillator.start(time); oscillator.stop(time + length + .03);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }
  function schedule() {
    if (!settings.music || document.hidden || context?.state !== 'running') return;
    if (nextBeat < context.currentTime - .2) nextBeat = context.currentTime + .03;
    while (nextBeat < context.currentTime + .16) {
      const index = beat % melody.length;
      note(melody[index], nextBeat, .85, .055);
      note(roots[Math.floor(index / 3)] + (index % 3 === 0 ? 0 : index % 3 === 1 ? 7 : 12), nextBeat, 1.25, .028, 'triangle');
      beat++; nextBeat += .48;
    }
  }
  async function activate() {
    activated = true;
    try {
      if (!context && (settings.music || settings.effects)) {
        context = new (window.AudioContext || window.webkitAudioContext)(); master = context.createGain(); master.connect(context.destination);
        musicBus = context.createGain(); effectsBus = context.createGain(); musicBus.connect(master); effectsBus.connect(master);
      }
      if (context && !document.hidden) await context.resume();
      sync();
    } catch { onError(); }
  }
  function sync() {
    if (!context) return;
    master.gain.setTargetAtTime(settings.volume, context.currentTime, .08);
    musicBus.gain.setTargetAtTime(settings.music ? 1 : 0, context.currentTime, .08);
    effectsBus.gain.setTargetAtTime(settings.effects ? 1 : 0, context.currentTime, .03);
    if (document.hidden || !settings.music || context.state !== 'running') { clearInterval(timer); timer = undefined; }
    if (document.hidden || (!settings.music && !settings.effects)) { context.suspend().catch(onError); return; }
    // Volume changes and navigation must not layer a second scheduler or restart a beat.
    if (settings.music && context.state === 'running' && timer === undefined) {
      nextBeat = context.currentTime + .05; schedule(); timer = setInterval(schedule, 100);
    }
  }
  function effect(frequencies) {
    if (!settings.effects || !context || context.state !== 'running' || document.hidden) return;
    frequencies.forEach((frequency, i) => note(69 + 12 * Math.log2(frequency / 440), context.currentTime + i * .1, .3, .07, 'sine', effectsBus));
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) sync(); else if (activated && (settings.music || settings.effects)) activate(); });
  window.addEventListener('pagehide', () => { clearInterval(timer); timer = undefined; context?.suspend().catch(() => {}); });
  window.addEventListener('pageshow', event => { if (event.persisted && activated && (settings.music || settings.effects)) activate(); });
  return { activate, sync, effect };
}
