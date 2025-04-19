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
      WATER: 3,
      FIRE: 0,
      EARTH: 0,
      AIR: 0,
    },
    returns: {
      WATER: 0,
      FIRE: 1,
      EARTH: 2,
      AIR: 0,
    },
  },
  POTATO: {
    consumes: {
      WATER: 0,
      FIRE: 0,
      EARTH: 3,
      AIR: 0,
    },
    returns: {
      WATER: 2,
      FIRE: 0,
      EARTH: 0,
      AIR: 1,
    },
  },
  CARROT: {
    consumes: {
      WATER: 0,
      FIRE: 0,
      EARTH: 0,
      AIR: 3,
    },
    returns: {
      WATER: 0,
      FIRE: 2,
      EARTH: 1,
      AIR: 0,
    },
  },
  TOMATO: {
    consumes: {
      WATER: 0,
      FIRE: 3,
      EARTH: 0,
      AIR: 0,
    },
    returns: {
      WATER: 2,
      FIRE: 0,
      EARTH: 0,
      AIR: 1,
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

export const INTRO_DIALOG = [
  'Hey there! You must be the new farmer. I’m Lila—born and raised right here in the valley.',
  'This land? It’s not like other places. Every plant you grow connects to one of the four elements—Earth, Water, Fire, and Air.',
  'When you plant a seed, it stirs the Earth. When you water it, you call on Water. And some plants even warm the soil or call in the breeze!',
  'But be careful—if any one element gets too strong, the land reacts. Heat waves, gusty winds, sudden rain… it’s wild!',
  'That’s why we try to keep things balanced out here. It’s kinda like a dance—give a little, take a little.',
  "Each day, the grove spirits leave behind a little challenge for us. They're like daily goals. Completing them helps the land stay happy.",
  'So! Ready to get your hands dirty? Your first goal’s waiting, and I’ll be here if you need any help.',
];
