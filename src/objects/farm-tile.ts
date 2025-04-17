import * as Phaser from 'phaser';
import { Crop } from './crop';
import {
  ElementBalance,
  ElementType,
  FARM_TILE_BALANCE_TYPE,
  FarmTileBalanceType,
  GridPosition,
  PLANT_TYPE_TO_ELEMENT_MAP,
  PlantType,
  TILE_SIZE,
} from '../common';

const FIRE_HEAVY = {
  EARTH: 5,
  WATER: 4,
  FIRE: 7,
  AIR: 4,
};

const WATER_HEAVY = {
  EARTH: 4,
  WATER: 7,
  FIRE: 4,
  AIR: 5,
};

const BALANCED = {
  EARTH: 5,
  WATER: 5,
  FIRE: 5,
  AIR: 5,
};

const COLOR_MAP: Record<ElementType, number> = {
  FIRE: 0xff6347, // tomato red
  WATER: 0x1e90ff, // dodger blue
  AIR: 0xdcdcdc, // light gray
  EARTH: 0x228b22, // forest green
};

const DEFAULT_COLOR = 0x654321;

export class FarmTile extends Phaser.GameObjects.Container {
  private crop: Crop | null;
  private soil: Phaser.GameObjects.Rectangle;
  private soilElementBalance: ElementBalance;
  private gridPosition: GridPosition;

  constructor(scene: Phaser.Scene, x: number, y: number, gridPosition: GridPosition, balanceType: FarmTileBalanceType) {
    super(scene, x, y);
    this.scene = scene;
    this.crop = null;
    this.soilElementBalance = { ...BALANCED };
    this.gridPosition = gridPosition;

    if (balanceType === FARM_TILE_BALANCE_TYPE.FIRE) {
      this.soilElementBalance = { ...FIRE_HEAVY };
    } else if (balanceType === FARM_TILE_BALANCE_TYPE.WATER) {
      this.soilElementBalance = { ...WATER_HEAVY };
    }

    this.soil = scene.add.rectangle(0, 0, TILE_SIZE - 4, TILE_SIZE - 4, DEFAULT_COLOR, 0.8);
    this.updateColor();
    this.add(this.soil);

    scene.add.existing(this);
    this.setSize(TILE_SIZE - 4, TILE_SIZE - 4);
    this.setInteractive();
  }

  get soilBalance(): ElementBalance {
    return { ...this.soilElementBalance };
  }

  public isEmpty() {
    return this.crop === null;
  }

  public plantCrop(seed: PlantType): void {
    this.crop = new Crop(this.scene, seed);
    this.add(this.crop);

    const elementImpact = PLANT_TYPE_TO_ELEMENT_MAP[seed];
    this.soilElementBalance.AIR -= elementImpact.consumes.AIR;
    this.soilElementBalance.WATER -= elementImpact.consumes.WATER;
    this.soilElementBalance.EARTH -= elementImpact.consumes.EARTH;
    this.soilElementBalance.FIRE -= elementImpact.consumes.FIRE;

    this.updateColor();
  }

  public resetSoilIfDepleted(): void {
    this.soilElementBalance = { ...BALANCED };
  }

  public updateColor(): void {
    const balance = this.soilElementBalance;
    const entries = Object.entries(balance);

    // Get the dominant element
    entries.sort(([, a], [, b]) => b - a);
    const [topElement, topValue] = entries[0];

    const diff = topValue - entries[1][1];

    // If difference is small, consider it balanced
    if (diff < 2) {
      this.soil.fillColor = DEFAULT_COLOR;
      return;
    }
    this.soil.fillColor = COLOR_MAP[topElement as ElementType];
  }

  public harvestCrop(): PlantType | undefined {
    if (this.crop === null) {
      return;
    }
    const cropType = this.crop.cropType;
    const elementImpact = PLANT_TYPE_TO_ELEMENT_MAP[cropType];
    this.soilElementBalance.AIR += elementImpact.returns.AIR;
    this.soilElementBalance.WATER += elementImpact.returns.WATER;
    this.soilElementBalance.EARTH += elementImpact.returns.EARTH;
    this.soilElementBalance.FIRE += elementImpact.returns.FIRE;

    this.crop.destroy();
    this.crop = null;

    this.updateColor();

    return cropType;
  }

  public isReadyToHarvest(): boolean {
    if (this.crop === null) {
      return false;
    }
    return this.crop.isReadyToHarvest();
  }
}
