/** Original vector art, drawn in code. No external assets or fonts. */
const wrap = (body, cls = '') => `<svg class="${cls}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
export function icon(name, cls = '') {
  const drawings = {
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
export function resident(kind, happy) {
  const face = `<circle cx="40" cy="53" r="2.6" fill="#4F5149"/><circle cx="60" cy="53" r="2.6" fill="#4F5149"/><ellipse cx="31" cy="61" rx="6" ry="3" fill="#EFAF9D" opacity=".7"/><ellipse cx="69" cy="61" rx="6" ry="3" fill="#EFAF9D" opacity=".7"/><path d="${happy ? 'M43 64q7 8 14 0' : 'M43 68q7-7 14 0'}" stroke="#4F5149" stroke-width="2.8" stroke-linecap="round"/>`;
  const bodies = {
    wide: '<rect x="29" y="6" width="14" height="39" rx="7" fill="#FFF4E3"/><rect x="57" y="6" width="14" height="39" rx="7" fill="#FFF4E3"/><path d="M34 13v18m30-18v18" stroke="#EBC6B9" stroke-width="5" stroke-linecap="round"/><rect x="22" y="31" width="56" height="57" rx="25" fill="#FFF4E3"/>',
    tall: '<circle cx="28" cy="27" r="13" fill="#C79D79"/><circle cx="72" cy="27" r="13" fill="#C79D79"/><rect x="20" y="27" width="60" height="61" rx="27" fill="#E1B68B"/><ellipse cx="50" cy="65" rx="16" ry="12" fill="#F1D6B3"/>',
    cozy: '<path d="M22 42 21 14l24 17h13l22-17-2 29v27q0 20-28 20T22 70Z" fill="#C5C4D9"/><path d="m27 22 1 17 12-7m34-10-1 17-12-7" fill="#E5BFC3"/><path d="m15 62 13 2m44 0 13-2m-70 9 13-2m44 0 13 2" stroke="#8E8FA8" stroke-width="2" stroke-linecap="round"/>',
    space: '<path d="M23 42Q12 10 31 21l15 10h13q23-13 18 18v23q0 19-27 19T22 72Z" fill="#FFF2CF"/><path d="M46 30q-2-14 11-17" stroke="#A9BC84" stroke-width="6" stroke-linecap="round"/>'
  };
  return wrap(bodies[kind] + face, 'resident');
}
export function roomDecor(kind) {
  if (kind === 'wide') return `<div class="furniture couch">${icon('sofa')}</div>`;
  if (kind === 'tall') return `<div class="furniture tree">${icon('plant')}</div>`;
  if (kind === 'cozy') return '<div class="rug"></div><div class="moon-window">☾</div>';
  return '<div class="window-frame"><i></i><i></i><i></i><i></i></div><div class="little-pot"></div>';
}
