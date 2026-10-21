import { PETS } from './pets.js';
export const GROWTH_STAGES = [
  { meals: 0, name: '初來乍到', unlock: '摸摸與自由散步' },
  { meals: 2, name: '熟悉彼此', unlock: '接球互動與玩具球' },
  { meals: 5, name: '安心依靠', unlock: '安心午睡與花籃' },
  { meals: 9, name: '親密家人', unlock: '小花冠與合照擺飾' }
];
export function growthOf(progress, pet) {
  const meals = progress.growth?.[pet]?.meals || 0;
  const index = GROWTH_STAGES.findLastIndex(s => meals >= s.meals);
  return { meals, index, stage: GROWTH_STAGES[index], next: GROWTH_STAGES[index + 1] || null };
}
export function feedPet(progress, pet) {
  if (!PETS[pet] || !progress.adopted.includes(pet) || !Number.isInteger(progress.food) || progress.food < 1) return null;
  const before = growthOf(progress, pet);
  if (before.meals >= 9999) return null;
  progress.food--;
  progress.growth[pet] = { meals: before.meals + 1 };
  const after = growthOf(progress, pet);
  return { ...after, leveledUp: after.index > before.index };
}
/** A reward belongs to one loaded attempt. Undoing a win does not create a new attempt. */
export function createFoodReward() {
  let claimed = false;
  return { claim(progress, stars) {
    if (claimed || stars !== 3 || progress.food >= 99999) return 0;
    claimed = true;
    progress.food++; return 1;
  } };
}
