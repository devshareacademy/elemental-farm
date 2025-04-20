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
      WATER: 1,
      FIRE: 0,
      EARTH: 0,
      AIR: 2,
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
  'Hey there! You must be the new farmer. I’m Lila — born and raised right here in the valley.',
  'This land’s a little... special. Everything you plant connects to one of the four elements—Earth, Water, Fire, and Air.',
  'Each action affects the balance. Watering brings in Water, planting stirs Earth, and some crops call the wind or even heat things up!',
  'The land’s alive, in a way. When an element gets too strong, you’ll start to see it...',
  'Take a look at the soil—see how it shifts color? That’s how you know when there’s too much of one element.',
  "Too much Fire and the soil glows warm. Overflowing Water and it turns bluish and damp. It’s nature’s way of saying: 'Hey, easy there!'",
  'If things get really out of balance, you’ll trigger all kinds of strange effects—heat waves, wind bursts, sudden rain...',
  'But don’t worry! Each day, the grove spirits leave us a little challenge. A goal to work toward that keeps the land happy.',
  'So! Ready to dig in? Your first goal’s waiting. I’ll be nearby if you need help.',
];
