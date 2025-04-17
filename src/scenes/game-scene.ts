import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { FARM_TILE_BALANCE_TYPE, FarmTileBalanceType, GridPosition, PLANT_TYPE, PlantType } from '../common';
import { SCALE_FACTOR, TILE_SIZE } from '../common';
import { ElementSystem } from '../objects/element-system';
import { FarmTile } from '../objects/farm-tile';
import { ElementPieGauge } from '../objects/element-pie-gauge';

const DATA_KEYS = {
  GRID: 'GRID',
  SEED_TYPE: 'SEED_TYPE',
} as const;

const STARTING_TILES = [
  [1, 1, 1, 1, 1, 2],
  [1, 1, 1, 1, 2, 2],
  [1, 1, 1, 2, 2, 2],
  [1, 1, 2, 2, 2, 2],
  [1, 2, 2, 2, 2, 2],
] as const;

export class GameScene extends Phaser.Scene {
  private selectedSeedPacket: undefined | Phaser.GameObjects.Image;
  private toolCursor!: Phaser.GameObjects.Image;
  private selectedPlot!: Phaser.GameObjects.Rectangle;
  private farmTiles!: FarmTile[][];
  private lockInput!: boolean;
  private elementSystem!: ElementSystem;
  private pie!: ElementPieGauge;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  public create(): void {
    this.lockInput = false;

    this.createBackgroundAndGui();
    this.createSeedPackets();
    this.selectedPlot = this.add
      .rectangle(TILE_SIZE * 5 + 1, TILE_SIZE + TILE_SIZE / 2 + 14, TILE_SIZE - 4, TILE_SIZE - 4, 0xffffff, 0.8)
      .setVisible(false);
    this.createFarmTiles();
    this.toolCursor = this.add
      .image(0, 0, 'items', 5)
      .setScale(SCALE_FACTOR)
      .setVisible(false)
      .setAngle(-45)
      .setOrigin(0.05, 0.2);
    this.elementSystem = new ElementSystem(this.farmTiles);
    this.pie = new ElementPieGauge(this, 125, 125, 100, this.elementSystem.balance);
  }

  private createBackgroundAndGui(): void {
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg', 0).setScale(SCALE_FACTOR);
    this.add.image(this.scale.width / 2, this.scale.height - 5, 'panel', 0).setScale(SCALE_FACTOR);
    // this.add.sprite(0, 0, 'gui', 0).setOrigin(0).play('gui').setDepth(2);
  }

  public update(): void {
    if (this.selectedSeedPacket === undefined) {
      return;
    }
    const pointer = this.input.activePointer;
    this.toolCursor.setPosition(pointer.worldX, pointer.worldY);
  }

  private handleToolSelected(gameObject: Phaser.GameObjects.Image): void {
    const isAlreadySelected = this.selectedSeedPacket === gameObject;
    if (this.selectedSeedPacket !== undefined) {
      this.selectedSeedPacket.postFX.disable(true);
      if (isAlreadySelected) {
        this.selectedSeedPacket = undefined;
        this.toolCursor.setVisible(false);
        this.selectedPlot.setVisible(false);
        return;
      }
    }

    this.selectedSeedPacket = gameObject;
    gameObject.postFX.enable();
    gameObject.postFX.addGlow(0xffffff, 4, 0, false, 0.1, 10);

    this.toolCursor.setVisible(true).setFrame(this.selectedSeedPacket.frame);
  }

  private plantSeeds(gridPosition: GridPosition): void {
    if (this.selectedSeedPacket === undefined) {
      return;
    }
    if (!this.farmTiles[gridPosition.x][gridPosition.y].isEmpty()) {
      return;
    }
    const plantType = this.selectedSeedPacket.getData(DATA_KEYS.SEED_TYPE) as PlantType;

    // make sure we have enough element energy to plant this seed
    if (!this.elementSystem.canPlantCrap(plantType, this.farmTiles[gridPosition.x][gridPosition.y])) {
      // TODO: add some type of UI indicator
      return;
    }

    this.lockInput = true;
    this.tweens.add({
      targets: this.toolCursor,
      angle: -80,
      duration: 140,
      repeat: 1,
      yoyo: true,
      onComplete: () => {
        this.seedPlanted(gridPosition.x, gridPosition.y, plantType);
        this.lockInput = false;
      },
    });
  }

