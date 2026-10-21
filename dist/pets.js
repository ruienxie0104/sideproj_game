import { LEVELS, CHAPTERS, chapterComplete } from './engine.js';
export const ADOPTION_GOAL = 5;
export const PETS = {
  rabbit: { name: '棉棉', species: '兔兔', kind: 'wide', color: '#f6e8d6', note: '喜歡曬太陽，也喜歡靠著你。' },
  dog: { name: '布丁', species: '小狗', kind: 'space', color: '#ecd1ae', note: '聽到你的腳步聲，尾巴就搖起來。' },
  cat: { name: '芝麻', species: '小貓', kind: 'cozy', color: '#dedbea', note: '把最舒服的小角落，留給喜歡的人。' },
  bear: { name: '栗栗', species: '小熊', kind: 'tall', color: '#ddbf9e', note: '慢慢生活，每一片新葉都值得開心。' }
};
const species = Object.keys(PETS);
export function animalAt(level, room) {
  const kind = level.kinds[room];
  if (kind !== 'space') return { wide: 'rabbit', tall: 'bear', cozy: 'cat' }[kind];
  // Space wishes belong to many species, so the first chapters already introduce friends.
  if (room === level.kinds.indexOf('space')) return 'dog';
  return species[(LEVELS.indexOf(level) + room + 1) % species.length];
}
export function residentsFor(level) { return [...new Set(level.kinds.map((_, room) => animalAt(level, room)))]; }
export function affection(progress, pet) { return Object.values(progress.choices).filter(id => id === pet).length; }
export function pendingChoices(progress) { return LEVELS.filter(l => progress.best[l.id] && !progress.choices[l.id] && residentsFor(l).some(pet => affection(progress, pet) < ADOPTION_GOAL)); }
export function chooseFriend(progress, levelId, pet) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level || !progress.best[levelId] || progress.choices[levelId] || !residentsFor(level).includes(pet) || affection(progress, pet) >= ADOPTION_GOAL) return false;
  progress.choices[levelId] = pet;
  return true;
}
export function adopt(progress, pet) {
  if (!PETS[pet] || affection(progress, pet) < ADOPTION_GOAL || progress.adopted.includes(pet)) return false;
  progress.adopted.push(pet); progress.activePet = pet;
  return true;
}
export const FURNITURE = [
  { id: 'cushion', name: '柔軟坐墊', icon: 'cushion', chapter: -1 },
  ...CHAPTERS.map((c, chapter) => ({ id: `gift-${chapter}`, name: c.reward, icon: c.rewardIcon, chapter }))
];
export function unlockedFurniture(progress) { return FURNITURE.filter(f => f.chapter < 0 || chapterComplete(progress.best, f.chapter)); }
export function placeFurniture(progress, id, slot) {
  if (!progress.adopted.length || !Number.isInteger(slot) || slot < 0 || slot > 8 || !unlockedFurniture(progress).some(f => f.id === id)) return false;
  // One copy per gift. Moving onto an occupied tile returns that item to the shelf.
  progress.home.placements = progress.home.placements.filter(p => p.id !== id && p.slot !== slot);
  progress.home.placements.push({ id, slot });
  return true;
}
export function removeFurniture(progress, slot) { progress.home.placements = progress.home.placements.filter(p => p.slot !== slot); }
export function journeyIndex(progress) {
  const first = LEVELS.findIndex(l => !progress.best[l.id]);
  return first === -1 ? progress.current : first;
}
