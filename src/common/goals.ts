import { ElementType, PLANT_TYPE, PlantType } from '.';

type GameState = {
  plantedCount: number;
  harvestCount: number;
  elementalPlanted: { [key in ElementType]: number };
  eventsTriggered: { [key in ElementType]: number };
  plantsHarvested: { [key in PlantType]: number };
};

export const GLOBAL_GAME_STATE: GameState = {
  plantedCount: 0,
  harvestCount: 0,
  elementalPlanted: { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0 },
  eventsTriggered: { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0 },
  plantsHarvested: { POTATO: 0, CARROT: 0, PUMPKIN: 0, TOMATO: 0 },
};

export const DAILY_STATE: GameState = {
  plantedCount: 0,
  harvestCount: 0,
  elementalPlanted: { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0 },
  eventsTriggered: { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0 },
  plantsHarvested: { POTATO: 0, CARROT: 0, PUMPKIN: 0, TOMATO: 0 },
};

export function resetDailyState(): void {
  DAILY_STATE.plantedCount = 0;
  DAILY_STATE.harvestCount = 0;
  DAILY_STATE.elementalPlanted.AIR = 0;
  DAILY_STATE.elementalPlanted.WATER = 0;
  DAILY_STATE.elementalPlanted.FIRE = 0;
  DAILY_STATE.elementalPlanted.EARTH = 0;
  DAILY_STATE.eventsTriggered.AIR = 0;
  DAILY_STATE.eventsTriggered.WATER = 0;
  DAILY_STATE.eventsTriggered.FIRE = 0;
  DAILY_STATE.eventsTriggered.EARTH = 0;
}

export const GOAL_POOL = [
  { id: 'harvest_3', text: 'Harvest 3 plants', check: () => DAILY_STATE.harvestCount >= 3 },
  { id: 'plant_5', text: 'Plant 5 seeds', check: () => DAILY_STATE.plantedCount >= 5 },
  {
    id: 'trigger_fire_event',
    text: 'Trigger a fire imbalance event',
    check: () => DAILY_STATE.eventsTriggered.FIRE > 1,
  },
  { id: 'grow_air', text: 'Grow at least 3 air plants', check: () => DAILY_STATE.elementalPlanted.AIR >= 3 },
];

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
