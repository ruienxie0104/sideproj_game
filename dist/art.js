/** Original vector art, drawn in code. No external assets or fonts. */
const wrap = (body, cls = '') => `<svg class="${cls}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
export function icon(name, cls = '') {
  const drawings = {
    home: '<path d="m10 45 40-32 40 32v40H59V60H41v25H18V45" fill="#9AB39B" stroke="#557B65" stroke-width="4" stroke-linejoin="round"/><path d="m8 45 42-33 42 33" stroke="#C58D75" stroke-width="8" stroke-linecap="round"/>',
    heart: '<path d="M50 84 15 50C-5 25 28 3 50 29 72 3 105 25 85 50Z" fill="#D9908B"/>',
    shell: '<path d="M50 84 13 52C-4 7 104 7 87 52Z" fill="#F1C5AA" stroke="#D99A87" stroke-width="3"/><path d="m50 79-22-44m22 44L40 27m10 52 10-52M50 79l22-44" stroke="#FFF0DA" stroke-width="4"/>',
    cloud: '<path d="M23 76C0 76 0 40 23 40c-3-29 45-36 51-6 31-4 37 42 6 42Z" fill="#FDF6E7" stroke="#B7C8CE" stroke-width="3"/><path d="m36 82-4 9m21-9-4 9m21-9-4 9" stroke="#B2CBD1" stroke-width="4" stroke-linecap="round"/>',
    tea: '<ellipse cx="50" cy="67" rx="41" ry="16" fill="#BE936F"/><path d="M21 69v19m58-19v19" stroke="#9B765B" stroke-width="6"/><ellipse cx="50" cy="61" rx="41" ry="16" fill="#EDC99A"/><path d="M30 35h25v17q-12 13-25 0Z" fill="#FFFAED"/><path d="M55 38c17-4 15 15 0 10M36 27q-5-5 0-10m10 10q-5-5 0-10" stroke="#E3D5BC" stroke-width="3" stroke-linecap="round"/><ellipse cx="71" cy="54" rx="11" ry="5" fill="#FFF4D9"/><circle cx="70" cy="49" r="7" fill="#C5915D"/>',
    rug: '<ellipse cx="50" cy="58" rx="44" ry="27" fill="#8CB5B0"/><ellipse cx="50" cy="56" rx="36" ry="20" stroke="#E8E6CC" stroke-width="3"/><path d="m25 56 12-9 13 9 13-9 12 9-12 9-13-9-13 9Z" stroke="#D9DFCA" stroke-width="2"/>',
    cushion: '<path d="M20 34q30-12 60 0l6 37q-34 18-72 0Z" fill="#D7B1A6" stroke="#B88D85" stroke-width="2"/><path d="M24 39q27-9 52 0l5 28q-30 12-62 0Z" stroke="#EED0BB" stroke-width="2" stroke-dasharray="3 3"/><circle cx="50" cy="54" r="4" fill="#B88D85"/>',
    bed: '<path d="M12 50q38-34 76 0v25q-38 22-76 0Z" fill="#9DA9C4"/><ellipse cx="50" cy="53" rx="38" ry="23" fill="#CBD2E1"/><ellipse cx="50" cy="53" rx="29" ry="15" fill="#F6EDDD"/><path d="M29 50q-7-14 4-14 4-10 12-3 12-7 15 5 14 2 7 12Z" fill="#FFFCF0"/><path d="M17 77v8m66-8v8" stroke="#8B7C72" stroke-width="5"/>',
    sun: '<circle cx="50" cy="50" r="23" fill="#F7BE52"/><path d="M50 9v10m0 62v10M9 50h10m62 0h10M21 21l7 7m44 44 7 7M21 79l7-7m44-44 7-7" stroke="#F7BE52" stroke-width="6" stroke-linecap="round"/>',
    leaf: '<path d="M77 14C22 13 10 43 28 68c22 26 58 6 49-54Z" fill="#81B791"/><path d="m26 84 40-54M43 60l-6-21m16 10 18 1" stroke="#376D60" stroke-width="5" stroke-linecap="round"/>',
    moon: '<path d="M70 18A35 35 0 1 0 82 72 33 33 0 0 1 70 18Z" fill="#F9D784"/><path d="m77 33 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#FFF2C0"/>',
    star: '<path d="m50 9 12 26 29 4-21 21 5 30-25-14-25 14 5-30L9 39l29-4Z" fill="currentColor"/>',
    sofa: '<path d="M20 55V39q0-12 12-12h36q12 0 12 12v16" fill="#EBA487"/><rect x="20" y="48" width="60" height="28" rx="9" fill="#D47E6C"/><rect x="10" y="45" width="17" height="33" rx="8" fill="#F4BA9E"/><rect x="73" y="45" width="17" height="33" rx="8" fill="#F4BA9E"/><path d="M25 78v7m50-7v7" stroke="#91685C" stroke-width="5" stroke-linecap="round"/><path d="M36 48V35m28 13V35" stroke="#CD806C" stroke-width="2"/>',
    plant: '<path d="M50 66V20" stroke="#608C62" stroke-width="5" stroke-linecap="round"/><path d="M50 37Q23 40 23 17q24-1 27 20Zm0 15q27 2 29-24-25-1-29 24Z" fill="#85AF75"/><path d="M32 64h37l-5 24H38Z" fill="#DC9976"/><rect x="28" y="60" width="45" height="9" rx="4" fill="#F0B18E"/>',
    friends: '<path d="M13 73V53a17 17 0 0 1 34 0v20" fill="#F5CB8A"/><path d="M43 77V39a21 21 0 0 1 42 0v38" fill="#FFF1D3"/><circle cx="23" cy="55" r="2" fill="#605349"/><circle cx="36" cy="55" r="2" fill="#605349"/><circle cx="56" cy="44" r="2.5" fill="#605349"/><circle cx="73" cy="44" r="2.5" fill="#605349"/><path d="M59 55q5 6 10 0" stroke="#605349" stroke-width="2.5" stroke-linecap="round"/>',
    undo: '<path d="m34 26-19 17 19 17M17 43h39a24 24 0 0 1 0 48" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
    reset: '<path d="M77 35A31 31 0 1 0 82 63M78 14v23H55" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
    hint: '<path d="M31 44a20 20 0 1 1 38 9c-5 7-9 10-9 17H40c0-7-4-10-9-17Z" fill="#F4CB6A"/><path d="M41 77h18m-15 8h12M50 6v8M16 21l7 7m61-7-7 7" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
    map: '<path d="m12 26 25-9 26 12 25-10v58l-25 9-26-12-25 10Z" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M37 17v57m26-45v57" stroke="currentColor" stroke-width="4"/>',
    gift: '<rect x="18" y="40" width="64" height="45" rx="6" fill="#91B39C"/><rect x="12" y="31" width="76" height="17" rx="5" fill="#B8D3B3"/><path d="M50 31v54" stroke="#FFF0C5" stroke-width="9"/><path d="M49 31C17 32 23 6 37 14c8 4 12 17 12 17Zm2 0C83 32 77 6 63 14c-8 4-12 17-12 17Z" stroke="#E6BA65" stroke-width="6"/>'
  };
  return wrap(drawings[name] || drawings.star, cls);
}
let artSequence = 0;
export function animalArt(pet, happy = true) {
  const id = `fur-${++artSequence}`;
  const colors = { rabbit: ['#FFFBF0','#E8D7C1'], dog: ['#EDC99C','#C69765'], cat: ['#DFDCEA','#AAA7C0'], bear: ['#DBB78F','#B48760'] };
  const [light, shade] = colors[pet] || colors.dog;
  const fur = `url(#${id})`;
  const ears = {
    rabbit: `<path d="M30 40C11 1 39-7 43 38M57 38C61-7 89 1 70 40" fill="${fur}" stroke="${shade}" stroke-width="1.4"/><path d="M33 12q-3 10 4 20m26 0q7-22 3-20" stroke="#E8BCB6" stroke-width="6" stroke-linecap="round"/>`,
    dog: `<path d="M30 28C12 19 6 37 12 62q11 15 21-8m34 0q10 23 21 8c6-25 0-43-18-34" fill="#996F4E"/><path d="M17 35q-6 13 1 22m65-22q6 13-1 22" stroke="#BD936B" stroke-width="3" stroke-linecap="round"/>`,
    cat: `<path d="m23 40-3-28 26 18h8l26-18-3 28" fill="${fur}" stroke="${shade}" stroke-width="1.5"/><path d="m26 23 2 15 11-6m35-9-2 15-11-6" fill="#D9ACB3"/>`,
    bear: `<circle cx="27" cy="30" r="14" fill="${fur}"/><circle cx="73" cy="30" r="14" fill="${fur}"/><circle cx="27" cy="30" r="8" fill="#AC7D5B"/><circle cx="73" cy="30" r="8" fill="#AC7D5B"/>`
  };
  const face = `<g class="pet-eyes"><ellipse cx="38" cy="51" rx="3.4" ry="4" fill="#3E3C38"/><ellipse cx="62" cy="51" rx="3.4" ry="4" fill="#3E3C38"/><circle cx="39" cy="50" r="1.1" fill="white"/><circle cx="63" cy="50" r="1.1" fill="white"/></g><ellipse cx="29" cy="59" rx="6" ry="3" fill="#D7988D" opacity=".5"/><ellipse cx="71" cy="59" rx="6" ry="3" fill="#D7988D" opacity=".5"/><path d="m47 58 3 3 3-3" fill="#795D52" stroke="#795D52" stroke-width="2" stroke-linejoin="round"/><path d="${happy ? 'M50 61v3m-8 0q4 7 8 0 4 7 8 0' : 'M44 67q6-5 12 0'}" stroke="#795D52" stroke-width="1.7" stroke-linecap="round"/>`;
  const accessory = pet === 'rabbit' ? '<path d="m44 78-13-6v13l13-5m12-2 13-6v13l-13-5" fill="#A4B895"/><circle cx="50" cy="79" r="5" fill="#708C72"/>' : pet === 'dog' ? '<path d="M26 72q24 15 48 0l-4 11q-20 11-40 0Z" fill="#A9BAC0"/><circle cx="50" cy="83" r="5" fill="#E9C579"/>' : pet === 'bear' ? '<path d="M29 74q21 10 42 0l-4 11q-17 9-34 0Z" fill="#B2B68A"/><path d="m60 80 8 12H57Z" fill="#8C9A73"/>' : '<path d="m38 79-9-5v12l9-4m24-3 9-5v12l-9-4" fill="#C68F9E"/><circle cx="50" cy="81" r="4" fill="#E8C678"/>';
  return wrap(`<defs><radialGradient id="${id}" cx="35%" cy="25%" r="85%"><stop stop-color="${light}"/><stop offset="1" stop-color="${shade}"/></radialGradient></defs><ellipse cx="50" cy="93" rx="29" ry="5" fill="#665540" opacity=".13"/>${ears[pet] || ears.dog}<path d="M25 59q-6 31 6 33h38q12-2 6-33Z" fill="${fur}"/><ellipse cx="50" cy="76" rx="18" ry="15" fill="${light}" opacity=".65"/><rect x="20" y="27" width="60" height="48" rx="24" fill="${fur}"/><ellipse cx="50" cy="60" rx="15" ry="10" fill="${light}" opacity=".65"/>${pet === 'cat' ? '<path d="m43 29 2 8m10 0 2-8m-43 30 12 2m48 0 12-2m-72 8 12-2m48 0 12 2" stroke="#9490AD" stroke-width="2" stroke-linecap="round"/>' : ''}${face}<ellipse cx="32" cy="89" rx="9" ry="5" fill="${light}"/><ellipse cx="68" cy="89" rx="9" ry="5" fill="${light}"/>${accessory}`, 'resident');
}
export function resident(kind, happy) { return animalArt({ wide: 'rabbit', tall: 'bear', cozy: 'cat', space: 'dog' }[kind] || kind, happy); }
export function roomDecor(kind) {
  if (kind === 'wide') return `<div class="furniture couch">${icon('sofa')}</div>`;
  if (kind === 'tall') return `<div class="furniture tree">${icon('plant')}</div>`;
  if (kind === 'cozy') return '<div class="rug"></div><div class="moon-window">☾</div>';
  return '<div class="window-frame"><i></i><i></i><i></i><i></i></div><div class="little-pot"></div>';
}
