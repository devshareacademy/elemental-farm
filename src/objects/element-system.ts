import { ElementBalance, ELEMENTS, PLANT_TYPE_TO_ELEMENT_MAP, PlantType } from '../common';
import { FarmTile } from './farm-tile';

export class ElementSystem {
  private elementBalance: ElementBalance;

  constructor(farmTiles: FarmTile[][]) {
    this.elementBalance = {
      [ELEMENTS.AIR]: 0,
      [ELEMENTS.EARTH]: 0,
      [ELEMENTS.FIRE]: 0,
      [ELEMENTS.WATER]: 0,
    };
    farmTiles.forEach((farmTileRow) => {
      farmTileRow.forEach((farmTile) => {
        this.elementBalance.AIR += farmTile.soilBalance.AIR;
        this.elementBalance.EARTH += farmTile.soilBalance.EARTH;
        this.elementBalance.FIRE += farmTile.soilBalance.FIRE;
        this.elementBalance.WATER += farmTile.soilBalance.WATER;
      });
    });
  }

  get balance(): ElementBalance {
    return this.elementBalance;
  }

  public canPlantCrap(plantType: PlantType, farmTile: FarmTile): boolean {
    const elementImpact = PLANT_TYPE_TO_ELEMENT_MAP[plantType];
    if (
      this.elementBalance.AIR - elementImpact.consumes.AIR < 0 ||
      farmTile.soilBalance.AIR - elementImpact.consumes.AIR < 0
    ) {
      return false;
    }
    if (
      this.elementBalance.EARTH - elementImpact.consumes.EARTH < 0 ||
      farmTile.soilBalance.EARTH - elementImpact.consumes.EARTH < 0
    ) {
      return false;
    }
    if (
      this.elementBalance.FIRE - elementImpact.consumes.FIRE < 0 ||
      farmTile.soilBalance.FIRE - elementImpact.consumes.FIRE < 0
    ) {
      return false;
    }
    if (
      this.elementBalance.WATER - elementImpact.consumes.WATER < 0 ||
      farmTile.soilBalance.WATER - elementImpact.consumes.WATER < 0
    ) {
      return false;
    }
    return true;
  }

  public plantCrop(plantType: PlantType): void {
    const elementImpact = PLANT_TYPE_TO_ELEMENT_MAP[plantType];
    this.elementBalance.AIR -= elementImpact.consumes.AIR;
    this.elementBalance.WATER -= elementImpact.consumes.WATER;
    this.elementBalance.EARTH -= elementImpact.consumes.EARTH;
    this.elementBalance.FIRE -= elementImpact.consumes.FIRE;
  }

  public harvestCrop(plantType: PlantType): void {
    const elementImpact = PLANT_TYPE_TO_ELEMENT_MAP[plantType];
    this.elementBalance.AIR += elementImpact.returns.AIR;
    this.elementBalance.WATER += elementImpact.returns.WATER;
    this.elementBalance.EARTH += elementImpact.returns.EARTH;
    this.elementBalance.FIRE += elementImpact.returns.FIRE;
  }
}
