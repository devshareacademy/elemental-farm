import * as Phaser from 'phaser';
import { PLANT_TYPE_TO_SEED_MAP, PlantType, SCALE_FACTOR } from '../common';

export class Crop extends Phaser.GameObjects.Sprite {
  private plantType: PlantType;
  private stage: number;

  constructor(scene: Phaser.Scene, seedType: PlantType) {
    const frame = PLANT_TYPE_TO_SEED_MAP[seedType];
    super(scene, 0, 0, 'plants', frame);
    this.scene = scene;
    this.plantType = seedType;
    this.stage = 0;

    this.setScale(SCALE_FACTOR);

    this.scene.time.addEvent({
      delay: 500,
      repeat: 3,
      callback: () => {
        this.stage += 1;
        this.setFrame(frame + this.stage);
      },
      callbackScope: this,
    });
  }

  get cropType(): PlantType {
    return this.plantType;
  }

  public isReadyToHarvest(): boolean {
    return this.stage === 4;
  }
}
