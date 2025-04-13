import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { PLANT_TYPE, PlantType, ZonePosition } from '../common/types';
import { PlantPlot } from '../objects/plant-pot';
import { SCALE_FACTOR, TILE_SIZE } from '../common';

const DATA_KEYS = {
  GRID: 'GRID',
  SEED_TYPE: 'SEED_TYPE',
} as const;

export class GameScene extends Phaser.Scene {
  private selectedSeedPacket: undefined | Phaser.GameObjects.Image;
  private toolCursor!: Phaser.GameObjects.Image;
  private selectedPlot!: Phaser.GameObjects.Rectangle;
  private plantPlots!: PlantPlot[][];
  private lockInput!: boolean;

  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  public create(): void {
    this.lockInput = false;

    this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg', 0).setScale(SCALE_FACTOR);
    this.add.image(this.scale.width / 2, this.scale.height - 5, 'panel', 0).setScale(SCALE_FACTOR);

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

    this.selectedPlot = this.add
      .rectangle(TILE_SIZE * 5 + 1, TILE_SIZE + TILE_SIZE / 2 + 14, TILE_SIZE - 4, TILE_SIZE - 4, 0x9e5d3b, 0.8)
      .setVisible(false);

    this.createPlantPlots();

    this.toolCursor = this.add
      .image(0, 0, 'items', 5)
      .setScale(SCALE_FACTOR)
      .setVisible(false)
      .setAngle(-45)
      .setOrigin(0.05, 0.2);

    this.handleToolSelected(seedPacket1);
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

  private plantSeeds(zone: Phaser.GameObjects.Zone): void {
    if (this.selectedSeedPacket === undefined || this.lockInput) {
      return;
    }
    const zonePosition = zone.getData(DATA_KEYS.GRID) as ZonePosition;
    if (this.plantPlots[zonePosition.x][zonePosition.y].isPlanted) {
      return;
    }
    this.lockInput = true;
    const plantType = this.selectedSeedPacket.getData(DATA_KEYS.SEED_TYPE) as PlantType;
    this.tweens.add({
      targets: this.toolCursor,
      angle: -80,
      duration: 140,
      repeat: 1,
      yoyo: true,
      onComplete: () => {
        this.plantPlots[zonePosition.x][zonePosition.y].plantSeed(plantType);
        this.lockInput = false;
      },
    });
  }

  private createPlantPlots(): void {
    this.plantPlots = [];

    for (let i = 0; i < 6; i += 1) {
      this.plantPlots.push([]);
      for (let j = 1; j < 6; j += 1) {
        const zonePosition: ZonePosition = {
          x: i,
          y: j - 1,
        };
        const x = TILE_SIZE * (5 + i) + 1;
        const y = TILE_SIZE * j + TILE_SIZE / 2 + 14;
        const zone = this.add
          .zone(x, y, TILE_SIZE - 4, TILE_SIZE - 4)
          .setData(DATA_KEYS.GRID, zonePosition)
          .setInteractive()
          .on(Phaser.Input.Events.POINTER_OVER, () => {
            if (this.selectedSeedPacket === undefined) {
              return;
            }
            this.selectedPlot.setVisible(true).setPosition(zone.x, zone.y);
          })
          .on(Phaser.Input.Events.POINTER_DOWN, () => this.plantSeeds(zone));
        const plant = new PlantPlot(this, x, y);
        this.plantPlots[i].push(plant);
      }
    }
  }
}