  private harvestPlant(gridPosition: GridPosition): void {
    const farmTile = this.farmTiles[gridPosition.x][gridPosition.y];
    if (farmTile.isEmpty() || !farmTile.isReadyToHarvest()) {
      return;
    }
    const cropType = farmTile.harvestCrop() as PlantType;
    this.elementSystem.plantCrop(cropType);
    this.checkBalance();
    // TODO: add hook point to update stats/achievements
  }

  private createFarmTiles(): void {
    this.farmTiles = [];

    for (let i = 0; i < 6; i += 1) {
      this.farmTiles.push([]);
      for (let j = 1; j < 6; j += 1) {
        const gridPosition: GridPosition = {
          x: i,
          y: j - 1,
        };
        const x = TILE_SIZE * (5 + i) + 1;
        const y = TILE_SIZE * j + TILE_SIZE / 2 + 14;
        const balanceType = STARTING_TILES[gridPosition.y][gridPosition.x];
        let farmBalanceType: FarmTileBalanceType = FARM_TILE_BALANCE_TYPE.BALANCED;
        if (balanceType === 1) {
          farmBalanceType = FARM_TILE_BALANCE_TYPE.FIRE;
        } else if (balanceType === 2) {
          farmBalanceType = FARM_TILE_BALANCE_TYPE.WATER;
        }
        const farmTile = new FarmTile(this, x, y, gridPosition, farmBalanceType);
        farmTile
          .on(Phaser.Input.Events.POINTER_OVER, () => {
            if (this.selectedSeedPacket === undefined) {
              return;
            }
            this.selectedPlot.setVisible(true).setPosition(x, y);
          })
          .on(Phaser.Input.Events.POINTER_DOWN, () => {
            if (this.lockInput) {
              return;
            }
            if (this.selectedSeedPacket === undefined) {
              this.harvestPlant(gridPosition);
              return;
            }
            this.plantSeeds(gridPosition);
          });
        this.farmTiles[i].push(farmTile);
      }
    }
  }

  private createSeedPackets(): void {
    const seedPacket1 = this.add
      .image(TILE_SIZE * 5, this.scale.height - TILE_SIZE / 2, 'items', 5)
      .setScale(SCALE_FACTOR)
      .setData(DATA_KEYS.SEED_TYPE, PLANT_TYPE.PUMPKIN)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket1));
    const seedPacket2 = this.add
      .image(TILE_SIZE * 6, this.scale.height - TILE_SIZE / 2, 'items', 6)
      .setScale(SCALE_FACTOR)
      .setData(DATA_KEYS.SEED_TYPE, PLANT_TYPE.POTATO)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket2));
    const seedPacket3 = this.add
      .image(TILE_SIZE * 7, this.scale.height - TILE_SIZE / 2, 'items', 7)
      .setScale(SCALE_FACTOR)
      .setData(DATA_KEYS.SEED_TYPE, PLANT_TYPE.CARROT)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket3));
    const seedPacket4 = this.add
      .image(TILE_SIZE * 8, this.scale.height - TILE_SIZE / 2, 'items', 8)
      .setScale(SCALE_FACTOR)
      .setData(DATA_KEYS.SEED_TYPE, PLANT_TYPE.TOMATO)
      .setInteractive()
      .on(Phaser.Input.Events.POINTER_DOWN, () => this.handleToolSelected(seedPacket4));
  }

  private seedPlanted(x: number, y: number, plantType: PlantType): void {
    this.farmTiles[x][y].plantCrop(plantType);
    this.elementSystem.plantCrop(plantType);
    this.checkBalance();
    // TODO: add hook point to update stats/achievements
  }

  private checkBalance(): void {
    const values = Object.values(this.elementSystem.balance);
    const max = Math.max(...values);
    const min = Math.min(...values);

    if (max - min >= 3) {
      this.handleImbalance();
    } else {
      this.clearImbalanceEffects();
    }
    console.log(this.elementSystem.balance);
    // TODO: update UI for elements
    // TODO: update element effects
    this.pie.setBalance(this.elementSystem.balance);
  }

  private handleImbalance() {
    // You could slow growth, disable planting, spawn creatures, etc.
    console.log('⚠️ Elemental imbalance detected!');
  }

  private clearImbalanceEffects() {
    // Reset any penalties or effects
    console.log('✅ Balance restored.');
  }
}
