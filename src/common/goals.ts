import { ELEMENTS, ElementType, PLANT_TYPE, PlantType } from '.';

type GameState = {
  plantedCount: number;
  harvestCount: number;
  elementalPlanted: { [key in ElementType]: number };
  eventsResolved: { [key in ElementType]: number };
  plantsHarvested: { [key in PlantType]: number };
  questsCompleted: number;
};

export const GLOBAL_GAME_STATE: GameState = {
  plantedCount: 0,
  harvestCount: 0,
  elementalPlanted: { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0 },
  eventsResolved: { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0 },
  plantsHarvested: { POTATO: 0, CARROT: 0, PUMPKIN: 0, TOMATO: 0 },
  questsCompleted: 0,
};

export const DAILY_STATE: GameState = {
  plantedCount: 0,
  harvestCount: 0,
  elementalPlanted: { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0 },
  eventsResolved: { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0 },
  plantsHarvested: { POTATO: 0, CARROT: 0, PUMPKIN: 0, TOMATO: 0 },
  questsCompleted: 0,
};

export function resetDailyState(): void {
  DAILY_STATE.plantedCount = 0;
  DAILY_STATE.harvestCount = 0;
  DAILY_STATE.elementalPlanted.AIR = 0;
  DAILY_STATE.elementalPlanted.WATER = 0;
  DAILY_STATE.elementalPlanted.FIRE = 0;
  DAILY_STATE.elementalPlanted.EARTH = 0;
  DAILY_STATE.eventsResolved.AIR = 0;
  DAILY_STATE.eventsResolved.WATER = 0;
  DAILY_STATE.eventsResolved.FIRE = 0;
  DAILY_STATE.eventsResolved.EARTH = 0;
}

export const GOAL_POOL = [
  { id: 'harvest_20', text: 'Harvest 20 plants', check: () => DAILY_STATE.harvestCount >= 20 },
  { id: 'plant_20', text: 'Plant 20 seeds', check: () => DAILY_STATE.plantedCount >= 20 },
  {
    id: 'resolve_fire_event',
    text: 'Resolve a fire imbalance event',
    check: () => DAILY_STATE.eventsResolved.FIRE >= 1,
  },
  {
    id: 'resolve_water_event',
    text: 'Resolve a water imbalance event',
    check: () => DAILY_STATE.eventsResolved.WATER >= 1,
  },
  {
    id: 'resolve_air_event',
    text: 'Resolve a air imbalance event',
    check: () => DAILY_STATE.eventsResolved.AIR >= 1,
  },
  {
    id: 'resolve_earth_event',
    text: 'Resolve a earth imbalance event',
    check: () => DAILY_STATE.eventsResolved.EARTH >= 1,
  },
  { id: 'grow_air', text: 'Grow at least 10 air plants', check: () => DAILY_STATE.elementalPlanted.AIR >= 10 },
  { id: 'grow_fire', text: 'Grow at least 10 fire plants', check: () => DAILY_STATE.elementalPlanted.FIRE >= 10 },
  { id: 'grow_water', text: 'Grow at least 10 water plants', check: () => DAILY_STATE.elementalPlanted.WATER >= 10 },
  { id: 'grow_earth', text: 'Grow at least 10 earth plants', check: () => DAILY_STATE.elementalPlanted.EARTH >= 10 },
];

export const FIRST_DAY_GOALS = [GOAL_POOL[0], GOAL_POOL[1], GOAL_POOL[9]];
export const CURRENT_GOALS = [
  { ...FIRST_DAY_GOALS[0], completed: false },
  { ...FIRST_DAY_GOALS[1], completed: false },
  { ...FIRST_DAY_GOALS[2], completed: false },
];

export function refreshQuests(): void {
  Phaser.Math.RND.shuffle(GOAL_POOL);
  CURRENT_GOALS[0] = { ...GOAL_POOL[0], completed: false };
  CURRENT_GOALS[1] = { ...GOAL_POOL[1], completed: false };
  CURRENT_GOALS[2] = { ...GOAL_POOL[2], completed: false };
}

export function plantCrop(plantType: PlantType): void {
  DAILY_STATE.plantedCount += 1;
  GLOBAL_GAME_STATE.plantedCount += 1;

  if (plantType === PLANT_TYPE.CARROT) {
    DAILY_STATE.elementalPlanted.AIR += 1;
    GLOBAL_GAME_STATE.elementalPlanted.AIR += 1;
    return;
  }

  if (plantType === PLANT_TYPE.PUMPKIN) {
    DAILY_STATE.elementalPlanted.WATER += 1;
    GLOBAL_GAME_STATE.elementalPlanted.WATER += 1;
    return;
  }

  if (plantType === PLANT_TYPE.TOMATO) {
    DAILY_STATE.elementalPlanted.FIRE += 1;
    GLOBAL_GAME_STATE.elementalPlanted.FIRE += 1;
    return;
  }

  if (plantType === PLANT_TYPE.POTATO) {
    DAILY_STATE.elementalPlanted.EARTH += 1;
    GLOBAL_GAME_STATE.elementalPlanted.EARTH += 1;
    return;
  }
}

export function harvestCrop(plantType: PlantType): void {
  DAILY_STATE.harvestCount += 1;
  GLOBAL_GAME_STATE.harvestCount += 1;

  if (plantType === PLANT_TYPE.CARROT) {
    DAILY_STATE.plantsHarvested.CARROT += 1;
    GLOBAL_GAME_STATE.plantsHarvested.CARROT += 1;
    return;
  }

  if (plantType === PLANT_TYPE.PUMPKIN) {
    DAILY_STATE.plantsHarvested.PUMPKIN += 1;
    GLOBAL_GAME_STATE.plantsHarvested.PUMPKIN += 1;
    return;
  }

  if (plantType === PLANT_TYPE.TOMATO) {
    DAILY_STATE.plantsHarvested.TOMATO += 1;
    GLOBAL_GAME_STATE.plantsHarvested.TOMATO += 1;
    return;
  }

  if (plantType === PLANT_TYPE.POTATO) {
    DAILY_STATE.plantsHarvested.POTATO += 1;
    GLOBAL_GAME_STATE.plantsHarvested.POTATO += 1;
    return;
  }
}

export function eventResolved(elementType: ElementType): void {
  if (elementType === ELEMENTS.AIR) {
    DAILY_STATE.eventsResolved.AIR += 1;
    GLOBAL_GAME_STATE.eventsResolved.AIR += 1;
    return;
  }

  if (elementType === ELEMENTS.WATER) {
    DAILY_STATE.eventsResolved.WATER += 1;
    GLOBAL_GAME_STATE.eventsResolved.WATER += 1;
    return;
  }

  if (elementType === ELEMENTS.FIRE) {
    DAILY_STATE.eventsResolved.FIRE += 1;
    GLOBAL_GAME_STATE.eventsResolved.FIRE += 1;
    return;
  }

  if (elementType === ELEMENTS.EARTH) {
    DAILY_STATE.eventsResolved.EARTH += 1;
    GLOBAL_GAME_STATE.eventsResolved.EARTH += 1;
    return;
  }
}

export function markGoalAsFinished(index: number): void {
  if (CURRENT_GOALS[index].completed) {
    return;
  }
  CURRENT_GOALS[index].completed = true;
  DAILY_STATE.questsCompleted += 1;
  GLOBAL_GAME_STATE.questsCompleted += 1;
}
