export const SCALE_FACTOR = 4;
export const TILE_SIZE = 64;

export type PlantType = keyof typeof PLANT_TYPE;

export const PLANT_TYPE = {
  PUMPKIN: 'PUMPKIN',
  POTATO: 'POTATO',
  CARROT: 'CARROT',
  TOMATO: 'TOMATO',
} as const;

export type GridPosition = {
  x: number;
  y: number;
};

export type ElementType = keyof typeof ELEMENTS;

export const ELEMENTS = {
  WATER: 'WATER',
  FIRE: 'FIRE',
  EARTH: 'EARTH',
  AIR: 'AIR',
} as const;

export const PLANT_TYPE_TO_ELEMENT_MAP = {
  PUMPKIN: {
    consumes: {
      WATER: 0,
      FIRE: 2,
      EARTH: 3,
      AIR: 0,
    },
    returns: {
      WATER: 4,
      FIRE: 0,
      EARTH: 0,
      AIR: 0,
    },
  },
  POTATO: {
    consumes: {
      WATER: 3,
      FIRE: 0,
      EARTH: 0,
      AIR: 2,
    },
    returns: {
      WATER: 0,
      FIRE: 4,
      EARTH: 0,
      AIR: 0,
    },
  },
  CARROT: {
    consumes: {
      WATER: 2,
      FIRE: 3,
      EARTH: 0,
      AIR: 0,
    },
    returns: {
      WATER: 0,
      FIRE: 0,
      EARTH: 0,
      AIR: 4,
    },
  },
  TOMATO: {
    consumes: {
      WATER: 2,
      FIRE: 0,
      EARTH: 0,
      AIR: 2,
    },
    returns: {
      WATER: 0,
      FIRE: 4,
      EARTH: 0,
      AIR: 0,
    },
  },
} as const;

export const ASSET_PACK_KEYS = {
  MAIN: 'MAIN',
} as const;

export const PLANT_TYPE_TO_SEED_MAP = {
  PUMPKIN: 0,
  POTATO: 10,
  CARROT: 5,
  TOMATO: 15,
} as const;

export type ElementBalance = { [key in ElementType]: number };

export type FarmTileBalanceType = keyof typeof FARM_TILE_BALANCE_TYPE;

export const FARM_TILE_BALANCE_TYPE = {
  FIRE: 'FIRE',
  WATER: 'WATER',
  BALANCED: 'BALANCED',
} as const;
