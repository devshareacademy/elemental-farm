export type PlantType = keyof typeof PLANT_TYPE;

export const PLANT_TYPE = {
  PUMPKIN: 'PUMPKIN',
  POTATO: 'POTATO',
  CARROT: 'CARROT',
} as const;

export type ZonePosition = {
  x: number;
  y: number;
};
